import {
  LayoutDashboard, DollarSign, FileText, Grid3x3, GitCompare, Sparkles,
  SlidersHorizontal, Boxes, Users, Bell, Plug, Settings, LineChart, type LucideIcon,
} from "lucide-react";
import type { ModuleKey, UserRole } from "./types";

export type NavItem = {
  key: ModuleKey;
  label: string;
  href: string;
  icon: LucideIcon;
  ai?: boolean;
  /** Roles allowed to see this item (omit = everyone). */
  roles?: UserRole[];
};

export const NAV_ITEMS: NavItem[] = [
  { key: "overview", label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { key: "revenue", label: "Revenue", href: "/dashboard/revenue", icon: DollarSign },
  { key: "pnl", label: "Profit & Loss", href: "/dashboard/pnl", icon: FileText },
  { key: "heatmap", label: "Heatmap", href: "/dashboard/heatmap", icon: Grid3x3 },
  { key: "branches", label: "Branches", href: "/dashboard/branches", icon: GitCompare },
  { key: "forecast", label: "Forecasting", href: "/dashboard/forecast", icon: Sparkles, ai: true },
  { key: "whatif", label: "What-If", href: "/dashboard/whatif", icon: SlidersHorizontal },
  { key: "demand", label: "Demand Forecast", href: "/dashboard/demand", icon: LineChart, ai: true },
  { key: "inventory", label: "Inventory", href: "/dashboard/inventory", icon: Boxes, ai: true },
  { key: "staff", label: "Staff", href: "/dashboard/staff", icon: Users },
  { key: "alerts", label: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { key: "integrations", label: "Integrations", href: "/dashboard/integrations", icon: Plug },
  { key: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["super_admin", "tenant_admin"] },
];

/** Mobile bottom-nav: Overview, Revenue, Alerts, Settings (per spec). */
export const MOBILE_NAV_KEYS: ModuleKey[] = ["overview", "revenue", "alerts", "settings"];
