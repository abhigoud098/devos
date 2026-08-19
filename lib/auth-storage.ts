export type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

export type AuthUser = Omit<StoredUser, "password" | "createdAt">;

const USERS_KEY = "users";
const AUTH_USER_KEY = "auth_user";
const AUTH_TOKEN_KEY = "auth_token";

function browserStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function getUsers(): StoredUser[] {
  const value = browserStorage()?.getItem(USERS_KEY);
  if (!value) return [];

  try {
    const users = JSON.parse(value);
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: StoredUser[]) {
  browserStorage()?.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): AuthUser | null {
  const value = browserStorage()?.getItem(AUTH_USER_KEY);
  if (!value) return null;

  try {
    const user = JSON.parse(value);
    return user?.id && user?.email ? user : null;
  } catch {
    return null;
  }
}

export function saveSession(user: AuthUser, rememberMe: boolean) {
  const token = `${user.id}.${Date.now()}.${Math.random().toString(36).slice(2)}`;
  const storage = browserStorage();
  if (!storage) return;

  storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  // The token includes the Remember Me preference while keeping the required
  // auth_token key entirely local to this browser.
  storage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ token, rememberMe }));
}

export function clearSession() {
  const storage = browserStorage();
  storage?.removeItem(AUTH_USER_KEY);
  storage?.removeItem(AUTH_TOKEN_KEY);
}

export function publicUser(user: StoredUser): AuthUser {
  const { password: _password, createdAt: _createdAt, ...safeUser } = user;
  return safeUser;
}
