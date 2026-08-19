import { api } from "./api-client";

export function saveRevisionStats(data: unknown) {
  if (typeof window !== "undefined") {
    localStorage.setItem("revision-stats", JSON.stringify(data));
  }
}

export function getRevisionStats() {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("revision-stats");
  return data ? JSON.parse(data) : null;
}

export function saveRevisionHistory(data: unknown) {
  if (typeof window !== "undefined") {
    localStorage.setItem("revision-history", JSON.stringify(data));
  }
}

export function getRevisionHistory() {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("revision-history");
  return data ? JSON.parse(data) : [];
}

export function saveRevisionGoals(data: { dailyTarget?: number; weeklyTarget?: number }) {
  if (typeof window !== "undefined") {
    localStorage.setItem("revision-goals", JSON.stringify(data));
  }
  api.revision.updateGoals(data);
}

export function getRevisionGoals(): { dailyTarget: number; weeklyTarget: number } {
  if (typeof window === "undefined") {
    return { dailyTarget: 5, weeklyTarget: 30 };
  }
  const data = localStorage.getItem("revision-goals");
  return data
    ? JSON.parse(data)
    : {
        dailyTarget: 5,
        weeklyTarget: 30,
      };
}
