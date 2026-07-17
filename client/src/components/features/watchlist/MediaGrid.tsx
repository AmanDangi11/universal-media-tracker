import React from "react";
import { SlidersHorizontal, Layers, Search, Sparkles, Plus } from "lucide-react";
import { MediaItem } from "../../../types/media";
import { MediaCard } from "./MediaCard";

interface MediaGridProps {
  mediaList: MediaItem[];
  filteredMedia: MediaItem[];
  isLoadingWatchlist: boolean;
  activeTab: "ALL" | "ANIME" | "MANGA" | "TV_SHOW" | "MOVIE";
  setActiveTab: (tab: "ALL" | "ANIME" | "MANGA" | "TV_SHOW" | "MOVIE") => void;
  statusFilter: "ALL" | "ONGOING" | "COMPLETED";
  setStatusFilter: (status: "ALL" | "ONGOING" | "COMPLETED") => void;
  searchQuery: string;
  onOpenFilterDrawer: () => void;
  onOpenAddModal: () => void;
  onOpenSearchModalWithQuery: (query: string) => void;
  editingId: string | null;
  customValue: string;
  setCustomValue: (val: string) => void;
  setEditingId: (id: string | null) => void;
  onSelectDetails: (item: MediaItem) => void;
  onIncrement: (id: string, e?: React.MouseEvent) => void;
  onCatchUp: (id: string, e: React.MouseEvent) => void;
  onReset: (id: string, e: React.MouseEvent) => void;
  onSaveCustomProgress: (id: string, customVal: string, total: number, type: string) => void;
  renderLoader: (isFullScreen: boolean) => React.ReactNode;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  mediaList,
  filteredMedia,
  isLoadingWatchlist,
  activeTab,
  setActiveTab,
  statusFilter,
  setStatusFilter,
  searchQuery,
  onOpenFilterDrawer,
  onOpenAddModal,
  onOpenSearchModalWithQuery,
  editingId,
  customValue,
  setCustomValue,
  setEditingId,
  onSelectDetails,
  onIncrement,
  onCatchUp,
  onReset,
  onSaveCustomProgress,
  renderLoader
}) => {
  const activeFilterLabel = (() => {
    const parts: string[] = [];
    if (activeTab !== "ALL") {
      const typeLabels: Record<string, string> = {
        ANIME: "Anime",
        MANGA: "Manga",
        TV_SHOW: "Series",
        MOVIE: "Movies"
      };
      parts.push(typeLabels[activeTab] || activeTab);
    }
    if (statusFilter !== "ALL") {
      const statusLabels: Record<string, string> = {
        ONGOING: "Ongoing",
        COMPLETED: "Completed"
      };
      parts.push(statusLabels[statusFilter] || statusFilter);
    }
    return parts.length > 0 ? `Filters: ${parts.join(" • ")}` : "Filters (All)";
  })();

  const activeFiltersCount = (activeTab !== "ALL" ? 1 : 0) + (statusFilter !== "ALL" ? 1 : 0);

  return (
    <section className="lg:col-span-3 flex flex-col gap-6 order-1 lg:order-2 pb-28 lg:pb-0">
      {/* Category & Status Filter Controls */}
      <div className="bg-[#0f1015] border border-[#1f212a] p-2.5 md:p-2 rounded-2xl w-full shadow-sm">
        {/* Mobile Filter Trigger Button */}
        <div className="flex md:hidden items-center gap-2 w-full">
          <button
            onClick={onOpenFilterDrawer}
            className="flex-grow flex items-center justify-center gap-2 bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-200 border border-[#1f212a] px-4 py-2.5 rounded-xl font-extrabold text-[10px] uppercase tracking-wider transition-all active:scale-95 cursor-pointer min-h-[40px]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#ff2e43]" />
            <span>{activeFilterLabel}</span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#ff2e43] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="flex-shrink-0 flex items-center justify-center bg-[#ff2e43]/10 border border-[#ff2e43]/20 text-[#ff2e43] px-4 py-2.5 rounded-xl font-extrabold text-[10px] uppercase tracking-wider min-h-[40px] whitespace-nowrap">
            {filteredMedia.length} Match{filteredMedia.length !== 1 ? "es" : ""}
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center justify-between w-full">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            {[
              { label: "All Media", value: "ALL" as const },
              { label: "Anime", value: "ANIME" as const },
              { label: "Manga", value: "MANGA" as const },
              { label: "Series", value: "TV_SHOW" as const },
              { label: "Movies", value: "MOVIE" as const }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-shrink-0 text-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab.value
                    ? "bg-[#ff2e43] text-white shadow-lg shadow-[#ff2e43]/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#1f212a]/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-[#050608] p-1 rounded-xl border border-[#1f212a]/60">
              {[
                { label: "All Statuses", value: "ALL" as const },
                { label: "Ongoing", value: "ONGOING" as const },
                { label: "Completed", value: "COMPLETED" as const }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    statusFilter === tab.value
                      ? "bg-[#ff2e43] text-white shadow-md shadow-[#ff2e43]/15"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[9px] text-[#ff2e43] font-bold bg-[#ff2e43]/10 border border-[#ff2e43]/20 px-3.5 py-1.5 rounded-xl uppercase tracking-widest whitespace-nowrap">
              {filteredMedia.length} Match{filteredMedia.length !== 1 ? "es" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {isLoadingWatchlist ? (
        renderLoader(false)
      ) : filteredMedia.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
          {filteredMedia.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              editingId={editingId}
              customValue={customValue}
              setCustomValue={setCustomValue}
              setEditingId={setEditingId}
              onSelectDetails={onSelectDetails}
              onIncrement={onIncrement}
              onCatchUp={onCatchUp}
              onReset={onReset}
              onSaveCustomProgress={onSaveCustomProgress}
            />
          ))}
        </div>
      ) : mediaList.length === 0 ? (
        <div className="bg-[#0f1015] border border-[#1f212a] rounded-3xl p-8 sm:p-16 text-center flex flex-col items-center justify-center gap-5">
          <Sparkles className="w-12 h-12 text-[#ff2e43] animate-pulse" />
          <div>
            <h3 className="text-base font-bold text-slate-200">Your Watchlist is Empty!</h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Start tracking by adding your favorite Anime, Manga, TV Series, or Movies. Click below to start! (o^▽^o)
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="px-5 py-3 bg-[#ff2e43] hover:bg-[#e02034] text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Add Your First Media
          </button>
        </div>
      ) : (
        <div className="bg-[#0f1015] border border-[#1f212a] rounded-3xl p-8 sm:p-16 text-center flex flex-col items-center justify-center gap-4">
          <Search className="w-12 h-12 text-[#1f212a]" />
          <div>
            <h3 className="text-base font-bold text-slate-300">No media cards found matching search</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto px-4">
              "{searchQuery}" was not found in your watchlist. Would you like to search online API lists?
            </p>
          </div>
          <button
            onClick={() => onOpenSearchModalWithQuery(searchQuery)}
            className="px-5 py-3 bg-[#ff2e43] hover:bg-[#e02034] text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Search Online Index
          </button>
        </div>
      )}
    </section>
  );
};
