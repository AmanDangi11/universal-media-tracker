import React from "react";
import { BookOpen, Tv, Search, Sparkles, Layers } from "lucide-react";

export type MobileTab = "LIST" | "CALENDAR" | "DISCOVER" | "RELEASES" | "STATS";

interface MobileNavProps {
  mobileActiveTab: MobileTab;
  setMobileActiveTab: (tab: MobileTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ mobileActiveTab, setMobileActiveTab }) => {
  const tabs = [
    { id: "LIST" as MobileTab, label: "Ledger", icon: BookOpen },
    { id: "CALENDAR" as MobileTab, label: "Airing", icon: Tv },
    { id: "DISCOVER" as MobileTab, label: "Discover", icon: Search },
    { id: "RELEASES" as MobileTab, label: "Releases", icon: Sparkles },
    { id: "STATS" as MobileTab, label: "Stats", icon: Layers }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f1015] border-t border-[#1f212a] px-3 pt-2 pb-[calc(10px+env(safe-area-inset-bottom,0px))] grid grid-cols-5 shadow-2xl items-center rounded-t-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = mobileActiveTab === tab.id;
        const isAiring = tab.id === "CALENDAR";
        return (
          <button
            key={`bottom-nav-${tab.id}`}
            onClick={() => setMobileActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all relative ${
              isActive ? "text-[#ff2e43] font-bold" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon className={`${isAiring ? "w-3.5 h-3.5" : "w-4 h-4"} flex-shrink-0 animate-in fade-in`} />
            <span className="text-[8px] xs:text-[9px] mt-1 font-bold tracking-tight uppercase text-center block w-full truncate">
              {tab.label}
            </span>
            {isActive && <span className="absolute bottom-0 w-3 h-0.5 bg-[#ff2e43] rounded-full" />}
          </button>
        );
      })}
    </div>
  );
};
