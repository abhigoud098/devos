"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLiveQuery } from "dexie-react-hooks";
import { format, addDays } from "date-fns";
import { Calendar, Clock, BookOpen, Sparkles, X } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  scheduledDate: "",
  scheduledTime: "10:00",
  needRevision: false,
};

export function LearningFormDialog() {
  const { dialogOpen, editingId, closeDialog } = useLearningStore();

  const editingTopic = useLiveQuery(
    () => (editingId ? db.learningTopics.get(editingId) : undefined),
    [editingId],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<LearningFormSchema>({
    resolver: zodResolver(learningFormSchema),
    defaultValues: DEFAULTS,
  });

  const formValues = watch();

  useEffect(() => {
    if (!dialogOpen) return;

    if (editingTopic) {
      reset({
        ...DEFAULTS,
        ...editingTopic,
        scheduledDate: editingTopic.scheduledDate || "",
        scheduledTime: editingTopic.scheduledTime || "10:00",
      });
    } else {
      const savedDraft = localStorage.getItem("learning-topic-draft");
      if (savedDraft) {
        try {
          reset({
            ...DEFAULTS,
            ...JSON.parse(savedDraft),
          });
        } catch (e) {
          reset(DEFAULTS);
        }
      } else {
        reset(DEFAULTS);
      }
    }
  }, [dialogOpen, editingTopic, reset]);

  useEffect(() => {
    if (dialogOpen && !editingId) {
      localStorage.setItem("learning-topic-draft", JSON.stringify(formValues));
    }
  }, [formValues, dialogOpen, editingId]);

  function setDatePreset(offsetDays: number) {
    const target = addDays(new Date(), offsetDays);
    setValue("scheduledDate", format(target, "yyyy-MM-dd"), {
      shouldDirty: true,
    });
  }

  function setTimePreset(timeStr: string) {
    setValue("scheduledTime", timeStr, {
      shouldDirty: true,
    });
  }

  async function onSubmit(values: LearningFormSchema) {
    if (editingId) {
      await updateTopic(editingId, values);
    } else {
      await createTopic(values);
      localStorage.removeItem("learning-topic-draft");
    }

    reset(DEFAULTS);
    closeDialog();
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border border-base-border bg-card shadow-2xl rounded-2xl">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-base-border px-6 py-4 bg-card/60 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-ink">
                {editingId ? "Edit Learning Topic" : "Add Learning Topic"}
              </DialogTitle>
              <p className="text-xs text-ink-muted">
                Track technologies, schedules, notes and spaced repetition.
              </p>
            </div>
          </div>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <form
          id="learning-topic-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-130px)]"
        >
          {/* Row 1: Technology & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-ink">Technology</Label>
              <Input
                placeholder="e.g. React, PostgreSQL, Go"
                className="h-10 bg-base-raised"
                {...register("technology")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-ink">Topic</Label>
              <Input
                placeholder="e.g. Hooks & Lifecycle"
                className="h-10 bg-base-raised"
                {...register("topic")}
              />
            </div>
          </div>

          {/* Row 2: Subtopic & Hours Studied */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold text-ink">Sub Topic</Label>
              <Input
                placeholder="e.g. useEffect cleanup & memory leaks"
                className="h-10 bg-base-raised"
                {...register("subtopic")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-ink">Hours Studied</Label>
              <Input
                type="number"
                step="0.25"
                min="0"
                placeholder="0"
                className="h-10 bg-base-raised"
                {...register("hoursStudied", {
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>

          {/* Row 3: Status, Difficulty, Confidence */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-ink">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 bg-base-raised">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="revising">Revising</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-ink">Difficulty</Label>
              <Controller
                control={control}
                name="difficulty"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 bg-base-raised">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NA">?</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-ink">Confidence</Label>
              <Controller
                control={control}
                name="confidence"
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => {
                      field.onChange(value === "NA" ? "NA" : Number(value));
                    }}
                  >
                    <SelectTrigger className="h-10 bg-base-raised">
                      <SelectValue placeholder="Confidence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NA">?</SelectItem>
                      <SelectItem value="1">1/5</SelectItem>
                      <SelectItem value="2">2/5</SelectItem>
                      <SelectItem value="3">3/5</SelectItem>
                      <SelectItem value="4">4/5</SelectItem>
                      <SelectItem value="5">5/5</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Row 4: Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-ink">Notes & Concepts</Label>
            <Textarea
              rows={2}
              placeholder="Key takeaways, formulas, code snippets..."
              className="min-h-[70px] bg-base-raised text-sm"
              {...register("notes")}
            />
          </div>

          {/* Row 5: SCHEDULE WORK / STUDY DATE & TIME */}
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold text-accent">
                  Scheduled Study Date & Time
                </span>
              </div>
              <span className="text-[11px] text-ink-muted">
                Reminder on app open
              </span>
            </div>

            <p className="text-[11px] text-ink-muted leading-relaxed">
              Set when you want to work on or learn this topic. DevOS will send you a reminder notification when you open the app on that day.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
              <div>
                <Label className="text-[11px] text-ink-muted mb-1 block">Date</Label>
                <Input
                  type="date"
                  className="h-9 bg-base-raised text-xs"
                  {...register("scheduledDate")}
                />
              </div>

              <div>
                <Label className="text-[11px] text-ink-muted mb-1 block">Time</Label>
                <Input
                  type="time"
                  className="h-9 bg-base-raised text-xs"
                  {...register("scheduledTime")}
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5 pt-1 border-t border-accent/20">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-medium text-ink-faint mr-1">Date:</span>
                <button
                  type="button"
                  onClick={() => setDatePreset(0)}
                  className="rounded-lg border border-base-border bg-base-raised px-2 py-0.5 text-[11px] font-medium text-ink-muted hover:border-accent hover:text-accent transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset(1)}
                  className="rounded-lg border border-base-border bg-base-raised px-2 py-0.5 text-[11px] font-medium text-ink-muted hover:border-accent hover:text-accent transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset(3)}
                  className="rounded-lg border border-base-border bg-base-raised px-2 py-0.5 text-[11px] font-medium text-ink-muted hover:border-accent hover:text-accent transition-colors"
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset(7)}
                  className="rounded-lg border border-base-border bg-base-raised px-2 py-0.5 text-[11px] font-medium text-ink-muted hover:border-accent hover:text-accent transition-colors"
                >
                  +1 Week
                </button>
                {formValues.scheduledDate && (
                  <button
                    type="button"
                    onClick={() => setValue("scheduledDate", "")}
                    className="ml-auto text-[10px] text-signal-low hover:underline"
                  >
                    Clear date
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-medium text-ink-faint mr-1">Time:</span>
                <button
                  type="button"
                  onClick={() => setTimePreset("09:00")}
                  className="rounded-lg border border-base-border bg-base-raised px-2 py-0.5 text-[10px] text-ink-muted hover:border-accent hover:text-accent transition-colors"
                >
                  9:00 AM
                </button>
                <button
                  type="button"
                  onClick={() => setTimePreset("14:00")}
                  className="rounded-lg border border-base-border bg-base-raised px-2 py-0.5 text-[10px] text-ink-muted hover:border-accent hover:text-accent transition-colors"
                >
                  2:00 PM
                </button>
                <button
                  type="button"
                  onClick={() => setTimePreset("18:00")}
                  className="rounded-lg border border-base-border bg-base-raised px-2 py-0.5 text-[10px] text-ink-muted hover:border-accent hover:text-accent transition-colors"
                >
                  6:00 PM
                </button>
                <button
                  type="button"
                  onClick={() => setTimePreset("21:00")}
                  className="rounded-lg border border-base-border bg-base-raised px-2 py-0.5 text-[10px] text-ink-muted hover:border-accent hover:text-accent transition-colors"
                >
                  9:00 PM
                </button>
              </div>
            </div>
          </div>

          {/* Row 6: REVISION OPTION */}
          <div className="rounded-xl border border-base-border bg-base-raised p-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-xs text-ink">Need Revision?</h3>
              <p className="text-[11px] text-ink-muted">
                Automatically create spaced repetition schedule
              </p>
            </div>

            <Controller
              control={control}
              name="needRevision"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </form>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-end gap-3 border-t border-base-border px-6 py-3.5 bg-card/60 backdrop-blur-sm shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={closeDialog}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="learning-topic-form"
            size="sm"
            disabled={isSubmitting}
          >
            {editingId ? "Save Changes" : "Start Learning"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
