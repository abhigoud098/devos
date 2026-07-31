export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-8 py-7 max-w-5xl">
      <h1 className="text-[20px] font-semibold tracking-tight text-ink mb-1">{title}</h1>
      <p className="text-[13px] text-ink-muted mb-8">{description}</p>
      <div className="rounded-2xl border border-dashed border-base-border py-20 text-center">
        <p className="text-[13px] text-ink-faint">
          This section is next on the build roadmap — not implemented yet.
        </p>
      </div>
    </div>
  );
}
