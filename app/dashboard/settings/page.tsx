"use client";

import { useRef, useState } from "react";
import {
  Palette, Users2, Building2, BellRing, CreditCard, Database,
  Upload, Plus, Check, Trash2, Download, MessageSquare, Mail,
} from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { useDashboard } from "@/lib/store";
import { canManageTenant, ROLE_LABEL, MOCK_USERS } from "@/lib/auth";
import { INDUSTRY } from "@/lib/industry";
import ChartCard from "@/components/ui/ChartCard";
import Badge from "@/components/ui/Badge";
import TenantLogo from "@/components/dashboard/TenantLogo";
import type { UserRole } from "@/lib/types";

type Tab = "branding" | "users" | "branches" | "notifications" | "billing" | "data";
const TABS: { key: Tab; label: string; icon: typeof Palette }[] = [
  { key: "branding", label: "Branding", icon: Palette },
  { key: "users", label: "Users", icon: Users2 },
  { key: "branches", label: "Branches", icon: Building2 },
  { key: "notifications", label: "Notifications", icon: BellRing },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "data", label: "Data Export", icon: Database },
];

export default function SettingsPage() {
  const { tenant, branches, money } = useTenant();
  const session = useDashboard((s) => s.session);
  const setTenantBrand = useDashboard((s) => s.setTenantBrand);
  const [tab, setTab] = useState<Tab>("branding");
  const fileRef = useRef<HTMLInputElement>(null);

  // Branding form (live preview applied to the whole app on Save).
  const [productName, setProductName] = useState(tenant.productName);
  const [primary, setPrimary] = useState(tenant.primaryColor);
  const [accent, setAccent] = useState(tenant.accentColor);
  const [saved, setSaved] = useState(false);
  const [notif, setNotif] = useState({ emailDaily: true, whatsapp: false, weeklyExec: true, alertsRealtime: true });

  if (!canManageTenant(session.role)) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 text-center">
        <Building2 className="mx-auto mb-3 text-[#CBD5E1]" size={40} />
        <h2 className="font-fraunces text-lg font-bold text-[#0B1F3A]">Restricted</h2>
        <p className="mt-1 text-sm text-[#64748B]">Settings are available to admins only. Your role is {ROLE_LABEL[session.role]}.</p>
      </div>
    );
  }

  const applyBranding = () => {
    setTenantBrand(tenant.slug, { productName, primaryColor: primary, accentColor: accent });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  // Read an uploaded logo as a data URL and apply it as a brand override.
  const onLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) {
      alert("Logo must be under 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setTenantBrand(tenant.slug, { logoUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="scroll-thin flex gap-1 overflow-x-auto border-b border-[#E2E8F0]">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? "border-primary text-primary" : "border-transparent text-[#64748B] hover:text-[#0B1F3A]"}`}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* BRANDING */}
      {tab === "branding" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <ChartCard title="White-label Branding" subtitle="Re-skins the entire dashboard on save" className="lg:col-span-2">
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Product name</label>
                <input value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Logo</label>
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-[#E2E8F0] px-4 py-4">
                  {tenant.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tenant.logoUrl} alt="Logo" className="h-12 w-12 rounded-lg object-contain" />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary font-fraunces font-bold text-white">{tenant.name.slice(0, 2).toUpperCase()}</span>
                  )}
                  <input ref={fileRef} type="file" accept="image/png,image/svg+xml,image/jpeg" onChange={onLogoFile} className="hidden" />
                  <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs font-medium text-[#64748B] hover:border-primary hover:text-primary"><Upload size={14} /> Upload logo</button>
                  {tenant.logoUrl && <button onClick={() => setTenantBrand(tenant.slug, { logoUrl: "" })} className="text-xs font-medium text-[#94A3B8] hover:text-red-500">Remove</button>}
                  <span className="text-xs text-[#94A3B8]">PNG, SVG or JPG · max 1MB</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Primary colour</label>
                  <div className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2">
                    <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0" />
                    <input value={primary} onChange={(e) => setPrimary(e.target.value)} className="w-full text-sm uppercase outline-none" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Accent colour</label>
                  <div className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2">
                    <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0" />
                    <input value={accent} onChange={(e) => setAccent(e.target.value)} className="w-full text-sm uppercase outline-none" />
                  </div>
                </div>
              </div>
              <button onClick={applyBranding} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-lt">
                {saved ? <><Check size={15} /> Applied across app</> : "Save & apply branding"}
              </button>
            </div>
          </ChartCard>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Live preview</p>
            <div className="rounded-xl border border-[#EEF1F6] p-4" style={{ ["--primary" as string]: primary, ["--accent" as string]: accent }}>
              <TenantLogo />
              <button className="mt-4 w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white">Primary button</button>
              <div className="mt-3 flex gap-2"><Badge variant="primary">Chip</Badge><span className="flex-1 rounded-full bg-primary-soft" /></div>
              <div className="mt-3 h-16 rounded-lg" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }} />
            </div>
          </div>
        </div>
      )}

      {/* USERS */}
      {tab === "users" && (
        <ChartCard title="User Management" subtitle="Invite teammates & manage roles" actions={<button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-lt"><Plus size={14} /> Invite user</button>}>
          <div className="space-y-2">
            {MOCK_USERS.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-[#EEF1F6] px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: u.avatarColor }}>{u.name.split(" ").map((w) => w[0]).join("")}</span>
                <div className="min-w-[140px]"><p className="text-sm font-semibold text-[#0B1F3A]">{u.name}</p><p className="text-xs text-[#94A3B8]">{u.email}</p></div>
                <Badge variant={u.role === "super_admin" ? "ai" : u.role === "tenant_admin" ? "primary" : "neutral"}>{ROLE_LABEL[u.role as UserRole]}</Badge>
                <div className="ml-auto flex items-center gap-2">
                  <select defaultValue={u.role} className="rounded-md border border-[#E2E8F0] px-2 py-1 text-xs outline-none focus:border-primary">
                    {(Object.keys(ROLE_LABEL) as UserRole[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                  </select>
                  <button className="rounded-md p-1.5 text-[#94A3B8] hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* BRANCHES */}
      {tab === "branches" && (
        <ChartCard title="Branch Management" subtitle="Add, edit or deactivate locations" actions={<button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-lt"><Plus size={14} /> Add location</button>}>
          <div className="space-y-2">
            {branches.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-[#EEF1F6] px-4 py-3">
                <Building2 size={18} className="text-primary" />
                <div className="min-w-[160px]"><p className="text-sm font-semibold text-[#0B1F3A]">{b.name}</p><p className="text-xs text-[#94A3B8]">{b.city}, {b.country} · opened {b.openedAt}</p></div>
                <Badge variant={b.active ? "success" : "neutral"} dot>{b.active ? "Active" : "Inactive"}</Badge>
                <div className="ml-auto flex gap-2">
                  <button className="rounded-md border border-[#E2E8F0] px-2.5 py-1 text-xs font-medium text-[#64748B] hover:border-primary hover:text-primary">Edit</button>
                  <button className="rounded-md border border-[#E2E8F0] px-2.5 py-1 text-xs font-medium text-[#64748B] hover:border-red-300 hover:text-red-500">Deactivate</button>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* NOTIFICATIONS */}
      {tab === "notifications" && (
        <ChartCard title="Notification Preferences" subtitle="Choose what gets delivered & how">
          <div className="space-y-2.5">
            {([
              ["emailDaily", Mail, "Daily email digest", "Yesterday's performance each morning"],
              ["whatsapp", MessageSquare, "WhatsApp digest", "Branch summaries via WhatsApp"],
              ["weeklyExec", Mail, "Weekly executive summary", "Portfolio roll-up every Monday"],
              ["alertsRealtime", BellRing, "Real-time alert push", "Critical alerts the moment they fire"],
            ] as const).map(([key, Icon, title, desc]) => (
              <div key={key} className="flex items-center gap-3 rounded-lg border border-[#EEF1F6] px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><Icon size={17} /></span>
                <div className="flex-1"><p className="text-sm font-semibold text-[#0B1F3A]">{title}</p><p className="text-xs text-[#94A3B8]">{desc}</p></div>
                <button onClick={() => setNotif((n) => ({ ...n, [key]: !n[key] }))} className={`relative h-6 w-11 rounded-full transition-colors ${notif[key] ? "bg-primary" : "bg-slate-200"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notif[key] ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* BILLING */}
      {tab === "billing" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <ChartCard title="Current Plan" subtitle="Subscription & usage" className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between rounded-xl bg-accent p-5 text-white">
              <div><p className="text-xs uppercase tracking-wide text-white/50">Plan</p><p className="font-fraunces text-2xl font-bold">{tenant.plan}</p></div>
              <div className="text-right"><p className="text-xs uppercase tracking-wide text-white/50">Locations</p><p className="font-fraunces text-2xl font-bold">{branches.length}</p></div>
              <button className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25">Manage plan</button>
            </div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Recent invoices</p>
            <div className="space-y-2">
              {[0, 1, 2].map((m) => (
                <div key={m} className="flex items-center justify-between rounded-lg border border-[#EEF1F6] px-4 py-2.5 text-sm">
                  <span className="text-[#475569]">Invoice · 2026-0{5 - m}-01</span>
                  <span className="font-semibold text-[#0B1F3A]">{money(tenant.plan === "Enterprise" ? 4800 : tenant.plan === "Growth" ? 399 : 149)}</span>
                  <Badge variant="success">Paid</Badge>
                  <button className="text-xs font-semibold text-primary hover:underline">Download</button>
                </div>
              ))}
            </div>
          </ChartCard>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Usage this month</p>
            <UsageRow label="API calls" value="284k / 500k" pct={57} money={money} />
            <UsageRow label="Data ingested" value="42 GB / 100 GB" pct={42} money={money} />
            <UsageRow label="Active users" value="12 / 25" pct={48} money={money} />
          </div>
        </div>
      )}

      {/* DATA EXPORT */}
      {tab === "data" && (
        <ChartCard title="Data Export" subtitle="Request a full export of your tenant data">
          <div className="max-w-xl space-y-4">
            <p className="text-sm leading-relaxed text-[#64748B]">Generate a complete export of {tenant.name}'s data — revenue, P&L, inventory, staff and alerts — across all {branches.length} locations. Large exports are prepared asynchronously and emailed when ready.</p>
            <div className="flex flex-wrap gap-2">
              {["CSV", "Excel", "JSON", "PDF report"].map((fmt) => (
                <label key={fmt} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm hover:border-primary">
                  <input type="radio" name="fmt" defaultChecked={fmt === "CSV"} className="accent-[var(--primary)]" /> {fmt}
                </label>
              ))}
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-lt"><Download size={15} /> Request full export</button>
            <p className="text-xs text-[#94A3B8]">Industry profile: {INDUSTRY[tenant.industry].label} · {INDUSTRY[tenant.industry].emphasis}</p>
          </div>
        </ChartCard>
      )}
    </div>
  );
}

function UsageRow({ label, value, pct }: { label: string; value: string; pct: number; money: (v: number) => string }) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-xs"><span className="text-[#64748B]">{label}</span><span className="font-medium text-[#0B1F3A]">{value}</span></div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
