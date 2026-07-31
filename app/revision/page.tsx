"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { CalendarClock, CheckCircle2, Clock3, BookOpen } from "lucide-react";

import { db } from "@/lib/db";
import { collectDueRevisions } from "@/lib/revision";
import { markRevisionDone } from "@/lib/learning-repo";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RevisionPage() {
  const topics = useLiveQuery(() => db.learningTopics.toArray(), []);

  const revisions = topics ? collectDueRevisions(topics) : [];

  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" />
          Smart Revision
        </div>

        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Today's Revisions
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Stay consistent with spaced repetition. Review topics when they're due
          so you retain them for the long term.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Due Today</p>
            <h2 className="mt-2 text-3xl font-bold">{revisions.length}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Completed Today</p>
            <h2 className="mt-2 text-3xl font-bold">0</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Revision Accuracy</p>
            <h2 className="mt-2 text-3xl font-bold">100%</h2>
          </CardContent>
        </Card>
      </div>

      {revisions.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 className="mb-5 h-14 w-14 text-emerald-500" />

            <h3 className="text-xl font-semibold">You're all caught up!</h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              There are no revisions due today. Perfect time to learn something
              new.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {revisions.map(({ topic, entry }) => (
            <Card
              key={`${topic.id}-${entry.date}`}
              className="transition-all hover:border-primary/40 hover:shadow-lg"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{topic.topic}</CardTitle>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {topic.technology}
                  </p>
                </div>

                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  Day {entry.offsetDays}
                </div>
              </CardHeader>

              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  Due {format(new Date(entry.date), "dd MMM yyyy")}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Open Notes
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => markRevisionDone(topic.id, entry.date)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Reviewed
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
