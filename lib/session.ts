import crypto from "node:crypto";
import type { SessionUser } from "./types";
import { authenticate } from "./auth";

// ============================================================================
// SERVER-ONLY session layer. Signs/verifies the auth cookie and validates the
// env-configured admin. Never import this from a Client Component — it pulls in
// node:crypto and reads server secrets. Clients talk to /api/login instead.
// ============================================================================

export const SESSION_COOKIE = "ib_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours, in seconds

function secret(): string {
  // AUTH_SECRET must be set in production (Vercel env). The dev fallback only
  // keeps local `next dev` working without configuration.
  return process.env.AUTH_SECRET || "dev-only-insecure-secret-do-not-ship";
}

/** Sign a session into a tamper-proof `payload.signature` token. */
export function signSession(session: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

/** Verify a cookie token and return the session, or null if missing/forged. */
export function verifySession(token: string | undefined | null): SessionUser | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * The single env-configured admin. Set ADMIN_EMAIL + ADMIN_PASSWORD on the host
 * (e.g. Vercel project env vars). Returns null when unset or on a mismatch.
 */
export function authenticateEnvAdmin(email: string, password: string): SessionUser | null {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return null;
  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return null;
  if (password !== adminPassword) return null;
  return {
    id: "u_env_admin",
    name: process.env.ADMIN_NAME || "Administrator",
    email: adminEmail,
    role: "super_admin",
    tenantId: "t_lumen",
    allowedBranches: [],
    avatarColor: "#0B1F3A",
  };
}

/** Validate any login: the env admin first, then the demo mock accounts. */
export function authenticateAny(email: string, password: string): SessionUser | null {
  return authenticateEnvAdmin(email, password) ?? authenticate(email, password);
}
