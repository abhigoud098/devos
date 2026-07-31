# DevOS — Developer Second Brain

A personal, offline-only app for tracking your software engineering learning journey.
No backend, no login, no APIs — everything lives in IndexedDB on your machine.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. That's it — no env vars, no database setup.

## What's built so far

- **App shell**: sidebar navigation, dark theme, design tokens (`tailwind.config.ts`),
  Inter + JetBrains Mono type system.
- **Learning** (`/learning`): full CRUD for tracked topics — technology, topic, subtopic,
  status, confidence (1–5, shown as a signal-bar meter), difficulty, hours studied, notes.
  Search + filter by status/technology. Marking a topic **Completed** automatically builds
  its spaced-repetition schedule (day 1, 2, 5, 7, 10, 15, 21, 30, 60, 90) — see `lib/revision.ts`.
- **Dashboard** (`/`): a lightweight placeholder (due-revisions count, in-progress count,
  total hours) so the app is usable end-to-end. The full Dashboard (streak, weekly/monthly
  goals, charts, quick actions, recent activity) is the next build.
- All other sections (Smart Revision, DSA, Projects, Notes, Resources, Planner, Analytics,
  Study Timer, Settings) are wired into navigation as "coming soon" placeholders so nothing
  404s while they're built out one at a time.

## Architecture notes

- **Data**: Dexie (`lib/db.ts`) is the single source of truth. UI reads it reactively via
  `dexie-react-hooks`' `useLiveQuery` — no data duplicated into Zustand.
- **Zustand**: used only for ephemeral UI state (search text, active filters, dialog open/edit
  target) — see `store/learning-store.ts`. Keeps persisted data and UI state cleanly separated.
- **Forms**: `react-hook-form` + `zod` (`lib/schemas.ts`) for the Learning create/edit dialog.
- **No shadcn CLI**: since this environment can't reach npm/registries at build time, the UI
  primitives in `components/ui/` are hand-written (Radix + Tailwind) in the same spirit as
  shadcn — copy-owned, not a dependency — so `npm install` alone is enough to run everything.

## Suggested build order (next sessions)

1. **Study Timer** — Pomodoro/focus sessions are what will populate real `hoursStudied` data
   and session history, which the full Dashboard and Analytics both depend on.
2. **Dashboard v2** — streak tracking, weekly/monthly goals, learning heatmap, recent activity,
   quick actions, built on top of real Learning + Timer data.
3. **Smart Revision** — a dedicated queue view (overdue + today, grouped by topic) using the
   scheduling logic already in `lib/revision.ts`.
4. **DSA Tracker**, **Projects**, **Notes**, **Resources**, **Planner**, **Analytics**,
   **Settings** (JSON export/import backup), **Command palette (⌘K)**, **browser notifications**.

## A feature worth considering before we go further

Right now "Completed" is the only trigger for scheduling revisions. Worth deciding: should
dropping confidence back down (e.g. after a failed revision) reset or extend the schedule?
Options: (a) leave the original schedule untouched — confidence is just a signal, or
(b) let a revision marked with low confidence push a new revision date. Flagging this now
since it'll shape the Smart Revision queue we build next.
