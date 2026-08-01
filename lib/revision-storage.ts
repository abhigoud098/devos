export function saveRevisionStats(data: unknown) {
  localStorage.setItem("revision-stats", JSON.stringify(data));
}

export function getRevisionStats() {
  const data = localStorage.getItem("revision-stats");

  return data ? JSON.parse(data) : null;
}

export function saveRevisionHistory(data: unknown) {
  localStorage.setItem("revision-history", JSON.stringify(data));
}

export function getRevisionHistory() {
  const data = localStorage.getItem("revision-history");

  return data ? JSON.parse(data) : [];
}

export function saveRevisionGoals(data: unknown) {
  localStorage.setItem("revision-goals", JSON.stringify(data));
}

export function getRevisionGoals() {
  const data = localStorage.getItem("revision-goals");

  return data
    ? JSON.parse(data)
    : {
        dailyTarget: 5,
        weeklyTarget: 30,
      };
}
