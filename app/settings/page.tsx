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
  Mail,
  Send,
  KeyRound,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api-client";
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
  const { user, changePassword, logout } = useAuth();
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
  const [notificationEmail, setNotificationEmail] = useState("");
  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(10);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState("");
  const [emailStatusType, setEmailStatusType] = useState<"success" | "error" | "">("");

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  useEffect(() => {
    // Load email reminder settings
    api.settings.getEmailSettings().then((res) => {
      if (res.data) {
        setNotificationEmail(res.data.email || "");
        setEmailRemindersEnabled(res.data.enabled || false);
        setReminderMinutes(res.data.reminderMinutes || 10);
      }
    });
  }, []);

  useEffect(() => {
    if (user?.email && !forgotEmail) {
      setForgotEmail(user.email);
    }
  }, [user, forgotEmail]);

  async function handleSaveEmail(e?: FormEvent) {
    if (e) e.preventDefault();
    setEmailSaving(true);
    setEmailStatusMsg("");
    setEmailStatusType("");

    const trimmed = notificationEmail.trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailStatusMsg("Please enter a valid email address.");
      setEmailStatusType("error");
      setEmailSaving(false);
      return;
    }

    try {
      const res = await api.settings.updateEmailSettings({
        email: trimmed,
        enabled: trimmed ? emailRemindersEnabled : false,
      });

      if (res.data?.success) {
        // Keep the saved email directly inside the input
        setNotificationEmail(res.data.email || trimmed);
        setEmailStatusMsg(res.data.message || "Notification email saved successfully.");
        setEmailStatusType("success");
        if (!trimmed) {
          setEmailRemindersEnabled(false);
        }
      } else {
        setEmailStatusMsg(res.error || "Failed to save email settings.");
        setEmailStatusType("error");
      }
    } catch {
      setEmailStatusMsg("Network error. Please try again.");
      setEmailStatusType("error");
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleSendResetLink(e: FormEvent) {
    e.preventDefault();
    setForgotSending(true);
    setForgotMessage("");
    setForgotError("");

    const trimmed = forgotEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setForgotError("Please enter a valid email address.");
      setForgotSending(false);
      return;
    }

    try {
      const res = await api.auth.forgotPassword(trimmed);
      if (res.data?.success) {
        setForgotMessage(res.data.message || "If the email is registered, a password reset link has been sent.");
      } else {
        setForgotError(res.error || "Unable to send password reset email. Please try again.");
      }
    } catch {
      setForgotError("Network error. Please try again.");
    } finally {
      setForgotSending(false);
    }
  }

  async function handleToggleReminders() {
    const nextEnabled = !emailRemindersEnabled;
    setEmailStatusMsg("");
    setEmailStatusType("");

    if (nextEnabled && (!notificationEmail || !notificationEmail.trim())) {
      setEmailStatusMsg("Please add a notification email first.");
      setEmailStatusType("error");
      return;
    }

    setEmailSaving(true);
    try {
      const res = await api.settings.updateEmailSettings({
        enabled: nextEnabled,
      });

      if (res.data?.success) {
        setEmailRemindersEnabled(nextEnabled);
        setEmailStatusMsg(
          nextEnabled
            ? "Automatic study task reminders are now active."
            : "Automatic study task reminders have been disabled.",
        );
        setEmailStatusType("success");
      } else {
        setEmailStatusMsg(res.error || "Failed to update reminder settings.");
        setEmailStatusType("error");
      }
    } catch {
      setEmailStatusMsg("Network error. Please try again.");
      setEmailStatusType("error");
    } finally {
      setEmailSaving(false);
    }
  }

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
                    Switch between Light and Dark interface themes.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleTheme} className="h-9 gap-1.5 text-xs">
                  {theme === "dark" ? <><Sun className="h-3.5 w-3.5" /> Light</> : <><Moon className="h-3.5 w-3.5" /> Dark</>}
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

        {/* Email Notifications */}
        <Card className="border-base-border/80 bg-card">
          <CardContent className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-ink">Email Notifications</h2>
                <p className="text-xs text-ink-muted">
                  Receive automatic reminders before your scheduled learning tasks.
                </p>
              </div>
            </div>

            {/* Notification Email Input */}
            <form onSubmit={handleSaveEmail} className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-ink-muted">
                Notification Email
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-lg border border-base-border bg-base-subtle/50 px-3.5 py-2 text-xs text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={emailSaving}
                  className="h-9 text-xs gap-1.5 shrink-0"
                >
                  {emailSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Email"
                  )}
                </Button>
              </div>
            </form>

            <div className="border-t border-base-border/50 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-xs text-ink">Daily Learning Task Reminders</h3>
                  <span className="rounded bg-accent/10 text-accent font-medium px-2 py-0.5 text-[10px]">
                    10 minutes before
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  {emailRemindersEnabled
                    ? "Reminders are enabled."
                    : notificationEmail
                    ? "Reminders are disabled."
                    : "Add a notification email to enable reminders."}
                </p>
              </div>

              <Button
                variant={emailRemindersEnabled ? "primary" : "outline"}
                size="sm"
                onClick={handleToggleReminders}
                disabled={emailSaving}
                className="h-8 text-xs font-medium px-4 shrink-0"
              >
                {emailRemindersEnabled ? "ON" : "OFF"}
              </Button>
            </div>

            {emailStatusMsg && (
              <p
                className={`rounded-xl border px-3.5 py-2.5 text-xs ${
                  emailStatusType === "error"
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-signal-high/30 bg-signal-high/10 text-signal-high"
                }`}
              >
                {emailStatusMsg}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Forgot Password */}
        <Card className="border-base-border/80 bg-card">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-ink">Forgot Password</h2>
                <p className="text-xs text-ink-muted">
                  Reset your DevOS account password using your registered email address.
                </p>
              </div>
            </div>

            <form onSubmit={handleSendResetLink} className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-muted">
                  Email Address
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="flex-1 rounded-lg border border-base-border bg-base-subtle/50 px-3.5 py-2 text-xs text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none"
                    required
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={forgotSending}
                    className="h-9 text-xs gap-1.5 shrink-0 font-medium"
                  >
                    {forgotSending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Sending Link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {(forgotMessage || forgotError) && (
              <p
                className={`rounded-xl border px-3.5 py-2.5 text-xs ${
                  forgotError
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-signal-high/30 bg-signal-high/10 text-signal-high"
                }`}
              >
                {forgotError || forgotMessage}
              </p>
            )}
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
