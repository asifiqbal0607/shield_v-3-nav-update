/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║         MCP SHIELD — CENTRAL THEME CONFIGURATION         ║
 * ║                                                          ║
 * ║  THIS IS THE ONE FILE TO RULE THEM ALL.                  ║
 * ║  Change anything here → updates the entire application.  ║
 * ║                                                          ║
 * ║  How it works:                                           ║
 * ║  ThemeProvider (wrap App once) writes all values as      ║
 * ║  CSS custom properties on :root. Every component uses    ║
 * ║  var(--token) — change here, see everywhere instantly.   ║
 * ╚══════════════════════════════════════════════════════════╝
 */

export const theme = {

  // ── COLORS ──────────────────────────────────────────────────────────────────
  // Change a color here → updates every badge, button, chart, card accent
  colors: {
    primary:  '#1652c8',   // blue  — buttons, links, primary actions
    success:  '#0d9e6e',   // green — success states, active status
    warning:  '#d97706',   // amber — warnings, medium severity
    danger:   '#dc2626',   // red   — errors, critical, blocked
    violet:   '#7c3aed',   // purple — scheduled, analytics
    cyan:     '#0369a1',   // cyan  — on-demand, info

    // Navigation / header palette
    navy:     '#0a1628',
    navy2:    '#0f2040',
    navy3:    '#162a52',
    gold:     '#e8a020',   // accent on nav, active tabs

    // Page backgrounds
    bg:       '#f4f6fb',   // page background
    bgCard:   '#ffffff',   // card background
    bgSubtle: '#eef1f8',   // table hover, section backgrounds

    // Borders
    border:   '#dde3f0',
    border2:  '#c8d0e4',

    // Text hierarchy
    text:     '#0a1628',   // headings
    text2:    '#1e3a5f',   // body
    text3:    '#4a6080',   // secondary
    text4:    '#8098b8',   // muted / labels

    // Chart color sequence — used by PALETTE in colors.js
    palette: ['#1652c8','#0d9e6e','#d97706','#dc2626',
              '#7c3aed','#0369a1','#f97316','#84cc16','#ec4899','#14b8a6'],
  },

  // ── TYPOGRAPHY ──────────────────────────────────────────────────────────────
  // Change fontBody → every label, button, table cell updates
  typography: {
    fontBody:    "'Nunito', sans-serif",
    fontMono:    "'IBM Plex Mono', 'Courier New', monospace",

    // Font size scale — used as CSS vars throughout
    xs:    '9px',    // labels, badges, small hints
    sm:    '11px',   // nav tabs, table headers
    base:  '13px',   // default body text
    md:    '15px',   // section titles
    lg:    '18px',   // card headings
    stat:  '32px',   // KPI hero numbers
  },

  // ── SPACING ─────────────────────────────────────────────────────────────────
  // Change pagePad → all page padding updates
  spacing: {
    xs:          '4px',
    sm:          '8px',
    md:          '14px',
    lg:          '20px',
    xl:          '28px',
    pagePad:     '22px',   // desktop horizontal page padding
    pagePadSm:   '14px',   // tablet horizontal padding
    pagePadXs:   '12px',   // mobile horizontal padding
    sectionGap:  '12px',   // vertical gap between page sections
    cardPad:     '14px 16px',
    gridGap:     '10px',   // gap between grid cards
  },

  // ── SHAPE ───────────────────────────────────────────────────────────────────
  shape: {
    sm:   '6px',
    md:   '10px',
    lg:   '14px',    // cards
    xl:   '20px',
    pill: '999px',
  },

  // ── SHADOWS ─────────────────────────────────────────────────────────────────
  shadows: {
    sm:   '0 2px 4px rgba(10,22,40,.08)',
    md:   '0 6px 20px rgba(10,22,40,.12)',
    lg:   '0 16px 48px rgba(10,22,40,.16)',
    card: '0 1px 8px rgba(0,0,0,.06)',
  },

  // ── CARD ────────────────────────────────────────────────────────────────────
  // Change card.radius → every card in the app updates
  card: {
    background:   '#ffffff',
    borderRadius: '14px',
    padding:      '20px 22px',
    shadow:       '0 1px 8px rgba(0,0,0,.06)',
  },

  // ── TOPNAV ──────────────────────────────────────────────────────────────────
  topNav: {
    height:   54,     // px — used for fixed positioning calculations
    heightPx: '54px',
  },

  // ── BREAKPOINTS ─────────────────────────────────────────────────────────────
  // Change these → useBreakpoint hook + all CSS media queries update
  breakpoints: {
    mobile: 640,
    tablet: 1024,
  },

  // ── GRID COLUMN CONFIG ──────────────────────────────────────────────────────
  // Controls how many columns each grid class has at each breakpoint.
  // These map to CSS classes in global.css.
  //   g-stats4:  4 → 2 → 1
  //   g-stats3:  3 → 2 → 1
  //   g-halves:  2 → 2 → 1
  //   g-split:   1.3fr/1fr → 1 → 1
  //   g-split2:  2fr/1fr → 1 → 1
  //   g-perms5:  5 → 3 → 2
  //   g-auto-*:  auto-fit minmax (always responsive)
  grid: {
    gap: '14px',
  },
};

/**
 * Converts theme object → flat CSS custom property map.
 * Called once by ThemeProvider on mount.
 */
export function buildCSSVars(t = theme) {
  const c = t.colors;
  const ty = t.typography;
  const sp = t.spacing;
  const sh = t.shape;
  const sd = t.shadows;

  return {
    '--color-primary':  c.primary,
    '--color-success':  c.success,
    '--color-warning':  c.warning,
    '--color-danger':   c.danger,
    '--color-violet':   c.violet,
    '--color-cyan':     c.cyan,
    '--navy':           c.navy,
    '--navy2':          c.navy2,
    '--navy3':          c.navy3,
    '--gold':           c.gold,
    '--bg':             c.bg,
    '--bg-card':        c.bgCard,
    '--bg-subtle':      c.bgSubtle,
    '--border':         c.border,
    '--border2':        c.border2,
    '--text':           c.text,
    '--text-2':         c.text2,
    '--text-3':         c.text3,
    '--text-4':         c.text4,

    '--font':           ty.fontBody,
    '--font-mono':      ty.fontMono,
    '--text-xs':        ty.xs,
    '--text-sm':        ty.sm,
    '--text-base':      ty.base,
    '--text-md':        ty.md,
    '--text-lg':        ty.lg,
    '--text-stat':      ty.stat,

    '--page-pad':       sp.pagePad,
    '--page-pad-sm':    sp.pagePadSm,
    '--page-pad-xs':    sp.pagePadXs,
    '--section-gap':    sp.sectionGap,
    '--card-pad':       sp.cardPad,
    '--grid-gap':       sp.gridGap,

    '--radius-sm':      sh.sm,
    '--radius-md':      sh.md,
    '--radius-lg':      sh.lg,
    '--radius-pill':    sh.pill,

    '--shadow-sm':      sd.sm,
    '--shadow-md':      sd.md,
    '--shadow-lg':      sd.lg,
    '--shadow-card':    sd.card,

    '--card-bg':        t.card.background,
    '--card-radius':    t.card.borderRadius,
    '--card-shadow':    t.card.shadow,
    '--card-padding':   t.card.padding,

    '--topnav-h':       t.topNav.heightPx,
  };
}
