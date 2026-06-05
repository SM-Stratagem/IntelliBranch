"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { DollarSign, Percent, Receipt, Trophy, ArrowUpRight, TrendingDown, CalendarCheck } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { useScope, useFakeLoading } from "@/lib/hooks";
import { generateKPIs, generateBranchData, generateAlerts, generatePortfolioSeries } from "@/lib/mockData";
import { bucketSeries, type Granularity } from "@/lib/aggregate";
import { shortDate } from "@/lib/format";
import KPICard from "@/components/ui/KPICard";
import ChartCard from "@/components/ui/ChartCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Sparkline from "@/components/ui/Sparkline";
import Badge from "@/components/ui/Badge";
import AlertCard from "@/components/dashboard/AlertCard";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { AXIS_TICK, GRID_PROPS, TOOLTIP_STYLE, TOOLTIP_LABEL_STYLE } from "@/components/charts/chartTheme";

type BranchRow = {
  id: string;
  name: string;
  city: string;
  revenue: number;
  margin: number;
  growth: number;
  spark: number[];
};

export default function OverviewPage() {
  const { tenant, terms, money, visibleBranches } = useTenant();
  const { branchIds, days } = useScope();
  const loading = useFakeLoading([tenant.id, branchIds.join(","), days]);
  const [gran, setGran] = useState<Granularity>("daily");

  const kpis = useMemo(() => generateKPIs(tenant.id, branchIds), [tenant.id, branchIds]);
  const series = useMemo(() => generatePortfolioSeries(tenant.id, days, branchIds), [tenant.id, days, branchIds]);
  const trend = useMemo(() => bucketSeries(series, gran), [series, gran]);
  const sparkData = series.slice(-14).map((p) => p.revenue);

  const topAlerts = useMemo(
    () => generateAlerts(tenant.id, branchIds).filter((a) => a.status === "unread").slice(0, 3),
    [tenant.id, branchIds]
  );

  const branchRows: BranchRow[] = useMemo(
    () =>
      visibleBranches.map((b) => {
        const s = generateBranchData(b.id, 30);
        const revenue = s.reduce((a, p) => a + p.revenue, 0);
        const gp = s.reduce((a, p) => a + p.grossProfit, 0);
        const prev = generateBranchData(b.id, 60).slice(0, 30).reduce((a, p) => a + p.revenue, 0);
        return {
          id: b.id,
          name: b.name,
          city: b.city,
          revenue,
          margin: revenue ? (gp / revenue) * 100 : 0,
          growth: prev ? ((revenue - prev) / prev) * 100 : 0,
          spark: s.slice(-14).map((p) => p.revenue),
        };
      }),
    [visibleBranches]
  );

  const columns: Column<BranchRow>[] = [
    {
      key: "name",
      header: terms.branch,
      sortValue: (r) => r.name,
      render: (r) => (
        <Link href="/dashboard/branches" className="group">
          <span className="block font-semibold text-[#0B1F3A] group-hover:text-primary">{r.name}</span>
          <span className="block text-xs text-[#94A3B8]">{r.city}</span>
        </Link>
      ),
    },
    { key: "revenue", header: "Revenue", align: "right", sortValue: (r) => r.revenue, render: (r) => <span className="font-semibold text-[#0B1F3A]">{money(r.revenue, { compact: true })}</span> },
    { key: "margin", header: "Margin", align: "right", sortValue: (r) => r.margin, render: (r) => <span className="text-[#475569]">{r.margin.toFixed(1)}%</span> },
    {
      key: "growth",
      header: "Growth",
      align: "right",
      sortValue: (r) => r.growth,
      render: (r) => (
        <span className={`inline-flex items-center gap-0.5 font-semibold ${r.growth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {r.growth >= 0 ? "+" : ""}
          {r.growth.toFixed(1)}%
        </span>
      ),
    },
    { key: "spark", header: "Trend", align: "right", render: (r) => <Sparkline data={r.spark} width={84} height={26} className="ml-auto" /> },
  ];

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <LoadingSkeleton variant="kpi" count={4} />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2"><LoadingSkeleton variant="chart" /></div>
          <LoadingSkeleton variant="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {tenant.welcomeMessage && (
        <p className="text-sm text-[#64748B]">
          <span className="font-fraunces text-base font-semibold text-[#0B1F3A]">{tenant.welcomeMessage}</span>
        </p>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Revenue (30d)" value={money(kpis.revenue, { compact: true })} delta={kpis.revenueDelta} icon={DollarSign} spark={sparkData} />
        <KPICard label="Gross Margin" value={`${kpis.margin.toFixed(1)}%`} delta={kpis.marginDelta} icon={Percent} />
        <KPICard label={terms.avgTransaction} value={money(kpis.avgTransaction, { decimals: 0 })} delta={kpis.avgTransactionDelta} icon={Receipt} />
        <KPICard label={`Top ${terms.branch}`} value={kpis.topBranch.name.split(" ")[0]} sub={money(kpis.topBranch.revenue, { compact: true })} icon={Trophy} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Revenue trend + branch ranking */}
        <div className="space-y-5 lg:col-span-2">
          <ChartCard
            title="Revenue Trend"
            subtitle={`${terms.branches} ${tenant.currency} · last ${days} days`}
            actions={
              <div className="flex rounded-lg border border-[#E2E8F0] p-0.5">
                {(["daily", "weekly", "monthly"] as Granularity[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGran(g)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                      gran === g ? "bg-primary text-white" : "text-[#64748B] hover:text-[#0B1F3A]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trend} margin={{ left: -12, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="ov-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v) => money(v, { compact: true })} width={60} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v) => money(Number(v))} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} fill="url(#ov-rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={`${terms.branch} Ranking`} subtitle="Sortable by revenue, margin or growth">
            <DataTable data={branchRows} columns={columns} pageSize={6} initialSort={{ key: "revenue", dir: "desc" }} />
          </ChartCard>
        </div>

        {/* Alerts + quick stats */}
        <div className="space-y-5">
          <ChartCard title="Active Alerts" subtitle="Top unread, by severity" bodyClassName="space-y-2.5">
            {topAlerts.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#94A3B8]">No unread alerts 🎉</p>
            ) : (
              topAlerts.map((a) => <AlertCard key={a.id} alert={a} compact />)
            )}
            <Link href="/dashboard/alerts" className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline">
              View all alerts <ArrowUpRight size={13} />
            </Link>
          </ChartCard>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <h3 className="mb-4 font-fraunces text-base font-semibold text-[#0B1F3A]">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-[#F8F9FC] p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"><CalendarCheck size={17} /></span>
                <div>
                  <p className="text-xs text-[#94A3B8]">Best day this period</p>
                  <p className="text-sm font-semibold text-[#0B1F3A]">{shortDate(kpis.bestDay.date)} · {money(kpis.bestDay.revenue, { compact: true })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-[#F8F9FC] p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-500"><TrendingDown size={17} /></span>
                <div>
                  <p className="text-xs text-[#94A3B8]">Worst performing {terms.branch.toLowerCase()}</p>
                  <p className="text-sm font-semibold text-[#0B1F3A]">{kpis.worstBranch.name}</p>
                </div>
                <Badge variant={kpis.worstBranch.delta < 0 ? "danger" : "neutral"} className="ml-auto">
                  {kpis.worstBranch.delta >= 0 ? "+" : ""}{kpis.worstBranch.delta.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-[#F8F9FC] p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><Trophy size={17} /></span>
                <div>
                  <p className="text-xs text-[#94A3B8]">Portfolio {terms.transactions.toLowerCase()} (30d)</p>
                  <p className="text-sm font-semibold text-[#0B1F3A]">{kpis.transactions.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
