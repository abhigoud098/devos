"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/lib/db";
import { deleteTopic } from "@/lib/learning-repo";

type Props = {
  onAddRevision: (topic: {
    id: string;
    technology: string;
    topic: string;
  }) => void;
};

export function LearningTable({ onAddRevision }: Props) {
  const topics = useLiveQuery(
    () =>
      db.learningTopics
        .filter((item) => {
          // Hide only topics whose complete revision cycle is finished

          const revisionCompleted =
            item.revisionSchedule?.length > 0 &&
            item.revisionSchedule.every((revision) => revision.done);

          return !revisionCompleted;
        })
        .toArray(),
    [],
  );

  if (!topics) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        Loading topics...
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-muted-foreground">No active learning topics.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-sm text-muted-foreground">
            <th className="p-4">Technology</th>

            <th className="p-4">Topic</th>

            <th className="p-4">Image</th>

            <th className="p-4">Confidence</th>

            <th className="p-4">Created</th>

            <th className="p-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {topics.map((item) => (
            <tr
              key={item.id}
              className="
              border-b
              transition
              hover:bg-muted/40
              "
            >
              <td className="p-4 font-medium">{item.technology}</td>

              <td className="p-4">{item.topic}</td>

              <td className="p-4">
                {item.image && (
                  <img
                    src={item.image}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                )}
              </td>

              <td className="p-4">
                <span
                  className="
                  rounded-full
                  bg-primary/10
                  px-3
                  py-1
                  text-xs
                  text-primary
                  "
                >
                  {item.confidence ?? 0}%
                </span>
              </td>

              <td className="p-4 text-sm text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </td>

              <td className="p-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      const confirmDelete =
                        window.confirm("Delete this topic?");

                      if (confirmDelete) {
                        await deleteTopic(item.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
