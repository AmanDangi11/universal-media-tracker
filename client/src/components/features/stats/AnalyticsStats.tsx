import React from "react";
import { TrendingUp, Activity, User, Puzzle, Smartphone, Palette, Key, Database, LogOut } from "lucide-react";
import { MediaItem } from "../../../types/media";
import { User as UserType } from "../../../types/auth";

interface AnalyticsStatsProps {
  mediaList: MediaItem[];
  user: UserType | null;
  isMobileView?: boolean;
  onOpenSettings?: () => void;
  isInstallable?: boolean;
  onInstallClick?: () => void;
  onOpenTheme?: () => void;
  onOpenChangePassword?: () => void;
  onOpenImportExport?: () => void;
  onLogout?: () => void;
}

export const AnalyticsStats: React.FC<AnalyticsStatsProps> = ({
  mediaList,
  user,
  isMobileView = false,
  onOpenSettings,
  isInstallable = false,
  onInstallClick,
  onOpenTheme,
  onOpenChangePassword,
  onOpenImportExport,
  onLogout
}) => {
  const calculateAnalytics = () => {
    let watchMinutes = 0;
    let readMinutes = 0;
    let completedCount = 0;

    mediaList.forEach((item) => {
      const progress = item.currentProgress || 0;
      if (progress === item.totalProgress) {
        completedCount++;
      }
      if (item.type === "ANIME") {
        watchMinutes += progress * 24;
      } else if (item.type === "TV_SHOW") {
        watchMinutes += progress * 45;
      } else if (item.type === "MOVIE") {
        watchMinutes += progress * 120;
      } else if (item.type === "MANGA" || item.type === "LIGHT_NOVEL") {
        readMinutes += progress * 10;
      }
    });

    const watchHours = parseFloat((watchMinutes / 60).toFixed(1));
    const readHours = parseFloat((readMinutes / 60).toFixed(1));

    return { watchHours, readHours, completedCount };
  };

  const { watchHours, readHours, completedCount } = calculateAnalytics();

  if (isMobileView) {
    return (
      <div className="flex flex-col gap-5 w-full max-w-5xl mx-auto pb-28 animate-in fade-in duration-200">
        <div className="border-b border-[#1f212a] pb-3">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-[#ff2e43]" />
            Ledger Metrics
          </h2>
          <p className="text-[9px] text-slate-550 mt-0.5 font-medium">Watchlist profiles, sync clusters and logs</p>
        </div>

        {/* User profile segment */}
        <div className="bg-[#0f1015] border border-[#1f212a] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1f212a] flex items-center justify-center text-slate-300">
              <User className="w-5 h-5 text-[#ff2e43]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-205">{user?.username}</h4>
              <p className="text-[9px] text-slate-550 font-bold uppercase tracking-wider mt-0.5">{user?.email}</p>
            </div>
          </div>
          <span className="text-[8px] bg-indigo-950 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
            Active Watcher
          </span>
        </div>

        {/* Analytics Card */}
        <div className="bg-[#0f1015] border border-[#1f212a] rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-350 mb-4.5">
            <TrendingUp className="w-4 h-4 text-[#ff2e43]" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider">Dashboard Analytics</h4>
          </div>
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            <div className="bg-[#050608] border border-[#1f212a] p-3 rounded-xl text-center">
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Watched</p>
              <p className="text-base font-black text-slate-200 mt-0.5">{watchHours}h</p>
            </div>
            <div className="bg-[#050608] border border-[#1f212a] p-3 rounded-xl text-center">
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Read</p>
              <p className="text-base font-black text-slate-200 mt-0.5">{readHours}h</p>
            </div>
            <div className="bg-[#050608] border border-[#1f212a] p-3 rounded-xl text-center">
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Completed</p>
              <p className="text-base font-black text-emerald-400 mt-0.5">{completedCount}</p>
            </div>
          </div>
          <div className="bg-[#050608] border border-[#1f212a] p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">Total Tracking Invested</span>
            <span className="font-extrabold text-[#ff2e43]">{(watchHours + readHours).toFixed(1)} Hours</span>
          </div>
        </div>

        {/* Mobile Settings Actions */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="w-full py-3.5 bg-[#0f1015] hover:bg-[#1f212a] border border-[#1f212a] text-xs font-extrabold rounded-xl text-slate-300 transition-all flex items-center justify-center gap-2 active:scale-95 mt-2"
          >
            <Puzzle className="w-4 h-4" />
            Extension Management
          </button>
        )}

        {isInstallable && onInstallClick && (
          <button
            onClick={onInstallClick}
            className="w-full py-3.5 bg-[#ff2e43]/10 hover:bg-[#ff2e43]/20 border border-[#ff2e43]/30 text-xs font-extrabold rounded-xl text-[#ff2e43] transition-all flex items-center justify-center gap-2 active:scale-95 mt-2"
          >
            <Smartphone className="w-4 h-4" />
            Install BingeLog App
          </button>
        )}

        {onOpenTheme && (
          <button
            onClick={onOpenTheme}
            className="w-full py-3.5 bg-[#0f1015] hover:bg-[#1f212a] border border-[#1f212a] text-xs font-extrabold rounded-xl text-slate-300 transition-all flex items-center justify-center gap-2 active:scale-95 mt-2"
          >
            <Palette className="w-4 h-4" />
            Theme Customization
          </button>
        )}

        {onOpenChangePassword && (
          <button
            onClick={onOpenChangePassword}
            className="w-full py-3.5 bg-[#0f1015] hover:bg-[#1f212a] border border-[#1f212a] text-xs font-extrabold rounded-xl text-slate-300 transition-all flex items-center justify-center gap-2 active:scale-95 mt-2"
          >
            <Key className="w-4 h-4" />
            Change Password
          </button>
        )}

        {onOpenImportExport && (
          <button
            onClick={onOpenImportExport}
            className="w-full py-3.5 bg-[#0f1015] hover:bg-[#1f212a] border border-[#1f212a] text-xs font-extrabold rounded-xl text-slate-300 transition-all flex items-center justify-center gap-2 active:scale-95 mt-2"
          >
            <Database className="w-4 h-4" />
            Import / Export Watchlist
          </button>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full py-3.5 bg-red-950/20 hover:bg-[#ff2e43]/10 border border-[#ff2e43]/20 text-xs font-extrabold rounded-xl text-[#ff2e43] transition-all flex items-center justify-center gap-2 active:scale-95 mt-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of Account
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#0f1015] border border-[#1f212a] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-300 mb-4">
        <TrendingUp className="w-4 h-4 text-[#ff2e43]" />
        <h2 className="text-xs font-bold uppercase tracking-wider">Ledger Analytics</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-[#050608] border border-[#1f212a] p-3.5 rounded-xl text-center">
          <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Watch Time</p>
          <p className="text-lg font-black text-slate-205 mt-1">{watchHours}h</p>
        </div>
        <div className="bg-[#050608] border border-[#1f212a] p-3.5 rounded-xl text-center">
          <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Read Time</p>
          <p className="text-lg font-black text-slate-205 mt-1">{readHours}h</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2 bg-[#050608] border border-[#1f212a] p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500">Completed Entries</span>
          <span className="font-extrabold text-emerald-400">{completedCount} titles</span>
        </div>
      </div>
      <div className="bg-[#050608] border border-[#1f212a] p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500">Total Tracking Invested</span>
        <span className="font-extrabold text-[#ff2e43]">{(watchHours + readHours).toFixed(1)} hrs</span>
      </div>
    </div>
  );
};
