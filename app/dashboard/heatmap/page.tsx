"use client";

import { useMemo, useState } from "react";
import { Flame, Moon, Sun } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { useFakeLoading } from "@/lib/hooks";
import { generateHeatmap } from "@/lib/mockData";
import { DAYS } from "@/lib/format";
import ChartCard from "@/components/ui/ChartCard";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

const HOURS = Array.from({ length: 24 }, (_, h) => h);

export default function HeatmapPage() {
  const { tenant, terms, visibleBranches } = useTenant();
  const [branchId, setBranchId] = useState<string>("all");
  const loading = useFakeLoading([tenant.id, branchId]);

  // Aggregate across visible branches when "all" is selected, else single branch.
  const grid = useMemo(() => {
    const ids = branchId === "all" ? visibleBranches.map((b) => b.id) : [branchId];
    const grids = ids.map((id) => generateHeatmap(id));
    return grids.reduce<number[][]>((acc, g) => {
      if (acc.length === 0) return g.map((row) => [...row]);
      return acc.map((row, d) => row.map((v, h) => v + g[d][h]));
    }, []);
  }, [branchId, visibleBranches]);

  const max = Math.max(...grid.flat(), 1);

  // Summary metrics.
  const { peakDay, peakHour, deadZones } = useMemo(() => {
    const dayTotals = grid.map((row) => row.reduce((a, v) => a + v, 0));
    const hourTotals = HOURS.map((h) => grid.reduce((a, row) => a + row[h], 0));
    const pd = dayTotals.indexOf(Math.max(...dayTotals));
    const ph = hourTotals.indexOf(Math.max(...hourTotals));
    const dead = grid.flat().filter((v) => v / max < 0.08).length;
    return { peakDay: DAYS[pd] ?? "—", peakHour: ph, deadZones: dead };
  }, [grid, max]);

  const fmtHour = (h: number) => `${((h + 11) % 12) + 1}${h < 12 ? "am" : "pm"}`;

  if (loading) return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-3"><LoadingSkeleton variant="kpi" count={3} /></div><LoadingSkeleton variant="chart" /></div>;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary"><Flame size={20} /></span>
          <div><p className="text-xs text-[#94A3B8]">Peak hour</p><p className="font-fraunces text-xl font-bold text-[#0B1F3A]">{fmtHour(peakHour)}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-600"><Sun size={20} /></span>
          <div><p className="text-xs text-[#94A3B8]">Peak day</p><p className="font-fraunces text-xl font-bold text-[#0B1F3A]">{peakDay}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Moon size={20} /></span>
          <div><p className="text-xs text-[#94A3B8]">Dead zones (hrs)</p><p className="font-fraunces text-xl font-bold text-[#0B1F3A]">{deadZones}</p></div>
        </div>
      </div>

      <ChartCard
        title="Revenue Intensity Heatmap"
        subtitle="By day of week × hour of day"
        actions={
          <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-xs font-medium text-[#1E293B] outline-none focus:border-primary">
            <option value="all">All {terms.branches}</option>
            {visibleBranches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        }
      >
        <div className="scroll-thin overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Hour header */}
            <div className="mb-1 flex pl-12">
              {HOURS.map((h) => (
                <div key={h} className="flex-1 text-center text-[9px] text-[#94A3B8]">{h % 3 === 0 ? fmtHour(h) : ""}</div>
              ))}
            </div>
            {grid.map((row, d) => (
              <div key={d} className="flex items-center">
                <div className="w-12 pr-2 text-right text-[11px] font-medium text-[#64748B]">{DAYS[d]}</div>
                <div className="flex flex-1 gap-[2px]">
                  {row.map((v, h) => {
                    const intensity = v / max;
                    return (
                      <div
                        key={h}
                        title={`${DAYS[d]} ${fmtHour(h)} · ${Math.round(intensity * 100)}% of peak`}
                        className="h-7 flex-1 rounded-[3px] transition-transform hover:scale-110 hover:ring-2 hover:ring-primary"
                        style={{ background: `color-mix(in srgb, var(--primary) ${Math.round(intensity * 100)}%, #F1F5F9)` }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            {/* Legend */}
            <div className="mt-4 flex items-center justify-end gap-2 pl-12 text-[11px] text-[#94A3B8]">
              Less
              {[8, 30, 55, 80, 100].map((p) => (
                <span key={p} className="h-3.5 w-6 rounded-[3px]" style={{ background: `color-mix(in srgb, var(--primary) ${p}%, #F1F5F9)` }} />
              ))}
              More
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
