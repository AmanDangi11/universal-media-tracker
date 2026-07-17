import React, { useState } from "react";
import { Play } from "lucide-react";
import * as authService from "../../../services/authService";
import { trackEvent } from "../../../lib/analytics";
import { User } from "../../../types/auth";

interface AuthModalProps {
  onSuccess: (token: string, user: User) => void;
  dynamicStyles: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, dynamicStyles }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [authError, setAuthError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!usernameInput || !cleanEmail || !passwordInput) {
      setAuthError("All fields are required");
      return;
    }
    setAuthError("");
    setAuthLoading(true);
    try {
      const data = await authService.registerUser(usernameInput, cleanEmail, passwordInput);
      trackEvent("sign_up", "authentication", data.user.username);
      onSuccess(data.token, data.user);
    } catch (err: any) {
      setAuthError(err.message || "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !passwordInput) {
      setAuthError("Email and password are required");
      return;
    }
    setAuthError("");
    setAuthLoading(true);
    try {
      const data = await authService.loginUser(cleanEmail, passwordInput);
      trackEvent("login", "authentication", data.user.username);
      onSuccess(data.token, data.user);
    } catch (err: any) {
      setAuthError(err.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError("Email is required");
      return;
    }
    setAuthError("");
    setSuccessMessage("");
    setAuthLoading(true);
    try {
      const data = await authService.forgotPassword(cleanEmail);
      setSuccessMessage(data.message || "Verification code sent successfully!");
      setIsResettingPassword(true);
    } catch (err: any) {
      setAuthError(err.message || "Failed to request OTP");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !otpInput || !newPasswordInput) {
      setAuthError("All fields are required");
      return;
    }
    setAuthError("");
    setSuccessMessage("");
    setAuthLoading(true);
    try {
      const data = await authService.resetPassword(cleanEmail, otpInput, newPasswordInput);
      onSuccess(data.token, data.user);
    } catch (err: any) {
      setAuthError(err.message || "Failed to reset password");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
      <style>{dynamicStyles}</style>
      <div className="min-h-screen text-[#f3f4f6] flex items-center justify-center p-4 relative font-sans selection:bg-[#ff2e43] selection:text-white overflow-hidden bg-[#050608]">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#ff2e43]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#0f1015]/80 border border-[#1f212a] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
          {/* Top Brand Banner */}
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <div className="p-3 bg-[#ff2e43] rounded-2xl shadow-lg shadow-[#ff2e43]/20 animate-pulse">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1">
                Binge<span className="text-[#ff2e43]">Log</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                Cinematic Entertainment Ledger
              </p>
            </div>
          </div>

          {/* Form Content */}
          {isForgotPassword ? (
            <form onSubmit={isResettingPassword ? handleResetPassword : handleForgotPassword} className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#ff2e43] mb-2">
                {isResettingPassword ? "Reset Password" : "Forgot Password"}
              </h2>

              {authError && (
                <div className="p-3 bg-red-950/20 border border-[#ff2e43]/30 text-[#ff2e43] text-xs font-semibold rounded-xl">
                  ⚠️ {authError}
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl">
                  ✓ {successMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  disabled={isResettingPassword}
                  className="w-full bg-[#050608] border border-[#1f212a] text-base md:text-xs rounded-xl px-4 py-3.5 text-[#f3f4f6] placeholder-slate-600 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold disabled:opacity-50"
                  autoComplete="email"
                  required
                />
              </div>

              {isResettingPassword && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Verification Code</label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full bg-[#050608] border border-[#1f212a] text-base md:text-xs rounded-xl px-4 py-3.5 text-[#f3f4f6] placeholder-slate-600 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full bg-[#050608] border border-[#1f212a] text-base md:text-xs rounded-xl px-4 py-3.5 text-[#f3f4f6] placeholder-slate-600 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#ff2e43]/20 active:scale-95 flex items-center justify-center gap-2 min-h-[44px] mt-6"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isResettingPassword ? (
                  "Reset Password & Sign In"
                ) : (
                  "Send Verification Code"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#ff2e43] mb-2">
                {isRegistering ? "Create Account" : "Access Watchlist"}
              </h2>

              {authError && (
                <div className="p-3 bg-red-950/20 border border-[#ff2e43]/30 text-[#ff2e43] text-xs font-semibold rounded-xl">
                  ⚠️ {authError}
                </div>
              )}

              {isRegistering && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Username</label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-[#050608] border border-[#1f212a] text-base md:text-xs rounded-xl px-4 py-3.5 text-[#f3f4f6] placeholder-slate-600 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
                    autoComplete="username"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-[#050608] border border-[#1f212a] text-base md:text-xs rounded-xl px-4 py-3.5 text-[#f3f4f6] placeholder-slate-600 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Password</label>
                  {!isRegistering && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setAuthError("");
                        setSuccessMessage("");
                      }}
                      className="text-[10px] font-bold text-[#ff2e43] hover:underline focus:outline-none"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#050608] border border-[#1f212a] text-base md:text-xs rounded-xl px-4 py-3.5 text-[#f3f4f6] placeholder-slate-600 focus:outline-none focus:border-[#ff2e43]/50 transition-all font-semibold"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-[#ff2e43] hover:bg-[#e02034] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#ff2e43]/20 active:scale-95 flex items-center justify-center gap-2 min-h-[44px] mt-6"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isRegistering ? (
                  "Create Free Account"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          )}

          {/* Form Switcher */}
          <div className="mt-6 pt-4 border-t border-[#1f212a] text-center">
            {isForgotPassword ? (
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsResettingPassword(false);
                  setAuthError("");
                  setSuccessMessage("");
                }}
                className="text-[11px] font-bold text-slate-400 hover:text-[#ff2e43] transition-all"
              >
                Back to Sign In
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setAuthError("");
                  setSuccessMessage("");
                }}
                className="text-[11px] font-bold text-slate-400 hover:text-[#ff2e43] transition-all"
              >
                {isRegistering ? "Already have an account? Sign In" : "Don't have an account yet? Register here"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
