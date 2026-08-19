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

type Resource = {
  id: number;
  title: string;
  url: string;
  description: string;
  type: "Youtube" | "Github" | "Article" | "Course" | "PDF";
  image: string;
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

  const [loaded, setLoaded] = useState(false);

  const [open, setOpen] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState(emptyForm);

  // LOAD

  useEffect(() => {
    const saved = localStorage.getItem("learning-resources");

    if (saved) {
      setResources(JSON.parse(saved));
    }

    setLoaded(true);
  }, []);

  // SAVE

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "learning-resources",

      JSON.stringify(resources),
    );
  }, [resources, loaded]);

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
    if (editId === null) {
      localStorage.setItem("resource-form-draft", JSON.stringify(form));
    }
  }, [form, editId]);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert("Image size must be less than 1MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        image: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  }

  function saveResource() {
    if (!form.title) return;

    if (editId) {
      setResources((prev) =>
        prev.map((item) =>
          item.id === editId
            ? {
                ...item,

                ...form,
              }
            : item,
        ),
      );
    } else {
      setResources((prev) => [
        ...prev,

        {
          id: Date.now(),

          ...form,
        },
      ]);
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

      image: item.image,
    });

    setEditId(item.id);

    setOpen(true);
  }

  function deleteResource(id: number) {
    const updated = resources.filter((item) => item.id !== id);

    setResources(updated);
  }

  const filtered = resources.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      {/* HERO */}

      <section className="mb-8 rounded-2xl border bg-card p-8">
        <div className="flex justify-between items-center">
          <div>
            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              Learning Library
            </span>

            <h1 className="mt-4 text-4xl font-bold">Resources</h1>

            <p className="mt-3 text-muted-foreground">
              Store videos, documentation, GitHub, articles and courses.
            </p>
          </div>

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
                onClick={() => {
                  setEditId(null);
                  setForm(emptyForm);
                }}
              >
                <Plus className="mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editId ? "Edit Resource" : "Add Resource"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="URL"
                  value={form.url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      url: e.target.value,
                    })
                  }
                />

                <Textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />

                <select
                  className="w-full border rounded-md p-2"
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as Resource["type"],
                    })
                  }
                >
                  {types.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>

                <Input type="file" accept="image/*" onChange={handleImage} />

                {form.image && (
                  <img
                    src={form.image}
                    className="rounded-lg h-32 w-full object-cover"
                  />
                )}

                <Button className="w-full" onClick={saveResource}>
                  {editId ? "Update" : "Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* SEARCH */}

      <section className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4" />

          <Input
            placeholder="Search resources..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* STATS */}

      <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <BookOpen />

            <p>Total</p>

            <h2 className="text-3xl font-bold">{resources.length}</h2>
          </CardContent>
        </Card>

        {types.map((type) => (
          <Card key={type}>
            <CardContent className="pt-6">
              {type === "Youtube" && <Youtube />}

              {type === "Github" && <Github />}

              {type === "Article" && <Globe />}

              {type === "Course" && <BookOpen />}

              {type === "PDF" && <FileText />}

              <p>{type}</p>

              <h2 className="text-3xl font-bold">
                {resources.filter((r) => r.type === type).length}
              </h2>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* RESOURCE CARDS */}

      <section className="grid gap-5 md:grid-cols-2">
        {filtered.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="min-h-[300px] flex items-center justify-center">
              No Resources Added 📚
            </CardContent>
          </Card>
        ) : (
          filtered.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <h2 className="text-xl font-bold">{item.title}</h2>

                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editResource(item)}
                    >
                      <Pencil size={16} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteResource(item.id)}
                    >
                      <Trash2 className="text-red-500" />
                    </Button>
                  </div>
                </div>

                {item.image && (
                  <img
                    src={item.image}
                    className="rounded-lg mt-3 h-40 w-full object-cover"
                  />
                )}

                <p className="mt-3 text-sm text-muted-foreground">
                  {item.description}
                </p>

                <div className="mt-4">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">Open Resource</Button>
                  </a>
                </div>

                <p className="mt-3 text-xs">#{item.type}</p>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
}
