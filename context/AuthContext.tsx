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

type Result = { success: boolean; error?: string };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Result;
  signup: (name: string, email: string, password: string) => Result;
  logout: () => void;
  updateProfile: (name: string, email: string) => Result;
  changePassword: (currentPassword: string, newPassword: string) => Result;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getSession());
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    signup(name, email, password) {
      const cleanName = name.trim();
      const cleanEmail = normalizeEmail(email);
      const users = getUsers();

      if (users.some((existing) => existing.email === cleanEmail)) {
        return { success: false, error: "An account with this email already exists." };
      }

      const newUser: StoredUser = {
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        name: cleanName,
        email: cleanEmail,
        password,
        createdAt: new Date().toISOString(),
      };
      saveUsers([...users, newUser]);
      const sessionUser = publicUser(newUser);
      saveSession(sessionUser, true);
      setUser(sessionUser);
      return { success: true };
    },
    login(email, password, rememberMe) {
      const account = getUsers().find(
        (existing) => existing.email === normalizeEmail(email) && existing.password === password,
      );
      if (!account) return { success: false, error: "Incorrect email or password." };

      const sessionUser = publicUser(account);
      saveSession(sessionUser, rememberMe);
      setUser(sessionUser);
      return { success: true };
    },
    logout() {
      clearSession();
      setUser(null);
    },
    updateProfile(name, email) {
      if (!user) return { success: false, error: "You need to sign in again." };
      const cleanName = name.trim();
      const cleanEmail = normalizeEmail(email);
      const users = getUsers();
      if (users.some((existing) => existing.email === cleanEmail && existing.id !== user.id)) {
        return { success: false, error: "That email is already in use." };
      }

      const updatedUsers = users.map((existing) =>
        existing.id === user.id ? { ...existing, name: cleanName, email: cleanEmail } : existing,
      );
      const updatedUser = { ...user, name: cleanName, email: cleanEmail };
      saveUsers(updatedUsers);
      saveSession(updatedUser, true);
      setUser(updatedUser);
      return { success: true };
    },
    changePassword(currentPassword, newPassword) {
      if (!user) return { success: false, error: "You need to sign in again." };
      const account = getUsers().find((existing) => existing.id === user.id);
      if (!account || account.password !== currentPassword) {
        return { success: false, error: "Your current password is incorrect." };
      }
      saveUsers(getUsers().map((existing) =>
        existing.id === user.id ? { ...existing, password: newPassword } : existing,
      ));
      return { success: true };
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
