"use client";

import { useMemo } from "react";
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { DollarSign, Percent, Wallet, PiggyBank, FileText, FileDown } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { useScope, useFakeLoading } from "@/lib/hooks";
import { generatePortfolioSeries, generateBranchData } from "@/lib/mockData";
import { bucketSeries, downloadCSV } from "@/lib/aggregate";
import { shortDate } from "@/lib/format";
import KPICard from "@/components/ui/KPICard";
import ChartCard from "@/components/ui/ChartCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { AXIS_TICK, GRID_PROPS, TOOLTIP_STYLE, TOOLTIP_LABEL_STYLE, CHART_COLORS } from "@/components/charts/chartTheme";

type PnlBranch = { id: string; name: string; revenue: number; cogs: number; gross: number; expenses: number; net: number; margin: number };

export default function PnlPage() {
  const { tenant, terms, money, visibleBranches } = useTenant();
  const { branchIds, days } = useScope();
  const loading = useFakeLoading([tenant.id, branchIds.join(","), days]);

  const series = useMemo(() => generatePortfolioSeries(tenant.id, days, branchIds), [tenant.id, days, branchIds]);
  const sum = (k: "revenue" | "cogs" | "grossProfit" | "expenses" | "netProfit" | "staffCost") => series.reduce((a, p) => a + p[k], 0);
  const revenue = sum("revenue");
  const cogs = sum("cogs");
  const gross = sum("grossProfit");
  const staff = sum("staffCost");
  const expenses = sum("expenses");
  const other = expenses - staff;
  const net = sum("netProfit");
  const pct = (v: number) => (revenue ? ((v / revenue) * 100).toFixed(1) + "%" : "—");

  // P&L statement line items.
  const statement = [
    { item: "Revenue", amount: revenue, indent: false, bold: true, tone: "ink" as const },
    { item: "Cost of Goods Sold", amount: -cogs, indent: true, tone: "muted" as const },
    { item: "Gross Profit", amount: gross, bold: true, tone: "ink" as const },
    { item: "Staff Costs", amount: -staff, indent: true, tone: "muted" as const },
    { item: "Other Operating Expenses", amount: -other, indent: true, tone: "muted" as const },
    { item: "Net Profit", amount: net, bold: true, tone: net >= 0 ? ("good" as const) : ("bad" as const) },
  ];

  const marginTrend = useMemo(
    () => bucketSeries(series, days > 45 ? "weekly" : "daily").map((b) => ({ label: b.label, margin: +((b.grossProfit / (b.revenue || 1)) * 100).toFixed(1), net: +((b.netProfit / (b.revenue || 1)) * 100).toFixed(1) })),
    [series, days]
  );

  const costArea = useMemo(
    () => series.map((p) => ({ label: shortDate(p.date), COGS: p.cogs, Staff: p.staffCost, Other: p.expenses - p.staffCost })),
    [series]
  );

  const branchRows: PnlBranch[] = useMemo(
    () =>
      visibleBranches.map((b) => {
        const s = generateBranchData(b.id, days);
        const r = s.reduce((a, p) => a + p.revenue, 0);
        const c = s.reduce((a, p) => a + p.cogs, 0);
        const g = s.reduce((a, p) => a + p.grossProfit, 0);
        const e = s.reduce((a, p) => a + p.expenses, 0);
        const n = s.reduce((a, p) => a + p.netProfit, 0);
        return { id: b.id, name: b.name, revenue: r, cogs: c, gross: g, expenses: e, net: n, margin: r ? (g / r) * 100 : 0 };
      }),
    [visibleBranches, days]
  );

  const branchCols: Column<PnlBranch>[] = [
    { key: "name", header: terms.branch, sortValue: (r) => r.name, render: (r) => <span className="font-semibold text-[#0B1F3A]">{r.name}</span> },
    { key: "revenue", header: "Revenue", align: "right", sortValue: (r) => r.revenue, render: (r) => money(r.revenue, { compact: true }) },
    { key: "cogs", header: "COGS", align: "right", sortValue: (r) => r.cogs, render: (r) => <span className="text-[#94A3B8]">{money(r.cogs, { compact: true })}</span> },
    { key: "gross", header: "Gross", align: "right", sortValue: (r) => r.gross, render: (r) => money(r.gross, { compact: true }) },
    { key: "net", header: "Net", align: "right", sortValue: (r) => r.net, render: (r) => <span className={`font-semibold ${r.net >= 0 ? "text-emerald-600" : "text-red-500"}`}>{money(r.net, { compact: true })}</span> },
    { key: "margin", header: "Margin", align: "right", sortValue: (r) => r.margin, render: (r) => `${r.margin.toFixed(1)}%` },
  ];

  if (loading) return <div className="space-y-5"><div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><LoadingSkeleton variant="kpi" count={4} /></div><div className="grid gap-5 lg:grid-cols-2"><LoadingSkeleton variant="chart" count={2} /></div></div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Revenue" value={money(revenue, { compact: true })} icon={DollarSign} delta={8.4} />
        <KPICard label="Gross Profit" value={money(gross, { compact: true })} icon={Wallet} delta={6.1} />
        <KPICard label="Net Profit" value={money(net, { compact: true })} icon={PiggyBank} delta={net >= 0 ? 4.2 : -4.2} />
        <KPICard label="Net Margin" value={`${revenue ? ((net / revenue) * 100).toFixed(1) : 0}%`} icon={Percent} delta={1.3} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* P&L statement */}
        <ChartCard
          title="P&L Statement"
          subtitle={`Consolidated · last ${days} days`}
          actions={
            <div className="flex gap-1.5">
              <button onClick={() => downloadCSV("pnl.csv", statement.map((s) => ({ item: s.item, amount: s.amount, pct_of_revenue: pct(Math.abs(s.amount)) })))} className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-2 py-1.5 text-xs font-medium text-[#64748B] hover:border-primary hover:text-primary">
                <FileText size={13} /> CSV
              </button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-2 py-1.5 text-xs font-medium text-[#64748B] hover:border-primary hover:text-primary">
                <FileDown size={13} /> PDF
              </button>
            </div>
          }
        >
          <table className="w-full text-sm">
            <tbody>
              {statement.map((row) => (
                <tr key={row.item} className={`border-b border-[#F1F5F9] ${row.bold ? "bg-[#F8F9FC]" : ""}`}>
                  <td className={`py-2.5 ${row.indent ? "pl-6" : "pl-3"} ${row.bold ? "font-semibold text-[#0B1F3A]" : "text-[#64748B]"}`}>{row.item}</td>
                  <td className={`py-2.5 pr-3 text-right font-medium ${row.tone === "good" ? "text-emerald-600" : row.tone === "bad" ? "text-red-500" : row.bold ? "text-[#0B1F3A]" : "text-[#475569]"}`}>
                    {row.amount < 0 ? `(${money(Math.abs(row.amount), { compact: false })})` : money(row.amount, { compact: false })}
                  </td>
                  <td className="w-16 py-2.5 pr-3 text-right text-xs text-[#94A3B8]">{pct(Math.abs(row.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>

        {/* Margin trend */}
        <ChartCard title="Margin % Trend" subtitle="Gross & net margin over time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={marginTrend} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={42} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v, n) => [`${v}%`, n]} />
              <Legend iconType="circle" iconSize={9} formatter={(val) => <span className="text-xs text-[#475569] capitalize">{val} margin</span>} />
              <Line type="monotone" dataKey="margin" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="net" stroke="var(--accent)" strokeWidth={2} strokeDasharray="4 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Cost Breakdown" subtitle="COGS, staff & other expenses over time">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={costArea} margin={{ left: -12, right: 8, top: 8 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} minTickGap={28} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v) => money(v, { compact: true })} width={58} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v) => money(Number(v))} />
            <Legend iconType="circle" iconSize={9} formatter={(val) => <span className="text-xs text-[#475569]">{val}</span>} />
            {["COGS", "Staff", "Other"].map((k, i) => (
              <Area key={k} type="monotone" dataKey={k} stackId="c" stroke={CHART_COLORS[i]} fill={CHART_COLORS[i]} fillOpacity={0.7} strokeWidth={1.5} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={`${terms.branch}-level P&L`} subtitle="Compare unit economics across the estate">
        <DataTable data={branchRows} columns={branchCols} pageSize={8} initialSort={{ key: "net", dir: "desc" }} searchFields={(r) => r.name} searchPlaceholder={`Search ${terms.branches.toLowerCase()}…`} />
      </ChartCard>
    </div>
  );
}
