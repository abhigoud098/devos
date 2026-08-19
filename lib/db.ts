import Dexie, { type Table } from "dexie";
import type { LearningTopic } from "./types";

export class DevOSDatabase extends Dexie {
  learningTopics!: Table<LearningTopic, string>;

  constructor() {
    super("devos");

    this.version(1).stores({
      learningTopics:
        "id, technology, topic, status, confidence, lastStudied, updatedAt",
    });

    this.version(2).stores({
      learningTopics:
        "id, technology, topic, status, confidence, lastStudied, updatedAt, customRevision.revisionDate",
    });

    this.version(3).stores({
      learningTopics:
        "id, technology, topic, status, confidence, lastStudied, scheduledDate, scheduledAt, updatedAt, customRevision.revisionDate",
    });
  }
}

export const db = new DevOSDatabase();

