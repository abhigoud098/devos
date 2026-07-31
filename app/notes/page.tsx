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
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Note = {
  id: number;
  title: string;
  content: string;
  type: string;
};

export default function NotesPage() {
  const emptyForm = {
    title: "",
    content: "",
    type: "",
  };

  const [open, setOpen] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);

  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState(emptyForm);

  // LOAD NOTES

  useEffect(() => {
    const saved = localStorage.getItem("developer-notes");

    if (saved) {
      setNotes(JSON.parse(saved));
    }

    setLoaded(true);
  }, []);

  // SAVE NOTES

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "developer-notes",

      JSON.stringify(notes),
    );
  }, [notes, loaded]);

  function saveNote() {
    if (!form.title) return;

    if (editId) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === editId
            ? {
                ...note,

                ...form,
              }
            : note,
        ),
      );
    } else {
      const newNote: Note = {
        id: Date.now(),

        ...form,
      };

      setNotes((prev) => [...prev, newNote]);
    }

    setForm(emptyForm);

    setEditId(null);

    setOpen(false);
  }

  function editNote(note: Note) {
    setForm({
      title: note.title,

      content: note.content,

      type: note.type,
    });

    setEditId(note.id);

    setOpen(true);
  }

  function deleteNote(id: number) {
    const updated = notes.filter((note) => note.id !== id);

    setNotes(updated);

    localStorage.setItem(
      "developer-notes",

      JSON.stringify(updated),
    );
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      <section className="mb-8 rounded-2xl border bg-card p-8">
        <div className="flex justify-between items-center">
          <div>
            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              Developer Knowledge Base
            </span>

            <h1 className="mt-4 text-4xl font-bold">Notes</h1>

            <p className="mt-3 text-muted-foreground">
              Store coding knowledge, concepts and snippets.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2" />
                New Note
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editId ? "Edit Note" : "Create Note"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="Note title"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      title: e.target.value,
                    })
                  }
                />

                <Textarea
                  placeholder="Write your note..."
                  className="min-h-[150px]"
                  value={form.content}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      content: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Type (React, DSA, Code)"
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      type: e.target.value,
                    })
                  }
                />

                <Button className="w-full" onClick={saveNote}>
                  {editId ? "Update Note" : "Save Note"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4" />

          <Input
            placeholder="Search notes..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <BookOpenText />

            <p>Total Notes</p>

            <h2 className="text-3xl font-bold">{notes.length}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Code2 />

            <p>Code Snippets</p>

            <h2 className="text-3xl font-bold">
              {
                notes.filter((n) => n.type.toLowerCase().includes("code"))
                  .length
              }
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <FileText />

            <p>Collections</p>

            <h2 className="text-3xl font-bold">
              {new Set(notes.map((n) => n.type)).size}
            </h2>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {filteredNotes.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="flex min-h-[300px] items-center justify-center">
              No Notes Found 📝
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <h2 className="text-xl font-bold">{note.title}</h2>

                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editNote(note)}
                    >
                      <Pencil size={16} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="text-red-500" />
                    </Button>
                  </div>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {note.content}
                </p>

                <p className="mt-4 text-xs">#{note.type}</p>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
}
