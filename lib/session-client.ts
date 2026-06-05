import type { SessionUser } from "./types";

// Client-safe helpers that talk to the auth Route Handlers. No secrets here —
// the password check and cookie signing happen server-side in /api/login.

/** POST credentials to the server. Returns the session on success, else null. */
export async function apiLogin(email: string, password: string): Promise<SessionUser | null> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  return (await res.json()) as SessionUser;
}

/** Clear the server session cookie. Safe to call even if already logged out. */
export async function apiLogout(): Promise<void> {
  try {
    await fetch("/api/logout", { method: "POST" });
  } catch {
    // Network hiccup on logout shouldn't block navigation away.
  }
}
