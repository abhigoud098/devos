export type LearningStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "revising";

export type Confidence = 1 | 2 | 3 | 4 | 5;

export type Difficulty = "easy" | "medium" | "hard";

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: "youtube" | "course" | "docs" | "article" | "book" | "github";
}

/**
 * Default spaced repetition intervals.
 */
export const REVISION_OFFSETS_DAYS = [
  1, 2, 5, 7, 10, 15, 21, 30, 60, 90,
] as const;

/**
 * Single revision item.
 */
export interface RevisionEntry {
  /** ISO date string, example: 2026-08-05 */
  date: string;

  /**
   * Number of days after completion.
   * Kept as number because custom revision intervals are allowed.
   */
  offsetDays: number;

  done: boolean;

  doneAt?: string;
}

export interface LearningTopic {
  id: string;

  technology: string;
  topic: string;

  subtopic?: string;

  status: LearningStatus;

  confidence: Confidence;

  difficulty: Difficulty;

  hoursStudied: number;

  lastStudied?: string;

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
