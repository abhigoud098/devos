"use client";

import { useState } from "react";

import { LearningStats } from "@/components/learning/learning-stats";
import { LearningFilters } from "@/components/learning/learning-filters";
import { LearningTable } from "@/components/learning/learning-table";
import { LearningFormDialog } from "@/components/learning/learning-form-dialog";
import { RevisionFormDialog } from "@/components/learning/RevisionFormDialog";

type SelectedTopic = {
  id: string;
  technology: string;
  topic: string;
} | null;

export default function LearningPage() {
  const [revisionTopic, setRevisionTopic] = useState<SelectedTopic>(null);

  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      {/* HERO */}

      <section
        className="
        mb-8
        rounded-2xl
        border
        border-border/60
        bg-card/60
        p-8
        backdrop-blur-sm
        "
      >
        <div
          className="
          flex
          flex-col
          gap-6
          lg:flex-row
          lg:items-end
          lg:justify-between
          "
        >
          <div className="max-w-2xl">
            <span
              className="
              mb-3
              inline-flex
              rounded-full
              border
              border-primary/20
              bg-primary/10
              px-3
              py-1
              text-xs
              font-medium
              text-primary
              "
            >
              Developer Second Brain
            </span>

            <h1
              className="
              text-4xl
              font-bold
              tracking-tight
              "
            >
              Learning
            </h1>

            <p
              className="
              mt-4
              text-sm
              leading-7
              text-muted-foreground
              "
            >
              Track technologies, topics, revision cycles, confidence score, and
              study progress in one place. Completed revision journeys are
              automatically archived.
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}

      <section className="mb-8">
        <LearningStats />
      </section>

      {/* FILTERS */}

      <section
        className="
        mb-6
        rounded-2xl
        border
        border-border/60
        bg-card/40
        p-5
        backdrop-blur-sm
        "
      >
        <LearningFilters />
      </section>

      {/* TOPICS */}

      <section
        className="
        rounded-2xl
        border
        border-border/60
        bg-card/40
        p-5
        backdrop-blur-sm
        "
      >
        <div
          className="
          mb-5
          flex
          items-center
          justify-between
          "
        >
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Technologies & Topics</h2>

              <span
                className="
                rounded-full
                bg-emerald-500/10
                px-3
                py-1
                text-xs
                text-emerald-600
                "
              >
                Active Learning
              </span>
            </div>

            <p
              className="
              mt-1
              text-sm
              text-muted-foreground
              "
            >
              Continue learning topics and complete your revision cycles.
            </p>
          </div>
        </div>

        <LearningTable
          onAddRevision={(topic) => {
            setRevisionTopic(topic);
          }}
        />
      </section>

      {/* ADD TOPIC */}

      <LearningFormDialog />

      {/* REVISION DIALOG */}

      <RevisionFormDialog
        topic={revisionTopic}
        open={!!revisionTopic}
        onOpenChange={(open) => {
          if (!open) {
            setRevisionTopic(null);
          }
        }}
      />
    </main>
  );
}
