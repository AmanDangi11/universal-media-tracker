import { getApiBaseUrl } from "./apiClient";
import { MediaItem } from "../types/media";

export const getWatchlist = async (token: string): Promise<MediaItem[]> => {
  const res = await fetch(`${getApiBaseUrl()}/api/watchlist`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    throw new Error("Failed to fetch watchlist");
  }
  return res.json();
};

export const updateProgress = async (
  token: string,
  progressId: string,
  type: "increment" | "catchup" | "custom" | "reset",
  customValue?: string
) => {
  const res = await fetch(`${getApiBaseUrl()}/api/watchlist/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      progressId,
      type,
      ...(customValue ? { customValue } : {})
    })
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("UNAUTHORIZED");
  }
  return res;
};

export const addMediaToWatchlist = async (token: string, media: Partial<MediaItem>): Promise<MediaItem> => {
  const res = await fetch(`${getApiBaseUrl()}/api/watchlist/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(media)
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    throw new Error("Failed to add media to watchlist");
  }
  return res.json();
};

export const deleteMediaFromWatchlist = async (token: string, id: string) => {
  const res = await fetch(`${getApiBaseUrl()}/api/watchlist/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete media");
  }
  return res.json();
};

export const exportWatchlist = async (token: string): Promise<any> => {
  const res = await fetch(`${getApiBaseUrl()}/api/watchlist/export`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    throw new Error("Failed to export watchlist");
  }
  return res.json();
};

export const importWatchlistChunk = async (token: string, payload: any): Promise<any> => {
  const res = await fetch(`${getApiBaseUrl()}/api/watchlist/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    throw new Error("Failed to import watchlist chunk");
  }
  return res.json();
};

export const getReleases = async (timeframe: "weekly" | "monthly") => {
  const res = await fetch(`${getApiBaseUrl()}/api/releases?timeframe=${timeframe}`);
  if (!res.ok) {
    throw new Error("Failed to fetch releases");
  }
  return res.json();
};

export const getHealth = async () => {
  const res = await fetch(`${getApiBaseUrl()}/health`);
  return res.json();
};
