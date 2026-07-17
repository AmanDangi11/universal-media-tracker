import React from "react";
import { Smartphone, X } from "lucide-react";

interface IosInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IosInstallModal: React.FC<IosInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-[#0f1015] border-t sm:border border-[#1f212a] rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        <div className="p-5 border-b border-[#1f212a] flex justify-between items-center bg-[#0f1015]/50">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#ff2e43]" />
            <h2 className="text-base font-bold text-slate-100">Install BingeLog</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-400 hover:text-slate-100 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 text-slate-350 text-xs leading-relaxed font-medium">
          <p>Add BingeLog to your home screen to use it as a native standalone app on your iPhone or iPad.</p>

          <div className="flex flex-col gap-4 bg-[#050608] border border-[#1f212a] p-4 rounded-2xl">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#1f212a] flex items-center justify-center text-[10px] font-black text-[#ff2e43] border border-white/5">
                1
              </span>
              <div>
                <p className="text-slate-200 font-bold mb-0.5">Open in Safari</p>
                <p className="text-[10px] text-slate-555">Make sure you are using Apple's Safari browser.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#1f212a] flex items-center justify-center text-[10px] font-black text-[#ff2e43] border border-white/5">
                2
              </span>
              <div>
                <p className="text-slate-200 font-bold mb-0.5">Tap the Share Button</p>
                <p className="text-[10px] text-slate-555">
                  Tap the Share icon{" "}
                  <span className="inline-block px-1.5 py-0.5 bg-[#1f212a] text-slate-300 rounded border border-white/5 mx-0.5 text-[8px] font-bold">
                    Share
                  </span>{" "}
                  (the square with an arrow pointing up) at the bottom or top of Safari.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#1f212a] flex items-center justify-center text-[10px] font-black text-[#ff2e43] border border-white/5">
                3
              </span>
              <div>
                <p className="text-slate-200 font-bold mb-0.5">Add to Home Screen</p>
                <p className="text-[10px] text-slate-555">
                  Scroll down the share list and tap <span className="text-slate-200 font-bold">Add to Home Screen</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#1f212a] bg-[#0f1015]/50 flex justify-end px-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
