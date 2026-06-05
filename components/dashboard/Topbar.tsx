"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Bell, Shield } from "lucide-react";
import { useDashboard } from "@/lib/store";
import { useTenant } from "@/components/TenantProvider";
import { NAV_ITEMS } from "@/lib/nav";
import { canAccessAdmin } from "@/lib/auth";
import { generateAlerts } from "@/lib/mockData";
import BranchSelector from "@/components/ui/BranchSelector";
import DateRangePicker from "@/components/ui/DateRangePicker";
import TenantLogo from "./TenantLogo";

export default function Topbar() {
  const pathname = usePathname();
  const { tenant } = useTenant();
  const session = useDashboard((s) => s.session);
  const overrides = useDashboard((s) => s.alertOverrides);

  const title = useMemo(() => {
    const exact = NAV_ITEMS.find((n) => n.href === pathname);
    if (exact) return exact.label;
    const partial = [...NAV_ITEMS].reverse().find((n) => n.href !== "/dashboard" && pathname.startsWith(n.href));
    return partial?.label ?? "Overview";
  }, [pathname]);

  const unread = useMemo(
    () => generateAlerts(tenant.id).filter((a) => (overrides[a.id] ?? a.status) === "unread").length,
    [tenant.id, overrides]
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E2E8F0] bg-white/90 px-4 backdrop-blur-md md:px-6">
      {/* Mobile brand (sidebar hidden on mobile) */}
      <div className="md:hidden">
        <TenantLogo size="sm" showName={false} />
      </div>

      <h1 className="hidden font-fraunces text-lg font-bold text-[#0B1F3A] md:block">{title}</h1>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <div className="hidden sm:block">
          <BranchSelector compact />
        </div>
        <DateRangePicker compact />

        {canAccessAdmin(session.role) && (
          <Link
            href="/admin"
            className="hidden items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 lg:flex"
          >
            <Shield size={14} /> Admin
          </Link>
        )}

        <Link
          href="/dashboard/alerts"
          className="relative rounded-lg border border-[#E2E8F0] p-2 text-[#64748B] transition-colors hover:border-primary hover:text-primary"
          aria-label="Alerts"
        >
          <Bell size={17} />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {unread}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
