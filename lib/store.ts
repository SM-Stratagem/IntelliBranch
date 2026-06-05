import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AlertStatus, SessionUser, TenantConfig } from "./types";
import { DEMO_SESSION } from "./auth";
import { DEFAULT_TENANT_SLUG, registerTenants } from "./tenants";

/** Live overrides for a tenant's brand, edited in Settings → Branding. */
export type BrandOverride = Partial<
  Pick<TenantConfig, "primaryColor" | "accentColor" | "productName" | "name" | "logoUrl">
>;

export type DateRangePreset = "today" | "7d" | "30d" | "90d" | "custom";

export const PRESET_DAYS: Record<Exclude<DateRangePreset, "custom">, number> = {
  today: 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export const PRESET_LABEL: Record<DateRangePreset, string> = {
  today: "Today",
  "7d": "This Week",
  "30d": "This Month",
  "90d": "Last 90 Days",
  custom: "Custom",
};

type DashboardState = {
  // Active tenant (drives white-label theme; switchable via admin impersonation)
  tenantSlug: string;
  setTenantSlug: (slug: string) => void;

  // Tenants provisioned at runtime via the admin panel (persisted)
  customTenants: TenantConfig[];
  addTenant: (t: TenantConfig) => void;

  // Mock authenticated user
  session: SessionUser;
  setSession: (s: SessionUser) => void;

  // Branch scope: "all" or a specific branch id
  selectedBranch: string;
  setSelectedBranch: (id: string) => void;

  // Date range
  dateRange: DateRangePreset;
  setDateRange: (r: DateRangePreset) => void;
  rangeDays: () => number;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;

  // Per-tenant brand overrides (keyed by tenant slug) so each client keeps its
  // own branding across refreshes and tenant switches.
  tenantBrands: Record<string, BrandOverride>;
  setTenantBrand: (slug: string, o: BrandOverride) => void;

  // Per-alert status overrides (id -> status) layered over generated data
  alertOverrides: Record<string, AlertStatus>;
  setAlertStatus: (id: string, status: AlertStatus) => void;
  resetAlertOverrides: () => void;
};

export const useDashboard = create<DashboardState>()(
  persist(
    (set, get) => ({
      tenantSlug: DEFAULT_TENANT_SLUG,
      setTenantSlug: (slug) => set({ tenantSlug: slug, selectedBranch: "all" }),

      customTenants: [],
      addTenant: (t) => {
        registerTenants([t]); // make it resolvable by getTenant/getBranches immediately
        set((s) => ({ customTenants: [...s.customTenants.filter((x) => x.id !== t.id), t] }));
      },

      session: DEMO_SESSION,
      setSession: (session) => set({ session }),

      selectedBranch: "all",
      setSelectedBranch: (selectedBranch) => set({ selectedBranch }),

      dateRange: "30d",
      setDateRange: (dateRange) => set({ dateRange }),
      rangeDays: () => {
        const r = get().dateRange;
        return r === "custom" ? 30 : PRESET_DAYS[r];
      },

      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      tenantBrands: {},
      setTenantBrand: (slug, o) =>
        set((s) => ({ tenantBrands: { ...s.tenantBrands, [slug]: { ...s.tenantBrands[slug], ...o } } })),

      alertOverrides: {},
      setAlertStatus: (id, status) =>
        set((s) => ({ alertOverrides: { ...s.alertOverrides, [id]: status } })),
      resetAlertOverrides: () => set({ alertOverrides: {} }),
    }),
    {
      name: "intellibranch-store",
      version: 1,
      // SSR-safe: don't read localStorage during store creation. <StoreHydrator>
      // calls rehydrate() after mount, so the first client render matches the
      // server (default state) and there's no hydration mismatch.
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        tenantSlug: s.tenantSlug,
        customTenants: s.customTenants,
        session: s.session,
        selectedBranch: s.selectedBranch,
        dateRange: s.dateRange,
        sidebarCollapsed: s.sidebarCollapsed,
        tenantBrands: s.tenantBrands,
        alertOverrides: s.alertOverrides,
      }),
      // Re-register persisted custom tenants so the data layer can resolve them.
      onRehydrateStorage: () => (state) => {
        if (state?.customTenants?.length) registerTenants(state.customTenants);
      },
    }
  )
);
