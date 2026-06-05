"use client";

import { useState } from "react";
import { Plug, Plus, RefreshCw, Check, Copy, KeyRound, CircleCheck, CircleAlert, CircleDashed } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { useFakeLoading } from "@/lib/hooks";
import { generateIntegrations } from "@/lib/mockData";
import { relativeTime } from "@/lib/format";
import ChartCard from "@/components/ui/ChartCard";
import KPICard from "@/components/ui/KPICard";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import type { Integration } from "@/lib/types";

const STATUS: Record<Integration["status"], { v: "success" | "info" | "danger" | "neutral"; label: string; Icon: typeof CircleCheck }> = {
  live: { v: "success", label: "Live", Icon: CircleCheck },
  syncing: { v: "info", label: "Syncing", Icon: CircleDashed },
  error: { v: "danger", label: "Error", Icon: CircleAlert },
  disconnected: { v: "neutral", label: "Disconnected", Icon: CircleDashed },
};

const CATALOGUE = ["Shopify POS", "Toast", "Oracle MICROS", "Microsoft Dynamics", "QuickBooks", "Zoho Inventory", "Workday", "Uber Eats", "Talabat", "Salesforce"];

export default function IntegrationsPage() {
  const { tenant } = useTenant();
  const loading = useFakeLoading([tenant.id]);
  const [integrations, setIntegrations] = useState<Integration[]>(() => generateIntegrations(tenant.id));
  const [addOpen, setAddOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const live = integrations.filter((i) => i.status === "live").length;
  const errors = integrations.filter((i) => i.status === "error").length;
  const records = integrations.reduce((a, i) => a + i.recordsToday, 0);

  const apiKeys = [
    { name: "Production", key: `ib_live_${tenant.slug}_8f3a9c2b`, created: "2024-02-11" },
    { name: "Read-only", key: `ib_ro_${tenant.slug}_4d7e1f00`, created: "2025-01-08" },
  ];

  const reconnect = (id: string) =>
    setIntegrations((arr) => arr.map((i) => (i.id === id ? { ...i, status: "syncing" } : i)));

  const copy = (key: string) => {
    navigator.clipboard?.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  if (loading) return <div className="space-y-5"><div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><LoadingSkeleton variant="kpi" count={4} /></div><LoadingSkeleton variant="card" count={2} /></div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Connected" value={integrations.filter((i) => i.status !== "disconnected").length.toString()} icon={Plug} />
        <KPICard label="Live" value={live.toString()} icon={CircleCheck} />
        <KPICard label="Records Today" value={records.toLocaleString()} icon={RefreshCw} delta={6.2} />
        <KPICard label="Errors" value={errors.toString()} icon={CircleAlert} invertDelta delta={errors > 0 ? 100 : -50} />
      </div>

      <ChartCard
        title="Connected Systems"
        subtitle="POS, ERP, inventory, HR & more"
        actions={<button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-lt"><Plus size={14} /> Add integration</button>}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((i) => {
            const meta = STATUS[i.status];
            return (
              <div key={i.id} className="rounded-xl border border-[#E2E8F0] p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8F9FC] font-fraunces text-sm font-bold text-[#0B1F3A]">{i.name[0]}</span>
                    <div><p className="text-sm font-semibold text-[#0B1F3A]">{i.name}</p><p className="text-[11px] text-[#94A3B8]">{i.category}</p></div>
                  </div>
                  <Badge variant={meta.v} dot>{meta.label}</Badge>
                </div>
                <div className="flex items-center justify-between border-t border-[#EEF1F6] pt-2.5 text-xs text-[#64748B]">
                  <span>{i.status === "syncing" ? "Syncing now…" : i.status === "disconnected" ? "Not connected" : `Synced ${relativeTime(i.lastSync)}`}</span>
                  {(i.status === "error" || i.status === "disconnected") && (
                    <button onClick={() => reconnect(i.id)} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"><RefreshCw size={12} /> Reconnect</button>
                  )}
                  {i.status === "live" && <span className="text-[#94A3B8]">{i.recordsToday.toLocaleString()} recs</span>}
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>

      <ChartCard title="API Keys" subtitle="Manage programmatic access" actions={<button className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#64748B] hover:border-primary hover:text-primary"><KeyRound size={13} /> Generate key</button>}>
        <div className="space-y-2.5">
          {apiKeys.map((k) => (
            <div key={k.name} className="flex flex-wrap items-center gap-3 rounded-lg border border-[#EEF1F6] px-4 py-3">
              <div className="min-w-[110px]"><p className="text-sm font-semibold text-[#0B1F3A]">{k.name}</p><p className="text-[11px] text-[#94A3B8]">Created {k.created}</p></div>
              <code className="flex-1 truncate rounded-md bg-[#F8F9FC] px-3 py-1.5 font-mono text-xs text-[#475569]">{k.key.slice(0, 14)}••••••••</code>
              <button onClick={() => copy(k.key)} className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] px-2.5 py-1.5 text-xs font-medium text-[#64748B] hover:border-primary hover:text-primary">
                {copied === k.key ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
          ))}
        </div>
      </ChartCard>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add integration" subtitle="Connect a supported system" size="md">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {CATALOGUE.map((name) => (
            <button key={name} onClick={() => setAddOpen(false)} className="flex items-center gap-2.5 rounded-lg border border-[#E2E8F0] px-3.5 py-3 text-left transition-colors hover:border-primary hover:bg-primary-soft">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8F9FC] font-fraunces text-sm font-bold text-[#0B1F3A]">{name[0]}</span>
              <span className="text-sm font-medium text-[#1E293B]">{name}</span>
              <Plus size={15} className="ml-auto text-[#94A3B8]" />
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
