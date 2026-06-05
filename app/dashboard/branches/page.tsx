"use client";

import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Gauge, ArrowRight } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { useFakeLoading } from "@/lib/hooks";
import { generateBranchData, generateAlerts } from "@/lib/mockData";
import { shortDate } from "@/lib/format";
import ChartCard from "@/components/ui/ChartCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Sparkline from "@/components/ui/Sparkline";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import KPICard from "@/components/ui/KPICard";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { AXIS_TICK, GRID_PROPS, TOOLTIP_STYLE } from "@/components/charts/chartTheme";
import type { Branch } from "@/lib/types";

type Row = {
  id: string; name: string; city: string; revenue: number; margin: number;
  transactions: number; avgBasket: number; staffCostPct: number; alerts: number;
  growth: number; health: number; spark: number[];
};

function metricsFor(branch: Branch, alertsByBranch: Record<string, number>): Row {
  const s = generateBranchData(branch.id, 30);
  const revenue = s.reduce((a, p) => a + p.revenue, 0);
  const gp = s.reduce((a, p) => a + p.grossProfit, 0);
  const txns = s.reduce((a, p) => a + p.transactions, 0);
  const staffCost = s.reduce((a, p) => a + p.staffCost, 0);
  const prev = generateBranchData(branch.id, 60).slice(0, 30).reduce((a, p) => a + p.revenue, 0);
  const margin = revenue ? (gp / revenue) * 100 : 0;
  const staffCostPct = revenue ? (staffCost / revenue) * 100 : 0;
  const growth = prev ? ((revenue - prev) / prev) * 100 : 0;
  const alerts = alertsByBranch[branch.id] ?? 0;
  // Composite health: margin (40%), growth (35%), alert penalty (25%).
  const health = Math.max(
    0,
    Math.min(100, Math.round(margin * 0.4 * 1.4 + (50 + growth * 2) * 0.35 + Math.max(0, 100 - alerts * 18) * 0.25))
  );
  return {
    id: branch.id, name: branch.name, city: branch.city, revenue, margin, transactions: txns,
    avgBasket: txns ? revenue / txns : 0, staffCostPct, alerts, growth, health,
    spark: s.slice(-14).map((p) => p.revenue),
  };
}

function healthTone(h: number) {
  return h >= 75 ? "success" : h >= 55 ? "warning" : "danger";
}

export default function BranchesPage() {
  const { tenant, terms, money, visibleBranches } = useTenant();
  const loading = useFakeLoading([tenant.id, visibleBranches.length]);
  const [drill, setDrill] = useState<Row | null>(null);
  const [cmpA, setCmpA] = useState(visibleBranches[0]?.id ?? "");
  const [cmpB, setCmpB] = useState(visibleBranches[1]?.id ?? "");

  const alertsByBranch = useMemo(() => {
    const map: Record<string, number> = {};
    generateAlerts(tenant.id).forEach((a) => { if (a.status !== "resolved") map[a.branchId] = (map[a.branchId] ?? 0) + 1; });
    return map;
  }, [tenant.id]);

  const rows = useMemo(() => visibleBranches.map((b) => metricsFor(b, alertsByBranch)), [visibleBranches, alertsByBranch]);
  const portfolioHealth = rows.length ? Math.round(rows.reduce((a, r) => a + r.health, 0) / rows.length) : 0;

  const rowA = rows.find((r) => r.id === cmpA);
  const rowB = rows.find((r) => r.id === cmpB);
  const drillSeries = drill ? generateBranchData(drill.id, 30).map((p) => ({ label: shortDate(p.date), revenue: p.revenue })) : [];

  const columns: Column<Row>[] = [
    { key: "name", header: terms.branch, sortValue: (r) => r.name, render: (r) => (<div><span className="block font-semibold text-[#0B1F3A]">{r.name}</span><span className="block text-xs text-[#94A3B8]">{r.city}</span></div>) },
    { key: "revenue", header: "Revenue", align: "right", sortValue: (r) => r.revenue, render: (r) => <span className="font-medium text-[#0B1F3A]">{money(r.revenue, { compact: true })}</span> },
    { key: "margin", header: "Margin", align: "right", sortValue: (r) => r.margin, render: (r) => `${r.margin.toFixed(1)}%` },
    { key: "transactions", header: terms.transactions, align: "right", sortValue: (r) => r.transactions, render: (r) => r.transactions.toLocaleString() },
    { key: "avgBasket", header: terms.basket, align: "right", sortValue: (r) => r.avgBasket, render: (r) => money(r.avgBasket) },
    { key: "staffCostPct", header: "Staff %", align: "right", sortValue: (r) => r.staffCostPct, render: (r) => <span className={r.staffCostPct > 30 ? "text-red-500" : "text-[#475569]"}>{r.staffCostPct.toFixed(1)}%</span> },
    { key: "alerts", header: "Alerts", align: "center", sortValue: (r) => r.alerts, render: (r) => r.alerts > 0 ? <Badge variant={r.alerts > 2 ? "danger" : "warning"}>{r.alerts}</Badge> : <span className="text-[#CBD5E1]">0</span> },
    { key: "health", header: "Health", align: "center", sortValue: (r) => r.health, render: (r) => <Badge variant={healthTone(r.health)}>{r.health}</Badge> },
    { key: "spark", header: "Trend", align: "right", render: (r) => <Sparkline data={r.spark} width={80} height={26} className="ml-auto" /> },
  ];

  if (loading) return <div className="space-y-5"><LoadingSkeleton variant="card" /><LoadingSkeleton variant="table" /></div>;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Portfolio health */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[#94A3B8]"><Gauge size={16} /><span className="text-xs font-semibold uppercase tracking-wide">Portfolio Health</span></div>
          <div className="flex items-end gap-3">
            <span className="font-fraunces text-5xl font-bold leading-none text-[#0B1F3A]">{portfolioHealth}</span>
            <Badge variant={healthTone(portfolioHealth)} className="mb-1">{portfolioHealth >= 75 ? "Strong" : portfolioHealth >= 55 ? "Stable" : "At risk"}</Badge>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${portfolioHealth >= 75 ? "bg-emerald-500" : portfolioHealth >= 55 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${portfolioHealth}%` }} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[#64748B]">Composite of margin, growth momentum and open alerts across {rows.length} {terms.branches.toLowerCase()}.</p>
        </div>

        {/* Side-by-side comparison */}
        <ChartCard title="Compare Two" subtitle="Select two to benchmark side-by-side" className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <select value={cmpA} onChange={(e) => setCmpA(e.target.value)} className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-sm outline-none focus:border-primary">
              {visibleBranches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <span className="text-xs text-[#94A3B8]">vs</span>
            <select value={cmpB} onChange={(e) => setCmpB(e.target.value)} className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-sm outline-none focus:border-primary">
              {visibleBranches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          {rowA && rowB && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { metric: "Revenue", a: rowA.revenue, b: rowB.revenue },
                  { metric: "Margin %", a: +rowA.margin.toFixed(1), b: +rowB.margin.toFixed(1) },
                  { metric: terms.basket, a: Math.round(rowA.avgBasket), b: Math.round(rowB.avgBasket) },
                  { metric: "Health", a: rowA.health, b: rowB.health },
                ]}
                margin={{ left: -8, right: 8 }}
              >
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="metric" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={42} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#F1F5F9" }} formatter={(v, n) => [Number(v).toLocaleString(), n === "a" ? rowA.name : rowB.name]} />
                <Bar dataKey="a" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="b" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title={`${terms.branch} Comparison`} subtitle="Click a row to drill into a single location">
        <DataTable data={rows} columns={columns} pageSize={10} initialSort={{ key: "revenue", dir: "desc" }} searchFields={(r) => `${r.name} ${r.city}`} searchPlaceholder={`Search ${terms.branches.toLowerCase()}…`} onRowClick={setDrill} />
      </ChartCard>

      {/* Drill-down modal */}
      <Modal open={!!drill} onClose={() => setDrill(null)} title={drill?.name ?? ""} subtitle={`${drill?.city} · single ${terms.branch.toLowerCase()} view`} size="lg">
        {drill && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KPICard label="Revenue (30d)" value={money(drill.revenue, { compact: true })} delta={drill.growth} />
              <KPICard label="Margin" value={`${drill.margin.toFixed(1)}%`} />
              <KPICard label={terms.transactions} value={drill.transactions.toLocaleString()} />
              <KPICard label="Health" value={`${drill.health}`} />
            </div>
            <div className="rounded-xl border border-[#E2E8F0] p-4">
              <p className="mb-3 text-sm font-semibold text-[#0B1F3A]">Revenue · last 30 days</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={drillSeries} margin={{ left: -12, right: 8 }}>
                  <defs><linearGradient id="drill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} minTickGap={28} />
                  <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v) => money(v, { compact: true })} width={52} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => money(Number(v))} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} fill="url(#drill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#F8F9FC] px-4 py-3 text-sm">
              <span className="text-[#64748B]">Staff cost ratio</span>
              <span className={`font-semibold ${drill.staffCostPct > 30 ? "text-red-500" : "text-[#0B1F3A]"}`}>{drill.staffCostPct.toFixed(1)}% of revenue</span>
            </div>
            <button onClick={() => setDrill(null)} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-lt">
              Close detail <ArrowRight size={15} />
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
