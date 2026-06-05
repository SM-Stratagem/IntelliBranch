import type { TenantConfig } from "./types";

/** The whole mock layer is anchored to a fixed "today" so server and client
 *  render identical deterministic data (no hydration drift). */
export const TODAY = new Date("2026-06-03T00:00:00Z");

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  AED: "AED ",
  GBP: "£",
  EUR: "€",
  SAR: "SAR ",
};

export function currencySymbol(currency: string): string {
  return CURRENCY_SYMBOL[currency] ?? `${currency} `;
}

/** Format a money value with the tenant's currency, compacting large numbers. */
export function formatCurrency(
  value: number,
  currency = "USD",
  opts: { compact?: boolean; decimals?: number } = {}
): string {
  const sym = currencySymbol(currency);
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  if (opts.compact && abs >= 1000) {
    if (abs >= 1_000_000) return `${sign}${sym}${(abs / 1_000_000).toFixed(1)}M`;
    return `${sign}${sym}${(abs / 1000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  }
  const decimals = opts.decimals ?? 0;
  return `${sign}${sym}${abs.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number, decimals = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/** Format an ISO date string per the tenant's preferred format. */
export function formatDate(iso: string, tenant?: Pick<TenantConfig, "dateFormat">): string {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return tenant?.dateFormat === "MM/DD/YYYY" ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`;
}

/** "Mon 03 Jun" style short label for chart axes. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export function dayName(iso: string): string {
  return DAYS[new Date(iso).getUTCDay()];
}

/** "3 hours ago" style relative time, anchored to TODAY. */
export function relativeTime(iso: string): string {
  const diffMs = TODAY.getTime() + 14 * 3600_000 - new Date(iso).getTime(); // anchor at 2pm "now"
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export { MONTHS, DAYS };
