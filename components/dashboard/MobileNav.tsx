"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useDashboard } from "@/lib/store";
import { useTenant } from "@/components/TenantProvider";
import { NAV_ITEMS, MOBILE_NAV_KEYS } from "@/lib/nav";
import { generateAlerts } from "@/lib/mockData";

/** Fixed bottom navigation shown only on mobile. */
export default function MobileNav() {
  const pathname = usePathname();
  const { tenant } = useTenant();
  const session = useDashboard((s) => s.session);
  const overrides = useDashboard((s) => s.alertOverrides);

  const unread = useMemo(
    () => generateAlerts(tenant.id).filter((a) => (overrides[a.id] ?? a.status) === "unread").length,
    [tenant.id, overrides]
  );

  const items = MOBILE_NAV_KEYS.map((k) => NAV_ITEMS.find((n) => n.key === k)!).filter(
    (n) => tenant.modules.includes(n.key) && (!n.roles || n.roles.includes(session.role))
  );

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[#E2E8F0] bg-white/95 backdrop-blur-md md:hidden">
      {items.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
              active ? "text-primary" : "text-[#94A3B8]"
            }`}
          >
            <span className="relative">
              <Icon size={20} />
              {item.key === "alerts" && unread > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                  {unread}
                </span>
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
