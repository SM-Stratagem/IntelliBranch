import type { Branch, TenantConfig } from "./types";
import { INDUSTRY } from "./industry";

// ============================================================================
// Mock tenant directory. In production this is a DB table resolved by custom
// domain → subdomain → URL slug (see resolveTenant). Swap this module for an
// API/Prisma client without touching any page.
// ============================================================================

export const TENANTS: TenantConfig[] = [
  {
    id: "t_lumen",
    slug: "lumen",
    name: "Lumen Retail Group",
    productName: "Lumen Insights",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#0D9488",
    accentColor: "#0B1F3A",
    industry: "retail",
    currency: "AED",
    dateFormat: "DD/MM/YYYY",
    timezone: "Asia/Dubai",
    locale: "en-AE",
    modules: INDUSTRY.retail.defaultModules,
    customDomain: "insights.lumengroup.ae",
    supportEmail: "support@lumengroup.ae",
    hideSmStratagem: true,
    welcomeMessage: "Welcome back — here's how your stores performed.",
    plan: "Enterprise",
    status: "active",
    createdAt: "2024-02-11",
    lastActive: "2026-06-03",
  },
  {
    id: "t_saffron",
    slug: "saffron",
    name: "Saffron Hospitality",
    productName: "BranchIQ",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#B45309",
    accentColor: "#1F2937",
    industry: "fnb",
    currency: "GBP",
    dateFormat: "DD/MM/YYYY",
    timezone: "Europe/London",
    locale: "en-GB",
    modules: INDUSTRY.fnb.defaultModules,
    supportEmail: "ops@saffrongroup.co.uk",
    hideSmStratagem: true,
    welcomeMessage: "Service starts soon — review last night's covers.",
    plan: "Growth",
    status: "active",
    createdAt: "2024-09-03",
    lastActive: "2026-06-02",
  },
  {
    id: "t_northwell",
    slug: "northwell",
    name: "Northwell Clinics",
    productName: "Northwell Analytics",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#2563EB",
    accentColor: "#0B1F3A",
    industry: "healthcare",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    timezone: "America/New_York",
    locale: "en-US",
    modules: INDUSTRY.healthcare.defaultModules,
    hideSmStratagem: false,
    welcomeMessage: "Today's appointment book and compliance status.",
    plan: "Enterprise",
    status: "active",
    createdAt: "2023-11-20",
    lastActive: "2026-06-03",
  },
  {
    id: "t_velocity",
    slug: "velocity",
    name: "Velocity Auto Care",
    productName: "IntelliBranch",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#DC2626",
    accentColor: "#111827",
    industry: "automotive",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    timezone: "America/Chicago",
    locale: "en-US",
    modules: INDUSTRY.automotive.defaultModules,
    hideSmStratagem: false,
    plan: "Growth",
    status: "trial",
    createdAt: "2026-05-12",
    lastActive: "2026-06-01",
  },
  {
    id: "t_pulse",
    slug: "pulse",
    name: "Pulse Fitness Collective",
    productName: "Pulse HQ",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#7C3AED",
    accentColor: "#0B1F3A",
    industry: "fitness",
    currency: "EUR",
    dateFormat: "DD/MM/YYYY",
    timezone: "Europe/Berlin",
    locale: "de-DE",
    modules: INDUSTRY.fitness.defaultModules,
    hideSmStratagem: true,
    plan: "Starter",
    status: "active",
    createdAt: "2025-06-30",
    lastActive: "2026-05-29",
  },
];

export const DEFAULT_TENANT_SLUG = "lumen";

// Tenants provisioned at runtime via the admin panel. The store persists these
// and re-registers them on hydrate, so the pure data layer below can resolve
// them just like the seed tenants.
const CUSTOM: TenantConfig[] = [];

export function registerTenants(list: TenantConfig[]): void {
  for (const t of list) {
    const i = CUSTOM.findIndex((c) => c.id === t.id);
    if (i >= 0) CUSTOM[i] = t;
    else CUSTOM.push(t);
  }
}

export function getAllTenants(): TenantConfig[] {
  return [...TENANTS, ...CUSTOM];
}

export function getTenant(slug: string): TenantConfig | undefined {
  return TENANTS.find((t) => t.slug === slug) ?? CUSTOM.find((t) => t.slug === slug);
}

export function getTenantById(id: string): TenantConfig | undefined {
  return TENANTS.find((t) => t.id === id) ?? CUSTOM.find((t) => t.id === id);
}

/**
 * Resolve the active tenant the way production would: custom domain first,
 * then subdomain, then the `/[slug]` URL segment, falling back to the default.
 */
export function resolveTenant(input: {
  host?: string;
  slug?: string;
}): TenantConfig {
  const { host, slug } = input;
  const all = getAllTenants();
  if (host) {
    const byDomain = all.find((t) => t.customDomain === host);
    if (byDomain) return byDomain;
    const sub = host.split(".")[0];
    const bySub = all.find((t) => t.slug === sub);
    if (bySub) return bySub;
  }
  if (slug) {
    const bySlug = getTenant(slug);
    if (bySlug) return bySlug;
  }
  return getTenant(DEFAULT_TENANT_SLUG)!;
}

// ---------------------------------------------------------------------------
// Branches per tenant. City names are themed to the tenant's market.
// ---------------------------------------------------------------------------

const BRANCH_SEEDS: Record<string, { name: string; city: string; country: string }[]> = {
  t_lumen: [
    { name: "Dubai Mall Flagship", city: "Dubai", country: "UAE" },
    { name: "Mall of the Emirates", city: "Dubai", country: "UAE" },
    { name: "Yas Mall", city: "Abu Dhabi", country: "UAE" },
    { name: "City Centre Deira", city: "Dubai", country: "UAE" },
    { name: "Marina Walk", city: "Dubai", country: "UAE" },
    { name: "Al Wahda", city: "Abu Dhabi", country: "UAE" },
    { name: "Sahara Centre", city: "Sharjah", country: "UAE" },
    { name: "Festival City", city: "Dubai", country: "UAE" },
  ],
  t_saffron: [
    { name: "Soho", city: "London", country: "UK" },
    { name: "Shoreditch", city: "London", country: "UK" },
    { name: "Canary Wharf", city: "London", country: "UK" },
    { name: "Manchester Deansgate", city: "Manchester", country: "UK" },
    { name: "Edinburgh New Town", city: "Edinburgh", country: "UK" },
    { name: "Birmingham Bullring", city: "Birmingham", country: "UK" },
  ],
  t_northwell: [
    { name: "Midtown Clinic", city: "New York", country: "USA" },
    { name: "Brooklyn Heights", city: "New York", country: "USA" },
    { name: "Jersey City", city: "Jersey City", country: "USA" },
    { name: "Stamford", city: "Stamford", country: "USA" },
    { name: "White Plains", city: "White Plains", country: "USA" },
  ],
  t_velocity: [
    { name: "Downtown Service Center", city: "Chicago", country: "USA" },
    { name: "Naperville", city: "Naperville", country: "USA" },
    { name: "Schaumburg", city: "Schaumburg", country: "USA" },
    { name: "Aurora", city: "Aurora", country: "USA" },
  ],
  t_pulse: [
    { name: "Mitte", city: "Berlin", country: "Germany" },
    { name: "Kreuzberg", city: "Berlin", country: "Germany" },
    { name: "Hamburg HafenCity", city: "Hamburg", country: "Germany" },
    { name: "Munich Schwabing", city: "Munich", country: "Germany" },
    { name: "Cologne", city: "Cologne", country: "Germany" },
  ],
};

/** Generic branch seeds for runtime-created tenants that have no curated list. */
function genericSeeds(tenantId: string): { name: string; city: string; country: string }[] {
  const t = getTenantById(tenantId);
  const n = 5;
  return Array.from({ length: n }, (_, i) => ({
    name: i === 0 ? `${t?.name ?? "HQ"} Flagship` : `${t?.name ?? "Branch"} — Location ${i + 1}`,
    city: "—",
    country: "—",
  }));
}

/** Deterministically derive branch records (with scale/trend) for a tenant. */
export function getBranches(tenantId: string): Branch[] {
  const seeds = BRANCH_SEEDS[tenantId] ?? genericSeeds(tenantId);
  return seeds.map((s, i) => {
    // Stable pseudo-random scale/trend from the index so values never shift.
    const scale = 0.6 + ((i * 7 + 3) % 10) / 10; // 0.6 – 1.5
    const trend = (((i * 13 + 5) % 11) - 5) / 50; // -0.10 … +0.10
    return {
      id: `${tenantId}_b${i + 1}`,
      tenantId,
      name: s.name,
      city: s.city,
      country: s.country,
      scale,
      trend,
      openedAt: `20${18 + (i % 6)}-0${(i % 9) + 1}-15`,
      active: i !== seeds.length - 1 || tenantId !== "t_lumen" ? true : true,
    };
  });
}
