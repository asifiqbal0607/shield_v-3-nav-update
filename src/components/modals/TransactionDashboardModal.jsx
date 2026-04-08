import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const BLUE = "#1d4ed8";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const ROSE = "#dc2626";
const SLATE = "#64748b";
const VIOLET = "#7c3aed";
const CYAN = "#0891b2";

const PALETTE = [BLUE, GREEN, AMBER, ROSE, VIOLET, CYAN, "#f97316", "#84cc16"];

function makeData(title) {
  const isExcluded = title.toLowerCase().includes("excluded");
  const base = isExcluded ? 12000 : 50000;

  const trend = Array.from({ length: 14 }, (_, i) => ({
    d: `Feb ${i + 12}`,
    visits: Math.round(base * (0.7 + Math.random() * 0.6)),
    clicks: Math.round(base * (0.3 + Math.random() * 0.4)),
    blocks: Math.round(base * (0.1 + Math.random() * 0.2)),
  }));

  const byNetwork = [
    { name: "Total Access Comm.", value: 42 },
    { name: "Asiacell", value: 28 },
    { name: "TRUE INTERNET", value: 14 },
    { name: "Al Atheer", value: 9 },
    { name: "Others", value: 7 },
  ];

  const byReason = [
    { name: "MCPS-2000", value: 38 },
    { name: "MCPS-1300", value: 31 },
    { name: "AMCPS-1310", value: 22 },
    { name: "MCPS-1100", value: 9 },
  ];

  const byHour = Array.from({ length: 24 }, (_, h) => ({
    h: `${String(h).padStart(2, "0")}:00`,
    count: Math.round(base * 0.02 * (0.5 + Math.random())),
  }));

  // cls properties map to CSS classes — no inline styles needed
  const stats = [
    {
      label: "Total Transactions",
      value: base.toLocaleString(),
      bdtCls: "kpi-bdt-blue",
      valCls: "kpi-val-blue",
    },
    {
      label: "Unique IPs",
      value: Math.round(base * 0.12).toLocaleString(),
      bdtCls: "kpi-bdt-cyan",
      valCls: "kpi-val-cyan",
    },
    {
      label: "Unique Networks",
      value: "18",
      bdtCls: "kpi-bdt-violet",
      valCls: "kpi-val-violet",
    },
    {
      label: "Avg Score",
      value: isExcluded ? "3.2" : "8.7",
      bdtCls: "kpi-bdt-green",
      valCls: "kpi-val-green",
    },
  ];

  return { trend, byNetwork, byReason, byHour, stats };
}

function SectionHead({ colorClass, children }) {
  return (
    <div className="tdm-section-hd">
      <span className={`tdm-section-bar ${colorClass}`} />
      {children}
    </div>
  );
}

export default function TransactionDashboardModal({
  title,
  mode = "dashboard",
  onClose,
}) {
  const isExcluded = mode === "excluded";
  const data = makeData(title);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <>
      <div onClick={onClose} className="tdm-backdrop" />

      <div className="tdm-modal">
        {/* ── Header ── */}
        <div className={`tdm-header${isExcluded ? " excluded" : ""}`}>
          <div className="tdm-header-left">
            <div className={`tdm-header-icon${isExcluded ? " excluded" : ""}`}>
              {isExcluded ? "🚫" : "📊"}
            </div>
            <div>
              <div className="tdm-header-title">
                {isExcluded ? "Excluded Dashboard" : "Transaction Dashboard"}
              </div>
              <div className="tdm-header-subtitle">
                {title} — filtered overview
              </div>
            </div>
          </div>
          <button onClick={onClose} className="tdm-close-btn">
            ×
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="tdm-body">
          {/* ── KPI stats ── */}
          <div className="tdm-kpi-grid">
            {data.stats.map((s) => (
              <div key={s.label} className={`tdm-kpi-card ${s.bdtCls}`}>
                <div className={`tdm-kpi-value ${s.valCls}`}>{s.value}</div>
                <div className="tdm-kpi-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Trend line ── */}
          <div className="tdm-card">
            <SectionHead colorClass="tdd-bar-blue">
              Transaction Trend — Last 14 Days
            </SectionHead>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={data.trend}
                margin={{ top: 5, right: 10, bottom: 0, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="d"
                  tick={{ fontSize: 9, fill: "#cbd5e1" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#cbd5e1" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Line
                  type="monotone"
                  dataKey="visits"
                  stroke={BLUE}
                  strokeWidth={2.5}
                  dot={false}
                  name="Visits"
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke={GREEN}
                  strokeWidth={2}
                  dot={false}
                  name="Clicks"
                />
                <Line
                  type="monotone"
                  dataKey="blocks"
                  stroke={ROSE}
                  strokeWidth={2}
                  dot={false}
                  name="Blocks"
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="tdm-legend">
              {[
                ["Visits", "legend-dot-blue"],
                ["Clicks", "legend-dot-green"],
                ["Blocks", "legend-dot-rose"],
              ].map(([l, cls]) => (
                <div key={l} className="tdm-legend-item">
                  <div className={`tdm-legend-dot ${cls}`} />
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* ── Hourly volume + by-network pie ── */}
          <div className="tdm-charts-row">
            <div className="tdm-card">
              <SectionHead colorClass="tdd-bar-amber">
                Transactions by Hour
              </SectionHead>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={data.byHour}
                  margin={{ top: 0, right: 8, bottom: 0, left: -20 }}
                >
                  <XAxis
                    dataKey="h"
                    tick={{ fontSize: 8, fill: "#cbd5e1" }}
                    axisLine={false}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#cbd5e1" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar
                    dataKey="count"
                    name="Transactions"
                    radius={[3, 3, 0, 0]}
                  >
                    {data.byHour.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i >= 6 && i <= 20 ? BLUE : VIOLET}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="tdm-card">
              <SectionHead colorClass="tdd-bar-cyan">By Network</SectionHead>
              <div className="tdm-network-wrap">
                <PieChart width={120} height={120}>
                  <Pie
                    data={data.byNetwork}
                    dataKey="value"
                    cx={55}
                    cy={55}
                    innerRadius={30}
                    outerRadius={52}
                    paddingAngle={2}
                  >
                    {data.byNetwork.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i]} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="tdm-network-legend">
                  {data.byNetwork.map((n, i) => (
                    <div key={n.name} className="tdm-network-item">
                      <div className="tdm-network-item-left">
                        <div className={`tdm-network-dot pal-bg-${i}`} />
                        <span className="tdm-network-name">{n.name}</span>
                      </div>
                      <span className={`tdm-network-pct pal-col-${i}`}>
                        {n.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Block reasons bar ── */}
          <div className="tdm-card">
            <SectionHead colorClass="tdd-bar-rose">
              Block Reason Distribution
            </SectionHead>
            <div className="tdm-reason-grid">
              {data.byReason.map((r, i) => (
                <div
                  key={r.name}
                  className={`tdm-reason-card reason-card-${i}`}
                >
                  <div className={`tdm-reason-pct pal-col-${i}`}>
                    {r.value}%
                  </div>
                  <div className="tdm-reason-badge-wrap">
                    <span className={`tdm-reason-badge pal-bg-${i}`}>
                      {r.name}
                    </span>
                  </div>
                  <div className="tdm-reason-bar-bg">
                    <div
                      className={`tdm-reason-bar-fill pal-bg-${i} tdm-bar-w-${r.value}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="tdm-footer">
          <button onClick={onClose} className="tdm-btn-close">
            Close
          </button>
        </div>
      </div>
    </>
  );
}
