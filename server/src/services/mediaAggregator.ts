import { prisma } from '../index';
import { aniListLimiter, tmdbLimiter } from './rateLimiter';
import axios from 'axios';

export interface UnifiedMediaData {
  titleRomaji?: string;
  titleEnglish: string;
  titleNative?: string;
  synopsis: string;
  coverImage: string;
  bannerImage?: string;
  status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED';
  startDate?: Date;
  endDate?: Date;
  totalEpisodes?: number;
  totalChapters?: number;
  totalVolumes?: number;
  runtime?: number;
}

export class MediaAggregator {
  private static CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // Cache for 24 Hours

  /**
   * Fetches Anime metadata from AniList GraphQL with DB Caching
   */
  static async getAnimeDetails(anilistId: number): Promise<UnifiedMediaData> {
    const cacheKey = `anilist:anime:${anilistId}`;

    // 1. Check local ApiCache
    const cached = await prisma.apiCache.findUnique({ where: { key: cacheKey } });
    if (cached && new Date() < new Date(cached.expiresAt)) {
      return cached.value as unknown as UnifiedMediaData;
    }

    // 2. Query external AniList GraphQL API using our Bottleneck Rate Limiter
    const query = `
      query ($id: Int) {
        Media (id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description
          coverImage {
            extraLarge
            large
          }
          bannerImage
          status
          episodes
          startDate { year month day }
          endDate { year month day }
        }
      }
    `;

    try {
      const response = await aniListLimiter.schedule(() =>
        axios.post('https://graphql.anilist.co', {
          query,
          variables: { id: anilistId }
        })
      );

      const media = response.data?.data?.Media;
      if (!media) throw new Error(`Anime not found on AniList for ID: ${anilistId}`);

      // 3. Map to Unified Media representation
      const mappedData: UnifiedMediaData = {
        titleRomaji: media.title.romaji || undefined,
        titleEnglish: media.title.english || media.title.romaji || 'Unknown Title',
        titleNative: media.title.native || undefined,
        synopsis: media.description ? media.description.replace(/<[^>]*>/g, '') : '', // strip HTML
        coverImage: media.coverImage.extraLarge || media.coverImage.large || '',
        bannerImage: media.bannerImage || undefined,
        status: this.mapAniListStatus(media.status),
        startDate: this.parsePartialDate(media.startDate),
        endDate: this.parsePartialDate(media.endDate),
        totalEpisodes: media.episodes || undefined
      };

      // 4. Cache the mapped value
      const expiresAt = new Date(Date.now() + this.CACHE_DURATION_MS);
      await prisma.apiCache.upsert({
        where: { key: cacheKey },
        update: { value: mappedData as any, expiresAt },
        create: { key: cacheKey, value: mappedData as any, expiresAt }
      });

      return mappedData;
    } catch (error) {
      console.error(`Error aggregating AniList Anime ID ${anilistId}:`, error);
      throw error;
    }
  }

  /**
   * Fetches Movie or Show metadata from TMDB REST API with DB Caching
   */
  static async getTMDBDetails(tmdbId: number, isTv: boolean): Promise<UnifiedMediaData> {
    const mediaType = isTv ? 'tv' : 'movie';
    const cacheKey = `tmdb:${mediaType}:${tmdbId}`;

    // 1. Check local ApiCache
    const cached = await prisma.apiCache.findUnique({ where: { key: cacheKey } });
    if (cached && new Date() < new Date(cached.expiresAt)) {
      return cached.value as unknown as UnifiedMediaData;
    }

    // 2. Query external TMDB REST API via Rate Limiter
    const apiKey = process.env.TMDB_API_KEY || '';
    const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${apiKey}&language=en-US`;

    try {
      const response = await tmdbLimiter.schedule(() => axios.get(url));
      const data = response.data;
      if (!data) throw new Error(`Media not found on TMDB for ID: ${tmdbId} (Type: ${mediaType})`);

      // 3. Map to Unified Media representation
      const mappedData: UnifiedMediaData = {
        titleEnglish: isTv ? data.name : data.title,
        titleNative: data.original_name || data.original_title || undefined,
        synopsis: data.overview || '',
        coverImage: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '',
        bannerImage: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : undefined,
        status: isTv ? this.mapTMDBTvStatus(data.status) : 'FINISHED', // Movies are generally finished once in DB
        startDate: data.release_date || data.first_air_date ? new Date(data.release_date || data.first_air_date) : undefined,
        endDate: data.last_air_date ? new Date(data.last_air_date) : undefined,
        totalEpisodes: isTv ? data.number_of_episodes || undefined : undefined,
        runtime: !isTv ? data.runtime || undefined : undefined
      };

      // 4. Cache the mapped value
      const expiresAt = new Date(Date.now() + this.CACHE_DURATION_MS);
      await prisma.apiCache.upsert({
        where: { key: cacheKey },
        update: { value: mappedData as any, expiresAt },
        create: { key: cacheKey, value: mappedData as any, expiresAt }
      });

      return mappedData;
    } catch (error) {
      console.error(`Error aggregating TMDB ${mediaType} ID ${tmdbId}:`, error);
      throw error;
    }
  }

  // --- MAPPING HELPERS ---

  private static mapAniListStatus(status: string): UnifiedMediaData['status'] {
    switch (status) {
      case 'FINISHED': return 'FINISHED';
      case 'RELEASING': return 'RELEASING';
      case 'NOT_YET_RELEASED': return 'NOT_YET_RELEASED';
      case 'CANCELLED': return 'CANCELLED';
      case 'HIATUS': return 'RELEASING'; // map hiatus to releasing (or add hiatus enum later)
      default: return 'NOT_YET_RELEASED';
    }
  }

  private static mapTMDBTvStatus(status: string): UnifiedMediaData['status'] {
    switch (status) {
      case 'Ended': return 'FINISHED';
      case 'Canceled': return 'CANCELLED';
      case 'Returning Series': return 'RELEASING';
      case 'In Production': return 'NOT_YET_RELEASED';
      case 'Planned': return 'NOT_YET_RELEASED';
      default: return 'RELEASING';
    }
  }

  private static parsePartialDate(dateObj: { year?: number; month?: number; day?: number } | null): Date | undefined {
    if (!dateObj || !dateObj.year) return undefined;
    return new Date(dateObj.year, (dateObj.month || 1) - 1, dateObj.day || 1);
  }
}
