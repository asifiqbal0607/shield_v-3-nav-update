import { useState, useCallback, useMemo, useEffect } from "react";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

import { Card } from "../components/ui";
import { TransactionsModal } from "../components/modals";
import { BlockRadarChart } from "../components/charts";
import {
  BackArrowIcon, InfoIcon, ChevronUpIcon, ChevronDownIcon, FilterIcon,
} from "../components/ui/Icons";
import { ScoreGauge, HeatmapBar, ChannelRows } from "../components/ui";
import { histogramData, blockReasons, blockLegend } from "../data/charts";
import ServicesTrafficChart from "../components/charts/ServicesTrafficChart";
import PartnersTrafficChart from "../components/charts/PartnersTrafficChart";
import { ALL_PARTNERS } from "../models/partners";
import { buildPartnerData, getDayStats, getFilterScale } from "../services/trafficService";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtNum(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}
function fmtPct(n) { return `${n.toFixed(1)}%`; }
function chgPct(curr, prev) { return prev > 0 ? +((curr - prev) / prev * 100).toFixed(1) : 0; }

// ── Aggregate all partners for a given day offset ─────────────────────────────
function dayTotal(dayOffset) {
  return ALL_PARTNERS.reduce((acc, p) => {
    const s = getDayStats(p, dayOffset);
    return { total: acc.total + s.total, blocked: acc.blocked + s.blocked, clean: acc.clean + s.clean };
  }, { total: 0, blocked: 0, clean: 0 });
}

// ── KPI data derived from real partner traffic ────────────────────────────────
function buildKpiData(range, filterScale = 1) {
  const periods = range === "1d" ? 1 : range === "7d" ? 7 : 30;
  const desc = range === "1d" ? "vs yesterday" : range === "7d" ? "vs prev 7d" : "vs prev 30d";

  // Current period
  let curr = { total: 0, blocked: 0, clean: 0 };
  for (let d = 0; d < periods; d++) {
    const s = dayTotal(d);
    curr.total += s.total; curr.blocked += s.blocked; curr.clean += s.clean;
  }
  // Previous period
  let prev = { total: 0, blocked: 0, clean: 0 };
  for (let d = periods; d < periods * 2; d++) {
    const s = dayTotal(d);
    prev.total += s.total; prev.blocked += s.blocked; prev.clean += s.clean;
  }

  // Apply filter scale to raw counts (ratios recalculated after scaling)
  const cClean   = curr.clean   * filterScale;
  const cTotal   = curr.total   * filterScale;
  const pClean   = prev.clean   * filterScale;
  const pTotal   = prev.total   * filterScale;

  const currCtr = histogramData.reduce((s, d) => s + d.clicks, 0) /
                  Math.max(1, histogramData.reduce((s, d) => s + d.visits, 0)) * 100;
  const prevCtr = currCtr * 0.94;

  const currCleanRatio = cTotal > 0 ? (cClean / cTotal) * 100 : 0;
  const prevCleanRatio = pTotal > 0 ? (pClean / pTotal) * 100 : 0;
  const currClicks = histogramData.reduce((s, d) => s + d.clicks, 0) * periods * filterScale;
  const prevClicks = Math.round(currClicks * 0.93);

  // Sparkline: 30 points interpolating curr→prev (scaled)
  const spark = (cVal, pVal) => Array.from({ length: 30 }, (_, i) => {
    const t = i / 29;
    return { i, curr: cVal * (0.9 + Math.sin(i * 0.4) * 0.08 + t * 0.02), prev: pVal * (0.9 + Math.sin(i * 0.4 + 1.2) * 0.07) };
  });

  return [
    { label: "Clear",         color: "#22c55e", pp: false,
      value: fmtNum(cClean),         prevValue: fmtNum(pClean),
      change: chgPct(cClean, pClean), desc, data: spark(cClean, pClean) },
    { label: "Clear ratio",   color: "#3b82f6", pp: true,
      value: fmtPct(currCleanRatio), prevValue: fmtPct(prevCleanRatio),
      change: +((currCleanRatio - prevCleanRatio)).toFixed(1), desc, data: spark(currCleanRatio, prevCleanRatio) },
    { label: "Clicked",       color: "#f59e0b", pp: false,
      value: fmtNum(currClicks),     prevValue: fmtNum(prevClicks),
      change: chgPct(currClicks, prevClicks), desc, data: spark(currClicks, prevClicks) },
    { label: "Clicked ratio", color: "#8b5cf6", pp: true,
      value: fmtPct(currCtr),        prevValue: fmtPct(prevCtr),
      change: +((currCtr - prevCtr)).toFixed(1), desc, data: spark(currCtr, prevCtr) },
    { label: "Total",         color: "#0ea5e9", pp: false,
      value: fmtNum(cTotal),         prevValue: fmtNum(pTotal),
      change: chgPct(cTotal, pTotal), desc, data: spark(cTotal, pTotal) },
  ];
}

// ── Volume chart data derived from real partner traffic ───────────────────────
function buildVolumeData(range) {
  if (range === "1d") {
    const WEIGHTS = [0.5,0.4,0.3,0.3,0.4,0.6,0.9,1.3,1.8,2.0,1.9,1.7,
                     1.5,1.6,1.8,2.1,2.0,1.8,1.4,1.1,0.9,0.7,0.6,0.5];
    const wSum = WEIGHTS.reduce((s, w) => s + w, 0);
    const today = dayTotal(0);
    const now = new Date().getHours();
    return WEIGHTS.slice(0, now + 1).map((w, h) => ({
      d: `${String(h).padStart(2,"0")}:00`,
      clean:   Math.round((w / wSum) * today.clean),
      blocked: Math.round((w / wSum) * today.blocked),
      visits:  Math.round((w / wSum) * today.total * 1.35),
    }));
  }
  if (range === "7d") {
    return ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => {
      const s = dayTotal(6 - i);
      return { d, clean: s.clean, blocked: s.blocked, visits: Math.round(s.total * 1.35) };
    });
  }
  // 30d
  return Array.from({ length: 30 }, (_, i) => {
    const s = dayTotal(29 - i);
    return { d: `${i + 1}`, clean: s.clean, blocked: s.blocked, visits: Math.round(s.total * 1.35) };
  });
}

// ── Hourly density from real today total ─────────────────────────────────────
function buildHourlyData() {
  const today = dayTotal(0);
  const WEIGHTS = [0.5,0.4,0.3,0.3,0.4,0.6,0.9,1.3,1.8,2.0,1.9,1.7,
                   1.5,1.6,1.8,2.1,2.0,1.8,1.4,1.1,0.9,0.7,0.6,0.5];
  const wSum = WEIGHTS.reduce((s, w) => s + w, 0);
  return WEIGHTS.map((w, h) => ({ h, value: Math.round((w / wSum) * today.total) }));
}

// ── Block reasons from real blockReasons data ────────────────────────────────
function buildBlockReasons() {
  const COLOR_MAP = {
    "Shield Bypassing":    "#ef4444",
    "Desktop Traffic":     "#f59e0b",
    "Failed Interaction":  "#8b5cf6",
    "Bot Detected":        "#3b82f6",
    "Remotely Controlled": "#10b981",
    "Spoofing":            "#ec4899",
    "APK Fraud":           "#06b6d4",
    "Excessive IP":        "#f97316",
  };
  const totals = {};
  blockLegend.forEach(({ key }) => { totals[key] = 0; });
  blockReasons.forEach(day => blockLegend.forEach(({ key }) => { totals[key] += day[key] || 0; }));
  const grand = Object.values(totals).reduce((s, v) => s + v, 0);
  return blockLegend
    .map(({ key }) => ({ name: key, value: Math.round((totals[key] / grand) * 100), color: COLOR_MAP[key] || "#94a3b8", raw: totals[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

// ── Channel data from histogramData ──────────────────────────────────────────
function buildChannelData() {
  const totalV = histogramData.reduce((s, d) => s + d.visits, 0);
  const totalC = histogramData.reduce((s, d) => s + d.clicks, 0);
  return [
    { name: "In-App",     color: "#3b82f6", clicks: Math.round(totalC * 0.38), visits: Math.round(totalV * 0.32) },
    { name: "Browser",    color: "#22c55e", clicks: Math.round(totalC * 0.29), visits: Math.round(totalV * 0.30) },
    { name: "Google",     color: "#f59e0b", clicks: Math.round(totalC * 0.21), visits: Math.round(totalV * 0.24) },
    { name: "Non-Google", color: "#ef4444", clicks: Math.round(totalC * 0.12), visits: Math.round(totalV * 0.14) },
  ];
}

// ── Fraud score from real block rate ─────────────────────────────────────────
function buildFraudScore() {
  const s = dayTotal(0);
  const suspect = Math.round(s.clean * 0.15);
  const clean   = s.clean - suspect;
  return { clean, suspect, blocked: s.blocked };
}

// ── Pre-compute stable values ─────────────────────────────────────────────────
const HOURLY_DATA   = buildHourlyData();
const BLOCK_REASONS = buildBlockReasons();
const CHANNEL_DATA  = buildChannelData();
const FRAUD_SCORE   = buildFraudScore();

// ── Colour → CSS class (replaces all style={{ "--c": color }} inline styles) ──
const COLOR_CLASS = {
  "#22c55e": "cc-green",
  "#3b82f6": "cc-blue",
  "#f59e0b": "cc-amber",
  "#8b5cf6": "cc-purple",
  "#0ea5e9": "cc-sky",
  "#ef4444": "cc-red",
  "#10b981": "cc-emerald",
  "#ec4899": "cc-pink",
  "#06b6d4": "cc-cyan2",
  "#f97316": "cc-orange",
  "#16a34a": "cc-dkgreen",
  "#cbd5e1": "cc-slate",
};

const RANGE_LABELS = {
  "1d":  "Today · hourly",
  "7d":  "Last 7 days",
  "30d": "Last 30 days",
};

const INFO_TIPS = {
  "Clear":        "Transactions that passed all fraud checks.",
  "Clear ratio":  "Percentage of total transactions that were cleared.",
  "Clicked":      "Total click events recorded in the period.",
  "Trnx":          "Total transactions processed in the period.",
  "Clicked ratio": "Percentage of visits that resulted in a click.",
  "Total":        "All transactions processed in the period.",
};

// ── KPI sparkline: today (solid) vs yesterday (dashed) ───────────────────────
function KpiSparkline({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={56}>
      <LineChart data={data} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
        <Line type="monotone" dataKey="prev" stroke="#cbd5e1" strokeWidth={1.2}
          dot={false} strokeDasharray="3 3" />
        <Line type="monotone" dataKey="curr" stroke={color} strokeWidth={2}
          dot={false} activeDot={{ r: 3, fill: color, strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ card, onClick }) {
  const [tipOpen, setTipOpen] = useState(false);
  const up = card.change > 0;
  return (
    <div className="ov2-kpi-card" onClick={onClick}>
      <div className={`ov2-kpi-accent ${COLOR_CLASS[card.color]}`} />
      <div className="ov2-kpi-top">
        <span className="ov2-kpi-label">{card.label}</span>
        <div className="ov2-kpi-info" onClick={(e) => { e.stopPropagation(); setTipOpen(t => !t); }}>
          <InfoIcon size={12} />
          {tipOpen && <div className="ov2-kpi-tip">{INFO_TIPS[card.label]}</div>}
        </div>
      </div>
      <div className={`ov2-kpi-value ${COLOR_CLASS[card.color]}`}>{card.value}</div>
      <div className="ov2-kpi-compare">
        <span className="ov2-kpi-prev-lbl">Yesterday</span>
        <span className="ov2-kpi-prev-val">{card.prevValue}</span>
        <span className={`ov2-kpi-badge${up ? " up" : " dn"}`}>
          {up ? <ChevronUpIcon size={9} /> : <ChevronDownIcon size={9} />}
          {up ? "+" : ""}{card.change}{card.pp ? "pp" : "%"}
        </span>
      </div>
      <div className="ov2-kpi-chart-wrap">
        <KpiSparkline data={card.data} color={card.color} />
        <div className="ov2-kpi-spark-legend">
          <span className="ov2-kpi-spark-today">— Today</span>
          <span className="ov2-kpi-spark-yest">- - Yesterday</span>
        </div>
      </div>
    </div>
  );
}

// ── Area chart tooltip ────────────────────────────────────────────────────────
function AreaTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ov2-tooltip">
      <div className="ov2-tooltip-label">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="ov2-tooltip-row">
          <span className={`ov2-tooltip-dot ${COLOR_CLASS[p.color] ?? ""}`} />
          <span className="ov2-tooltip-key">{p.name}</span>
          <span className="ov2-tooltip-val">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ── Block donut (pure SVG) — uses partner data so stays in Overview ───────────
function BlockDonut({ data, filterScale }) {
  const R = 48, cx = 60, cy = 60, sw = 11;
  const circ = 2 * Math.PI * R;
  const total = data.reduce((s, d) => s + d.value, 0);

  // Pre-compute all segment geometry so we can build the scoped <style> block
  let cum = 0;
  const segments = data.map((d, i) => {
    const frac = d.value / total;
    const dash = Math.max(0, frac * circ - 2);
    const rot  = cum * 360 - 90;
    cum += frac;
    return { ...d, i, dash, rot };
  });

  const todayBlocked = ALL_PARTNERS.reduce((acc, p) => acc + getDayStats(p, 0).blocked, 0);
  const totalBlocks = Math.round(todayBlocked * filterScale);

  return (
    <div className="ov2-donut-wrap">
      {/* Scoped dynamic values — rotation angle and bar width can't live in global.css
          because they're computed from data at runtime */}
      <style>{segments.map(s =>
        `.ov2-arc-${s.i}{--rot:${s.rot}deg;stroke-dasharray:${s.dash} ${circ};}` +
        `.ov2-bar-${s.i}{--w:${s.value}%;}`
      ).join('')}</style>

      <div className="ov2-donut-chart">
        <svg viewBox="0 0 120 120" className="ov2-donut-svg">
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--bg-subtle)" strokeWidth={sw} />
          {segments.map((seg) => (
            <circle key={seg.name} cx={cx} cy={cy} r={R}
              fill="none" stroke={seg.color} strokeWidth={sw}
              strokeLinecap="round"
              className={`ov2-donut-arc ov2-arc-${seg.i}`} />
          ))}
          <text x={cx} y={cy - 5} textAnchor="middle" className="ov2-donut-num">
            {(totalBlocks / 1000).toFixed(0)}K
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" className="ov2-donut-sub">blocks</text>
        </svg>
      </div>

      <div className="ov2-donut-legend">
        {segments.map((seg, i) => (
          <div key={seg.name} className="ov2-donut-row">
            <span className={`ov2-donut-dot ${COLOR_CLASS[seg.color] ?? ""}`} />
            <span className="ov2-donut-name">{seg.name}</span>
            <span className="ov2-donut-bar-wrap">
              <span className={`ov2-donut-bar ov2-bar-${i}`} />
            </span>
            <span className="ov2-donut-pct">{seg.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Cap Limit Banner (partner view only) ─────────────────────────────────────
function CapLimitBanner({ capLimit }) {
  if (!capLimit) return null;

  const { value, period, usedToday = 0 } = capLimit;
  const used    = Math.min(usedToday, value);
  const pct     = Math.round((used / value) * 100);
  const remaining = Math.max(0, value - used);

  function fmtCap(n) {
    if (n >= 1000000) return (n / 1000000 % 1 === 0 ? n / 1000000 : (n / 1000000).toFixed(1)) + "M";
    if (n >= 1000)    return (n / 1000    % 1 === 0 ? n / 1000    : (n / 1000).toFixed(1))    + "K";
    return n.toLocaleString();
  }

  const barColor = pct >= 90 ? "#dc2626" : pct >= 60 ? "#d97706" : "#0284c7";
  const valColor = pct >= 90 ? "#dc2626" : pct >= 60 ? "#d97706" : "#0284c7";

  return (
    <div className="cap-ov-banner">
      <div className="cap-ov-left">
        <div className="cap-ov-icon">🔒</div>
        <div>
          <div className="cap-ov-title">API Cap Limit Active</div>
          <div className="cap-ov-sub">
            Your account has a transaction cap set by your administrator · resets {period === "day" ? "daily" : "monthly"}
          </div>
        </div>
      </div>

      <div className="cap-ov-right">
        <div className="cap-ov-stat">
          <div className="cap-ov-stat-val">{fmtCap(value)}</div>
          <div className="cap-ov-stat-lbl">limit / {period}</div>
        </div>
        <div className="cap-ov-divider" />
        <div className="cap-ov-stat">
          <div className="cap-ov-stat-val" style={{ color: valColor }}>{fmtCap(used)}</div>
          <div className="cap-ov-stat-lbl">used {period === "day" ? "today" : "this month"}</div>
        </div>
        <div className="cap-ov-divider" />
        <div className="cap-ov-usage">
          <div className="cap-ov-usage-row">
            <span className="cap-ov-usage-lbl">Usage</span>
            <span className="cap-ov-usage-pct" style={{ color: valColor }}>{pct}%</span>
          </div>
          <div className="cap-ov-bar-track">
            <div className="cap-ov-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
          </div>
          <div className="cap-ov-usage-row" style={{ marginTop: 3 }}>
            <span className="cap-ov-remaining">{fmtCap(remaining)} remaining</span>
            <span className="cap-ov-period-badge">Per {period}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function PageOverview({
  service, setPage, role = "admin",
  initialFilter = null, filterType = null,
  globalFilters = null,
  capLimit = null,
}) {
  const isAdmin = role === "admin";
  const [modal,       setModal]       = useState(null);
  const [selectedBar, setSelectedBar] = useState(initialFilter ?? null);
  const [rangeTab,    setRangeTab]    = useState("7d");
  const [seriesVis,   setSeriesVis]   = useState({ clean: true, blocked: true, visits: true });

  const open  = (title) => setModal(title);
  const close = () => setModal(null);
  const handleBarFilter = useCallback((name) => setSelectedBar(name), []);

  useEffect(() => {
    if (!globalFilters) return;

    const serviceFilter = (globalFilters.service || "").trim();
    setSelectedBar(serviceFilter || null);

    const from = globalFilters.fromDate ? new Date(`${globalFilters.fromDate}T00:00:00`) : null;
    const to = globalFilters.toDate ? new Date(`${globalFilters.toDate}T00:00:00`) : null;
    if (from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
      const diffDays = Math.max(1, Math.floor((to - from) / 86400000) + 1);
      if (diffDays <= 1) setRangeTab("1d");
      else if (diffDays <= 7) setRangeTab("7d");
      else setRangeTab("30d");
    }
  }, [globalFilters]);

  // Real filter scale using trafficService
  const partnerData = useMemo(() => buildPartnerData(1, ALL_PARTNERS), []);

  // For partner view: build a service-level data map so filterScale works on service selection
  const serviceData = useMemo(() => {
    if (isAdmin) return null;
    // Flatten all services across all partners, sum their traffic
    const map = {};
    ALL_PARTNERS.forEach(p => {
      (p.services || []).forEach(svc => {
        const key = svc.name ?? svc;
        if (!map[key]) map[key] = { name: key, total: 0 };
        const s = getDayStats(p, 0);
        // distribute partner traffic evenly across their services
        const share = 1 / Math.max(1, (p.services || []).length);
        map[key].total += s.total * share;
      });
    });
    return map;
  }, [isAdmin]);

  const filterScale = useMemo(() => {
    if (!selectedBar) return 1;
    if (isAdmin) {
      // Admin: filter by partner name
      return getFilterScale(selectedBar, partnerData);
    } else {
      // Partner: filter by service name
      if (!serviceData) return 1;
      const allTotal = Object.values(serviceData).reduce((s, v) => s + v.total, 0);
      const match = serviceData[selectedBar];
      if (!match || allTotal === 0) return 1;
      return match.total / allTotal;
    }
  }, [selectedBar, partnerData, serviceData, isAdmin]);

  // KPI cards and volume data from real data, reactive to range tab AND filter
  const kpiCards = useMemo(() => buildKpiData(rangeTab, filterScale), [rangeTab, filterScale]);
  const chartData = useMemo(() => {
    const raw = buildVolumeData(rangeTab);
    return raw.map(d => ({
      ...d,
      clean:   Math.round(d.clean   * filterScale),
      blocked: Math.round(d.blocked * filterScale),
      visits:  Math.round(d.visits  * filterScale),
    }));
  }, [rangeTab, filterScale]);

  const TICK = { fontSize: 9, fill: "#94a3b8" };

  return (
    <div className="ov2-page">

      {/* ── Per-service drill-in header ── */}
      {service && (
        <div className="ov-service-header">
          <button className="ov-back-btn" onClick={() => setPage && setPage("services")}>
            <BackArrowIcon size={16} /> Back to Services
          </button>
          <div className="ov-service-meta">
            <span className="ov-service-id">{service.serviceId}</span>
            <span className={`ov-service-status ${service.status === "active" ? "cc-dkgreen" : "cc-amber"}`}>
              {service.status?.toUpperCase()}
            </span>
          </div>
          <h2 className="ov-service-name">{service.name}</h2>
          <div className="ov-service-tags">
            {service.client    && service.client    !== "--" && <span className="ov-service-tag">Client: {service.client}</span>}
            {service.mno       && service.mno       !== "--" && <span className="ov-service-tag">MNO: {service.mno}</span>}
            {service.shieldMode&& service.shieldMode!== "--" && <span className="ov-service-tag">Shield: {service.shieldMode}</span>}
            {service.vsBrand   && service.vsBrand   !== "--" && <span className="ov-service-tag">VS Brand: {service.vsBrand}</span>}
          </div>
        </div>
      )}

      {/* ── KPI row ── */}
      <div className="ov2-kpi-row">
        {kpiCards.map(card => (
          <KpiCard key={card.label} card={card}
            onClick={() => open(`${card.label} — Transactions`)} />
        ))}
      </div>

      {/* ── Partners / Services traffic ── */}
      {isAdmin ? (
        <PartnersTrafficChart days={1} onPartnerFilter={handleBarFilter}
          initialName={filterType === "client" ? initialFilter : null} />
      ) : (
        <ServicesTrafficChart days={1} onServiceFilter={handleBarFilter}
          initialName={filterType === "service" ? initialFilter : null} />
      )}

      {/* ── Filter banner ── */}
      {selectedBar && (
        <div className="ovb-filter-banner">
          <FilterIcon size={14} />
          <span>
            Showing data for <strong>{selectedBar}</strong> —{" "}
            {filterType === "client" ? "client filter active"
              : filterType === "service" ? "service filter active"
              : isAdmin ? "partner filter active" : "service filter active"}
          </span>
          <button className="ovb-banner-clear" onClick={() => setSelectedBar(null)}>Clear filter ✕</button>
        </div>
      )}

      {/* ── Row 1: Volume chart + side col ── */}
      <div className="ov2-top-row">
        <Card className="ov2-card-volume">
          <div className="ov2-card-header">
            <div>
              <div className="ov2-card-title">Transaction Volume</div>
              <div className="ov2-card-sub">{RANGE_LABELS[rangeTab]}</div>
            </div>
            <div className="ov2-series-btns">
              {[
                { key: "clean",   label: "Clean",   color: "#22c55e" },
                { key: "blocked", label: "Blocked",  color: "#ef4444" },
                { key: "visits",  label: "Visits",   color: "#3b82f6" },
              ].map(s => (
                <button key={s.key}
                  className={`ov2-series-btn${seriesVis[s.key] ? " on" : ""} ${COLOR_CLASS[s.color]}`}
                  onClick={() => setSeriesVis(v => ({ ...v, [s.key]: !v[s.key] }))}
                >
                  <span className={`ov2-series-dot ${COLOR_CLASS[seriesVis[s.key] ? s.color : "#cbd5e1"]}`} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="ov2-chart-click" onClick={() => open("Volume — Transactions")}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                  <defs>
                    {[["ov2gC","#22c55e",0.07],["ov2gB","#ef4444",0.15],["ov2gV","#3b82f6",0.10]].map(([id, col, op]) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={col} stopOpacity={op} />
                        <stop offset="95%" stopColor={col} stopOpacity={0}  />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="d" tick={TICK} axisLine={false} tickLine={false} height={18} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} width={34}
                    domain={[0, 'dataMax']}
                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip content={<AreaTip />} />
                  {seriesVis.visits  && <Area type="monotone" dataKey="visits"  name="Visits"  stroke="#3b82f6" strokeWidth={1.5} fill="url(#ov2gV)" dot={false} />}
                  {seriesVis.clean   && <Area type="monotone" dataKey="clean"   name="Clean"   stroke="#22c55e" strokeWidth={2}   fill="url(#ov2gC)" dot={false} />}
                  {seriesVis.blocked && <Area type="monotone" dataKey="blocked" name="Blocked" stroke="#ef4444" strokeWidth={2}   fill="url(#ov2gB)" dot={false} />}
                </AreaChart>
              </ResponsiveContainer>
          </div>
        </Card>

        <div className="ov2-side-col">
          <Card>
            <div className="ov2-card-header">
              <div>
                <div className="ov2-card-title">Hourly Density</div>
                <div className="ov2-card-sub">Transactions by hour</div>
              </div>
            </div>
            <HeatmapBar data={HOURLY_DATA} />
          </Card>
          <Card>
            <div className="ov2-card-header">
              <div className="ov2-card-title">Fraud Score</div>
            </div>
            <ScoreGauge clean={FRAUD_SCORE.clean} suspect={FRAUD_SCORE.suspect} blocked={FRAUD_SCORE.blocked} />
          </Card>
        </div>
      </div>

      {/* ── Row 2: Block pattern + right col ── */}
      <div className="ov2-row-bottom">
        <Card className="ov2-radar-card">
          <div className="ov2-card-header">
            <div>
              <div className="ov2-card-title">Block Pattern</div>
              <div className="ov2-card-sub">Weekly threat distribution by day</div>
            </div>
            <span className="ov2-radar-badge">7-day radar</span>
          </div>
          <BlockRadarChart height={320} showBadge={false}
            onDayClick={(day) => open(`${day} Block Pattern — Transactions`)} />
        </Card>

        <div className="ov2-bottom-right">
          <Card>
            <div className="ov2-card-header">
              <div className="ov2-card-title">Channels</div>
              <span className="ov2-card-sub">Click-through rate by source</span>
            </div>
            <ChannelRows data={CHANNEL_DATA} filterScale={filterScale} onOpen={open} />
          </Card>
          <Card>
            <div className="ov2-card-header">
              <div className="ov2-card-title">Block Reasons</div>
              <span className="ov2-card-sub">This week</span>
            </div>
            <BlockDonut data={BLOCK_REASONS} filterScale={filterScale} />
          </Card>
        </div>
      </div>

      {modal && <TransactionsModal title={modal} onClose={close} role={role} setPage={setPage} />}
    </div>
  );
}
