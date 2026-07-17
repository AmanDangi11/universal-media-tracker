import React from "react";
import { Tv, Plus, BookOpen, Edit2, Check, X, Bookmark, CheckCircle, RotateCcw } from "lucide-react";
import { MediaItem } from "../../../types/media";

interface MediaCardProps {
  item: MediaItem;
  editingId: string | null;
  customValue: string;
  setCustomValue: (val: string) => void;
  setEditingId: (id: string | null) => void;
  onSelectDetails: (item: MediaItem) => void;
  onIncrement: (id: string, e?: React.MouseEvent) => void;
  onCatchUp: (id: string, e: React.MouseEvent) => void;
  onReset: (id: string, e: React.MouseEvent) => void;
  onSaveCustomProgress: (id: string, customVal: string, total: number, type: string) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  editingId,
  customValue,
  setCustomValue,
  setEditingId,
  onSelectDetails,
  onIncrement,
  onCatchUp,
  onReset,
  onSaveCustomProgress
}) => {
  const percent = Math.round((item.currentProgress / item.totalProgress) * 100);
  const isCompleted = item.currentProgress === item.totalProgress;
  const isEditingThis = editingId === item.id;

  return (
    <div
      onClick={() => {
        onSelectDetails(item);
        setCustomValue(item.currentProgress.toString());
      }}
      className={`group relative bg-[#0f1015] border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-md hover:translate-y-[-4px] cursor-pointer ${
        isCompleted
          ? "border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/5"
          : "border-[#1f212a] hover:border-[#ff2e43]/30 hover:shadow-[#ff2e43]/5"
      }`}
    >
      {/* Media Thumbnail Poster Container (aspect 3/4) */}
      <div className="relative aspect-[3/4] w-full bg-slate-900 overflow-hidden border-b border-[#1f212a] flex-shrink-0">
        <img
          src={item.coverImage}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30 opacity-80" />

        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 text-[8px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
            item.type === "ANIME"
              ? "bg-black/80 border-[#1f212a] text-[#ff2e43]"
              : item.type === "MANGA"
              ? "bg-black/80 border-[#1f212a] text-emerald-400"
              : item.type === "TV_SHOW"
              ? "bg-black/80 border-[#1f212a] text-indigo-400"
              : "bg-black/80 border-[#1f212a] text-fuchsia-400"
          }`}
        >
          {item.type}
        </span>

        {/* Percent Pill Overlay */}
        <span
          className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-md ${
            isCompleted
              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
              : "bg-[#ff2e43]/15 text-[#ff2e43] border border-[#ff2e43]/20"
          }`}
        >
          {percent}%
        </span>

        {/* Airing Calendar indicator countdown on poster */}
        {item.nextAiringEpisode && !isCompleted && (
          <div className="absolute bottom-3 left-3 right-3 p-1.5 rounded-lg bg-black/85 border border-[#1f212a] text-[8px] font-bold text-slate-300 flex items-center gap-1">
            <Tv className="w-2.5 h-2.5 text-[#ff2e43]" />
            <span className="truncate">
              Ep {item.nextAiringEpisode.episode} in{" "}
              {Math.ceil(item.nextAiringEpisode.timeUntilAiring / 3600 / 24)} days
            </span>
          </div>
        )}

        {/* Quick +1 log button */}
        {!isCompleted && (
          <button
            onClick={(e) => onIncrement(item.id, e)}
            disabled={item.id.startsWith("temp-")}
            className={`absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#ff2e43] text-white flex items-center justify-center shadow-lg active:scale-90 hover:scale-105 hover:bg-[#e02034] transition-all duration-200 ${
              item.id.startsWith("temp-") ? "opacity-50 cursor-wait" : ""
            }`}
            title={item.id.startsWith("temp-") ? "Saving..." : `Log +1 ${item.progressType}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[8px] text-slate-550 font-bold uppercase tracking-wider truncate">
            {item.franchise}
          </p>
          <h3
            className="text-xs sm:text-sm font-bold text-slate-205 mt-1.5 line-clamp-1 group-hover:text-[#ff2e43] transition-colors"
            title={item.title}
          >
            {item.title}
          </h3>

          {item.sourceMaterialProgress && (
            <div className="mt-2 p-2 bg-[#050608] border border-[#1f212a] rounded-lg text-[9px] space-y-1">
              <div className="flex items-center justify-between text-slate-400 font-semibold">
                <span className="flex items-center gap-1 text-[8px] uppercase">
                  <BookOpen className="w-3 h-3 text-emerald-400" />
                  Manga Source
                </span>
                <span className="text-slate-300 font-bold">
                  Ch. {item.sourceMaterialProgress.current}/{item.sourceMaterialProgress.total}
                </span>
              </div>
              <div className="flex items-center justify-between text-[8px] text-indigo-400 font-semibold">
                <span>Ingested Sync Gap</span>
                <span>{item.sourceMaterialProgress.current - item.currentProgress * 20} chs ahead</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3 mt-4 pt-3 border-t border-[#1f212a]/50">
          <div className="flex justify-between items-center text-xs">
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
                      if (e.key === "Enter") onSaveCustomProgress(item.id, customValue, item.totalProgress, item.progressType);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <button
                    onClick={() => onSaveCustomProgress(item.id, customValue, item.totalProgress, item.progressType)}
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
                <span>
                  Logged: <strong className="text-slate-100 font-bold">{item.currentProgress}</strong>/{item.totalProgress}
                </span>

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

          <div className="h-1 w-full bg-[#050608] rounded-full overflow-hidden">
            <div
              style={{ width: `${percent}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? "bg-emerald-500" : "bg-[#ff2e43]"
              }`}
            />
          </div>

          <div className="flex gap-2">
            <button
              disabled={isCompleted || item.id.startsWith("temp-")}
              onClick={(e) => onCatchUp(item.id, e)}
              className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-extrabold transition-all flex items-center justify-center gap-1 min-h-[30px] ${
                isCompleted || item.id.startsWith("temp-")
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
              onClick={(e) => onReset(item.id, e)}
              disabled={item.id.startsWith("temp-")}
              title="Reset tracking count to 0"
              className={`p-1.5 bg-[#050608] border border-[#1f212a] hover:border-red-950 text-slate-500 hover:text-[#ff2e43] rounded-lg transition-all min-h-[30px] flex items-center justify-center ${
                item.id.startsWith("temp-") ? "opacity-50 cursor-wait" : ""
              }`}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
