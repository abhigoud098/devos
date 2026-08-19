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

type Project = {
  id: number;

  title: string;

  description: string;

  tech: string;

  github: string;

  live: string;

  status: "Idea" | "Building" | "Completed";

  image: string;
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

  const [editId, setEditId] = useState<number | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);

  const [loaded, setLoaded] = useState(false);

  const [form, setForm] = useState(emptyForm);

  // LOAD DATA

  useEffect(() => {
    const saved = localStorage.getItem("projects");

    if (saved) {
      setProjects(JSON.parse(saved));
    }

    setLoaded(true);
  }, []);

  // SAVE DATA

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "projects",

      JSON.stringify(projects),
    );
  }, [projects, loaded]);

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
    if (editId === null) {
      localStorage.setItem("project-form-draft", JSON.stringify(form));
    }
  }, [form, editId]);

  // IMAGE SAVE

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

  // ADD / UPDATE

  function saveProject() {
    if (!form.title) return;

    if (editId) {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === editId
            ? {
                ...project,

                ...form,
              }
            : project,
        ),
      );
    } else {
      const newProject: Project = {
        id: Date.now(),

        ...form,
      };

      setProjects((prev) => [...prev, newProject]);
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

      github: project.github,

      live: project.live,

      status: project.status,

      image: project.image,
    });

    setEditId(project.id);

    setOpen(true);
  }

  function deleteProject(id: number) {
    const updated = projects.filter((project) => project.id !== id);

    setProjects(updated);

    localStorage.setItem(
      "projects",

      JSON.stringify(updated),
    );
  }

  function dropProject(
    id: number,

    status: Project["status"],
  ) {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id
          ? {
              ...project,

              status,
            }
          : project,
      ),
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      {/* HEADER */}

      <section className="mb-8 rounded-2xl border bg-card p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Projects</h1>

            <p className="mt-3 text-muted-foreground">
              Manage your development journey
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
                New Project
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editId ? "Edit Project" : "Create Project"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="Project Name"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      title: e.target.value,
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

                <Input
                  placeholder="Technologies"
                  value={form.tech}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      tech: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Github URL"
                  value={form.github}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      github: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Live URL"
                  value={form.live}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      live: e.target.value,
                    })
                  }
                />

                <Input type="file" accept="image/*" onChange={handleImage} />

                <select
                  className="w-full rounded-md border p-2"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      status: e.target.value as Project["status"],
                    })
                  }
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <Button className="w-full" onClick={saveProject}>
                  {editId ? "Update Project" : "Save Project"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* STATS */}

      <section className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <FolderGit2 />

            <p>Projects</p>

            <h2 className="text-3xl font-bold">{projects.length}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Sparkles />

            <p>Completed</p>

            <h2 className="text-3xl font-bold">
              {projects.filter((p) => p.status === "Completed").length}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Github />

            <p>Github</p>

            <h2 className="text-3xl font-bold">
              {projects.filter((p) => p.github).length}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Globe />

            <p>Live</p>

            <h2 className="text-3xl font-bold">
              {projects.filter((p) => p.live).length}
            </h2>
          </CardContent>
        </Card>
      </section>

      {/* KANBAN */}

      <section className="grid gap-5 md:grid-cols-3">
        {statuses.map((status) => (
          <div
            key={status}
            className="rounded-xl border p-4 min-h-[450px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) =>
              dropProject(
                Number(e.dataTransfer.getData("id")),

                status,
              )
            }
          >
            <h2 className="font-bold mb-4">{status}</h2>

            <div className="space-y-4">
              {projects

                .filter((project) => project.status === status)

                .map((project) => (
                  <Card
                    key={project.id}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData(
                        "id",

                        String(project.id),
                      )
                    }
                  >
                    <CardContent className="p-5">
                      {project.image && (
                        <img
                          src={project.image}
                          className="rounded-lg mb-4 h-32 w-full object-cover"
                        />
                      )}

                      <div className="flex justify-between">
                        <h3 className="font-bold">{project.title}</h3>

                        <div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editProject(project)}
                          >
                            <Pencil size={16} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 className="text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mt-2">
                        {project.description}
                      </p>

                      <p className="text-sm mt-3">
                        <b>Tech:</b> {project.tech}
                        <div className="flex gap-3 mt-4">
                          {project.github && (
                            <a
                              href={project.github}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="icon"
                                title="GitHub Repository"
                              >
                                <Github size={18} />
                              </Button>
                            </a>
                          )}

                          {project.live && (
                            <a
                              href={project.live}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="icon"
                                title="Live Website"
                              >
                                <Globe size={18} />
                              </Button>
                            </a>
                          )}
                        </div>
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
