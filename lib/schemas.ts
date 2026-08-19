import { z } from "zod";

export const learningFormSchema = z.object({
  technology: z.string().min(1, "Required"),
  topic: z.string().min(1, "Required"),
  subtopic: z.string().optional(),
  status: z.enum(["not-started", "in-progress", "completed", "revising"]),
  confidence: z.union([z.coerce.number().min(1).max(5), z.literal("NA")]),
  difficulty: z.enum(["easy", "medium", "hard", "NA"]),
  hoursStudied: z.coerce.number().min(0, "Must be 0 or more"),
  notes: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  image: z.string().optional(),
  needRevision: z.boolean().default(false),
});

export type LearningFormSchema = z.infer<typeof learningFormSchema>;
