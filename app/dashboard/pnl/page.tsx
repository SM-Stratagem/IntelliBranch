"use client";

import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { DollarSign, Percent, Wallet, PiggyBank, FileText, FileDown, Layers } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { useScope, useFakeLoading } from "@/lib/hooks";
import { generatePortfolioSeries, generateBranchData, generateInventory, generateSKUMaterialCostPeriods, generateCOGSBreakdown } from "@/lib/mockData";
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

  // ---- SKU-level material cost breakdown (varies per SKU per week/month) ----
  const costSkus = useMemo(() => generateInventory(tenant.id), [tenant.id]);
  const [costSku, setCostSku] = useState<string>(costSkus[0]?.id ?? "");
  const [costPeriod, setCostPeriod] = useState<"week" | "month">("month");
  const selectedCostSku = costSkus.find((s) => s.id === costSku) ?? costSkus[0];

  const cogs30 = useMemo(() => generateCOGSBreakdown(tenant.id), [tenant.id]);

  const COST_KEYS: [string, "rawMaterialCost" | "freightCost" | "dutyCost" | "packagingCost" | "supplierSurcharge" | "wastageCost"][] = [
    ["Raw material", "rawMaterialCost"], ["Freight", "freightCost"], ["Duty", "dutyCost"],
    ["Packaging", "packagingCost"], ["Surcharge", "supplierSurcharge"], ["Wastage", "wastageCost"],
  ];

  const costSeries = useMemo(() => {
    if (!selectedCostSku) return [];
    const periods = generateSKUMaterialCostPeriods(selectedCostSku, costPeriod, costPeriod === "month" ? 6 : 8);
    return periods.map((p) => ({
      label: p.period,
      "Raw material": p.rawMaterialCost, Freight: p.freightCost, Duty: p.dutyCost,
      Packaging: p.packagingCost, Surcharge: p.supplierSurcharge, Wastage: p.wastageCost,
      landed: p.landedUnitCost,
    }));
  }, [selectedCostSku, costPeriod]);

  type CostRow = { id: string; name: string; supplier: string; landed: number; raw: number; freight: number; other: number; trend: number };
  const costRows: CostRow[] = useMemo(
    () => costSkus.map((s) => {
      const latest = generateSKUMaterialCostPeriods(s, costPeriod, 1)[0];
      return {
        id: s.id, name: s.name, supplier: s.supplierName,
        landed: latest.landedUnitCost, raw: latest.rawMaterialCost, freight: latest.freightCost,
        other: +(latest.dutyCost + latest.packagingCost + latest.supplierSurcharge + latest.wastageCost).toFixed(2),
        trend: s.unitCostTrendPct,
      };
    }),
    [costSkus, costPeriod]
  );

  const costCols: Column<CostRow>[] = [
    { key: "name", header: "SKU", sortValue: (r) => r.name, render: (r) => (<button onClick={() => setCostSku(r.id)} className="text-left font-medium text-[#0B1F3A] hover:text-primary">{r.name}</button>) },
    { key: "supplier", header: "Supplier", sortValue: (r) => r.supplier, render: (r) => <span className="text-[#64748B]">{r.supplier}</span> },
    { key: "raw", header: "Raw", align: "right", sortValue: (r) => r.raw, render: (r) => money(r.raw, { decimals: 2 }) },
    { key: "freight", header: "Freight", align: "right", sortValue: (r) => r.freight, render: (r) => money(r.freight, { decimals: 2 }) },
    { key: "other", header: "Duty+Other", align: "right", sortValue: (r) => r.other, render: (r) => money(r.other, { decimals: 2 }) },
    { key: "landed", header: "Landed Unit Cost", align: "right", sortValue: (r) => r.landed, render: (r) => <strong className="text-[#0B1F3A]">{money(r.landed, { decimals: 2 })}</strong> },
    { key: "trend", header: "Cost Trend", align: "right", sortValue: (r) => r.trend, render: (r) => <span className={r.trend > 0 ? "font-semibold text-red-500" : "font-semibold text-emerald-600"}>{r.trend > 0 ? "+" : ""}{r.trend}%</span> },
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

      {/* SKU-level material cost breakdown — varies per SKU, per week or month */}
      <ChartCard
        title="SKU Material Cost Breakdown"
        aiBadge
        subtitle={selectedCostSku ? `${selectedCostSku.name} · landed unit cost by component` : "Select a SKU"}
        actions={
          <div className="flex flex-wrap gap-2">
            <select value={costSku} onChange={(e) => setCostSku(e.target.value)} className="max-w-[180px] rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-xs font-medium outline-none focus:border-primary">
              {costSkus.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="flex rounded-lg border border-[#E2E8F0] p-0.5">
              {(["week", "month"] as const).map((p) => (
                <button key={p} onClick={() => setCostPeriod(p)} className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${costPeriod === p ? "bg-primary text-white" : "text-[#64748B] hover:text-[#0B1F3A]"}`}>
                  {p === "week" ? "Weekly" : "Monthly"}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5 text-[#64748B]"><Layers size={13} className="text-primary" /> 30-day COGS <strong className="text-[#0B1F3A]">{money(cogs30.totalCogs, { compact: true })}</strong></span>
          <span className="text-[#64748B]">Material <strong className="text-[#0B1F3A]">{money(cogs30.materialCost, { compact: true })}</strong></span>
          <span className="text-[#64748B]">Freight <strong className="text-[#0B1F3A]">{money(cogs30.freightCost, { compact: true })}</strong></span>
          <span className="text-[#64748B]">Wastage <strong className="text-[#0B1F3A]">{money(cogs30.wastageCost, { compact: true })}</strong></span>
          <span className="text-[#64748B]">Gross margin <strong className="text-emerald-600">{cogs30.grossMarginPct}%</strong></span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={costSeries} margin={{ left: -12, right: 8, top: 8 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v) => money(v, { compact: true })} width={52} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v, n) => [money(Number(v), { decimals: 2 }), n]} />
            <Legend iconType="circle" iconSize={9} formatter={(val) => <span className="text-xs text-[#475569]">{val}</span>} />
            {COST_KEYS.map(([label], i) => (
              <Bar key={label} dataKey={label} stackId="cost" fill={CHART_COLORS[i]} radius={i === COST_KEYS.length - 1 ? [4, 4, 0, 0] : undefined} barSize={48} />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-5">
          <DataTable data={costRows} columns={costCols} pageSize={6} initialSort={{ key: "landed", dir: "desc" }} searchFields={(r) => `${r.name} ${r.supplier}`} searchPlaceholder="Search SKUs…" />
        </div>
      </ChartCard>

      <ChartCard title={`${terms.branch}-level P&L`} subtitle="Compare unit economics across the estate">
        <DataTable data={branchRows} columns={branchCols} pageSize={8} initialSort={{ key: "net", dir: "desc" }} searchFields={(r) => r.name} searchPlaceholder={`Search ${terms.branches.toLowerCase()}…`} />
      </ChartCard>
    </div>
  );
}
