import { db } from "./db";
import { buildRevisionSchedule } from "./revision";
import type { LearningFormValues, LearningTopic } from "./types";
import { api } from "./api-client";

function nowISO() {
  return new Date().toISOString();
}

/**
 * Sync topics from backend PostgreSQL into local IndexedDB
 */
export async function syncTopicsFromBackend() {
  try {
    const res = await api.learning.list();
    if (res.data?.topics && Array.isArray(res.data.topics)) {
      const formatted: LearningTopic[] = res.data.topics.map((t: any) => {
        const schedule = Array.isArray(t.revisionSchedule)
          ? t.revisionSchedule.map((r: any) => ({
              id: r.id,
              date: r.date,
              offsetDays: r.offsetDays,
              done: Boolean(r.done),
              doneAt: r.doneAt ? new Date(r.doneAt).toISOString() : undefined,
              reviewCount: r.reviewCount || 0,
              source: r.source || "system",
              notes: r.notes || undefined,
            }))
          : [];

        const completed = schedule.filter((r: any) => r.done).length;

        return {
          id: t.id,
          technology: t.technology,
          topic: t.topic,
          subtopic: t.subtopic || undefined,
          status: t.status,
          confidence: t.confidence === "NA" ? "NA" : Number(t.confidence) || 3,
          difficulty: t.difficulty,
          hoursStudied: Number(t.hoursStudied) || 0,
          lastStudied: t.lastStudied ? new Date(t.lastStudied).toISOString() : undefined,
          scheduledDate: t.scheduledDate || undefined,
          scheduledTime: t.scheduledTime || undefined,
          scheduledAt: t.scheduledAt ? new Date(t.scheduledAt).toISOString() : undefined,
          notes: t.notes || undefined,
          image: t.image || undefined,
          resources: [],
          interviewQuestions: [],
          needRevision: Boolean(t.needRevision),
          revisionSchedule: schedule,
          revisionStats: {
            total: schedule.length,
            completed,
            retention: schedule.length ? Math.round((completed / schedule.length) * 100) : 0,
            lastRevision: undefined,
          },
          createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : nowISO(),
          updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : nowISO(),
        };
      });

      await db.learningTopics.clear();
      await db.learningTopics.bulkPut(formatted);
    }
  } catch (err) {
    console.error("Failed to sync topics from backend:", err);
  }
}

/**
 * Create Topic
 */
export async function createTopic(values: LearningFormValues): Promise<string> {
  const id = crypto.randomUUID();
  const timestamp = nowISO();
  const needRevision = values.needRevision || values.status === "revising";
  const revisionSchedule = needRevision ? buildRevisionSchedule() : [];

  let scheduledAt: string | undefined = undefined;
  if (values.scheduledDate) {
    if (values.scheduledTime) {
      scheduledAt = new Date(`${values.scheduledDate}T${values.scheduledTime}`).toISOString();
    } else {
      scheduledAt = new Date(`${values.scheduledDate}T09:00:00`).toISOString();
    }
  }

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
    scheduledDate: values.scheduledDate || undefined,
    scheduledTime: values.scheduledTime || undefined,
    scheduledAt,
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

  // Sync to PostgreSQL backend
  api.learning.create(values).then((res) => {
    if (res.data?.topic?.id) {
      // replace local id with server id if needed
      db.learningTopics.delete(id).then(() => {
        db.learningTopics.put({
          ...topic,
          id: res.data!.topic.id,
        });
      });
    }
  });

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

  if (needRevision && revisionSchedule.length === 0) {
    revisionSchedule = buildRevisionSchedule();
  }

  if (!needRevision) {
    revisionSchedule = [];
  }

  const completed = revisionSchedule.filter((r) => r.done).length;

  let scheduledAt: string | undefined = undefined;
  if (values.scheduledDate) {
    if (values.scheduledTime) {
      scheduledAt = new Date(`${values.scheduledDate}T${values.scheduledTime}`).toISOString();
    } else {
      scheduledAt = new Date(`${values.scheduledDate}T09:00:00`).toISOString();
    }
  }

  await db.learningTopics.update(id, {
    technology: values.technology.trim(),
    topic: values.topic.trim(),
    subtopic: values.subtopic?.trim() || undefined,
    status: values.status,
    confidence: values.confidence,
    difficulty: values.difficulty,
    hoursStudied: values.hoursStudied,
    notes: values.notes?.trim() || undefined,
    scheduledDate: values.scheduledDate || undefined,
    scheduledTime: values.scheduledTime || undefined,
    scheduledAt,
    lastStudied: nowISO(),
    needRevision,
    revisionSchedule,
    revisionStats: {
      total: revisionSchedule.length,
      completed,
      retention: revisionSchedule.length
        ? Math.round((completed / revisionSchedule.length) * 100)
        : 0,
      lastRevision: existing.revisionStats?.lastRevision,
    },
    updatedAt: nowISO(),
  });

  // Sync to PostgreSQL backend
  api.learning.update(id, values);
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

  // Sync to PostgreSQL backend
  api.learning.markRevisionDone(topicId, revisionDate);
}

export async function deleteTopic(id: string) {
  await db.learningTopics.delete(id);
  api.learning.delete(id);
}

export async function listDistinctTechnologies() {
  const all = await db.learningTopics.toArray();
  return Array.from(new Set(all.map((topic) => topic.technology))).sort();
}
