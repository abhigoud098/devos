import { prisma } from "../lib/prisma";
import { format, addDays } from "date-fns";


async function main() {
  console.log("🌱 Seeding DevOS database...");

  // 1. Create or upsert Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@devos.dev" },
    update: {
      name: "Demo Developer",
      password: "password123",
    },
    create: {
      name: "Demo Developer",
      email: "demo@devos.dev",
      password: "password123",
      preference: {
        create: {
          theme: "dark",
          dimMode: false,
          focusDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
        },
      },
      revisionGoal: {
        create: {
          dailyTarget: 5,
          weeklyTarget: 30,
        },
      },
    },
  });

  console.log(`👤 User created/verified: ${demoUser.email} (${demoUser.id})`);

  // Clean existing demo user's test records
  await prisma.learningTopic.deleteMany({ where: { userId: demoUser.id } });
  await prisma.note.deleteMany({ where: { userId: demoUser.id } });
  await prisma.project.deleteMany({ where: { userId: demoUser.id } });
  await prisma.resourceItem.deleteMany({ where: { userId: demoUser.id } });
  await prisma.plannerTask.deleteMany({ where: { userId: demoUser.id } });
  await prisma.dSAProblem.deleteMany({ where: { userId: demoUser.id } });
  await prisma.studySession.deleteMany({ where: { userId: demoUser.id } });

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const in3DaysStr = format(addDays(new Date(), 3), "yyyy-MM-dd");
  const in7DaysStr = format(addDays(new Date(), 7), "yyyy-MM-dd");

  // 2. Seed Learning Topics
  const topic1 = await prisma.learningTopic.create({
    data: {
      userId: demoUser.id,
      technology: "React",
      topic: "Hooks & Lifecycle",
      subtopic: "useEffect cleanup & memory leaks",
      status: "in-progress",
      confidence: "4",
      difficulty: "medium",
      hoursStudied: 3.5,
      scheduledDate: todayStr,
      scheduledTime: "14:00",
      scheduledAt: new Date(`${todayStr}T14:00:00`),
      notes: "Always return cleanup function for event listeners and timers to prevent memory leaks.",
      needRevision: true,
      revisionSchedule: {
        create: [
          { date: todayStr, offsetDays: 1, done: false, source: "system", notes: "Day 1 revision" },
          { date: tomorrowStr, offsetDays: 2, done: false, source: "system", notes: "Day 2 revision" },
          { date: in3DaysStr, offsetDays: 5, done: false, source: "system", notes: "Day 5 revision" },
          { date: in7DaysStr, offsetDays: 7, done: false, source: "system", notes: "Day 7 revision" },
        ],
      },
    },
  });

  const topic2 = await prisma.learningTopic.create({
    data: {
      userId: demoUser.id,
      technology: "PostgreSQL",
      topic: "Indexing & Query Optimization",
      subtopic: "B-Tree vs GIN & EXPLAIN ANALYZE",
      status: "completed",
      confidence: "5",
      difficulty: "hard",
      hoursStudied: 6.0,
      scheduledDate: tomorrowStr,
      scheduledTime: "10:30",
      scheduledAt: new Date(`${tomorrowStr}T10:30:00`),
      notes: "Use GIN indexes for JSONB and full-text search. Check query plans using EXPLAIN (ANALYZE, BUFFERS).",
      needRevision: true,
      revisionSchedule: {
        create: [
          { date: todayStr, offsetDays: 1, done: true, doneAt: new Date(), reviewCount: 1, source: "system" },
          { date: in3DaysStr, offsetDays: 3, done: false, source: "system" },
          { date: in7DaysStr, offsetDays: 7, done: false, source: "system" },
        ],
      },
    },
  });

  const topic3 = await prisma.learningTopic.create({
    data: {
      userId: demoUser.id,
      technology: "Next.js",
      topic: "App Router & Server Actions",
      subtopic: "Optimistic updates & cache tags",
      status: "in-progress",
      confidence: "3",
      difficulty: "medium",
      hoursStudied: 2.0,
      scheduledDate: in3DaysStr,
      scheduledTime: "16:00",
      notes: "revalidateTag allows precise cache invalidation on the edge.",
      needRevision: false,
    },
  });

  console.log("📚 Seeded Learning Topics with Revision schedules.");

  // 3. Seed Notes
  await prisma.note.createMany({
    data: [
      {
        userId: demoUser.id,
        title: "PostgreSQL Indexes Cheatsheet",
        content: "CREATE INDEX idx_user_email ON users(email);\nCREATE INDEX idx_topics_date ON learning_topics(user_id, scheduled_date);",
        type: "Cheatsheet",
      },
      {
        userId: demoUser.id,
        title: "Next.js 14 App Router Performance Architecture",
        content: "Use Server Components by default. Pass serializable props. Move client interactivity to leaf nodes.",
        type: "Architecture",
      },
    ],
  });

  console.log("📝 Seeded Developer Notes.");

  // 4. Seed Projects
  await prisma.project.createMany({
    data: [
      {
        userId: demoUser.id,
        title: "DevOS — Developer Second Brain",
        description: "Personal offline-first developer dashboard with learning, smart spaced repetition, and planner.",
        tech: "Next.js, TailwindCSS, TypeScript, Prisma, PostgreSQL",
        github: "https://github.com/abhigoud098/devos",
        live: "https://devos.app",
        status: "Building",
      },
      {
        userId: demoUser.id,
        title: "Distributed Rate Limiter",
        description: "High-throughput token bucket rate limiter built with Redis and Go.",
        tech: "Go, Redis, Docker",
        github: "https://github.com/demo/rate-limiter",
        live: "",
        status: "Completed",
      },
    ],
  });

  console.log("🚀 Seeded Projects.");

  // 5. Seed Resources
  await prisma.resourceItem.createMany({
    data: [
      {
        userId: demoUser.id,
        title: "Prisma Schema & Relations Reference",
        url: "https://www.prisma.io/docs/concepts/components/prisma-schema",
        description: "Official guide for modeling 1-to-many, 1-to-1, and cascading relations in Prisma.",
        type: "Article",
      },
      {
        userId: demoUser.id,
        title: "Designing Data-Intensive Applications",
        url: "https://dataintensive.net",
        description: "The big ideas behind reliable, scalable, and maintainable systems by Martin Kleppmann.",
        type: "Course",
      },
    ],
  });

  console.log("📖 Seeded Resources.");

  // 6. Seed Planner Tasks
  await prisma.plannerTask.createMany({
    data: [
      {
        userId: demoUser.id,
        title: "Connect Prisma Database & Run Migrations",
        description: "Deploy schema to PostgreSQL, seed dummy data, and test CRUD routes.",
        date: todayStr,
        hours: "2",
        status: "Completed",
      },
      {
        userId: demoUser.id,
        title: "Revise Spaced Repetition Topics",
        description: "Complete daily active recall session for React hooks & PostgreSQL indexing.",
        date: todayStr,
        hours: "1",
        status: "Pending",
      },
    ],
  });

  console.log("📅 Seeded Planner Tasks.");

  // 7. Seed DSA Problems
  await prisma.dSAProblem.createMany({
    data: [
      {
        userId: demoUser.id,
        name: "Two Sum",
        number: "1",
        pattern: "HashMap",
        method: "Two Pointer",
        difficulty: "Easy",
        status: "Mastered",
        struggle: "None",
        learning: "Use hash map for O(n) single-pass lookup of target - nums[i].",
        revisionEnabled: true,
        revisionDate: todayStr,
        revisionDone: true,
      },
      {
        userId: demoUser.id,
        name: "LRU Cache",
        number: "146",
        pattern: "Linked List",
        method: "HashMap",
        difficulty: "Medium",
        status: "Solved",
        struggle: "Remembering double linked list node removal edge cases",
        learning: "Combine Doubly Linked List with Hash Map for O(1) get and put.",
        revisionEnabled: true,
        revisionDate: tomorrowStr,
        revisionDone: false,
      },
    ],
  });

  console.log("🧩 Seeded DSA Problems.");

  // 8. Seed Study Sessions
  await prisma.studySession.createMany({
    data: [
      {
        userId: demoUser.id,
        type: "focus",
        duration: 25,
        completedAt: new Date(Date.now() - 3600000),
      },
      {
        userId: demoUser.id,
        type: "focus",
        duration: 45,
        completedAt: new Date(Date.now() - 7200000),
      },
    ],
  });

  console.log("⏱️ Seeded Study Sessions.");

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

