"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Save, Sparkles, RotateCcw, Trash2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/components/TenantProvider";
import { useScope, useFakeLoading } from "@/lib/hooks";
import { monthlyBaseline, applyScenario } from "@/lib/mockData";
import ChartCard from "@/components/ui/ChartCard";
import Badge from "@/components/ui/Badge";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { AXIS_TICK, GRID_PROPS, TOOLTIP_STYLE } from "@/components/charts/chartTheme";

type Levers = { priceChange: number; headcountChange: number; hoursChange: number; newLocation: boolean };
type Saved = Levers & { id: number; name: string; net: number; margin: number };

const DEFAULT: Levers = { priceChange: 0, headcountChange: 0, hoursChange: 0, newLocation: false };

function Slider({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-[#475569]">{label}</span>
        <span className="rounded-md bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">{value > 0 ? "+" : ""}{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
    </div>
  );
}

export default function WhatIfPage() {
  const { tenant, money, terms } = useTenant();
  const { branchIds } = useScope();
  const router = useRouter();
  const loading = useFakeLoading([tenant.id, branchIds.join(",")]);
  const [levers, setLevers] = useState<Levers>(DEFAULT);
  const [saved, setSaved] = useState<Saved[]>([]);

  const baseline = useMemo(() => {
    const b = monthlyBaseline(tenant.id, branchIds);
    return { ...b, grossProfit: b.revenue - b.cogs, net: b.revenue - b.cogs - b.staffCost - b.otherExpenses, margin: b.revenue ? ((b.revenue - b.cogs) / b.revenue) * 100 : 0 };
  }, [tenant.id, branchIds]);

  const projected = useMemo(() => applyScenario(baseline, levers), [baseline, levers]);
  const netDelta = projected.net - baseline.net;
  const revDelta = projected.revenue - baseline.revenue;

  const set = (k: keyof Levers, v: number | boolean) => setLevers((l) => ({ ...l, [k]: v }));

  const compareData = [
    { metric: "Revenue", Baseline: baseline.revenue, Scenario: projected.revenue },
    { metric: "Gross Profit", Baseline: baseline.grossProfit, Scenario: projected.grossProfit },
    { metric: "Net Profit", Baseline: baseline.net, Scenario: projected.net },
  ];

  const saveScenario = () => {
    if (saved.length >= 3) return;
    setSaved((s) => [...s, { ...levers, id: Date.now(), name: `Scenario ${s.length + 1}`, net: projected.net, margin: projected.margin }]);
  };

  if (loading) return <div className="space-y-5"><div className="grid gap-5 lg:grid-cols-2"><LoadingSkeleton variant="card" count={2} /></div></div>;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Levers */}
        <ChartCard title="Scenario Levers" subtitle="Adjust inputs — P&L recalculates live" className="lg:col-span-2" actions={
          <button onClick={() => setLevers(DEFAULT)} className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-2 py-1.5 text-xs font-medium text-[#64748B] hover:border-primary hover:text-primary"><RotateCcw size={13} /> Reset</button>
        }>
          <div className="space-y-5">
            <Slider label="Price change" value={levers.priceChange} min={-20} max={20} step={1} suffix="%" onChange={(v) => set("priceChange", v)} />
            <Slider label="Headcount change" value={levers.headcountChange} min={-5} max={10} step={1} suffix=" staff" onChange={(v) => set("headcountChange", v)} />
            <Slider label="Trading hours change" value={levers.hoursChange} min={-30} max={30} step={5} suffix="%" onChange={(v) => set("hoursChange", v)} />
            <div className="flex items-center justify-between rounded-lg border border-[#EEF1F6] px-3.5 py-3">
              <div>
                <p className="text-sm font-medium text-[#475569]">Open a new {terms.branch.toLowerCase()}</p>
                <p className="text-xs text-[#94A3B8]">Adds ~18% portfolio capacity</p>
              </div>
              <button onClick={() => set("newLocation", !levers.newLocation)} className={`relative h-6 w-11 rounded-full transition-colors ${levers.newLocation ? "bg-primary" : "bg-slate-200"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${levers.newLocation ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveScenario} disabled={saved.length >= 3} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-primary-lt">
                <Save size={15} /> Save scenario {saved.length >= 3 ? "(max 3)" : ""}
              </button>
              <button onClick={() => router.push("/dashboard/forecast")} className="flex items-center justify-center gap-1.5 rounded-lg border border-primary px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary-soft">
                <Sparkles size={15} /> Apply to forecast
              </button>
            </div>
          </div>
        </ChartCard>

        {/* Projected impact */}
        <div className="space-y-5 lg:col-span-3">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Impact label="Proj. Revenue" value={money(projected.revenue, { compact: true })} delta={revDelta} money={money} />
            <Impact label="Proj. Net" value={money(projected.net, { compact: true })} delta={netDelta} money={money} />
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Proj. Margin</p>
              <p className="mt-1 font-fraunces text-2xl font-bold text-[#0B1F3A]">{projected.margin.toFixed(1)}%</p>
              <p className="mt-1 text-xs text-[#64748B]">vs {baseline.margin.toFixed(1)}% base</p>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Net Impact</p>
              <p className={`mt-1 font-fraunces text-2xl font-bold ${netDelta >= 0 ? "text-emerald-600" : "text-red-500"}`}>{netDelta >= 0 ? "+" : ""}{money(netDelta, { compact: true })}</p>
              <p className="mt-1 text-xs text-[#64748B]">monthly</p>
            </div>
          </div>

          <ChartCard title="Baseline vs Scenario" subtitle="Projected monthly P&L impact">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={compareData} margin={{ left: -8, right: 8 }}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="metric" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v) => money(v, { compact: true })} width={58} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#F1F5F9" }} formatter={(v) => money(Number(v))} />
                <Bar dataKey="Baseline" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={26} />
                <Bar dataKey="Scenario" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Saved scenarios */}
      {saved.length > 0 && (
        <ChartCard title="Saved Scenarios" subtitle="Compare up to three side-by-side">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((s) => (
              <div key={s.id} className="rounded-xl border border-[#E2E8F0] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-fraunces text-base font-semibold text-[#0B1F3A]">{s.name}</p>
                  <button onClick={() => setSaved((arr) => arr.filter((x) => x.id !== s.id))} className="text-[#94A3B8] hover:text-red-500"><Trash2 size={15} /></button>
                </div>
                <dl className="space-y-1.5 text-sm">
                  <Line2 k="Price" v={`${s.priceChange > 0 ? "+" : ""}${s.priceChange}%`} />
                  <Line2 k="Headcount" v={`${s.headcountChange > 0 ? "+" : ""}${s.headcountChange}`} />
                  <Line2 k="Hours" v={`${s.hoursChange > 0 ? "+" : ""}${s.hoursChange}%`} />
                  <Line2 k="New location" v={s.newLocation ? "Yes" : "No"} />
                </dl>
                <div className="mt-3 flex items-center justify-between border-t border-[#EEF1F6] pt-3">
                  <span className="text-xs text-[#94A3B8]">Net / month</span>
                  <Badge variant={s.net >= baseline.net ? "success" : "danger"}>{money(s.net, { compact: true })}</Badge>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}

function Impact({ label, value, delta, money }: { label: string; value: string; delta: number; money: (v: number, o?: { compact?: boolean }) => string }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p className="mt-1 font-fraunces text-2xl font-bold text-[#0B1F3A]">{value}</p>
      <p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
        <ArrowRight size={12} className={delta >= 0 ? "-rotate-45" : "rotate-45"} /> {delta >= 0 ? "+" : ""}{money(delta, { compact: true })}
      </p>
    </div>
  );
}
function Line2({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><dt className="text-[#94A3B8]">{k}</dt><dd className="font-medium text-[#1E293B]">{v}</dd></div>;
}
