"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLiveQuery } from "dexie-react-hooks";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLearningStore } from "@/store/learning-store";
import { learningFormSchema, type LearningFormSchema } from "@/lib/schemas";
import { createTopic, updateTopic } from "@/lib/learning-repo";
import { db } from "@/lib/db";

const DEFAULTS: LearningFormSchema = {
  technology: "",
  topic: "",
  subtopic: "",
  status: "not-started",
  confidence: 3,
  difficulty: "medium",
  hoursStudied: 0,
  notes: "",
};

export function LearningFormDialog() {
  const { dialogOpen, editingId, closeDialog } = useLearningStore();
  const editingTopic = useLiveQuery(
    () => (editingId ? db.learningTopics.get(editingId) : undefined),
    [editingId]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LearningFormSchema>({
    resolver: zodResolver(learningFormSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (dialogOpen) {
      reset(editingTopic ? { ...DEFAULTS, ...editingTopic } : DEFAULTS);
    }
  }, [dialogOpen, editingTopic, reset]);

  async function onSubmit(values: LearningFormSchema) {
    if (editingId) {
      await updateTopic(editingId, values);
    } else {
      await createTopic(values);
    }
    closeDialog();
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent title={editingId ? "Edit topic" : "Add a topic"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Technology</Label>
              <Input placeholder="React" {...register("technology")} />
              {errors.technology && (
                <p className="text-[11px] text-signal-low">{errors.technology.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Topic</Label>
              <Input placeholder="Hooks" {...register("topic")} />
              {errors.topic && <p className="text-[11px] text-signal-low">{errors.topic.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Subtopic (optional)</Label>
            <Input placeholder="useEffect cleanup" {...register("subtopic")} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Not started</SelectItem>
                      <SelectItem value="in-progress">In progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="revising">Revising</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Controller
                control={control}
                name="difficulty"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Confidence</Label>
              <Controller
                control={control}
                name="confidence"
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} / 5
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Hours studied</Label>
            <Input type="number" step="0.25" min={0} {...register("hoursStudied")} />
            {errors.hoursStudied && (
              <p className="text-[11px] text-signal-low">{errors.hoursStudied.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={3} placeholder="Anything worth remembering…" {...register("notes")} />
          </div>

          <p className="text-[11.5px] text-ink-faint">
            Marking this <span className="text-ink-muted">Completed</span> auto-schedules
            revisions for Day 1, 2, 5, 7, 10, 15, 21, 30, 60 and 90.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editingId ? "Save changes" : "Add topic"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
