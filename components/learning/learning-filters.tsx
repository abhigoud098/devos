"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLearningStore } from "@/store/learning-store";
import { listDistinctTechnologies } from "@/lib/learning-repo";

export function LearningFilters() {
  const {
    search,
    statusFilter,
    technologyFilter,
    setSearch,
    setStatusFilter,
    setTechnologyFilter,
    openCreateDialog,
  } = useLearningStore();

  const [technologies, setTechnologies] = useState<string[]>([]);

  useEffect(() => {
    listDistinctTechnologies().then(setTechnologies);
  }, [search, statusFilter, technologyFilter]);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" />
        <Input
          placeholder="Search technology, topic, subtopic…"
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="not-started">Not started</SelectItem>
          <SelectItem value="in-progress">In progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="revising">Revising</SelectItem>
        </SelectContent>
      </Select>

      <Select value={technologyFilter} onValueChange={setTechnologyFilter}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All technologies</SelectItem>
          {technologies.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={openCreateDialog} className="ml-auto">
        <Plus className="h-4 w-4" />
        Add topic
      </Button>
    </div>
  );
}
