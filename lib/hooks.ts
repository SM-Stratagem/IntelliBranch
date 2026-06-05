"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboard } from "./store";
import { useTenant } from "@/components/TenantProvider";
import { generatePortfolioSeries } from "./mockData";
import type { DailyPoint } from "./types";

/**
 * Briefly returns `true` on mount and whenever `deps` change, so pages can show
 * loading skeletons over the (synchronous) mock data — mimicking a real fetch.
 * Initial value is `true` on both server and client, so no hydration mismatch.
 */
export function useFakeLoading(deps: unknown[], ms = 420): boolean {
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const key = useMemo(() => JSON.stringify(deps), deps);
  const first = useRef(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), first.current ? ms : Math.min(ms, 300));
    first.current = false;
    return () => clearTimeout(t);
  }, [key, ms]);

  return loading;
}

/** Resolve the current branch scope to a concrete list of branch ids, honouring
 *  both the selected branch and the user's role-visible branches. */
export function useScope() {
  const { visibleBranches } = useTenant();
  const selectedBranch = useDashboard((s) => s.selectedBranch);
  const days = useDashboard((s) => s.rangeDays());

  const branchIds = useMemo(() => {
    if (selectedBranch === "all") return visibleBranches.map((b) => b.id);
    return [selectedBranch];
  }, [selectedBranch, visibleBranches]);

  return { branchIds, selectedBranch, days };
}

/** Portfolio (or single-branch) daily series for the active scope + range. */
export function useScopedSeries(daysOverride?: number): { series: DailyPoint[]; branchIds: string[]; days: number } {
  const { tenant } = useTenant();
  const { branchIds, days: rangeDays } = useScope();
  const days = daysOverride ?? rangeDays;

  const series = useMemo(
    () => generatePortfolioSeries(tenant.id, days, branchIds),
    [tenant.id, days, branchIds]
  );
  return { series, branchIds, days };
}
