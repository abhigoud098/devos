"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Youtube,
  Github,
  Globe,
  FileText,
  Search,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Library,
  GraduationCap,
  FileCode,
  ExternalLink,
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

type Resource = {
  id: string | number;
  title: string;
  url: string;
  description: string;
  type: "Youtube" | "Github" | "Article" | "Course" | "PDF";
  image?: string | null;
};

const types = ["Youtube", "Github", "Article", "Course", "PDF"] as const;

export default function ResourcesPage() {
  const emptyForm = {
    title: "",
    url: "",
    description: "",
    type: "Youtube" as Resource["type"],
    image: "",
  };

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // LOAD
  useEffect(() => {
    async function load() {
      setLoading(true);
      const saved = localStorage.getItem("learning-resources");
      if (saved) {
        try {
          setResources(JSON.parse(saved));
        } catch (e) {}
      }

      const res = await api.resources.list();
      if (res.data?.resources) {
        setResources(res.data.resources);
        localStorage.setItem("learning-resources", JSON.stringify(res.data.resources));
      }
      setLoading(false);
    }
    load();
  }, []);

  // LOAD FORM DRAFT
  useEffect(() => {
    if (open && editId === null) {
      const saved = localStorage.getItem("resource-form-draft");
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
      localStorage.setItem("resource-form-draft", JSON.stringify(form));
    }
  }, [form, editId, open]);

  async function saveResource() {
    if (!form.title || !form.url) return;

    if (editId) {
      const targetId = String(editId);
      setResources((prev) =>
        prev.map((r) => (String(r.id) === targetId ? { ...r, ...form } : r)),
      );
      const res = await api.resources.update(targetId, form);
      if (res.data?.resource) {
        setResources((prev) =>
          prev.map((r) => (String(r.id) === targetId ? res.data!.resource : r)),
        );
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const newRes: Resource = { id: tempId, ...form };
      setResources((prev) => [newRes, ...prev]);

      const res = await api.resources.create(form);
      if (res.data?.resource) {
        setResources((prev) =>
          prev.map((r) => (r.id === tempId ? res.data!.resource : r)),
        );
      }
    }

    setForm(emptyForm);
    setEditId(null);
    setOpen(false);
    localStorage.removeItem("resource-form-draft");
  }

  function editResource(item: Resource) {
    setForm({
      title: item.title,
      url: item.url,
      description: item.description,
      type: item.type,
      image: item.image || "",
    });
    setEditId(item.id);
    setOpen(true);
  }

  async function deleteResource(id: string | number) {
    const targetId = String(id);
    const updated = resources.filter((item) => String(item.id) !== targetId);
    setResources(updated);
    localStorage.setItem("learning-resources", JSON.stringify(updated));
    await api.resources.delete(targetId);
  }

  const filtered = resources.filter((item) => {
    if (selectedType && item.type !== selectedType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const youtubeCount = resources.filter((r) => r.type === "Youtube").length;
  const githubCount = resources.filter((r) => r.type === "Github").length;
  const articleCount = resources.filter((r) => r.type === "Article").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. STANDARDIZED PAGE HEADER */}
      <PageHeader
        kicker="Curated Vault"
        title="Resource Library"
        description="Bookmark high-quality documentation, deep dive articles, GitHub templates, and course lectures."
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
              Add Resource
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border border-base-border bg-card shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-base-border px-6 py-4 bg-card/60 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Library className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-ink">
                    {editId ? "Edit Resource" : "Add Resource"}
                  </DialogTitle>
                  <p className="text-xs text-ink-muted">
                    Save URLs, tutorials, courses, and documentation.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-130px)]">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Resource Title</label>
                <Input
                  placeholder="e.g. Postgres Performance Optimization Guide"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">URL / Link</label>
                <Input
                  placeholder="https://example.com/article"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Category / Media Type</label>
                <select
                  className="w-full rounded-xl border border-base-border bg-base-raised p-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as Resource["type"],
                    })
                  }
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Description & Key Highlights</label>
                <Textarea
                  rows={3}
                  placeholder="Why is this resource valuable? Key takeaways..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-base-border px-6 py-3.5 bg-card/60 backdrop-blur-sm shrink-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveResource}>
                {editId ? "Update Resource" : "Save Resource"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* 2. STATS */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Bookmarks"
          value={resources.length}
          icon={Library}
          iconColor="text-accent bg-accent/10"
        />
        <StatCard
          title="Video Lectures"
          value={youtubeCount}
          icon={Youtube}
          iconColor="text-red-500 bg-red-500/10"
        />
        <StatCard
          title="Repositories"
          value={githubCount}
          icon={Github}
          iconColor="text-blue-500 bg-blue-500/10"
        />
        <StatCard
          title="Articles & Guides"
          value={articleCount}
          icon={FileText}
          iconColor="text-signal-high bg-signal-high/10"
        />
      </section>

      {/* 3. SEARCH & CATEGORY FILTERS */}
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
            <Input
              placeholder="Search resources by title, description, or URL..."
              className="pl-9 bg-base-raised"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-ink-faint mr-1">Type:</span>
            <button
              onClick={() => setSelectedType(null)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                selectedType === null
                  ? "border-accent bg-accent/15 text-accent font-semibold"
                  : "border-base-border bg-base-raised text-ink-muted hover:text-ink"
              }`}
            >
              All
            </button>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(selectedType === t ? null : t)}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  selectedType === t
                    ? "border-accent bg-accent/15 text-accent font-semibold"
                    : "border-base-border bg-base-raised text-ink-muted hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. RESOURCES GRID */}
      {loading && resources.length === 0 ? (
        <div className="flex min-h-[260px] items-center justify-center gap-2 rounded-2xl border border-dashed text-xs text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          Loading curated resources...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Library}
          title={search || selectedType ? "No resources found" : "No resources bookmarked"}
          description={
            search || selectedType
              ? "Try adjusting your search query or filter type."
              : "Collect useful tutorials, documentation links, and repos in one place."
          }
          action={
            <Button
              size="sm"
              onClick={() => {
                setEditId(null);
                setForm(emptyForm);
                setOpen(true);
              }}
            >
              Add First Resource
            </Button>
          }
        />
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const iconMap = {
              Youtube: <Youtube className="h-4 w-4 text-red-500" />,
              Github: <Github className="h-4 w-4 text-ink" />,
              Article: <FileText className="h-4 w-4 text-blue-500" />,
              Course: <GraduationCap className="h-4 w-4 text-emerald-500" />,
              PDF: <FileCode className="h-4 w-4 text-amber-500" />,
            };

            return (
              <Card
                key={String(item.id)}
                className="flex flex-col justify-between overflow-hidden border-base-border/80 bg-base-raised/40 hover:border-accent/40 hover:shadow-md transition-all"
              >
                <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-base-elevated">
                          {iconMap[item.type] || <Globe className="h-4 w-4 text-accent" />}
                        </div>
                        <span className="rounded-md bg-base-elevated px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
                          {item.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-ink-muted hover:text-ink"
                          onClick={() => editResource(item)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-signal-low hover:bg-signal-low/10"
                          onClick={() => deleteResource(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-ink mt-2 leading-snug">
                      {item.title}
                    </h3>

                    {item.image && (
                      <img
                        src={item.image}
                        alt="Resource visual"
                        className="rounded-xl mt-2.5 h-36 w-full object-cover border border-base-border"
                      />
                    )}

                    {item.description && (
                      <p className="mt-2 text-xs text-ink-muted leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-base-border/60 flex items-center justify-between">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Visit Source
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}
