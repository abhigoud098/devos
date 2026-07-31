export function LearningSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-xl bg-base-raised border border-base-border animate-pulse"
        />
      ))}
    </div>
  );
}
