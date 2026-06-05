import type { ReactNode } from "react";
import { TenantProvider } from "@/components/TenantProvider";
import DashboardShell from "@/components/dashboard/DashboardShell";

// The dashboard is wrapped in the white-label TenantProvider (sets brand CSS
// variables) and the chrome shell (sidebar / topbar / mobile nav).
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <TenantProvider>
      <DashboardShell>{children}</DashboardShell>
    </TenantProvider>
  );
}
