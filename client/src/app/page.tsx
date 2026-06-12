"use client";

import React, { useState, useEffect } from "react";
import {
  Film,
  BookOpen,
  TrendingUp,
  Tv,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Database,
  Layers,
  Zap,
  X,
  PlusCircle,
  HelpCircle,
  Info,
  Check,
  Edit2,
  Bookmark,
  Settings,
  Activity,
  LogOut,
  User,
  Trash2,
  Puzzle
} from "lucide-react";

// Types
interface MediaItem {
  id: string;
  type: "ANIME" | "MANGA" | "LIGHT_NOVEL" | "TV_SHOW" | "MOVIE";
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

interface SearchResult {
  id: string;
  type: "ANIME" | "MANGA" | "LIGHT_NOVEL" | "TV_SHOW" | "MOVIE";
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

const GLOBAL_CATALOG: SearchResult[] = [
  {
    id: "cat-1",
    type: "ANIME",
    title: "Solo Leveling Season 1",
    franchise: "Solo Leveling Franchise",
    coverImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60",
    synopsis: "In a world where hunters must battle deadly monsters, the weakest hunter Jinwoo Sung receives a mysterious system that allows him to level up without limits.",
    totalProgress: 12,
    progressType: "episode"
  },
  {
    id: "cat-2",
    type: "ANIME",
    title: "Chainsaw Man",
    franchise: "Chainsaw Man Franchise",
    coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60",
    synopsis: "Denji is a teenage devil hunter who merges with his pet devil Pochita, gaining the ability to transform parts of his body into chainsaws.",
    totalProgress: 12,
    progressType: "episode"
  },
  {
    id: "cat-3",
    type: "MANGA",
    title: "Solo Leveling Webtoon",
    franchise: "Solo Leveling Franchise",
    coverImage: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=500&auto=format&fit=crop&q=60",
    synopsis: "The official webtoon adaptation of the hit web novel Solo Leveling, detailing Jinwoo Sung's ascension to the Shadow Monarch.",
    totalProgress: 179,
    progressType: "chapter"
  },
  {
    id: "cat-4",
    type: "MANGA",
    title: "One Piece Manga",
    franchise: "One Piece Franchise",
    coverImage: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60",
    synopsis: "Follow Monkey D. Luffy and his straw hat crew as they traverse the Grand Line in search of the legendary One Piece treasure.",
    totalProgress: 1110,
    progressType: "chapter"
  },
  {
    id: "cat-5",
    type: "TV_SHOW",
    title: "House of the Dragon Season 2",
    franchise: "Game of Thrones Franchise",
    coverImage: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=60",
    synopsis: "The war of succession between Rhaenyra and Aegon Targaryen begins to tear Westeros apart in this epic adaptation of Fire & Blood.",
    totalProgress: 8,
    progressType: "episode"
  },
  {
    id: "cat-6",
    type: "MOVIE",
    title: "Dune: Part Two",
    franchise: "Dune Franchise",
    coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60",
    synopsis: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    totalProgress: 1,
    progressType: "episode"
  }
];

const INITIAL_MEDIA_LIST: MediaItem[] = [
  {
    id: "1",
    type: "ANIME",
    title: "Demon Slayer: Hashira Training Arc",
    franchise: "Demon Slayer (Kimetsu no Yaiba)",
    coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60",
    status: "Releasing",
    currentProgress: 4,
    totalProgress: 8,
    progressType: "episode",
    lastUpdated: "2 hours ago",
    sourceMaterialProgress: {
      title: "Demon Slayer Manga",
      current: 140,
      total: 205
    }
  },
  {
    id: "2",
    type: "MANGA",
    title: "Jujutsu Kaisen",
    franchise: "Jujutsu Kaisen Franchise",
    coverImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60",
    status: "Releasing",
    currentProgress: 261,
    totalProgress: 271,
    progressType: "chapter",
    lastUpdated: "Yesterday",
    sourceMaterialProgress: {
      title: "Jujutsu Kaisen Anime",
      current: 47,
      total: 47
    }
  }
];

interface AiringSchedule {
  timeLabel: string;
  details: string;
}

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const savedUrl = localStorage.getItem("UMT_API_URL");
    if (savedUrl) {
      return savedUrl;
    }
    const isCapacitor = (window as any).Capacitor !== undefined;
    if (isCapacitor) {
      const cap = (window as any).Capacitor;
      if (cap.getPlatform() === "android") {
        return "http://10.0.2.2:5000";
      }
      return "http://localhost:5000";
    }
    if (window.location.hostname === "14df525de8d485.lhr.life" || window.location.hostname === "3369ccf4201b95.lhr.life") {
      return "https://ad35b38df0678b.lhr.life";
    }
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "ANIME" | "MANGA" | "TV_SHOW" | "MOVIE">("ALL");
  const [mobileActiveTab, setMobileActiveTab] = useState<"LIST" | "CALENDAR" | "DISCOVER" | "STATS">("LIST");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [dbConnected, setDbConnected] = useState(false);

  // Authentication states
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const [authError, setAuthError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  // Add Media Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [selectedMediaType, setSelectedMediaType] = useState<"ALL" | "ANIME" | "MANGA" | "TV_SHOW" | "MOVIE">("ALL");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // Inline custom progress editor states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState("");
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<MediaItem | null>(null);
  const [fetchedDescriptions, setFetchedDescriptions] = useState<Record<string, string>>({});
  const [loadingDescription, setLoadingDescription] = useState(false);

  // Airing Calendar states: Derived dynamically from active watchlist!
  const [airingCalendar, setAiringCalendar] = useState<{ id: string; title: string; schedule: AiringSchedule }[]>([]);

  // Settings & Custom API URL configuration
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState("");

  // Set isMounted to true on client mount to bypass Next.js hydration issues
  useEffect(() => {
    setIsMounted(true);
    const savedToken = localStorage.getItem("umt_token");
    const savedUser = localStorage.getItem("umt_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    // Initialize settings state
    setCustomApiUrl(localStorage.getItem("UMT_API_URL") || getApiBaseUrl());
  }, []);

  // Synchronize modal search category selection with the currently active filter tab
  useEffect(() => {
    setSelectedMediaType(activeTab);
  }, [activeTab]);

  // Dynamic description auto-fetcher for items with missing synopses
  useEffect(() => {
    if (!selectedDetailsItem) return;

    const detailsItem = mediaList.find(m => m.id === selectedDetailsItem.id) || selectedDetailsItem;

    // If we already have a synopsis, no need to fetch
    if (detailsItem.synopsis && detailsItem.synopsis !== "No synopsis available.") {
      return;
    }

    // If we already fetched it in this session, use it
    if (fetchedDescriptions[detailsItem.id]) {
      return;
    }

    const fetchDescription = async () => {
      setLoadingDescription(true);
      try {
        let description = "";

        if (detailsItem.type === "ANIME" || detailsItem.type === "MANGA" || detailsItem.type === "LIGHT_NOVEL") {
          const query = `
            query ($search: String, $type: MediaType) {
              Media (search: $search, type: $type) {
                description
              }
            }
          `;
          const res = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query,
              variables: {
                search: detailsItem.title,
                type: detailsItem.type === "ANIME" ? "ANIME" : "MANGA"
              }
            })
          });
          if (res.ok) {
            const json = await res.json();
            description = json?.data?.Media?.description || "";
          }
        } else if (detailsItem.type === "TV_SHOW") {
          const res = await fetch(`https://api.tvmaze.com/singlequery/shows?q=${encodeURIComponent(detailsItem.title)}`);
          if (res.ok) {
            const json = await res.json();
            description = json?.summary || "";
          }
        } else if (detailsItem.type === "MOVIE") {
          const res = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(detailsItem.title)}`);
          if (res.ok) {
            const json = await res.json();
            const movie = json?.description?.[0];
            if (movie) {
              description = `Year: ${movie['#YEAR']}. Starring: ${movie['#ACTORS'] || 'N/A'}. AKA: ${movie['#AKA'] || 'N/A'}.`;
            }
          }
        }

        // Strip HTML tags from description if any
        const cleanDesc = description ? description.replace(/<[^>]*>/g, "") : "No synopsis available.";

        setFetchedDescriptions(prev => ({
          ...prev,
          [detailsItem.id]: cleanDesc
        }));

        // Update local media list state so it is visible in the modal and grid
        setMediaList(prev => prev.map(m => {
          if (m.id === detailsItem.id) {
            return { ...m, synopsis: cleanDesc };
          }
          return m;
        }));
      } catch (err) {
        console.error("Failed to dynamically fetch media description:", err);
      } finally {
        setLoadingDescription(false);
      }
    };

    fetchDescription();
  }, [selectedDetailsItem, mediaList, fetchedDescriptions]);

  const handleSaveSettings = (url: string) => {
    const trimmed = url.trim();
    if (trimmed) {
      localStorage.setItem("UMT_API_URL", trimmed);
    } else {
      localStorage.removeItem("UMT_API_URL");
    }
    setIsSettingsOpen(false);
    window.location.reload();
  };

  const fetchWatchlist = () => {
    if (!token) {
      setIsLoadingWatchlist(false);
      return;
    }
    setIsLoadingWatchlist(true);
    fetch(`${getApiBaseUrl()}/api/watchlist`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          handleLogout();
          return [];
        }
        return res.json();
      })
      .then(async (data) => {
        if (Array.isArray(data)) {
          setMediaList(data);

          // Proactively fetch real-time airing schedules for ongoing anime/manga!
          const ongoingAnimeOrManga = data.filter(
            (item) => item.currentProgress < item.totalProgress && (item.type === "ANIME" || item.type === "MANGA" || item.type === "LIGHT_NOVEL")
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
                      const json = await res.json();
                      const nextAiringEpisode = json?.data?.Media?.nextAiringEpisode;
                      if (nextAiringEpisode) {
                        return { ...item, nextAiringEpisode };
                      }
                    } catch (err) {
                      console.error("Failed to fetch live airing info for anime:", item.title, err);
                    }
                  } else if (item.type === "MANGA" || item.type === "LIGHT_NOVEL") {
                    try {
                      const res = await fetch(`${getApiBaseUrl()}/api/manga/airing?title=${encodeURIComponent(item.title)}`);
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
                      console.error("Failed to fetch live airing info for manga:", item.title, err);
                    }
                  }
                }
                return item;
              })
            );
            setMediaList(updatedItems);
          }
        }
        setIsLoadingWatchlist(false);
      })
      .catch((err) => {
        console.error("Failed to fetch watchlist:", err);
        setIsLoadingWatchlist(false);
      });
  };

  useEffect(() => {
    fetchWatchlist();

    const handleFocus = () => {
      fetchWatchlist();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [token]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput || !emailInput || !passwordInput) {
      setAuthError("All fields are required");
      return;
    }
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Registration failed");
        return;
      }
      localStorage.setItem("umt_token", data.token);
      localStorage.setItem("umt_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setUsernameInput("");
      setEmailInput("");
      setPasswordInput("");
    } catch (err) {
      setAuthError("Failed to connect to the server");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError("Email and password are required");
      return;
    }
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Login failed");
        return;
      }
      localStorage.setItem("umt_token", data.token);
      localStorage.setItem("umt_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setEmailInput("");
      setPasswordInput("");
    } catch (err) {
      setAuthError("Failed to connect to the server");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("umt_token");
    localStorage.removeItem("umt_user");
    setToken(null);
    setUser(null);
    setMediaList([]);
  };

  // Calculate watch and read hours
  const calculateAnalytics = () => {
    let watchMinutes = 0;
    let readMinutes = 0;
    let completedCount = 0;

    mediaList.forEach((item) => {
      const progress = item.currentProgress || 0;
      if (progress === item.totalProgress) {
        completedCount++;
      }
      if (item.type === "ANIME") {
        watchMinutes += progress * 24;
      } else if (item.type === "TV_SHOW") {
        watchMinutes += progress * 45;
      } else if (item.type === "MOVIE") {
        watchMinutes += progress * 120;
      } else if (item.type === "MANGA" || item.type === "LIGHT_NOVEL") {
        readMinutes += progress * 10;
      }
    });

    const watchHours = parseFloat((watchMinutes / 60).toFixed(1));
    const readHours = parseFloat((readMinutes / 60).toFixed(1));

    return { watchHours, readHours, completedCount };
  };

  const { watchHours: totalWatchHours, readHours: totalReadHours, completedCount } = calculateAnalytics();

  // Fetch backend server health check on startup
  useEffect(() => {
    fetch(`${getApiBaseUrl()}/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.database === "connected") {
          setDbConnected(true);
        }
      })
      .catch(() => {
        setDbConnected(false);
      });
  }, []);

  // Compute dynamic Airing Calendar based on user added watchlist media (no static or fallback data)
  useEffect(() => {
    const calendarEntries: { id: string; title: string; schedule: AiringSchedule }[] = [];

    mediaList.forEach((item) => {
      // Show calendar only for ongoing/uncompleted items with a live upcoming airing episode
      if (item.currentProgress < item.totalProgress && item.nextAiringEpisode) {
        const date = new Date(item.nextAiringEpisode.airingAt * 1000);
        const timeLabel = date.toLocaleDateString([], { weekday: 'short' }) + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        const daysLeft = Math.ceil(item.nextAiringEpisode.timeUntilAiring / 3600 / 24);
        const noun = (item.type === "ANIME" || item.type === "TV_SHOW") ? "Episode" : "Chapter";
        const actionVerb = (item.type === "ANIME" || item.type === "TV_SHOW") ? "airs" : "releases";
        const actionGerund = (item.type === "ANIME" || item.type === "TV_SHOW") ? "airing" : "releasing";

        let details = `${noun} ${item.nextAiringEpisode.episode} ${actionVerb} in ${daysLeft} days`;
        if (daysLeft <= 0) {
          details = `${noun} ${item.nextAiringEpisode.episode} is ${actionGerund} now/soon!`;
        } else if (daysLeft === 1) {
          details = `${noun} ${item.nextAiringEpisode.episode} ${actionVerb} tomorrow!`;
        }

        calendarEntries.push({
          id: item.id,
          title: item.title,
          schedule: {
            timeLabel,
            details
          }
        });
      }
    });

    setAiringCalendar(calendarEntries);
  }, [mediaList]);

  // Update modal search results dynamically from online sources (AniList & Express backend)
  useEffect(() => {
    if (!modalSearchQuery) {
      setSearchResults([]);
      return;
    }

    setIsLoadingSearch(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        let finalResults: SearchResult[] = [];

        // 1. Fetch Anime & Manga from AniList API (Public GraphQL)
        if (selectedMediaType === "ALL" || selectedMediaType === "ANIME" || selectedMediaType === "MANGA") {
          const aniListType = selectedMediaType === "ALL"
            ? null
            : (selectedMediaType === "ANIME" ? "ANIME" : "MANGA");

          const graphQLQuery = `
            query ($search: String, $type: MediaType) {
              Page (page: 1, perPage: 6) {
                media (search: $search, type: $type) {
                  id
                  type
                  title {
                    romaji
                    english
                  }
                  description
                  coverImage {
                    large
                  }
                  chapters
                  episodes
                  nextAiringEpisode {
                    airingAt
                    timeUntilAiring
                    episode
                  }
                }
              }
            }
          `;

          const variables: any = { search: modalSearchQuery };
          if (aniListType) {
            variables.type = aniListType;
          }

          const response = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              query: graphQLQuery,
              variables,
            }),
          });

          const resData = await response.json();
          const aniListResults = resData?.data?.Page?.media || [];

          const mappedAniList = aniListResults.map((item: any) => ({
            id: `anilist-${item.id}`,
            type: item.type === "ANIME" ? "ANIME" : "MANGA",
            title: item.title.english || item.title.romaji || "Unknown Title",
            franchise: `${item.title.romaji || item.title.english} Franchise`,
            coverImage: item.coverImage.large || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60",
            synopsis: item.description ? item.description.replace(/<[^>]*>/g, "") : "No synopsis available.",
            totalProgress: item.type === "ANIME" ? (item.episodes || 12) : (item.chapters || 150),
            progressType: item.type === "ANIME" ? "episode" : "chapter",
            nextAiringEpisode: item.nextAiringEpisode,
          }));

          finalResults = [...finalResults, ...mappedAniList];
        }

        // 2. Fetch Live Action TV/Movies from our Express search backend (which connects to TMDB)
        if (selectedMediaType === "ALL" || selectedMediaType === "TV_SHOW" || selectedMediaType === "MOVIE") {
          const expressType = selectedMediaType === "ALL"
            ? "ALL"
            : selectedMediaType;

          const expressUrl = `${getApiBaseUrl()}/api/search?q=${encodeURIComponent(modalSearchQuery)}&type=${expressType}`;
          const response = await fetch(expressUrl);
          if (response.ok) {
            const expressData = await response.json();
            finalResults = [...finalResults, ...expressData];
          }
        }

        // Strict type filter to guarantee absolute isolation (e.g. no Manga returned when ANIME is selected)
        if (selectedMediaType !== "ALL") {
          finalResults = finalResults.filter(item => {
            if (selectedMediaType === "ANIME") return item.type === "ANIME";
            if (selectedMediaType === "MANGA") return item.type === "MANGA";
            if (selectedMediaType === "TV_SHOW") return item.type === "TV_SHOW";
            if (selectedMediaType === "MOVIE") return item.type === "MOVIE";
            return true;
          });
        }

        setSearchResults(finalResults);
      } catch (error) {
        console.error("Error searching online sources:", error);
      } finally {
        setIsLoadingSearch(false);
      }
    }, 500); // 500ms debounce to prevent hitting rate limits while typing

    return () => clearTimeout(delayDebounceFn);
  }, [modalSearchQuery, selectedMediaType]);

  // Simulates standard instant Webhook / API fast progress tracker increments
  const handleIncrement = (id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();

    setMediaList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.currentProgress < item.totalProgress) {
            const nextProgress = item.currentProgress + 1;

            if (token) {
              fetch(`${getApiBaseUrl()}/api/watchlist/update`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                  progressId: id,
                  type: "increment"
                })
              }).catch((err) => console.error("Failed to sync progress increment:", err));
            }

            setNotificationMsg(`Updated ${item.title} to ${item.progressType} ${nextProgress}!`);
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);

            return {
              ...item,
              currentProgress: nextProgress,
              lastUpdated: "Just now"
            };
          }
        }
        return item;
      })
    );
  };

  // Quick Action: Catch Up to Latest (One-click complete)
  const handleCatchUp = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();

    setMediaList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (token) {
            fetch(`${getApiBaseUrl()}/api/watchlist/update`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                progressId: id,
                type: "catchup"
              })
            }).catch((err) => console.error("Failed to sync progress catchup:", err));
          }

          setNotificationMsg(`Caught up "${item.title}" completely to ${item.progressType} ${item.totalProgress}!`);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);

          return {
            ...item,
            currentProgress: item.totalProgress,
            lastUpdated: "Caught up just now"
          };
        }
        return item;
      })
    );
  };

  // Custom progress input save
  const handleSaveCustomProgress = (id: string, total: number, progressType: string) => {
    const val = parseInt(customValue, 10);
    if (isNaN(val) || val < 0 || val > total) {
      setNotificationMsg(`Invalid entry! Please enter a value between 0 and ${total}.`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    setMediaList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (token) {
            fetch(`${getApiBaseUrl()}/api/watchlist/update`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                progressId: id,
                type: "custom",
                customValue: val.toString()
              })
            }).catch((err) => console.error("Failed to sync custom progress:", err));
          }

          setNotificationMsg(`Set "${item.title}" to ${progressType} ${val}!`);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);

          return {
            ...item,
            currentProgress: val,
            lastUpdated: "Manually adjusted just now"
          };
        }
        return item;
      })
    );

    setEditingId(null);
    setCustomValue("");
  };

  // Resets tracking values for demo interactivity
  const handleReset = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setMediaList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (token) {
            fetch(`${getApiBaseUrl()}/api/watchlist/update`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                progressId: id,
                type: "reset"
              })
            }).catch((err) => console.error("Failed to sync progress reset:", err));
          }

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
      const res = await fetch(`${getApiBaseUrl()}/api/watchlist/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setMediaList((prev) => prev.filter((item) => item.id !== id));
        setSelectedDetailsItem(null);
        setNotificationMsg("Media removed from watchlist");
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      } else {
        const err = await res.json();
        setNotificationMsg(err.error || "Failed to delete media");
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch (err) {
      console.error("Failed to delete media:", err);
      setNotificationMsg("Failed to delete media");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  // Adds a searched item from AniList / TMDB catalogs to the ledger
  const handleAddMedia = (result: SearchResult) => {
    if (mediaList.some((item) => item.title === result.title)) {
      setNotificationMsg(`"${result.title}" is already in your tracking ledger!`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
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

    // Add to state immediately
    setMediaList((prev) => [newItem, ...prev]);
    setNotificationMsg(`Added "${result.title}" instantly to your ledger!`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);

    if (token) {
      fetch(`${getApiBaseUrl()}/api/watchlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: result.title,
          type: result.type,
          coverImage: result.coverImage,
          synopsis: result.synopsis,
          totalProgress: result.totalProgress,
          progressType: result.progressType,
          franchise: result.franchise,
          externalId: result.id
        })
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to add to database");
          return res.json();
        })
        .then((data) => {
          // Replace tempId with actual DB progressId and resolved totalProgress
          if (data.progressId) {
            setMediaList((prev) =>
              prev.map((item) =>
                item.id === tempId
                  ? { ...item, id: data.progressId, totalProgress: data.totalProgress || item.totalProgress }
                  : item
              )
            );
          }
        })
        .catch((err) => {
          console.error("Failed to add to DB:", err);
          // Rollback: remove the temp item
          setMediaList((prev) => prev.filter((item) => item.id !== tempId));
          setNotificationMsg(`Error: Failed to save "${result.title}" to database.`);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        });
    }
  };

  const filteredMedia = mediaList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.franchise.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "ALL") return true;
    if (activeTab === "ANIME") return item.type === "ANIME";
    if (activeTab === "MANGA") return item.type === "MANGA" || item.type === "LIGHT_NOVEL";
    if (activeTab === "TV_SHOW") return item.type === "TV_SHOW";
    if (activeTab === "MOVIE") return item.type === "MOVIE";
    return true;
  });

  // Derived in-progress items for "Up Next" horizontal bar
  const inProgressMedia = mediaList.filter(
    (item) => item.currentProgress > 0 && item.currentProgress < item.totalProgress
  );

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#050608] text-[#f3f4f6] flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-[#ff2e43] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // IF USER IS NOT LOGGED IN, RENDER AUTHENTICATION VIEW (Trakt style cinematic dark login)
  if (!token) {
    return (
      <div className="min-h-screen text-[#f3f4f6] flex items-center justify-center p-4 relative font-sans selection:bg-[#ff2e43] selection:text-white overflow-hidden bg-[#050608]">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#ff2e43]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#0f1015]/80 border border-[#1f212a] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
          {/* Top Brand Banner */}
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <div className="p-3 bg-[#ff2e43] rounded-2xl shadow-lg shadow-[#ff2e43]/20 animate-pulse">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1">
                Binge<span className="text-[#ff2e43]">Log</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">Cinematic Entertainment Ledger</p>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#ff2e43] mb-2">
              {isRegistering ? "Create Account" : "Access Watchlist"}
            </h2>

            {authError && (
              <div className="p-3 bg-red-950/20 border border-[#ff2e43]/30 text-[#ff2e43] text-xs font-semibold rounded-xl">
                ⚠️ {authError}
              </div>
            )}

            {isRegistering && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-[#050608] border border-[#1f212a] text-base md:text-xs rounded-xl px-4 py-3.5 text-[#f3f4f6] placeholder-slate-600 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
                  autoComplete="username"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-[#050608] border border-[#1f212a] text-base md:text-xs rounded-xl px-4 py-3.5 text-[#f3f4f6] placeholder-slate-600 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#050608] border border-[#1f212a] text-base md:text-xs rounded-xl px-4 py-3.5 text-[#f3f4f6] placeholder-slate-600 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#ff2e43]/20 active:scale-95 flex items-center justify-center gap-2 min-h-[44px] mt-6"
            >
              {authLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isRegistering ? (
                "Create Free Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Form Switcher */}
          <div className="mt-6 pt-4 border-t border-[#1f212a] text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError("");
              }}
              className="text-[11px] font-bold text-slate-400 hover:text-[#ff2e43] transition-all"
            >
              {isRegistering ? "Already have an account? Sign In" : "Don't have an account yet? Register here"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] text-[#f3f4f6] font-sans selection:bg-[#ff2e43] selection:text-white overflow-x-hidden pb-12">

      {/* Floating Webhook Progress Notification Card */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#0f1015] border border-[#1f212a] text-slate-200 px-4 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200 max-w-[90vw]">
          <Zap className="w-4 h-4 text-[#ff2e43] fill-[#ff2e43] flex-shrink-0 animate-bounce" />
          <span className="text-xs font-semibold">{notificationMsg}</span>
        </div>
      )}
      {/* EXTENSION MANAGEMENT MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4">
          <div className="bg-[#0f1015] border-t sm:border border-[#1f212a] rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">

            {/* Header */}
            <div className="p-5 border-b border-[#1f212a] flex justify-between items-center bg-[#0f1015]/50">
              <div className="flex items-center gap-2">
                <Puzzle className="w-5 h-5 text-[#ff2e43]" />
                <h2 className="text-base font-bold text-slate-100">Extension Management</h2>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-400 hover:text-slate-100 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Chrome Extension Auto-Sync
                </label>
                <a
                  href="/extension.zip"
                  download
                  className="inline-flex items-center justify-center gap-2 w-full bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-200 hover:text-white border border-[#1f212a] hover:border-[#ff2e43]/20 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <span>📥 Download Extension (.zip)</span>
                </a>
              </div>

              <div className="border-t border-[#1f212a] pt-4">
                <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px] mb-2">Manual Installation Steps:</p>
                <div className="space-y-1.5 text-[10px] text-slate-350 leading-relaxed font-medium">
                  <p>1. Extract the downloaded <code className="text-slate-400 font-mono">extension.zip</code> file.</p>
                  <p>2. Open <code className="text-slate-400 font-mono">chrome://extensions/</code> in Google Chrome.</p>
                  <p>3. Toggle <strong className="text-slate-200 font-bold">Developer mode</strong> (top-right switch) to ON.</p>
                  <p>4. Click <strong className="text-slate-200 font-bold">Load unpacked</strong> (top-left) and select the extracted folder.</p>
                </div>
              </div>

              <div className="border-t border-[#1f212a] pt-4">
                <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px] mb-2">How to Use & Sync:</p>
                <ul className="space-y-2 text-[10px] text-slate-300 leading-relaxed font-medium list-disc list-inside">
                  <li>Ensure you are logged into this web application. The extension automatically syncs your session token from local storage.</li>
                  <li>When watching anime or media on supported sites (<strong className="text-slate-200">Crunchyroll, animepahe.pw, animesuge.cz, 9anime.org.lv</strong>), progress will track automatically.</li>
                  <li>If the series isn't in your watchlist, a toast will prompt you to add it instantly.</li>
                  <li>When you watch more than <strong className="text-[#ff2e43]">85%</strong> of an episode, progress increments automatically in the background.</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#1f212a] bg-[#050608]/50 flex justify-end px-6">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-5 py-2 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DYNAMIC 'ADD MEDIA' DIALOG MODAL (Fully Mobile-Friendly) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4">
          <div className="bg-[#0f1015] border-t sm:border border-[#1f212a] rounded-t-3xl sm:rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">

            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#1f212a] flex justify-between items-center bg-[#0f1015]/50">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#ff2e43]" />
                <h2 className="text-base sm:text-lg font-bold text-slate-100">Add New Media (Live Sync)</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-400 hover:text-slate-100 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search Controls */}
            <div className="p-5 sm:p-6 bg-[#050608]/50 border-b border-[#1f212a] flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Query Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
                <input
                  type="text"
                  placeholder="Search live online databases... (e.g. Solo Leveling, Game of Thrones)"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full bg-[#0f1015] border border-[#1f212a] text-base md:text-sm rounded-xl pl-10 pr-4 py-3 sm:py-2.5 text-[#f3f4f6] placeholder-slate-500 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedMediaType}
                onChange={(e) => setSelectedMediaType(e.target.value as any)}
                className="bg-[#0f1015] border border-[#1f212a] text-base md:text-sm rounded-xl px-4 py-3 sm:py-2.5 text-slate-300 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
              >
                <option value="ALL">All Categories</option>
                <option value="ANIME">Anime (Live AniList)</option>
                <option value="MANGA">Manga & Novels (Live AniList)</option>
                <option value="TV_SHOW">TV Series (Live TMDB)</option>
                <option value="MOVIE">Movies (Live TMDB)</option>
              </select>
            </div>

            {/* Modal Search Results list */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[50vh] sm:max-h-[45vh]">
              {isLoadingSearch ? (
                <div className="text-center py-16 text-[#ff2e43] flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-[#ff2e43] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-slate-400">Searching global entertainment index...</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex gap-4 p-4 bg-[#050608]/40 border border-[#1f212a] rounded-2xl hover:border-[#ff2e43]/25 transition-all group"
                  >
                    {/* Cover image */}
                    <div className="w-16 h-24 bg-[#1f212a] rounded-xl overflow-hidden flex-shrink-0">
                      <img src={result.coverImage} alt={result.title} className="w-full h-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-bold text-slate-200 group-hover:text-[#ff2e43] transition-colors truncate">{result.title}</h4>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#ff2e43]/10 border border-[#ff2e43]/25 text-[#ff2e43] rounded-full flex-shrink-0">{result.type}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 truncate">{result.franchise}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-1">{result.synopsis}</p>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#1f212a]">
                        <span className="text-[10px] text-slate-550 font-medium">Released: {result.totalProgress} {result.progressType}s</span>
                        {mediaList.some((item) => item.title.toLowerCase() === result.title.toLowerCase()) ? (
                          <div className="py-1.5 px-4 bg-emerald-955/20 border border-emerald-500/30 text-emerald-450 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-default">
                            <Check className="w-3.5 h-3.5 text-emerald-450" />
                            Added
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddMedia(result)}
                            className="py-1.5 px-4 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Track Media
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
                  <Info className="w-8 h-8 text-[#1f212a]" />
                  <p className="text-sm font-medium">Type a show, movie, or manga name above.</p>
                  <p className="text-xs text-slate-650">We query dynamic live databases to retrieve media data instantly.</p>
                </div>
              )}
            </div>

            {/* Modal Footer Info */}
            <div className="p-4 border-t border-[#1f212a] bg-[#050608]/50 flex justify-between items-center text-[10px] text-slate-500 font-semibold px-6">
              <span>Dynamic API Connected: AniList & TVmaze/YTS</span>
              <span className="hidden sm:flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> Real-time caching</span>
            </div>

          </div>
        </div>
      )}

      {/* MEDIA DETAILS MODAL */}
      {selectedDetailsItem && (() => {
        // Resolve item from active mediaList to display live progress updates!
        const detailsItem = mediaList.find(m => m.id === selectedDetailsItem.id) || selectedDetailsItem;
        const percent = Math.round((detailsItem.currentProgress / detailsItem.totalProgress) * 100);
        const isCompleted = detailsItem.currentProgress === detailsItem.totalProgress;

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4" onClick={() => setSelectedDetailsItem(null)}>
            <div className="bg-[#0f1015] border-t sm:border border-[#1f212a] rounded-t-3xl sm:rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="p-5 border-b border-[#1f212a] flex justify-between items-center bg-[#0f1015]/50">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-[#ff2e43]" />
                  <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Media Details</h2>
                </div>
                <button
                  onClick={() => setSelectedDetailsItem(null)}
                  className="p-2 bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-400 hover:text-slate-100 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Poster image */}
                  <div className="w-40 h-60 bg-slate-900 rounded-2xl overflow-hidden border border-[#1f212a] flex-shrink-0 mx-auto sm:mx-0 shadow-lg relative">
                    <img src={detailsItem.coverImage} alt={detailsItem.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 left-3 text-[9px] font-extrabold px-2.5 py-1 rounded bg-black/85 text-slate-200 border border-[#1f212a] uppercase tracking-widest">
                      {detailsItem.type}
                    </span>
                  </div>

                  {/* Title & Stats */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#ff2e43] uppercase tracking-widest block font-mono">
                        {detailsItem.franchise}
                      </span>
                      <h3 className="text-xl font-black text-slate-100 mt-1.5 leading-snug">
                        {detailsItem.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2.5 mt-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${isCompleted
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/25"
                            : "bg-[#ff2e43]/15 text-[#ff2e43] border border-[#ff2e43]/20"
                          }`}>
                          {isCompleted ? "Completed" : "Releasing / Tracking"}
                        </span>

                        <span className="text-[10px] text-slate-450 font-bold bg-[#1f212a] px-2.5 py-1 rounded-md uppercase tracking-wider">
                          Status: {detailsItem.status}
                        </span>

                        <span className="text-[10px] text-slate-450 font-bold bg-[#1f212a] px-2.5 py-1 rounded-md uppercase tracking-wider">
                          Size: {detailsItem.totalProgress} {detailsItem.progressType}s
                        </span>
                      </div>
                    </div>

                    {/* Airing Information */}
                    {detailsItem.nextAiringEpisode && !isCompleted && (
                      <div className="mt-4 p-3 bg-[#050608] border border-[#1f212a] rounded-xl flex items-center gap-2.5">
                        <Tv className="w-5 h-5 text-[#ff2e43] flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            Upcoming Episode {detailsItem.nextAiringEpisode.episode}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            Releases in {Math.ceil(detailsItem.nextAiringEpisode.timeUntilAiring / 3600 / 24)} days ({new Date(detailsItem.nextAiringEpisode.airingAt * 1000).toLocaleDateString()})
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Progress bar */}
                    <div className="space-y-2.5 mt-6 sm:mt-4">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-350">
                        <span>Progress: {detailsItem.currentProgress}/{detailsItem.totalProgress} {detailsItem.progressType}s</span>
                        <span className={isCompleted ? "text-emerald-400" : "text-[#ff2e43]"}>{percent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#050608] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-505" : "bg-[#ff2e43]"}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Synopsis / Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#ff2e43]">Synopsis / Description</h4>
                  <div className="bg-[#050608] border border-[#1f212a] p-4.5 rounded-2xl text-xs text-slate-300 leading-relaxed font-semibold max-h-48 overflow-y-auto">
                    {loadingDescription ? (
                      <div className="flex items-center justify-center py-4 gap-2 text-[#ff2e43]">
                        <div className="w-4.5 h-4.5 border-2 border-[#ff2e43] border-t-transparent rounded-full animate-spin" />
                        <span className="text-slate-450 font-semibold">Fetching description from database/online...</span>
                      </div>
                    ) : detailsItem.synopsis ? (
                      detailsItem.synopsis
                    ) : (
                      "No synopsis available for this media."
                    )}
                  </div>
                </div>

                {/* Micro Action Buttons inside Modal */}
                <div className="space-y-4 pt-2 border-t border-[#1f212a]/50">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#ff2e43]">Progress Controls</h4>

                  <div className="flex flex-wrap gap-3">
                    <button
                      disabled={isCompleted}
                      onClick={() => handleIncrement(detailsItem.id)}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${isCompleted
                          ? "bg-[#050608] border border-[#1f212a] text-slate-500 cursor-not-allowed"
                          : "bg-[#ff2e43] hover:bg-[#e02034] text-white shadow-lg shadow-[#ff2e43]/25 active:scale-95"
                        }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Log Next {detailsItem.progressType}
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => handleCatchUp(detailsItem.id, e)}
                      disabled={isCompleted}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${isCompleted
                          ? "bg-[#050608] border border-[#1f212a] text-slate-500 cursor-not-allowed"
                          : "bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-300 hover:text-white active:scale-95"
                        }`}
                    >
                      <Bookmark className="w-4 h-4" />
                      Catch Up to Latest
                    </button>

                    <button
                      onClick={(e) => {
                        handleReset(detailsItem.id, e);
                        setCustomValue("0");
                      }}
                      className="p-3 bg-[#0f1015] border border-[#1f212a] hover:border-red-950 text-slate-400 hover:text-[#ff2e43] rounded-xl transition-all min-h-[42px] flex items-center justify-center active:scale-95"
                      title="Reset tracking count to 0"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteMedia(detailsItem.id)}
                      className="p-3 bg-red-950/20 border border-red-900/30 hover:bg-[#ff2e43]/10 text-[#ff2e43] rounded-xl transition-all min-h-[42px] flex items-center justify-center active:scale-95"
                      title="Delete from Watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Manual entry field inside Modal */}
                  <div className="bg-[#050608] border border-[#1f212a] p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Set Specific Progress:</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <input
                        type="number"
                        min="0"
                        max={detailsItem.totalProgress}
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        className="w-20 bg-[#0f1015] border border-[#1f212a] rounded-xl px-3 py-2 text-center text-base md:text-sm font-bold text-[#ff2e43] focus:outline-none focus:border-[#ff2e43]"
                      />
                      <button
                        onClick={() => handleSaveCustomProgress(detailsItem.id, detailsItem.totalProgress, detailsItem.progressType)}
                        className="px-4 py-2 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-[#ff2e43]/10"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* MAIN TOP BAR (Trakt style header) */}
      <header className="sticky top-0 z-40 bg-[#050608]/90 backdrop-blur-md border-b border-[#1f212a] px-4 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4 md:px-8">

        {/* Brand Header */}
        <div className="flex justify-between items-center w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#ff2e43] rounded-lg flex items-center justify-center shadow-lg shadow-[#ff2e43]/20">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  Binge<span className="text-[#ff2e43]">Log</span>
                </h1>
                <p className="text-[9px] text-slate-550 font-bold uppercase tracking-wider">Unified Entertainment Ledger</p>
              </div>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl transition-all shadow-md active:scale-95 shadow-[#ff2e43]/25"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Search & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">

          {/* Compact Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f1015] border border-[#1f212a] text-base md:text-xs rounded-xl pl-9 pr-3.5 py-2 text-[#f3f4f6] placeholder-slate-500 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
            />
          </div>

          {/* Add Media Trigger Button (Desktop) */}
          {user && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 shadow-[#ff2e43]/15"
            >
              <Plus className="w-4 h-4" />
              Add Media
            </button>
          )}



          {/* Profile Card / Sign Out */}
          {user && (
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-[#1f212a]">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-350">{user.username}</span>
                <span className="text-[8px] text-slate-500 uppercase tracking-widest font-extrabold">Watcher</span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 bg-[#0f1015] border border-[#1f212a] text-slate-400 hover:text-slate-100 hover:border-slate-800 rounded-xl transition-all active:scale-95"
                title="Extension Management"
              >
                <Puzzle className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 bg-[#0f1015] border border-[#1f212a] text-slate-400 hover:text-[#ff2e43] hover:border-[#ff2e43]/30 rounded-xl transition-all active:scale-95"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ========================================================================= */}
        {/* 1. UP NEXT / CONTINUE WATCHING HERO ROW (Horizontal Carousel)            */}
        {/* ========================================================================= */}
        {inProgressMedia.length > 0 && mobileActiveTab === "LIST" && (
          <section className="col-span-full border-b border-[#1f212a] pb-6 sm:pb-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#ff2e43] fill-[#ff2e43]" />
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#f3f4f6]">Up Next To Watch</h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {inProgressMedia.map((item) => {
                const percent = Math.round((item.currentProgress / item.totalProgress) * 100);
                const nextTarget = item.currentProgress + 1;

                return (
                  <div
                    key={`upnext-${item.id}`}
                    onClick={() => {
                      setSelectedDetailsItem(item);
                      setCustomValue(item.currentProgress.toString());
                    }}
                    className="flex-shrink-0 w-80 bg-[#0f1015] border border-[#1f212a] rounded-2xl p-3 flex gap-3 relative hover:border-[#ff2e43]/30 transition-all duration-300 group shadow-md cursor-pointer"
                  >
                    {/* Media Poster mini */}
                    <div className="w-16 h-24 bg-slate-900 rounded-xl overflow-hidden flex-shrink-0 border border-[#1f212a]/50 relative">
                      <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-slate-300 border border-[#1f212a]">
                        {item.type}
                      </span>
                    </div>

                    {/* Progress details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <span className="text-[8px] font-bold text-[#ff2e43] uppercase tracking-wider truncate block">{item.franchise}</span>
                        <h3 className="text-xs font-bold text-slate-200 mt-0.5 truncate pr-6 group-hover:text-[#ff2e43] transition-colors">{item.title}</h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">
                          Up Next: <span className="text-slate-100 font-bold">Ep/Ch {nextTarget}</span>
                          <span className="text-slate-500 font-medium"> of {item.totalProgress}</span>
                        </p>
                      </div>

                      {/* Micro progress meter */}
                      <div className="space-y-1 mt-2">
                        <div className="h-1 w-full bg-[#050608] rounded-full overflow-hidden">
                          <div style={{ width: `${percent}%` }} className="h-full bg-gradient-to-r from-[#ff2e43] to-indigo-500 rounded-full" />
                        </div>
                        <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold uppercase">
                          <span>{percent}% Complete</span>
                          <span>{item.totalProgress - item.currentProgress} remaining</span>
                        </div>
                      </div>
                    </div>

                    {/* Fast watch circle trigger button */}
                    <button
                      onClick={() => handleIncrement(item.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#1f212a] border border-[#2b2e3b] text-slate-400 hover:text-white hover:bg-[#ff2e43] hover:border-[#ff2e43] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                      title={`Instant log ${item.progressType} ${nextTarget}`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 2. PROGRESS LIST LEDGER GRID (Order-1: Positioned first on mobile)        */}
        {/* ========================================================================= */}
        <section className={`lg:col-span-3 flex flex-col gap-6 order-1 lg:order-2 ${mobileActiveTab === "LIST" ? "flex" : "hidden md:flex"
          }`}>

          {/* Dynamic Ledger Categories Controls */}
          <div className="flex items-center justify-between bg-[#0f1015] border border-[#1f212a] p-1 sm:p-1.5 rounded-2xl gap-2 shadow-sm">
            <div className="flex gap-1 overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-auto">
              {[
                { label: "All", value: "ALL" },
                { label: "Anime", value: "ANIME" },
                { label: "Manga", value: "MANGA" },
                { label: "Series", value: "TV_SHOW" },
                { label: "Movies", value: "MOVIE" }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as any)}
                  className={`flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all min-w-[75px] sm:min-w-0 whitespace-nowrap ${activeTab === tab.value
                      ? "bg-[#ff2e43] text-white shadow-lg shadow-[#ff2e43]/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#1f212a]/50"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick Stats Indicator */}
            <span className="hidden sm:inline text-[10px] text-[#ff2e43] font-bold bg-[#ff2e43]/10 border border-[#ff2e43]/20 px-3.5 py-2 rounded-full uppercase tracking-wider">
              {filteredMedia.length} Active Ledger Entries
            </span>
          </div>

          {/* DYNAMIC LIST LEDGER CONTAINER (Trakt vertical cards poster grid) */}
          {isLoadingWatchlist ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#0f1015] border border-[#1f212a] rounded-2xl h-[340px] flex flex-col p-4.5 gap-3">
                  <div className="bg-[#1f212a]/50 rounded-xl flex-1 w-full" />
                  <div className="h-4 bg-[#1f212a]/50 rounded-md w-3/4" />
                  <div className="h-3 bg-[#1f212a]/50 rounded-md w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredMedia.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
              {filteredMedia.map((item) => {
                const percent = Math.round((item.currentProgress / item.totalProgress) * 100);
                const isCompleted = item.currentProgress === item.totalProgress;
                const isEditingThis = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedDetailsItem(item);
                      setCustomValue(item.currentProgress.toString());
                    }}
                    className={`group relative bg-[#0f1015] border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-md hover:translate-y-[-4px] cursor-pointer ${isCompleted
                        ? "border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/5"
                        : "border-[#1f212a] hover:border-[#ff2e43]/30 hover:shadow-[#ff2e43]/5"
                      }`}
                  >

                    {/* Media Thumbnail Poster Container (aspect 2/3) */}
                    <div className="relative aspect-[3/4] w-full bg-slate-900 overflow-hidden border-b border-[#1f212a] flex-shrink-0">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Gradient overlay for contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30 opacity-80" />

                      {/* Media Category Badge overlay */}
                      <span className={`absolute top-3 left-3 text-[8px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${item.type === "ANIME"
                          ? "bg-black/80 border-[#1f212a] text-[#ff2e43]"
                          : item.type === "MANGA"
                            ? "bg-black/80 border-[#1f212a] text-emerald-400"
                            : item.type === "TV_SHOW"
                              ? "bg-black/80 border-[#1f212a] text-indigo-400"
                              : "bg-black/80 border-[#1f212a] text-fuchsia-400"
                        }`}>
                        {item.type}
                      </span>

                      {/* Percent Pill Overlay */}
                      <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-md ${isCompleted
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                          : "bg-[#ff2e43]/15 text-[#ff2e43] border border-[#ff2e43]/20"
                        }`}>
                        {percent}%
                      </span>

                      {/* Airing Calendar indicator countdown on poster */}
                      {item.nextAiringEpisode && !isCompleted && (
                        <div className="absolute bottom-3 left-3 right-3 p-1.5 rounded-lg bg-black/85 border border-[#1f212a] text-[8px] font-bold text-slate-300 flex items-center gap-1">
                          <Tv className="w-2.5 h-2.5 text-[#ff2e43]" />
                          <span className="truncate">Ep {item.nextAiringEpisode.episode} in {Math.ceil(item.nextAiringEpisode.timeUntilAiring / 3600 / 24)} days</span>
                        </div>
                      )}

                      {/* Floating incremental Quick Log button on poster hover */}
                      {!isCompleted && (
                        <button
                          onClick={(e) => handleIncrement(item.id, e)}
                          disabled={item.id.startsWith("temp-")}
                          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#ff2e43] text-white flex items-center justify-center shadow-lg active:scale-90 hover:scale-105 hover:bg-[#e02034] transition-all duration-200 ${item.id.startsWith("temp-") ? "opacity-50 cursor-wait" : ""}`}
                          title={item.id.startsWith("temp-") ? "Saving..." : `Log +1 ${item.progressType}`}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Media Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Franchise name */}
                        <p className="text-[8px] text-slate-550 font-bold uppercase tracking-wider truncate">
                          {item.franchise}
                        </p>

                        {/* Title */}
                        <h3 className="text-xs sm:text-sm font-bold text-slate-205 mt-1.5 line-clamp-1 group-hover:text-[#ff2e43] transition-colors" title={item.title}>
                          {item.title}
                        </h3>

                        {/* Sync source details if present */}
                        {item.sourceMaterialProgress && (
                          <div className="mt-2 p-2 bg-[#050608] border border-[#1f212a] rounded-lg text-[9px] space-y-1">
                            <div className="flex items-center justify-between text-slate-400 font-semibold">
                              <span className="flex items-center gap-1 text-[8px] uppercase">
                                <BookOpen className="w-3 h-3 text-emerald-400" />
                                Manga Source
                              </span>
                              <span className="text-slate-300 font-bold">Ch. {item.sourceMaterialProgress.current}/{item.sourceMaterialProgress.total}</span>
                            </div>
                            <div className="flex items-center justify-between text-[8px] text-indigo-400 font-semibold">
                              <span>Ingested Sync Gap</span>
                              <span>{item.sourceMaterialProgress.current - item.currentProgress * 20} chs ahead</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tracker Progress Controls */}
                      <div className="space-y-3 mt-4 pt-3 border-t border-[#1f212a]/50">
                        <div className="flex justify-between items-center text-xs">
                          {/* Inline manual editor */}
                          {isEditingThis ? (
                            <div className="flex items-center gap-1 w-full justify-between" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max={item.totalProgress}
                                  placeholder={item.currentProgress.toString()}
                                  value={customValue}
                                  onChange={(e) => setCustomValue(e.target.value)}
                                  className="w-14 bg-[#050608] border border-[#1f212a] rounded px-1.5 py-0.5 text-base md:text-xs text-center focus:outline-none focus:border-[#ff2e43] text-[#ff2e43] font-bold"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveCustomProgress(item.id, item.totalProgress, item.progressType);
                                    if (e.key === "Escape") setEditingId(null);
                                  }}
                                />
                                <button
                                  onClick={() => handleSaveCustomProgress(item.id, item.totalProgress, item.progressType)}
                                  className="p-1 bg-[#ff2e43] text-white rounded hover:bg-[#e02034] transition-all"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1 bg-[#1f212a] text-slate-400 rounded hover:bg-[#2b2e3b] transition-all"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center">
                              <span>Logged: <strong className="text-slate-100 font-bold">{item.currentProgress}</strong>/{item.totalProgress}</span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(item.id);
                                  setCustomValue(item.currentProgress.toString());
                                }}
                                className="ml-1.5 p-1 text-slate-500 hover:text-[#ff2e43] rounded transition-colors"
                                title="Edit count manually"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          )}

                          <span className="text-[9px] text-slate-500 font-medium">Updated {item.lastUpdated}</span>
                        </div>

                        {/* Thin Progress bar */}
                        <div className="h-1 w-full bg-[#050608] rounded-full overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${isCompleted
                                ? "bg-emerald-500"
                                : "bg-[#ff2e43]"
                              }`}
                          />
                        </div>

                        {/* Action Buttons grid */}
                        <div className="flex gap-2">
                          <button
                            disabled={isCompleted || item.id.startsWith("temp-")}
                            onClick={(e) => handleCatchUp(item.id, e)}
                            className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-extrabold transition-all flex items-center justify-center gap-1 min-h-[30px] ${isCompleted || item.id.startsWith("temp-")
                                ? "bg-[#050608] border border-[#1f212a] text-slate-500 cursor-not-allowed"
                                : "bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-355 hover:text-white"
                              }`}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                                Watched
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3 h-3" />
                                Catch Up
                              </>
                            )}
                          </button>

                          <button
                            onClick={(e) => handleReset(item.id, e)}
                            disabled={item.id.startsWith("temp-")}
                            title="Reset tracking count to 0"
                            className={`p-1.5 bg-[#050608] border border-[#1f212a] hover:border-red-950 text-slate-500 hover:text-[#ff2e43] rounded-lg transition-all min-h-[30px] flex items-center justify-center ${item.id.startsWith("temp-") ? "opacity-50 cursor-wait" : ""}`}
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#0f1015] border border-[#1f212a] rounded-3xl p-8 sm:p-16 text-center flex flex-col items-center justify-center gap-4">
              <Search className="w-12 h-12 text-[#1f212a]" />
              <div>
                <h3 className="text-base font-bold text-slate-300">No media cards found matching search</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto px-4">
                  "{searchQuery}" was not found in your tracker. Would you like to search online API lists?
                </p>
              </div>
              <button
                onClick={() => {
                  setModalSearchQuery(searchQuery);
                  setIsModalOpen(true);
                }}
                className="px-5 py-3 bg-[#ff2e43] hover:bg-[#e02034] text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                Add Media
              </button>
            </div>
          )}

        </section>

        {/* ========================================================================= */}
        {/* MOBILE-ONLY UX SCREENS                                                    */}
        {/* ========================================================================= */}

        {/* Airing Calendar Timeline Screen */}
        <div className={`md:hidden flex flex-col gap-5 w-full pb-20 ${mobileActiveTab === "CALENDAR" ? "flex animate-in fade-in duration-200" : "hidden"}`}>
          <div className="flex items-center justify-between border-b border-[#1f212a] pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                <Tv className="w-4 h-4 text-[#ff2e43]" />
                Airing Calendar
              </h2>
              <p className="text-[9px] text-slate-550 mt-0.5 font-medium">Watchlist schedules synced dynamically</p>
            </div>
            <span className="text-[8px] bg-[#ff2e43]/10 border border-[#ff2e43]/20 text-[#ff2e43] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">Local / JST</span>
          </div>

          {airingCalendar.length > 0 ? (
            <div className="space-y-4">
              {airingCalendar.map((entry) => (
                <div key={entry.id} className="bg-[#0f1015] border border-[#1f212a] rounded-2xl p-4 flex gap-4 items-start shadow-md">
                  <div className="flex-shrink-0 w-12 h-18 bg-slate-900 rounded-lg overflow-hidden border border-[#1f212a]">
                    <img src={mediaList.find(m => m.id === entry.id)?.coverImage} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{entry.title}</h4>
                      <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 bg-[#ff2e43]/10 border border-[#ff2e43]/20 text-[#ff2e43] rounded-md flex-shrink-0">
                        {entry.schedule.timeLabel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 mt-3">
                      <Clock className="w-3.5 h-3.5 text-[#ff2e43] flex-shrink-0" />
                      {entry.schedule.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#0f1015]/40 border border-dashed border-[#1f212a] rounded-3xl flex flex-col items-center gap-2">
              <Clock className="w-8 h-8 text-slate-700 animate-pulse" />
              <p className="text-xs font-bold text-slate-400 px-4">No ongoing watchlist items</p>
              <p className="text-[9px] text-slate-600 px-6 max-w-xs leading-normal">
                Add an ongoing Anime or Manga series from the Discover catalog to populate live airing alerts.
              </p>
            </div>
          )}
        </div>

        {/* Discover API Add Screen (Instant search on mobile) */}
        <div className={`md:hidden flex flex-col gap-5 w-full pb-20 ${mobileActiveTab === "DISCOVER" ? "flex animate-in fade-in duration-200" : "hidden"}`}>
          <div className="border-b border-[#1f212a] pb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <Search className="w-4 h-4 text-[#ff2e43]" />
              Discover Media
            </h2>
            <p className="text-[9px] text-slate-550 mt-0.5 font-medium">Sync directly with AniList and TMDB APIs</p>
          </div>

          {/* Search Controls */}
          <div className="flex flex-col gap-3 p-4 bg-[#0f1015] border border-[#1f212a] rounded-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
              <input
                type="text"
                placeholder="Search series or novels..."
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                className="w-full bg-[#050608] border border-[#1f212a] text-base md:text-xs rounded-xl pl-9 pr-3.5 py-3 text-[#f3f4f6] placeholder-slate-500 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
              />
            </div>

            <select
              value={selectedMediaType}
              onChange={(e) => setSelectedMediaType(e.target.value as any)}
              className="w-full bg-[#050608] border border-[#1f212a] text-base md:text-xs rounded-xl px-3 py-2.5 text-slate-355 font-bold"
            >
              <option value="ALL">All Categories</option>
              <option value="ANIME">Anime</option>
              <option value="MANGA">Manga</option>
              <option value="TV_SHOW">Series</option>
              <option value="MOVIE">Movies</option>
            </select>
          </div>

          {/* Search Results Ledger */}
          <div className="space-y-3">
            {isLoadingSearch ? (
              <div className="text-center py-16 text-[#ff2e43] flex flex-col items-center justify-center gap-2.5">
                <div className="w-6 h-6 border-4 border-[#ff2e43] border-t-transparent rounded-full animate-spin" />
                <p className="text-[9px] font-bold text-slate-400">Querying live APIs...</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div
                  key={`mobile-search-${result.id}`}
                  className="flex gap-3.5 p-3.5 bg-[#0f1015] border border-[#1f212a] rounded-2xl items-center"
                >
                  <div className="w-12 h-18 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-[#1f212a]/50">
                    <img src={result.coverImage} alt={result.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between h-18 py-0.5">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-[10px] font-bold text-slate-200 line-clamp-1">{result.title}</h4>
                        <span className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#ff2e43]/15 border border-[#ff2e43]/20 text-[#ff2e43] rounded-full flex-shrink-0">{result.type}</span>
                      </div>
                      <p className="text-[8px] text-slate-550 font-bold uppercase tracking-wider mt-0.5 truncate">{result.franchise}</p>
                    </div>

                    <div className="flex justify-between items-center mt-auto pt-1 border-t border-[#1f212a]/30">
                      <span className="text-[8px] text-slate-400 font-medium">{result.totalProgress} {result.progressType}s</span>
                      {mediaList.some((item) => item.title.toLowerCase() === result.title.toLowerCase()) ? (
                        <div className="py-1 px-3 bg-emerald-955/20 border border-emerald-500/30 text-emerald-450 rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-default">
                          <Check className="w-3 h-3 text-emerald-450" />
                          Added
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddMedia(result)}
                          className="py-1 px-3 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-lg text-[9px] font-bold transition-all flex items-center gap-1 active:scale-95 shadow-md"
                        >
                          <Plus className="w-3 h-3" />
                          Track
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
                <Search className="w-7 h-7 text-slate-700 animate-pulse" />
                <p className="text-xs font-semibold text-slate-400">Search online catalogs</p>
                <p className="text-[9px] text-slate-600 leading-normal px-8">
                  Query databases dynamically. Simply type show, manga, or movie title above.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Settings, Analytics & Sync state */}
        <div className={`md:hidden flex flex-col gap-5 w-full pb-20 ${mobileActiveTab === "STATS" ? "flex animate-in fade-in duration-200" : "hidden"}`}>
          <div className="border-b border-[#1f212a] pb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-[#ff2e43]" />
              Ledger Metrics
            </h2>
            <p className="text-[9px] text-slate-550 mt-0.5 font-medium">Watchlist profiles, sync clusters and logs</p>
          </div>

          {/* User profile segment */}
          <div className="bg-[#0f1015] border border-[#1f212a] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1f212a] flex items-center justify-center text-slate-300">
                <User className="w-5 h-5 text-[#ff2e43]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-205">{user?.username}</h4>
                <p className="text-[9px] text-slate-550 font-bold uppercase tracking-wider mt-0.5">{user?.email}</p>
              </div>
            </div>
            <span className="text-[8px] bg-indigo-950 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold uppercase">Active Watcher</span>
          </div>

          {/* Watch & Read Analytics Card */}
          <div className="bg-[#0f1015] border border-[#1f212a] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-slate-350 mb-4.5">
              <TrendingUp className="w-4 h-4 text-[#ff2e43]" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">Dashboard Analytics</h4>
            </div>
            <div className="grid grid-cols-3 gap-2.5 mb-3">
              <div className="bg-[#050608] border border-[#1f212a] p-3 rounded-xl text-center">
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Watched</p>
                <p className="text-base font-black text-slate-200 mt-0.5">{totalWatchHours}h</p>
              </div>
              <div className="bg-[#050608] border border-[#1f212a] p-3 rounded-xl text-center">
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Read</p>
                <p className="text-base font-black text-slate-200 mt-0.5">{totalReadHours}h</p>
              </div>
              <div className="bg-[#050608] border border-[#1f212a] p-3 rounded-xl text-center">
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Completed</p>
                <p className="text-base font-black text-emerald-400 mt-0.5">{completedCount}</p>
              </div>
            </div>
            <div className="bg-[#050608] border border-[#1f212a] p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Total Tracking Invested</span>
              <span className="font-extrabold text-[#ff2e43]">{(totalWatchHours + totalReadHours).toFixed(1)} Hours</span>
            </div>
          </div>

          {/* Mobile Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full py-3.5 bg-[#0f1015] hover:bg-[#1f212a] border border-[#1f212a] text-xs font-extrabold rounded-xl text-slate-300 transition-all flex items-center justify-center gap-2 active:scale-95 mt-2"
          >
            <Puzzle className="w-4 h-4" />
            Extension Management
          </button>

          {/* Mobile Sign Out */}
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-red-950/20 hover:bg-[#ff2e43]/10 border border-[#ff2e43]/20 text-xs font-extrabold rounded-xl text-[#ff2e43] transition-all flex items-center justify-center gap-2 active:scale-95 mt-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of Account
          </button>

        </div>

        {/* ========================================================================= */}
        {/* 3. SIDE PANEL DESKTOP METRICS (Order-2: Sidebar)                         */}
        {/* ========================================================================= */}
        <aside className="hidden lg:flex lg:col-span-1 flex-col gap-6 order-2 lg:order-1">

          {/* Watch & Read Analytics Card */}
          <div className="bg-[#0f1015] border border-[#1f212a] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-300 mb-4">
              <TrendingUp className="w-4 h-4 text-[#ff2e43]" />
              <h2 className="text-xs font-bold uppercase tracking-wider">Ledger Analytics</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[#050608] border border-[#1f212a] p-3.5 rounded-xl text-center">
                <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Watch Time</p>
                <p className="text-lg font-black text-slate-205 mt-1">{totalWatchHours}h</p>
              </div>
              <div className="bg-[#050608] border border-[#1f212a] p-3.5 rounded-xl text-center">
                <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Read Time</p>
                <p className="text-lg font-black text-slate-205 mt-1">{totalReadHours}h</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="col-span-2 bg-[#050608] border border-[#1f212a] p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Completed Entries</span>
                <span className="font-extrabold text-emerald-400">{completedCount} titles</span>
              </div>
            </div>
            <div className="bg-[#050608] border border-[#1f212a] p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Total Tracking Invested</span>
              <span className="font-extrabold text-[#ff2e43]">{(totalWatchHours + totalReadHours).toFixed(1)} hrs</span>
            </div>
          </div>

          {/* Airing Schedule Calendar (Personalized Watchlist-Bound Calendar) */}
          <div className="bg-[#0f1015] border border-[#1f212a] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[#ff2e43]">
                <Tv className="w-5 h-5" />
                <h2 className="text-xs font-bold uppercase tracking-wider">Airing Calendar</h2>
              </div>
              <span className="text-[9px] bg-[#ff2e43]/10 border border-[#ff2e43]/20 text-[#ff2e43] px-2.5 py-0.5 rounded-full font-bold uppercase">JST / Local</span>
            </div>

            {airingCalendar.length > 0 ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                {airingCalendar.map((entry) => (
                  <div key={`desktop-calendar-${entry.id}`} className="flex gap-3 border-l-2 border-[#ff2e43]/40 pl-3">
                    <div className="text-[9px] font-black text-[#ff2e43] min-w-[55px] uppercase tracking-wide mt-0.5">
                      {entry.schedule.timeLabel}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{entry.title}</h4>
                      <p className="text-[9px] text-slate-450 font-semibold flex items-center gap-1 mt-1 leading-relaxed">
                        <Clock className="w-3.5 h-3.5 text-[#ff2e43] flex-shrink-0" /> {entry.schedule.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 border border-dashed border-[#1f212a] rounded-2xl flex flex-col items-center gap-2">
                <Clock className="w-6 h-6 text-[#1f212a] animate-pulse" />
                <p className="text-[10px] font-bold text-slate-450 leading-normal px-4">
                  No releasing media on watchlist
                </p>
                <p className="text-[9px] text-slate-600 px-4">
                  Add ongoing anime or TV shows from Discover to sync release countdowns.
                </p>
              </div>
            )}
          </div>



        </aside>

      </main>



      {/* Mobile Floating Bottom Bar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-[#0f1015]/90 border border-[#1f212a] p-2.5 rounded-2xl flex justify-around shadow-2xl items-center backdrop-blur-md">
        {[
          { id: "LIST", label: "My Ledger", icon: BookOpen },
          { id: "CALENDAR", label: "Airing", icon: Tv },
          { id: "DISCOVER", label: "Discover", icon: Search },
          { id: "STATS", label: "Analytics", icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = mobileActiveTab === tab.id;
          return (
            <button
              key={`bottom-nav-${tab.id}`}
              onClick={() => setMobileActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${isActive ? "text-[#ff2e43] font-bold" : "text-slate-500 hover:text-slate-300"
                }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 animate-in fade-in" />
              <span className="text-[9px] mt-1 font-bold tracking-wider uppercase">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-[#ff2e43] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
