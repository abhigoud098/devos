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
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
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

  function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");
    if (newPassword.length < 8) return setPasswordError("Your new password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setPasswordError("New passwords do not match.");
    const result = changePassword(currentPassword, newPassword);
    if (!result.success) return setPasswordError(result.error ?? "Unable to change your password.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password changed successfully.");
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-8">
      {/* Header */}

      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-ink-faint">
          Preferences
        </p>

        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink">
          Settings
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">
          Customize DevOS, manage your local data, browser notifications, and
          personalize your workspace. Everything stays on your device.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}

        <Card className="border-base-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="rounded-xl bg-base-elevated p-3">
                  <Palette className="h-5 w-5 text-accent" />
                </div>

                <div>
                  <h2 className="font-medium text-ink">Appearance</h2>

                  <p className="mt-1 text-sm text-ink-muted">
                    Customize how DevOS looks on your desktop.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={toggleTheme}>
                  {theme === "dark" ? <><Sun className="mr-2 h-4 w-4" /> Light mode</> : <><Moon className="mr-2 h-4 w-4" /> Dark mode</>}
                </Button>

                <Button variant="outline" onClick={toggleDimMode}>
                  <Moon className="mr-2 h-4 w-4" />
                  {dimMode ? "Standard dark" : "Use dim mode"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}

        <Card className="border-base-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="rounded-xl bg-base-elevated p-3">
                  <Bell className="h-5 w-5 text-amber-400" />
                </div>

                <div>
                  <h2 className="font-medium text-ink">
                    Browser Notifications
                  </h2>

                  <p className="mt-1 text-sm text-ink-muted">
                    Get reminded about today's revisions, study goals and
                    learning streak.
                  </p>
                </div>
              </div>

              <Button onClick={enableNotifications} disabled={notificationPermission === "granted" || notificationPermission === "unsupported" || notificationPermission === "denied"}>
                {notificationPermission === "granted" ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Enabled</> : notificationPermission === "unsupported" ? "Unavailable" : notificationPermission === "denied" ? "Blocked in browser" : "Enable"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backup */}

        <Card className="border-base-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="rounded-xl bg-base-elevated p-3">
                  <Database className="h-5 w-5 text-emerald-400" />
                </div>

                <div>
                  <h2 className="font-medium text-ink">Backup & Restore</h2>

                  <p className="mt-1 text-sm text-ink-muted">
                    Export your complete learning database as JSON or restore it
                    anytime.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input ref={restoreInput} type="file" accept="application/json" onChange={importBackup} className="hidden" />
                <Button variant="outline" onClick={() => restoreInput.current?.click()} disabled={working !== null}>
                  <Upload className="mr-2 h-4 w-4" />
                  {working === "import" ? "Importing…" : "Import"}
                </Button>

                <Button onClick={exportBackup} disabled={working !== null}>
                  <Download className="mr-2 h-4 w-4" />
                  {working === "export" ? "Exporting…" : "Export"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {(backupMessage || backupError) && <p role="status" className={`rounded-lg border px-3 py-2 text-sm ${backupError ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"}`}>{backupError || backupMessage}</p>}

        {/* Storage */}

        <Card className="border-base-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="rounded-xl bg-base-elevated p-3">
                  <HardDrive className="h-5 w-5 text-cyan-400" />
                </div>

                <div>
                  <h2 className="font-medium text-ink">Local Storage</h2>

                  <p className="mt-1 text-sm text-ink-muted">
                    All your notes, topics, revisions and projects are stored
                    securely inside your browser using IndexedDB.
                  </p>
                </div>
              </div>

              <span className="mt-2 rounded-full border border-base-border bg-base-elevated px-3 py-1 text-xs font-medium text-ink-muted">{storageUsed} used</span>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}

        <Card className="border-base-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="rounded-xl bg-base-elevated p-3">
                  <Shield className="h-5 w-5 text-sky-400" />
                </div>

                <div>
                  <h2 className="font-medium text-ink">Privacy</h2>

                  <p className="mt-1 text-sm text-ink-muted">
                    DevOS works completely offline. No backend. No cloud. No
                    account. Your data never leaves your computer.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password */}

        <Card className="border-base-border bg-card">
          <CardContent className="p-6">
            <div className="mb-6 flex gap-4">
              <div className="rounded-xl bg-base-elevated p-3">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="font-medium text-ink">Change password</h2>
                <p className="mt-1 text-sm text-ink-muted">Update the password saved locally for this account.</p>
              </div>
            </div>
            <form onSubmit={updatePassword} className="max-w-lg space-y-4">
              {passwordError && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{passwordError}</p>}
              {passwordMessage && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">{passwordMessage}</p>}
              <label className="block space-y-2 text-sm text-ink-muted">Current password<PasswordInput value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" /></label>
              <label className="block space-y-2 text-sm text-ink-muted">New password<PasswordInput value={newPassword} onChange={setNewPassword} placeholder="At least 8 characters" autoComplete="new-password" /></label>
              <label className="block space-y-2 text-sm text-ink-muted">Confirm new password<PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat your new password" autoComplete="new-password" /></label>
              <Button type="submit">Update password</Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger */}

        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="rounded-xl bg-red-500/10 p-3">
                  <Trash2 className="h-5 w-5 text-red-400" />
                </div>

                <div>
                  <h2 className="font-medium text-ink">Reset DevOS</h2>

                  <p className="mt-1 text-sm text-ink-muted">
                    Permanently delete all local data including learning topics,
                    revisions, notes, projects and analytics.
                  </p>
                </div>
              </div>

              <Button variant="destructive" onClick={resetDevOS} disabled={working !== null}>
                {working === "reset" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Reset Everything
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
