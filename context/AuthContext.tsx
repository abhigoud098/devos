"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getSession,
  getUsers,
  publicUser,
  saveSession,
  saveUsers,
  type AuthUser,
  type StoredUser,
} from "@/lib/auth-storage";
import { api } from "@/lib/api-client";

type Result = { success: boolean; error?: string };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<Result>;
  signup: (name: string, email: string, password: string) => Promise<Result>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<Result>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<Result>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    setUser(session);
    setLoading(false);

    // If online and session exists, verify with backend
    if (session?.id) {
      api.auth.me().then((res) => {
        if (res.data?.user) {
          const u = { id: res.data.user.id, name: res.data.user.name, email: res.data.user.email };
          setUser(u);
          saveSession(u, true);
        } else if (res.status === 401) {
          clearSession();
          setUser(null);
        }
      });
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      async signup(name, email, password) {
        const cleanName = name.trim();
        const cleanEmail = normalizeEmail(email);

        // Call backend API
        const res = await api.auth.signup(cleanName, cleanEmail, password);

        if (res.data?.user) {
          const sessionUser = {
            id: res.data.user.id,
            name: res.data.user.name,
            email: res.data.user.email,
          };
          saveSession(sessionUser, true);
          setUser(sessionUser);
          return { success: true };
        }

        return { success: false, error: res.error || "Failed to create account." };
      },
      async login(email, password, rememberMe) {
        const cleanEmail = normalizeEmail(email);

        // Call backend API
        const res = await api.auth.login(cleanEmail, password);

        if (res.data?.user) {
          const sessionUser = {
            id: res.data.user.id,
            name: res.data.user.name,
            email: res.data.user.email,
          };
          saveSession(sessionUser, rememberMe);
          setUser(sessionUser);
          return { success: true };
        }

        return { success: false, error: res.error || "Incorrect email or password." };
      },
      logout() {
        clearSession();
        setUser(null);
      },
      async updateProfile(name, email) {
        if (!user) return { success: false, error: "You need to sign in again." };
        const cleanName = name.trim();
        const cleanEmail = normalizeEmail(email);

        const res = await api.auth.updateProfile(cleanName, cleanEmail);

        if (res.data?.user) {
          const updatedUser = {
            id: res.data.user.id,
            name: res.data.user.name,
            email: res.data.user.email,
          };
          saveSession(updatedUser, true);
          setUser(updatedUser);
          return { success: true };
        }

        return { success: false, error: res.error || "Failed to update profile." };
      },
      async changePassword(currentPassword, newPassword) {
        if (!user) return { success: false, error: "You need to sign in again." };

        const res = await api.auth.changePassword(currentPassword, newPassword);

        if (res.data?.success) {
          return { success: true };
        }

        return { success: false, error: res.error || "Your current password is incorrect." };
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
