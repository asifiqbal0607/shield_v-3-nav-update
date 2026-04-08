/**
 * chartStyles.js
 * Shared Recharts style constants used across pages.
 *
 * Exports:
 *   CHART_TICK        – default axis tick style (light, 9px)
 *   CHART_TICK_MUTED  – muted axis tick style (slate, 9px)
 *   CHART_TICK_MD     – medium axis tick style (slate, 10px)
 *   CHART_MARGIN      – default chart margin
 *   CHART_MARGIN_0    – zero-padding chart margin
 *   CHART_MARGIN_R    – chart margin with right spacing
 *   TOOLTIP_STYLE     – default dark tooltip contentStyle
 *   PIE_TOOLTIP_WRAPPER – wrapper style for pie chart tooltips
 */

export const CHART_TICK = { fontSize: 9, fill: "#cbd5e1" };

export const CHART_TICK_MUTED = { fontSize: 9, fill: "#64748b" };

export const CHART_TICK_MD = { fontSize: 10, fill: "#64748b" };

export const CHART_TICK_LIGHT = { fontSize: 10, fill: "#94a3b8" };

export const CHART_MARGIN = { top: 5, right: 5, bottom: 0, left: -30 };

export const CHART_MARGIN_0 = { top: 0, right: 10, left: 10, bottom: 0 };

export const CHART_MARGIN_R = { top: 0, right: 20, left: 10, bottom: 0 };

export const TOOLTIP_STYLE = {
  fontSize: 11,
  borderRadius: 8,
  border: "none",
  background: "#0f172a",
  color: "#fff",
  boxShadow: "0 8px 24px rgba(0,0,0,.4)",
};

export const PIE_TOOLTIP_WRAPPER = {
  outline: "none",
  border: "none",
  background: "none",
  boxShadow: "none",
  padding: 0,
  zIndex: 9999,
};

export const PIE_TOOLTIP_CONTENT = {
  border: "none",
  background: "none",
  padding: 0,
  boxShadow: "none",
};
