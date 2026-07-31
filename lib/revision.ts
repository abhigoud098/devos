import { addDays, formatISO, isBefore, parseISO, startOfDay } from "date-fns";
import {
  REVISION_OFFSETS_DAYS,
  type RevisionEntry,
  type LearningTopic,
} from "./types";

export interface DueRevision {
  topic: LearningTopic;
  entry: RevisionEntry;
}

/** Build a fresh revision schedule anchored to the day a topic is completed. */
export function buildRevisionSchedule(
  completedOn: Date = new Date(),
): RevisionEntry[] {
  const anchor = startOfDay(completedOn);

  return REVISION_OFFSETS_DAYS.map((offsetDays) => ({
    date: formatISO(addDays(anchor, offsetDays), { representation: "date" }),
    offsetDays,
    done: false,
  }));
}

/** The next revision that isn't done yet */
export function nextPendingRevision(
  schedule: RevisionEntry[],
): RevisionEntry | undefined {
  return schedule
    .filter((r) => !r.done)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

/** True if revision is due */
export function isOverdue(
  entry: RevisionEntry,
  today: Date = new Date(),
): boolean {
  if (entry.done) return false;

  return !isBefore(startOfDay(today), parseISO(entry.date));
}

/** All revisions due today or earlier */
export function collectDueRevisions(
  topics: LearningTopic[],
  today: Date = new Date(),
): DueRevision[] {
  return topics.flatMap((topic) =>
    topic.revisionSchedule
      .filter((entry) => isOverdue(entry, today))
      .map((entry) => ({
        topic,
        entry,
      })),
  );
}
