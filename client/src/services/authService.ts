import { getApiBaseUrl } from "./apiClient";
import { AuthResponse } from "../types/auth";

export const registerUser = async (username: string, email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Registration failed");
  }
  return data;
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }
  return data;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to request OTP");
  }
  return data;
};

export const resetPassword = async (email: string, otp: string, newPassword: string): Promise<AuthResponse> => {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to reset password");
  }
  return data;
};

export const changePassword = async (token: string, currentPassword: string, newPassword: string): Promise<{ message: string }> => {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("UNAUTHORIZED");
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to change password");
  }
  return data;
};
