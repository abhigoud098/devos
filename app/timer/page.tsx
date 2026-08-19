"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  History,
  Clock3,
  Target,
  Moon,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type SessionType = "focus" | "short-break" | "long-break";

type Session = {
  id: string | number;
  type: SessionType;
  duration: number;
  completedAt: string;
};

const TIMER_PRESETS = {
  focus: [25, 45, 60],
  "short-break": [5, 10],
  "long-break": [15, 20],
};

function removeDuplicateSessions(sessionHistory: Session[]) {
  const seen = new Set<string>();

  return sessionHistory.filter((session) => {
    const completedSecond = Math.floor(
      new Date(session.completedAt).getTime() / 1000,
    );
    const key = `${session.type}-${session.duration}-${completedSecond}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function StudyTimerPage() {
  const [mode, setMode] = useState<SessionType>("focus");
  const [minutes, setMinutes] = useState(25);
  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  const completionInProgress = useRef(false);

  useEffect(() => {
    async function load() {
      const savedSettings = localStorage.getItem("study-timer-settings");
      const savedSessions = localStorage.getItem("study-session-history");

      if (savedSettings) {
        try {
          const data = JSON.parse(savedSettings);
          setMode(data.mode ?? "focus");
          setMinutes(data.minutes ?? 25);
          setTime((data.minutes ?? 25) * 60);
        } catch (e) {}
      }

      if (savedSessions) {
        try {
          setSessions(removeDuplicateSessions(JSON.parse(savedSessions)));
        } catch (e) {}
      }

      const [sessionsRes, settingsRes] = await Promise.all([
        api.timer.getSessions(),
        api.timer.getSettings(),
      ]);

      if (sessionsRes.data?.sessions) {
        const formatted = sessionsRes.data.sessions.map((s: any) => ({
          id: s.id,
          type: s.type as SessionType,
          duration: s.duration,
          completedAt: new Date(s.completedAt).toISOString(),
        }));
        setSessions(removeDuplicateSessions(formatted));
        localStorage.setItem("study-session-history", JSON.stringify(formatted));
      }

      if (settingsRes.data?.settings) {
        const s = settingsRes.data.settings;
        if (s.focusDuration && !savedSettings) {
          setMinutes(s.focusDuration);
          setTime(s.focusDuration * 60);
        }
      }

      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      "study-timer-settings",
      JSON.stringify({ mode, minutes }),
    );
  }, [mode, minutes, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("study-session-history", JSON.stringify(sessions));
  }, [sessions, loaded]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTime((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (!running || time !== 0 || completionInProgress.current) return;
    completionInProgress.current = true;
    completeSession();
    setTime(minutes * 60);
  }, [running, time, minutes]);

  async function completeSession() {
    setRunning(false);
    const completedAt = new Date().toISOString();

    const newSession: Session = {
      id: `temp-${Date.now()}`,
      type: mode,
      duration: minutes,
      completedAt,
    };

    setSessions((prev) => [newSession, ...prev]);

    api.timer.addSession(mode, minutes, completedAt).then((res) => {
      if (res.data?.session) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === newSession.id
              ? { ...s, id: res.data!.session.id }
              : s,
          ),
        );
      }
    });

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Session Complete 🎉", {
        body: `${minutes} minute ${mode.replace("-", " ")} finished.`,
      });
    }
  }

  function changeMinutes(value: number) {
    if (value <= 0) return;
    setMinutes(value);
    setTime(value * 60);
  }

  function switchMode(newMode: SessionType, duration: number) {
    setRunning(false);
    setMode(newMode);
    setMinutes(duration);
    setTime(duration * 60);
  }

  function resetTimer() {
    setRunning(false);
    setTime(minutes * 60);
  }

  function toggleTimer() {
    if (running) {
      setRunning(false);
      return;
    }
    completionInProgress.current = false;
    setRunning(true);
  }

  function formatTime() {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  const progress = useMemo(() => {
    return ((minutes * 60 - time) / (minutes * 60)) * 100;
  }, [minutes, time]);

  const totalFocusMinutes = useMemo(() => {
    return sessions
      .filter((s) => s.type === "focus")
      .reduce((sum, s) => sum + s.duration, 0);
  }, [sessions]);

  const totalBreakMinutes = useMemo(() => {
    return sessions
      .filter((s) => s.type !== "focus")
      .reduce((sum, s) => sum + s.duration, 0);
  }, [sessions]);

  const todaySessions = useMemo(() => {
    const today = new Date().toDateString();
    return sessions.filter(
      (s) => new Date(s.completedAt).toDateString() === today,
    ).length;
  }, [sessions]);

  const modeTitle =
    mode === "focus"
      ? "Deep Focus"
      : mode === "short-break"
        ? "Short Break"
        : "Long Break";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. STANDARDIZED PAGE HEADER */}
      <PageHeader
        kicker="Productivity Workspace"
        title="Study Timer"
        description="Maintain deep flow state with Pomodoro sessions, healthy breaks, and automated session tracking."
      />

      {/* 2. STATS */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Focus Time"
          value={`${totalFocusMinutes}m`}
          icon={Target}
          iconColor="text-accent bg-accent/10"
        />
        <StatCard
          title="Break Time"
          value={`${totalBreakMinutes}m`}
          icon={Coffee}
          iconColor="text-amber-500 bg-amber-500/10"
        />
        <StatCard
          title="Total Sessions"
          value={sessions.length}
          icon={Clock3}
          iconColor="text-blue-500 bg-blue-500/10"
        />
        <StatCard
          title="Today's Sessions"
          value={todaySessions}
          icon={History}
          iconColor="text-signal-high bg-signal-high/10"
        />
      </section>

      {/* 3. MAIN TIMER & HISTORY GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* TIMER COLUMN (7 cols) */}
        <div className="lg:col-span-7">
          <Card>
            <CardContent className="p-6 sm:p-8 flex flex-col items-center">
              {/* Mode Selection Tabs */}
              <div className="flex w-full max-w-sm rounded-xl border border-base-border bg-base-elevated/60 p-1">
                <button
                  onClick={() => switchMode("focus", 25)}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all",
                    mode === "focus"
                      ? "bg-card text-ink shadow-sm"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  Focus
                </button>
                <button
                  onClick={() => switchMode("short-break", 5)}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all",
                    mode === "short-break"
                      ? "bg-card text-ink shadow-sm"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  Short Break
                </button>
                <button
                  onClick={() => switchMode("long-break", 15)}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all",
                    mode === "long-break"
                      ? "bg-card text-ink shadow-sm"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  Long Break
                </button>
              </div>

              {/* Circular Timer Visual */}
              <div className="relative my-8 flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
                <svg className="-rotate-90 absolute h-full w-full" viewBox="0 0 220 220">
                  <circle
                    cx="110"
                    cy="110"
                    r="92"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-base-elevated"
                  />
                  <circle
                    cx="110"
                    cy="110"
                    r="92"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className={
                      mode === "focus"
                        ? "text-accent"
                        : mode === "short-break"
                          ? "text-amber-500"
                          : "text-blue-400"
                    }
                    strokeDasharray={578}
                    strokeDashoffset={578 - (progress / 100) * 578}
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                </svg>

                <div className="z-10 text-center space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    {modeTitle}
                  </span>
                  <p className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-ink">
                    {formatTime()}
                  </p>
                  <p className="text-xs font-medium text-ink-faint">
                    {Math.round(progress)}% completed
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  size="md"
                  className={cn(
                    "min-w-[150px] gap-2 h-11 text-sm shadow-md",
                    running ? "bg-amber-500 hover:bg-amber-600 text-white" : "shadow-accent/20",
                  )}
                  onClick={toggleTimer}
                >
                  {running ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause Session
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Focus
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  className="h-11 px-3.5 text-xs text-ink-muted hover:text-ink"
                  onClick={resetTimer}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* Presets & Custom Configuration */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-base-border/70 pt-6 w-full">
                <span className="text-xs font-medium text-ink-muted mr-1">Presets:</span>
                {TIMER_PRESETS[mode].map((preset) => (
                  <button
                    key={preset}
                    disabled={running}
                    onClick={() => changeMinutes(preset)}
                    className={cn(
                      "rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                      preset === minutes
                        ? "border-accent bg-accent/15 text-accent font-semibold"
                        : "border-base-border bg-base-raised text-ink-muted hover:text-ink",
                    )}
                  >
                    {preset}m
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SESSION HISTORY (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-base-border/70">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-ink-muted" />
                  <h2 className="text-base font-bold text-ink">Session Log</h2>
                </div>
                <span className="rounded-full bg-base-elevated px-2 py-0.5 text-xs font-semibold text-ink-muted">
                  {sessions.length} total
                </span>
              </div>

              {sessions.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center text-center p-4 text-xs text-ink-muted">
                  <Clock3 className="h-8 w-8 text-ink-faint mb-2" />
                  <p className="font-semibold text-ink">No sessions recorded yet</p>
                  <p className="text-ink-muted mt-0.5">
                    Completed study intervals will be logged automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {sessions.slice(0, 15).map((session) => {
                    const isFocus = session.type === "focus";
                    return (
                      <div
                        key={String(session.id)}
                        className="flex items-center justify-between rounded-xl border border-base-border/70 bg-base-raised/40 p-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              isFocus ? "bg-accent" : "bg-amber-500",
                            )}
                          />
                          <div>
                            <p className="font-semibold text-ink capitalize">
                              {session.type.replace("-", " ")}
                            </p>
                            <p className="text-[10px] text-ink-muted">
                              {new Date(session.completedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        <span className="font-mono font-semibold text-ink">
                          {session.duration} min
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
