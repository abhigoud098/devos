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

type Task = {
  id: number;

  title: string;

  description: string;

  date: string;

  hours: string;

  status: "Pending" | "Completed";
};

export default function PlannerPage() {
  const emptyForm = {
    title: "",
    description: "",
    date: "",
    hours: "",
  };

  const [tasks, setTasks] = useState<Task[]>([]);

  const [loaded, setLoaded] = useState(false);

  const [open, setOpen] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState(emptyForm);

  // LOAD

  useEffect(() => {
    const saved = localStorage.getItem("planner-tasks");

    if (saved) {
      setTasks(JSON.parse(saved));
    }

    setLoaded(true);
  }, []);

  // SAVE

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "planner-tasks",

      JSON.stringify(tasks),
    );
  }, [tasks, loaded]);

  function saveTask() {
    if (!form.title) return;

    if (editId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editId
            ? {
                ...task,

                ...form,
              }
            : task,
        ),
      );
    } else {
      setTasks((prev) => [
        ...prev,

        {
          id: Date.now(),

          ...form,

          status: "Pending",
        },
      ]);
    }

    setForm(emptyForm);

    setEditId(null);

    setOpen(false);
  }

  function editTask(task: Task) {
    setForm({
      title: task.title,

      description: task.description,

      date: task.date,

      hours: task.hours,
    });

    setEditId(task.id);

    setOpen(true);
  }

  function deleteTask(id: number) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function toggleComplete(id: number) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,

              status: task.status === "Pending" ? "Completed" : "Pending",
            }
          : task,
      ),
    );
  }
  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      {/* HERO */}

      <section className="mb-8 rounded-2xl border bg-card p-8">
        <div className="flex justify-between items-center">
          <div>
            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              Daily Planning
            </span>

            <h1 className="mt-4 text-4xl font-bold">Planner</h1>

            <p className="mt-3 text-muted-foreground">
              Plan your coding, learning and goals.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2" />
                New Task
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editId ? "Edit Task" : "Create Task"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="Task title"
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
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      date: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Study hours"
                  value={form.hours}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      hours: e.target.value,
                    })
                  }
                />

                <Button className="w-full" onClick={saveTask}>
                  {editId ? "Update Task" : "Save Task"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* STATS */}

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <CheckCircle2 />

            <p>Today's Tasks</p>

            <h2 className="text-3xl font-bold">{tasks.length}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Target />

            <p>Completed</p>

            <h2 className="text-3xl font-bold">
              {tasks.filter((t) => t.status === "Completed").length}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Clock />

            <p>Study Hours</p>

            <h2 className="text-3xl font-bold">
              {tasks.reduce((sum, t) => sum + Number(t.hours || 0), 0)}h
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <CalendarDays />

            <p>Upcoming</p>

            <h2 className="text-3xl font-bold">
              {tasks.filter((t) => t.status === "Pending").length}
            </h2>
          </CardContent>
        </Card>
      </section>

      {/* TASK LIST */}

      <section className="grid gap-5 lg:grid-cols-3">
        {tasks.length === 0 ? (
          <Card className="lg:col-span-3">
            <CardContent className="min-h-[300px] flex items-center justify-center">
              No Tasks Planned 📅
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <h2 className="font-bold text-lg">{task.title}</h2>

                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editTask(task)}
                    >
                      <Pencil size={16} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="text-red-500" />
                    </Button>
                  </div>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {task.description}
                </p>

                <p className="mt-3 text-sm">📅 {task.date}</p>

                <p className="text-sm">⏱ {task.hours} hours</p>

                <Button
                  className="mt-4 w-full"
                  variant={task.status === "Completed" ? "primary" : "outline"}
                  onClick={() => toggleComplete(task.id)}
                >
                  {task.status === "Completed" ? "Completed" : "Mark Complete"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
}
