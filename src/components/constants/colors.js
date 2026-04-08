// ─── Brand & Semantic Colors ─────────────────────────────────────────────────
export const BLUE   = '#1d4ed8';
export const GREEN  = '#22c55e';
export const AMBER  = '#f59e0b';
export const ROSE   = '#f43f5e';
export const VIOLET = '#8b5cf6';
export const CYAN   = '#06b6d4';
export const SLATE  = '#94a3b8';

/** Ordered palette for sequential chart series */
export const PALETTE = [
  BLUE, GREEN, AMBER, ROSE, VIOLET, CYAN,
  '#f97316', '#84cc16', '#ec4899', '#14b8a6',
];

/** Role → badge color map */
export const ROLE_COLORS = {
  Admin:   BLUE,
  Analyst: VIOLET,
  Viewer:  CYAN,
};

/** Severity → badge color map */
export const SEVERITY_COLORS = {
  Critical: ROSE,
  High:     AMBER,
  Medium:   BLUE,
  Low:      GREEN,
};

/** Status → dot color map */
export const STATUS_COLORS = {
  active:  GREEN,
  warning: AMBER,
  blocked: ROSE,
  paused:  SLATE,
};

// ─── Status Helper Functions ──────────────────────────────────────────────────
/** Returns the border/text accent color for a status string */
export const statusColor = (s) =>
  s === "active" ? GREEN : s === "warning" ? AMBER : ROSE;

/** Returns the background fill color for a status badge */
export const statusBg = (s) =>
  s === "active" ? "#dcfce7" : s === "warning" ? "#fef3c7" : "#fee2e2";

/** Returns the text color for a status badge */
export const statusText = (s) =>
  s === "active" ? "#15803d" : s === "warning" ? "#92400e" : "#991b1b";
