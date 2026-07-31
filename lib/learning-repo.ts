import { db } from "./db";
import { buildRevisionSchedule } from "./revision";
import type { LearningFormValues, LearningTopic } from "./types";

function nowISO() {
  return new Date().toISOString();
}

export async function createTopic(values: LearningFormValues): Promise<string> {
  const id = crypto.randomUUID();
  const timestamp = nowISO();
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
    // Completing a topic immediately on creation seeds its revision schedule.
    revisionSchedule: values.status === "completed" ? buildRevisionSchedule() : [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await db.learningTopics.add(topic);
  return id;
}

export async function updateTopic(id: string, values: LearningFormValues): Promise<void> {
  const existing = await db.learningTopics.get(id);
  if (!existing) return;

  const justCompleted = existing.status !== "completed" && values.status === "completed";

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
    // Marking a topic completed (for the first time) auto-schedules Day 1..90 revisions.
    revisionSchedule: justCompleted ? buildRevisionSchedule() : existing.revisionSchedule,
    updatedAt: nowISO(),
  });
}

export async function deleteTopic(id: string): Promise<void> {
  await db.learningTopics.delete(id);
}

export async function markRevisionDone(topicId: string, revisionDate: string): Promise<void> {
  const existing = await db.learningTopics.get(topicId);
  if (!existing) return;
  const schedule = existing.revisionSchedule.map((r) =>
    r.date === revisionDate ? { ...r, done: true, doneAt: nowISO() } : r
  );
  await db.learningTopics.update(topicId, { revisionSchedule: schedule, updatedAt: nowISO() });
}

export async function listDistinctTechnologies(): Promise<string[]> {
  const all = await db.learningTopics.toArray();
  return Array.from(new Set(all.map((t) => t.technology))).sort();
}
