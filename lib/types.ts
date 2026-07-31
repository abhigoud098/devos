export type LearningStatus = "not-started" | "in-progress" | "completed" | "revising";

export type Confidence = 1 | 2 | 3 | 4 | 5;

export type Difficulty = "easy" | "medium" | "hard";

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: "youtube" | "course" | "docs" | "article" | "book" | "github";
}

/** Offsets (in days) used to auto-generate a spaced-repetition schedule
 *  once a topic is marked completed. */
export const REVISION_OFFSETS_DAYS = [1, 2, 5, 7, 10, 15, 21, 30, 60, 90] as const;

export interface RevisionEntry {
  /** ISO date string, e.g. 2026-08-05 */
  date: string;
  offsetDays: (typeof REVISION_OFFSETS_DAYS)[number];
  done: boolean;
  doneAt?: string;
}

export interface LearningTopic {
  id: string;
  technology: string; // e.g. "React"
  topic: string; // e.g. "Hooks"
  subtopic?: string; // e.g. "useEffect cleanup"
  status: LearningStatus;
  confidence: Confidence;
  difficulty: Difficulty;
  hoursStudied: number;
  lastStudied?: string; // ISO date
  notes?: string;
  resources: Resource[];
  interviewQuestions: string[];
  revisionSchedule: RevisionEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningFormValues {
  technology: string;
  topic: string;
  subtopic?: string;
  status: LearningStatus;
  confidence: Confidence;
  difficulty: Difficulty;
  hoursStudied: number;
  notes?: string;
}
