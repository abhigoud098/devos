"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Download,
  Upload,
  Moon,
  Database,
  HardDrive,
  Palette,
  Shield,
  Trash2,
  CheckCircle2,
  Loader2,
  Sun,
  Lock,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { db } from "@/lib/db";
import type { LearningTopic } from "@/lib/types";

type Backup = {
  version: 1;
  exportedAt: string;
  localStorage: Record<string, string>;
  learningTopics: LearningTopic[];
};

const appStorageKeys = [
  "users", "auth_user", "auth_token", "projects", "planner-tasks",
  "developer-notes", "learning-resources", "dsa-problems", "revision-stats",
  "revision-history", "revision-goals", "study-timer-settings", "study-session-history",
];

function formatBytes(bytes: number) {
  if (!bytes) return "0 KB";
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function SettingsPage() {
  const { changePassword, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const restoreInput = useRef<HTMLInputElement>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [dimMode, setDimMode] = useState(false);
  const [storageUsed, setStorageUsed] = useState("Calculating…");
  const [backupMessage, setBackupMessage] = useState("");
  const [backupError, setBackupError] = useState("");
  const [working, setWorking] = useState<"export" | "import" | "reset" | null>(null);

  useEffect(() => {
    const savedDimMode = localStorage.getItem("devos-dim-mode") === "true";
    setDimMode(savedDimMode);
    document.documentElement.classList.toggle("dim", savedDimMode);
    if ("Notification" in window) setNotificationPermission(Notification.permission);
    navigator.storage?.estimate?.().then((estimate) => setStorageUsed(formatBytes(estimate.usage ?? 0)));
  }, []);

  function toggleDimMode() {
    const next = !dimMode;
    setDimMode(next);
    localStorage.setItem("devos-dim-mode", String(next));
    document.documentElement.classList.toggle("dim", next);
  }

  async function enableNotifications() {
    if (!("Notification" in window)) return setNotificationPermission("unsupported");
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  }

  async function exportBackup() {
    setWorking("export"); setBackupError(""); setBackupMessage("");
    try {
      const localStorageData = Object.fromEntries(appStorageKeys.flatMap((key) => {
        const value = localStorage.getItem(key);
        return value === null ? [] : [[key, value]];
      }));
      const backup: Backup = { version: 1, exportedAt: new Date().toISOString(), localStorage: localStorageData, learningTopics: await db.learningTopics.toArray() };
      const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url; link.download = `devos-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click();
      URL.revokeObjectURL(url);
      setBackupMessage("Backup downloaded successfully.");
    } catch { setBackupError("Could not create the backup. Please try again."); }
    finally { setWorking(null); }
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setWorking("import"); setBackupError(""); setBackupMessage("");
    try {
      const backup = JSON.parse(await file.text()) as Backup;
      if (backup.version !== 1 || !backup.localStorage || !Array.isArray(backup.learningTopics)) throw new Error("invalid backup");
      for (const key of appStorageKeys) localStorage.removeItem(key);
      Object.entries(backup.localStorage).forEach(([key, value]) => localStorage.setItem(key, value));
      await db.transaction("rw", db.learningTopics, async () => {
        await db.learningTopics.clear();
        await db.learningTopics.bulkPut(backup.learningTopics);
      });
      setBackupMessage("Backup restored. Reloading your workspace…");
      window.setTimeout(() => window.location.reload(), 800);
    } catch { setBackupError("That file is not a valid DevOS backup."); }
    finally { setWorking(null); }
  }

  async function resetDevOS() {
    if (!window.confirm("Delete every DevOS account, setting, and local workspace item from this browser? This cannot be undone.")) return;
    if (!window.confirm("Final confirmation: permanently reset DevOS?")) return;
    setWorking("reset");
    try {
      await db.delete();
      appStorageKeys.forEach((key) => localStorage.removeItem(key));
      localStorage.removeItem("devos-dim-mode");
      logout();
      router.replace("/signup");
    } finally { setWorking(null); }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");
    if (newPassword.length < 8) return setPasswordError("Your new password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setPasswordError("New passwords do not match.");
    const result = await changePassword(currentPassword, newPassword);
    if (!result.success) return setPasswordError(result.error ?? "Unable to change your password.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password changed successfully.");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. PAGE HEADER */}
      <PageHeader
        kicker="Preferences & Workspace"
        title="Settings"
        description="Customize DevOS theme, notifications, cloud persistence, and manage database backups."
      />

      <div className="space-y-6">
        {/* Appearance */}
        <Card className="border-base-border/80 bg-card">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-ink">Appearance & Themes</h2>
                  <p className="text-xs text-ink-muted">
                    Toggle light/dark mode and high-contrast dim settings.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleTheme} className="h-9 gap-1.5 text-xs">
                  {theme === "dark" ? <><Sun className="h-3.5 w-3.5" /> Light</> : <><Moon className="h-3.5 w-3.5" /> Dark</>}
                </Button>

                <Button variant="outline" size="sm" onClick={toggleDimMode} className="h-9 gap-1.5 text-xs">
                  <Moon className="h-3.5 w-3.5" />
                  {dimMode ? "Standard Dark" : "Dim Mode"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-base-border/80 bg-card">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-ink">Browser Notifications</h2>
                  <p className="text-xs text-ink-muted">
                    Receive daily alerts for due revisions and scheduled study sessions.
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={enableNotifications}
                disabled={notificationPermission === "granted" || notificationPermission === "unsupported" || notificationPermission === "denied"}
                className="h-9 text-xs gap-1.5"
              >
                {notificationPermission === "granted" ? <><CheckCircle2 className="h-3.5 w-3.5 text-signal-high" /> Active</> : notificationPermission === "unsupported" ? "Unavailable" : notificationPermission === "denied" ? "Blocked" : "Enable Alerts"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backup & Restore */}
        <Card className="border-base-border/80 bg-card">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-high/10 text-signal-high">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-ink">Data Backup & Export</h2>
                  <p className="text-xs text-ink-muted">
                    Export your complete database to JSON or restore from a snapshot file.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input ref={restoreInput} type="file" accept="application/json" onChange={importBackup} className="hidden" />
                <Button variant="outline" size="sm" onClick={() => restoreInput.current?.click()} disabled={working !== null} className="h-9 text-xs gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  {working === "import" ? "Restoring..." : "Import"}
                </Button>

                <Button size="sm" onClick={exportBackup} disabled={working !== null} className="h-9 text-xs gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  {working === "export" ? "Exporting..." : "Export JSON"}
                </Button>
              </div>
            </div>

            {(backupMessage || backupError) && (
              <p className={`rounded-xl border px-3.5 py-2.5 text-xs ${backupError ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-signal-high/30 bg-signal-high/10 text-signal-high"}`}>
                {backupError || backupMessage}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Security & Password */}
        <Card className="border-base-border/80 bg-card">
          <CardContent className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-3.5 pb-4 border-b border-base-border/70">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-ink">Change Password</h2>
                <p className="text-xs text-ink-muted">
                  Update your authentication credentials securely.
                </p>
              </div>
            </div>

            <form onSubmit={updatePassword} className="max-w-lg space-y-3.5">
              {passwordError && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
                  {passwordError}
                </p>
              )}
              {passwordMessage && (
                <p className="rounded-xl border border-signal-high/30 bg-signal-high/10 px-3.5 py-2.5 text-xs text-signal-high font-medium">
                  {passwordMessage}
                </p>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Current Password</label>
                <PasswordInput value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">New Password</label>
                <PasswordInput value={newPassword} onChange={setNewPassword} placeholder="At least 8 characters" autoComplete="new-password" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Confirm New Password</label>
                <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat new password" autoComplete="new-password" />
              </div>

              <Button type="submit" size="sm" className="mt-2 shadow-md shadow-accent/20">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-ink">Reset DevOS Workspace</h2>
                  <p className="text-xs text-ink-muted">
                    Clear local storage and reset all cached state on this device.
                  </p>
                </div>
              </div>

              <Button variant="destructive" size="sm" onClick={resetDevOS} disabled={working !== null} className="h-9 text-xs">
                {working === "reset" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Everything
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
