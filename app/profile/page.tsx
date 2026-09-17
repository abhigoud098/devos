"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GraduationCap,
  Sparkles,
  Bot,
  Target,
  Bell,
  Lock,
  Trash2,
  Clock,
  BookOpen,
  Code2,
  Phone,
  Building,
  Calendar,
  Layers,
  Save,
  Check,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { PasswordInput } from "@/components/auth/password-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";

export const dynamic = "force-dynamic";

// Select Option Constants
const DEGREE_OPTIONS = [
  "B.Tech / B.E.",
  "BCA / MCA",
  "B.Sc / M.Sc Computer Science",
  "B.Sc / M.Sc IT",
  "Diploma in Engineering",
  "High School / Pre-University",
  "Self-Taught / Coding Bootcamp",
  "Other Degree",
];

const FIELD_OPTIONS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Artificial Intelligence & Machine Learning",
  "Data Science & Analytics",
  "Electronics & Communication",
  "Software Engineering",
  "Mechanical / Civil / Other",
];

const GRADUATION_YEARS = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

const SEMESTER_OPTIONS = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
  "Graduated",
];

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];

const LEARNING_GOALS = [
  "Placement Preparation",
  "DSA & Problem Solving",
  "Full-Stack Web Development",
  "Competitive Programming",
  "Semester Academics",
  "Interview Preparation",
  "General Learning & Projects",
];

const PROGRAMMING_LANGUAGES = [
  "Java",
  "C++",
  "Python",
  "JavaScript / TypeScript",
  "C",
  "Go",
  "Rust",
  "SQL",
];

const AI_DIFFICULTY_LEVELS = [
  { value: "Beginner", label: "Beginner (Fundamentals & Step-by-Step)" },
  { value: "Intermediate", label: "Intermediate (Standard Engineering Depth)" },
  { value: "Advanced", label: "Advanced (Optimizations & System Insights)" },
];

const AI_RESPONSE_STYLES = [
  { value: "Concise", label: "Concise (Direct answers & code snippets)" },
  { value: "Balanced", label: "Balanced (Clear explanation + code examples)" },
  { value: "Detailed", label: "Detailed (In-depth theoretical breakdown)" },
];

const REMINDER_INTERVAL_OPTIONS = [
  { value: 10, label: "10 minutes before task" },
  { value: 15, label: "15 minutes before task" },
  { value: 30, label: "30 minutes before task" },
  { value: 60, label: "1 hour before task" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Page Load state
  const [initialLoading, setInitialLoading] = useState(true);

  // 1. Personal Information State
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [personalSaving, setPersonalSaving] = useState(false);
  const [personalMsg, setPersonalMsg] = useState("");
  const [personalError, setPersonalError] = useState("");

  // 2. Academic / Learning Profile State
  const [education, setEducation] = useState("B.Tech / B.E.");
  const [fieldOfStudy, setFieldOfStudy] = useState("Computer Science & Engineering");
  const [institution, setInstitution] = useState("");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [currentSemester, setCurrentSemester] = useState("6th Semester");
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [primaryGoal, setPrimaryGoal] = useState("Placement Preparation");

  const [academicSaving, setAcademicSaving] = useState(false);
  const [academicMsg, setAcademicMsg] = useState("");
  const [academicError, setAcademicError] = useState("");

  // 3. AI Preferences State
  const [aiLanguage, setAiLanguage] = useState("JavaScript / TypeScript");
  const [aiDifficulty, setAiDifficulty] = useState("Intermediate");
  const [aiResponseStyle, setAiResponseStyle] = useState("Balanced");
  const [aiRecommendationsEnabled, setAiRecommendationsEnabled] = useState(true);

  const [aiSaving, setAiSaving] = useState(false);
  const [aiMsg, setAiMsg] = useState("");
  const [aiError, setAiError] = useState("");

  // 4. Learning Targets & Study Preferences State
  const [dailyStudyTargetHours, setDailyStudyTargetHours] = useState(2);
  const [preferredStudyDurationMinutes, setPreferredStudyDurationMinutes] = useState(45);
  const [preferredTopics, setPreferredTopics] = useState("DSA, System Design, Full-Stack");

  const [targetsSaving, setTargetsSaving] = useState(false);
  const [targetsMsg, setTargetsMsg] = useState("");
  const [targetsError, setTargetsError] = useState("");

  // 5. Email Notification Settings State
  const [notificationEmail, setNotificationEmail] = useState("");
  const [dailyLearningEmailEnabled, setDailyLearningEmailEnabled] = useState(false);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(10);

  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const [emailError, setEmailError] = useState("");

  // 6. Security / Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityMsg, setSecurityMsg] = useState("");
  const [securityError, setSecurityError] = useState("");

  // 7. Delete Account Dialog State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Load Profile and Preferences on Mount
  const loadProfile = useCallback(async () => {
    try {
      setInitialLoading(true);
      const res = await api.auth.getProfile();

      if (res.data) {
        const u = res.data.user;
        const p = res.data.preferences;

        if (u) {
          setFullName(u.name || "");
          setUsername(u.username || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setCreatedAt(u.createdAt ? new Date(u.createdAt).toISOString() : null);
        }

        if (p) {
          if (p.education) setEducation(p.education);
          if (p.fieldOfStudy) setFieldOfStudy(p.fieldOfStudy);
          if (p.institution) setInstitution(p.institution);
          if (p.graduationYear) setGraduationYear(p.graduationYear);
          if (p.currentSemester) setCurrentSemester(p.currentSemester);
          if (p.skillLevel) setSkillLevel(p.skillLevel);
          if (p.primaryGoal) setPrimaryGoal(p.primaryGoal);

          if (p.aiLanguage) setAiLanguage(p.aiLanguage);
          if (p.aiDifficulty) setAiDifficulty(p.aiDifficulty);
          if (p.aiResponseStyle) setAiResponseStyle(p.aiResponseStyle);
          if (p.aiRecommendationsEnabled !== undefined) {
            setAiRecommendationsEnabled(p.aiRecommendationsEnabled);
          }

          if (p.dailyStudyTargetHours) setDailyStudyTargetHours(p.dailyStudyTargetHours);
          if (p.preferredStudyDurationMinutes) {
            setPreferredStudyDurationMinutes(p.preferredStudyDurationMinutes);
          }
          if (p.preferredTopics) setPreferredTopics(p.preferredTopics);

          if (p.learningNotificationEmail) setNotificationEmail(p.learningNotificationEmail);
          if (p.dailyLearningEmailEnabled !== undefined) {
            setDailyLearningEmailEnabled(p.dailyLearningEmailEnabled);
          }
          if (p.reminderMinutesBefore) setReminderMinutesBefore(p.reminderMinutesBefore);
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Form Initial Avatar Fallback
  const initials = (fullName || user?.name || "User")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formattedMemberDate = createdAt
    ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(createdAt))
    : "Active Member";

  // Section 1: Save Personal Information
  async function handleSavePersonal(e: FormEvent) {
    e.preventDefault();
    setPersonalMsg("");
    setPersonalError("");

    const cleanName = fullName.trim();
    if (cleanName.length < 2) {
      setPersonalError("Please enter your full name (minimum 2 characters).");
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername && !/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      setPersonalError("Username must be 3-30 characters long and contain only letters, numbers, and underscores.");
      return;
    }

    setPersonalSaving(true);
    try {
      const res = await api.auth.updateProfile({
        name: cleanName,
        username: cleanUsername || "",
        phone: phone.trim(),
      });

      if (res.data?.success) {
        setPersonalMsg("Personal information updated successfully.");
        setTimeout(() => setPersonalMsg(""), 4000);
      } else {
        setPersonalError(res.error || "Unable to update personal information.");
      }
    } catch {
      setPersonalError("Network error. Please try again.");
    } finally {
      setPersonalSaving(false);
    }
  }

  // Section 2: Save Academic Profile
  async function handleSaveAcademic(e: FormEvent) {
    e.preventDefault();
    setAcademicMsg("");
    setAcademicError("");

    setAcademicSaving(true);
    try {
      const res = await api.auth.updateProfile({
        education,
        fieldOfStudy,
        institution: institution.trim(),
        graduationYear,
        currentSemester,
        skillLevel,
        primaryGoal,
      });

      if (res.data?.success) {
        setAcademicMsg("Academic profile saved successfully.");
        setTimeout(() => setAcademicMsg(""), 4000);
      } else {
        setAcademicError(res.error || "Unable to save academic profile.");
      }
    } catch {
      setAcademicError("Network error. Please try again.");
    } finally {
      setAcademicSaving(false);
    }
  }

  // Section 3: Save AI Preferences
  async function handleSaveAiPreferences(e: FormEvent) {
    e.preventDefault();
    setAiMsg("");
    setAiError("");

    setAiSaving(true);
    try {
      const res = await api.auth.updateProfile({
        aiLanguage,
        aiDifficulty,
        aiResponseStyle,
        aiRecommendationsEnabled,
      });

      if (res.data?.success) {
        setAiMsg("AI assistant preferences updated.");
        setTimeout(() => setAiMsg(""), 4000);
      } else {
        setAiError(res.error || "Unable to update AI preferences.");
      }
    } catch {
      setAiError("Network error. Please try again.");
    } finally {
      setAiSaving(false);
    }
  }

  // Section 4: Save Learning Targets
  async function handleSaveTargets(e: FormEvent) {
    e.preventDefault();
    setTargetsMsg("");
    setTargetsError("");

    if (dailyStudyTargetHours < 0.5 || dailyStudyTargetHours > 24) {
      setTargetsError("Daily study target must be between 0.5 and 24 hours.");
      return;
    }

    if (preferredStudyDurationMinutes < 5 || preferredStudyDurationMinutes > 240) {
      setTargetsError("Preferred session duration must be between 5 and 240 minutes.");
      return;
    }

    setTargetsSaving(true);
    try {
      const res = await api.auth.updateProfile({
        dailyStudyTargetHours: Number(dailyStudyTargetHours),
        preferredStudyDurationMinutes: Number(preferredStudyDurationMinutes),
        preferredTopics: preferredTopics.trim(),
      });

      if (res.data?.success) {
        setTargetsMsg("Learning targets and study preferences updated.");
        setTimeout(() => setTargetsMsg(""), 4000);
      } else {
        setTargetsError(res.error || "Unable to update study targets.");
      }
    } catch {
      setTargetsError("Network error. Please try again.");
    } finally {
      setTargetsSaving(false);
    }
  }

  // Section 5: Save Email Notification Settings
  async function handleSaveEmailSettings(e: FormEvent) {
    e.preventDefault();
    setEmailMsg("");
    setEmailError("");

    const cleanEmail = notificationEmail.trim();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (dailyLearningEmailEnabled && !cleanEmail) {
      setEmailError("Please provide a notification email before enabling daily reminders.");
      return;
    }

    setEmailSaving(true);
    try {
      const res = await api.settings.updateEmailSettings({
        email: cleanEmail,
        enabled: dailyLearningEmailEnabled,
        reminderMinutes: reminderMinutesBefore,
      });

      if (res.data?.success) {
        setEmailMsg("Email reminder settings saved successfully.");
        setTimeout(() => setEmailMsg(""), 4000);
      } else {
        setEmailError(res.error || "Unable to save email settings.");
      }
    } catch {
      setEmailError("Network error. Please try again.");
    } finally {
      setEmailSaving(false);
    }
  }

  // Section 6: Change Password
  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setSecurityMsg("");
    setSecurityError("");

    if (newPassword.length < 8) {
      setSecurityError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError("New passwords do not match.");
      return;
    }

    setSecuritySaving(true);
    try {
      const res = await api.auth.changePassword(currentPassword, newPassword);

      if (res.data?.success) {
        setSecurityMsg("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSecurityMsg(""), 5000);
      } else {
        setSecurityError(res.error || "Current password is incorrect.");
      }
    } catch {
      setSecurityError("Network error. Please try again.");
    } finally {
      setSecuritySaving(false);
    }
  }

  // Section 7: Delete Account Handler
  async function handleDeleteAccount(e: FormEvent) {
    e.preventDefault();
    setDeleteError("");

    if (!deletePassword) {
      setDeleteError("Please enter your account password to confirm deletion.");
      return;
    }

    if (deleteConfirmationText !== "DELETE") {
      setDeleteError('Please type "DELETE" in all capital letters to confirm.');
      return;
    }

    setDeleteSaving(true);
    try {
      const res = await api.auth.deleteAccount(deletePassword);

      if (res.data?.success) {
        setDeleteModalOpen(false);
        logout();
        router.replace("/signup");
      } else {
        setDeleteError(res.error || "Failed to delete account. Please verify your password.");
      }
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleteSaving(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-xs text-ink-muted">Loading profile and preferences...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. PAGE HEADER */}
      <PageHeader
        kicker="Account & Settings"
        title="Profile"
        description="Manage your account identity, academic specialization, AI assistant behavior, and notification preferences."
      />

      {/* 2. PROFILE HEADER CARD (CLEAN & COMPACT SAAS DESIGN) */}
      <Card className="border-base-border bg-card shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Clean Initials Avatar */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent text-white font-bold text-lg select-none ring-2 ring-base-border">
                {initials}
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-ink truncate">
                    {fullName || user?.name || "User"}
                  </h2>
                  {username && (
                    <span className="rounded bg-base-raised px-2 py-0.5 text-xs font-mono text-ink-muted border border-base-border">
                      @{username}
                    </span>
                  )}
                </div>

                <p className="text-xs text-ink-muted truncate">
                  {email || user?.email || "user@devos.local"}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <Badge className="bg-signal-high/10 text-signal-high border border-signal-high/20 text-[10.5px] py-0 px-2 font-medium">
                    <Check className="h-3 w-3" />
                    <span>Verified Account</span>
                  </Badge>
                  <span className="text-[11px] text-ink-muted">
                    Joined {formattedMemberDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center">
              <Badge className="bg-accent/10 text-accent border border-accent/20 text-xs px-2.5 py-1">
                Student Productivity Pro
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. PERSONAL INFORMATION SECTION */}
      <Card className="border-base-border bg-card shadow-sm">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-base-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <UserRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Personal Information</h3>
              <p className="text-xs text-ink-muted">
                Manage your public name, unique handle, and registered contact information.
              </p>
            </div>
          </div>

          {personalError && (
            <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{personalError}</span>
            </div>
          )}

          {personalMsg && (
            <div role="status" className="flex items-center gap-2 rounded-lg border border-signal-high/30 bg-signal-high/10 px-3.5 py-2.5 text-xs text-signal-high">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{personalMsg}</span>
            </div>
          )}

          <form onSubmit={handleSavePersonal} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <Input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Your Name"
                  className="h-9 text-xs"
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink flex items-center justify-between">
                  <span>Username</span>
                  <span className="text-[11px] text-ink-muted">Optional handle</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-ink-muted font-mono select-none">@</span>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="username"
                    className="h-9 pl-7 text-xs font-mono"
                    maxLength={30}
                  />
                </div>
              </div>

              {/* Email Address (Read-only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10.5px] text-ink-muted bg-base-raised px-1.5 py-0.5 rounded">Primary Account</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted/50" />
                  <Input
                    type="email"
                    value={email}
                    disabled
                    className="h-9 pl-9 text-xs bg-base-raised/50 cursor-not-allowed text-ink-muted"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted/50" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-9 pl-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                size="sm"
                disabled={personalSaving}
                className="h-8 text-xs font-medium gap-1.5 px-4"
              >
                {personalSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Personal Info</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 4. ACADEMIC / LEARNING PROFILE SECTION */}
      <Card className="border-base-border bg-card shadow-sm">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-base-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Learning & Academic Profile</h3>
              <p className="text-xs text-ink-muted">
                Specify your educational background and primary target milestones.
              </p>
            </div>
          </div>

          {academicError && (
            <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{academicError}</span>
            </div>
          )}

          {academicMsg && (
            <div role="status" className="flex items-center gap-2 rounded-lg border border-signal-high/30 bg-signal-high/10 px-3.5 py-2.5 text-xs text-signal-high">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{academicMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveAcademic} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Degree / Education */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Degree / Education Level</label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full h-9 rounded-lg border border-base-border bg-base-subtle px-3 text-xs text-ink focus:border-accent focus:outline-none"
                >
                  {DEGREE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field of Study */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Branch / Field of Study</label>
                <select
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  className="w-full h-9 rounded-lg border border-base-border bg-base-subtle px-3 text-xs text-ink focus:border-accent focus:outline-none"
                >
                  {FIELD_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* College / Institution */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">College / Institution</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted/50" />
                  <Input
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Indian Institute of Technology / University"
                    className="h-9 pl-9 text-xs"
                  />
                </div>
              </div>

              {/* Graduation Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Graduation Year</label>
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full h-9 rounded-lg border border-base-border bg-base-subtle px-3 text-xs text-ink focus:border-accent focus:outline-none"
                >
                  {GRADUATION_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Semester */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Current Semester / Status</label>
                <select
                  value={currentSemester}
                  onChange={(e) => setCurrentSemester(e.target.value)}
                  className="w-full h-9 rounded-lg border border-base-border bg-base-subtle px-3 text-xs text-ink focus:border-accent focus:outline-none"
                >
                  {SEMESTER_OPTIONS.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Skill Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Current Skill Level</label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full h-9 rounded-lg border border-base-border bg-base-subtle px-3 text-xs text-ink focus:border-accent focus:outline-none"
                >
                  {SKILL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Learning Goal (Full Width) */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-ink">Primary Learning Goal</label>
                <select
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  className="w-full h-9 rounded-lg border border-base-border bg-base-subtle px-3 text-xs text-ink focus:border-accent focus:outline-none"
                >
                  {LEARNING_GOALS.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                size="sm"
                disabled={academicSaving}
                className="h-8 text-xs font-medium gap-1.5 px-4"
              >
                {academicSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Learning Profile</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 5. AI PREFERENCES SECTION */}
      <Card className="border-base-border bg-card shadow-sm">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-base-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">AI Assistant Preferences</h3>
              <p className="text-xs text-ink-muted">
                Configure how the DevOS AI tutor tailors its coding breakdowns and explanations.
              </p>
            </div>
          </div>

          {aiError && (
            <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {aiMsg && (
            <div role="status" className="flex items-center gap-2 rounded-lg border border-signal-high/30 bg-signal-high/10 px-3.5 py-2.5 text-xs text-signal-high">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{aiMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveAiPreferences} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Preferred Programming Language */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Preferred Programming Language</label>
                <select
                  value={aiLanguage}
                  onChange={(e) => setAiLanguage(e.target.value)}
                  className="w-full h-9 rounded-lg border border-base-border bg-base-subtle px-3 text-xs text-ink focus:border-accent focus:outline-none"
                >
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Explanation Depth & Difficulty</label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value)}
                  className="w-full h-9 rounded-lg border border-base-border bg-base-subtle px-3 text-xs text-ink focus:border-accent focus:outline-none"
                >
                  {AI_DIFFICULTY_LEVELS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Response Style */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-ink">Response Formatting Style</label>
                <select
                  value={aiResponseStyle}
                  onChange={(e) => setAiResponseStyle(e.target.value)}
                  className="w-full h-9 rounded-lg border border-base-border bg-base-subtle px-3 text-xs text-ink focus:border-accent focus:outline-none"
                >
                  {AI_RESPONSE_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* AI Study Recommendations Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-base-border bg-base-raised/40">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-ink dark:text-zinc-100">Personalized AI Study Recommendations</p>
                <p className="text-[11px] text-ink-muted dark:text-zinc-300">
                  Allow AI Assistant to analyze your active topics and suggest relevant practice problems.
                </p>
              </div>
              <Button
                type="button"
                variant={aiRecommendationsEnabled ? "primary" : "outline"}
                size="sm"
                onClick={() => setAiRecommendationsEnabled(!aiRecommendationsEnabled)}
                className="h-8 text-xs font-medium px-3 shrink-0"
              >
                {aiRecommendationsEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                size="sm"
                disabled={aiSaving}
                className="h-8 text-xs font-medium gap-1.5 px-4"
              >
                {aiSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save AI Preferences</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 6. LEARNING TARGETS & STUDY PREFERENCES SECTION */}
      <Card className="border-base-border bg-card shadow-sm">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-base-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Learning Goals & Targets</h3>
              <p className="text-xs text-ink-muted">
                Define your daily focus targets and preferred study session durations.
              </p>
            </div>
          </div>

          {targetsError && (
            <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{targetsError}</span>
            </div>
          )}

          {targetsMsg && (
            <div role="status" className="flex items-center gap-2 rounded-lg border border-signal-high/30 bg-signal-high/10 px-3.5 py-2.5 text-xs text-signal-high">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{targetsMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveTargets} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Daily Study Target */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Daily Study Target</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={dailyStudyTargetHours}
                    onChange={(e) => setDailyStudyTargetHours(Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                  <span className="text-xs text-ink-muted shrink-0 font-medium">hours / day</span>
                </div>
              </div>

              {/* Preferred Session Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Preferred Session Duration</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="5"
                    max="240"
                    step="5"
                    value={preferredStudyDurationMinutes}
                    onChange={(e) => setPreferredStudyDurationMinutes(Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                  <span className="text-xs text-ink-muted shrink-0 font-medium">minutes / session</span>
                </div>
              </div>

              {/* Preferred Study Topics */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-ink">Focus Topics & Core Technologies</label>
                <Input
                  value={preferredTopics}
                  onChange={(e) => setPreferredTopics(e.target.value)}
                  placeholder="e.g. DSA, Dynamic Programming, System Design, React, Node.js"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                size="sm"
                disabled={targetsSaving}
                className="h-8 text-xs font-medium gap-1.5 px-4"
              >
                {targetsSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Learning Targets</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 7. EMAIL NOTIFICATION SETTINGS SECTION */}
      <Card className="border-base-border bg-card shadow-sm">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-base-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Email Notifications</h3>
              <p className="text-xs text-ink-muted">
                Receive automated reminders before your scheduled study tasks directly in your inbox.
              </p>
            </div>
          </div>

          {emailError && (
            <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{emailError}</span>
            </div>
          )}

          {emailMsg && (
            <div role="status" className="flex items-center gap-2 rounded-lg border border-signal-high/30 bg-signal-high/10 px-3.5 py-2.5 text-xs text-signal-high">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{emailMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveEmailSettings} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Notification Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">
                  Notification Recipient Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted/50" />
                  <Input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="student.notifications@gmail.com"
                    className="h-9 pl-9 text-xs"
                  />
                </div>
              </div>

              {/* Reminder Timing */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Reminder Dispatch Timing</label>
                <select
                  value={reminderMinutesBefore}
                  onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                  className="w-full h-9 rounded-lg border border-base-border bg-base-subtle px-3 text-xs text-ink focus:border-accent focus:outline-none"
                >
                  {REMINDER_INTERVAL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Daily Reminders Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-base-border bg-base-raised/40">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-ink">Daily Learning Task Email Reminders</p>
                <p className="text-[11px] text-ink-muted">
                  Automatically sends reminders for tasks scheduled for today with assigned study times.
                </p>
              </div>
              <Button
                type="button"
                variant={dailyLearningEmailEnabled ? "primary" : "outline"}
                size="sm"
                onClick={() => setDailyLearningEmailEnabled(!dailyLearningEmailEnabled)}
                className="h-8 text-xs font-medium px-4 shrink-0"
              >
                {dailyLearningEmailEnabled ? "ON" : "OFF"}
              </Button>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                size="sm"
                disabled={emailSaving}
                className="h-8 text-xs font-medium gap-1.5 px-4"
              >
                {emailSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Email Settings</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 8. ACCOUNT & SECURITY SECTION */}
      <Card className="border-base-border bg-card shadow-sm">
        <CardContent className="p-5 sm:p-6 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-base-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Account & Security</h3>
              <p className="text-xs text-ink-muted">
                Update your login password and manage active workspace access.
              </p>
            </div>
          </div>

          {securityError && (
            <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{securityError}</span>
            </div>
          )}

          {securityMsg && (
            <div role="status" className="flex items-center gap-2 rounded-lg border border-signal-high/30 bg-signal-high/10 px-3.5 py-2.5 text-xs text-signal-high">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{securityMsg}</span>
            </div>
          )}

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Current Password</label>
              <PasswordInput
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">New Password</label>
              <PasswordInput
                value={newPassword}
                onChange={setNewPassword}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Confirm New Password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={securitySaving || !currentPassword || !newPassword}
              className="h-8 text-xs font-medium gap-1.5 px-4"
            >
              {securitySaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </Button>
          </form>

          {/* Danger Zone: Account Deletion */}
          <div className="border-t border-red-500/20 pt-5 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <h4 className="text-xs font-bold">Delete DevOS Account</h4>
                </div>
                <p className="text-[11px] text-ink-muted">
                  Permanently delete your profile, curriculum topics, revision schedules, and custom settings. This action cannot be undone.
                </p>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteModalOpen(true)}
                className="h-8 text-xs shrink-0 font-medium px-3"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 9. ACCESSIBLE DELETE ACCOUNT CONFIRMATION DIALOG */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2.5 text-red-400 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
                <Trash2 className="h-5 w-5" />
              </div>
              <DialogTitle className="text-base text-ink">Delete Account Confirmation</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs text-ink-muted">
            <p>
              You are about to permanently delete your DevOS account (<span className="text-ink font-semibold">{email}</span>).
            </p>
            <p className="text-red-400 font-medium">
              This action is destructive and irreversible. All your topics, DSA records, and notes will be permanently removed.
            </p>
          </div>

          {deleteError && (
            <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">
                Enter your password to authorize deletion
              </label>
              <PasswordInput
                value={deletePassword}
                onChange={setDeletePassword}
                placeholder="Your account password"
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">
                Type <span className="font-mono text-red-400 font-bold">DELETE</span> to confirm
              </label>
              <Input
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-base-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleteSaving}
                className="h-8 text-xs font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={deleteSaving || deleteConfirmationText !== "DELETE" || !deletePassword}
                className="h-8 text-xs font-medium gap-1.5"
              >
                {deleteSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Permanently Delete</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
