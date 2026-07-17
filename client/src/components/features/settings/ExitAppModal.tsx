import React from "react";
import { LogOut, X } from "lucide-react";

interface ExitAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
}

export const ExitAppModal: React.FC<ExitAppModalProps> = ({ isOpen, onClose, onConfirmExit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f1015] border border-[#1f212a] rounded-3xl w-full max-w-xs overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-4 border-b border-[#1f212a] flex justify-between items-center bg-[#0f1015]/50">
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-[#ff2e43]" />
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Exit App</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-400 hover:text-slate-100 rounded-lg transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 text-center text-slate-300 text-xs leading-relaxed font-semibold">
          Are you sure you want to close BingeLog?
        </div>

        <div className="p-4 border-t border-[#1f212a] bg-[#0f1015]/50 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-355 rounded-xl text-xs font-bold transition-all active:scale-95 text-center"
          >
            No, Stay
          </button>
          <button
            onClick={onConfirmExit}
            className="flex-1 py-2.5 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all active:scale-95 text-center"
          >
            Yes, Exit
          </button>
        </div>
      </div>
    </div>
  );
};
