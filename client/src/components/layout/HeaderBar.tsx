import React from "react";
import { Play, Plus, Search, Puzzle, Smartphone, Palette, Key, Database, LogOut } from "lucide-react";
import { User } from "../../types/auth";

interface HeaderBarProps {
  user: User | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenSettings: () => void;
  onOpenTheme: () => void;
  onOpenChangePassword: () => void;
  onOpenImportExport: () => void;
  onLogout: () => void;
  isInstallable: boolean;
  onInstallClick: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  user,
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
  onOpenSettings,
  onOpenTheme,
  onOpenChangePassword,
  onOpenImportExport,
  onLogout,
  isInstallable,
  onInstallClick
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#050608]/90 backdrop-blur-md border-b border-[#1f212a] px-4 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4 md:px-8">
      {/* Brand Header */}
      <div className="flex justify-between items-center w-full md:w-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#ff2e43] rounded-lg flex items-center justify-center shadow-lg shadow-[#ff2e43]/20">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                Binge<span className="text-[#ff2e43]">Log v1.1</span>
              </h1>
              <p className="text-[9px] text-slate-550 font-bold uppercase tracking-wider">
                Unified Entertainment Ledger
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Right Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenAddModal}
            className="p-2 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl transition-all shadow-md active:scale-95 shadow-[#ff2e43]/25"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Search & Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Compact Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search watchlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f1015] border border-[#1f212a] text-base md:text-xs rounded-xl pl-9 pr-3.5 py-2 text-[#f3f4f6] placeholder-slate-500 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
          />
        </div>

        {/* Add Media Trigger Button (Desktop) */}
        {user && (
          <button
            onClick={onOpenAddModal}
            className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 shadow-[#ff2e43]/15"
          >
            <Plus className="w-4 h-4" />
            Add Media
          </button>
        )}

        {/* Profile Card / Sign Out */}
        {user && (
          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-[#1f212a]">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-350">{user.username}</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-extrabold">Watcher</span>
            </div>
            <button
              onClick={onOpenSettings}
              className="p-2 bg-[#0f1015] border border-[#1f212a] text-slate-400 hover:text-slate-100 hover:border-slate-800 rounded-xl transition-all active:scale-95"
              title="Extension Management"
            >
              <Puzzle className="w-4 h-4" />
            </button>
            {isInstallable && (
              <button
                onClick={onInstallClick}
                className="p-2 bg-[#ff2e43]/10 border border-[#ff2e43]/30 text-[#ff2e43] hover:bg-[#ff2e43] hover:text-white hover:border-[#ff2e43] rounded-xl transition-all active:scale-95"
                title="Install BingeLog App"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onOpenTheme}
              className="p-2 bg-[#0f1015] border border-[#1f212a] text-slate-400 hover:text-slate-100 hover:border-slate-800 rounded-xl transition-all active:scale-95"
              title="Theme Customization"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenChangePassword}
              className="p-2 bg-[#0f1015] border border-[#1f212a] text-slate-400 hover:text-slate-100 hover:border-slate-800 rounded-xl transition-all active:scale-95"
              title="Change Password"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenImportExport}
              className="p-2 bg-[#0f1015] border border-[#1f212a] text-slate-400 hover:text-slate-100 hover:border-slate-800 rounded-xl transition-all active:scale-95"
              title="Import/Export Watchlist"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="p-2 bg-[#0f1015] border border-[#1f212a] text-slate-400 hover:text-[#ff2e43] hover:border-[#ff2e43]/30 rounded-xl transition-all active:scale-95"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
