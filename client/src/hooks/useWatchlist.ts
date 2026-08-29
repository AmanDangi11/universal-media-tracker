import { useState, useEffect, useCallback } from "react";
import { MediaItem, SearchResult } from "../types/media";
import * as watchlistService from "../services/watchlistService";
import { trackEvent } from "../lib/analytics";

export function useWatchlist(token: string | null, onLogout: () => void) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  const notify = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const fetchWatchlist = useCallback((showLoader = false) => {
    if (!token) {
      setIsLoadingWatchlist(false);
      return;
    }
    // Keep existing loading state during background updates; do not re-trigger loading screen
    if (!token) setIsLoadingWatchlist(false);
    
    watchlistService
      .getWatchlist(token)
      .then(async (data) => {
        if (Array.isArray(data)) {
          setMediaList(data);
          // Unblock loading indicator as soon as database items are rendered
          setIsLoadingWatchlist(false);

          // Fetch real-time airing schedules asynchronously in the background
          const ongoingAnimeOrManga = data.filter(
            (item) =>
              item.currentProgress < item.totalProgress &&
              (item.type === "ANIME" || item.type === "MANGA" || item.type === "LIGHT_NOVEL")
          );

          if (ongoingAnimeOrManga.length > 0) {
            const updatedItems = await Promise.all(
              data.map(async (item) => {
                if (item.currentProgress < item.totalProgress) {
                  if (item.type === "ANIME") {
                    try {
                      const query = `
                        query ($search: String) {
                          Media (search: $search, type: ANIME) {
                            nextAiringEpisode {
                              airingAt
                              timeUntilAiring
                              episode
                            }
                          }
                        }
                      `;
                      const res = await fetch("https://graphql.anilist.co", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          query,
                          variables: { search: item.title }
                        })
                      });
                      if (res.ok) {
                        const contentType = res.headers.get("content-type");
                        if (contentType && contentType.includes("application/json")) {
                          const json = await res.json();
                          const nextAiringEpisode = json?.data?.Media?.nextAiringEpisode;
                          if (nextAiringEpisode) {
                            return { ...item, nextAiringEpisode };
                          }
                        }
                      }
                    } catch (err) {
                      console.warn("Failed to fetch live airing info for anime:", item.title);
                    }
                  } else if (item.type === "MANGA" || item.type === "LIGHT_NOVEL") {
                    try {
                      const res = await fetch(
                        `${watchlistService.getReleases("weekly")}/api/manga/airing?title=${encodeURIComponent(item.title)}`
                      );
                      if (res.ok) {
                        const mangaData = await res.json();
                        const updatedTotal = Math.max(item.totalProgress, Math.floor(mangaData.latestChapter));
                        return {
                          ...item,
                          totalProgress: updatedTotal,
                          nextAiringEpisode: mangaData.nextAiringEpisode
                        };
                      }
                    } catch (err) {
                      console.warn("Failed to fetch live airing info for manga:", item.title);
                    }
                  }
                }
                return item;
              })
            );
            setMediaList(updatedItems);
          }
        } else {
          setIsLoadingWatchlist(false);
        }
      })
      .catch((err) => {
        if (err.message === "UNAUTHORIZED") {
          onLogout();
        } else {
          console.error("Failed to fetch watchlist:", err);
        }
        setIsLoadingWatchlist(false);
      });
  }, [token, onLogout]);

  useEffect(() => {
    fetchWatchlist(true);
    const handleFocus = () => fetchWatchlist(false);
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchWatchlist]);

  const handleIncrement = (id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setMediaList((prev) =>
      prev.map((item) => {
        if (item.id === id && item.currentProgress < item.totalProgress) {
          const nextProgress = item.currentProgress + 1;
          if (token) {
            watchlistService.updateProgress(token, id, "increment").catch((err) => {
              if (err.message === "UNAUTHORIZED") onLogout();
            });
          }
          trackEvent("increment_progress", "media", item.title, nextProgress);
          notify(`Updated ${item.title} to ${item.progressType} ${nextProgress}!`);
          return { ...item, currentProgress: nextProgress, lastUpdated: "Just now" };
        }
        return item;
      })
    );
  };

  const handleCatchUp = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setMediaList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (token) {
            watchlistService.updateProgress(token, id, "catchup").catch((err) => {
              if (err.message === "UNAUTHORIZED") onLogout();
            });
          }
          trackEvent("catchup_progress", "media", item.title, item.totalProgress);
          notify(`Caught up "${item.title}" completely to ${item.progressType} ${item.totalProgress}!`);
          return { ...item, currentProgress: item.totalProgress, lastUpdated: "Caught up just now" };
        }
        return item;
      })
    );
  };

  const handleSaveCustomProgress = (id: string, customVal: string, total: number, progressType: string) => {
    const val = parseInt(customVal, 10);
    if (isNaN(val) || val < 0 || val > total) {
      notify(`Invalid entry! Please enter a value between 0 and ${total}.`);
      return false;
    }
    setMediaList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (token) {
            watchlistService.updateProgress(token, id, "custom", val.toString()).catch((err) => {
              if (err.message === "UNAUTHORIZED") onLogout();
            });
          }
          trackEvent("custom_progress", "media", item.title, val);
          notify(`Set "${item.title}" to ${progressType} ${val}!`);
          return { ...item, currentProgress: val, lastUpdated: "Manually adjusted just now" };
        }
        return item;
      })
    );
    return true;
  };

  const handleReset = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setMediaList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (token) {
            watchlistService.updateProgress(token, id, "reset").catch((err) => {
              if (err.message === "UNAUTHORIZED") onLogout();
            });
          }
          trackEvent("reset_progress", "media", item.title, 0);
          return { ...item, currentProgress: 0, lastUpdated: "Just now" };
        }
        return item;
      })
    );
  };

  const handleDeleteMedia = async (id: string) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this media from your watchlist?")) return;
    try {
      await watchlistService.deleteMediaFromWatchlist(token, id);
      setMediaList((prev) => prev.filter((item) => item.id !== id));
      notify("Media removed from watchlist");
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") onLogout();
      else notify(err.message || "Failed to delete media");
    }
  };

  const handleAddMedia = (result: SearchResult) => {
    if (mediaList.some((item) => item.title.toLowerCase() === result.title.toLowerCase() && item.type === result.type)) {
      notify(`"${result.title}" is already in your tracking ledger!`);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newItem: MediaItem = {
      id: tempId,
      type: result.type,
      title: result.title,
      franchise: result.franchise,
      coverImage: result.coverImage,
      status: "Releasing",
      currentProgress: 0,
      totalProgress: result.totalProgress,
      progressType: result.progressType,
      lastUpdated: "Added just now",
      nextAiringEpisode: result.nextAiringEpisode
    };

    setMediaList((prev) => [newItem, ...prev]);
    notify(`Added "${result.title}" instantly to your ledger!`);

    if (token) {
      watchlistService.addMediaToWatchlist(token, newItem).then(() => fetchWatchlist()).catch((err) => {
        if (err.message === "UNAUTHORIZED") onLogout();
      });
    }
  };

  return {
    mediaList,
    setMediaList,
    isLoadingWatchlist,
    notificationMsg,
    showNotification,
    fetchWatchlist,
    handleIncrement,
    handleCatchUp,
    handleSaveCustomProgress,
    handleReset,
    handleDeleteMedia,
    handleAddMedia,
    notify
  };
}
