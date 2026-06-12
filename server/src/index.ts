import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { MediaAggregator } from './services/mediaAggregator';
import { startBackgroundChecker } from './services/releaseChecker';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
export const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'umt_jwt_super_secret_key_2026_change_me';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Security and utility middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Customize this for production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-UMT-Key']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Support base64 images for visual bookmarks

// --- USER AUTHENTICATION ENDPOINTS ---

// Register Endpoint
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already registered' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Save new user in Supabase
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash
      }
    });

    // Sign session token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'User registration failed' });
  }
});

// Login Endpoint
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Sign session token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Current User Profile Endpoint
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Fetching user failed:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// --- USER WATCHLIST PERSISTING ENDPOINTS ---

// Check if a specific media item is in the user's watchlist by its title
app.get('/api/watchlist/check', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const title = req.query.title as string;
    if (!title) {
      return res.status(400).json({ error: 'Title query parameter is required' });
    }

    // Find progress record matching this user and whose media title (English or Romaji) contains the title
    const match = await prisma.userMediaProgress.findFirst({
      where: {
        userId: req.userId,
        media: {
          OR: [
            { titleEnglish: { contains: title, mode: 'insensitive' } },
            { titleRomaji: { contains: title, mode: 'insensitive' } }
          ]
        }
      },
      include: {
        media: true
      }
    });

    if (!match) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      progress: {
        id: match.id,
        currentProgress: match.currentProgress,
        status: match.status,
        media: {
          id: match.media.id,
          title: match.media.titleEnglish,
          type: match.media.type,
          totalProgress: match.media.totalEpisodes || match.media.totalChapters || 12
        }
      }
    });
  } catch (error) {
    console.error('Checking watchlist failed:', error);
    res.status(500).json({ error: 'Failed to check watchlist status' });
  }
});

// Fetch Watchlist items
app.get('/api/watchlist', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await prisma.userMediaProgress.findMany({
      where: { userId: req.userId },
      include: {
        media: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Map database records to the client UI MediaItem structure
    const mapped = list.map(item => {
      const media = item.media;
      const hoursAgo = Math.max(1, Math.round((Date.now() - new Date(item.updatedAt).getTime()) / 3600000));
      const lastUpdatedText = hoursAgo === 1 ? '1 hour ago' : hoursAgo < 24 ? `${hoursAgo} hours ago` : 'Yesterday';

      return {
        id: item.id,
        type: media.type,
        title: media.titleEnglish,
        franchise: media.titleRomaji || `${media.titleEnglish} Franchise`,
        coverImage: media.coverImage || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60',
        status: media.status === 'FINISHED' ? 'Finished' : 'Releasing',
        currentProgress: item.currentProgress,
        totalProgress: media.totalEpisodes || media.totalChapters || 12,
        progressType: media.type === 'ANIME' || media.type === 'TV_SHOW' ? 'episode' : 'chapter',
        lastUpdated: lastUpdatedText,
        synopsis: media.synopsis
      };
    });

    res.json(mapped);
  } catch (error) {
    console.error('Fetching watchlist failed:', error);
    res.status(500).json({ error: 'Failed to retrieve watchlist' });
  }
});

// Add Media item to Watchlist
app.post('/api/watchlist/add', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, type, coverImage, synopsis, totalProgress, progressType, franchise, externalId } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    // 1. Check if media already exists in global Media database or create it
    let media = await prisma.media.findFirst({
      where: { titleEnglish: title }
    });

    if (!media) {
      let resolvedTotalEpisodes = type === 'ANIME' || type === 'TV_SHOW' || type === 'MOVIE' ? totalProgress : null;
      let resolvedTotalChapters = type === 'MANGA' || type === 'LIGHT_NOVEL' ? totalProgress : null;

      // Dynamically fetch accurate total counts using externalId
      if (externalId) {
        try {
          if (externalId.startsWith('tmdb-') && (type === 'TV_SHOW' || type === 'ANIME')) {
            const tmdbId = parseInt(externalId.replace('tmdb-', ''), 10);
            if (!isNaN(tmdbId)) {
              const details = await MediaAggregator.getTMDBDetails(tmdbId, true);
              if (details.totalEpisodes) {
                resolvedTotalEpisodes = details.totalEpisodes;
              }
            }
          } else if (externalId.startsWith('tvmaze-season-') && (type === 'TV_SHOW' || type === 'ANIME')) {
            const seasonId = parseInt(externalId.replace('tvmaze-season-', ''), 10);
            if (!isNaN(seasonId)) {
              const tvmazeUrl = `https://api.tvmaze.com/seasons/${seasonId}/episodes`;
              const response = await axios.get(tvmazeUrl, { timeout: 5000 });
              if (Array.isArray(response.data)) {
                resolvedTotalEpisodes = response.data.length;
              }
            }
          } else if (externalId.startsWith('tvmaze-') && (type === 'TV_SHOW' || type === 'ANIME')) {
            const tvmazeId = parseInt(externalId.replace('tvmaze-', ''), 10);
            if (!isNaN(tvmazeId)) {
              const tvmazeUrl = `https://api.tvmaze.com/shows/${tvmazeId}/episodes`;
              const response = await axios.get(tvmazeUrl, { timeout: 5000 });
              if (Array.isArray(response.data)) {
                resolvedTotalEpisodes = response.data.length;
              }
            }
          } else if ((externalId.startsWith('imdb-tv-') || externalId.startsWith('imdb-')) && type === 'TV_SHOW') {
            const imdbId = externalId.replace('imdb-tv-', '').replace('imdb-', '');
            // Query TVmaze lookup by IMDb ID
            const lookupUrl = `https://api.tvmaze.com/lookup/shows?imdb=${imdbId}`;
            const lookupResponse = await axios.get(lookupUrl, { timeout: 5000 });
            const showId = lookupResponse.data?.id;
            if (showId) {
              const episodesUrl = `https://api.tvmaze.com/shows/${showId}/episodes`;
              const episodesResponse = await axios.get(episodesUrl, { timeout: 5000 });
              if (Array.isArray(episodesResponse.data)) {
                resolvedTotalEpisodes = episodesResponse.data.length;
              }
            }
          } else if ((type === 'MANGA' || type === 'LIGHT_NOVEL')) {
            // Attempt to scrape Arena Scans for actual chapter count
            const slug = title.toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-');
            const arenascanUrl = `https://arenascan.com/manga/${slug}/`;
            const response = await axios.get(arenascanUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0' },
              timeout: 4000
            });
            if (response.status === 200) {
              const regex = /<span class="chapternum">Chapter\s+(\d+(?:\.\d+)?)<\/span>/i;
              const match = response.data.match(regex);
              if (match) {
                resolvedTotalChapters = parseFloat(match[1]);
              }
            }
          }
        } catch (err) {
          console.error('[Add Media Sync] Failed to fetch external details:', err instanceof Error ? err.message : err);
        }
      }

      media = await prisma.media.create({
        data: {
          type: type as any,
          titleEnglish: title,
          titleRomaji: franchise || `${title} Franchise`,
          coverImage: coverImage,
          synopsis: synopsis,
          status: type === 'MOVIE' ? 'FINISHED' : 'RELEASING',
          totalEpisodes: resolvedTotalEpisodes,
          totalChapters: resolvedTotalChapters
        }
      });
    }

    // 2. Check if user is already tracking this media
    let progress = await prisma.userMediaProgress.findUnique({
      where: {
        userId_mediaId: {
          userId: req.userId!,
          mediaId: media.id
        }
      }
    });

    if (progress) {
      return res.status(400).json({ error: 'This media is already in your watchlist' });
    }

    // 3. Create progress record
    progress = await prisma.userMediaProgress.create({
      data: {
        userId: req.userId!,
        mediaId: media.id,
        status: 'PLANNING',
        currentProgress: 0
      }
    });

    res.status(201).json({
      message: 'Added to watchlist successfully',
      progressId: progress.id,
      totalProgress: media.totalEpisodes || media.totalChapters || 12
    });
  } catch (error) {
    console.error('Adding media failed:', error);
    res.status(500).json({ error: 'Failed to add media to watchlist' });
  }
});

// Update Progress (Increment, Catch Up, Custom, or Reset)
app.post('/api/watchlist/update', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { progressId, type, customValue } = req.body;

    if (!progressId || !type) {
      return res.status(400).json({ error: 'Progress ID and update type are required' });
    }

    const progress = await prisma.userMediaProgress.findUnique({
      where: { id: progressId },
      include: { media: true }
    });

    if (!progress || progress.userId !== req.userId) {
      return res.status(404).json({ error: 'Watchlist record not found' });
    }

    const media = progress.media;
    const isOngoingManga = (media.type === 'MANGA' || media.type === 'LIGHT_NOVEL') && media.status === 'RELEASING';
    const maxVal = isOngoingManga ? 99999 : (media.totalEpisodes || media.totalChapters || 12);
    let nextVal = progress.currentProgress;

    if (type === 'increment') {
      nextVal = Math.min(maxVal, progress.currentProgress + 1);
    } else if (type === 'catchup') {
      nextVal = maxVal === 99999 ? progress.currentProgress : maxVal; // Catch up has no effect if limit is unbounded
    } else if (type === 'reset') {
      nextVal = 0;
    } else if (type === 'custom') {
      const parsedVal = parseInt(customValue, 10);
      if (isNaN(parsedVal) || parsedVal < 0 || parsedVal > maxVal) {
        return res.status(400).json({ error: `Invalid custom progress value. Must be between 0 and ${maxVal}` });
      }
      nextVal = parsedVal;
    }

    // Update progress in database
    const updated = await prisma.userMediaProgress.update({
      where: { id: progressId },
      data: {
        currentProgress: nextVal,
        status: nextVal === maxVal ? 'COMPLETED' : 'CURRENT'
      }
    });

    // If it's an ongoing manga and their progress exceeds the saved total chapters, dynamically update the media record
    if (isOngoingManga && nextVal > (media.totalChapters || 0)) {
      await prisma.media.update({
        where: { id: media.id },
        data: { totalChapters: nextVal }
      });
      // Update our local media object for clean response mapping
      media.totalChapters = nextVal;
    }

    // Record analytics progress history in database
    await prisma.progressHistory.create({
      data: {
        progressId: progressId,
        progressValue: nextVal,
        note: `Progress modified via ${type} action`
      }
    });

    res.status(200).json({
      message: 'Progress updated successfully',
      currentProgress: nextVal,
      isCompleted: nextVal === maxVal
    });
  } catch (error) {
    console.error('Updating progress failed:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Delete Media item from Watchlist
app.delete('/api/watchlist/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Progress record ID is required and must be a string' });
    }

    // Find progress record and verify ownership
    const progress = await prisma.userMediaProgress.findUnique({
      where: { id }
    });

    if (!progress || progress.userId !== req.userId) {
      return res.status(404).json({ error: 'Watchlist record not found' });
    }

    // Delete progress record (cascade handles related history items)
    await prisma.userMediaProgress.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Media removed from watchlist successfully' });
  } catch (error) {
    console.error('Deleting media failed:', error);
    res.status(500).json({ error: 'Failed to delete media from watchlist' });
  }
});

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    // Basic test of database connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown database error'
    });
  }
});

// Real-time Third-Party Catalog Search Gateway
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string || '';
    const type = req.query.type as string || 'ALL';

    if (!q) {
      return res.json([]);
    }

    const isTv = type === 'TV_SHOW';
    const isMovie = type === 'MOVIE';
    const apiKey = process.env.TMDB_API_KEY || '';

    if ((isTv || isMovie) && apiKey && apiKey !== 'your_tmdb_api_key_here') {
      const mediaType = isTv ? 'tv' : 'movie';
      const url = `https://api.themoviedb.org/3/search/${mediaType}?api_key=${apiKey}&query=${encodeURIComponent(q)}&language=en-US`;
      
      const response = await axios.get(url);
      const results = response.data?.results || [];

      if (isTv) {
        const topShows = results.slice(0, 2);
        const remainingShows = results.slice(2, 6);
        const expandedResults: any[] = [];

        await Promise.all(topShows.map(async (item: any) => {
          // 1. Add main entry (All Seasons)
          expandedResults.push({
            id: `tmdb-${item.id}`,
            type: 'TV_SHOW' as const,
            title: `${item.name} (All Seasons)`,
            franchise: `${item.name} Franchise`,
            coverImage: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=60',
            synopsis: item.overview || 'No synopsis available.',
            totalProgress: 10,
            progressType: 'episode'
          });

          // 2. Fetch and add individual seasons
          try {
            const detailsUrl = `https://api.themoviedb.org/3/tv/${item.id}?api_key=${apiKey}&language=en-US`;
            const detailsRes = await axios.get(detailsUrl, { timeout: 3000 });
            const seasons = detailsRes.data?.seasons || [];

            seasons.forEach((season: any) => {
              if (season.season_number > 0 && season.episode_count > 0) {
                expandedResults.push({
                  id: `tmdb-season-${season.id}`,
                  type: 'TV_SHOW' as const,
                  title: `${item.name} - Season ${season.season_number}`,
                  franchise: `${item.name} Franchise`,
                  coverImage: season.poster_path ? `https://image.tmdb.org/t/p/w500${season.poster_path}` : (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=60'),
                  synopsis: season.overview || `Season ${season.season_number} of ${item.name}. Contains ${season.episode_count} episodes.`,
                  totalProgress: season.episode_count,
                  progressType: 'episode'
                });
              }
            });
          } catch (err) {
            console.error(`Failed to fetch TMDB TV show details for seasons:`, err);
          }
        }));

        const mappedRemaining = remainingShows.map((item: any) => ({
          id: `tmdb-${item.id}`,
          type: 'TV_SHOW' as const,
          title: item.name,
          franchise: `${item.name} Franchise`,
          coverImage: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=60',
          synopsis: item.overview || 'No synopsis available.',
          totalProgress: 10,
          progressType: 'episode'
        }));

        return res.json([...expandedResults, ...mappedRemaining]);
      } else {
        const mapped = results.slice(0, 10).map((item: any) => ({
          id: `tmdb-${item.id}`,
          type: 'MOVIE' as const,
          title: item.title,
          franchise: `${item.title} Franchise`,
          coverImage: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=60',
          synopsis: item.overview || 'No synopsis available.',
          totalProgress: 1,
          progressType: 'episode'
        }));
        return res.json(mapped);
      }
    }

    // 2. Otherwise, use 100% free, dynamic keyless APIs (TVmaze for TV shows/seasons, IMDb for movies)
    let dynamicResults: any[] = [];

    try {
      if (type === 'TV_SHOW') {
        const tvmazeSearchUrl = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`;
        const searchRes = await axios.get(tvmazeSearchUrl, { timeout: 5000 });
        const matches = searchRes.data || [];
        
        const topMatches = matches.slice(0, 4);
        const expanded: any[] = [];
        
        await Promise.all(topMatches.map(async (matchItem: any) => {
          const show = matchItem.show;
          if (!show) return;
          
          try {
            const seasonsUrl = `https://api.tvmaze.com/shows/${show.id}/seasons`;
            const seasonsRes = await axios.get(seasonsUrl, { timeout: 3000 });
            const seasons = seasonsRes.data || [];
            
            seasons.forEach((season: any) => {
              if (season.number && (season.episodeOrder || 1) > 0) {
                expanded.push({
                  id: `tvmaze-season-${season.id}`,
                  type: 'TV_SHOW' as const,
                  title: `${show.name} - Season ${season.number}`,
                  franchise: `${show.name} Franchise`,
                  coverImage: season.image?.medium || show.image?.medium || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=60',
                  synopsis: season.summary ? season.summary.replace(/<[^>]*>/g, '') : (show.summary ? show.summary.replace(/<[^>]*>/g, '') : `Season ${season.number} of ${show.name}.`),
                  totalProgress: season.episodeOrder || 10,
                  progressType: 'episode' as const,
                  externalId: `tvmaze-season-${season.id}`
                });
              }
            });
          } catch (err) {
            console.error(`Failed to fetch seasons for TVmaze show ${show.id}:`, err);
            expanded.push({
              id: `tvmaze-${show.id}`,
              type: 'TV_SHOW' as const,
              title: show.name,
              franchise: `${show.name} Franchise`,
              coverImage: show.image?.medium || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=60',
              synopsis: show.summary ? show.summary.replace(/<[^>]*>/g, '') : 'No synopsis available.',
              totalProgress: 12,
              progressType: 'episode' as const,
              externalId: `tvmaze-${show.id}`
            });
          }
        }));
        dynamicResults = expanded;
      } else if (type === 'MOVIE') {
        const imdbUrl = `https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(q)}`;
        const imdbResponse = await axios.get(imdbUrl, { timeout: 5000 });
        const items = imdbResponse.data?.description || [];
        dynamicResults = items.slice(0, 10).map((movie: any) => ({
          id: `imdb-movie-${movie['#IMDB_ID']}`,
          type: 'MOVIE' as const,
          title: movie['#TITLE'] || 'Unknown Movie',
          franchise: `${movie['#TITLE'] || 'Unknown'} Franchise`,
          coverImage: movie['#IMG_POSTER'] || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60',
          synopsis: `Year: ${movie['#YEAR'] || 'N/A'}. Starring: ${movie['#ACTORS'] || 'N/A'}. AKA: ${movie['#AKA'] || 'N/A'}.`,
          totalProgress: 1,
          progressType: 'episode' as const
        }));
      } else {
        // ALL
        let mappedShows: any[] = [];
        try {
          const tvmazeSearchUrl = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`;
          const searchRes = await axios.get(tvmazeSearchUrl, { timeout: 4000 });
          const matches = searchRes.data || [];
          
          await Promise.all(matches.slice(0, 2).map(async (matchItem: any) => {
            const show = matchItem.show;
            if (!show) return;
            try {
              const seasonsUrl = `https://api.tvmaze.com/shows/${show.id}/seasons`;
              const seasonsRes = await axios.get(seasonsUrl, { timeout: 2000 });
              const seasons = seasonsRes.data || [];
              seasons.forEach((season: any) => {
                mappedShows.push({
                  id: `tvmaze-season-${season.id}`,
                  type: 'TV_SHOW' as const,
                  title: `${show.name} - Season ${season.number} (Series)`,
                  franchise: `${show.name} Franchise`,
                  coverImage: season.image?.medium || show.image?.medium || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=60',
                  synopsis: season.summary ? season.summary.replace(/<[^>]*>/g, '') : (show.summary ? show.summary.replace(/<[^>]*>/g, '') : `Season ${season.number} of ${show.name}.`),
                  totalProgress: season.episodeOrder || 10,
                  progressType: 'episode' as const,
                  externalId: `tvmaze-season-${season.id}`
                });
              });
            } catch (err) {
              mappedShows.push({
                id: `tvmaze-${show.id}`,
                type: 'TV_SHOW' as const,
                title: `${show.name} (Series)`,
                franchise: `${show.name} Franchise`,
                coverImage: show.image?.medium || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=60',
                synopsis: show.summary ? show.summary.replace(/<[^>]*>/g, '') : 'No synopsis available.',
                totalProgress: 12,
                progressType: 'episode' as const,
                externalId: `tvmaze-${show.id}`
              });
            }
          }));
        } catch (err) {
          console.error("TVmaze search error in ALL:", err);
        }

        let mappedMovies: any[] = [];
        try {
          const imdbUrl = `https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(q)}`;
          const imdbResponse = await axios.get(imdbUrl, { timeout: 4000 });
          const items = imdbResponse.data?.description || [];
          mappedMovies = items.slice(0, 5).map((movie: any) => ({
            id: `imdb-movie-${movie['#IMDB_ID']}`,
            type: 'MOVIE' as const,
            title: `${movie['#TITLE']} (Movie)`,
            franchise: `${movie['#TITLE'] || 'Unknown'} Franchise`,
            coverImage: movie['#IMG_POSTER'] || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60',
            synopsis: `Year: ${movie['#YEAR'] || 'N/A'}. Starring: ${movie['#ACTORS'] || 'N/A'}. AKA: ${movie['#AKA'] || 'N/A'}.`,
            totalProgress: 1,
            progressType: 'episode' as const
          }));
        } catch (err) {
          console.error("IMDb search error in ALL:", err);
        }

        dynamicResults = [...mappedShows, ...mappedMovies];
      }
    } catch (err) {
      console.error("Search gateway lookup failed:", err);
    }

    return res.json(dynamicResults);
  } catch (error) {
    console.error('Error executing search API:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
});

// Real-time Manga Release & Chapter Tracker Gateway (using MangaDex)
// Real-time Manga Release & Chapter Tracker Gateway (using Arena Scans & MangaDex)
app.get('/api/manga/airing', async (req: Request, res: Response) => {
  try {
    const title = req.query.title as string || '';
    if (!title) {
      return res.status(400).json({ error: 'Manga title is required' });
    }

    // 1. Convert title to slug for scans scraping
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    let latestChapter = 150;
    let publishDate: Date | null = null;
    let parsedSuccessfully = false;

    // 2. Try scraping Arena Scans directly (has Eleceed chapter 400+)
    try {
      const arenascanUrl = `https://arenascan.com/manga/${slug}/`;
      const response = await axios.get(arenascanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 5000
      });

      if (response.status === 200) {
        const html = response.data;
        // Match both the chapter number and the date (e.g. Chapter 403 and May 27, 2026)
        const regex = /<span class="chapternum">Chapter\s+(\d+(?:\.\d+)?)<\/span>\s*<span class="chapterdate">([^<]+)<\/span>/i;
        const match = html.match(regex);
        if (match) {
          latestChapter = parseFloat(match[1]) || 150;
          const dateStr = match[2].trim();
          publishDate = new Date(dateStr);
          if (isNaN(publishDate.getTime())) {
            publishDate = null;
          }
          parsedSuccessfully = true;
        } else {
          // Fallback regex to just scan for chapter links
          const simpleRegex = /chapter-(\d+)/g;
          let m;
          let maxCh = 0;
          while ((m = simpleRegex.exec(html)) !== null) {
            const ch = parseInt(m[1], 10);
            if (ch > maxCh) {
              maxCh = ch;
            }
          }
          if (maxCh > 0) {
            latestChapter = maxCh;
            parsedSuccessfully = true;
          }
        }
      }
    } catch (err) {
      console.warn(`[Airing Scraper] Arena Scans scrape failed for slug ${slug}:`, err instanceof Error ? err.message : err);
    }

    // 3. Fallback to MangaDex if scans site failed or returned nothing
    if (!parsedSuccessfully) {
      try {
        const searchUrl = `https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=1`;
        const searchResponse = await axios.get(searchUrl, { timeout: 5000 });
        const mangaList = searchResponse.data?.data || [];

        if (mangaList.length > 0) {
          const mangaId = mangaList[0].id;
          const feedUrl = `https://api.mangadex.org/manga/${mangaId}/feed?limit=5&order%5Bchapter%5D=desc&translatedLanguage%5B%5D=en`;
          const feedResponse = await axios.get(feedUrl, { timeout: 5000 });
          const chapters = feedResponse.data?.data || [];

          if (chapters.length > 0) {
            const latestChapterObj = chapters.find((ch: any) => ch.attributes?.chapter !== null);
            if (latestChapterObj) {
              const chapterNumStr = latestChapterObj.attributes.chapter;
              latestChapter = parseFloat(chapterNumStr) || 150;
              const publishAtStr = latestChapterObj.attributes.publishAt || latestChapterObj.attributes.createdAt;
              if (publishAtStr) {
                publishDate = new Date(publishAtStr);
              }
              parsedSuccessfully = true;
            }
          }
        }
      } catch (mdErr) {
        console.error('[Airing Scraper] MangaDex fallback failed:', mdErr instanceof Error ? mdErr.message : mdErr);
      }
    }

    // 4. Calculate next estimated chapter release (7 days later)
    let nextAiringEpisode = null;
    const baseDate = publishDate || new Date(); // Fallback to current time if no publish date found
    const lastPublishTime = baseDate.getTime();
    
    // Estimate next weekly chapter (7 days later)
    const nextAiringTimeMs = lastPublishTime + 7 * 24 * 60 * 60 * 1000;
    const airingAt = Math.floor(nextAiringTimeMs / 1000);
    const timeUntilAiring = airingAt - Math.floor(Date.now() / 1000);
    const nextEpisodeNum = Math.floor(latestChapter) + 1;

    nextAiringEpisode = {
      airingAt,
      timeUntilAiring,
      episode: nextEpisodeNum
    };

    return res.json({
      latestChapter,
      nextAiringEpisode
    });
  } catch (error) {
    console.error('Error fetching dynamic manga details:', error instanceof Error ? error.message : error);
    return res.json({ latestChapter: 150, nextAiringEpisode: null });
  }
});

// Base API route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Universal Media Tracker API',
    version: '1.0.0',
    status: 'operational'
  });
});

// Global 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`🚀 Universal Media Tracker Server is running on port ${PORT}`);
  console.log(`👉 Health check available at http://localhost:${PORT}/health`);
  // Start background loops
  startBackgroundChecker();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Express server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received. Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Express server closed.');
    process.exit(0);
  });
});
