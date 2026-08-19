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
  image: "",
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

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert("Image size must be less than 1MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setValue("image", reader.result as string);
    };
    reader.readAsDataURL(file);
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
      <DialogContent title={editingId ? "Edit Topic" : "Add Topic"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Technology</Label>

              <Input placeholder="React" {...register("technology")} />
            </div>

            <div>
              <Label>Topic</Label>

              <Input placeholder="Hooks" {...register("topic")} />
            </div>
          </div>

          <div>
            <Label>Sub Topic</Label>

            <Input placeholder="useEffect cleanup" {...register("subtopic")} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
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

            <Controller
              control={control}
              name="difficulty"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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

          <div>
            <Label>Hours Studied</Label>

            <Input
              type="number"
              step="0.25"
              {...register("hoursStudied", {
                valueAsNumber: true,
              })}
            />
          </div>

          <div>
            <Label>Notes</Label>

            <Textarea rows={4} {...register("notes")} />
          </div>

          <div>
            <Label>Image</Label>

            <Input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="mt-2"
            />

            {formValues.image && (
              <img
                src={formValues.image}
                className="rounded-lg mt-2 h-32 w-full object-cover"
              />
            )}
          </div>

          {/* REVISION OPTION */}

          <div className="rounded-xl border p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Need Revision?</h3>

              <p className="text-sm text-muted-foreground">
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

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeDialog}>
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {editingId ? "Save Changes" : "Start Learning"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
