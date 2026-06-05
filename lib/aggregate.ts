import type { DailyPoint } from "./types";
import { MONTHS } from "./format";

export type Granularity = "daily" | "weekly" | "monthly";

type Bucket = { label: string; revenue: number; grossProfit: number; netProfit: number; transactions: number };

/** Roll a daily series up into daily / weekly / monthly buckets for trend charts. */
export function bucketSeries(series: DailyPoint[], granularity: Granularity): Bucket[] {
  if (granularity === "daily") {
    return series.map((p) => {
      const d = new Date(p.date);
      return {
        label: `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`,
        revenue: p.revenue,
        grossProfit: p.grossProfit,
        netProfit: p.netProfit,
        transactions: p.transactions,
      };
    });
  }

  const map = new Map<string, Bucket & { sort: number }>();
  series.forEach((p, i) => {
    const d = new Date(p.date);
    let key: string;
    let label: string;
    let sort: number;
    if (granularity === "weekly") {
      const week = Math.floor(i / 7);
      key = `w${week}`;
      label = `W${week + 1}`;
      sort = week;
    } else {
      key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      label = `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`;
      sort = d.getUTCFullYear() * 12 + d.getUTCMonth();
    }
    const cur = map.get(key) ?? { label, revenue: 0, grossProfit: 0, netProfit: 0, transactions: 0, sort };
    cur.revenue += p.revenue;
    cur.grossProfit += p.grossProfit;
    cur.netProfit += p.netProfit;
    cur.transactions += p.transactions;
    map.set(key, cur);
  });
  return [...map.values()].sort((a, b) => a.sort - b.sort).map(({ sort, ...rest }) => rest);
}

/** Trigger a client-side CSV download from an array of row objects. */
export function downloadCSV(filename: string, rows: Record<string, string | number>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
