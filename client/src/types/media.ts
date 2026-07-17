export type MediaType = "ANIME" | "MANGA" | "LIGHT_NOVEL" | "TV_SHOW" | "MOVIE";

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  franchise: string;
  coverImage: string;
  status: string;
  currentProgress: number;
  totalProgress: number;
  progressType: "episode" | "chapter";
  volume?: number;
  lastUpdated: string;
  synopsis?: string;
  sourceMaterialProgress?: {
    title: string;
    current: number;
    total: number;
  };
  nextAiringEpisode?: {
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
  };
}

export interface SearchResult {
  id: string;
  type: MediaType;
  title: string;
  franchise: string;
  coverImage: string;
  synopsis: string;
  totalProgress: number;
  progressType: "episode" | "chapter";
  nextAiringEpisode?: {
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
  };
}

export interface AiringSchedule {
  timeLabel: string;
  details: string;
}

export interface CalendarEntry {
  id: string;
  title: string;
  schedule: AiringSchedule;
}

export interface ReleasesState {
  movies: any[];
  series: any[];
  anime: any[];
}
