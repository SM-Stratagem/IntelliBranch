"use client";

import { useMemo, useState } from "react";
import {
  Area, ComposedChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, ReferenceLine,
} from "recharts";
import { Sparkles, Target, CalendarHeart, TrendingUp } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { useFakeLoading } from "@/lib/hooks";
import { generateForecast } from "@/lib/mockData";
import { shortDate, TODAY } from "@/lib/format";
import ChartCard from "@/components/ui/ChartCard";
import KPICard from "@/components/ui/KPICard";
import Badge from "@/components/ui/Badge";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { AXIS_TICK, GRID_PROPS, TOOLTIP_STYLE, TOOLTIP_LABEL_STYLE } from "@/components/charts/chartTheme";

const HORIZONS = [30, 60, 90] as const;

// Seasonality events (industry/region agnostic demo set with expected uplift).
const EVENTS = [
  { name: "Ramadan", window: "Late Feb – Mar", impact: 18, tone: "primary" as const },
  { name: "Eid al-Fitr", window: "End of Ramadan", impact: 32, tone: "primary" as const },
  { name: "Summer lull", window: "Jul – Aug", impact: -12, tone: "danger" as const },
  { name: "Back to School", window: "September", impact: 9, tone: "info" as const },
  { name: "Year-end peak", window: "Nov – Dec", impact: 24, tone: "primary" as const },
];

export default function ForecastPage() {
  const { tenant, terms, money, visibleBranches } = useTenant();
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>(30);
  const [scope, setScope] = useState<string>("all");
  const loading = useFakeLoading([tenant.id, horizon, scope]);

  // Build forecast: sum per-branch forecasts for portfolio, else single branch.
  const data = useMemo(() => {
    const ids = scope === "all" ? visibleBranches.map((b) => b.id) : [scope];
    const perBranch = ids.map((id) => generateForecast(id, horizon));
    if (perBranch.length === 0) return [];
    const len = perBranch[0].length;
    const out = [];
    for (let i = 0; i < len; i++) {
      const base = perBranch[0][i];
      let actual = 0, predicted = 0, lower = 0, upper = 0;
      let hasActual = base.actual !== null;
      for (const f of perBranch) {
        predicted += f[i].predicted;
        lower += f[i].lower;
        upper += f[i].upper;
        if (f[i].actual !== null) actual += f[i].actual!;
      }
      out.push({
        label: shortDate(base.date),
        actual: hasActual ? actual : null,
        predicted,
        lower,
        band: upper - lower, // stacked on top of lower → shaded confidence band
      });
    }
    return out;
  }, [scope, horizon, visibleBranches]);

  const forecastTotal = data.filter((d) => d.actual === null).reduce((a, d) => a + d.predicted, 0);
  const todayLabel = shortDate(TODAY.toISOString().slice(0, 10));
  const accuracy = 88 + ((horizon / 30) % 3); // deterministic demo accuracy

  if (loading) return <div className="space-y-5"><div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><LoadingSkeleton variant="kpi" count={4} /></div><LoadingSkeleton variant="chart" /></div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label={`${horizon}-Day Forecast`} value={money(forecastTotal, { compact: true })} icon={Sparkles} sub="projected revenue" />
        <KPICard label="Forecast Accuracy" value={`${accuracy.toFixed(1)}%`} icon={Target} delta={1.8} sub="vs last period" />
        <KPICard label="Confidence" value="±9%" icon={TrendingUp} sub="80% interval" />
        <KPICard label="Trend Signal" value="Positive" icon={CalendarHeart} sub="momentum building" />
      </div>

      <ChartCard
        title="Revenue Forecast"
        aiBadge
        subtitle={`${horizon}-day projection with confidence band`}
        actions={
          <div className="flex flex-wrap gap-2">
            <select value={scope} onChange={(e) => setScope(e.target.value)} className="rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-xs font-medium outline-none focus:border-primary">
              <option value="all">Portfolio</option>
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
          <ComposedChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} minTickGap={32} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v) => money(v, { compact: true })} width={58} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v, n) => n === "band" ? null : [money(Number(v)), n === "actual" ? "Actual" : "Predicted"]} />
            <Legend iconType="circle" iconSize={9} formatter={(val) => <span className="text-xs capitalize text-[#475569]">{val === "band" ? "confidence" : val}</span>} />
            {/* Confidence band = transparent lower + shaded width stacked on it */}
            <Area dataKey="lower" stackId="band" stroke="none" fill="transparent" legendType="none" />
            <Area dataKey="band" stackId="band" stroke="none" fill="var(--primary)" fillOpacity={0.12} />
            <ReferenceLine x={todayLabel} stroke="#94A3B8" strokeDasharray="3 3" label={{ value: "Today", fontSize: 10, fill: "#94A3B8", position: "insideTopRight" }} />
            <Line type="monotone" dataKey="actual" stroke="var(--accent)" strokeWidth={2.5} dot={false} connectNulls />
            <Line type="monotone" dataKey="predicted" stroke="var(--primary)" strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Seasonality & Events" subtitle="Modelled demand drivers" aiBadge>
          <div className="space-y-2.5">
            {EVENTS.map((e) => (
              <div key={e.name} className="flex items-center justify-between rounded-lg border border-[#EEF1F6] px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-[#0B1F3A]">{e.name}</p>
                  <p className="text-xs text-[#94A3B8]">{e.window}</p>
                </div>
                <Badge variant={e.impact >= 0 ? "success" : "danger"}>{e.impact >= 0 ? "+" : ""}{e.impact}% demand</Badge>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Forecast Accuracy" subtitle="Predicted vs actual, trailing periods">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#EEF1F6" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--primary)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(accuracy / 100) * 264} 264`} />
              </svg>
              <div className="absolute text-center">
                <p className="font-fraunces text-3xl font-bold text-[#0B1F3A]">{accuracy.toFixed(0)}%</p>
                <p className="text-[11px] text-[#94A3B8]">accuracy</p>
              </div>
            </div>
            <p className="mt-3 max-w-xs text-center text-xs leading-relaxed text-[#64748B]">
              The model held within ±9% of actuals across the last {terms.branches.toLowerCase()} reporting period.
            </p>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
