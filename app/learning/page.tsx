"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { LearningStats } from "@/components/learning/learning-stats";
import { LearningFilters } from "@/components/learning/learning-filters";
import { LearningTable } from "@/components/learning/learning-table";
import { LearningFormDialog } from "@/components/learning/learning-form-dialog";
import { RevisionFormDialog } from "@/components/learning/RevisionFormDialog";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useLearningStore } from "@/store/learning-store";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type SelectedTopic = {
  id: string;
  technology: string;
  topic: string;
} | null;

function LearningContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [revisionTopic, setRevisionTopic] = useState<SelectedTopic>(null);
  const { openCreateDialog } = useLearningStore();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. STANDARDIZED PAGE HEADER */}
      <PageHeader
        kicker="Knowledge Engine"
        title="Learning Hub"
        description="Track technologies, topics, scheduled study times, revision cycles, and confidence scores in one place."
      >
        <Button size="md" onClick={openCreateDialog} className="gap-1.5 shadow-md shadow-accent/20">
          <Plus className="h-4 w-4" />
          Add Topic
        </Button>
      </PageHeader>

      {/* 2. STATS */}
      <section>
        <LearningStats />
      </section>

      {/* 3. FILTERS & SEARCH */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <LearningFilters />
        </CardContent>
      </Card>

      {/* 4. TOPICS LIST */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between pb-3 border-b border-base-border/70">
            <div>
              <h2 className="text-base font-bold text-ink">Active Topics</h2>
              <p className="text-xs text-ink-muted">
                Manage your scheduled study sessions and track your progress.
              </p>
            </div>
          </div>

          <LearningTable
            highlightId={highlightId}
            onAddRevision={(topic) => {
              setRevisionTopic(topic);
            }}
          />
        </CardContent>
      </Card>

      {/* ADD / EDIT TOPIC DIALOG */}
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
    </div>
  );
}

export default function LearningPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-sm text-ink-muted">
          Loading Learning Hub...
        </div>
      }
    >
      <LearningContent />
    </Suspense>
  );
}
