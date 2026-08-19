export type LearningStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "revising";

export type Confidence = number | "NA";

export type Difficulty = "easy" | "medium" | "hard" | "NA";

export type RevisionSource = "learning" | "system" | "custom" | "manual";

export const REVISION_OFFSETS_DAYS = [
  1, 2, 5, 7, 10, 15, 21, 30, 60, 90,
] as const;

export interface Resource {
  title: string;

  url?: string;

  type?: string;
}

export interface RevisionEntry {
  id: string;

  date: string;

  done: boolean;

  doneAt?: string;

  /**
   * Number of times this revision was reviewed
   */
  reviewCount?: number;

  /**
   * Where revision was generated from
   */
  source?: RevisionSource;

  /**
   * Spaced repetition day offset
   */
  offsetDays: number;

  /**
   * When this revision item was created
   */
  createdAt?: string;

  /**
   * Optional user notes
   */
  notes?: string;
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
  image?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledAt?: string;
  resources: Resource[];
  interviewQuestions: string[];
  needRevision: boolean;
  revisionSchedule: RevisionEntry[];
  revisionStats?: {
    total: number;
    completed: number;
    lastRevision?: string;
    retention: number;
    totalReviews?: number;
  };
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
  image?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  needRevision: boolean;
}
