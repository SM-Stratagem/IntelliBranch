"use client";

import { useMemo, useState } from "react";
import { Check, Clock, UserPlus, SlidersHorizontal, AlertOctagon, AlertTriangle, Info } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { useDashboard } from "@/lib/store";
import { useFakeLoading } from "@/lib/hooks";
import { generateAlerts } from "@/lib/mockData";
import { canExport } from "@/lib/auth";
import ChartCard from "@/components/ui/ChartCard";
import AlertCard from "@/components/dashboard/AlertCard";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import type { Alert, AlertSeverity } from "@/lib/types";

type Filter = "all" | AlertSeverity;

const THRESHOLDS = [
  { key: "Revenue drop", value: 15, unit: "%" },
  { key: "Margin erosion", value: 3, unit: "pts" },
  { key: "Days of stock", value: 2, unit: "days" },
  { key: "Labour cost", value: 30, unit: "%" },
  { key: "Forecast deviation", value: 10, unit: "%" },
];

export default function AlertsPage() {
  const { tenant, visibleBranches } = useTenant();
  const session = useDashboard((s) => s.session);
  const overrides = useDashboard((s) => s.alertOverrides);
  const setAlertStatus = useDashboard((s) => s.setAlertStatus);
  const loading = useFakeLoading([tenant.id]);
  const [filter, setFilter] = useState<Filter>("all");
  const [assigning, setAssigning] = useState<Alert | null>(null);
  const [thresholds, setThresholds] = useState(THRESHOLDS);

  // Merge generated alerts with live status overrides from the store.
  const alerts = useMemo(
    () => generateAlerts(tenant.id).map((a) => ({ ...a, status: overrides[a.id] ?? a.status })),
    [tenant.id, overrides]
  );

  const active = alerts.filter((a) => a.status !== "resolved");
  const history = alerts.filter((a) => a.status === "resolved");
  const counts = {
    critical: active.filter((a) => a.severity === "critical").length,
    warning: active.filter((a) => a.severity === "warning").length,
    info: active.filter((a) => a.severity === "info").length,
  };

  const filtered = active.filter((a) => filter === "all" || a.severity === filter);
  const readOnly = !canExport(session.role);

  if (loading) return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-3"><LoadingSkeleton variant="kpi" count={3} /></div><LoadingSkeleton variant="card" count={3} /></div>;

  return (
    <div className="space-y-5">
      {/* Severity summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {([["critical", AlertOctagon, "text-red-600", "bg-red-50"], ["warning", AlertTriangle, "text-amber-600", "bg-amber-50"], ["info", Info, "text-blue-600", "bg-blue-50"]] as const).map(([sev, Icon, text, bg]) => (
          <button key={sev} onClick={() => setFilter(filter === sev ? "all" : sev)} className={`flex items-center gap-3 rounded-xl border bg-white p-5 text-left transition-shadow hover:shadow-sm ${filter === sev ? "border-primary" : "border-[#E2E8F0]"}`}>
            <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${bg} ${text}`}><Icon size={20} /></span>
            <div><p className="text-xs capitalize text-[#94A3B8]">{sev}</p><p className="font-fraunces text-2xl font-bold text-[#0B1F3A]">{counts[sev]}</p></div>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Active alerts */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-fraunces text-lg font-bold text-[#0B1F3A]">Active Alerts</h2>
            <div className="flex rounded-lg border border-[#E2E8F0] p-0.5 text-xs">
              {(["all", "critical", "warning", "info"] as Filter[]).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`rounded-md px-2.5 py-1 font-medium capitalize transition-colors ${filter === f ? "bg-primary text-white" : "text-[#64748B] hover:text-[#0B1F3A]"}`}>{f}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white py-12 text-center text-sm text-[#94A3B8]">No active alerts in this view 🎉</div>
          ) : (
            filtered.map((a) => (
              <AlertCard
                key={a.id}
                alert={a}
                actions={
                  readOnly ? <span className="text-[11px] italic text-[#94A3B8]">Read-only role</span> : (
                    <>
                      <button onClick={() => setAlertStatus(a.id, "resolved")} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-200 hover:bg-emerald-50"><Check size={12} /> Resolve</button>
                      <button onClick={() => setAlertStatus(a.id, a.status === "snoozed" ? "unread" : "snoozed")} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-amber-600 ring-1 ring-amber-200 hover:bg-amber-50"><Clock size={12} /> {a.status === "snoozed" ? "Unsnooze" : "Snooze"}</button>
                      <button onClick={() => setAssigning(a)} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#64748B] ring-1 ring-[#E2E8F0] hover:bg-slate-50"><UserPlus size={12} /> Assign</button>
                      {a.status === "snoozed" && <Badge variant="warning">Snoozed</Badge>}
                    </>
                  )
                }
              />
            ))
          )}
        </div>

        {/* Config + history */}
        <div className="space-y-5">
          <ChartCard title="Alert Configuration" subtitle="Thresholds per KPI" >
            <div className="space-y-4">
              {thresholds.map((t, i) => (
                <div key={t.key}>
                  <div className="mb-1 flex items-center justify-between text-sm"><span className="text-[#475569]">{t.key}</span><span className="font-semibold text-[#0B1F3A]">{t.value}{t.unit}</span></div>
                  <input type="range" min={1} max={t.unit === "pts" ? 10 : t.unit === "days" ? 7 : 40} value={t.value} disabled={readOnly}
                    onChange={(e) => setThresholds((arr) => arr.map((x, xi) => xi === i ? { ...x, value: Number(e.target.value) } : x))}
                    className="w-full accent-[var(--primary)] disabled:opacity-50" />
                </div>
              ))}
              <div className="flex items-center gap-1.5 pt-1 text-xs text-[#94A3B8]"><SlidersHorizontal size={13} /> Alerts trigger when a KPI breaches these bands.</div>
            </div>
          </ChartCard>

          <ChartCard title="Alert History" subtitle={`${history.length} resolved · last 30 days`} bodyClassName="space-y-2">
            {history.length === 0 ? <p className="py-4 text-center text-sm text-[#94A3B8]">No resolved alerts yet.</p> : history.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center gap-2 rounded-lg bg-[#F8F9FC] px-3 py-2">
                <Check size={14} className="text-emerald-500" />
                <span className="flex-1 truncate text-xs text-[#475569]">{a.title} · {a.branchName}</span>
              </div>
            ))}
          </ChartCard>
        </div>
      </div>

      {/* Assign modal */}
      <Modal open={!!assigning} onClose={() => setAssigning(null)} title="Assign alert" subtitle={assigning?.title} size="sm"
        footer={<><button onClick={() => setAssigning(null)} className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B]">Cancel</button><button onClick={() => setAssigning(null)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-lt">Assign</button></>}>
        <p className="mb-3 text-sm text-[#64748B]">Assign this alert to a branch manager for follow-up.</p>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Branch manager</label>
        <select className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-primary">
          {visibleBranches.map((b) => <option key={b.id}>{b.name} — Manager</option>)}
        </select>
      </Modal>
    </div>
  );
}
