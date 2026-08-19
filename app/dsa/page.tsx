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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  id: number;
  name: string;
  number: string;
  pattern: string;
  method: string;
  difficulty: string;
  status: string;
  struggle: string;
  learning: string;
  revision: RevisionData;
  image: string;
};

const defaultRevision: RevisionData = {
  enabled: false,
  date: "",
  interval: "7 Days",
  notes: "",
  done: false,
};

export default function Page() {
  const [open, setOpen] = useState(false);

  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const [problems, setProblems] = useState<Problem[]>([]);

  const [loaded, setLoaded] = useState(false);

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
    const saved = localStorage.getItem("dsa-problems");

    if (saved) {
      const parsed = JSON.parse(saved);

      const migrated = parsed.map((item: any) => ({
        ...item,

        revision: item.revision ?? {
          ...defaultRevision,
        },

        method: item.method ?? "",
      }));

      setProblems(migrated);
    }

    setLoaded(true);
  }, []);

  // SAVE DATA

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem("dsa-problems", JSON.stringify(problems));
  }, [problems, loaded]);

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

  function addProblem() {
    if (!form.name || !form.pattern) return;

    const newProblem: Problem = {
      id: Date.now(),

      ...form,
    };

    setProblems((prev) => [...prev, newProblem]);

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
  }

  function deleteProblem(id: number) {
    setProblems((prev) => prev.filter((problem) => problem.id !== id));
  }

  function deleteAllProblems() {
    setProblems([]);

    localStorage.removeItem("dsa-problems");
  }

  function toggleRevision(id: number) {
    setProblems((prev) =>
      prev.map((problem) =>
        problem.id === id
          ? {
              ...problem,

              revision: {
                ...problem.revision,

                done: !problem.revision.done,
              },
            }
          : problem,
      ),
    );
  }

  const filteredProblems = selectedPattern
    ? problems.filter((problem) => problem.pattern === selectedPattern)
    : problems;

  const methodFilteredProblems = selectedMethod
    ? filteredProblems.filter((problem) => problem.method === selectedMethod)
    : filteredProblems;
  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      <section className="mb-10 rounded-3xl border bg-card p-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <Brain size={16} />
              Developer Second Brain
            </div>

            <h1 className="mt-3 text-4xl font-bold">DSA Knowledge Vault</h1>

            <p className="mt-3 text-muted-foreground">
              Store problems, mistakes, solutions and revision notes.
            </p>
          </div>

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
              <Button>
                <Plus size={18} />
                Add Problem
              </Button>
            </DialogTrigger>

            <DialogContent
              className="
              bg-background
              border
              shadow-2xl
              max-w-lg
            "
            >
              <DialogHeader>
                <DialogTitle>Add DSA Problem</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                <Input
                  placeholder="Problem Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      name: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Problem Number"
                  value={form.number}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      number: e.target.value,
                    })
                  }
                />

                <Select
                  onValueChange={(value) =>
                    setForm({
                      ...form,

                      pattern: value,
                    })
                  }
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

                <Select
                  onValueChange={(value) =>
                    setForm({
                      ...form,

                      method: value,
                    })
                  }
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

                <Select
                  onValueChange={(value) =>
                    setForm({
                      ...form,

                      difficulty: value,
                    })
                  }
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

                <Select
                  onValueChange={(value) =>
                    setForm({
                      ...form,

                      status: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Solved">Solved</SelectItem>

                    <SelectItem value="Revision">Need Revision</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="What was difficult?"
                  value={form.struggle}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      struggle: e.target.value,
                    })
                  }
                />

                <Textarea
                  placeholder="What did you learn?"
                  value={form.learning}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      learning: e.target.value,
                    })
                  }
                />

                <Input type="file" accept="image/*" onChange={handleImage} />

                {form.image && (
                  <img
                    src={form.image}
                    className="rounded-lg h-32 w-full object-cover"
                  />
                )}

                <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                      <CalendarClock size={18} />

                      <span className="font-semibold">Revision</span>
                    </div>

                    <Button
                      type="button"
                      variant={form.revision.enabled ? "primary" : "outline"}
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
                    <>
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
                          <SelectValue placeholder="Revision Interval" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="1 Day">1 Day</SelectItem>

                          <SelectItem value="7 Days">7 Days</SelectItem>

                          <SelectItem value="30 Days">30 Days</SelectItem>
                        </SelectContent>
                      </Select>

                      <Textarea
                        placeholder="Revision notes"
                        value={form.revision.notes}
                        onChange={(e) =>
                          setForm({
                            ...form,

                            revision: {
                              ...form.revision,

                              notes: e.target.value,
                            },
                          })
                        }
                      />
                    </>
                  )}
                </div>

                <Button className="w-full" onClick={addProblem}>
                  Save Problem
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>
      <section>
        <div className="flex justify-between mb-5">
          <h2 className="text-xl font-semibold">Patterns</h2>

          <Button variant="destructive" onClick={deleteAllProblems}>
            <Trash2 size={16} />
            Delete All
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {patterns.map((pattern) => (
            <Card
              key={pattern}
              className="cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedPattern(pattern)}
            >
              <CardContent className="p-6">
                <h3 className="font-semibold">{pattern}</h3>

                <p className="text-sm text-muted-foreground">
                  {problems.filter((p) => p.pattern === pattern).length}{" "}
                  Problems
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex justify-between mb-5">
          <h2 className="text-xl font-semibold">Methods</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {methods.map((method) => (
            <Card
              key={method}
              className="cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedMethod(method)}
            >
              <CardContent className="p-6">
                <h3 className="font-semibold">{method}</h3>

                <p className="text-sm text-muted-foreground">
                  {problems.filter((p) => p.method === method).length}{" "}
                  Problems
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex justify-between mb-5">
          <h2 className="text-xl font-semibold">
            {selectedPattern ? `${selectedPattern} Problems` : selectedMethod ? `${selectedMethod} Problems` : "All Problems"}
          </h2>

          <div className="flex gap-2">
            {selectedPattern && (
              <Button variant="ghost" onClick={() => setSelectedPattern(null)}>
                <X size={16} />
                Clear Pattern
              </Button>
            )}
            {selectedMethod && (
              <Button variant="ghost" onClick={() => setSelectedMethod(null)}>
                <X size={16} />
                Clear Method
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {methodFilteredProblems.map((problem) => (
            <Card key={problem.id}>
              <CardContent className="p-5">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {problem.number}. {problem.name}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {problem.pattern}
                      {problem.method && ` • ${problem.method}`}
                    </p>
                  </div>

                  <div className="flex gap-3 items-center">
                    {problem.status === "Solved" ? (
                      <CheckCircle2 className="text-green-500" />
                    ) : (
                      <Clock className="text-orange-500" />
                    )}

                    {problem.revision.enabled && (
                      <Button
                        size="icon"
                        variant={problem.revision.done ? "primary" : "outline"}
                        onClick={() => toggleRevision(problem.id)}
                      >
                        <RotateCcw size={16} />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProblem(problem.id)}
                    >
                      <Trash2 className="text-red-500" />
                    </Button>
                  </div>
                </div>

                {problem.image && (
                  <img
                    src={problem.image}
                    className="rounded-lg mt-3 h-40 w-full object-cover"
                  />
                )}

                <div className="mt-4 space-y-2">
                  <p>
                    <b>Difficulty:</b> {problem.difficulty}
                  </p>

                  <p>
                    <b>Struggle:</b> {problem.struggle}
                  </p>

                  <p>
                    <b>Learning:</b> {problem.learning}
                  </p>

                  {problem.revision.enabled && (
                    <div className="mt-4 rounded-xl border p-4">
                      <div className="flex items-center gap-2">
                        <CalendarClock size={16} />

                        <b>Revision</b>
                      </div>

                      <p className="text-sm mt-2">
                        Date: {problem.revision.date || "Not set"}
                      </p>

                      <p className="text-sm">
                        Interval: {problem.revision.interval}
                      </p>

                      {problem.revision.done && (
                        <p className="text-sm text-green-500 mt-2">
                          ✓ Revision Completed
                        </p>
                      )}

                      {problem.revision.notes && (
                        <p className="text-sm mt-2">
                          Notes: {problem.revision.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
