import React, { useState, useEffect } from "react";
import { PlusCircle, X, Search, Clock, Check, Plus, Info } from "lucide-react";
import { SearchResult, MediaItem, MediaType } from "../../../types/media";
import { searchOnlineMedia } from "../../../services/searchService";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialCategory?: "ALL" | "ANIME" | "MANGA" | "TV_SHOW" | "MOVIE";
  mediaList: MediaItem[];
  onAddMedia: (result: SearchResult) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = "",
  initialCategory = "ALL",
  mediaList,
  onAddMedia
}) => {
  const [modalSearchQuery, setModalSearchQuery] = useState(initialQuery);
  const [selectedMediaType, setSelectedMediaType] = useState<"ALL" | "ANIME" | "MANGA" | "TV_SHOW" | "MOVIE">(initialCategory);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  useEffect(() => {
    setModalSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedMediaType(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (!isOpen) return;
    if (!modalSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoadingSearch(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await searchOnlineMedia(modalSearchQuery, selectedMediaType);
        setSearchResults(results);
      } catch (err) {
        console.warn("Search failed:", err);
      } finally {
        setIsLoadingSearch(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [modalSearchQuery, selectedMediaType, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-[#0f1015] border-t sm:border border-[#1f212a] rounded-t-3xl sm:rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#1f212a] flex justify-between items-center bg-[#0f1015]/50">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#ff2e43]" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">Add New Media</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-400 hover:text-slate-100 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Controls */}
        <div className="p-5 sm:p-6 bg-[#050608]/50 border-b border-[#1f212a] flex flex-col sm:flex-row gap-3 sm:gap-4">
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

        {/* Search Results list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[50vh] sm:max-h-[45vh]">
          {isLoadingSearch ? (
            <div className="text-center py-16 text-[#ff2e43] flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-[#ff2e43] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-400">Searching global entertainment index...</p>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((result) => {
              const alreadyAdded = mediaList.some(
                (item) => item.title.toLowerCase() === result.title.toLowerCase() && item.type === result.type
              );

              return (
                <div
                  key={result.id}
                  className="flex gap-4 p-4 bg-[#050608]/40 border border-[#1f212a] rounded-2xl hover:border-[#ff2e43]/25 transition-all group"
                >
                  <div className="w-16 h-24 bg-[#1f212a] rounded-xl overflow-hidden flex-shrink-0">
                    <img src={result.coverImage} alt={result.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-bold text-slate-200 group-hover:text-[#ff2e43] transition-colors truncate">
                          {result.title}
                        </h4>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#ff2e43]/10 border border-[#ff2e43]/25 text-[#ff2e43] rounded-full flex-shrink-0">
                          {result.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 truncate">
                        {result.franchise}
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-1">
                        {result.synopsis}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#1f212a]">
                      <span className="text-[10px] text-slate-550 font-medium">
                        Released: {result.totalProgress} {result.progressType}s
                      </span>
                      {alreadyAdded ? (
                        <div className="py-1.5 px-4 bg-emerald-955/20 border border-emerald-500/30 text-emerald-450 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-default">
                          <Check className="w-3.5 h-3.5 text-emerald-450" />
                          Added
                        </div>
                      ) : (
                        <button
                          onClick={() => onAddMedia(result)}
                          className="py-1.5 px-4 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Track Media
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
              <Info className="w-8 h-8 text-[#1f212a]" />
              <p className="text-sm font-medium">Type a show, movie, or manga name above.</p>
              <p className="text-xs text-slate-655">We query dynamic live databases to retrieve media data instantly.</p>
            </div>
          )}
        </div>

        {/* Modal Footer Info */}
        <div className="p-4 border-t border-[#1f212a] bg-[#050608]/50 flex justify-between items-center text-[10px] text-slate-500 font-semibold px-6">
          <span></span>
          <span className="hidden sm:flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </span>
        </div>
      </div>
    </div>
  );
};
