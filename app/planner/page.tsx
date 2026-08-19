"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Target,
  Clock,
  Plus,
  Calendar,
  Trash2,
  Pencil,
  Loader2,
  CheckSquare,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Task = {
  id: string | number;
  title: string;
  description: string;
  date: string;
  hours: string;
  status: "Pending" | "Completed";
  image?: string | null;
};

export default function PlannerPage() {
  const emptyForm = {
    title: "",
    description: "",
    date: "",
    hours: "1",
    image: "",
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [form, setForm] = useState(emptyForm);

  // LOAD
  useEffect(() => {
    async function load() {
      setLoading(true);
      const saved = localStorage.getItem("planner-tasks");
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch (e) {}
      }

      const res = await api.planner.list();
      if (res.data?.tasks) {
        setTasks(res.data.tasks);
        localStorage.setItem("planner-tasks", JSON.stringify(res.data.tasks));
      }
      setLoading(false);
    }
    load();
  }, []);

  // LOAD FORM DRAFT
  useEffect(() => {
    if (open && editId === null) {
      const saved = localStorage.getItem("planner-form-draft");
      if (saved) {
        try {
          setForm(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [open, editId]);

  // SAVE FORM DRAFT
  useEffect(() => {
    if (editId === null && open) {
      localStorage.setItem("planner-form-draft", JSON.stringify(form));
    }
  }, [form, editId, open]);

  async function saveTask() {
    if (!form.title || !form.date) return;

    if (editId) {
      const targetId = String(editId);
      setTasks((prev) =>
        prev.map((t) => (String(t.id) === targetId ? { ...t, ...form } : t)),
      );
      const res = await api.planner.update(targetId, form);
      if (res.data?.task) {
        setTasks((prev) =>
          prev.map((t) => (String(t.id) === targetId ? res.data!.task : t)),
        );
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const newTask: Task = { id: tempId, status: "Pending", ...form };
      setTasks((prev) => [newTask, ...prev]);

      const res = await api.planner.create({ ...form, status: "Pending" });
      if (res.data?.task) {
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? res.data!.task : t)),
        );
      }
    }

    setForm(emptyForm);
    setEditId(null);
    setOpen(false);
    localStorage.removeItem("planner-form-draft");
  }

  function editTask(task: Task) {
    setForm({
      title: task.title,
      description: task.description,
      date: task.date,
      hours: task.hours,
      image: task.image || "",
    });
    setEditId(task.id);
    setOpen(true);
  }

  async function deleteTask(id: string | number) {
    const targetId = String(id);
    const updated = tasks.filter((task) => String(task.id) !== targetId);
    setTasks(updated);
    localStorage.setItem("planner-tasks", JSON.stringify(updated));
    await api.planner.delete(targetId);
  }

  async function toggleTask(id: string | number) {
    const targetId = String(id);
    const current = tasks.find((t) => String(t.id) === targetId);
    if (!current) return;

    const nextStatus = current.status === "Pending" ? "Completed" : "Pending";
    setTasks((prev) =>
      prev.map((t) => (String(t.id) === targetId ? { ...t, status: nextStatus } : t)),
    );

    await api.planner.update(targetId, { status: nextStatus });
  }

  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const totalHours = tasks.reduce(
    (acc, curr) => acc + (parseFloat(curr.hours) || 0),
    0,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. STANDARDIZED PAGE HEADER */}
      <PageHeader
        kicker="Schedule & Agenda"
        title="Study Planner"
        description="Organize your learning milestones, estimate study hours, and track daily execution."
      >
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              setEditId(null);
              setForm(emptyForm);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              size="md"
              className="gap-1.5 shadow-md shadow-accent/20"
              onClick={() => {
                setEditId(null);
                setForm(emptyForm);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border border-base-border bg-card shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-base-border px-6 py-4 bg-card/60 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-ink">
                    {editId ? "Edit Task" : "Schedule Task"}
                  </DialogTitle>
                  <p className="text-xs text-ink-muted">
                    Set target date and estimated duration.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-130px)]">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Task Title</label>
                <Input
                  placeholder="e.g. Build GraphQL Resolvers & Auth Middleware"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Description & Scope</label>
                <Textarea
                  rows={3}
                  placeholder="Subtasks, reading links, and goals..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Target Date</label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Estimated Hours</label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.25"
                    placeholder="1.5"
                    value={form.hours}
                    onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-base-border px-6 py-3.5 bg-card/60 backdrop-blur-sm shrink-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveTask}>
                {editId ? "Update Task" : "Save Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* 2. STATS */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={tasks.length}
          icon={CalendarDays}
          iconColor="text-accent bg-accent/10"
        />
        <StatCard
          title="Pending"
          value={pendingCount}
          icon={Clock}
          iconColor="text-amber-500 bg-amber-500/10"
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle2}
          iconColor="text-signal-high bg-signal-high/10"
        />
        <StatCard
          title="Planned Hours"
          value={`${totalHours.toFixed(1)}h`}
          icon={Target}
          iconColor="text-blue-500 bg-blue-500/10"
        />
      </section>

      {/* 3. TASK LIST */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-base-border/70">
            <h2 className="text-base font-bold text-ink">Upcoming Tasks</h2>
            <span className="rounded-full bg-base-elevated px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
              {pendingCount} remaining
            </span>
          </div>

          {loading && tasks.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center gap-2 text-xs text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              Loading schedule...
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks scheduled"
              description="Plan your week and set milestones to keep momentum high."
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setEditId(null);
                    setForm(emptyForm);
                    setOpen(true);
                  }}
                >
                  Create First Task
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const isDone = task.status === "Completed";

                return (
                  <div
                    key={String(task.id)}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all",
                      isDone
                        ? "border-base-border/60 bg-base-raised/30 opacity-75"
                        : "border-base-border/80 bg-base-raised/60 hover:border-accent/40",
                    )}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-base-border text-ink-muted transition-colors hover:border-signal-high hover:text-signal-high"
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-signal-high" />
                        ) : (
                          <span className="h-2 w-2 rounded-sm bg-base-elevated" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0">
                        <h3
                          className={cn(
                            "font-semibold text-sm text-ink leading-snug",
                            isDone && "line-through text-ink-muted",
                          )}
                        >
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-ink-muted">
                          <span className="inline-flex items-center gap-1 rounded-md bg-base-elevated px-2 py-0.5">
                            <Calendar className="h-3 w-3 text-accent" />
                            {task.date}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-base-elevated px-2 py-0.5">
                            <Clock className="h-3 w-3 text-blue-400" />
                            {task.hours} hr{parseFloat(task.hours) > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-ink-muted hover:text-ink"
                        onClick={() => editTask(task)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-signal-low hover:bg-signal-low/10"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
