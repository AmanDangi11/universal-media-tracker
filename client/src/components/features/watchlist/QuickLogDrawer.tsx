import React from "react";
import { Sparkles, Check } from "lucide-react";
import { MediaItem } from "../../../types/media";

interface QuickLogDrawerProps {
  inProgressMedia: MediaItem[];
  onSelectDetails: (item: MediaItem) => void;
  setCustomValue: (val: string) => void;
  onIncrement: (id: string, e?: React.MouseEvent) => void;
}

export const QuickLogDrawer: React.FC<QuickLogDrawerProps> = ({
  inProgressMedia,
  onSelectDetails,
  setCustomValue,
  onIncrement
}) => {
  if (inProgressMedia.length === 0) return null;

  return (
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
                onSelectDetails(item);
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
                  <span className="text-[8px] font-bold text-[#ff2e43] uppercase tracking-wider truncate block">
                    {item.franchise}
                  </span>
                  <h3 className="text-xs font-bold text-slate-200 mt-0.5 truncate pr-6 group-hover:text-[#ff2e43] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    Up Next: <span className="text-slate-100 font-bold">Ep/Ch {nextTarget}</span>
                    <span className="text-slate-500 font-medium"> of {item.totalProgress}</span>
                  </p>
                </div>

                {/* Micro progress meter */}
                <div className="space-y-1 mt-2">
                  <div className="h-1 w-full bg-[#050608] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-gradient-to-r from-[#ff2e43] to-indigo-500 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold uppercase">
                    <span>{percent}% Complete</span>
                    <span>{item.totalProgress - item.currentProgress} remaining</span>
                  </div>
                </div>
              </div>

              {/* Fast watch circle trigger button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onIncrement(item.id, e);
                }}
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
  );
};
