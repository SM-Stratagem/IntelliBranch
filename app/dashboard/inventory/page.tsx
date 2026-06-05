"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Boxes, Gauge, Skull, Check, X, Sparkles, Tag } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { useFakeLoading } from "@/lib/hooks";
import { generateInventory } from "@/lib/mockData";
import ChartCard from "@/components/ui/ChartCard";
import KPICard from "@/components/ui/KPICard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import StatBar from "@/components/ui/StatBar";
import Badge from "@/components/ui/Badge";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { AXIS_TICK, GRID_PROPS, TOOLTIP_STYLE } from "@/components/charts/chartTheme";
import type { SKU } from "@/lib/types";

const STATUS_BADGE: Record<SKU["status"], { v: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  healthy: { v: "success", label: "Healthy" },
  low: { v: "warning", label: "Low" },
  critical: { v: "danger", label: "Critical" },
  dead: { v: "neutral", label: "Dead stock" },
};

export default function InventoryPage() {
  const { tenant, money } = useTenant();
  const loading = useFakeLoading([tenant.id]);
  const all = useMemo(() => generateInventory(tenant.id), [tenant.id]);
  const [handled, setHandled] = useState<Record<string, "approved" | "dismissed">>({});

  const fast = all.filter((s) => s.dailyVelocity >= 8).length;
  const slow = all.filter((s) => s.dailyVelocity < 8 && s.status !== "dead").length;
  const dead = all.filter((s) => s.status === "dead");
  const stockValue = all.reduce((a, s) => a + s.stock * s.unitCost, 0);
  const reorders = all.filter((s) => s.status === "low" || s.status === "critical");

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    all.forEach((s) => map.set(s.category, (map.get(s.category) ?? 0) + s.stock));
    return [...map.entries()].map(([category, stock]) => ({ category, stock }));
  }, [all]);

  const columns: Column<SKU>[] = [
    { key: "name", header: "SKU", sortValue: (r) => r.name, render: (r) => (<div><span className="block font-medium text-[#0B1F3A]">{r.name}</span><span className="block text-xs text-[#94A3B8]">{r.id} · {r.category}</span></div>) },
    { key: "stock", header: "Stock", align: "right", sortValue: (r) => r.stock, render: (r) => r.stock.toLocaleString() },
    { key: "velocity", header: "Velocity/day", align: "right", sortValue: (r) => r.dailyVelocity, render: (r) => `${r.dailyVelocity}` },
    {
      key: "days", header: "Days of Stock", align: "left", sortValue: (r) => r.daysRemaining,
      render: (r) => (
        <div className="w-32">
          <StatBar value={Math.min(r.daysRemaining, 30)} max={30} display={r.daysRemaining > 90 ? "90+ d" : `${r.daysRemaining} d`} tone={r.daysRemaining <= 2 ? "danger" : r.daysRemaining <= 7 ? "warning" : "success"} />
        </div>
      ),
    },
    { key: "status", header: "Status", align: "center", sortValue: (r) => r.status, render: (r) => <Badge variant={STATUS_BADGE[r.status].v}>{STATUS_BADGE[r.status].label}</Badge> },
  ];

  if (loading) return <div className="space-y-5"><div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><LoadingSkeleton variant="kpi" count={4} /></div><LoadingSkeleton variant="table" /></div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Active SKUs" value={all.length.toString()} icon={Boxes} />
        <KPICard label="Need Reorder" value={reorders.length.toString()} icon={Gauge} sub="low or critical" invertDelta delta={reorders.length > 5 ? 12 : -8} />
        <KPICard label="Dead Stock" value={dead.length.toString()} icon={Skull} sub="markdown candidates" />
        <KPICard label="Stock Value" value={money(stockValue, { compact: true })} icon={Tag} />
      </div>

      {/* Velocity split */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Fast Movers</p><p className="mt-1 font-fraunces text-3xl font-bold text-emerald-600">{fast}</p><p className="text-xs text-[#64748B]">≥ 8 units/day</p></div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Slow Movers</p><p className="mt-1 font-fraunces text-3xl font-bold text-amber-500">{slow}</p><p className="text-xs text-[#64748B]">below threshold</p></div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Dead Stock</p><p className="mt-1 font-fraunces text-3xl font-bold text-slate-400">{dead.length}</p><p className="text-xs text-[#64748B]">no recent velocity</p></div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Reorder recommendations */}
        <ChartCard title="Reorder Recommendations" aiBadge subtitle="Approve or dismiss AI suggestions" className="lg:col-span-2" bodyClassName="space-y-2.5">
          {reorders.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#94A3B8]">No reorders needed right now.</p>
          ) : (
            reorders.slice(0, 6).map((s) => {
              const state = handled[s.id];
              const qty = Math.max(s.reorderPoint * 2 - s.stock, s.reorderPoint);
              return (
                <div key={s.id} className={`flex items-center gap-3 rounded-xl border p-3.5 ${state === "approved" ? "border-emerald-200 bg-emerald-50" : state === "dismissed" ? "border-[#EEF1F6] bg-slate-50 opacity-60" : "border-[#EEF1F6]"}`}>
                  <Sparkles size={16} className="flex-shrink-0 text-violet-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#0B1F3A]">{s.name}</p>
                    <p className="text-xs text-[#64748B]">Order <strong>{qty}</strong> units · {s.daysRemaining}d cover left · est. {money(qty * s.unitCost, { compact: true })}</p>
                  </div>
                  {state ? (
                    <Badge variant={state === "approved" ? "success" : "neutral"}>{state === "approved" ? "Approved" : "Dismissed"}</Badge>
                  ) : (
                    <div className="flex gap-1.5">
                      <button onClick={() => setHandled((h) => ({ ...h, [s.id]: "approved" }))} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-lt" title="Approve"><Check size={15} /></button>
                      <button onClick={() => setHandled((h) => ({ ...h, [s.id]: "dismissed" }))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#94A3B8] hover:border-red-300 hover:text-red-500" title="Dismiss"><X size={15} /></button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </ChartCard>

        {/* Markdown suggestions */}
        <ChartCard title="Markdown Suggestions" aiBadge subtitle="Ageing stock to clear" bodyClassName="space-y-2.5">
          {dead.length === 0 ? <p className="py-6 text-center text-sm text-[#94A3B8]">No ageing stock.</p> : dead.slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-[#EEF1F6] px-3 py-2.5">
              <div className="min-w-0"><p className="truncate text-sm font-medium text-[#0B1F3A]">{s.name}</p><p className="text-xs text-[#94A3B8]">{s.stock} units idle</p></div>
              <Badge variant="warning">−{20 + (s.stock % 25)}%</Badge>
            </div>
          ))}
        </ChartCard>
      </div>

      <ChartCard title="Stock by Category" subtitle="Units on hand">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byCategory} margin={{ left: -10, right: 8 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="category" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={42} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#F1F5F9" }} formatter={(v) => `${Number(v).toLocaleString()} units`} />
            <Bar dataKey="stock" fill="var(--primary)" radius={[5, 5, 0, 0]} barSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="All SKUs" subtitle="Stock levels & days of cover">
        <DataTable data={all} columns={columns} pageSize={8} initialSort={{ key: "days", dir: "asc" }} searchFields={(r) => `${r.name} ${r.id} ${r.category}`} searchPlaceholder="Search SKUs…" />
      </ChartCard>
    </div>
  );
}
