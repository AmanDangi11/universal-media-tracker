import React from "react";
import { Modal } from "../../ui/Modal";
import { Palette, Check } from "lucide-react";
import { THEMES } from "../../../constants/theme";

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: string;
  setActiveTheme: (themeKey: string) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  setActiveTheme
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Theme Customization"
      icon={<Palette className="w-5 h-5 text-[#ff2e43]" />}
      maxWidth="max-w-xl"
    >
      <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          Choose a coordinated color profile template. The selected theme will dynamically apply to the entire dashboard and mobile interface layout instantly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {Object.entries(THEMES).map(([key, theme]) => {
            const isActive = activeTheme === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveTheme(key);
                  localStorage.setItem("UMT_ACTIVE_THEME", key);
                }}
                className={`relative w-full text-left p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between h-36 focus:outline-none ${
                  isActive ? "bg-[#1f212a] shadow-lg" : "bg-[#0f1015] hover:bg-[#1f212a]/50"
                }`}
                style={{
                  borderColor: isActive ? theme.accent : "var(--color-card-border)",
                  boxShadow: isActive ? `0 0 15px rgba(${theme.accentRgb}, 0.15)` : "none"
                }}
              >
                <div className="space-y-1.5 w-full">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-bold text-slate-100">{theme.name}</span>
                    {isActive && (
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-white flex items-center gap-1"
                        style={{ backgroundColor: theme.accent }}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    {theme.description}
                  </p>
                </div>

                <div className="flex items-center justify-between w-full mt-4 pt-2 border-t border-[#1f212a]/40">
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Palette</span>
                  <div className="flex gap-1.5">
                    <span
                      className="w-5 h-5 rounded-lg border border-slate-800 flex items-center justify-center text-[8px] text-slate-500 font-bold"
                      style={{ backgroundColor: theme.background }}
                      title="Background"
                    >
                      Bg
                    </span>
                    <span
                      className="w-5 h-5 rounded-lg border border-slate-800 flex items-center justify-center text-[8px] text-slate-500 font-bold"
                      style={{ backgroundColor: theme.cardBg }}
                      title="Cards"
                    >
                      Cd
                    </span>
                    <span
                      className="w-5 h-5 rounded-lg border border-slate-800 flex items-center justify-center text-[8px] text-slate-500 font-bold"
                      style={{ backgroundColor: theme.cardBorder }}
                      title="Borders"
                    >
                      Bd
                    </span>
                    <span
                      className="w-5 h-5 rounded-lg flex items-center justify-center text-[8px] text-white font-bold"
                      style={{ backgroundColor: theme.accent }}
                      title="Accent"
                    >
                      Ac
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-[#1f212a] bg-[#050608]/50 flex justify-end px-6">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
        >
          Done
        </button>
      </div>
    </Modal>
  );
};
