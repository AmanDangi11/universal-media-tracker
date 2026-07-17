import React, { useState } from "react";
import { Modal } from "../../ui/Modal";
import { Database } from "lucide-react";
import * as watchlistService from "../../../services/watchlistService";
import { trackEvent } from "../../../lib/analytics";
import { User } from "../../../types/auth";

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  user: User | null;
  onLogout: () => void;
  onRefreshWatchlist: () => void;
  importProgress: { current: number; total: number; percentage: number } | null;
  setImportProgress: (prog: { current: number; total: number; percentage: number } | null) => void;
  setIsMinimizedImport: (min: boolean) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  token,
  user,
  onLogout,
  onRefreshWatchlist,
  importProgress,
  setImportProgress,
  setIsMinimizedImport
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleExportWatchlist = async () => {
    if (!token) return;
    try {
      const data = await watchlistService.exportWatchlist(token);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `watchlist-export-${user?.username || "user"}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      trackEvent("export_watchlist", "data_transfer", user?.username);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") {
        onLogout();
        onClose();
      } else {
        alert("Failed to export watchlist. Please try again.");
      }
    }
  };

  const handleImportWatchlist = async (file: File) => {
    if (!file || !token) return;
    setIsImporting(true);
    setImportMessage(null);
    setImportProgress({ current: 0, total: 0, percentage: 0 });
    setIsMinimizedImport(false);
    try {
      const text = await file.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch (parseErr) {
        setImportMessage({ type: "error", text: "Invalid JSON format. Please upload a valid JSON file." });
        setIsImporting(false);
        setImportProgress(null);
        return;
      }

      let isAnilist = false;
      let itemsToImport: any[] = [];

      if (Array.isArray(parsed)) {
        itemsToImport = parsed;
      } else if (parsed && typeof parsed === "object" && Array.isArray(parsed.lists)) {
        itemsToImport = parsed.lists;
        isAnilist = true;
      } else {
        setImportMessage({
          type: "error",
          text: "Watchlist data must be a JSON array or a valid AniList export."
        });
        setIsImporting(false);
        setImportProgress(null);
        return;
      }

      const totalItems = itemsToImport.length;
      if (totalItems === 0) {
        setImportMessage({ type: "success", text: "No items found to import." });
        setIsImporting(false);
        setImportProgress(null);
        return;
      }

      setImportProgress({ current: 0, total: totalItems, percentage: 0 });

      const chunkSize = 25;
      let processedCount = 0;
      let totalImported = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;

      for (let i = 0; i < totalItems; i += chunkSize) {
        const chunk = itemsToImport.slice(i, i + chunkSize);
        let payload: any = {};
        if (isAnilist) {
          payload = { anilistData: { lists: chunk } };
        } else {
          payload = { items: chunk };
        }

        try {
          const data = await watchlistService.importWatchlistChunk(token, payload);
          totalImported += data.imported ?? (data.count || chunk.length);
          totalUpdated += data.updated ?? 0;
          totalSkipped += data.skipped ?? 0;
        } catch (err: any) {
          if (err.message === "UNAUTHORIZED") {
            onLogout();
            onClose();
            return;
          }
          console.error("Error importing chunk:", err);
        }

        processedCount += chunk.length;
        const percentage = Math.min(100, Math.round((processedCount / totalItems) * 100));
        setImportProgress({ current: processedCount, total: totalItems, percentage });
      }

      trackEvent("import_watchlist", "data_transfer", `Imported ${totalImported} items`, totalImported);
      setImportMessage({
        type: "success",
        text: `Watchlist imported successfully! Added ${totalImported} new, updated ${totalUpdated}, and skipped ${totalSkipped} duplicates.`
      });
      onRefreshWatchlist();
    } catch (err) {
      setImportMessage({ type: "error", text: "An error occurred during import. Please try again." });
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportProgress(null), 5000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setImportMessage(null);
      }}
      title="Import / Export Watchlist"
      icon={<Database className="w-5 h-5 text-[#ff2e43]" />}
    >
      <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
        {importMessage && (
          <div
            className={`p-3 border rounded-xl text-xs font-semibold animate-in fade-in duration-250 ${
              importMessage.type === "success"
                ? "bg-emerald-955/20 border-emerald-500/30 text-emerald-450"
                : "bg-red-955/20 border-red-500/30 text-[#ff2e43]"
            }`}
          >
            {importMessage.text}
          </div>
        )}

        {/* Export Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450">Export Watchlist</h3>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
            Download a backup file of your entire watchlist including media titles, progress records, ratings, and status.
          </p>
          <button
            type="button"
            onClick={handleExportWatchlist}
            className="w-full py-3 bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-200 hover:text-white border border-[#1f212a] hover:border-[#ff2e43]/25 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>📤 Download Backup JSON</span>
          </button>
        </div>

        {/* Import Section */}
        <div className="space-y-3 pt-4 border-t border-[#1f212a]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450">Import Watchlist</h3>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
            Upload a previously exported `.json` file to restore your watchlist or import entries from another tracker.
          </p>

          <div className="relative group border-2 border-dashed border-[#1f212a] hover:border-[#ff2e43]/20 rounded-2xl p-6 text-center transition-all bg-[#050608]/40">
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportWatchlist(file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isImporting}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <Database className="w-8 h-8 text-slate-600 group-hover:text-[#ff2e43] transition-colors" />
              {isImporting ? (
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-3.5 h-3.5 border-2 border-[#ff2e43] border-t-transparent rounded-full animate-spin" />
                    <span>
                      Importing: {importProgress?.current} / {importProgress?.total} ({importProgress?.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#15171e] h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-[#ff2e43] h-full rounded-full transition-all duration-200"
                      style={{ width: `${importProgress?.percentage}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMinimizedImport(true);
                      onClose();
                    }}
                    className="mt-2 text-[10px] text-slate-400 hover:text-slate-200 bg-[#1f212a] hover:bg-[#2b2e3b] px-3 py-1.5 rounded-lg border border-[#1f212a] transition-all font-bold"
                  >
                    Run in Background
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-300">Drag & Drop or Click to Select File</p>
                  <p className="text-[9px] text-slate-500 font-medium">Supports JSON watchlist exports</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#1f212a] bg-[#050608]/50 flex justify-end px-6">
        <button
          type="button"
          onClick={() => {
            onClose();
            setImportMessage(null);
          }}
          className="px-5 py-2 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};
