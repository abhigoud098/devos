"use client";

import { useEffect, useState } from "react";

import {
  Timer,
  Play,
  Coffee,
  History,
  Clock3,
  Target,
  Pause,
  RotateCcw,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Session = {
  id: number;
  duration: number;
  date: string;
};

export default function StudyTimerPage() {
  const [minutes, setMinutes] = useState(25);

  const [time, setTime] = useState(25 * 60);

  const [running, setRunning] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);

  const [loaded, setLoaded] = useState(false);

  // LOAD TIMER DATA

  useEffect(() => {
    const savedTimer = localStorage.getItem("timer-settings");

    const savedSessions = localStorage.getItem("study-sessions");

    if (savedTimer) {
      const data = JSON.parse(savedTimer);

      setMinutes(data.minutes);

      setTime(data.minutes * 60);
    }

    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }

    setLoaded(true);
  }, []);

  // SAVE TIMER SETTINGS

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "timer-settings",

      JSON.stringify({
        minutes,
      }),
    );
  }, [minutes, loaded]);

  // SAVE SESSIONS

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "study-sessions",

      JSON.stringify(sessions),
    );
  }, [sessions, loaded]);

  // TIMER RUNNING

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          completeSession();

          return minutes * 60;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, minutes]);

  function completeSession() {
    setRunning(false);

    setSessions((prev) => [
      ...prev,

      {
        id: Date.now(),

        duration: minutes,

        date: new Date().toLocaleDateString(),
      },
    ]);
  }

  function changeMinutes(value: number) {
    setMinutes(value);

    setTime(value * 60);
  }

  function formatTime() {
    const min = Math.floor(time / 60);

    const sec = time % 60;

    return String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  }

  const totalMinutes = sessions.reduce(
    (sum, item) => sum + item.duration,

    0,
  );
  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      {/* HERO */}

      <section className="mb-8 rounded-2xl border bg-card p-8">
        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
          Focus Workspace
        </span>

        <h1 className="mt-4 text-4xl font-bold">Study Timer</h1>

        <p className="mt-3 text-muted-foreground">
          Create custom focus sessions and track your study history.
        </p>
      </section>

      {/* STATS */}

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <Clock3 className="mb-3" />

            <p className="text-sm text-muted-foreground">Focus Time</p>

            <h2 className="text-3xl font-bold">{totalMinutes}m</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Target className="mb-3" />

            <p className="text-sm text-muted-foreground">Sessions</p>

            <h2 className="text-3xl font-bold">{sessions.length}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Timer className="mb-3" />

            <p className="text-sm text-muted-foreground">Current Timer</p>

            <h2 className="text-3xl font-bold">{minutes}m</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Coffee className="mb-3" />

            <p className="text-sm text-muted-foreground">Breaks</p>

            <h2 className="text-3xl font-bold">0</h2>
          </CardContent>
        </Card>
      </section>

      {/* TIMER AREA */}

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="min-h-[450px] flex flex-col items-center justify-center">
            {/* CUSTOM TIME */}

            <div className="mb-8 flex items-center gap-3">
              <Input
                type="number"
                min="1"
                className="w-32 text-center"
                value={minutes}
                disabled={running}
                onChange={(e) => changeMinutes(Number(e.target.value))}
              />

              <span>Minutes</span>
            </div>

            {/* TIMER CIRCLE */}

            <div
              className="
              h-56
              w-56
              rounded-full
              border
              flex
              items-center
              justify-center
              text-6xl
              font-bold
            "
            >
              {formatTime()}
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                className="h-14 px-10"
                onClick={() => setRunning(!running)}
              >
                {running ? (
                  <Pause className="mr-2" />
                ) : (
                  <Play className="mr-2" />
                )}

                {running ? "Pause" : "Start Focus"}
              </Button>

              <Button
                variant="outline"
                className="h-14 w-14"
                onClick={() => {
                  setRunning(false);

                  setTime(minutes * 60);
                }}
              >
                <RotateCcw />
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground text-center max-w-md">
              Every completed focus session will be saved automatically.
            </p>
          </CardContent>
        </Card>

        {/* HISTORY */}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <History />

              <h2 className="font-semibold">Session History</h2>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <History className="mx-auto mb-4" />

                <p>No sessions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions
                  .slice()
                  .reverse()
                  .map((session) => (
                    <div key={session.id} className="rounded-lg border p-3">
                      <p className="font-medium">{session.duration} minutes</p>

                      <p className="text-sm text-muted-foreground">
                        {session.date}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
