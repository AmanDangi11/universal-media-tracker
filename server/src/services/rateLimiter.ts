import Bottleneck from 'bottleneck';

// AniList has a limit of 90 requests per minute
export const aniListLimiter = new Bottleneck({
  reservoir: 90,
  reservoirRefreshInterval: 60 * 1000,
  reservoirRefreshAmount: 90,
  maxConcurrent: 5,
  minTime: 200 // 5 requests per second max
});

// Jikan (MAL) has a limit of 3 requests per second
export const jikanLimiter = new Bottleneck({
  minTime: 334,
  maxConcurrent: 1
});

// TMDB has a standard permissive limit but we keep it regulated
export const tmdbLimiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 50
});
