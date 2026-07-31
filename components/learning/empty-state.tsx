import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LearningEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-base-border py-20 text-center">
      <div className="h-11 w-11 rounded-xl bg-base-elevated flex items-center justify-center mb-4">
        <BookOpen className="h-5 w-5 text-ink-muted" strokeWidth={1.75} />
      </div>
      <p className="text-[14px] text-ink mb-1">No topics logged yet</p>
      <p className="text-[13px] text-ink-muted max-w-xs mb-5">
        Add the first technology or topic you're studying — DevOS will track your confidence,
        hours, and revisions from here.
      </p>
      <Button size="sm" onClick={onCreate}>
        Add your first topic
      </Button>
    </div>
  );
}
