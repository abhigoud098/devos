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
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SessionType = "focus" | "short-break" | "long-break";

type Session = {
  id: number;
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
    // A timer cannot legitimately finish the same type and duration more than
    // once in a second. This removes records created by the previous duplicate
    // completion bug while preserving separate timer runs.
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
    const savedSettings = localStorage.getItem("study-timer-settings");

    const savedSessions = localStorage.getItem("study-session-history");

    if (savedSettings) {
      const data = JSON.parse(savedSettings);

      setMode(data.mode ?? "focus");
      setMinutes(data.minutes ?? 25);
      setTime((data.minutes ?? 25) * 60);
    }

    if (savedSessions) {
      setSessions(removeDuplicateSessions(JSON.parse(savedSessions)));
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "study-timer-settings",
      JSON.stringify({
        mode,
        minutes,
      }),
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

  function completeSession() {
    setRunning(false);

    const completedAt = new Date().toISOString();

    setSessions((prev) => [
      {
        id: Date.now(),
        type: mode,
        duration: minutes,
        completedAt,
      },
      ...prev,
    ]);

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Session Complete 🎉", {
          body: `${minutes} minute ${mode.replace("-", " ")} finished.`,
        });
      }
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
      ? "Focus"
      : mode === "short-break"
        ? "Short Break"
        : "Long Break";

  const modeIcon =
    mode === "focus" ? (
      <Target className="h-5 w-5" />
    ) : mode === "short-break" ? (
      <Coffee className="h-5 w-5" />
    ) : (
      <Moon className="h-5 w-5" />
    );

  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      {/* HERO */}

      <section className="mb-8 rounded-2xl border bg-card p-8">
        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
          Productivity Workspace
        </span>

        <h1 className="mt-4 text-4xl font-bold">Study Timer</h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Focus deeply, take healthy breaks and automatically keep every
          completed session in your personal study history.
        </p>
      </section>

      {/* DASHBOARD */}

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <Clock3 className="mb-3 h-6 w-6" />

            <p className="text-sm text-muted-foreground">Focus Time</p>

            <h2 className="mt-2 text-3xl font-bold">{totalFocusMinutes}m</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Coffee className="mb-3 h-6 w-6" />

            <p className="text-sm text-muted-foreground">Break Time</p>

            <h2 className="mt-2 text-3xl font-bold">{totalBreakMinutes}m</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Target className="mb-3 h-6 w-6" />

            <p className="text-sm text-muted-foreground">Total Sessions</p>

            <h2 className="mt-2 text-3xl font-bold">{sessions.length}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <History className="mb-3 h-6 w-6" />

            <p className="text-sm text-muted-foreground">Today's Sessions</p>

            <h2 className="mt-2 text-3xl font-bold">{todaySessions}</h2>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="p-8">
            <div className="mb-8 flex items-center gap-3">
              {modeIcon}

              <div>
                <h2 className="text-2xl font-bold">{modeTitle}</h2>

                <p className="text-muted-foreground">Choose your timer mode</p>
              </div>
            </div>

            {/* MODE BUTTONS */}

            <div className="grid gap-3 sm:grid-cols-3">
              <Button
                variant={mode === "focus" ? "primary" : "outline"}
                onClick={() => switchMode("focus", 25)}
              >
                Focus
              </Button>

              <Button
                variant={mode === "short-break" ? "primary" : "outline"}
                onClick={() => switchMode("short-break", 5)}
              >
                Short Break
              </Button>

              <Button
                variant={mode === "long-break" ? "primary" : "outline"}
                onClick={() => switchMode("long-break", 15)}
              >
                Long Break
              </Button>
            </div>

            {/* PRESETS */}

            <div className="mt-8">
              <h3 className="mb-3 font-medium">Presets</h3>

              <div className="flex flex-wrap gap-3">
                {TIMER_PRESETS[mode].map((preset) => (
                  <Button
                    key={preset}
                    variant={preset === minutes ? "primary" : "outline"}
                    disabled={running}
                    onClick={() => changeMinutes(preset)}
                  >
                    {preset} min
                  </Button>
                ))}
              </div>
            </div>

            {/* CUSTOM INPUT */}

            <div className="mt-8 flex items-center gap-4">
              <Input
                type="number"
                min={1}
                disabled={running}
                className="w-40"
                value={minutes}
                onChange={(e) => changeMinutes(Number(e.target.value))}
              />

              <span className="text-muted-foreground">Custom Minutes</span>
            </div>
            {/* TIMER */}

            <div className="mt-12 flex flex-col items-center">
              <div className="relative flex h-72 w-72 items-center justify-center">
                <svg
                  className="-rotate-90 absolute h-full w-full"
                  viewBox="0 0 220 220"
                >
                  <circle
                    cx="110"
                    cy="110"
                    r="95"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-muted/30"
                  />

                  <circle
                    cx="110"
                    cy="110"
                    r="95"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    className={
                      mode === "focus"
                        ? "text-green-500"
                        : mode === "short-break"
                          ? "text-amber-500"
                          : "text-sky-500"
                    }
                    strokeDasharray={597}
                    strokeDashoffset={597 - (progress / 100) * 597}
                  />
                </svg>

                <div className="z-10 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">
                    {modeTitle}
                  </p>

                  <h2 className="text-6xl font-bold tracking-tight">
                    {formatTime()}
                  </h2>

                  <p className="mt-3 text-muted-foreground">
                    {Math.round(progress)}% Complete
                  </p>
                </div>
              </div>

              {/* CONTROLS */}

              <div className="mt-10 flex flex-wrap justify-center gap-2">
              <Button
                size="md"
                onClick={toggleTimer}
                className={`group h-14 min-w-[180px] rounded-xl text-base font-semibold transition-all duration-300
focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
${
  running
    ? "bg-accent text-accent-foreground hover:opacity-90 shadow-lg"
    : "bg-accent text-accent-foreground hover:opacity-90 shadow-lg"
}`}
              >
                  {running ? (
                    <>
                      <Pause className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                      Pause Session
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      Start Focus
                    </>
                  )}
                </Button>

                <Button variant="outline" className="h-[55px]" onClick={resetTimer}>
                  <RotateCcw className="h-5 w-15" />
                  Reset
                </Button>
              </div>

              <p className="mt-8 max-w-md text-center text-sm text-muted-foreground">
                Every completed <span className="font-medium">{modeTitle}</span>{" "}
                session is automatically stored in your study history.
              </p>
            </div>
          </CardContent>
        </Card>
        {/* SESSION HISTORY */}

        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5" />
                <h2 className="font-semibold">Session History</h2>
              </div>

              <span className="rounded-full border px-3 py-1 text-xs">
                {sessions.length} Sessions
              </span>
            </div>

            {sessions.length === 0 ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                <History className="mb-4 h-12 w-12 text-muted-foreground" />

                <p className="font-medium">No sessions yet</p>

                <p className="mt-2 text-sm text-muted-foreground">
                  Complete your first focus or break session to start building
                  your history.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const badge =
                    session.type === "focus"
                      ? {
                          label: "Focus",
                          className:
                            "bg-green-500/10 text-green-600 border-green-500/20",
                        }
                      : session.type === "short-break"
                        ? {
                            label: "Short Break",
                            className:
                              "bg-amber-500/10 text-amber-600 border-amber-500/20",
                          }
                        : {
                            label: "Long Break",
                            className:
                              "bg-sky-500/10 text-sky-600 border-sky-500/20",
                          };

                  return (
                    <div
                      key={session.id}
                      className="rounded-xl border p-4 transition-all hover:bg-muted/40"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>

                        <span className="text-sm font-semibold">
                          {session.duration} min
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground">
                        {new Date(session.completedAt).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
