import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LearningStatus } from "@/lib/types";

interface LearningUIState {
  search: string;
  statusFilter: LearningStatus | "all";
  technologyFilter: string | "all";

  dialogOpen: boolean;
  editingId: string | null;

  setSearch: (v: string) => void;
  setStatusFilter: (v: LearningStatus | "all") => void;
  setTechnologyFilter: (v: string) => void;

  resetFilters: () => void;

  openCreateDialog: () => void;
  openEditDialog: (id: string) => void;
  closeDialog: () => void;
}

export const useLearningStore = create<LearningUIState>()(
  persist(
    (set) => ({
      search: "",
      statusFilter: "all",
      technologyFilter: "all",

      dialogOpen: false,
      editingId: null,

      setSearch: (search) => set({ search }),

      setStatusFilter: (statusFilter) => set({ statusFilter }),

      setTechnologyFilter: (technologyFilter) => set({ technologyFilter }),

      resetFilters: () =>
        set({
          search: "",
          statusFilter: "all",
          technologyFilter: "all",
        }),

      openCreateDialog: () =>
        set({
          dialogOpen: true,
          editingId: null,
        }),

      openEditDialog: (editingId) =>
        set({
          dialogOpen: true,
          editingId,
        }),

      closeDialog: () =>
        set({
          dialogOpen: false,
          editingId: null,
        }),
    }),
    {
      name: "learning-ui-storage",

      partialize: (state) => ({
        search: state.search,
        statusFilter: state.statusFilter,
        technologyFilter: state.technologyFilter,
      }),
    },
  ),
);
