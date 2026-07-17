import { useState, useEffect } from "react";
import { User } from "../types/auth";
import * as authService from "../services/authService";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("umt_token");
    const savedUser = localStorage.getItem("umt_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user credentials", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("umt_token");
    localStorage.removeItem("umt_user");
    setToken(null);
    setUser(null);
  };

  const setAuthSession = (token: string, user: User) => {
    localStorage.setItem("umt_token", token);
    localStorage.setItem("umt_user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  return {
    token,
    user,
    authError,
    setAuthError,
    authLoading,
    setAuthLoading,
    successMessage,
    setSuccessMessage,
    handleLogout,
    setAuthSession
  };
}
