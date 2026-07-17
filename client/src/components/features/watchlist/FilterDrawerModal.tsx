import React from "react";
import { SlidersHorizontal, X, Layers, Film, BookOpen, Tv, Play, Activity, CheckCircle } from "lucide-react";

interface FilterDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: "ALL" | "ANIME" | "MANGA" | "TV_SHOW" | "MOVIE";
  setActiveTab: (tab: "ALL" | "ANIME" | "MANGA" | "TV_SHOW" | "MOVIE") => void;
  statusFilter: "ALL" | "ONGOING" | "COMPLETED";
  setStatusFilter: (status: "ALL" | "ONGOING" | "COMPLETED") => void;
  matchCount: number;
}

export const FilterDrawerModal: React.FC<FilterDrawerModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  statusFilter,
  setStatusFilter,
  matchCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:hidden animate-in fade-in duration-200">
      <div className="glass-panel border border-[#1f212a] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-5 border-b border-[#1f212a] flex justify-between items-center bg-[#0f1015]/50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#ff2e43]" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Filter Ledger</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-400 hover:text-slate-100 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Media Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "All Media", value: "ALL" },
                { label: "Anime", value: "ANIME" },
                { label: "Manga", value: "MANGA" },
                { label: "Series", value: "TV_SHOW" },
                { label: "Movies", value: "MOVIE" }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as any)}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all select-none duration-200 cursor-pointer ${
                    activeTab === tab.value
                      ? "bg-[#ff2e43] text-white shadow-lg shadow-[#ff2e43]/20 border border-[#ff2e43]"
                      : "bg-[#050608]/50 border border-[#1f212a] text-slate-400 hover:text-slate-200 hover:bg-[#1f212a]/30"
                  } ${tab.value === "ALL" ? "col-span-2" : ""}`}
                >
                  {tab.value === "ALL" && <Layers className="w-3.5 h-3.5" />}
                  {tab.value === "ANIME" && <Film className="w-3.5 h-3.5" />}
                  {tab.value === "MANGA" && <BookOpen className="w-3.5 h-3.5" />}
                  {tab.value === "TV_SHOW" && <Tv className="w-3.5 h-3.5" />}
                  {tab.value === "MOVIE" && <Play className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Progress Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "All Statuses", value: "ALL" },
                { label: "Ongoing", value: "ONGOING" },
                { label: "Completed", value: "COMPLETED" }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value as any)}
                  className={`flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all select-none duration-200 cursor-pointer ${
                    statusFilter === tab.value
                      ? "bg-[#ff2e43] text-white shadow-lg shadow-[#ff2e43]/20 border border-[#ff2e43]"
                      : "bg-[#050608]/50 border border-[#1f212a] text-slate-400 hover:text-slate-200 hover:bg-[#1f212a]/30"
                  }`}
                >
                  {tab.value === "ALL" && <Layers className="w-3 h-3" />}
                  {tab.value === "ONGOING" && <Activity className="w-3 h-3" />}
                  {tab.value === "COMPLETED" && <CheckCircle className="w-3 h-3" />}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-[#1f212a] bg-[#050608]/50 flex flex-col gap-3">
          {(activeTab !== "ALL" || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setActiveTab("ALL");
                setStatusFilter("ALL");
              }}
              className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-500 hover:text-[#ff2e43] py-1 transition-all"
            >
              Reset Active Filters
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#ff2e43]/20 active:scale-95 text-center flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>
              Show {matchCount} Match{matchCount !== 1 ? "es" : ""}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
