"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield, Building2, Eye, Pencil, Plus, LogOut, Layers, CircleCheck, Clock, TrendingUp, ArrowLeft,
} from "lucide-react";
import { getAllTenants, getBranches } from "@/lib/tenants";
import { INDUSTRY } from "@/lib/industry";
import { useDashboard } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/format";
import type { IndustryType, TenantConfig } from "@/lib/types";
import DataTable, { type Column } from "@/components/ui/DataTable";
import KPICard from "@/components/ui/KPICard";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

const PLAN_MRR: Record<TenantConfig["plan"], number> = { Starter: 149, Growth: 399, Enterprise: 4800 };

export default function AdminPage() {
  const router = useRouter();
  const session = useDashboard((s) => s.session);
  const setTenantSlug = useDashboard((s) => s.setTenantSlug);
  const addTenant = useDashboard((s) => s.addTenant);
  const customTenants = useDashboard((s) => s.customTenants);
  // Includes runtime-created tenants (re-registered on hydrate by StoreHydrator).
  const tenants = useMemo(() => getAllTenants(), [customTenants]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TenantConfig | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", industry: "retail" as IndustryType, plan: "Growth" as TenantConfig["plan"], primaryColor: "#0D9488" });

  if (session.role !== "super_admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FC] p-6">
        <div className="max-w-sm rounded-2xl border border-[#E2E8F0] bg-white p-10 text-center">
          <Shield className="mx-auto mb-3 text-[#CBD5E1]" size={44} />
          <h1 className="font-fraunces text-xl font-bold text-[#0B1F3A]">Super Admin only</h1>
          <p className="mt-2 text-sm text-[#64748B]">This panel is restricted to SM Stratagem administrators.</p>
          <Link href="/dashboard" className="mt-5 inline-block rounded-lg bg-[#0D9488] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#14B8A6]">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const impersonate = (slug: string) => {
    setTenantSlug(slug);
    router.push("/dashboard");
  };

  const rows = tenants.map((t) => ({ ...t, branchCount: getBranches(t.id).length }));
  const totalBranches = rows.reduce((a, t) => a + t.branchCount, 0);
  const mrr = rows.reduce((a, t) => a + PLAN_MRR[t.plan], 0);
  const activeCount = rows.filter((t) => t.status === "active").length;

  const createTenant = () => {
    const id = `t_${form.slug || "new"}`;
    const newTenant: TenantConfig = {
      id, slug: form.slug || "new-tenant", name: form.name || "New Tenant", productName: form.name || "IntelliBranch",
      logoUrl: "", faviconUrl: "", primaryColor: form.primaryColor, accentColor: "#0B1F3A", industry: form.industry,
      currency: "USD", dateFormat: "DD/MM/YYYY", timezone: "UTC", locale: "en", modules: INDUSTRY[form.industry].defaultModules,
      hideSmStratagem: false, plan: form.plan, status: "trial", createdAt: "2026-06-03", lastActive: "2026-06-03",
    };
    addTenant(newTenant); // persisted + registered → immediately impersonatable
    setCreateOpen(false);
    setForm({ name: "", slug: "", industry: "retail", plan: "Growth", primaryColor: "#0D9488" });
  };

  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    {
      key: "name", header: "Tenant", sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg font-fraunces text-xs font-bold text-white" style={{ background: r.primaryColor }}>{r.name.slice(0, 2).toUpperCase()}</span>
          <div><span className="block font-semibold text-[#0B1F3A]">{r.name}</span><span className="block text-xs text-[#94A3B8]">{r.productName} · /{r.slug}</span></div>
        </div>
      ),
    },
    { key: "industry", header: "Industry", sortValue: (r) => r.industry, render: (r) => <span className="text-[#475569]">{INDUSTRY[r.industry].label}</span> },
    { key: "plan", header: "Plan", sortValue: (r) => r.plan, render: (r) => <Badge variant={r.plan === "Enterprise" ? "ai" : r.plan === "Growth" ? "primary" : "neutral"}>{r.plan}</Badge> },
    { key: "status", header: "Status", align: "center", sortValue: (r) => r.status, render: (r) => <Badge variant={r.status === "active" ? "success" : r.status === "trial" ? "warning" : "danger"} dot>{r.status}</Badge> },
    { key: "branches", header: "Branches", align: "right", sortValue: (r) => r.branchCount, render: (r) => r.branchCount },
    { key: "mrr", header: "MRR", align: "right", sortValue: (r) => PLAN_MRR[r.plan], render: (r) => formatCurrency(PLAN_MRR[r.plan], "USD") },
    { key: "lastActive", header: "Last Active", align: "right", sortValue: (r) => r.lastActive, render: (r) => <span className="text-xs text-[#94A3B8]">{formatDate(r.lastActive, r)}</span> },
    {
      key: "actions", header: "", align: "right",
      render: (r) => (
        <div className="flex justify-end gap-1.5">
          <button onClick={() => impersonate(r.slug)} className="inline-flex items-center gap-1 rounded-md bg-[#0D9488] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#14B8A6]"><Eye size={12} /> Impersonate</button>
          <button onClick={() => setEditing(r)} className="rounded-md border border-[#E2E8F0] p-1.5 text-[#64748B] hover:border-[#0D9488] hover:text-[#0D9488]"><Pencil size={13} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Admin header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E2E8F0] bg-[#0B1F3A] px-6">
        <span className="flex items-center gap-2 font-fraunces text-lg font-bold text-white"><Shield size={18} className="text-[#14B8A6]" /> IntelliBranch Admin</span>
        <span className="hidden rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/70 sm:block">SM Stratagem · Super Admin</span>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"><ArrowLeft size={14} /> Dashboard</Link>
          <button onClick={() => router.push("/login")} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"><LogOut size={16} /></button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPICard label="Total Tenants" value={rows.length.toString()} icon={Building2} />
          <KPICard label="Active" value={activeCount.toString()} icon={CircleCheck} sub={`${rows.length - activeCount} trial/suspended`} />
          <KPICard label="Total Branches" value={totalBranches.toString()} icon={Layers} />
          <KPICard label="Portfolio MRR" value={formatCurrency(mrr, "USD", { compact: true })} icon={TrendingUp} delta={9.4} />
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white">
          <div className="flex items-center justify-between border-b border-[#EEF1F6] px-5 py-4">
            <div><h2 className="font-fraunces text-base font-semibold text-[#0B1F3A]">All Tenants</h2><p className="text-xs text-[#94A3B8]">Manage, impersonate & provision clients</p></div>
            <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D9488] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#14B8A6]"><Plus size={14} /> Create tenant</button>
          </div>
          <div className="p-5">
            <DataTable data={rows} columns={columns} pageSize={10} initialSort={{ key: "name", dir: "asc" }} searchFields={(r) => `${r.name} ${r.slug} ${INDUSTRY[r.industry].label}`} searchPlaceholder="Search tenants…" />
          </div>
        </div>

        {/* Usage / billing overview */}
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <h3 className="mb-4 font-fraunces text-base font-semibold text-[#0B1F3A]">Plan Distribution</h3>
            {(["Enterprise", "Growth", "Starter"] as TenantConfig["plan"][]).map((plan) => {
              const count = rows.filter((t) => t.plan === plan).length;
              const pct = rows.length ? (count / rows.length) * 100 : 0;
              return (
                <div key={plan} className="mb-3">
                  <div className="mb-1 flex justify-between text-xs"><span className="text-[#64748B]">{plan}</span><span className="font-medium text-[#0B1F3A]">{count} · {formatCurrency(PLAN_MRR[plan] * count, "USD")}/mo</span></div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0D9488]" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <h3 className="mb-4 font-fraunces text-base font-semibold text-[#0B1F3A]">Recent Activity</h3>
            <div className="space-y-2.5">
              {rows.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 text-sm">
                  <Clock size={14} className="text-[#94A3B8]" />
                  <span className="flex-1 text-[#475569]"><strong className="text-[#0B1F3A]">{t.name}</strong> last active</span>
                  <span className="text-xs text-[#94A3B8]">{formatDate(t.lastActive, t)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Create tenant modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create tenant" subtitle="Provision a new client workspace" size="md"
        footer={<><button onClick={() => setCreateOpen(false)} className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B]">Cancel</button><button onClick={createTenant} className="rounded-lg bg-[#0D9488] px-4 py-2 text-sm font-semibold text-white hover:bg-[#14B8A6]">Create tenant</button></>}>
        <div className="space-y-4">
          <Field label="Company name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Corp" className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#0D9488]" /></Field>
          <Field label="URL slug"><div className="flex items-center rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm focus-within:border-[#0D9488]"><span className="text-[#94A3B8]">app.intellibranch.io/</span><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s/g, "-") })} placeholder="acme" className="flex-1 outline-none" /></div></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Industry"><select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value as IndustryType })} className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#0D9488]">{(Object.keys(INDUSTRY) as IndustryType[]).map((k) => <option key={k} value={k}>{INDUSTRY[k].label}</option>)}</select></Field>
            <Field label="Plan"><select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value as TenantConfig["plan"] })} className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#0D9488]">{(["Starter", "Growth", "Enterprise"] as const).map((p) => <option key={p}>{p}</option>)}</select></Field>
          </div>
          <Field label="Primary colour"><div className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2"><input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0" /><input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="w-full text-sm uppercase outline-none" /></div></Field>
        </div>
      </Modal>

      {/* Edit tenant modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.name ?? ""}`} subtitle="Tenant configuration" size="md"
        footer={<><button onClick={() => setEditing(null)} className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B]">Cancel</button><button onClick={() => setEditing(null)} className="rounded-lg bg-[#0D9488] px-4 py-2 text-sm font-semibold text-white hover:bg-[#14B8A6]">Save changes</button></>}>
        {editing && (
          <dl className="space-y-2.5 text-sm">
            {[["Product name", editing.productName], ["Slug", `/${editing.slug}`], ["Industry", INDUSTRY[editing.industry].label], ["Currency", editing.currency], ["Custom domain", editing.customDomain ?? "—"], ["White-labelled", editing.hideSmStratagem ? "Yes" : "No"], ["Modules enabled", `${editing.modules.length} / 12`]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-[#F1F5F9] py-1.5"><dt className="text-[#94A3B8]">{k}</dt><dd className="font-medium text-[#1E293B]">{v}</dd></div>
            ))}
          </dl>
        )}
      </Modal>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</label>{children}</div>;
}
