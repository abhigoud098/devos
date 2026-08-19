import { getSession } from "@/lib/auth-storage";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data?: T; error?: string; status: number }> {
  try {
    const session = getSession();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (session?.id) {
      headers["Authorization"] = `Bearer ${session.id}`;
      headers["x-user-id"] = session.id;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        error: json.error || `Request failed with status ${res.status}`,
        status: res.status,
      };
    }

    return { data: json as T, status: res.status };
  } catch (err: any) {
    return {
      error: err.message || "Network error. Please check your connection.",
      status: 0,
    };
  }
}

export const api = {
  // Auth
  auth: {
    async signup(name: string, email: string, password: string) {
      return request<{ success: boolean; user: any }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
    },
    async login(email: string, password: string) {
      return request<{ success: boolean; user: any }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    async me() {
      return request<{ user: any }>("/api/auth/me");
    },
    async updateProfile(name: string, email: string) {
      return request<{ success: boolean; user: any }>("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ name, email }),
      });
    },
    async changePassword(currentPassword: string, newPassword: string) {
      return request<{ success: boolean }>("/api/auth/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },
  },

  // Learning Topics
  learning: {
    async list() {
      return request<{ topics: any[] }>("/api/learning");
    },
    async get(id: string) {
      return request<{ topic: any }>(`/api/learning/${id}`);
    },
    async create(data: any) {
      return request<{ success: boolean; topic: any }>("/api/learning", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: any) {
      return request<{ success: boolean; topic: any }>(`/api/learning/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    async delete(id: string) {
      return request<{ success: boolean }>(`/api/learning/${id}`, {
        method: "DELETE",
      });
    },
    async markRevisionDone(topicId: string, revisionDate: string, notes?: string) {
      return request<{ success: boolean }>(`/api/learning/${topicId}/revision`, {
        method: "PUT",
        body: JSON.stringify({ revisionDate, done: true, notes }),
      });
    },
  },

  // Notes
  notes: {
    async list() {
      return request<{ notes: any[] }>("/api/notes");
    },
    async create(data: { title: string; content: string; type?: string; image?: string }) {
      return request<{ success: boolean; note: any }>("/api/notes", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: Partial<{ title: string; content: string; type: string; image: string }>) {
      return request<{ success: boolean; note: any }>(`/api/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    async delete(id: string) {
      return request<{ success: boolean }>(`/api/notes/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Projects
  projects: {
    async list() {
      return request<{ projects: any[] }>("/api/projects");
    },
    async create(data: {
      title: string;
      description: string;
      tech: string;
      github?: string;
      live?: string;
      status?: string;
      image?: string;
    }) {
      return request<{ success: boolean; project: any }>("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: any) {
      return request<{ success: boolean; project: any }>(`/api/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    async delete(id: string) {
      return request<{ success: boolean }>(`/api/projects/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Resources
  resources: {
    async list() {
      return request<{ resources: any[] }>("/api/resources");
    },
    async create(data: {
      title: string;
      url: string;
      description: string;
      type?: string;
      image?: string;
    }) {
      return request<{ success: boolean; resource: any }>("/api/resources", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: any) {
      return request<{ success: boolean; resource: any }>(`/api/resources/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    async delete(id: string) {
      return request<{ success: boolean }>(`/api/resources/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Planner
  planner: {
    async list() {
      return request<{ tasks: any[] }>("/api/planner");
    },
    async create(data: {
      title: string;
      description: string;
      date: string;
      hours?: string;
      status?: string;
      image?: string;
    }) {
      return request<{ success: boolean; task: any }>("/api/planner", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: any) {
      return request<{ success: boolean; task: any }>(`/api/planner/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    async delete(id: string) {
      return request<{ success: boolean }>(`/api/planner/${id}`, {
        method: "DELETE",
      });
    },
  },

  // DSA
  dsa: {
    async list() {
      return request<{ problems: any[] }>("/api/dsa");
    },
    async create(data: any) {
      return request<{ success: boolean; problem: any }>("/api/dsa", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: any) {
      return request<{ success: boolean; problem: any }>(`/api/dsa/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    async delete(id: string) {
      return request<{ success: boolean }>(`/api/dsa/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Timer & Sessions
  timer: {
    async getSessions() {
      return request<{ sessions: any[] }>("/api/timer/sessions");
    },
    async addSession(type: string, duration: number, completedAt?: string) {
      return request<{ success: boolean; session: any }>("/api/timer/sessions", {
        method: "POST",
        body: JSON.stringify({ type, duration, completedAt }),
      });
    },
    async clearHistory() {
      return request<{ success: boolean }>("/api/timer/sessions", {
        method: "DELETE",
      });
    },
    async getSettings() {
      return request<{ settings: any }>("/api/timer/settings");
    },
    async updateSettings(settings: {
      focusDuration?: number;
      shortBreakDuration?: number;
      longBreakDuration?: number;
    }) {
      return request<{ success: boolean; settings: any }>("/api/timer/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
    },
  },

  // Revision Goals
  revision: {
    async getGoals() {
      return request<{ goals: { dailyTarget: number; weeklyTarget: number } }>(
        "/api/revision/goals",
      );
    },
    async updateGoals(goals: { dailyTarget?: number; weeklyTarget?: number }) {
      return request<{ success: boolean; goals: any }>("/api/revision/goals", {
        method: "PUT",
        body: JSON.stringify(goals),
      });
    },
  },

  // Preferences
  preferences: {
    async get() {
      return request<{ preferences: any }>("/api/preferences");
    },
    async update(data: { theme?: string; dimMode?: boolean }) {
      return request<{ success: boolean; preferences: any }>(
        "/api/preferences",
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
      );
    },
  },

  // Sync
  sync: {
    async syncAll(data: any) {
      return request<{ success: boolean; message: string }>("/api/sync", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },
};
