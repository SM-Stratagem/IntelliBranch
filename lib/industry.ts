import type { IndustryType, ModuleKey } from "./types";

/**
 * Per-industry vocabulary + defaults. The dashboard reads `terms` to relabel
 * generic concepts (a "Transaction" becomes a "Cover" for F&B, an
 * "Appointment" for healthcare, a "Job" for logistics, etc).
 */
export type IndustryTerms = {
  /** singular + plural for the core sale/visit unit */
  transaction: string;
  transactions: string;
  /** the per-transaction average, e.g. "Avg Transaction" / "Avg Cover" */
  avgTransaction: string;
  /** a single site */
  branch: string;
  branches: string;
  /** the basket / order */
  basket: string;
  /** the headline secondary KPI label shown on Overview */
  primaryKpi: string;
};

type IndustryMeta = {
  label: string;
  terms: IndustryTerms;
  /** Modules surfaced by default when a tenant of this industry is created. */
  defaultModules: ModuleKey[];
  /** Short note describing the industry-specific module emphasis. */
  emphasis: string;
};

const ALL: ModuleKey[] = [
  "overview", "revenue", "pnl", "heatmap", "branches", "forecast",
  "whatif", "inventory", "staff", "alerts", "integrations", "settings",
];

export const INDUSTRY: Record<IndustryType, IndustryMeta> = {
  retail: {
    label: "Retail",
    emphasis: "Inventory ageing, basket size & markdown optimisation",
    terms: { transaction: "Transaction", transactions: "Transactions", avgTransaction: "Avg Basket", branch: "Store", branches: "Stores", basket: "Basket", primaryKpi: "Avg Basket" },
    defaultModules: ALL,
  },
  fnb: {
    label: "Food & Beverage",
    emphasis: "Covers, waste tracking & labour cost per cover",
    terms: { transaction: "Cover", transactions: "Covers", avgTransaction: "Avg Cover", branch: "Outlet", branches: "Outlets", basket: "Check", primaryKpi: "Avg Cover" },
    defaultModules: ALL,
  },
  healthcare: {
    label: "Healthcare",
    emphasis: "Appointment utilisation & compliance reporting",
    terms: { transaction: "Appointment", transactions: "Appointments", avgTransaction: "Avg Charge", branch: "Clinic", branches: "Clinics", basket: "Visit", primaryKpi: "Utilisation" },
    defaultModules: ALL,
  },
  automotive: {
    label: "Automotive",
    emphasis: "Service-bay utilisation & parts inventory",
    terms: { transaction: "Job", transactions: "Jobs", avgTransaction: "Avg Job Value", branch: "Service Centre", branches: "Service Centres", basket: "Work Order", primaryKpi: "Bay Utilisation" },
    defaultModules: ALL,
  },
  hospitality: {
    label: "Hospitality",
    emphasis: "RevPAR & occupancy as primary KPIs",
    terms: { transaction: "Booking", transactions: "Bookings", avgTransaction: "ADR", branch: "Property", branches: "Properties", basket: "Folio", primaryKpi: "RevPAR" },
    defaultModules: ALL,
  },
  fitness: {
    label: "Fitness & Wellness",
    emphasis: "Membership utilisation & class fill rates",
    terms: { transaction: "Check-in", transactions: "Check-ins", avgTransaction: "Avg Spend", branch: "Club", branches: "Clubs", basket: "Visit", primaryKpi: "Utilisation" },
    defaultModules: ALL,
  },
  education: {
    label: "Education",
    emphasis: "Enrolment trends & facility utilisation",
    terms: { transaction: "Enrolment", transactions: "Enrolments", avgTransaction: "Avg Fee", branch: "Campus", branches: "Campuses", basket: "Programme", primaryKpi: "Utilisation" },
    defaultModules: ALL,
  },
  franchise: {
    label: "Franchise",
    emphasis: "Franchisee dashboards with HQ oversight & royalties",
    terms: { transaction: "Transaction", transactions: "Transactions", avgTransaction: "Avg Ticket", branch: "Franchise", branches: "Franchises", basket: "Order", primaryKpi: "Royalty Base" },
    defaultModules: ALL,
  },
  logistics: {
    label: "Logistics & Field Ops",
    emphasis: "Route performance & cost-per-job tracking",
    terms: { transaction: "Job", transactions: "Jobs", avgTransaction: "Cost / Job", branch: "Depot", branches: "Depots", basket: "Route", primaryKpi: "SLA Adherence" },
    defaultModules: ALL,
  },
};

export function terms(industry: IndustryType): IndustryTerms {
  return INDUSTRY[industry].terms;
}
