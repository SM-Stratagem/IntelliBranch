import type { SessionUser, UserRole } from "./types";

// ============================================================================
// Mock auth layer. A real implementation would back this with next-auth; the
// page contract (a SessionUser with role + allowedBranches) stays identical.
// ============================================================================

export const MOCK_USERS: (SessionUser & { password: string })[] = [
  {
    id: "u_super",
    name: "Sara Mansour",
    email: "exara.ai@gmail.com",
    password: "demo",
    role: "super_admin",
    tenantId: "t_lumen",
    allowedBranches: [],
    avatarColor: "#0B1F3A",
  },
  {
    id: "u_admin",
    name: "Omar Haddad",
    email: "admin@lumengroup.ae",
    password: "demo",
    role: "tenant_admin",
    tenantId: "t_lumen",
    allowedBranches: [],
    avatarColor: "#0D9488",
  },
  {
    id: "u_manager",
    name: "Aisha Rahman",
    email: "aisha@lumengroup.ae",
    password: "demo",
    role: "branch_manager",
    tenantId: "t_lumen",
    allowedBranches: ["t_lumen_b1", "t_lumen_b5"],
    avatarColor: "#B45309",
  },
  {
    id: "u_viewer",
    name: "James Carter",
    email: "viewer@lumengroup.ae",
    password: "demo",
    role: "viewer",
    tenantId: "t_lumen",
    allowedBranches: [],
    avatarColor: "#7C3AED",
  },
];

export const ROLE_LABEL: Record<UserRole, string> = {
  super_admin: "Super Admin",
  tenant_admin: "Admin",
  branch_manager: "Branch Manager",
  franchisee: "Franchisee",
  viewer: "Viewer",
};

/** Which roles may export / mutate. Viewers are read-only. */
export function canExport(role: UserRole): boolean {
  return role !== "viewer";
}
export function canManageTenant(role: UserRole): boolean {
  return role === "super_admin" || role === "tenant_admin";
}
export function canAccessAdmin(role: UserRole): boolean {
  return role === "super_admin";
}

export function authenticate(email: string, password: string): SessionUser | null {
  const u = MOCK_USERS.find(
    (m) => m.email.toLowerCase() === email.toLowerCase() && m.password === password
  );
  if (!u) return null;
  const { password: _pw, ...session } = u;
  return session;
}

/** The session used when no real login has occurred (demo mode). */
export const DEMO_SESSION: SessionUser = (() => {
  const { password: _pw, ...s } = MOCK_USERS[1]; // tenant_admin
  return s;
})();
