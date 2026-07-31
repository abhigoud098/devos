import Dexie, { type Table } from "dexie";
import type { LearningTopic } from "./types";

/**
 * DevOS's entire persistence layer. Everything lives in IndexedDB via Dexie —
 * no network, no backend, no auth. `export-import.ts` (Settings) reads/writes
 * this same schema for JSON backup.
 */
export class DevOSDatabase extends Dexie {
  learningTopics!: Table<LearningTopic, string>;

  constructor() {
    super("devos");
    this.version(1).stores({
      // Indexed fields are the ones we filter/sort by in the UI.
      learningTopics: "id, technology, topic, status, confidence, lastStudied, updatedAt",
    });
  }
}

export const db = new DevOSDatabase();
