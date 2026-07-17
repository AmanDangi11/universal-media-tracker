import React from "react";
import { Tv, Clock } from "lucide-react";
import { CalendarEntry, MediaItem } from "../../../types/media";

interface AiringCalendarProps {
  airingCalendar: CalendarEntry[];
  mediaList: MediaItem[];
  isMobileView?: boolean;
}

export const AiringCalendarView: React.FC<AiringCalendarProps> = ({
  airingCalendar,
  mediaList,
  isMobileView = false
}) => {
  if (isMobileView) {
    return (
      <div className="flex flex-col gap-5 w-full max-w-4xl mx-auto pb-28 animate-in fade-in duration-200">
        <div className="flex items-center justify-between border-b border-[#1f212a] pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <Tv className="w-4 h-4 text-[#ff2e43]" />
              Airing Calendar
            </h2>
            <p className="text-[9px] text-slate-550 mt-0.5 font-medium">Watchlist schedules synced dynamically</p>
          </div>
          <span className="text-[8px] bg-[#ff2e43]/10 border border-[#ff2e43]/20 text-[#ff2e43] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
            Local / JST
          </span>
        </div>

        {airingCalendar.length > 0 ? (
          <div className="space-y-4">
            {airingCalendar.map((entry) => {
              const media = mediaList.find((m) => m.id === entry.id);
              return (
                <div key={entry.id} className="bg-[#0f1015] border border-[#1f212a] rounded-2xl p-4 flex gap-4 items-start shadow-md">
                  <div className="flex-shrink-0 w-12 h-18 bg-slate-900 rounded-lg overflow-hidden border border-[#1f212a]">
                    {media && <img src={media.coverImage} alt={entry.title} className="w-full h-full object-cover" />}
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
              );
            })}
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
    );
  }

  return (
    <div className="bg-[#0f1015] border border-[#1f212a] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[#ff2e43]">
          <Tv className="w-5 h-5" />
          <h2 className="text-xs font-bold uppercase tracking-wider">Airing Calendar</h2>
        </div>
        <span className="text-[9px] bg-[#ff2e43]/10 border border-[#ff2e43]/20 text-[#ff2e43] px-2.5 py-0.5 rounded-full font-bold uppercase">
          JST / Local
        </span>
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
  );
};
