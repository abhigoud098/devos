"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";

import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Flame,
  Target,
  Plus,
  Timer,
  Rocket,
  TrendingUp,
} from "lucide-react";

import { db } from "@/lib/db";
import { getRevisionSummary } from "@/lib/revision";
import type { LearningTopic, RevisionEntry } from "@/lib/types";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function calculateStreak(topics: LearningTopic[]) {
  const days = new Set<string>();

  topics.forEach((topic) => {
    if (topic.lastStudied) {
      days.add(topic.lastStudied.slice(0, 10));
    }
  });

  let streak = 0;
  const today = new Date();

  while (true) {
    const date = new Date(today);

    date.setDate(today.getDate() - streak);

    const key = date.toISOString().slice(0, 10);

    if (days.has(key)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

const now = new Date();

const greeting =
  now.getHours() < 12
    ? "Good Morning"
    : now.getHours() < 17
      ? "Good Afternoon"
      : "Good Evening";

const formattedDate = now.toLocaleDateString("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function DashboardPage() {
  const topics = useLiveQuery(() => db.learningTopics.toArray(), []);

  if (!topics) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-muted-foreground">Loading DevOS dashboard...</p>
      </main>
    );
  }

  const summary = getRevisionSummary(topics);

  const totalHours = topics.reduce((sum, topic) => sum + topic.hoursStudied, 0);

  const completedTopics = topics.filter(
    (topic) => topic.status === "completed",
  ).length;

  const progress =
    topics.length === 0
      ? 0
      : Math.round((completedTopics / topics.length) * 100);

  const inProgress = topics.filter(
    (topic) => topic.status === "in-progress" || topic.status === "revising",
  ).length;

  const streak = calculateStreak(topics);

  const latestTopic = [...topics]
    .filter((topic) => topic.lastStudied)
    .sort(
      (a, b) =>
        new Date(b.lastStudied!).getTime() - new Date(a.lastStudied!).getTime(),
    )[0];

  async function completeRevision(topicId: string, revisionDate: string) {
    const topic = await db.learningTopics.get(topicId);

    if (!topic) return;

    const updated = topic.revisionSchedule.map((revision: RevisionEntry) =>
      revision.date === revisionDate
        ? {
            ...revision,
            done: true,
            doneAt: new Date().toISOString(),
          }
        : revision,
    );

    await db.learningTopics.update(topicId, {
      revisionSchedule: updated,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <main
      className="
mx-auto
max-w-7xl
px-6
py-10
space-y-8
"
    >
      {/* HERO */}

      <section
        className="
relative
overflow-hidden
rounded-3xl
border
bg-gradient-to-br
from-background
via-muted/20
to-background
p-8
"
      >
        <div
          className="
absolute
right-0
top-0
h-40
w-40
rounded-full
bg-primary/10
blur-3xl
"
        />

        <div
          className="
relative
flex
flex-col
gap-6
lg:flex-row
lg:items-center
lg:justify-between
"
        >
          <div>
            <div
              className="
inline-flex
items-center
gap-2
rounded-full
border
bg-background/60
px-3
py-1
text-xs
font-medium
"
            >
              <span
                className="
h-2
w-2
rounded-full
bg-green-500
"
              />
              DevOS Dashboard
            </div>

            <h1
              className="
mt-5
text-4xl
font-bold
tracking-tight
lg:text-5xl
"
            >
              {greeting}, Abhishek 👋
            </h1>

            <p
              className="
mt-2
text-sm
text-muted-foreground
"
            >
              {formattedDate}
            </p>

            <p
              className="
mt-5
max-w-xl
leading-7
text-muted-foreground
"
            >
              Build knowledge consistently. Revise smarter and track your
              developer journey.
            </p>
          </div>

          <div
            className="
rounded-2xl
border
bg-background/60
backdrop-blur
p-5
min-w-[240px]
"
          >
            <div
              className="
flex
items-center
gap-2
text-sm
text-muted-foreground
"
            >
              <Target className="h-4 w-4" />
              Today's Focus
            </div>

            <p
              className="
mt-3
text-xl
font-semibold
"
            >
              Learn • Build • Revise 🚀
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}

      <section
        className="
grid
gap-4
sm:grid-cols-2
xl:grid-cols-6
"
      >
        {[
          {
            title: "Topics",
            value: topics.length,
            icon: BookOpen,
          },
          {
            title: "Revisions",
            value: summary.dueToday.length,
            icon: CalendarDays,
          },
          {
            title: "Completed",
            value: summary.completed.length,
            icon: CheckCircle2,
          },
          {
            title: "Progress",
            value: `${progress}%`,
            icon: TrendingUp,
          },
          {
            title: "Hours",
            value: totalHours.toFixed(1),
            icon: Timer,
          },
          {
            title: "Streak",
            value: `${streak}d`,
            icon: Flame,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className="
rounded-2xl
border
bg-card/60
hover:bg-card
transition
"
            >
              <CardContent
                className="
p-5
"
              >
                <Icon
                  className="
h-5
w-5
text-muted-foreground
"
                />

                <p
                  className="
mt-4
text-sm
text-muted-foreground
"
                >
                  {item.title}
                </p>

                <p
                  className="
mt-1
text-3xl
font-semibold
"
                >
                  {item.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* TODAY MISSION */}

      <section>
        <Card
          className="
rounded-3xl
border
bg-card/60
"
        >
          <CardContent className="p-8">
            <div
              className="
flex
items-center
justify-between
mb-6
"
            >
              <div>
                <p
                  className="
text-xs
uppercase
tracking-wider
text-muted-foreground
"
                >
                  Today's Mission
                </p>

                <h2
                  className="
mt-2
text-2xl
font-semibold
"
                >
                  Strengthen your memory system
                </h2>
              </div>

              <Target className="h-8 w-8" />
            </div>

            <div
              className="
grid
gap-4
md:grid-cols-2
"
            >
              <div
                className="
rounded-2xl
border
p-5
"
              >
                <BookOpen className="h-5 w-5" />

                <p className="mt-3 text-sm">
                  <strong>{summary.dueToday.length}</strong>
                  &nbsp; revisions waiting today
                </p>
              </div>

              <div
                className="
rounded-2xl
border
p-5
"
              >
                <AlertCircle className="h-5 w-5" />

                <p className="mt-3 text-sm">
                  <strong>{summary.overdue.length}</strong>
                  &nbsp; overdue revisions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* REVISION + UPCOMING */}

      <div
        className="
grid
gap-6
lg:grid-cols-12
"
      >
        <section
          className="
lg:col-span-7
"
        >
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div
                className="
flex
justify-between
items-center
mb-5
"
              >
                <h3 className="text-lg font-semibold">Today's Revision</h3>

                <span
                  className="
rounded-full
bg-muted
px-3
py-1
text-xs
"
                >
                  {summary.dueToday.length}
                </span>
              </div>

              {summary.dueToday.length === 0 ? (
                <div
                  className="
rounded-2xl
border
border-dashed
p-10
text-center
"
                >
                  <CheckCircle2
                    className="
mx-auto
h-8
w-8
mb-3
"
                  />

                  <p className="text-sm text-muted-foreground">
                    Everything completed 🎉
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.dueToday.map((revision) => (
                    <div
                      key={`${revision.topic.id}-${revision.entry.id}`}
                      className="
flex
items-center
justify-between
rounded-2xl
border
p-4
"
                    >
                      <div>
                        <p className="font-medium">{revision.topic.topic}</p>

                        <p className="text-sm text-muted-foreground">
                          {revision.topic.technology}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          completeRevision(
                            revision.topic.id,
                            revision.entry.date,
                          )
                        }
                      >
                        Done
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section
          className="
lg:col-span-5
"
        >
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div
                className="
flex
items-center
justify-between
mb-5
"
              >
                <h3 className="text-lg font-semibold">Upcoming</h3>

                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>

              {summary.upcoming.length === 0 ? (
                <p
                  className="
text-sm
text-muted-foreground
"
                >
                  No upcoming revisions.
                </p>
              ) : (
                <div className="space-y-3">
                  {summary.upcoming.slice(0, 5).map((revision) => (
                    <div
                      key={`${revision.topic.id}-${revision.entry.id}`}
                      className="
rounded-2xl
border
p-4
hover:bg-muted/40
transition
"
                    >
                      <div
                        className="
flex
items-center
gap-2
"
                      >
                        <BookOpen className="h-4 w-4" />

                        <p className="font-medium">{revision.topic.topic}</p>
                      </div>

                      <p
                        className="
mt-2
text-xs
text-muted-foreground
"
                      >
                        {revision.entry.date}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* CONTINUE LEARNING */}

      <div
        className="
grid
gap-6
lg:grid-cols-12
"
      >
        <section
          className="
lg:col-span-7
"
        >
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div
                className="
flex
items-center
justify-between
mb-6
"
              >
                <h3
                  className="
text-lg
font-semibold
"
                >
                  Continue Learning
                </h3>

                <BookOpen
                  className="
h-5
w-5
text-muted-foreground
"
                />
              </div>

              {latestTopic ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last studied
                    </p>

                    <h4 className="mt-1 text-2xl font-semibold">
                      {latestTopic.topic}
                    </h4>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {latestTopic.technology}
                    </p>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <div className="flex justify-between text-sm">
                      <span>Status</span>

                      <span className="capitalize">
                        {latestTopic.status.replace("-", " ")}
                      </span>
                    </div>

                    <div className="mt-3 flex justify-between text-sm">
                      <span>Confidence</span>

                      <span>
                        {latestTopic.confidence === "NA"
                          ? "Not rated"
                          : `${latestTopic.confidence}/5`}
                      </span>
                    </div>

                    <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width:
                            latestTopic.confidence === "NA"
                              ? "0%"
                              : `${Number(latestTopic.confidence) * 20}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Last studied:{" "}
                    {new Date(latestTopic.lastStudied!).toLocaleDateString()}
                  </p>

                  <Link href="/learning">
                    <Button className="w-full rounded-xl mt-5">
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Start your first learning topic 🚀
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* QUICK ACTIONS */}

        <section
          className="
lg:col-span-5
"
        >
          <Card
            className="
rounded-3xl
bg-card/60
"
          >
            <CardContent className="p-6">
              <div
                className="
flex
items-center
justify-between
mb-5
"
              >
                <h3
                  className="
text-lg
font-semibold
"
                >
                  Quick Actions
                </h3>

                <Rocket
                  className="
h-5
w-5
text-muted-foreground
"
                />
              </div>

              <div
                className="
grid
grid-cols-2
gap-3
"
              >
                <Link href="/learning">
                  <Button
                    variant="outline"
                    className="
group
h-28
w-full
flex-col
gap-3
rounded-2xl
hover:border-primary/40
hover:bg-primary/5
transition
"
                  >
                    <Plus
                      className="
h-6
w-6
text-primary
group-hover:scale-110
transition
"
                    />

                    <span>Add Topic</span>
                  </Button>
                </Link>

                <Link href="/learning">
                  <Button
                    variant="outline"
                    className="
group
h-28
w-full
flex-col
gap-3
rounded-2xl
hover:border-blue-500/40
hover:bg-blue-500/5
transition
"
                  >
                    <BookOpen
                      className="
h-6
w-6
text-blue-500
group-hover:scale-110
transition
"
                    />

                    <span>Learning</span>
                  </Button>
                </Link>

                <Link href="/timer">
                  <Button
                    variant="outline"
                    className="
group
h-28
w-full
flex-col
gap-3
rounded-2xl
hover:border-orange-500/40
hover:bg-orange-500/5
transition
"
                  >
                    <Timer
                      className="
h-6
w-6
text-orange-500
group-hover:scale-110
transition
"
                    />

                    <span>Focus</span>
                  </Button>
                </Link>

                <Link href="/projects">
                  <Button
                    variant="outline"
                    className="
group
h-28
w-full
flex-col
gap-3
rounded-2xl
hover:border-emerald-500/40
hover:bg-emerald-500/5
transition
"
                  >
                    <Rocket
                      className="
h-6
w-6
text-emerald-500
group-hover:scale-110
transition
"
                    />

                    <span>Projects</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
