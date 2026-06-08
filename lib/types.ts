// ============================================================================
// IntelliBranch — shared domain types
// ============================================================================

export type IndustryType =
  | "retail"
  | "fnb"
  | "healthcare"
  | "automotive"
  | "hospitality"
  | "fitness"
  | "education"
  | "franchise"
  | "logistics";

export type UserRole =
  | "super_admin" // SM Stratagem — can access all tenants
  | "tenant_admin" // Client HQ — sees all their branches
  | "branch_manager" // Sees only their assigned branch(es)
  | "franchisee" // Sees only their franchise locations
  | "viewer"; // Read-only, no exports

/** Module keys map 1:1 to dashboard routes under /dashboard. */
export type ModuleKey =
  | "overview"
  | "revenue"
  | "pnl"
  | "heatmap"
  | "branches"
  | "forecast"
  | "demand"
  | "whatif"
  | "inventory"
  | "staff"
  | "alerts"
  | "integrations"
  | "settings";

export type TenantConfig = {
  id: string;
  slug: string; // used in URL: app.intellibranch.io/[slug]
  name: string; // company name shown in dashboard
  productName: string; // e.g. "BranchIQ" if they white-label it
  logoUrl: string; // their logo (we render an initials mark when absent)
  faviconUrl: string;
  primaryColor: string; // hex — replaces teal #0D9488
  accentColor: string; // hex — secondary accent
  industry: IndustryType; // controls which modules + terminology show
  currency: string; // AED, USD, GBP, EUR etc
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY";
  timezone: string;
  locale: string;
  modules: ModuleKey[]; // which features are enabled for this tenant
  customDomain?: string; // e.g. dashboard.theircorp.com
  supportEmail?: string;
  hideSmStratagem: boolean; // true = fully white-labelled
  welcomeMessage?: string;
  plan: "Starter" | "Growth" | "Enterprise";
  status: "active" | "trial" | "suspended";
  createdAt: string; // ISO date
  lastActive: string; // ISO date
};

export type Branch = {
  id: string;
  tenantId: string;
  name: string;
  city: string;
  country: string;
  /** Relative size multiplier — drives the magnitude of generated metrics. */
  scale: number;
  /** Long-run growth trend, e.g. 0.08 = +8% over the window, -0.05 = declining. */
  trend: number;
  openedAt: string;
  active: boolean;
};

export type DailyPoint = {
  date: string; // ISO yyyy-mm-dd
  revenue: number;
  cogs: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  transactions: number; // covers / appointments / jobs depending on industry
  customers: number;
  avgTransaction: number;
  staffCost: number;
};

export type KPISummary = {
  revenue: number;
  revenueDelta: number; // % vs prior period
  margin: number; // gross margin %
  marginDelta: number;
  avgTransaction: number;
  avgTransactionDelta: number;
  transactions: number;
  transactionsDelta: number;
  topBranch: { id: string; name: string; revenue: number };
  worstBranch: { id: string; name: string; revenue: number; delta: number };
  bestDay: { date: string; revenue: number };
};

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertType =
  | "revenue_drop"
  | "margin_erosion"
  | "stock_threshold"
  | "staff_anomaly"
  | "forecast_deviation";
export type AlertStatus = "unread" | "read" | "snoozed" | "resolved";

export type Alert = {
  id: string;
  tenantId: string;
  branchId: string;
  branchName: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metric: string;
  value: string;
  createdAt: string; // ISO datetime
  status: AlertStatus;
};

export type ForecastPoint = {
  date: string;
  actual: number | null; // null for future dates
  predicted: number;
  lower: number; // confidence band lower bound
  upper: number; // confidence band upper bound
};

export type CategoryBreakdown = { name: string; revenue: number; margin: number };
export type PaymentMix = { method: string; amount: number };

export type SKU = {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorderPoint: number;
  dailyVelocity: number; // units sold/day
  daysRemaining: number;
  unitCost: number;
  status: "healthy" | "watch" | "low" | "critical" | "overstocked" | "dead";

  // ---- AI inventory intelligence (MVP layer) -------------------------------
  tenantId: string;
  branchId: string;
  branchName: string;
  supplierId: string;
  supplierName: string;

  // Stock position
  stockOnHand: number;
  stockOnOrder: number;
  reservedStock: number;
  availableStock: number; // onHand + onOrder − reserved
  safetyStock: number;

  // Lead time (supplier replenishment)
  leadTimeDays: number;
  leadTimeVariabilityDays: number;

  // Demand forecast
  forecastDemand7d: number;
  forecastDemand30d: number;
  forecastLower30d: number; // confidence band lower bound
  forecastUpper30d: number; // confidence band upper bound
  forecastConfidence: number; // 0-1

  // Reorder planning
  expectedStockoutDate: string; // ISO yyyy-mm-dd
  recommendedOrderQty: number;
  recommendedOrderDate: string; // ISO yyyy-mm-dd

  // Margin / cost economics
  sellingPrice: number;
  grossMarginPct: number;
  unitCostTrendPct: number; // +ve = cost rising
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  branchId: string;
  branchName: string;
  revenuePerShift: number;
  hoursThisWeek: number;
  laborCostPct: number;
  productivity: number; // 0-100 score
};

export type Integration = {
  id: string;
  name: string;
  category: "POS" | "ERP" | "Inventory" | "HR" | "Accounting" | "Delivery";
  status: "live" | "syncing" | "error" | "disconnected";
  lastSync: string;
  recordsToday: number;
};

export type Scenario = {
  id: string;
  name: string;
  priceChange: number; // %
  headcountChange: number; // absolute
  hoursChange: number; // % of trading hours
  newLocation: boolean;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  allowedBranches: string[]; // empty = all branches in tenant
  avatarColor: string;
};

// ============================================================================
// AI inventory intelligence, reorder planning & SKU-level cost economics
// ============================================================================

export type SKUForecastPoint = {
  date: string;
  skuId: string;
  skuName: string;
  branchId: string;
  actualUnits: number | null;
  predictedUnits: number;
  lowerUnits: number;
  upperUnits: number;
};

export type SupplierLeadTime = {
  supplierId: string;
  supplierName: string;
  skuId: string;
  branchId: string;
  quotedLeadTimeDays: number;
  actualLeadTimeAvgDays: number;
  actualLeadTimeP90Days: number;
  leadTimeVariabilityDays: number;
  delayRisk: "low" | "medium" | "high";
};

export type SKUMaterialCostPeriod = {
  skuId: string;
  skuName: string;
  supplierId: string;
  supplierName: string;
  period: string;
  periodType: "week" | "month";
  openingUnitCost: number;
  closingUnitCost: number;
  averageUnitCost: number;
  landedUnitCost: number;
  rawMaterialCost: number;
  freightCost: number;
  dutyCost: number;
  packagingCost: number;
  supplierSurcharge: number;
  wastageCost: number;
  currency: string;
};

export type COGSBreakdown = {
  tenantId: string;
  branchId?: string;
  period: string;
  revenue: number;
  totalCogs: number;
  materialCost: number;
  freightCost: number;
  dutyCost: number;
  packagingCost: number;
  supplierSurcharge: number;
  wastageCost: number;
  returnsWriteOffs: number;
  grossProfit: number;
  grossMarginPct: number;
  bySku: {
    skuId: string;
    skuName: string;
    category: string;
    unitsSold: number;
    revenue: number;
    cogs: number;
    grossMarginPct: number;
    unitCost: number;
    costTrendPct: number;
  }[];
};

export type ReorderRecommendation = {
  id: string;
  tenantId: string;
  branchId: string;
  branchName: string;
  skuId: string;
  skuName: string;
  supplierId: string;
  supplierName: string;
  currentStock: number;
  availableStock: number;
  forecastDemandDuringLeadTime: number;
  leadTimeDays: number;
  safetyStock: number;
  recommendedOrderQty: number;
  recommendedOrderDate: string;
  expectedStockoutDate: string;
  urgency: "low" | "medium" | "high" | "critical";
  financialImpact: number;
  rationale: string;
};

export type SupplierScore = {
  supplierId: string;
  supplierName: string;
  reliabilityScore: number;
  avgLeadTimeDays: number;
  delayRatePct: number;
  costVolatilityPct: number;
  fulfilmentAccuracyPct: number;
  defectRatePct: number;
  risk: "low" | "medium" | "high";
};

export type AIRecommendation = {
  id: string;
  tenantId: string;
  branchId?: string;
  title: string;
  category: "inventory" | "margin" | "supplier" | "pricing" | "staffing" | "forecast" | "data_quality";
  priority: "low" | "medium" | "high" | "critical";
  financialImpact: number;
  summary: string;
  recommendedAction: string;
  createdAt: string;
};
