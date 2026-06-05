"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { LogOut, PanelLeftClose, PanelLeft, Sparkles } from "lucide-react";
import { useDashboard } from "@/lib/store";
import { useTenant } from "@/components/TenantProvider";
import { NAV_ITEMS } from "@/lib/nav";
import { ROLE_LABEL } from "@/lib/auth";
import { apiLogout } from "@/lib/session-client";
import { generateAlerts } from "@/lib/mockData";
import TenantLogo from "./TenantLogo";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { tenant } = useTenant();
  const collapsed = useDashboard((s) => s.sidebarCollapsed);
  const toggle = useDashboard((s) => s.toggleSidebar);
  const session = useDashboard((s) => s.session);
  const overrides = useDashboard((s) => s.alertOverrides);

  // Unread alert count for the nav badge (generated data + live overrides).
  const unread = useMemo(() => {
    return generateAlerts(tenant.id).filter((a) => (overrides[a.id] ?? a.status) === "unread").length;
  }, [tenant.id, overrides]);

  // Only modules enabled for this tenant and permitted for this role.
  const items = NAV_ITEMS.filter(
    (n) => tenant.modules.includes(n.key) && (!n.roles || n.roles.includes(session.role))
  );

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-[#E2E8F0] bg-white transition-[width] duration-200 md:flex ${
        collapsed ? "w-[68px]" : "w-60"
      }`}
    >
      {/* Brand */}
      <div className={`flex h-16 items-center border-b border-[#EEF1F6] ${collapsed ? "justify-center px-2" : "px-4"}`}>
        {collapsed ? <TenantLogo size="sm" showName={false} /> : <TenantLogo />}
      </div>

      {/* Nav */}
      <nav className="scroll-thin flex-1 overflow-y-auto px-2.5 py-3">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const showBadge = item.key === "alerts" && unread > 0;
            return (
              <li key={item.key} className="group relative">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-primary-soft text-primary" : "text-[#475569] hover:bg-[#F8F9FC] hover:text-[#0B1F3A]"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <span className="relative flex-shrink-0">
                    <Icon size={18} className={active ? "text-primary" : ""} />
                    {collapsed && showBadge && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                        {unread}
                      </span>
                    )}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.ai && <Sparkles size={13} className="text-violet-500" />}
                      {showBadge && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                          {unread}
                        </span>
                      )}
                    </>
                  )}
                </Link>

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#0B1F3A] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {item.label}
                    {item.ai && " · AI"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className={`flex items-center gap-2 border-t border-[#EEF1F6] px-4 py-2.5 text-xs font-medium text-[#94A3B8] transition-colors hover:text-[#0B1F3A] ${
          collapsed ? "justify-center" : ""
        }`}
      >
        {collapsed ? <PanelLeft size={16} /> : <><PanelLeftClose size={16} /> Collapse</>}
      </button>

      {/* User */}
      <div className={`border-t border-[#EEF1F6] p-3 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <div className="group relative">
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: session.avatarColor }}>
              {session.name.split(" ").map((w) => w[0]).join("")}
            </span>
            <span className="pointer-events-none absolute bottom-1/2 left-full z-50 ml-2 translate-y-1/2 whitespace-nowrap rounded-md bg-[#0B1F3A] px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {session.name} · {ROLE_LABEL[session.role]}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: session.avatarColor }}>
              {session.name.split(" ").map((w) => w[0]).join("")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#0B1F3A]">{session.name}</p>
              <p className="truncate text-[11px] text-[#94A3B8]">{ROLE_LABEL[session.role]}</p>
            </div>
            <button
              onClick={async () => { await apiLogout(); router.push("/login"); }}
              className="rounded-lg p-1.5 text-[#94A3B8] transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
