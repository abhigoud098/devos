import { addDays, formatISO, isBefore, parseISO, startOfDay } from "date-fns";
import { REVISION_OFFSETS_DAYS, type RevisionEntry } from "./types";

/** Build a fresh revision schedule anchored to the day a topic is completed. */
export function buildRevisionSchedule(completedOn: Date = new Date()): RevisionEntry[] {
  const anchor = startOfDay(completedOn);
  return REVISION_OFFSETS_DAYS.map((offsetDays) => ({
    date: formatISO(addDays(anchor, offsetDays), { representation: "date" }),
    offsetDays,
    done: false,
  }));
}

/** The next revision that isn't done yet (used for "Last Studied → Revision Date"). */
export function nextPendingRevision(schedule: RevisionEntry[]): RevisionEntry | undefined {
  return schedule
    .filter((r) => !r.done)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

/** True if a revision entry's date is today or earlier and it isn't done. */
export function isOverdue(entry: RevisionEntry, today: Date = new Date()): boolean {
  if (entry.done) return false;
  return !isBefore(startOfDay(today), parseISO(entry.date)); // today >= date
}

/** All revisions due today or earlier, across every topic — feeds the Dashboard. */
export function collectDueRevisions<T extends { id: string; revisionSchedule: RevisionEntry[] }>(
  topics: T[],
  today: Date = new Date()
) {
  return topics.flatMap((topic) =>
    topic.revisionSchedule
      .filter((r) => isOverdue(r, today))
      .map((entry) => ({ topic, entry }))
  );
}
