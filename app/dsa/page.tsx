"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Brain,
  Clock,
  X,
  CheckCircle2,
  Trash2,
  CalendarClock,
  RotateCcw,
  Loader2,
  Code2,
  Filter,
  Sparkles,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const patterns = [
  "Arrays",
  "Strings",
  "HashMap",
  "Stack",
  "Queue",
  "Linked List",
  "Trees",
  "Graphs",
  "Heap",
  "Trie",
  "Dynamic Programming",
  "Greedy",
  "Backtracking",
  "Sliding Window",
];

const methods = [
  "Brute Force",
  "Two Pointer",
  "Sliding Window",
  "Binary Search",
  "DFS",
  "BFS",
  "Dynamic Programming",
  "Greedy",
  "Backtracking",
  "Divide & Conquer",
  "Recursion",
  "Iteration",
  "Math",
  "Bit Manipulation",
];

type RevisionData = {
  enabled: boolean;
  date: string;
  interval: string;
  notes: string;
  done: boolean;
};

type Problem = {
  id: string | number;
  name: string;
  number: string;
  pattern: string;
  method: string;
  difficulty: string;
  status: string;
  struggle: string;
  learning: string;
  revision: RevisionData;
  image?: string | null;
};

const defaultRevision: RevisionData = {
  enabled: false,
  date: "",
  interval: "7 Days",
  notes: "",
  done: false,
};

export default function DSAPage() {
  const [open, setOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    number: "",
    pattern: "",
    difficulty: "",
    status: "",
    struggle: "",
    learning: "",
    method: "",
    image: "",
    revision: {
      ...defaultRevision,
    },
  });

  // LOAD DATA
  useEffect(() => {
    async function load() {
      setLoading(true);
      const saved = localStorage.getItem("dsa-problems");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProblems(
            parsed.map((item: any) => ({
              ...item,
              revision: item.revision ?? { ...defaultRevision },
              method: item.method ?? "",
            })),
          );
        } catch (e) {}
      }

      const res = await api.dsa.list();
      if (res.data?.problems) {
        const formatted = res.data.problems.map((p: any) => ({
          id: p.id,
          name: p.name,
          number: p.number || "",
          pattern: p.pattern || "Arrays",
          method: p.method || "Two Pointer",
          difficulty: p.difficulty || "Medium",
          status: p.status || "Solved",
          struggle: p.struggle || "",
          learning: p.learning || "",
          image: p.image || null,
          revision: {
            enabled: Boolean(p.revisionEnabled),
            date: p.revisionDate || "",
            interval: p.revisionInterval || "7 Days",
            notes: p.revisionNotes || "",
            done: Boolean(p.revisionDone),
          },
        }));
        setProblems(formatted);
        localStorage.setItem("dsa-problems", JSON.stringify(formatted));
      }
      setLoading(false);
    }
    load();
  }, []);

  // LOAD FORM DRAFT
  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem("dsa-form-draft");
      if (saved) {
        try {
          setForm(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [open]);

  // SAVE FORM DRAFT
  useEffect(() => {
    if (open) {
      localStorage.setItem("dsa-form-draft", JSON.stringify(form));
    }
  }, [form, open]);

  async function addProblem() {
    if (!form.name || !form.pattern) return;

    const tempId = `temp-${Date.now()}`;
    const newProblem: Problem = {
      id: tempId,
      ...form,
    };

    setProblems((prev) => [newProblem, ...prev]);
    localStorage.removeItem("dsa-form-draft");

    setForm({
      name: "",
      number: "",
      pattern: "",
      difficulty: "",
      status: "",
      struggle: "",
      learning: "",
      method: "",
      image: "",
      revision: {
        ...defaultRevision,
      },
    });

    setOpen(false);

    const res = await api.dsa.create(form);
    if (res.data?.problem) {
      const created = res.data.problem;
      setProblems((prev) =>
        prev.map((p) =>
          p.id === tempId
            ? {
                ...p,
                id: created.id,
              }
            : p,
        ),
      );
    }
  }

  async function deleteProblem(id: string | number) {
    const targetId = String(id);
    const updated = problems.filter((problem) => String(problem.id) !== targetId);
    setProblems(updated);
    localStorage.setItem("dsa-problems", JSON.stringify(updated));
    await api.dsa.delete(targetId);
  }

  async function deleteAllProblems() {
    if (!window.confirm("Are you sure you want to delete all DSA problems?")) return;
    setProblems([]);
    localStorage.removeItem("dsa-problems");
    for (const p of problems) {
      api.dsa.delete(String(p.id));
    }
  }

  async function toggleRevision(id: string | number) {
    const targetId = String(id);
    let nextDone = false;

    setProblems((prev) =>
      prev.map((problem) => {
        if (String(problem.id) === targetId) {
          nextDone = !problem.revision.done;
          return {
            ...problem,
            revision: {
              ...problem.revision,
              done: nextDone,
            },
          };
        }
        return problem;
      }),
    );

    const current = problems.find((p) => String(p.id) === targetId);
    if (current) {
      await api.dsa.update(targetId, {
        revision: {
          ...current.revision,
          done: nextDone,
        },
      });
    }
  }

  const filteredProblems = selectedPattern
    ? problems.filter((problem) => problem.pattern === selectedPattern)
    : problems;

  const methodFilteredProblems = selectedMethod
    ? filteredProblems.filter((problem) => problem.method === selectedMethod)
    : filteredProblems;

  const totalSolved = problems.filter((p) => p.status === "Solved").length;
  const needsRevision = problems.filter((p) => p.revision.enabled && !p.revision.done).length;
  const distinctPatternsUsed = new Set(problems.map((p) => p.pattern)).size;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. STANDARDIZED PAGE HEADER */}
      <PageHeader
        kicker="Algorithmic Vault"
        title="DSA Knowledge Base"
        description="Store problems, tricky edge cases, approaches, and spaced recall schedules with PostgreSQL persistence."
      >
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              setForm({
                name: "",
                number: "",
                pattern: "",
                method: "",
                difficulty: "",
                status: "",
                struggle: "",
                learning: "",
                image: "",
                revision: {
                  ...defaultRevision,
                },
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="md" className="gap-1.5 shadow-md shadow-accent/20">
              <Plus className="h-4 w-4" />
              Add Problem
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border border-base-border bg-card shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-base-border px-6 py-4 bg-card/60 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Code2 className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-ink">
                    Add DSA Problem
                  </DialogTitle>
                  <p className="text-xs text-ink-muted">
                    Save intuition, pitfalls, and spaced revision settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-130px)]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Problem Name</label>
                  <Input
                    placeholder="e.g. Trapping Rain Water"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Number</label>
                  <Input
                    placeholder="e.g. 42"
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Pattern</label>
                  <Select
                    value={form.pattern}
                    onValueChange={(value) => setForm({ ...form, pattern: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      {patterns.map((pattern) => (
                        <SelectItem key={pattern} value={pattern}>
                          {pattern}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Method</label>
                  <Select
                    value={form.method}
                    onValueChange={(value) => setForm({ ...form, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      {methods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Difficulty</label>
                  <Select
                    value={form.difficulty}
                    onValueChange={(value) => setForm({ ...form, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solved">Solved</SelectItem>
                    <SelectItem value="Revision">Need Revision</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">What was difficult / Pitfalls?</label>
                <Textarea
                  rows={2}
                  placeholder="Edge cases missed, indexing bugs, off-by-one errors..."
                  value={form.struggle}
                  onChange={(e) => setForm({ ...form, struggle: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Core Learning & Key Takeaway</label>
                <Textarea
                  rows={2}
                  placeholder="Key algorithmic pattern or intuition used to solve it..."
                  value={form.learning}
                  onChange={(e) => setForm({ ...form, learning: e.target.value })}
                />
              </div>

              {/* REVISION CONFIG */}
              <div className="rounded-xl border border-base-border bg-base-raised p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-accent" />
                    <span className="font-semibold text-xs text-ink">Revision Reminder</span>
                  </div>

                  <Button
                    type="button"
                    variant={form.revision.enabled ? "primary" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      setForm({
                        ...form,
                        revision: {
                          ...form.revision,
                          enabled: !form.revision.enabled,
                        },
                      })
                    }
                  >
                    {form.revision.enabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                {form.revision.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <Input
                      type="date"
                      value={form.revision.date}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          revision: {
                            ...form.revision,
                            date: e.target.value,
                          },
                        })
                      }
                    />

                    <Select
                      value={form.revision.interval}
                      onValueChange={(value) =>
                        setForm({
                          ...form,
                          revision: {
                            ...form.revision,
                            interval: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 Day">1 Day</SelectItem>
                        <SelectItem value="7 Days">7 Days</SelectItem>
                        <SelectItem value="30 Days">30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-base-border px-6 py-3.5 bg-card/60 backdrop-blur-sm shrink-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={addProblem}>
                Save Problem
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* 2. STATS */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Problems"
          value={problems.length}
          icon={Code2}
          iconColor="text-blue-500 bg-blue-500/10"
        />
        <StatCard
          title="Solved"
          value={totalSolved}
          icon={CheckCircle2}
          iconColor="text-signal-high bg-signal-high/10"
        />
        <StatCard
          title="Patterns Explored"
          value={`${distinctPatternsUsed}/${patterns.length}`}
          icon={Brain}
          iconColor="text-purple-500 bg-purple-500/10"
        />
        <StatCard
          title="Needs Revision"
          value={needsRevision}
          icon={CalendarClock}
          iconColor="text-accent bg-accent/10"
        />
      </section>

      {/* 3. PATTERNS PILL BAR */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-base-border/70 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Filter by Pattern
            </h2>
            {selectedPattern && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-ink-muted hover:text-ink"
                onClick={() => setSelectedPattern(null)}
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {patterns.map((pattern) => {
              const count = problems.filter((p) => p.pattern === pattern).length;
              const isSelected = selectedPattern === pattern;

              return (
                <button
                  key={pattern}
                  onClick={() => setSelectedPattern(isSelected ? null : pattern)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                    isSelected
                      ? "border-accent bg-accent/15 text-accent font-semibold shadow-sm"
                      : "border-base-border bg-base-raised/60 text-ink-muted hover:border-base-borderStrong hover:text-ink",
                  )}
                >
                  <span>{pattern}</span>
                  {count > 0 && (
                    <span className="rounded-full bg-base-elevated px-1.5 py-0.2 text-[10px] font-bold text-ink">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. PROBLEMS LIST */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-base-border/70 mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink">
                {selectedPattern
                  ? `${selectedPattern} Problems`
                  : selectedMethod
                    ? `${selectedMethod} Problems`
                    : "All Problems"}
              </h2>
              <span className="rounded-full bg-base-elevated px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
                {methodFilteredProblems.length}
              </span>
            </div>

            {problems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-signal-low hover:bg-signal-low/10"
                onClick={deleteAllProblems}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {loading && problems.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center gap-2 text-xs text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              Loading problems...
            </div>
          ) : methodFilteredProblems.length === 0 ? (
            <EmptyState
              icon={Code2}
              title="No problems found"
              description="No problems match your current pattern filter. Click 'Add Problem' above to track a new problem."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {methodFilteredProblems.map((problem) => {
                const diffColor =
                  problem.difficulty === "Easy"
                    ? "text-signal-high bg-signal-high/10 border-signal-high/20"
                    : problem.difficulty === "Hard"
                      ? "text-signal-low bg-signal-low/10 border-signal-low/20"
                      : "text-signal-mid bg-signal-mid/10 border-signal-mid/20";

                return (
                  <div
                    key={String(problem.id)}
                    className="rounded-2xl border border-base-border/80 bg-base-raised/40 p-4 sm:p-5 space-y-3 transition-all hover:border-base-borderStrong/80"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {problem.number && (
                          <span className="font-mono text-xs text-ink-faint">
                            #{problem.number}
                          </span>
                        )}
                        <h3 className="font-bold text-base text-ink">{problem.name}</h3>
                        <span className="rounded-md bg-base-elevated px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                          {problem.pattern}
                        </span>
                        {problem.method && (
                          <span className="rounded-md bg-base-elevated px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                            {problem.method}
                          </span>
                        )}
                        <span className={cn("rounded-md border px-2 py-0.5 text-[11px] font-semibold", diffColor)}>
                          {problem.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        {problem.revision.enabled && (
                          <Button
                            size="sm"
                            variant={problem.revision.done ? "outline" : "primary"}
                            className="h-8 text-xs gap-1"
                            onClick={() => toggleRevision(problem.id)}
                          >
                            <RotateCcw className="h-3 w-3" />
                            {problem.revision.done ? "Revised" : "Revise"}
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-signal-low hover:bg-signal-low/10"
                          onClick={() => deleteProblem(problem.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Learnings & Struggles */}
                    {(problem.struggle || problem.learning) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                        {problem.struggle && (
                          <div className="rounded-xl border border-base-border/70 bg-base-raised/60 p-3 space-y-1">
                            <span className="font-semibold text-signal-low">Pitfalls & Struggles:</span>
                            <p className="text-ink-muted leading-relaxed">{problem.struggle}</p>
                          </div>
                        )}
                        {problem.learning && (
                          <div className="rounded-xl border border-base-border/70 bg-base-raised/60 p-3 space-y-1">
                            <span className="font-semibold text-signal-high">Core Intuition:</span>
                            <p className="text-ink-muted leading-relaxed">{problem.learning}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {problem.image && (
                      <img
                        src={problem.image}
                        alt="Problem visual"
                        className="rounded-xl mt-2 h-44 w-full object-cover border border-base-border"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
