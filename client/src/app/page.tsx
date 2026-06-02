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
  Bookmark
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

// Pre-defined Search Database for third-party aggregations
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
  // Anime
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
  // Manga/Manhua
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
  // TV Shows/Movies
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

  // Airing Calendar states: Derived dynamically from active watchlist!
  const [airingCalendar, setAiringCalendar] = useState<{ id: string; title: string; schedule: AiringSchedule }[]>([]);

  // Set isMounted to true on client mount to bypass Next.js hydration issues
  useEffect(() => {
    setIsMounted(true);
    const savedToken = localStorage.getItem("umt_token");
    const savedUser = localStorage.getItem("umt_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const fetchWatchlist = () => {
    if (!token) return;
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
      })
      .catch((err) => console.error("Failed to fetch watchlist:", err));
  };

  useEffect(() => {
    fetchWatchlist();
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
              Page (page: 1, perPage: 5) {
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
  const handleIncrement = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
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

  // Adds a searched item from AniList / TMDB catalogs to the ledger
  const handleAddMedia = (result: SearchResult) => {
    if (mediaList.some((item) => item.title === result.title)) {
      setNotificationMsg(`"${result.title}" is already in your tracking ledger!`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    const newItem: MediaItem = {
      id: Date.now().toString(),
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
          franchise: result.franchise
        })
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to add to database");
          return res.json();
        })
        .then((data) => {
          newItem.id = data.progressId || newItem.id;
          setMediaList((prev) => [newItem, ...prev]);
        })
        .catch((err) => {
          console.error("Failed to add to DB:", err);
          setMediaList((prev) => [newItem, ...prev]);
        });
    } else {
      setMediaList((prev) => [newItem, ...prev]);
    }

    setIsModalOpen(false);
    setModalSearchQuery("");

    setNotificationMsg(`Successfully added "${result.title}" to tracker!`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3500);
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

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // IF USER IS NOT LOGGED IN, RENDER AUTHENTICATION VIEW
  if (!token) {
    return (
      <div className="min-h-screen text-slate-100 flex items-center justify-center p-4 relative font-sans selection:bg-indigo-500 selection:text-white overflow-hidden bg-slate-950">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-fuchsia-950/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
          {/* Top Brand Banner */}
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-2xl shadow-lg shadow-indigo-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                Universal Media Tracker
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Unified Franchise Progress Ledger</p>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-2">
              {isRegistering ? "Create Account" : "Access Ledger"}
            </h2>

            {authError && (
              <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl animate-shake">
                ⚠️ {authError}
              </div>
            )}

            {isRegistering && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Username</label>
                <input
                  type="text"
                  placeholder="e.g. yashv"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
              <input
                type="email"
                placeholder="e.g. name@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Password</label>
              <input
                type="password"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2 min-h-[44px] mt-6"
            >
              {authLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isRegistering ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Form Switcher */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError("");
              }}
              className="text-[11px] font-bold text-slate-400 hover:text-indigo-400 transition-all"
            >
              {isRegistering ? "Already have an account? Sign In" : "Need an account? Register here"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden pb-12">
      
      {/* Background Ambient Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-950/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Webhook Progress Notification Card */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-indigo-950/90 border border-indigo-500/30 text-indigo-200 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-md animate-bounce max-w-[90vw]">
          <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{notificationMsg}</span>
        </div>
      )}

      {/* DYNAMIC 'ADD MEDIA' DIALOG MODAL (Fully Mobile-Friendly) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 sm:p-4">
          <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base sm:text-lg font-bold text-slate-100">Add New Media (Live Sync)</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search Controls (Stacked on mobile, row on tablet/desktop) */}
            <div className="p-5 sm:p-6 bg-slate-950/50 border-b border-slate-800 flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Query Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search live online databases... (e.g. Solo Leveling, Attack on Titan)"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-sm rounded-xl pl-10 pr-4 py-3 sm:py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all"
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedMediaType}
                onChange={(e) => setSelectedMediaType(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-sm rounded-xl px-4 py-3 sm:py-2.5 text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
              >
                <option value="ALL">All Categories</option>
                <option value="ANIME">Anime (Live AniList)</option>
                <option value="MANGA">Manga & Novels (Live AniList)</option>
                <option value="TV_SHOW">TV Series (Live TMDB)</option>
                <option value="MOVIE">Movies (Live TMDB)</option>
              </select>
            </div>

            {/* Modal Search Results list (Highly scrollable and responsive) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[50vh] sm:max-h-[45vh]">
              {isLoadingSearch ? (
                <div className="text-center py-16 text-indigo-400 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-slate-400">Searching live online databases...</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <div 
                    key={result.id}
                    className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 p-4 bg-slate-950/40 border border-slate-850/80 rounded-2xl hover:border-indigo-500/25 transition-all group"
                  >
                    {/* Cover image & Title alignment */}
                    <div className="flex sm:flex-col gap-3 sm:gap-0 flex-shrink-0">
                      <div className="w-16 h-24 sm:w-16 sm:h-24 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={result.coverImage} alt={result.title} className="w-full h-full object-cover" />
                      </div>
                      
                      {/* Mobile title layout */}
                      <div className="sm:hidden flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="text-xs font-bold text-slate-200 line-clamp-2">{result.title}</h4>
                            <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 rounded-full flex-shrink-0">{result.type}</span>
                          </div>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{result.franchise}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Released: {result.totalProgress} {result.progressType}s</span>
                      </div>
                    </div>

                    {/* Details (Desktop & Mobile Content) */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="hidden sm:block">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-all line-clamp-1">{result.title}</h4>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 rounded-full">{result.type}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{result.franchise}</p>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 line-clamp-3 sm:line-clamp-2 leading-relaxed sm:mt-1">{result.synopsis}</p>
                      
                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-850/40">
                        <span className="hidden sm:inline text-[10px] text-slate-500 font-medium">Size: {result.totalProgress} {result.progressType}s</span>
                        <button
                          onClick={() => handleAddMedia(result)}
                          className="w-full sm:w-auto py-2.5 sm:py-1.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl sm:rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 min-h-[40px] sm:min-h-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add to Tracker
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
                  <Info className="w-8 h-8 text-slate-700" />
                  <p className="text-sm font-medium">Type a name above to search live databases.</p>
                  <p className="text-xs text-slate-600">Connects directly to global AniList and TMDB REST catalogs!</p>
                </div>
              )}
            </div>

            {/* Modal Footer Info */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex justify-between items-center text-[10px] text-slate-500 font-semibold px-6">
              <span>Third-party API Sync enabled: AniList & TMDB v3</span>
              <span className="hidden sm:flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> Fast-ingestion mode</span>
            </div>

          </div>
        </div>
      )}

      {/* MAIN TOP BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-lg border-b border-slate-900 px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-2.5 md:gap-4 md:px-6">
        
        {/* Brand Header */}
        <div className="flex justify-between items-center w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-lg shadow-md shadow-indigo-500/20 flex-shrink-0">
              <TrendingUp className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                Universal Media Tracker
              </h1>
              <p className="text-[9px] text-slate-400 font-medium">Unified Franchise Ledger</p>
            </div>
          </div>
          
          {/* Mobile Right Controls: Supabase Dot + Quick Add Button */}
          <div className="flex items-center gap-3.5 md:hidden">
            <div 
              className={`w-2 h-2 rounded-full ${dbConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} 
              title={dbConnected ? "Supabase Connected" : "Supabase Offline"} 
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg transition-all shadow-md active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Global Search & Dynamic Status */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          
          {/* Compact Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 text-xs rounded-xl pl-9 pr-3.5 py-1.5 sm:py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Database Connectivity Badge (Hidden on Mobile) */}
          <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold border transition-all ${
            dbConnected 
              ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" 
              : "bg-amber-950/40 border-amber-500/20 text-amber-400"
          }`}>
            <Database className="w-3.5 h-3.5" />
            <span>Supabase: {dbConnected ? "Connected" : "API Active"}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${dbConnected ? "bg-emerald-400 animate-pulse" : "bg-emerald-400"}`} />
          </div>

          {/* Desktop Logout Button */}
          {user && (
            <button
              onClick={handleLogout}
              className="hidden md:block text-[10px] uppercase font-bold tracking-wider text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/25 px-3 py-1.5 rounded-xl transition-all font-semibold active:scale-95"
            >
              Sign Out
            </button>
          )}

        </div>
      </header>

      {/* DYNAMIC WELCOME BANNER & ADD NEW BUTTON */}
      <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/40 to-slate-900/40 border border-slate-850/80 backdrop-blur-sm overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-lg md:text-2xl font-bold tracking-tight text-slate-100 flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" />
              Manage All Your Media in One Place
            </h2>
            <p className="text-[11px] md:text-sm text-slate-400 font-medium max-w-xl leading-relaxed">
              Solve fragmentation instantly. Use the fast add tool to lookup any anime, manga, or web series from universal APIs and track your progress with zero friction.
            </p>
          </div>

          {/* ADD MEDIA TRIGGER BUTTON */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-6 py-4 md:py-3.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 transform active:scale-95 duration-150 min-h-[44px]"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            Add New Media
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        
        {/* PROGRESS LIST LEDGER (Order-1: Positioned first on mobile screen viewports) */}
        <section className={`lg:col-span-3 flex flex-col gap-6 order-1 lg:order-2 ${
          mobileActiveTab === "LIST" ? "flex" : "hidden md:flex"
        }`}>
          
          {/* Dynamic Ledger Categories Controls */}
          <div className="flex items-center justify-between bg-slate-900/30 border border-slate-900 p-1 sm:p-1.5 rounded-xl gap-2">
            <div className="flex gap-1 overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-auto">
              {[
                { label: "All Media", value: "ALL" },
                { label: "Anime List", value: "ANIME" },
                { label: "Manga & Novels", value: "MANGA" },
                { label: "TV Series", value: "TV_SHOW" },
                { label: "Movies", value: "MOVIE" }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as any)}
                  className={`flex-1 sm:flex-none text-center px-3 py-2 rounded-lg text-[11px] font-bold tracking-wide transition-all min-w-[75px] sm:min-w-0 whitespace-nowrap ${
                    activeTab === tab.value
                      ? "bg-slate-900 text-white border border-slate-800 shadow-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick Stats Indicator */}
            <span className="hidden sm:inline text-xs text-indigo-400 font-bold bg-indigo-950/30 border border-indigo-500/10 px-3 py-1.5 rounded-full">
              {filteredMedia.length} Tracking Entries Active
            </span>
          </div>

          {/* DYNAMIC LIST LEDGER CONTAINER */}
          {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
              {filteredMedia.map((item) => {
                const percent = Math.round((item.currentProgress / item.totalProgress) * 100);
                const isCompleted = item.currentProgress === item.totalProgress;
                const isEditingThis = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="group relative bg-slate-900/30 hover:bg-slate-900/50 border border-slate-900 hover:border-indigo-500/20 rounded-3xl p-4 sm:p-5 flex gap-3.5 sm:gap-4 shadow-xl backdrop-blur-sm transition-all duration-300"
                  >
                    
                    {/* Media Thumbnail Container with Gradient Overlay */}
                    <div className="relative w-20 h-32 sm:w-24 sm:h-36 rounded-2xl overflow-hidden shadow-md flex-shrink-0 bg-slate-800">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                      
                      {/* Media Category Badge */}
                      <span className={`absolute top-2 left-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${
                        item.type === "ANIME"
                          ? "bg-indigo-950/80 border-indigo-500/30 text-indigo-300"
                          : item.type === "MANGA"
                          ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"
                          : "bg-fuchsia-950/80 border-fuchsia-500/30 text-fuchsia-300"
                      }`}>
                        {item.type}
                      </span>
                    </div>

                    {/* Media Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          {/* Franchise name */}
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-ellipsis overflow-hidden whitespace-nowrap max-w-[100px] sm:max-w-[130px]">
                            {item.franchise}
                          </p>
                          
                          {/* QUICK ACTION: Catch Up to Latest */}
                          {!isCompleted && (
                            <button
                              onClick={(e) => handleCatchUp(item.id, e)}
                              className="px-2 py-1 bg-slate-900/65 hover:bg-emerald-950/45 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/20 rounded-lg text-[9px] font-bold transition-all flex items-center gap-1 shadow-sm opacity-85 sm:opacity-60 hover:opacity-100"
                              title={`Instant Catch Up to ${item.progressType} ${item.totalProgress}`}
                            >
                              <Bookmark className="w-2.5 h-2.5 flex-shrink-0" />
                              Catch Up
                            </button>
                          )}
                        </div>
                        {/* Title */}
                        <h3 className="text-xs sm:text-sm font-bold text-slate-200 mt-1 line-clamp-1 group-hover:text-indigo-400 transition-colors" title={item.title}>
                          {item.title}
                        </h3>
                        {/* Update text */}
                        <p className="text-[9px] text-slate-500 font-medium mt-0.5">
                          Updated {item.lastUpdated}
                        </p>
                      </div>

                      {/* FRANCHISE CLUSTERING HIGHLIGHT (Anime-Manga Single Card Comparison) */}
                      {item.sourceMaterialProgress && (
                        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl text-[10px] space-y-1 my-1.5">
                          <div className="flex items-center justify-between text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              {item.sourceMaterialProgress.title}
                            </span>
                            <span className="text-slate-300 font-bold">
                              Ch. {item.sourceMaterialProgress.current}/{item.sourceMaterialProgress.total}
                            </span>
                          </div>
                          
                          {/* Sync Gap Meter */}
                          <div className="flex items-center justify-between text-[9px] text-indigo-400 font-bold">
                            <span>Adaptation Sync Gap</span>
                            <span>{item.sourceMaterialProgress.current - item.currentProgress * 20} chapters ahead</span>
                          </div>
                        </div>
                      )}

                      {/* Tracker Progress Bar & Micro Action Controllers */}
                      <div className="space-y-2 mt-auto">
                        <div className="flex justify-between items-center text-xs">
                          {/* Interactive Inline Input Progress triggers */}
                          {isEditingThis ? (
                            <div className="flex items-center gap-1.5 animate-in slide-in-from-left-2 duration-155">
                              <input
                                type="number"
                                min="0"
                                max={item.totalProgress}
                                placeholder={item.currentProgress.toString()}
                                value={customValue}
                                onChange={(e) => setCustomValue(e.target.value)}
                                className="w-14 sm:w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-center focus:outline-none focus:border-indigo-500 text-indigo-200"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveCustomProgress(item.id, item.totalProgress, item.progressType);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                              />
                              <button 
                                onClick={() => handleSaveCustomProgress(item.id, item.totalProgress, item.progressType)}
                                className="p-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => setEditingId(null)}
                                className="p-1 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] sm:text-xs text-slate-400 font-medium flex items-center gap-1.5">
                              Progress:{" "}
                              <strong className="text-slate-200">{item.currentProgress}</strong>{" "}
                              / {item.totalProgress}
                              
                              {/* Edit triggers button (always visible on mobile for tap discoverability) */}
                              <button
                                onClick={() => {
                                  setEditingId(item.id);
                                  setCustomValue(item.currentProgress.toString());
                                }}
                                className="p-1 text-slate-500 hover:text-indigo-400 rounded transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Enter custom chapter"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </span>
                          )}

                          <span className={`text-[10px] font-bold ${isCompleted ? "text-emerald-400" : "text-indigo-400"}`}>
                            {percent}%
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted 
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                                : "bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                            }`}
                          />
                        </div>

                        {/* Action Buttons (Minimum height 40px for mobile tap targets) */}
                        <div className="flex gap-2 pt-1">
                          <button
                            disabled={isCompleted}
                            onClick={(e) => handleIncrement(item.id, e)}
                            className={`flex-1 py-2 sm:py-1.5 rounded-xl sm:rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 min-h-[38px] sm:min-h-0 ${
                              isCompleted
                                ? "bg-emerald-950/20 border border-emerald-950 text-emerald-500/60 cursor-not-allowed"
                                : "bg-indigo-900/30 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/20 hover:border-indigo-500 shadow-md shadow-indigo-900/20"
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                Completed
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                Increment
                              </>
                            )}
                          </button>

                          <button
                            onClick={(e) => handleReset(item.id, e)}
                            title="Reset Progress"
                            className="p-2 sm:p-1.5 bg-slate-950/40 hover:bg-red-950/30 border border-slate-800 hover:border-red-500/30 text-slate-500 hover:text-red-400 rounded-xl sm:rounded-lg transition-all min-h-[38px] sm:min-h-0 flex items-center justify-center"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900/10 border border-slate-900 rounded-3xl p-8 sm:p-16 text-center backdrop-blur-sm flex flex-col items-center justify-center gap-4">
              <Search className="w-12 h-12 text-slate-700" />
              <div>
                <h3 className="text-base font-bold text-slate-300">No media entries found locally</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto px-4">
                  "{searchQuery}" is not in your current watchlist. Would you like to search live online databases instead?
                </p>
              </div>
              <button
                onClick={() => {
                  setModalSearchQuery(searchQuery);
                  setIsModalOpen(true);
                }}
                className="px-5 py-3 bg-indigo-500 hover:bg-indigo-605 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                Search "{searchQuery}" Online
              </button>
            </div>
          )}

        </section>

        {/* ========================================================================= */}
        {/* MOBILE-ONLY UX TAB SCREENS (Direct bottom-navigation views for consumer) */}
        {/* ========================================================================= */}

        {/* Mobile Tab: Upcoming Airing Calendar Timeline */}
        <div className={`md:hidden flex flex-col gap-5 w-full pb-20 ${mobileActiveTab === "CALENDAR" ? "block animate-in fade-in duration-200" : "hidden"}`}>
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                <Tv className="w-4 h-4 text-fuchsia-400" />
                Airing Calendar
              </h2>
              <p className="text-[9px] text-slate-500 mt-0.5 font-medium">Personalized countdown schedules</p>
            </div>
            <span className="text-[8px] bg-fuchsia-950/40 border border-fuchsia-500/20 text-fuchsia-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">JST / Local</span>
          </div>

          {airingCalendar.length > 0 ? (
            <div className="space-y-3.5">
              {airingCalendar.map((entry) => (
                <div key={entry.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex gap-4 items-start shadow-lg backdrop-blur-sm">
                  <div className="flex-shrink-0 w-11 h-16 bg-slate-800 rounded-lg overflow-hidden border border-slate-800">
                    <img src={mediaList.find(m => m.id === entry.id)?.coverImage} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-extrabold text-slate-200 line-clamp-1">{entry.title}</h4>
                      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-indigo-950 border border-indigo-500/20 text-indigo-400 rounded-lg flex-shrink-0">
                        {entry.schedule.timeLabel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 mt-2">
                      <Clock className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0" />
                      {entry.schedule.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center gap-2">
              <Clock className="w-7 h-7 text-slate-700" />
              <p className="text-xs font-bold text-slate-400 px-4">No releasing items tracked</p>
              <p className="text-[9px] text-slate-600 px-6 max-w-xs leading-normal">
                Add an ongoing Anime or Manga series from the Discover tab to sync schedules automatically!
              </p>
            </div>
          )}
        </div>

        {/* Mobile Tab: Discover & API Add Screen (Instant In-line UX) */}
        <div className={`md:hidden flex flex-col gap-5 w-full pb-20 ${mobileActiveTab === "DISCOVER" ? "block animate-in fade-in duration-200" : "hidden"}`}>
          <div className="border-b border-slate-900 pb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <Search className="w-4 h-4 text-indigo-400" />
              Discover Media
            </h2>
            <p className="text-[9px] text-slate-500 mt-0.5 font-medium">Lookup global AniList anime/manga & TMDB catalogs</p>
          </div>

          {/* Search Controls Card */}
          <div className="flex flex-col gap-3 p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search live online databases... (e.g. Solo Leveling)"
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl pl-9 pr-3.5 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
              />
            </div>

            <select
              value={selectedMediaType}
              onChange={(e) => setSelectedMediaType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2.5 text-slate-355 font-bold"
            >
              <option value="ALL">All Categories</option>
              <option value="ANIME">Anime (Live AniList)</option>
              <option value="MANGA">Manga & Novels (Live AniList)</option>
              <option value="TV_SHOW">TV Series (Live TMDB)</option>
              <option value="MOVIE">Movies (Live TMDB)</option>
            </select>
          </div>

          {/* Search Results Ledger */}
          <div className="space-y-3">
            {isLoadingSearch ? (
              <div className="text-center py-16 text-indigo-400 flex flex-col items-center justify-center gap-2.5">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-[9px] font-bold text-slate-400">Searching third-party APIs...</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div 
                  key={result.id}
                  className="flex gap-3.5 p-3 bg-slate-900/30 border border-slate-900 rounded-2xl items-center"
                >
                  <div className="w-12 h-18 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 border border-slate-800">
                    <img src={result.coverImage} alt={result.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-18 py-0.5">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-[10px] font-extrabold text-slate-200 line-clamp-1">{result.title}</h4>
                        <span className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 rounded-full flex-shrink-0">{result.type}</span>
                      </div>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 line-clamp-1">{result.franchise}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-auto pt-1 border-t border-slate-850/20">
                      <span className="text-[8px] text-slate-400 font-medium">{result.totalProgress} {result.progressType}s</span>
                      <button
                        onClick={() => handleAddMedia(result)}
                        className="py-1 px-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[9px] font-bold transition-all shadow-md active:scale-95 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Track
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
                <Search className="w-7 h-7 text-slate-700" />
                <p className="text-xs font-semibold text-slate-400">Search online database</p>
                <p className="text-[9px] text-slate-600 leading-normal px-8">
                  Lookup items directly from universal API providers to auto-populate summaries and airing schedules!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tab: Consumer-Focused App Sync & Settings */}
        <div className={`md:hidden flex flex-col gap-5 w-full pb-20 ${mobileActiveTab === "STATS" ? "block animate-in fade-in duration-200" : "hidden"}`}>
          <div className="border-b border-slate-900 pb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-fuchsia-400" />
              Settings & Clusters
            </h2>
            <p className="text-[9px] text-slate-500 mt-0.5 font-medium">Watchlist sync state and visual clustering stats</p>
          </div>

          {/* Sync Connection Status */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Supabase Cloud Storage</h4>
                <p className="text-[9px] text-slate-500 mt-0.5">{dbConnected ? "Synced: Active & Secure" : "Local Database Mode Active"}</p>
              </div>
            </div>
            <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
              dbConnected 
                ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20" 
                : "bg-amber-950 text-amber-400 border border-amber-500/20"
            }`}>
              {dbConnected ? "Online" : "API Setup"}
            </span>
          </div>

          {/* Grouped Franchise Statistics */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3.5">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Grouped Franchises
              </h3>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                Our schema connects separate seasons, movies, and novels into cohesive clusters, identifying gaps between releases.
              </p>
            </div>
            
            <div className="space-y-2 pt-1">
              <div className="bg-slate-950/60 px-3.5 py-2.5 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-350 font-medium">Demon Slayer Cluster</span>
                <span className="text-[9px] font-bold text-indigo-400">2 Ledger Cards</span>
              </div>
              <div className="bg-slate-950/60 px-3.5 py-2.5 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-350 font-medium">Jujutsu Kaisen Cluster</span>
                <span className="text-[9px] font-bold text-indigo-400">2 Ledger Cards</span>
              </div>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2.5">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Watchlist Guide
            </h3>
            <ul className="text-[10px] text-slate-400 space-y-2 list-disc pl-4 leading-relaxed font-medium">
              <li>Use the **Discover** tab to search and add media instantly without leaving the main dashboard page.</li>
              <li>Tap **Increment** on list cards to add progress with simple clicks.</li>
              <li>Toggle progress input fields by tapping the edit pencil icon at the side of progress counters.</li>
            </ul>
          </div>

          {/* Mobile Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-red-950/20 hover:bg-red-950/30 border border-red-500/20 hover:border-red-500/35 text-xs font-bold rounded-xl text-red-400 transition-all flex items-center justify-center gap-2 min-h-[44px] mt-4 active:scale-95 bg-slate-900/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Sign Out of Account
          </button>

        </div>

        {/* SIDE PANEL (Order-2: Pushed cleanly below the watchlist on mobile viewports) */}
        <aside className="hidden lg:flex lg:col-span-1 flex-col gap-6 order-2 lg:order-1">
          
          {/* Franchise Clustering Info Box */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-indigo-400 mb-3.5">
              <Layers className="w-5 h-5" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Grouped Franchises</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Our schema relationally links manga, anime seasons, and live-action spin-offs into a single cluster. Toggling cards reveals comparing statistics.
            </p>
            <div className="space-y-3">
              <div className="bg-slate-950/40 p-3 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Demon Slayer</span>
                <span className="px-2 py-0.5 bg-indigo-950 border border-indigo-500/20 text-indigo-400 rounded-full font-bold">2 Cards Linked</span>
              </div>
              <div className="bg-slate-950/40 p-3 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Jujutsu Kaisen</span>
                <span className="px-2 py-0.5 bg-indigo-950 border border-indigo-500/20 text-indigo-400 rounded-full font-bold">2 Cards Linked</span>
              </div>
            </div>
          </div>

          {/* Airing Schedule Calendar (Personalized Watchlist-Bound Calendar) */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-fuchsia-400">
                <Tv className="w-5 h-5" />
                <h2 className="text-sm font-semibold uppercase tracking-wider">Airing Calendar</h2>
              </div>
              <span className="text-[10px] bg-fuchsia-950/40 border border-fuchsia-500/20 text-fuchsia-400 px-2 py-0.5 rounded-full font-bold">UTC / JST</span>
            </div>
            
            {airingCalendar.length > 0 ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                {airingCalendar.map((entry) => (
                  <div key={entry.id} className="flex gap-3 border-l-2 border-indigo-500/40 pl-3">
                    <div className="text-[10px] font-extrabold text-indigo-400 min-w-[55px] uppercase tracking-wide">
                      {entry.schedule.timeLabel}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{entry.title}</h4>
                      <p className="text-[9px] text-slate-400 font-medium flex items-center gap-1 mt-0.5 leading-relaxed">
                        <Clock className="w-3 h-3 text-fuchsia-400 flex-shrink-0" /> {entry.schedule.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 border border-dashed border-slate-850 rounded-xl flex flex-col items-center gap-1.5">
                <Clock className="w-6 h-6 text-slate-700" />
                <p className="text-[10px] font-bold text-slate-400 leading-normal px-4">
                  No releasing media on your watchlist.
                </p>
                <p className="text-[9px] text-slate-600 px-4">
                  Add an ongoing Anime or Manga to sync schedules automatically!
                </p>
              </div>
            )}
          </div>

          {/* Webhook Preparation / Extension Connection Info hidden for clean UI */}

        </aside>

      </main>

      {/* FOOTER SYSTEM METADATA */}
      <footer className="border-t border-slate-900/80 bg-slate-950/60 mt-16 px-4 py-6 text-center text-xs text-slate-500 font-medium">
        <p>© 2026 Universal Media Tracker. All Rights Reserved. Production-ready Next.js App.</p>
      </footer>

      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl flex justify-around shadow-2xl items-center backdrop-blur-md">
        {[
          { id: "LIST", label: "My List", icon: BookOpen },
          { id: "CALENDAR", label: "Airing", icon: Tv },
          { id: "DISCOVER", label: "Discover", icon: Search },
          { id: "STATS", label: "Settings", icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = mobileActiveTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setMobileActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                isActive ? "text-indigo-400 font-bold" : "text-slate-500 hover:text-slate-350"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-[9px] mt-1 font-semibold tracking-wide">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-indigo-500 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
