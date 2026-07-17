import React, { useState } from "react";
import { Modal } from "../../ui/Modal";
import { Key } from "lucide-react";
import * as authService from "../../../services/authService";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  onLogout: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  token,
  onLogout
}) => {
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [changePasswordNewInput, setChangePasswordNewInput] = useState("");
  const [changePasswordConfirmInput, setChangePasswordConfirmInput] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  const resetForm = () => {
    setChangePasswordError("");
    setChangePasswordSuccess("");
    setCurrentPasswordInput("");
    setChangePasswordNewInput("");
    setChangePasswordConfirmInput("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPasswordInput || !changePasswordNewInput || !changePasswordConfirmInput) {
      setChangePasswordError("All fields are required");
      setChangePasswordSuccess("");
      return;
    }
    if (changePasswordNewInput.length < 6) {
      setChangePasswordError("New password must be at least 6 characters");
      setChangePasswordSuccess("");
      return;
    }
    if (changePasswordNewInput !== changePasswordConfirmInput) {
      setChangePasswordError("New passwords do not match");
      setChangePasswordSuccess("");
      return;
    }
    if (!token) return;

    setChangePasswordError("");
    setChangePasswordSuccess("");
    setChangePasswordLoading(true);

    try {
      const data = await authService.changePassword(token, currentPasswordInput, changePasswordNewInput);
      setChangePasswordSuccess(data.message || "Password changed successfully!");
      setCurrentPasswordInput("");
      setChangePasswordNewInput("");
      setChangePasswordConfirmInput("");
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") {
        onLogout();
        handleClose();
      } else {
        setChangePasswordError(err.message || "Failed to change password");
      }
    } finally {
      setChangePasswordLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Password"
      icon={<Key className="w-5 h-5 text-[#ff2e43]" />}
    >
      <form onSubmit={handleChangePassword} className="flex flex-col flex-1">
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {changePasswordError && (
            <div className="p-3 bg-red-950/30 border border-red-500/20 text-[#ff2e43] rounded-xl text-xs font-semibold animate-in fade-in duration-250">
              {changePasswordError}
            </div>
          )}
          {changePasswordSuccess && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold animate-in fade-in duration-250">
              {changePasswordSuccess}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPasswordInput}
              onChange={(e) => setCurrentPasswordInput(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-3 bg-[#050608] border border-[#1f212a] hover:border-slate-800 focus:border-[#ff2e43] focus:ring-1 focus:ring-[#ff2e43] rounded-xl text-xs font-semibold text-slate-200 placeholder-slate-600 transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={changePasswordNewInput}
              onChange={(e) => setChangePasswordNewInput(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-4 py-3 bg-[#050608] border border-[#1f212a] hover:border-slate-800 focus:border-[#ff2e43] focus:ring-1 focus:ring-[#ff2e43] rounded-xl text-xs font-semibold text-slate-200 placeholder-slate-600 transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={changePasswordConfirmInput}
              onChange={(e) => setChangePasswordConfirmInput(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 bg-[#050608] border border-[#1f212a] hover:border-slate-800 focus:border-[#ff2e43] focus:ring-1 focus:ring-[#ff2e43] rounded-xl text-xs font-semibold text-slate-200 placeholder-slate-600 transition-all outline-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-[#1f212a] bg-[#050608]/50 flex justify-end gap-3 px-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 bg-[#1f212a] hover:bg-[#2b2e3b] text-slate-355 rounded-xl text-xs font-bold transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={changePasswordLoading}
            className="px-5 py-2.5 bg-[#ff2e43] hover:bg-[#e02034] disabled:bg-[#ff2e43]/50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 shadow-[#ff2e43]/15 flex items-center gap-2"
          >
            {changePasswordLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
