import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
        lastUpdated: lastUpdatedText
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
    const { title, type, coverImage, synopsis, totalProgress, progressType, franchise } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    // 1. Check if media already exists in global Media database or create it
    let media = await prisma.media.findFirst({
      where: { titleEnglish: title }
    });

    if (!media) {
      media = await prisma.media.create({
        data: {
          type: type as any,
          titleEnglish: title,
          titleRomaji: franchise || `${title} Franchise`,
          coverImage: coverImage,
          synopsis: synopsis,
          status: 'RELEASING',
          totalEpisodes: type === 'ANIME' || type === 'TV_SHOW' ? totalProgress : null,
          totalChapters: type === 'MANGA' || type === 'LIGHT_NOVEL' ? totalProgress : null
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
      progressId: progress.id
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
    const maxVal = media.totalEpisodes || media.totalChapters || 12;
    let nextVal = progress.currentProgress;

    if (type === 'increment') {
      nextVal = Math.min(maxVal, progress.currentProgress + 1);
    } else if (type === 'catchup') {
      nextVal = maxVal;
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

      const mapped = results.slice(0, 10).map((item: any) => ({
        id: `tmdb-${item.id}`,
        type: isTv ? 'TV_SHOW' : 'MOVIE',
        title: isTv ? item.name : item.title,
        franchise: `${isTv ? item.name : item.title} Franchise`,
        coverImage: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=60',
        synopsis: item.overview || 'No synopsis available.',
        totalProgress: isTv ? 10 : 1,
        progressType: 'episode'
      }));

      return res.json(mapped);
    }

    // 2. Otherwise, use 100% free, dynamic keyless APIs (TVmaze for TV shows, YTS for movies)
    let dynamicResults: any[] = [];

    // Search TVmaze API for TV Shows
    if (type === 'ALL' || type === 'TV_SHOW') {
      try {
        const tvmazeUrl = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`;
        const tvResponse = await axios.get(tvmazeUrl);
        const tvShows = tvResponse.data || [];
        
        const mappedTv = tvShows.slice(0, 8).map((item: any) => {
          const show = item.show || {};
          return {
            id: `tvmaze-${show.id}`,
            type: 'TV_SHOW' as const,
            title: show.name || 'Unknown Show',
            franchise: `${show.name || 'Unknown'} Franchise`,
            coverImage: show.image?.medium || show.image?.original || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=60',
            synopsis: show.summary ? show.summary.replace(/<[^>]*>/g, "") : 'No synopsis available.',
            totalProgress: 12, // standard seasonal progress default
            progressType: 'episode' as const
          };
        });
        
        dynamicResults = [...dynamicResults, ...mappedTv];
      } catch (err) {
        console.error("TVmaze API fetch failed:", err);
      }
    }

    // Search YTS API for Movies
    if (type === 'ALL' || type === 'MOVIE') {
      try {
        const ytsUrl = `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(q)}`;
        const movieResponse = await axios.get(ytsUrl);
        const movies = movieResponse.data?.data?.movies || [];
        
        const mappedMovies = movies.slice(0, 8).map((movie: any) => ({
          id: `yts-${movie.id}`,
          type: 'MOVIE' as const,
          title: movie.title || 'Unknown Movie',
          franchise: `${movie.title || 'Unknown'} Franchise`,
          coverImage: movie.medium_cover_image || movie.large_cover_image || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60',
          synopsis: movie.summary || movie.synopsis || 'No synopsis available.',
          totalProgress: 1,
          progressType: 'episode' as const
        }));
        
        dynamicResults = [...dynamicResults, ...mappedMovies];
      } catch (err) {
        console.error("YTS Movies API fetch failed:", err);
      }
    }

    // Strict type filter to guarantee absolute isolation
    if (type !== 'ALL') {
      dynamicResults = dynamicResults.filter(item => item.type === type);
    }

    return res.json(dynamicResults);
  } catch (error) {
    console.error('Error executing search API:', error);
    return res.status(500).json({ error: 'Search failed' });
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
