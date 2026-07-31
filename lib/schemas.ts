import { z } from "zod";

export const learningFormSchema = z.object({
  technology: z.string().min(1, "Required"),
  topic: z.string().min(1, "Required"),
  subtopic: z.string().optional(),
  status: z.enum(["not-started", "in-progress", "completed", "revising"]),
  confidence: z.coerce.number().min(1).max(5) as unknown as z.ZodType<1 | 2 | 3 | 4 | 5>,
  difficulty: z.enum(["easy", "medium", "hard"]),
  hoursStudied: z.coerce.number().min(0, "Must be 0 or more"),
  notes: z.string().optional(),
});

export type LearningFormSchema = z.infer<typeof learningFormSchema>;
