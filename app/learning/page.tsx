"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

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
      {/* Hero */}

      <section className="mb-8 rounded-2xl border border-border/60 bg-card/60 p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Developer Second Brain
            </span>

            <h1 className="text-4xl font-bold tracking-tight">Learning</h1>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Track every technology, topic, revision, confidence score, and
              study hour in one place. This is the foundation of your entire
              developer journey.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}

      <section className="mb-8">
        <LearningStats />
      </section>

      {/* Filters */}

      <section className="mb-6 rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-sm">
        <LearningFilters />
      </section>

      {/* Topics */}

      <section className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Technologies & Topics</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Browse everything you're learning and continue where you left off.
            </p>
          </div>
        </div>

        <LearningTable
          onAddRevision={(topic) => {
            setRevisionTopic(topic);
          }}
        />
      </section>

      {/* Add Learning Topic */}

      <LearningFormDialog />

      {/* Add Revision Dialog */}

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
