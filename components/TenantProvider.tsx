"use client";

import { createContext, useContext, useMemo } from "react";
import type { Branch, TenantConfig } from "@/lib/types";
import { getBranches, getTenant } from "@/lib/tenants";
import { INDUSTRY, type IndustryTerms } from "@/lib/industry";
import { useDashboard } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/format";

type TenantContextValue = {
  tenant: TenantConfig;
  branches: Branch[];
  terms: IndustryTerms;
  industryLabel: string;
  /** Branches the current user is allowed to see (role-scoped). */
  visibleBranches: Branch[];
  money: (v: number, opts?: { compact?: boolean; decimals?: number }) => string;
  date: (iso: string) => string;
};

const TenantContext = createContext<TenantContextValue | null>(null);

/**
 * Injects the active tenant into React context AND sets the white-label CSS
 * variables (--primary / --primary-lt / --accent) on a wrapper element, so the
 * entire dashboard — chrome and Recharts SVGs alike — re-skins to the tenant's
 * brand without any component knowing the colours.
 */
export function TenantProvider({ children }: { children: React.ReactNode }) {
  const tenantSlug = useDashboard((s) => s.tenantSlug);
  const session = useDashboard((s) => s.session);
  const tenantBrands = useDashboard((s) => s.tenantBrands);
  const customTenants = useDashboard((s) => s.customTenants);

  const value = useMemo<TenantContextValue | null>(() => {
    const base = getTenant(tenantSlug) ?? customTenants.find((t) => t.slug === tenantSlug);
    if (!base) return null;
    // Layer this tenant's live Settings → Branding override over the config.
    const tenant: TenantConfig = { ...base, ...(tenantBrands[tenantSlug] ?? {}) };
    const branches = getBranches(tenant.id);
    const allowed = session.allowedBranches;
    const visibleBranches =
      allowed.length === 0 ? branches : branches.filter((b) => allowed.includes(b.id));
    return {
      tenant,
      branches,
      visibleBranches,
      terms: INDUSTRY[tenant.industry].terms,
      industryLabel: INDUSTRY[tenant.industry].label,
      money: (v, opts) => formatCurrency(v, tenant.currency, opts),
      date: (iso) => formatDate(iso, tenant),
    };
  }, [tenantSlug, session.allowedBranches, tenantBrands, customTenants]);

  if (!value) return <>{children}</>;

  const { tenant } = value;
  const cssVars = {
    "--primary": tenant.primaryColor,
    "--primary-lt": `color-mix(in srgb, ${tenant.primaryColor} 80%, white)`,
    "--accent": tenant.accentColor,
  } as React.CSSProperties;

  return (
    <TenantContext.Provider value={value}>
      <div style={cssVars} className="min-h-screen">
        {children}
      </div>
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within a TenantProvider");
  return ctx;
}
