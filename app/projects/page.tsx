"use client";

import { useEffect, useState } from "react";
import {
  FolderGit2,
  Github,
  Globe,
  Plus,
  Sparkles,
  Trash2,
  Pencil,
  Loader2,
  Rocket,
  CheckCircle2,
  Lightbulb,
  Hammer,
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

type Project = {
  id: string | number;
  title: string;
  description: string;
  tech: string;
  github: string;
  live: string;
  status: "Idea" | "Building" | "Completed";
  image?: string | null;
};

const statuses = ["Idea", "Building", "Completed"] as const;

export default function ProjectsPage() {
  const emptyForm = {
    title: "",
    description: "",
    tech: "",
    github: "",
    live: "",
    status: "Idea" as Project["status"],
    image: "",
  };

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);

  // LOAD DATA
  useEffect(() => {
    async function load() {
      setLoading(true);
      const saved = localStorage.getItem("projects");
      if (saved) {
        try {
          setProjects(JSON.parse(saved));
        } catch (e) {}
      }

      const res = await api.projects.list();
      if (res.data?.projects) {
        setProjects(res.data.projects);
        localStorage.setItem("projects", JSON.stringify(res.data.projects));
      }
      setLoading(false);
    }
    load();
  }, []);

  // LOAD FORM DRAFT
  useEffect(() => {
    if (open && editId === null) {
      const saved = localStorage.getItem("project-form-draft");
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
      localStorage.setItem("project-form-draft", JSON.stringify(form));
    }
  }, [form, editId, open]);

  async function saveProject() {
    if (!form.title) return;

    if (editId) {
      const targetId = String(editId);
      setProjects((prev) =>
        prev.map((p) => (String(p.id) === targetId ? { ...p, ...form } : p)),
      );
      const res = await api.projects.update(targetId, form);
      if (res.data?.project) {
        setProjects((prev) =>
          prev.map((p) => (String(p.id) === targetId ? res.data!.project : p)),
        );
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const newProj: Project = { id: tempId, ...form };
      setProjects((prev) => [newProj, ...prev]);

      const res = await api.projects.create(form);
      if (res.data?.project) {
        setProjects((prev) =>
          prev.map((p) => (p.id === tempId ? res.data!.project : p)),
        );
      }
    }

    setForm(emptyForm);
    setEditId(null);
    setOpen(false);
    localStorage.removeItem("project-form-draft");
  }

  function editProject(project: Project) {
    setForm({
      title: project.title,
      description: project.description,
      tech: project.tech,
      github: project.github || "",
      live: project.live || "",
      status: project.status,
      image: project.image || "",
    });
    setEditId(project.id);
    setOpen(true);
  }

  async function deleteProject(id: string | number) {
    const targetId = String(id);
    const updated = projects.filter((project) => String(project.id) !== targetId);
    setProjects(updated);
    localStorage.setItem("projects", JSON.stringify(updated));
    await api.projects.delete(targetId);
  }

  async function dropProject(id: string | number, status: Project["status"]) {
    const targetId = String(id);
    setProjects((prev) =>
      prev.map((p) => (String(p.id) === targetId ? { ...p, status } : p)),
    );
    await api.projects.update(targetId, { status });
  }

  const ideaCount = projects.filter((p) => p.status === "Idea").length;
  const buildingCount = projects.filter((p) => p.status === "Building").length;
  const completedCount = projects.filter((p) => p.status === "Completed").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. STANDARDIZED PAGE HEADER */}
      <PageHeader
        kicker="Workspace Pipeline"
        title="Project Board"
        description="Track your software projects from initial concept through active development to production deployment."
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
              Add Project
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border border-base-border bg-card shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-base-border px-6 py-4 bg-card/60 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Rocket className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-ink">
                    {editId ? "Edit Project" : "Add New Project"}
                  </DialogTitle>
                  <p className="text-xs text-ink-muted">
                    Manage tech stack, repository links, and live URLs.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-130px)]">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Project Title</label>
                <Input
                  placeholder="e.g. AI Code Assistant"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Description</label>
                <Textarea
                  rows={3}
                  placeholder="What problem does this project solve? Key features..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Tech Stack (comma-separated)</label>
                <Input
                  placeholder="e.g. Next.js, PostgreSQL, Prisma, TailwindCSS"
                  value={form.tech}
                  onChange={(e) => setForm({ ...form, tech: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">GitHub Repository</label>
                  <Input
                    placeholder="https://github.com/user/repo"
                    value={form.github}
                    onChange={(e) => setForm({ ...form, github: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Live Demo URL</label>
                  <Input
                    placeholder="https://myproject.dev"
                    value={form.live}
                    onChange={(e) => setForm({ ...form, live: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Kanban Stage</label>
                <select
                  className="w-full rounded-xl border border-base-border bg-base-raised p-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as Project["status"],
                    })
                  }
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-base-border px-6 py-3.5 bg-card/60 backdrop-blur-sm shrink-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveProject}>
                {editId ? "Update Project" : "Save Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* 2. STATS */}
      <section className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatCard
          title="Backlog Ideas"
          value={ideaCount}
          icon={Lightbulb}
          iconColor="text-amber-500 bg-amber-500/10"
        />
        <StatCard
          title="In Development"
          value={buildingCount}
          icon={Hammer}
          iconColor="text-blue-500 bg-blue-500/10"
        />
        <StatCard
          title="Shipped & Live"
          value={completedCount}
          icon={CheckCircle2}
          iconColor="text-signal-high bg-signal-high/10"
        />
      </section>

      {/* 3. KANBAN BOARD */}
      {loading && projects.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center gap-2 rounded-2xl border border-dashed text-xs text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          Loading project pipeline...
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {statuses.map((status) => {
            const list = projects.filter((p) => p.status === status);
            const statusColor =
              status === "Idea"
                ? "border-amber-500/30 text-amber-500 bg-amber-500/10"
                : status === "Building"
                  ? "border-blue-500/30 text-blue-500 bg-blue-500/10"
                  : "border-signal-high/30 text-signal-high bg-signal-high/10";

            return (
              <div
                key={status}
                className="flex flex-col rounded-2xl border border-base-border/80 bg-card/40 p-4 min-h-[420px] transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const id = e.dataTransfer.getData("projectId");
                  if (id) {
                    dropProject(id, status);
                  }
                }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-base-border/70 mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${status === "Idea" ? "bg-amber-500" : status === "Building" ? "bg-blue-500" : "bg-signal-high"}`} />
                    <h2 className="font-bold text-sm text-ink">{status}</h2>
                  </div>
                  <span className="rounded-full bg-base-elevated px-2 py-0.5 text-xs font-semibold text-ink-muted">
                    {list.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3">
                  {list.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-base-border/70 text-xs text-ink-faint">
                      Drop projects here
                    </div>
                  ) : (
                    list.map((project) => (
                      <Card
                        key={String(project.id)}
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData("projectId", String(project.id))
                        }
                        className="cursor-grab active:cursor-grabbing border-base-border/80 bg-base-raised/60 hover:border-accent/40 hover:shadow-md transition-all"
                      >
                        <CardContent className="p-4 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-sm text-ink leading-snug">
                              {project.title}
                            </h3>

                            <div className="flex items-center gap-0.5 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-ink-muted hover:text-ink"
                                onClick={() => editProject(project)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-signal-low hover:bg-signal-low/10"
                                onClick={() => deleteProject(project.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {project.image && (
                            <img
                              src={project.image}
                              alt="Project thumbnail"
                              className="rounded-xl h-28 w-full object-cover border border-base-border"
                            />
                          )}

                          {project.description && (
                            <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
                              {project.description}
                            </p>
                          )}

                          {project.tech && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {project.tech.split(",").map((t, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-md bg-base-elevated px-2 py-0.5 text-[10px] font-medium text-ink-muted"
                                >
                                  {t.trim()}
                                </span>
                              ))}
                            </div>
                          )}

                          {(project.github || project.live) && (
                            <div className="flex items-center gap-2 pt-2 border-t border-base-border/60">
                              {project.github && (
                                <a
                                  href={project.github}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted hover:text-accent transition-colors"
                                >
                                  <Github className="h-3 w-3" />
                                  Code
                                </a>
                              )}

                              {project.live && (
                                <a
                                  href={project.live}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline transition-colors"
                                >
                                  <Globe className="h-3 w-3" />
                                  Live Demo
                                </a>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
