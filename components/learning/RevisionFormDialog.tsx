"use client";

import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { db } from "@/lib/db";

import { createRevisionEntry } from "@/lib/revision";

type Topic = {
  id: string;
  technology: string;
  topic: string;
};

type Props = {
  topic: Topic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RevisionFormDialog({ topic, open, onOpenChange }: Props) {
  const [date, setDate] = useState("");

  const [interval, setInterval] = useState("7");

  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem("revision-form-draft");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setDate(parsed.date || "");
          setInterval(parsed.interval || "7");
          setNotes(parsed.notes || "");
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      localStorage.setItem(
        "revision-form-draft",
        JSON.stringify({ date, interval, notes })
      );
    }
  }, [date, interval, notes, open]);

  async function handleSubmit() {
    if (!topic || !date) return;

    const existingTopic = await db.learningTopics.get(topic.id);

    if (!existingTopic) return;

    const alreadyExists = existingTopic.revisionSchedule.some(
      (revision) => revision.date === date,
    );

    if (alreadyExists) {
      alert("Revision already scheduled for this date");

      return;
    }

    const newRevision = createRevisionEntry(
      date,
      Number(interval),
      "custom",
      notes,
    );

    const updatedSchedule = [
      ...existingTopic.revisionSchedule,
      newRevision,
    ].sort((a, b) => a.date.localeCompare(b.date));

    await db.learningTopics.update(topic.id, {
      revisionSchedule: updatedSchedule,

      status: "revising",

      updatedAt: new Date().toISOString(),
    });

    localStorage.removeItem("revision-form-draft");

    setDate("");

    setInterval("7");

    setNotes("");

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Revision</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label>Technology</Label>

            <Input className="mt-2" value={topic?.technology ?? ""} disabled />
          </div>

          <div>
            <Label>Topic</Label>

            <Input className="mt-2" value={topic?.topic ?? ""} disabled />
          </div>

          <div>
            <Label>Revision Date</Label>

            <Input
              className="mt-2"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <Label>Repeat After</Label>

            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="1">After 1 Day</SelectItem>

                <SelectItem value="3">After 3 Days</SelectItem>

                <SelectItem value="7">After 7 Days</SelectItem>

                <SelectItem value="14">After 14 Days</SelectItem>

                <SelectItem value="30">After 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Revision Notes</Label>

            <Input
              className="mt-2"
              placeholder="What to revise..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button onClick={handleSubmit}>Save Revision</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
