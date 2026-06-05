"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { MOCK_USERS } from "@/lib/auth";
import { apiLogin } from "@/lib/session-client";
import { getTenantById } from "@/lib/tenants";
import { useDashboard } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useDashboard((s) => s.setSession);
  const setTenantSlug = useDashboard((s) => s.setTenantSlug);
  const [email, setEmail] = useState("admin@lumengroup.ae");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Credentials are verified server-side (/api/login), which sets the signed
    // httpOnly session cookie that the proxy checks on /dashboard and /admin.
    const user = await apiLogin(email, password);
    setLoading(false);
    if (!user) {
      setError("Invalid credentials. Try one of the demo accounts below.");
      return;
    }
    // On success: hydrate client session + resolve the tenant for white-labelling.
    setSession(user);
    const tenant = getTenantById(user.tenantId);
    if (tenant) setTenantSlug(tenant.slug);
    router.push(user.role === "super_admin" ? "/admin" : "/dashboard");
  };

  const quickFill = (e: string) => {
    setEmail(e);
    setPassword("demo");
    setError("");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0B1F3A] p-12 lg:flex">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <Link href="/" className="relative z-10 font-fraunces text-2xl font-bold text-white">Intelli<span className="text-[#14B8A6]">Branch</span></Link>
        <div className="relative z-10">
          <h2 className="font-fraunces text-4xl font-bold leading-tight text-white">Your operational data, working for you.</h2>
          <p className="mt-4 max-w-md text-white/55">Live P&L, AI alerts, forecasting and cross-branch benchmarking — one login for your whole estate.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Live P&L", "AI Forecasting", "Branch Benchmarking", "White-label"].map((t) => (
              <span key={t} className="rounded-full border border-[#0D9488]/30 bg-[#0D9488]/10 px-3 py-1.5 text-xs font-semibold text-[#14B8A6]">{t}</span>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/30">A SaaS product by SM Stratagem</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><span className="font-fraunces text-2xl font-bold text-[#0B1F3A]">Intelli<span className="text-[#0D9488]">Branch</span></span></div>
          <h1 className="font-fraunces text-2xl font-bold text-[#0B1F3A]">Sign in</h1>
          <p className="mt-1 text-sm text-[#64748B]">Welcome back. Enter your details to continue.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-[#E2E8F0] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0D9488]" required />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-[#E2E8F0] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0D9488]" required />
              </div>
            </div>
            {error && <p className="flex items-center gap-1.5 text-xs text-red-500"><AlertCircle size={14} /> {error}</p>}
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0D9488] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14B8A6] disabled:opacity-60">
              {loading ? "Signing in…" : "Sign in"} <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-7 rounded-xl border border-[#E2E8F0] bg-[#F8F9FC] p-4">
            <p className="mb-2 text-xs font-semibold text-[#475569]">Demo accounts (password: demo)</p>
            <div className="space-y-1.5">
              {MOCK_USERS.map((u) => (
                <button key={u.id} onClick={() => quickFill(u.email)} className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-xs transition-colors hover:ring-1 hover:ring-[#0D9488]">
                  <span className="font-medium text-[#0B1F3A]">{u.name}</span>
                  <span className="text-[#94A3B8]">{u.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[#94A3B8]">Tenant resolved by custom domain, subdomain, or URL slug.</p>
        </div>
      </div>
    </div>
  );
}
