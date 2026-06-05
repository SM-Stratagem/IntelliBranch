"use client";

import type { ReactNode } from "react";
import { useDashboard } from "@/lib/store";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";

/** Composes the dashboard chrome around page content and offsets for the
 *  collapsible sidebar width. */
export default function DashboardShell({ children }: { children: ReactNode }) {
  const collapsed = useDashboard((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <div className={`flex min-h-screen flex-col transition-[padding] duration-200 ${collapsed ? "md:pl-[68px]" : "md:pl-60"}`}>
        <Topbar />
        <main className="flex-1 px-4 pb-24 pt-5 md:px-6 md:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
