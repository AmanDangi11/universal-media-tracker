import React from "react";
import { Modal } from "../../ui/Modal";
import { Puzzle } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Extension Management"
      icon={<Puzzle className="w-5 h-5 text-[#ff2e43]" />}
    >
      <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Chrome Extension Auto-Sync
          </label>
          <a
            href="/extension.zip"
            download
            className="inline-flex items-center justify-center gap-2 w-full bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-200 hover:text-white border border-[#1f212a] hover:border-[#ff2e43]/20 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            <span>📥 Download Extension (.zip)</span>
          </a>
        </div>

        <div className="border-t border-[#1f212a] pt-4">
          <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px] mb-2">
            Manual Installation Steps:
          </p>
          <div className="space-y-1.5 text-[10px] text-slate-350 leading-relaxed font-medium">
            <p>1. Extract the downloaded <code className="text-slate-400 font-mono">extension.zip</code> file.</p>
            <p>2. Open <code className="text-slate-400 font-mono">chrome://extensions/</code> in Google Chrome.</p>
            <p>3. Toggle <strong className="text-slate-200 font-bold">Developer mode</strong> (top-right switch) to ON.</p>
            <p>4. Click <strong className="text-slate-200 font-bold">Load unpacked</strong> (top-left) and select the extracted folder.</p>
          </div>
        </div>

        <div className="border-t border-[#1f212a] pt-4">
          <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px] mb-2">
            How to Use & Sync:
          </p>
          <ul className="space-y-2 text-[10px] text-slate-300 leading-relaxed font-medium list-disc list-inside">
            <li>
              Ensure you are logged into this web application. The extension automatically syncs your session token from local storage.
            </li>
            <li>
              When watching anime or media on supported sites (<strong className="text-slate-200">Crunchyroll, animepahe.pw, animesuge.cz, 9anime.org.lv</strong>), progress will track automatically.
            </li>
            <li>
              If the series isn't in your watchlist, a toast will prompt you to add it instantly.
            </li>
            <li>
              When you watch more than <strong className="text-[#ff2e43]">85%</strong> of an episode, progress increments automatically in the background.
            </li>
          </ul>
        </div>
      </div>

      <div className="p-4 border-t border-[#1f212a] bg-[#050608]/50 flex justify-end px-6">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};
