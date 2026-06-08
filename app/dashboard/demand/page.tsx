"use client";

import { useMemo, useState } from "react";
import {
  Area, ComposedChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, ReferenceLine,
} from "recharts";
import { LineChart as LineIcon, Boxes, Gauge, TrendingUp } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { useFakeLoading } from "@/lib/hooks";
import { generateInventory, generateSKUForecast } from "@/lib/mockData";
import { shortDate, TODAY } from "@/lib/format";
import ChartCard from "@/components/ui/ChartCard";
import KPICard from "@/components/ui/KPICard";
import Badge from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { AXIS_TICK, GRID_PROPS, TOOLTIP_STYLE, TOOLTIP_LABEL_STYLE } from "@/components/charts/chartTheme";
import type { SKU } from "@/lib/types";

const HORIZONS = [7, 30, 90] as const;

export default function DemandForecastPage() {
  const { tenant, visibleBranches } = useTenant();
  const skus = useMemo(() => generateInventory(tenant.id), [tenant.id]);

  const [skuId, setSkuId] = useState<string>(skus[0]?.id ?? "");
  const [scope, setScope] = useState<string>("all");
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>(30);
  const loading = useFakeLoading([tenant.id, skuId, scope, horizon]);

  const selected = skus.find((s) => s.id === skuId) ?? skus[0];

  // Forecast for the selected SKU + scope. Re-keyed off the selection so the
  // chart and the KPIs below always describe the same series.
  const forecast = useMemo(
    () => (selected ? generateSKUForecast(selected, scope, horizon) : []),
    [selected, scope, horizon]
  );

  const chartData = useMemo(
    () =>
      forecast.map((p) => ({
        label: shortDate(p.date),
        actual: p.actualUnits,
        predicted: p.predictedUnits,
        lower: p.lowerUnits,
        band: p.upperUnits - p.lowerUnits, // stacked on lower → shaded interval
      })),
    [forecast]
  );

  const future = forecast.filter((p) => p.actualUnits === null);
  const demandHorizon = future.reduce((a, p) => a + p.predictedUnits, 0);
  const demand30 = future.slice(0, 30).reduce((a, p) => a + p.predictedUnits, 0);
  const peak = future.reduce<{ date: string; units: number }>(
    (best, p) => (p.predictedUnits > best.units ? { date: p.date, units: p.predictedUnits } : best),
    { date: future[0]?.date ?? "", units: 0 }
  );
  const todayLabel = shortDate(TODAY.toISOString().slice(0, 10));

  // All-SKU forecast table (tenant-wide demand summary).
  const rows = useMemo(
    () =>
      skus.map((s) => ({
        ...s,
        f7: s.forecastDemand7d,
        f30: s.forecastDemand30d,
      })),
    [skus]
  );

  const columns: Column<SKU & { f7: number; f30: number }>[] = [
    {
      key: "name", header: "SKU", sortValue: (r) => r.name,
      render: (r) => (
        <button onClick={() => setSkuId(r.id)} className="text-left">
          <span className="block font-medium text-[#0B1F3A] hover:text-primary">{r.name}</span>
          <span className="block text-xs text-[#94A3B8]">{r.id} · {r.category}</span>
        </button>
      ),
    },
    { key: "f7", header: "7d Demand", align: "right", sortValue: (r) => r.f7, render: (r) => `${r.f7} u` },
    { key: "f30", header: "30d Demand", align: "right", sortValue: (r) => r.f30, render: (r) => `${r.f30} u` },
    {
      key: "conf", header: "Confidence", align: "right", sortValue: (r) => r.forecastConfidence,
      render: (r) => <Badge variant={r.forecastConfidence >= 0.8 ? "success" : r.forecastConfidence >= 0.65 ? "warning" : "neutral"}>{Math.round(r.forecastConfidence * 100)}%</Badge>,
    },
    { key: "stockout", header: "Est. Stockout", align: "right", sortValue: (r) => r.expectedStockoutDate, render: (r) => <span className="text-[#64748B]">{shortDate(r.expectedStockoutDate)}</span> },
  ];

  if (loading) return <div className="space-y-5"><div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><LoadingSkeleton variant="kpi" count={4} /></div><LoadingSkeleton variant="chart" /></div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label={`${horizon}-Day Demand`} value={`${demandHorizon.toLocaleString()} u`} icon={LineIcon} sub={selected?.name} />
        <KPICard label="Avg Daily Demand" value={`${Math.round(demand30 / 30).toLocaleString()} u`} icon={Boxes} sub="next 30 days" />
        <KPICard label="Forecast Confidence" value={`${Math.round((selected?.forecastConfidence ?? 0) * 100)}%`} icon={Gauge} sub="model interval" />
        <KPICard label="Peak Day" value={peak.date ? shortDate(peak.date) : "—"} icon={TrendingUp} sub={`${peak.units} u expected`} />
      </div>

      <ChartCard
        title="SKU Demand Forecast"
        aiBadge
        subtitle={selected ? `${selected.name} · ${horizon}-day projection with confidence band` : "Select a SKU"}
        actions={
          <div className="flex flex-wrap gap-2">
            <select value={skuId} onChange={(e) => setSkuId(e.target.value)} className="max-w-[180px] rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-xs font-medium outline-none focus:border-primary">
              {skus.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={scope} onChange={(e) => setScope(e.target.value)} className="rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-xs font-medium outline-none focus:border-primary">
              <option value="all">All branches</option>
              {visibleBranches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <div className="flex rounded-lg border border-[#E2E8F0] p-0.5">
              {HORIZONS.map((h) => (
                <button key={h} onClick={() => setHorizon(h)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${horizon === h ? "bg-primary text-white" : "text-[#64748B] hover:text-[#0B1F3A]"}`}>
                  {h}d
                </button>
              ))}
            </div>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData} margin={{ left: -16, right: 8, top: 8 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} minTickGap={32} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={42} tickFormatter={(v) => `${v}`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v, n) => n === "band" ? null : [`${Number(v)} units`, n === "actual" ? "Actual" : "Predicted"]} />
            <Legend iconType="circle" iconSize={9} formatter={(val) => <span className="text-xs capitalize text-[#475569]">{val === "band" ? "confidence" : val}</span>} />
            <Area dataKey="lower" stackId="band" stroke="none" fill="transparent" legendType="none" />
            <Area dataKey="band" stackId="band" stroke="none" fill="var(--primary)" fillOpacity={0.12} />
            <ReferenceLine x={todayLabel} stroke="#94A3B8" strokeDasharray="3 3" label={{ value: "Today", fontSize: 10, fill: "#94A3B8", position: "insideTopRight" }} />
            <Line type="monotone" dataKey="actual" stroke="var(--accent)" strokeWidth={2.5} dot={false} connectNulls />
            <Line type="monotone" dataKey="predicted" stroke="var(--primary)" strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="All SKUs — Demand Outlook" subtitle="Projected units & expected stockout · click a SKU to chart it" aiBadge>
        <DataTable data={rows} columns={columns} pageSize={8} initialSort={{ key: "f30", dir: "desc" }} searchFields={(r) => `${r.name} ${r.id} ${r.category}`} searchPlaceholder="Search SKUs…" />
      </ChartCard>
    </div>
  );
}
