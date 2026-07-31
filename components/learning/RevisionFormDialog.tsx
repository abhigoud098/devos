"use client";

import { useState } from "react";

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

  async function handleSubmit() {
    if (!topic || !date) {
      return;
    }

    const existingTopic = await db.learningTopics.get(topic.id);

    if (!existingTopic) {
      return;
    }

    const newRevision = {
      date,

      offsetDays: Number(interval),

      done: false,
    };

    await db.learningTopics.update(topic.id, {
      revisionSchedule: [
        ...(existingTopic.revisionSchedule ?? []),

        newRevision,
      ],
    });

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
            <Label>Revision Interval</Label>

            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="1">Tomorrow</SelectItem>

                <SelectItem value="3">After 3 Days</SelectItem>

                <SelectItem value="7">After 7 Days</SelectItem>

                <SelectItem value="14">After 14 Days</SelectItem>

                <SelectItem value="30">After 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Notes</Label>

            <Input
              className="mt-2"
              placeholder="Revision notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
