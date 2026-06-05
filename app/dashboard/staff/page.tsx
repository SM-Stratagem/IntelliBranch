"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users, Activity, Percent, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { useScope, useFakeLoading } from "@/lib/hooks";
import { generateStaff } from "@/lib/mockData";
import ChartCard from "@/components/ui/ChartCard";
import KPICard from "@/components/ui/KPICard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import StatBar from "@/components/ui/StatBar";
import Badge from "@/components/ui/Badge";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { AXIS_TICK, GRID_PROPS, TOOLTIP_STYLE } from "@/components/charts/chartTheme";
import type { StaffMember } from "@/lib/types";

export default function StaffPage() {
  const { tenant, terms, money, visibleBranches } = useTenant();
  const { branchIds } = useScope();
  const loading = useFakeLoading([tenant.id, branchIds.join(",")]);
  const staff = useMemo(() => generateStaff(tenant.id, branchIds), [tenant.id, branchIds]);

  const avgRevShift = staff.length ? staff.reduce((a, s) => a + s.revenuePerShift, 0) / staff.length : 0;
  const avgLabor = staff.length ? staff.reduce((a, s) => a + s.laborCostPct, 0) / staff.length : 0;
  const avgProd = staff.length ? staff.reduce((a, s) => a + s.productivity, 0) / staff.length : 0;

  // Labour % by branch.
  const byBranch = useMemo(
    () =>
      visibleBranches.map((b) => {
        const members = staff.filter((s) => s.branchId === b.id);
        const labour = members.length ? members.reduce((a, s) => a + s.laborCostPct, 0) / members.length : 0;
        // Optimal headcount ~ scaled by branch size; compare to actual.
        const optimal = Math.round(4 + b.scale * 3);
        const actual = members.length;
        return { id: b.id, name: b.name.length > 12 ? b.name.slice(0, 11) + "…" : b.name, labour: +labour.toFixed(1), actual, optimal };
      }),
    [visibleBranches, staff]
  );

  const leaderboard = staff.slice(0, 5);

  const columns: Column<StaffMember>[] = [
    { key: "name", header: "Name", sortValue: (r) => r.name, render: (r) => (<div><span className="block font-medium text-[#0B1F3A]">{r.name}</span><span className="block text-xs text-[#94A3B8]">{r.role}</span></div>) },
    { key: "branch", header: terms.branch, sortValue: (r) => r.branchName, render: (r) => <span className="text-[#475569]">{r.branchName}</span> },
    { key: "revShift", header: "Rev / shift", align: "right", sortValue: (r) => r.revenuePerShift, render: (r) => <span className="font-medium text-[#0B1F3A]">{money(r.revenuePerShift, { compact: true })}</span> },
    { key: "hours", header: "Hours/wk", align: "right", sortValue: (r) => r.hoursThisWeek, render: (r) => `${r.hoursThisWeek}h` },
    { key: "labor", header: "Labour %", align: "right", sortValue: (r) => r.laborCostPct, render: (r) => <span className={r.laborCostPct > 28 ? "text-red-500" : "text-[#475569]"}>{r.laborCostPct}%</span> },
    { key: "prod", header: "Productivity", align: "left", sortValue: (r) => r.productivity, render: (r) => <div className="w-28"><StatBar value={r.productivity} display={`${r.productivity}`} tone={r.productivity >= 80 ? "success" : r.productivity >= 60 ? "primary" : "warning"} /></div> },
  ];

  if (loading) return <div className="space-y-5"><div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><LoadingSkeleton variant="kpi" count={4} /></div><LoadingSkeleton variant="table" /></div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Headcount" value={staff.length.toString()} icon={Users} />
        <KPICard label="Avg Rev / Shift" value={money(avgRevShift, { compact: true })} icon={Activity} delta={4.7} />
        <KPICard label="Labour Cost %" value={`${avgLabor.toFixed(1)}%`} icon={Percent} invertDelta delta={-1.2} />
        <KPICard label="Avg Productivity" value={avgProd.toFixed(0)} icon={Trophy} delta={2.3} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard title="Labour Cost %" subtitle={`By ${terms.branch.toLowerCase()}`} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byBranch} margin={{ left: -12, right: 8 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={40} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#F1F5F9" }} formatter={(v) => `${v}%`} />
              <Bar dataKey="labour" radius={[5, 5, 0, 0]} barSize={34}>
                {byBranch.map((b, i) => <Cell key={i} fill={b.labour > 28 ? "#DC2626" : "var(--primary)"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-1 text-center text-xs text-[#94A3B8]">Bars above 28% (red) indicate labour cost pressure.</p>
        </ChartCard>

        {/* Top performers */}
        <ChartCard title="Top Performers" subtitle="By productivity score" bodyClassName="space-y-2.5">
          {leaderboard.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg border border-[#EEF1F6] px-3 py-2.5">
              <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-fraunces text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-slate-200 text-slate-600" : i === 2 ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#0B1F3A]">{s.name}</p><p className="truncate text-xs text-[#94A3B8]">{s.branchName}</p></div>
              <Badge variant="success">{s.productivity}</Badge>
            </div>
          ))}
        </ChartCard>
      </div>

      {/* Staffing indicator */}
      <ChartCard title="Over / Under Staffing" subtitle="Actual headcount vs optimal model">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {byBranch.map((b) => {
            const diff = b.actual - b.optimal;
            const tone = diff > 1 ? "warning" : diff < -1 ? "danger" : "success";
            const Icon = diff > 1 ? TrendingUp : diff < -1 ? TrendingDown : Minus;
            const label = diff > 1 ? "Overstaffed" : diff < -1 ? "Understaffed" : "Optimal";
            return (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-[#EEF1F6] px-4 py-3">
                <div><p className="text-sm font-semibold text-[#0B1F3A]">{b.name}</p><p className="text-xs text-[#94A3B8]">{b.actual} actual · {b.optimal} optimal</p></div>
                <Badge variant={tone}><Icon size={12} /> {label}</Badge>
              </div>
            );
          })}
        </div>
      </ChartCard>

      <ChartCard title="Staff Productivity" subtitle="Revenue per shift & labour efficiency">
        <DataTable data={staff} columns={columns} pageSize={10} initialSort={{ key: "prod", dir: "desc" }} searchFields={(r) => `${r.name} ${r.role} ${r.branchName}`} searchPlaceholder="Search staff…" />
      </ChartCard>
    </div>
  );
}
