import React, { useState, useEffect, useMemo } from "react";
import { Sparkles, Search, Calendar, Star, Check, Plus } from "lucide-react";
import { MediaItem, SearchResult } from "../../../types/media";
import * as watchlistService from "../../../services/watchlistService";

interface ReleasesViewProps {
  mediaList: MediaItem[];
  onAddMedia: (result: SearchResult) => void;
  mobileActiveTab: string;
}

export const ReleasesView: React.FC<ReleasesViewProps> = ({
  mediaList,
  onAddMedia,
  mobileActiveTab
}) => {
  const [releases, setReleases] = useState<{ movies: any[]; series: any[]; anime: any[] } | null>(null);
  const [releasesTimeframe, setReleasesTimeframe] = useState<"weekly" | "monthly">("weekly");
  const [isLoadingReleases, setIsLoadingReleases] = useState(false);
  const [selectedReleaseCategory, setSelectedReleaseCategory] = useState<"ALL" | "ANIME" | "TV_SHOW" | "MOVIE">("ALL");
  const [releaseSearchQuery, setReleaseSearchQuery] = useState("");

  useEffect(() => {
    if (mobileActiveTab === "RELEASES") {
      setIsLoadingReleases(true);
      watchlistService
        .getReleases(releasesTimeframe)
        .then((data) => setReleases(data))
        .catch((err) => console.error("Failed to fetch releases:", err))
        .finally(() => setIsLoadingReleases(false));
    }
  }, [mobileActiveTab, releasesTimeframe]);

  const filteredReleases = useMemo(() => {
    const listToFilter: any[] = [];
    if (!releases) return [];

    if (selectedReleaseCategory === "ALL" || selectedReleaseCategory === "ANIME") {
      listToFilter.push(...(releases.anime || []));
    }
    if (selectedReleaseCategory === "ALL" || selectedReleaseCategory === "TV_SHOW") {
      listToFilter.push(...(releases.series || []));
    }
    if (selectedReleaseCategory === "ALL" || selectedReleaseCategory === "MOVIE") {
      listToFilter.push(...(releases.movies || []));
    }

    return [...listToFilter].sort(
      (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
    );
  }, [releases, selectedReleaseCategory]);

  const displayedReleases = useMemo(() => {
    if (!releaseSearchQuery.trim()) return filteredReleases;
    const query = releaseSearchQuery.toLowerCase().trim();
    return filteredReleases.filter(
      (item) =>
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.synopsis && item.synopsis.toLowerCase().includes(query)) ||
        (item.franchise && item.franchise.toLowerCase().includes(query))
    );
  }, [filteredReleases, releaseSearchQuery]);

  return (
    <div className="flex flex-col gap-5 w-full max-w-5xl mx-auto pb-28 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1f212a] pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#ff2e43] fill-[#ff2e43]" />
            New Releases
          </h2>
          <p className="text-[9px] text-slate-550 mt-0.5 font-medium">Live feeds of upcoming and newly released titles</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search new releases..."
              value={releaseSearchQuery}
              onChange={(e) => setReleaseSearchQuery(e.target.value)}
              className="w-full bg-[#0f1015] border border-[#1f212a] text-xs rounded-xl pl-9 pr-3.5 py-2 text-[#f3f4f6] placeholder-slate-500 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
            />
            {releaseSearchQuery && (
              <button
                onClick={() => setReleaseSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 text-[10px] font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {selectedReleaseCategory !== "MOVIE" ? (
            <div className="flex bg-[#0f1015] border border-[#1f212a] p-1 rounded-xl gap-1 justify-center sm:justify-start">
              {[
                { label: "Weekly", value: "weekly" as const },
                { label: "Monthly", value: "monthly" as const }
              ].map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setReleasesTimeframe(tf.value)}
                  className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                    releasesTimeframe === tf.value
                      ? "bg-[#ff2e43] text-white shadow-md shadow-[#ff2e43]/15"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-[#ff2e43]/10 border border-[#ff2e43]/20 px-3.5 py-1.5 rounded-xl text-center sm:text-left">
              <span className="text-[9px] text-[#ff2e43] font-bold uppercase tracking-widest">Monthly Releases Feed</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { label: "All Releases", value: "ALL" as const },
          { label: "Anime", value: "ANIME" as const },
          { label: "Series", value: "TV_SHOW" as const },
          { label: "Movies", value: "MOVIE" as const }
        ].map((cat) => (
          <button
            key={cat.value}
            onClick={() => {
              setSelectedReleaseCategory(cat.value);
              if (cat.value === "MOVIE") {
                setReleasesTimeframe("monthly");
              }
            }}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedReleaseCategory === cat.value
                ? "bg-[#ff2e43] text-white shadow-lg shadow-[#ff2e43]/20"
                : "bg-[#0f1015] border border-[#1f212a] text-slate-400 hover:bg-[#1f212a]/50 hover:text-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoadingReleases ? (
        <div className="text-center py-20 text-[#ff2e43] flex flex-col items-center justify-center gap-2.5">
          <div className="w-8 h-8 border-4 border-[#ff2e43] border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-bold text-slate-450">Scanning live release feeds...</p>
        </div>
      ) : displayedReleases.length === 0 ? (
        <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-2 bg-[#0f1015]/40 border border-dashed border-[#1f212a] rounded-3xl w-full">
          {releaseSearchQuery.trim() ? (
            <Search className="w-8 h-8 text-slate-700 animate-pulse" />
          ) : (
            <Sparkles className="w-8 h-8 text-slate-700 animate-pulse" />
          )}
          <p className="text-xs font-semibold text-slate-400">
            {releaseSearchQuery.trim() ? "No matching releases found" : "No releases found"}
          </p>
          <p className="text-[9px] text-slate-600 leading-normal max-w-xs px-8">
            {releaseSearchQuery.trim()
              ? "Try refining your search term or selecting a different category."
              : "No newly scheduled titles returned in this range. Try shifting the timeframe to Monthly."}
          </p>
        </div>
      ) : (
        <div className="max-h-[650px] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
            {displayedReleases.map((item: any) => {
              const alreadyAdded = mediaList.some(
                (m) => m.title.toLowerCase() === item.title.toLowerCase() && m.type === item.type
              );

              return (
                <div
                  key={`release-${item.id}`}
                  className="group bg-[#0f1015]/80 backdrop-blur-sm border border-[#1f212a] rounded-2xl p-3 sm:p-4 flex gap-4 hover:border-[#ff2e43]/30 hover:bg-[#121319] transition-all duration-300 shadow-lg relative"
                >
                  <div className="relative aspect-[2/3] w-20 sm:w-24 bg-slate-900 rounded-xl overflow-hidden flex-shrink-0 border border-[#1f212a]/50">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                      <span className="text-[7px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 bg-[#ff2e43] text-white rounded-md shadow-md">
                        {item.type}
                      </span>
                      {item.episode && (
                        <span className="text-[7px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 bg-indigo-600 text-white rounded-md shadow-md">
                          Ep {item.episode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4
                          className="text-xs sm:text-sm font-black text-slate-200 line-clamp-1 group-hover:text-[#ff2e43] transition-colors"
                          title={item.title}
                        >
                          {item.title}
                        </h4>
                        {item.rating > 0 && (
                          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/90 text-[#0f1015] rounded-md shadow-md text-[8px] font-black flex-shrink-0">
                            <Star className="w-2.5 h-2.5 fill-[#0f1015]" />
                            {item.rating.toFixed(1)}
                          </div>
                        )}
                      </div>

                      <p className="text-[8px] text-[#ff2e43]/85 font-extrabold uppercase tracking-widest mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#ff2e43]" />
                        {item.releaseDate
                          ? `${new Date(item.releaseDate).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}`
                          : "Date TBD"}
                      </p>

                      <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-2 sm:line-clamp-3 mt-2 leading-relaxed font-medium">
                        {item.synopsis}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#1f212a]/50 mt-3 flex justify-end">
                      {alreadyAdded ? (
                        <div className="px-4 py-1.5 bg-emerald-955/20 border border-emerald-500/30 text-emerald-450 rounded-xl text-[9px] font-bold flex items-center gap-1 cursor-default">
                          <Check className="w-3.5 h-3.5" />
                          Tracked
                        </div>
                      ) : (
                        <button
                          onClick={() => onAddMedia(item)}
                          className="px-4 py-1.5 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-[9px] font-bold transition-all flex items-center gap-1 active:scale-95 shadow-md shadow-[#ff2e43]/15"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Track Media
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
