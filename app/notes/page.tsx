"use client";

import { useEffect, useState } from "react";
import {
  BookOpenText,
  Plus,
  Search,
  FileText,
  Code2,
  Trash2,
  Pencil,
  Loader2,
  StickyNote,
  Tag,
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

type Note = {
  id: string | number;
  title: string;
  content: string;
  type: string;
  image?: string | null;
};

export default function NotesPage() {
  const emptyForm = {
    title: "",
    content: "",
    type: "",
    image: "",
  };

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // LOAD NOTES
  useEffect(() => {
    async function load() {
      setLoading(true);
      const saved = localStorage.getItem("developer-notes");
      if (saved) {
        try {
          setNotes(JSON.parse(saved));
        } catch (e) {}
      }

      const res = await api.notes.list();
      if (res.data?.notes) {
        setNotes(res.data.notes);
        localStorage.setItem("developer-notes", JSON.stringify(res.data.notes));
      }
      setLoading(false);
    }
    load();
  }, []);

  // LOAD FORM DRAFT
  useEffect(() => {
    if (open && editId === null) {
      const saved = localStorage.getItem("note-form-draft");
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
      localStorage.setItem("note-form-draft", JSON.stringify(form));
    }
  }, [form, editId, open]);

  async function saveNote() {
    if (!form.title) return;

    if (editId) {
      const targetId = String(editId);
      setNotes((prev) =>
        prev.map((n) => (String(n.id) === targetId ? { ...n, ...form } : n)),
      );
      const res = await api.notes.update(targetId, form);
      if (res.data?.note) {
        setNotes((prev) =>
          prev.map((n) => (String(n.id) === targetId ? res.data!.note : n)),
        );
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const optimisticNote: Note = { id: tempId, ...form };
      setNotes((prev) => [optimisticNote, ...prev]);

      const res = await api.notes.create(form);
      if (res.data?.note) {
        setNotes((prev) =>
          prev.map((n) => (n.id === tempId ? res.data!.note : n)),
        );
      }
    }

    setForm(emptyForm);
    setEditId(null);
    setOpen(false);
    localStorage.removeItem("note-form-draft");
  }

  function editNote(note: Note) {
    setForm({
      title: note.title,
      content: note.content,
      type: note.type,
      image: note.image || "",
    });
    setEditId(note.id);
    setOpen(true);
  }

  async function deleteNote(id: string | number) {
    const targetId = String(id);
    const updated = notes.filter((note) => String(note.id) !== targetId);
    setNotes(updated);
    localStorage.setItem("developer-notes", JSON.stringify(updated));
    await api.notes.delete(targetId);
  }

  const tags = Array.from(new Set(notes.map((n) => n.type.trim()).filter(Boolean)));

  const filteredNotes = notes.filter((note) => {
    if (selectedTag && note.type.trim() !== selectedTag) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q) ||
        note.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. STANDARDIZED PAGE HEADER */}
      <PageHeader
        kicker="Knowledge Repository"
        title="Developer Notes"
        description="Capture concepts, architecture notes, code snippets, and cheat-sheets with persistent storage."
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
              New Note
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border border-base-border bg-card shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-base-border px-6 py-4 bg-card/60 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <StickyNote className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-ink">
                    {editId ? "Edit Note" : "Create Note"}
                  </DialogTitle>
                  <p className="text-xs text-ink-muted">
                    Save syntax, key formulas, or design patterns.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-130px)]">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Title</label>
                <Input
                  placeholder="e.g. React 19 Server Actions Pattern"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Tag / Category</label>
                <Input
                  placeholder="e.g. React, PostgreSQL, Docker, Architecture"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Content (Markdown / Code)</label>
                <Textarea
                  placeholder="Write your notes, code snippets, or commands..."
                  className="min-h-[160px] font-mono text-xs"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-base-border px-6 py-3.5 bg-card/60 backdrop-blur-sm shrink-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveNote}>
                {editId ? "Update Note" : "Save Note"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* 2. STATS */}
      <section className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Notes"
          value={notes.length}
          icon={BookOpenText}
          iconColor="text-accent bg-accent/10"
        />
        <StatCard
          title="Code Snippets"
          value={notes.filter((n) => n.type.toLowerCase().includes("code") || n.content.includes("```")).length}
          icon={Code2}
          iconColor="text-blue-500 bg-blue-500/10"
        />
        <StatCard
          title="Collections / Tags"
          value={tags.length}
          icon={Tag}
          iconColor="text-signal-high bg-signal-high/10"
        />
      </section>

      {/* 3. SEARCH & TAG FILTERS */}
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
            <Input
              placeholder="Search by title, tag, or content snippet..."
              className="pl-9 bg-base-raised"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-ink-faint mr-1">Tags:</span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  selectedTag === null
                    ? "border-accent bg-accent/15 text-accent font-semibold"
                    : "border-base-border bg-base-raised text-ink-muted hover:text-ink"
                }`}
              >
                All
              </button>
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    selectedTag === t
                      ? "border-accent bg-accent/15 text-accent font-semibold"
                      : "border-base-border bg-base-raised text-ink-muted hover:text-ink"
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. NOTES GRID */}
      {loading && notes.length === 0 ? (
        <div className="flex min-h-[260px] items-center justify-center gap-2 rounded-2xl border border-dashed text-xs text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          Loading knowledge notes...
        </div>
      ) : filteredNotes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title={search || selectedTag ? "No matching notes found" : "No notes written yet"}
          description={
            search || selectedTag
              ? "Try adjusting your search query or selected tag."
              : "Keep key takeaways, architectural diagrams, and code snippets stored safely."
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
              Write First Note
            </Button>
          }
        />
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card
              key={String(note.id)}
              className="flex flex-col justify-between overflow-hidden border-base-border/80 bg-base-raised/40 hover:border-accent/40 hover:shadow-md transition-all"
            >
              <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-ink leading-snug">
                      {note.title}
                    </h3>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-ink-muted hover:text-ink"
                        onClick={() => editNote(note)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-signal-low hover:bg-signal-low/10"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {note.image && (
                    <img
                      src={note.image}
                      alt="Note visual"
                      className="rounded-xl mt-2.5 h-36 w-full object-cover border border-base-border"
                    />
                  )}

                  <p className="mt-3 text-xs text-ink-muted whitespace-pre-wrap leading-relaxed line-clamp-6 font-mono bg-base-elevated/40 p-3 rounded-xl border border-base-border/60">
                    {note.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-base-border/60 flex items-center justify-between">
                  <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                    #{note.type || "General"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
