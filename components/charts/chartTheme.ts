import type { CSSProperties } from "react";

// Shared Recharts styling so every chart matches the design system and reskins
// with the tenant brand (colours reference the runtime CSS variables).

export const AXIS_TICK = { fontSize: 11, fill: "#94A3B8" } as const;

export const TOOLTIP_STYLE: CSSProperties = {
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  boxShadow: "0 10px 30px rgba(11,31,58,0.12)",
  fontSize: 12,
  padding: "8px 12px",
};
export const TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: "#0B1F3A",
  fontWeight: 700,
  marginBottom: 4,
};
export const TOOLTIP_ITEM_STYLE: CSSProperties = { color: "#475569", padding: 0 };

export const GRID_PROPS = {
  stroke: "#EEF1F6",
  strokeDasharray: "0",
  vertical: false,
} as const;

/** Categorical palette for multi-series charts — primary/accent first, then
 *  brand tints and neutral greys. Resolves at runtime so it follows the tenant. */
export const CHART_COLORS = [
  "var(--primary)",
  "var(--accent)",
  "color-mix(in srgb, var(--primary) 55%, white)",
  "#94A3B8",
  "color-mix(in srgb, var(--accent) 50%, white)",
  "#CBD5E1",
];
