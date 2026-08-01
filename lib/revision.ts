import {
  addDays,
  compareAsc,
  formatISO,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";

import {
  REVISION_OFFSETS_DAYS,
  type LearningTopic,
  type RevisionEntry,
  type RevisionSource,
} from "./types";

export interface DueRevision {
  topic: LearningTopic;
  entry: RevisionEntry;
}

export interface RevisionSummary {
  dueToday: DueRevision[];

  upcoming: DueRevision[];

  overdue: DueRevision[];

  completed: DueRevision[];
}

function nowISO() {
  return new Date().toISOString();
}

/**
 * Create revision item
 */

export function createRevisionEntry(
  date: string,
  offsetDays = 0,
  type: RevisionSource = "system",
  notes = "",
): RevisionEntry {
  return {
    id: crypto.randomUUID(),

    date,

    offsetDays,

    done: false,

    createdAt: nowISO(),

    source: type,

    notes,

    reviewCount: 0,
  };
}

/**
 * Auto revision timeline
 *
 * Day 0
 * Day 1
 * Day 3
 * Day 7
 * Day 14
 * Day 30
 */
export function buildRevisionSchedule(
  startDate: Date = new Date(),
): RevisionEntry[] {
  const anchor = startOfDay(startDate);

  return REVISION_OFFSETS_DAYS.map((offset) => {
    return createRevisionEntry(
      formatISO(addDays(anchor, offset), {
        representation: "date",
      }),

      offset,

      "system",
    );
  });
}

/**
 * Next revision
 */
export function nextPendingRevision(schedule: RevisionEntry[]) {
  return schedule
    .filter((item) => !item.done)
    .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)))[0];
}

export function isOverdue(entry: RevisionEntry, today = new Date()) {
  if (entry.done) return false;

  return isBefore(parseISO(entry.date), startOfDay(today));
}

export function isDueToday(entry: RevisionEntry, today = new Date()) {
  if (entry.done) return false;

  return isSameDay(parseISO(entry.date), startOfDay(today));
}

export function isUpcoming(entry: RevisionEntry, today = new Date()) {
  if (entry.done) return false;

  return isBefore(startOfDay(today), parseISO(entry.date));
}

/**
 * Topic revision completion %
 */
export function calculateRevisionProgress(topic: LearningTopic) {
  const total = topic.revisionSchedule.length;

  const completed = topic.revisionSchedule.filter((r) => r.done).length;

  if (!total) return 0;

  return Math.round((completed / total) * 100);
}

/**
 * Remaining revisions
 */
export function getRemainingRevisions(topic: LearningTopic) {
  return topic.revisionSchedule.filter((r) => !r.done).length;
}

/**
 * Memory retention score
 */
export function calculateRetention(topic: LearningTopic) {
  const total = topic.revisionSchedule.length;

  const completed = topic.revisionSchedule.filter((r) => r.done).length;

  if (!total) return 0;

  return Math.round((completed / total) * 100);
}

/**
 * Due revisions only
 */
export function collectDueRevisions(
  topics: LearningTopic[],
  today = new Date(),
) {
  const summary = getRevisionSummary(topics, today);

  return [...summary.dueToday, ...summary.overdue];
}

export function getRevisionSummary(
  topics: LearningTopic[],
  today = new Date(),
): RevisionSummary {
  const dueToday: DueRevision[] = [];

  const overdue: DueRevision[] = [];

  const upcoming: DueRevision[] = [];

  const completed: DueRevision[] = [];

  topics.forEach((topic) => {
    // ignore topics without revision
    if (!topic.needRevision) return;

    topic.revisionSchedule.forEach((entry) => {
      const item = {
        topic,
        entry,
      };

      if (entry.done) {
        completed.push(item);

        return;
      }

      if (isDueToday(entry, today)) {
        dueToday.push(item);

        return;
      }

      if (isOverdue(entry, today)) {
        overdue.push(item);

        return;
      }

      if (isUpcoming(entry, today)) {
        upcoming.push(item);
      }
    });
  });

  const sortFn = (a: DueRevision, b: DueRevision) =>
    compareAsc(parseISO(a.entry.date), parseISO(b.entry.date));

  dueToday.sort(sortFn);

  overdue.sort(sortFn);

  upcoming.sort(sortFn);

  completed.sort(sortFn);

  return {
    dueToday,

    overdue,

    upcoming,

    completed,
  };
}
