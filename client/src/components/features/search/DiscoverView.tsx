import React, { useState, useEffect } from "react";
import { Search, Check, Plus } from "lucide-react";
import { SearchResult, MediaItem } from "../../../types/media";
import { searchOnlineMedia } from "../../../services/searchService";

interface DiscoverViewProps {
  mediaList: MediaItem[];
  onAddMedia: (result: SearchResult) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ mediaList, onAddMedia }) => {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"ALL" | "ANIME" | "MANGA" | "TV_SHOW" | "MOVIE">("ALL");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchOnlineMedia(query, selectedType);
        setSearchResults(results);
      } catch (err) {
        console.warn("Discover search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, selectedType]);

  return (
    <div className="flex flex-col gap-5 w-full max-w-4xl mx-auto pb-28 animate-in fade-in duration-200">
      <div className="border-b border-[#1f212a] pb-3">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
          <Search className="w-4 h-4 text-[#ff2e43]" />
          Discover Media
        </h2>
        <p className="text-[9px] text-slate-550 mt-0.5 font-medium">Sync directly with AniList and TMDB APIs</p>
      </div>

      <div className="flex flex-col gap-3 p-4 bg-[#0f1015] border border-[#1f212a] rounded-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
          <input
            type="text"
            placeholder="Search series or novels..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#050608] border border-[#1f212a] text-base md:text-xs rounded-xl pl-9 pr-3.5 py-3 text-[#f3f4f6] placeholder-slate-500 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="w-full bg-[#050608] border border-[#1f212a] text-base md:text-xs rounded-xl px-3 py-2.5 text-slate-355 font-bold"
        >
          <option value="ALL">All Categories</option>
          <option value="ANIME">Anime</option>
          <option value="MANGA">Manga</option>
          <option value="TV_SHOW">Series</option>
          <option value="MOVIE">Movies</option>
        </select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-16 text-[#ff2e43] flex flex-col items-center justify-center gap-2.5">
            <div className="w-6 h-6 border-4 border-[#ff2e43] border-t-transparent rounded-full animate-spin" />
            <p className="text-[9px] font-bold text-slate-400">Querying live APIs...</p>
          </div>
        ) : searchResults.length > 0 ? (
          searchResults.map((result) => {
            const alreadyAdded = mediaList.some(
              (item) => item.title.toLowerCase() === result.title.toLowerCase() && item.type === result.type
            );

            return (
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
                      <span className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#ff2e43]/15 border border-[#ff2e43]/20 text-[#ff2e43] rounded-full flex-shrink-0">
                        {result.type}
                      </span>
                    </div>
                    <p className="text-[8px] text-slate-555 font-bold uppercase tracking-wider mt-0.5 truncate">
                      {result.franchise}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-1 border-t border-[#1f212a]/30">
                    <span className="text-[8px] text-slate-400 font-medium">
                      {result.totalProgress} {result.progressType}s
                    </span>
                    {alreadyAdded ? (
                      <div className="py-1 px-3 bg-emerald-955/20 border border-emerald-500/30 text-emerald-450 rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-default">
                        <Check className="w-3 h-3 text-emerald-450" />
                        Added
                      </div>
                    ) : (
                      <button
                        onClick={() => onAddMedia(result)}
                        className="py-1 px-3 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-lg text-[9px] font-bold transition-all flex items-center gap-1 active:scale-95 shadow-md"
                      >
                        <Plus className="w-3 h-3" />
                        Track
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
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
  );
};
