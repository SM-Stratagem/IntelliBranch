"use client";

import { useEffect } from "react";
import { useDashboard } from "@/lib/store";
import { registerTenants } from "@/lib/tenants";

/**
 * Rehydrates the persisted Zustand store AFTER the first client render. Because
 * the store is created with `skipHydration: true`, server and first-client
 * renders both use default state (no hydration mismatch); persisted values are
 * applied here on mount. Also re-registers any runtime-created tenants so the
 * data layer can resolve them. Renders nothing.
 */
export default function StoreHydrator() {
  useEffect(() => {
    void useDashboard.persist.rehydrate();
    registerTenants(useDashboard.getState().customTenants);
  }, []);
  return null;
}
