import { db } from "./db";
import { buildRevisionSchedule } from "./revision";
import type { LearningFormValues, LearningTopic } from "./types";

function nowISO() {
  return new Date().toISOString();
}

/**
 * Create Topic
 */
export async function createTopic(values: LearningFormValues): Promise<string> {
  const id = crypto.randomUUID();

  const timestamp = nowISO();

  const needRevision = values.needRevision || values.status === "revising";

  const revisionSchedule = needRevision ? buildRevisionSchedule() : [];

  const topic: LearningTopic = {
    id,

    technology: values.technology.trim(),

    topic: values.topic.trim(),

    subtopic: values.subtopic?.trim() || undefined,

    status: values.status,

    confidence: values.confidence,

    difficulty: values.difficulty,

    hoursStudied: values.hoursStudied,

    notes: values.notes?.trim() || undefined,

    lastStudied: values.status === "not-started" ? undefined : timestamp,

    resources: [],

    interviewQuestions: [],

    needRevision,

    revisionSchedule,

    revisionStats: {
      total: revisionSchedule.length,

      completed: 0,

      retention: 0,
    },

    createdAt: timestamp,

    updatedAt: timestamp,
  };

  await db.learningTopics.add(topic);

  return id;
}

/**
 * Update Topic
 */
export async function updateTopic(
  id: string,
  values: LearningFormValues,
): Promise<void> {
  const existing = await db.learningTopics.get(id);

  if (!existing) return;

  const needRevision = values.needRevision || values.status === "revising";

  let revisionSchedule = [...existing.revisionSchedule];

  // first time enabling revision

  if (needRevision && revisionSchedule.length === 0) {
    revisionSchedule = buildRevisionSchedule();
  }

  // disable revision

  if (!needRevision) {
    revisionSchedule = [];
  }

  const completed = revisionSchedule.filter((r) => r.done).length;

  await db.learningTopics.update(id, {
    technology: values.technology.trim(),

    topic: values.topic.trim(),

    subtopic: values.subtopic?.trim() || undefined,

    status: values.status,

    confidence: values.confidence,

    difficulty: values.difficulty,

    hoursStudied: values.hoursStudied,

    notes: values.notes?.trim() || undefined,

    lastStudied: nowISO(),

    needRevision,

    revisionSchedule,

    revisionStats: {
      total: revisionSchedule.length,

      completed,

      retention: revisionSchedule.length
        ? Math.round((completed / revisionSchedule.length) * 100)
        : 0,

      // keep old data
      lastRevision: existing.revisionStats?.lastRevision,
    },

    updatedAt: nowISO(),
  });
}

/**
 * Complete revision
 */
export async function markRevisionDone(
  topicId: string,
  revisionDate: string,
): Promise<void> {
  const existing = await db.learningTopics.get(topicId);

  if (!existing) return;

  const schedule = existing.revisionSchedule.map((revision) => {
    if (revision.date === revisionDate) {
      return {
        ...revision,

        done: true,

        doneAt: nowISO(),

        reviewCount: (revision.reviewCount ?? 0) + 1,
      };
    }

    return revision;
  });

  const completed = schedule.filter((r) => r.done).length;

  await db.learningTopics.update(topicId, {
    revisionSchedule: schedule,

    revisionStats: {
      total: schedule.length,

      completed,

      retention: schedule.length
        ? Math.round((completed / schedule.length) * 100)
        : 0,

      lastRevision: nowISO(),
    },

    updatedAt: nowISO(),
  });
}

export async function deleteTopic(id: string) {
  await db.learningTopics.delete(id);
}

export async function listDistinctTechnologies() {
  const all = await db.learningTopics.toArray();

  return Array.from(new Set(all.map((topic) => topic.technology))).sort();
}
