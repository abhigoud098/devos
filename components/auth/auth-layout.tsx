import Link from "next/link";
import { Code2, ShieldCheck } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-base px-4 py-8 sm:px-6">
      <div aria-hidden className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
      <div aria-hidden className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <section className="relative w-full max-w-md animate-slide-up rounded-2xl border border-base-border bg-base-raised/95 p-6 shadow-card sm:p-8">
        <Link href="/" className="mb-9 inline-flex items-center gap-2.5 text-lg font-semibold text-ink transition-opacity hover:opacity-80">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-white shadow-lg shadow-accent/25"><Code2 className="h-5 w-5" /></span>
          <span>DevOS</span>
        </Link>
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-base-border bg-base-elevated px-2.5 py-1 text-[11px] font-medium text-ink-muted"><ShieldCheck className="h-3.5 w-3.5 text-signal-high" /> Local-first and private</div>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-[2rem]">{title}</h1>
        <p className="mt-2.5 text-sm leading-6 text-ink-muted">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  );
}
