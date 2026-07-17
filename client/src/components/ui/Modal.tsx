import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxWidth = "max-w-md"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4">
      <div
        className={`bg-[#0f1015] border-t sm:border border-[#1f212a] rounded-t-3xl sm:rounded-3xl w-full ${maxWidth} overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[90vh]`}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1f212a] flex justify-between items-center bg-[#0f1015]/50">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-base font-bold text-slate-100">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-400 hover:text-slate-100 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
