"use client";

import { useMemo } from "react";
import {
  Area, AreaChart, Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { DollarSign, CalendarDays, TrendingUp, Receipt } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { useScope, useFakeLoading } from "@/lib/hooks";
import {
  generatePortfolioSeries, generateBranchData, generateCategoryBreakdown, generatePaymentMix,
} from "@/lib/mockData";
import { downloadCSV } from "@/lib/aggregate";
import { shortDate } from "@/lib/format";
import KPICard from "@/components/ui/KPICard";
import ChartCard from "@/components/ui/ChartCard";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { AXIS_TICK, GRID_PROPS, TOOLTIP_STYLE, TOOLTIP_LABEL_STYLE, CHART_COLORS } from "@/components/charts/chartTheme";

export default function RevenuePage() {
  const { tenant, terms, money, visibleBranches } = useTenant();
  const { branchIds, days } = useScope();
  const loading = useFakeLoading([tenant.id, branchIds.join(","), days]);

  const series = useMemo(() => generatePortfolioSeries(tenant.id, days, branchIds), [tenant.id, days, branchIds]);
  const categories = useMemo(() => generateCategoryBreakdown(tenant.id, branchIds), [tenant.id, branchIds]);
  const payments = useMemo(() => generatePaymentMix(tenant.id, branchIds), [tenant.id, branchIds]);

  const total = series.reduce((a, p) => a + p.revenue, 0);
  const avgDaily = series.length ? total / series.length : 0;
  const best = series.reduce((a, p) => (p.revenue > a.revenue ? p : a), series[0] ?? { revenue: 0, date: "" });
  const txns = series.reduce((a, p) => a + p.transactions, 0);

  // Revenue by branch over the window.
  const byBranch = useMemo(
    () =>
      visibleBranches
        .map((b) => ({
          name: b.name.length > 14 ? b.name.slice(0, 13) + "…" : b.name,
          revenue: generateBranchData(b.id, days).reduce((a, p) => a + p.revenue, 0),
        }))
        .sort((a, b) => b.revenue - a.revenue),
    [visibleBranches, days]
  );

  // Category revenue stacked across the last 4 weeks (proportional split).
  const stacked = useMemo(() => {
    const weeks = 4;
    const weekTotals = Array.from({ length: weeks }, (_, w) =>
      series.slice(Math.max(0, series.length - (weeks - w) * 7), series.length - (weeks - w - 1) * 7).reduce((a, p) => a + p.revenue, 0)
    );
    const catSum = categories.reduce((a, c) => a + c.revenue, 0) || 1;
    return weekTotals.map((wt, i) => {
      const row: Record<string, number | string> = { week: `Week ${i + 1}` };
      categories.forEach((c) => (row[c.name] = Math.round((wt * c.revenue) / catSum)));
      return row;
    });
  }, [series, categories]);

  // Period comparison.
  const thisWeek = series.slice(-7).reduce((a, p) => a + p.revenue, 0);
  const lastWeek = series.slice(-14, -7).reduce((a, p) => a + p.revenue, 0);
  const lastYear = Math.round(thisWeek / 1.12);
  const comparison = [
    { label: "This Week", value: thisWeek },
    { label: "Last Week", value: lastWeek },
    { label: "Same Wk LY", value: lastYear },
  ];

  if (loading) return <div className="space-y-5"><div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><LoadingSkeleton variant="kpi" count={4} /></div><LoadingSkeleton variant="chart" /><div className="grid gap-5 lg:grid-cols-2"><LoadingSkeleton variant="chart" count={2} /></div></div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Total Revenue" value={money(total, { compact: true })} icon={DollarSign} delta={8.4} spark={series.slice(-14).map((p) => p.revenue)} />
        <KPICard label="Avg Daily" value={money(avgDaily, { compact: true })} icon={CalendarDays} delta={3.1} />
        <KPICard label="Best Day" value={money(best.revenue, { compact: true })} icon={TrendingUp} sub={best.date ? shortDate(best.date) : ""} />
        <KPICard label={terms.transactions} value={txns.toLocaleString()} icon={Receipt} delta={5.6} />
      </div>

      <ChartCard
        title="Revenue Over Time"
        subtitle={`Daily revenue · last ${days} days`}
        onExport={() => downloadCSV("revenue.csv", series.map((p) => ({ date: p.date, revenue: p.revenue, transactions: p.transactions })))}
      >
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={series.map((p) => ({ ...p, label: shortDate(p.date) }))} margin={{ left: -12, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} minTickGap={28} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v) => money(v, { compact: true })} width={58} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v) => money(Number(v))} />
            <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} fill="url(#rev-grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title={`Revenue by ${terms.branch}`} subtitle="Ranked across the period">
          <ResponsiveContainer width="100%" height={Math.max(220, byBranch.length * 38)}>
            <BarChart data={byBranch} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid {...GRID_PROPS} horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v) => money(v, { compact: true })} />
              <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={100} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#F1F5F9" }} formatter={(v) => money(Number(v))} />
              <Bar dataKey="revenue" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payment Method Mix" subtitle="Share of revenue by tender">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={payments} dataKey="amount" nameKey="method" innerRadius={52} outerRadius={84} paddingAngle={2} stroke="none">
                  {payments.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => money(Number(v))} />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" iconSize={9} formatter={(val) => <span className="text-xs text-[#475569]">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard title="Revenue by Category" subtitle="Stacked, last 4 weeks" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stacked} margin={{ left: -12, right: 8 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="week" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v) => money(v, { compact: true })} width={58} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v) => money(Number(v))} />
              <Legend iconType="circle" iconSize={9} formatter={(val) => <span className="text-xs text-[#475569]">{val}</span>} />
              {categories.map((c, i) => (
                <Bar key={c.name} dataKey={c.name} stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]} radius={i === categories.length - 1 ? [5, 5, 0, 0] : undefined} barSize={44} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Period Comparison" subtitle="Week-on-week & YoY">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={comparison} margin={{ left: -12, right: 8 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v) => money(v, { compact: true })} width={58} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#F1F5F9" }} formatter={(v) => money(Number(v))} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                {comparison.map((_, i) => <Cell key={i} fill={i === 0 ? "var(--primary)" : "#CBD5E1"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-[#94A3B8]">
            This week {thisWeek >= lastWeek ? "up" : "down"} {Math.abs(((thisWeek - lastWeek) / (lastWeek || 1)) * 100).toFixed(1)}% WoW · +12% YoY
          </p>
        </ChartCard>
      </div>
    </div>
  );
}
