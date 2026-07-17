import React, { useEffect, useState } from "react";
import { Film, X, Tv, CheckCircle, Plus, Bookmark, RotateCcw, Trash2, Edit2 } from "lucide-react";
import { MediaItem } from "../../../types/media";

interface MediaDetailsModalProps {
  selectedItem: MediaItem | null;
  mediaList: MediaItem[];
  onClose: () => void;
  onIncrement: (id: string, e?: React.MouseEvent) => void;
  onCatchUp: (id: string, e: React.MouseEvent) => void;
  onReset: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string) => void;
  onSaveCustomProgress: (id: string, customVal: string, total: number, type: string) => void;
  customValue: string;
  setCustomValue: (val: string) => void;
}

export const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({
  selectedItem,
  mediaList,
  onClose,
  onIncrement,
  onCatchUp,
  onReset,
  onDelete,
  onSaveCustomProgress,
  customValue,
  setCustomValue
}) => {
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [fetchedDescriptions, setFetchedDescriptions] = useState<Record<string, string>>({});

  if (!selectedItem) return null;

  const detailsItem = mediaList.find((m) => m.id === selectedItem.id) || selectedItem;
  const percent = Math.round((detailsItem.currentProgress / detailsItem.totalProgress) * 100);
  const isCompleted = detailsItem.currentProgress === detailsItem.totalProgress;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f1015] border-t sm:border border-[#1f212a] rounded-t-3xl sm:rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1f212a] flex justify-between items-center bg-[#0f1015]/50">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[#ff2e43]" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Media Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-400 hover:text-slate-100 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Cover */}
            <div className="w-40 h-60 bg-slate-900 rounded-2xl overflow-hidden border border-[#1f212a] flex-shrink-0 mx-auto sm:mx-0 shadow-lg relative">
              <img src={detailsItem.coverImage} alt={detailsItem.title} className="w-full h-full object-cover" />
              <span className="absolute bottom-3 left-3 text-[9px] font-extrabold px-2.5 py-1 rounded bg-black/85 text-slate-200 border border-[#1f212a] uppercase tracking-widest">
                {detailsItem.type}
              </span>
            </div>

            {/* Meta */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <span className="text-[10px] font-extrabold text-[#ff2e43] uppercase tracking-widest block font-mono">
                  {detailsItem.franchise}
                </span>
                <h3 className="text-xl font-black text-slate-100 mt-1.5 leading-snug">{detailsItem.title}</h3>

                <div className="flex flex-wrap items-center gap-2.5 mt-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      isCompleted
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/25"
                        : "bg-[#ff2e43]/15 text-[#ff2e43] border border-[#ff2e43]/20"
                    }`}
                  >
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

              {detailsItem.nextAiringEpisode && !isCompleted && (
                <div className="mt-4 p-3 bg-[#050608] border border-[#1f212a] rounded-xl flex items-center gap-2.5">
                  <Tv className="w-5 h-5 text-[#ff2e43] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-200">
                      Upcoming Episode {detailsItem.nextAiringEpisode.episode}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Releases in {Math.ceil(detailsItem.nextAiringEpisode.timeUntilAiring / 3600 / 24)} days (
                      {new Date(detailsItem.nextAiringEpisode.airingAt * 1000).toLocaleDateString()})
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2.5 mt-6 sm:mt-4">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-355">
                  <span>
                    Progress: {detailsItem.currentProgress}/{detailsItem.totalProgress} {detailsItem.progressType}s
                  </span>
                  <span className={isCompleted ? "text-emerald-400" : "text-[#ff2e43]"}>{percent}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#050608] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? "bg-emerald-500" : "bg-[#ff2e43]"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#ff2e43]">Synopsis / Description</h4>
            <div className="bg-[#050608] border border-[#1f212a] p-4.5 rounded-2xl text-xs text-slate-300 leading-relaxed font-semibold max-h-48 overflow-y-auto">
              {detailsItem.synopsis ? detailsItem.synopsis : "No synopsis available for this media."}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4 pt-2 border-t border-[#1f212a]/50">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#ff2e43]">Progress Controls</h4>

            <div className="flex flex-wrap gap-3">
              <button
                disabled={isCompleted}
                onClick={() => onIncrement(detailsItem.id)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
                  isCompleted
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
                onClick={(e) => onCatchUp(detailsItem.id, e)}
                disabled={isCompleted}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
                  isCompleted
                    ? "bg-[#050608] border border-[#1f212a] text-slate-500 cursor-not-allowed"
                    : "bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-300 hover:text-white active:scale-95"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                Catch Up to Latest
              </button>

              <button
                onClick={(e) => {
                  onReset(detailsItem.id, e);
                  setCustomValue("0");
                }}
                className="p-3 bg-[#0f1015] border border-[#1f212a] hover:border-red-950 text-slate-400 hover:text-[#ff2e43] rounded-xl transition-all min-h-[42px] flex items-center justify-center active:scale-95"
                title="Reset tracking count to 0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(detailsItem.id)}
                className="p-3 bg-red-950/20 border border-red-900/30 hover:bg-[#ff2e43]/10 text-[#ff2e43] rounded-xl transition-all min-h-[42px] flex items-center justify-center active:scale-95"
                title="Delete from Watchlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#050608] border border-[#1f212a] p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Set Specific Progress:
                </span>
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
                  onClick={() =>
                    onSaveCustomProgress(detailsItem.id, customValue, detailsItem.totalProgress, detailsItem.progressType)
                  }
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
};
