import type {
  Alert, AlertSeverity, AlertType, Branch, CategoryBreakdown, COGSBreakdown, DailyPoint,
  ForecastPoint, Integration, KPISummary, PaymentMix, ReorderRecommendation, SKU,
  SKUForecastPoint, SKUMaterialCostPeriod, StaffMember, TenantConfig,
} from "./types";
import { getBranches, getTenantById } from "./tenants";
import { TODAY, MONTHS } from "./format";

// ============================================================================
// Deterministic mock data layer.
//
// Every generator is pure and seeded from stable inputs (tenant/branch id +
// date), so the SAME values are produced on the server and the client — no
// hydration mismatches — and the dashboard looks coherent across modules.
//
// To go live, swap these functions for API/Prisma calls with the same
// signatures; no page component needs to change.
// ============================================================================

// ---- Seeded PRNG (mulberry32 + fnv1a string hash) --------------------------
function hashStr(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rng(seed: string) {
  const next = mulberry32(hashStr(seed));
  return {
    next,
    float: (min: number, max: number) => min + next() * (max - min),
    int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
    pick: <T>(arr: T[]): T => arr[Math.floor(next() * arr.length)],
  };
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86400_000);
}
function addMonths(d: Date, n: number): Date {
  const x = new Date(d.getTime());
  x.setUTCMonth(x.getUTCMonth() + n);
  return x;
}
function shortLabel(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

// ---- Industry revenue envelopes (per-branch daily revenue range) -----------
const REVENUE_BAND: Record<string, [number, number]> = {
  retail: [5000, 50000],
  fnb: [3000, 25000],
  healthcare: [8000, 45000],
  automotive: [6000, 38000],
  hospitality: [12000, 80000],
  fitness: [2500, 18000],
  education: [4000, 30000],
  franchise: [4000, 28000],
  logistics: [7000, 42000],
};

// Day-of-week multipliers (Sun..Sat) — weekends busier for most consumer biz.
const DOW_WEIGHT = [1.18, 0.82, 0.86, 0.9, 0.98, 1.22, 1.3];

/**
 * Generate a realistic daily time-series for one branch over `days` ending at
 * TODAY. Revenue blends: branch base × day-of-week seasonality × linear trend
 * × bounded noise, with COGS/expenses/staff derived at believable ratios.
 */
export function generateBranchData(branchId: string, days = 90): DailyPoint[] {
  const tenantId = branchId.split("_b")[0];
  const tenant = getTenantById(tenantId);
  const branch = getBranches(tenantId).find((b) => b.id === branchId);
  const industry = tenant?.industry ?? "retail";
  const [lo, hi] = REVENUE_BAND[industry] ?? REVENUE_BAND.retail;
  const scale = branch?.scale ?? 1;
  const trend = branch?.trend ?? 0;

  const base = lo + (hi - lo) * 0.45 * scale; // mid-band, scaled by branch size
  const r = rng(`${branchId}:series`);
  const out: DailyPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(TODAY, -i);
    const dow = date.getUTCDay();
    const progress = (days - 1 - i) / (days - 1 || 1); // 0 → 1 across window
    const trendMul = 1 + trend * progress;
    const noise = 0.85 + r.next() * 0.3; // ±15%
    // Light monthly payday bump around the 1st and 25th-28th of the month.
    const dom = date.getUTCDate();
    const payday = dom <= 3 || (dom >= 25 && dom <= 28) ? 1.08 : 1;

    const revenue = Math.round(base * DOW_WEIGHT[dow] * trendMul * noise * payday);
    const cogsPct = 0.34 + r.next() * 0.08; // 34–42%
    const cogs = Math.round(revenue * cogsPct);
    const grossProfit = revenue - cogs;
    const staffCost = Math.round(revenue * (0.16 + r.next() * 0.06));
    const otherExp = Math.round(revenue * (0.12 + r.next() * 0.05));
    const expenses = staffCost + otherExp;
    const netProfit = grossProfit - expenses;
    const avgBand = industry === "hospitality" ? [180, 420] : industry === "fnb" ? [28, 75] : [45, 260];
    const avgTransaction = Math.round(r.float(avgBand[0], avgBand[1]));
    const transactions = Math.max(1, Math.round(revenue / avgTransaction));

    out.push({
      date: isoDay(date),
      revenue,
      cogs,
      expenses,
      grossProfit,
      netProfit,
      transactions,
      customers: Math.round(transactions * r.float(0.8, 1)),
      avgTransaction,
      staffCost,
    });
  }
  return out;
}

/** Sum daily series across every (or selected) branch of a tenant. */
export function generatePortfolioSeries(tenantId: string, days = 90, branchIds?: string[]): DailyPoint[] {
  const branches = getBranches(tenantId).filter((b) => !branchIds || branchIds.includes(b.id));
  const perBranch = branches.map((b) => generateBranchData(b.id, days));
  if (perBranch.length === 0) return [];
  const len = perBranch[0].length;
  const merged: DailyPoint[] = [];
  for (let i = 0; i < len; i++) {
    const agg: DailyPoint = {
      date: perBranch[0][i].date,
      revenue: 0, cogs: 0, expenses: 0, grossProfit: 0, netProfit: 0,
      transactions: 0, customers: 0, avgTransaction: 0, staffCost: 0,
    };
    for (const series of perBranch) {
      const p = series[i];
      agg.revenue += p.revenue; agg.cogs += p.cogs; agg.expenses += p.expenses;
      agg.grossProfit += p.grossProfit; agg.netProfit += p.netProfit;
      agg.transactions += p.transactions; agg.customers += p.customers; agg.staffCost += p.staffCost;
    }
    agg.avgTransaction = agg.transactions ? Math.round(agg.revenue / agg.transactions) : 0;
    merged.push(agg);
  }
  return merged;
}

function pctDelta(curr: number, prev: number): number {
  if (!prev) return 0;
  return ((curr - prev) / prev) * 100;
}

/** KPI summary for the Overview header. `branchIds` optionally scopes it. */
export function generateKPIs(tenantId: string, branchIds?: string[]): KPISummary {
  const series = generatePortfolioSeries(tenantId, 60, branchIds);
  const period = series.slice(-30);
  const prior = series.slice(-60, -30);
  const sum = (arr: DailyPoint[], k: keyof DailyPoint) =>
    arr.reduce((a, p) => a + (p[k] as number), 0);

  const revenue = sum(period, "revenue");
  const priorRevenue = sum(prior, "revenue");
  const gp = sum(period, "grossProfit");
  const priorGp = sum(prior, "grossProfit");
  const margin = revenue ? (gp / revenue) * 100 : 0;
  const priorMargin = priorRevenue ? (priorGp / priorRevenue) * 100 : 0;
  const txns = sum(period, "transactions");
  const priorTxns = sum(prior, "transactions");
  const avg = txns ? revenue / txns : 0;
  const priorAvg = priorTxns ? priorRevenue / priorTxns : 0;

  // Per-branch ranking over the same window.
  const branchTotals = getBranches(tenantId)
    .filter((b) => !branchIds || branchIds.includes(b.id))
    .map((b) => {
      const s = generateBranchData(b.id, 60).slice(-30);
      const rev = s.reduce((a, p) => a + p.revenue, 0);
      const prevRev = generateBranchData(b.id, 60).slice(-60, -30).reduce((a, p) => a + p.revenue, 0);
      return { id: b.id, name: b.name, revenue: rev, delta: pctDelta(rev, prevRev) };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const best = period.reduce((a, p) => (p.revenue > a.revenue ? p : a), period[0]);

  return {
    revenue,
    revenueDelta: pctDelta(revenue, priorRevenue),
    margin,
    marginDelta: margin - priorMargin,
    avgTransaction: avg,
    avgTransactionDelta: pctDelta(avg, priorAvg),
    transactions: txns,
    transactionsDelta: pctDelta(txns, priorTxns),
    topBranch: branchTotals[0] ?? { id: "", name: "—", revenue: 0 },
    worstBranch: branchTotals[branchTotals.length - 1] ?? { id: "", name: "—", revenue: 0, delta: 0 },
    bestDay: { date: best?.date ?? "", revenue: best?.revenue ?? 0 },
  };
}

// ---- Revenue breakdowns ----------------------------------------------------
const CATEGORY_SETS: Record<string, string[]> = {
  retail: ["Apparel", "Footwear", "Accessories", "Beauty", "Home"],
  fnb: ["Mains", "Beverages", "Desserts", "Starters", "Delivery"],
  healthcare: ["Consultations", "Diagnostics", "Procedures", "Pharmacy", "Dental"],
  automotive: ["Servicing", "Parts", "Tyres", "Bodywork", "Diagnostics"],
  hospitality: ["Rooms", "F&B", "Events", "Spa", "Parking"],
  fitness: ["Memberships", "Personal Training", "Classes", "Retail", "Café"],
  education: ["Tuition", "Exams", "Materials", "Workshops", "Boarding"],
  franchise: ["In-store", "Online", "Wholesale", "Services", "Licensing"],
  logistics: ["Express", "Standard", "Freight", "Storage", "Returns"],
};

export function generateCategoryBreakdown(tenantId: string, branchIds?: string[]): CategoryBreakdown[] {
  const tenant = getTenantById(tenantId);
  const cats = CATEGORY_SETS[tenant?.industry ?? "retail"];
  const total = generatePortfolioSeries(tenantId, 30, branchIds).reduce((a, p) => a + p.revenue, 0);
  const r = rng(`${tenantId}:cats`);
  const weights = cats.map(() => r.float(0.4, 1));
  const wsum = weights.reduce((a, b) => a + b, 0);
  return cats.map((name, i) => ({
    name,
    revenue: Math.round((total * weights[i]) / wsum),
    margin: Math.round(r.float(38, 68)),
  }));
}

export function generatePaymentMix(tenantId: string, branchIds?: string[]): PaymentMix[] {
  const total = generatePortfolioSeries(tenantId, 30, branchIds).reduce((a, p) => a + p.revenue, 0);
  const r = rng(`${tenantId}:pay`);
  const methods = ["Card", "Cash", "Digital Wallet", "BNPL", "Gift Card"];
  const weights = [r.float(0.45, 0.6), r.float(0.12, 0.22), r.float(0.12, 0.2), r.float(0.04, 0.1), r.float(0.02, 0.05)];
  const wsum = weights.reduce((a, b) => a + b, 0);
  return methods.map((method, i) => ({ method, amount: Math.round((total * weights[i]) / wsum) }));
}

// ---- Heatmap (day × hour intensity) ---------------------------------------
/** 7×24 grid of revenue intensity. Rows = days (Sun..Sat), cols = hours. */
export function generateHeatmap(branchId: string): number[][] {
  const r = rng(`${branchId}:heat`);
  const grid: number[][] = [];
  // Bimodal trading curve: lunch + evening peaks, dead overnight.
  const hourCurve = (h: number) => {
    const lunch = Math.exp(-((h - 13) ** 2) / 8);
    const dinner = Math.exp(-((h - 19) ** 2) / 6);
    const morning = Math.exp(-((h - 10) ** 2) / 14) * 0.6;
    return Math.max(0.02, lunch * 0.8 + dinner + morning);
  };
  for (let d = 0; d < 7; d++) {
    const dayMul = DOW_WEIGHT[d];
    const row: number[] = [];
    for (let h = 0; h < 24; h++) {
      const v = hourCurve(h) * dayMul * (0.8 + r.next() * 0.4);
      row.push(Math.round(v * 1000));
    }
    grid.push(row);
  }
  return grid;
}

// ---- Forecast --------------------------------------------------------------
/** Forecast continuing the branch trend with a widening confidence band. */
export function generateForecast(branchId: string, days = 30): ForecastPoint[] {
  const history = generateBranchData(branchId, 30);
  const r = rng(`${branchId}:fc`);
  const recentAvg = history.slice(-14).reduce((a, p) => a + p.revenue, 0) / 14;
  const tenantId = branchId.split("_b")[0];
  const trend = getBranches(tenantId).find((b) => b.id === branchId)?.trend ?? 0;

  const out: ForecastPoint[] = [];
  // Tail of actuals for context (last 14 days), then forward forecast.
  for (const p of history.slice(-14)) {
    out.push({ date: p.date, actual: p.revenue, predicted: p.revenue, lower: p.revenue, upper: p.revenue });
  }
  for (let i = 1; i <= days; i++) {
    const date = addDays(TODAY, i);
    const dow = date.getUTCDay();
    const drift = 1 + (trend / 30) * i;
    const predicted = Math.round(recentAvg * DOW_WEIGHT[dow] * drift * (0.97 + r.next() * 0.06));
    const bandWidth = 0.04 + (i / days) * 0.16; // band widens with horizon
    out.push({
      date: isoDay(date),
      actual: null,
      predicted,
      lower: Math.round(predicted * (1 - bandWidth)),
      upper: Math.round(predicted * (1 + bandWidth)),
    });
  }
  return out;
}

// ---- Alerts ----------------------------------------------------------------
const ALERT_TEMPLATES: { type: AlertType; severity: AlertSeverity; title: string; metric: string; msg: (b: string) => string }[] = [
  { type: "revenue_drop", severity: "critical", title: "Revenue drop detected", metric: "Revenue", msg: (b) => `${b} revenue fell sharply versus its 30-day baseline.` },
  { type: "margin_erosion", severity: "warning", title: "Margin erosion", metric: "Gross Margin", msg: (b) => `Gross margin at ${b} is trending below target for 5 consecutive days.` },
  { type: "stock_threshold", severity: "critical", title: "Stock below threshold", metric: "Days of Stock", msg: (b) => `${b} has 3 SKUs projected to stock out within 48 hours.` },
  { type: "staff_anomaly", severity: "warning", title: "Staffing anomaly", metric: "Labour %", msg: (b) => `Labour cost % at ${b} exceeded the optimal band during peak hours.` },
  { type: "forecast_deviation", severity: "info", title: "Forecast deviation", metric: "Forecast", msg: (b) => `${b} is tracking 8% above its forecast this week.` },
  { type: "stock_threshold", severity: "warning", title: "Ageing inventory", metric: "Stock Age", msg: (b) => `Slow-moving stock detected at ${b} — markdown review recommended.` },
  { type: "revenue_drop", severity: "info", title: "Weekend softness", metric: "Revenue", msg: (b) => `${b} weekend revenue is slightly below the portfolio average.` },
];

export function generateAlerts(tenantId: string, branchIds?: string[]): Alert[] {
  const branches = getBranches(tenantId).filter((b) => !branchIds || branchIds.includes(b.id));
  const r = rng(`${tenantId}:alerts`);
  const out: Alert[] = [];
  const count = Math.min(14, branches.length * 2 + 4);
  for (let i = 0; i < count; i++) {
    const tpl = ALERT_TEMPLATES[i % ALERT_TEMPLATES.length];
    const branch = r.pick(branches);
    if (!branch) break;
    const hoursAgo = r.int(1, 30 * 24);
    const created = new Date(TODAY.getTime() + 14 * 3600_000 - hoursAgo * 3600_000);
    const valueText =
      tpl.metric === "Revenue" ? `${r.int(8, 24)}% below baseline`
      : tpl.metric === "Gross Margin" ? `${r.int(2, 6)}pts under target`
      : tpl.metric === "Days of Stock" ? `${r.int(1, 2)} days remaining`
      : tpl.metric === "Labour %" ? `${r.int(31, 39)}% of revenue`
      : `${r.int(5, 12)}% variance`;
    const status = i < 3 ? "unread" : r.pick(["read", "unread", "resolved", "snoozed"] as const);
    out.push({
      id: `${tenantId}_al${i + 1}`,
      tenantId,
      branchId: branch.id,
      branchName: branch.name,
      type: tpl.type,
      severity: tpl.severity,
      title: tpl.title,
      message: tpl.msg(branch.name),
      metric: tpl.metric,
      value: valueText,
      createdAt: created.toISOString(),
      status,
    });
  }
  // Critical first, then warning, then info; newest within each.
  const sev = { critical: 0, warning: 1, info: 2 };
  return out.sort((a, b) => sev[a.severity] - sev[b.severity] || b.createdAt.localeCompare(a.createdAt));
}

// ---- Inventory -------------------------------------------------------------
const SUPPLIER_POOL = [
  "Meridian Supply Co", "Apex Sourcing", "BlueHarbor Trading", "Lumea Distributors",
  "Vantage Wholesale", "NorthGate Imports", "Crestline Partners", "Solvent & Co",
];

export function generateInventory(tenantId: string): SKU[] {
  const tenant = getTenantById(tenantId);
  const cats = CATEGORY_SETS[tenant?.industry ?? "retail"];
  const branches = getBranches(tenantId);
  const r = rng(`${tenantId}:inv`);
  const out: SKU[] = [];
  for (let i = 0; i < 28; i++) {
    const category = r.pick(cats);
    const dailyVelocity = +r.float(0.3, 24).toFixed(1);
    const stock = r.int(0, 600);
    const daysRemaining = dailyVelocity > 0 ? Math.round(stock / dailyVelocity) : 999;
    const reorderPoint = Math.round(dailyVelocity * 7);
    const unitCost = +r.float(4, 240).toFixed(2);

    let status: SKU["status"] = "healthy";
    if (dailyVelocity < 1.2 && stock > 120) status = "dead";
    else if (daysRemaining <= 2) status = "critical";
    else if (stock <= reorderPoint) status = "low";
    else if (daysRemaining <= 10) status = "watch";
    else if (daysRemaining > 75) status = "overstocked";

    // Branch & supplier assignment (deterministic).
    const branch = branches.length ? branches[i % branches.length] : undefined;
    const branchId = branch?.id ?? `${tenantId}-HQ`;
    const branchName = branch?.name ?? "Head Office";
    const supplierName = SUPPLIER_POOL[i % SUPPLIER_POOL.length];
    const supplierId = `SUP-${100 + (i % SUPPLIER_POOL.length)}`;

    // Stock position.
    const stockOnHand = stock;
    const stockOnOrder = status === "low" || status === "critical" ? r.int(0, reorderPoint) : r.int(0, Math.round(reorderPoint / 2));
    const reservedStock = Math.min(stockOnHand, r.int(0, Math.round(dailyVelocity * 2)));
    const availableStock = stockOnHand + stockOnOrder - reservedStock;

    // Lead time.
    const leadTimeDays = r.int(2, 45);
    const leadTimeVariabilityDays = r.int(0, Math.max(1, Math.round(leadTimeDays * 0.3)));
    const safetyStock = Math.round(dailyVelocity * leadTimeVariabilityDays + dailyVelocity * 3);

    // Demand forecast.
    const fcNoise7 = r.float(0.85, 1.18);
    const fcNoise30 = r.float(0.85, 1.18);
    const forecastDemand7d = Math.round(dailyVelocity * 7 * fcNoise7);
    const forecastDemand30d = Math.round(dailyVelocity * 30 * fcNoise30);
    const fcBand = r.float(0.12, 0.3);
    const forecastLower30d = Math.round(forecastDemand30d * (1 - fcBand));
    const forecastUpper30d = Math.round(forecastDemand30d * (1 + fcBand));
    const forecastConfidence = +r.float(0.55, 0.95).toFixed(2);

    // Reorder planning.
    const stockoutInDays = dailyVelocity > 0 ? Math.round(availableStock / dailyVelocity) : 999;
    const expectedStockoutDate = isoDay(addDays(TODAY, Math.min(stockoutInDays, 365)));
    const demandDuringLeadTime = Math.round(dailyVelocity * leadTimeDays);
    const recommendedOrderQty = Math.max(0, demandDuringLeadTime + safetyStock - availableStock);
    const recommendedOrderDate = isoDay(addDays(TODAY, Math.max(0, Math.min(stockoutInDays - leadTimeDays, 365))));

    // Margin / cost economics.
    const grossMarginPct = +r.float(18, 62).toFixed(1);
    const sellingPrice = +(unitCost / (1 - grossMarginPct / 100)).toFixed(2);
    const unitCostTrendPct = +r.float(-8, 12).toFixed(1);

    out.push({
      id: `SKU-${1000 + i}`,
      name: `${category} Line ${String.fromCharCode(65 + (i % 26))}${i}`,
      category,
      stock,
      reorderPoint,
      dailyVelocity,
      daysRemaining,
      unitCost,
      status,
      tenantId,
      branchId,
      branchName,
      supplierId,
      supplierName,
      stockOnHand,
      stockOnOrder,
      reservedStock,
      availableStock,
      safetyStock,
      leadTimeDays,
      leadTimeVariabilityDays,
      forecastDemand7d,
      forecastDemand30d,
      forecastLower30d,
      forecastUpper30d,
      forecastConfidence,
      expectedStockoutDate,
      recommendedOrderQty,
      recommendedOrderDate,
      sellingPrice,
      grossMarginPct,
      unitCostTrendPct,
    });
  }
  return out.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

// ---- SKU-level demand forecasting -----------------------------------------
// Per-day demand multipliers by weekday (Sun…Sat) — light retail-style weekly
// seasonality. The forecast generator is the single source of truth: both the
// Demand page chart AND the reorder math read from it, so numbers stay aligned.
const WEEKLY_DEMAND = [0.82, 0.95, 0.98, 1.04, 1.12, 1.28, 1.06];

/** A branch's share of a SKU's tenant-wide demand, from its scale weight. */
function branchDemandShare(sku: SKU, scope: string): number {
  if (scope === "all") return 1;
  const branches = getBranches(sku.tenantId);
  const total = branches.reduce((a, b) => a + b.scale, 0) || 1;
  const b = branches.find((x) => x.id === scope);
  return b ? b.scale / total : 1;
}

/**
 * Forecast a single SKU's unit demand: 14 days of "actuals" up to TODAY, then
 * `horizon` days forward. Scope is a branch id or "all" (tenant-wide). Model =
 * velocity × branch share × weekly seasonality × gentle trend, with a band that
 * widens further into the future. Deterministic, seeded per (sku, scope, date).
 */
export function generateSKUForecast(sku: SKU, scope = "all", horizon = 30): SKUForecastPoint[] {
  const share = branchDemandShare(sku, scope);
  const branchId = scope === "all" ? "all" : scope;
  const out: SKUForecastPoint[] = [];
  const HISTORY = 14;
  for (let d = -HISTORY; d <= horizon; d++) {
    const date = addDays(TODAY, d);
    const iso = isoDay(date);
    const r = rng(`${sku.id}:${scope}:${iso}`);
    const weekly = WEEKLY_DEMAND[date.getUTCDay()];
    const trendFactor = 1 + (d / 365) * 0.6;
    const baseline = sku.dailyVelocity * share * weekly * trendFactor;
    const predictedUnits = Math.max(0, Math.round(baseline * r.float(0.93, 1.07)));
    const isFuture = d > 0;
    const bandPct = Math.min(0.35, 0.08 + Math.max(0, d) * 0.005);
    out.push({
      date: iso,
      skuId: sku.id,
      skuName: sku.name,
      branchId,
      actualUnits: isFuture ? null : Math.max(0, Math.round(baseline * r.float(0.86, 1.14))),
      predictedUnits,
      lowerUnits: Math.max(0, Math.round(predictedUnits * (1 - bandPct))),
      upperUnits: Math.round(predictedUnits * (1 + bandPct)),
    });
  }
  return out;
}

// ---- Lead-time-aware reorder planning -------------------------------------
const URGENCY_RANK = { critical: 0, high: 1, medium: 2, low: 3 } as const;

/**
 * Reorder recommendations derived from the SKU position + demand forecast:
 * order qty = forecast demand over the lead time + safety stock − available
 * stock. Urgency reflects whether replenishment can land before stockout. Only
 * SKUs that actually need an order are returned, most urgent first.
 */
export function generateReorderRecommendations(tenantId: string, branchIds?: string[]): ReorderRecommendation[] {
  const skus = generateInventory(tenantId);
  const tenant = getTenantById(tenantId);
  const out: ReorderRecommendation[] = [];

  for (const sku of skus) {
    if (branchIds && !branchIds.includes(sku.branchId)) continue;

    // Use the SKU's full demand ("all") — its stock/velocity fields are already
    // its own totals, so a branch-share fraction here would understate demand.
    const fc = generateSKUForecast(sku, "all", sku.leadTimeDays);
    const future = fc.filter((p) => p.actualUnits === null).slice(0, sku.leadTimeDays);
    const forecastDemandDuringLeadTime = Math.round(future.reduce((a, p) => a + p.predictedUnits, 0));
    const recommendedOrderQty = Math.max(0, forecastDemandDuringLeadTime + sku.safetyStock - sku.availableStock);
    if (recommendedOrderQty <= 0) continue;

    const daysToStockout = sku.dailyVelocity > 0 ? Math.round(sku.availableStock / sku.dailyVelocity) : 999;
    let urgency: ReorderRecommendation["urgency"] = "low";
    if (daysToStockout <= sku.leadTimeDays) urgency = "critical"; // can't arrive in time
    else if (sku.status === "critical") urgency = "high";
    else if (sku.status === "low" || sku.status === "watch") urgency = "medium";

    // Financial impact = margin lost if the shortfall stocks out before replenishment.
    const shortfall = Math.max(0, forecastDemandDuringLeadTime - sku.availableStock);
    const financialImpact = Math.round(shortfall * Math.max(0, sku.sellingPrice - sku.unitCost));

    out.push({
      id: `RO-${sku.id}`,
      tenantId,
      branchId: sku.branchId,
      branchName: sku.branchName,
      skuId: sku.id,
      skuName: sku.name,
      supplierId: sku.supplierId,
      supplierName: sku.supplierName,
      currentStock: sku.stockOnHand,
      availableStock: sku.availableStock,
      forecastDemandDuringLeadTime,
      leadTimeDays: sku.leadTimeDays,
      safetyStock: sku.safetyStock,
      recommendedOrderQty,
      recommendedOrderDate: sku.recommendedOrderDate,
      expectedStockoutDate: sku.expectedStockoutDate,
      urgency,
      financialImpact,
      rationale:
        `${sku.availableStock} available vs ~${forecastDemandDuringLeadTime} forecast over the ${sku.leadTimeDays}-day ` +
        `${sku.supplierName} lead time (±${sku.leadTimeVariabilityDays}d). Order ${recommendedOrderQty} ` +
        `(incl. ${sku.safetyStock} safety stock) to avoid a stockout around ${sku.expectedStockoutDate}.`,
    });
  }

  void tenant; // currency handled by the page's money() formatter
  return out.sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] || b.financialImpact - a.financialImpact);
}

// ---- SKU-level material cost over time (COGS) -----------------------------
// Proportional split of landed unit cost into its components. Each varies a
// little per period; raw material also drifts with the SKU's cost trend.
const COST_SPLIT = {
  rawMaterial: 0.62,
  freight: 0.12,
  duty: 0.07,
  packaging: 0.06,
  surcharge: 0.05,
  wastage: 0.04,
};

/**
 * Per-SKU material cost broken down by period (weekly or monthly), ending at
 * TODAY. Component costs vary deterministically period-to-period and the base
 * drifts by the SKU's `unitCostTrendPct`, so cost trends are visible over time.
 */
export function generateSKUMaterialCostPeriods(
  sku: SKU,
  periodType: "week" | "month" = "month",
  count = 6
): SKUMaterialCostPeriod[] {
  const tenant = getTenantById(sku.tenantId);
  const currency = tenant?.currency ?? "USD";
  const trend = sku.unitCostTrendPct / 100;
  const span = periodType === "month" ? 12 : 52; // periods/year for the drift scale
  const out: SKUMaterialCostPeriod[] = [];
  let prevClosing = 0;

  for (let p = count - 1; p >= 0; p--) {
    const start = periodType === "month" ? addMonths(TODAY, -p) : addDays(TODAY, -p * 7);
    const period = periodType === "month" ? `${MONTHS[start.getUTCMonth()]} '${String(start.getUTCFullYear()).slice(2)}` : `wk ${shortLabel(start)}`;
    const r = rng(`${sku.id}:cost:${periodType}:${p}`);

    // Base cost as it was `p` periods ago: today's cost rolled back along the trend.
    const baseCost = sku.unitCost * (1 - trend * (p / span));
    const comp = (ratio: number, lo: number, hi: number) => +(baseCost * ratio * r.float(lo, hi)).toFixed(2);
    const rawMaterialCost = comp(COST_SPLIT.rawMaterial, 0.96, 1.04);
    const freightCost = comp(COST_SPLIT.freight, 0.85, 1.2);
    const dutyCost = comp(COST_SPLIT.duty, 0.92, 1.1);
    const packagingCost = comp(COST_SPLIT.packaging, 0.95, 1.08);
    const supplierSurcharge = comp(COST_SPLIT.surcharge, 0.8, 1.25);
    const wastageCost = comp(COST_SPLIT.wastage, 0.7, 1.3);
    const landedUnitCost = +(rawMaterialCost + freightCost + dutyCost + packagingCost + supplierSurcharge + wastageCost).toFixed(2);
    const openingUnitCost = prevClosing || +(landedUnitCost * 0.98).toFixed(2);
    prevClosing = landedUnitCost;

    out.push({
      skuId: sku.id,
      skuName: sku.name,
      supplierId: sku.supplierId,
      supplierName: sku.supplierName,
      period,
      periodType,
      openingUnitCost,
      closingUnitCost: landedUnitCost,
      averageUnitCost: +((openingUnitCost + landedUnitCost) / 2).toFixed(2),
      landedUnitCost,
      rawMaterialCost,
      freightCost,
      dutyCost,
      packagingCost,
      supplierSurcharge,
      wastageCost,
      currency,
    });
  }
  return out;
}

/**
 * Tenant (optionally branch) COGS breakdown for a 30-day window: revenue, total
 * COGS split into cost components, gross profit, and per-SKU economics. Built
 * from the same SKU set so it reconciles with the inventory + cost views.
 */
export function generateCOGSBreakdown(tenantId: string, branchId?: string, period = "Last 30 days"): COGSBreakdown {
  const skus = generateInventory(tenantId).filter((s) => !branchId || s.branchId === branchId);
  const r = rng(`${tenantId}:${branchId ?? "all"}:cogs`);

  let revenue = 0, materialCost = 0, freightCost = 0, dutyCost = 0, packagingCost = 0, supplierSurcharge = 0, wastageCost = 0;
  const bySku = skus.map((sku) => {
    const unitsSold = Math.max(1, Math.round(sku.dailyVelocity * 30 * r.float(0.9, 1.1)));
    const skuRevenue = +(unitsSold * sku.sellingPrice).toFixed(2);
    const skuCogs = +(unitsSold * sku.unitCost).toFixed(2);
    revenue += skuRevenue;
    materialCost += skuCogs * COST_SPLIT.rawMaterial;
    freightCost += skuCogs * COST_SPLIT.freight;
    dutyCost += skuCogs * COST_SPLIT.duty;
    packagingCost += skuCogs * COST_SPLIT.packaging;
    supplierSurcharge += skuCogs * COST_SPLIT.surcharge;
    wastageCost += skuCogs * COST_SPLIT.wastage;
    return {
      skuId: sku.id,
      skuName: sku.name,
      category: sku.category,
      unitsSold,
      revenue: skuRevenue,
      cogs: skuCogs,
      grossMarginPct: skuRevenue ? +(((skuRevenue - skuCogs) / skuRevenue) * 100).toFixed(1) : 0,
      unitCost: sku.unitCost,
      costTrendPct: sku.unitCostTrendPct,
    };
  });

  const returnsWriteOffs = +(revenue * r.float(0.004, 0.012)).toFixed(0);
  const totalCogs = +(materialCost + freightCost + dutyCost + packagingCost + supplierSurcharge + wastageCost).toFixed(0);
  const grossProfit = +(revenue - totalCogs - returnsWriteOffs).toFixed(0);
  return {
    tenantId,
    branchId,
    period,
    revenue: +revenue.toFixed(0),
    totalCogs,
    materialCost: +materialCost.toFixed(0),
    freightCost: +freightCost.toFixed(0),
    dutyCost: +dutyCost.toFixed(0),
    packagingCost: +packagingCost.toFixed(0),
    supplierSurcharge: +supplierSurcharge.toFixed(0),
    wastageCost: +wastageCost.toFixed(0),
    returnsWriteOffs,
    grossProfit,
    grossMarginPct: revenue ? +((grossProfit / revenue) * 100).toFixed(1) : 0,
    bySku: bySku.sort((a, b) => b.revenue - a.revenue),
  };
}

// ---- Staff -----------------------------------------------------------------
const FIRST = ["Aisha", "Omar", "Mei", "Carlos", "Priya", "Liam", "Noor", "Hana", "Yusuf", "Elena", "Sam", "Dana", "Ravi", "Lina", "Tariq", "Zoe"];
const LAST = ["Khan", "Silva", "Chen", "Patel", "Adams", "Costa", "Haddad", "Ortega", "Singh", "Rossi", "Walsh", "Demir"];
const ROLES = ["Floor Lead", "Associate", "Cashier", "Specialist", "Supervisor", "Stock Lead"];

export function generateStaff(tenantId: string, branchIds?: string[]): StaffMember[] {
  const branches = getBranches(tenantId).filter((b) => !branchIds || branchIds.includes(b.id));
  const r = rng(`${tenantId}:staff`);
  const out: StaffMember[] = [];
  branches.forEach((b) => {
    const headcount = r.int(4, 8);
    for (let i = 0; i < headcount; i++) {
      out.push({
        id: `${b.id}_s${i}`,
        name: `${r.pick(FIRST)} ${r.pick(LAST)}`,
        role: r.pick(ROLES),
        branchId: b.id,
        branchName: b.name,
        revenuePerShift: r.int(1800, 9200),
        hoursThisWeek: r.int(18, 42),
        laborCostPct: +r.float(14, 34).toFixed(1),
        productivity: r.int(48, 99),
      });
    }
  });
  return out.sort((a, b) => b.productivity - a.productivity);
}

// ---- Integrations ----------------------------------------------------------
export function generateIntegrations(tenantId: string): Integration[] {
  const r = rng(`${tenantId}:int`);
  const catalogue: { name: string; category: Integration["category"] }[] = [
    { name: "Square POS", category: "POS" },
    { name: "Lightspeed", category: "POS" },
    { name: "SAP ERP", category: "ERP" },
    { name: "NetSuite", category: "ERP" },
    { name: "Cin7 Inventory", category: "Inventory" },
    { name: "BambooHR", category: "HR" },
    { name: "Xero", category: "Accounting" },
    { name: "Deliveroo", category: "Delivery" },
  ];
  const statuses: Integration["status"][] = ["live", "live", "live", "syncing", "error", "disconnected"];
  return catalogue.map((c, i) => {
    const status = i < 4 ? "live" : r.pick(statuses);
    const minsAgo = status === "live" ? r.int(1, 20) : status === "syncing" ? 0 : r.int(60, 2880);
    return {
      id: `${tenantId}_int${i}`,
      name: c.name,
      category: c.category,
      status,
      lastSync: new Date(TODAY.getTime() + 14 * 3600_000 - minsAgo * 60000).toISOString(),
      recordsToday: status === "live" || status === "syncing" ? r.int(120, 9800) : 0,
    };
  });
}

// ---- What-If P&L model -----------------------------------------------------
/** Apply scenario levers to a baseline monthly P&L and return projected P&L. */
export function applyScenario(
  baseline: { revenue: number; cogs: number; staffCost: number; otherExpenses: number },
  s: { priceChange: number; headcountChange: number; hoursChange: number; newLocation: boolean }
) {
  // Price changes lift revenue but dampen volume slightly (elasticity ~ -0.4).
  const priceMul = 1 + s.priceChange / 100;
  const volumeMul = 1 - (s.priceChange / 100) * 0.4 + s.hoursChange / 100 * 0.6;
  const locationMul = s.newLocation ? 1.18 : 1; // +1 site ≈ +18% portfolio

  const revenue = baseline.revenue * priceMul * volumeMul * locationMul;
  const cogs = baseline.cogs * volumeMul * locationMul;
  // Staff scales with headcount delta (assume ~6 staff/site baseline) + new site.
  const staffMul = (1 + s.headcountChange / 6) * (s.newLocation ? 1.18 : 1) * (1 + s.hoursChange / 100 * 0.5);
  const staffCost = baseline.staffCost * staffMul;
  const otherExpenses = baseline.otherExpenses * locationMul * (1 + s.hoursChange / 100 * 0.3);

  const grossProfit = revenue - cogs;
  const net = grossProfit - staffCost - otherExpenses;
  return {
    revenue: Math.round(revenue),
    cogs: Math.round(cogs),
    grossProfit: Math.round(grossProfit),
    staffCost: Math.round(staffCost),
    otherExpenses: Math.round(otherExpenses),
    net: Math.round(net),
    margin: revenue ? (grossProfit / revenue) * 100 : 0,
  };
}

/** Baseline monthly P&L for a tenant (last 30 days), used by What-If + P&L. */
export function monthlyBaseline(tenantId: string, branchIds?: string[]) {
  const series = generatePortfolioSeries(tenantId, 30, branchIds);
  const sum = (k: keyof DailyPoint) => series.reduce((a, p) => a + (p[k] as number), 0);
  const revenue = sum("revenue");
  const cogs = sum("cogs");
  const staffCost = sum("staffCost");
  const otherExpenses = sum("expenses") - staffCost;
  return { revenue, cogs, staffCost, otherExpenses };
}

export type { Branch, TenantConfig };
