"use client";

import { useEffect, useState } from "react";
import { Plus, Brain, Clock, X, CheckCircle2, Trash2 } from "lucide-react";

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

type Problem = {
  id: number;
  name: string;
  number: string;
  pattern: string;
  difficulty: string;
  status: string;
  struggle: string;
  learning: string;
};

export default function Page() {
  const [open, setOpen] = useState(false);

  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const [problems, setProblems] = useState<Problem[]>([]);

  // Important fix
  const [loaded, setLoaded] = useState(false);

  const [form, setForm] = useState({
    name: "",
    number: "",
    pattern: "",
    difficulty: "",
    status: "",
    struggle: "",
    learning: "",
  });

  // LOAD FROM LOCAL STORAGE

  useEffect(() => {
    const saved = localStorage.getItem("dsa-problems");

    if (saved) {
      setProblems(JSON.parse(saved));
    }

    setLoaded(true);
  }, []);

  // SAVE TO LOCAL STORAGE

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "dsa-problems",

      JSON.stringify(problems),
    );
  }, [problems, loaded]);

  function addProblem() {
    if (!form.name || !form.pattern) return;

    const newProblem: Problem = {
      id: Date.now(),

      ...form,
    };

    setProblems((prev) => [...prev, newProblem]);

    setForm({
      name: "",
      number: "",
      pattern: "",
      difficulty: "",
      status: "",
      struggle: "",
      learning: "",
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

  const filteredProblems = selectedPattern
    ? problems.filter((problem) => problem.pattern === selectedPattern)
    : problems;

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

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={18} />
                Add Problem
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add DSA Problem</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
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
              className="cursor-pointer"
              onClick={() => setSelectedPattern(pattern)}
            >
              <CardContent className="p-6">
                <h3 className="font-semibold">{pattern}</h3>

                <p className="text-sm text-muted-foreground">
                  {problems.filter((p) => p.pattern === pattern).length}
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
            {selectedPattern ? `${selectedPattern} Problems` : "All Problems"}
          </h2>

          {selectedPattern && (
            <Button variant="ghost" onClick={() => setSelectedPattern(null)}>
              <X size={16} />
              Clear
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {filteredProblems.map((problem) => (
            <Card key={problem.id}>
              <CardContent className="p-5">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {problem.number}. {problem.name}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {problem.pattern}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {problem.status === "Solved" ? (
                      <CheckCircle2 className="text-green-500" />
                    ) : (
                      <Clock className="text-orange-500" />
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

                <p className="mt-4">
                  <b>Difficulty:</b> {problem.difficulty}
                </p>

                <p className="mt-2">
                  <b>Struggle:</b> {problem.struggle}
                </p>

                <p className="mt-2">
                  <b>Learning:</b> {problem.learning}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
