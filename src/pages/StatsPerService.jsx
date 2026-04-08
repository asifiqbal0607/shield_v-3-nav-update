import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { Card, SectionTitle, Badge } from "../components/ui";
import {
  PALETTE,
  GREEN,
  ROSE,
  AMBER,
  BLUE,
} from "../components/constants/colors";
import { seededRand, getDayStats, fmt, pct, delta } from "../services/trafficService";

// ── Constants ────────────────────────────────────────────────────────────────
import { ALL_PARTNERS } from "../models/partners";
import { ALL_SERVICES } from "../models/services";

const T = "#0d9488";

// ── C-Admins with assigned partner IDs ───────────────────────────────────────
const ALL_CADMINS = [
  { id: 1, name: "Alex R.", color: "#6366f1", partnerIds: [1, 2] },
  { id: 2, name: "Sara M.", color: "#0891b2", partnerIds: [3, 4, 5] },
  { id: 3, name: "James K.", color: "#d97706", partnerIds: [6, 7] },
  { id: 4, name: "Priya T.", color: "#16a34a", partnerIds: [8, 9, 10] },
];

const DAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
  "Mon",
  "Tue",
];

// ── getDayStats extended for StatsPerService (adds clicks + subs) ────────────
// Note: seededRand and getDayStats base are imported from trafficService.
// This local override adds clicks/subs fields needed only by this page.

function getHourStats(svc, hour) {
  const dailyBase = svc.baseTraffic / 30;
  const hourlyBase = dailyBase / 24;
  const variance = 0.3 + seededRand(svc.id * 41 + hour + 200) * 1.4;
  const total = Math.round(hourlyBase * variance);
  const blockRate = 0.08 + seededRand(svc.id * 19 + hour + 150) * 0.55;
  const blocked = Math.round(total * blockRate);
  const clean = total - blocked;
  const clicks = Math.round(
    total * (0.1 + seededRand(svc.id * 11 + hour + 50) * 0.25),
  );
  const subs = Math.round(
    clicks * (0.3 + seededRand(svc.id * 7 + hour + 80) * 0.4),
  );
  return { total, blocked, clean, clicks, subs, blockRate };
}

function buildServiceStats(svc, days) {
  const trend = [];

  if (days === 1) {
    // Today: 24 hourly points — current day + previous day overlay
    for (let h = 0; h < 24; h++) {
      const curr = getHourStats(svc, h);
      const prev = getHourStats(svc, h + 24);
      const label = `${String(h).padStart(2, "0")}:00`;
      trend.push({
        day: label,
        ...curr,
        prevTotal: prev.total,
        prevClean: prev.clean,
        prevBlocked: prev.blocked,
      });
    }
  } else {
    for (let d = days - 1; d >= 0; d--) {
      const curr = getDayStats(svc, d);
      const prev = getDayStats(svc, d + days);
      trend.push({
        day: DAY_LABELS[d] || `D${d + 1}`,
        ...curr,
        prevTotal: prev.total,
        prevClean: prev.clean,
        prevBlocked: prev.blocked,
      });
    }
  }

  let totals = { total: 0, blocked: 0, clean: 0, clicks: 0, subs: 0 };
  let prev = { total: 0, blocked: 0, clean: 0, clicks: 0, subs: 0 };
  for (let d = 0; d < days; d++) {
    const s = getDayStats(svc, d);
    totals.total += s.total;
    totals.blocked += s.blocked;
    totals.clean += s.clean;
    totals.clicks += s.clicks;
    totals.subs += s.subs;
  }
  for (let d = days; d < days * 2; d++) {
    const s = getDayStats(svc, d);
    prev.total += s.total;
    prev.blocked += s.blocked;
    prev.clean += s.clean;
    prev.clicks += s.clicks;
    prev.subs += s.subs;
  }

  const blockRate = totals.total > 0 ? totals.blocked / totals.total : 0;
  const deltaTotal =
    prev.total > 0 ? ((totals.total - prev.total) / prev.total) * 100 : 0;
  const deltaBlocked =
    prev.blocked > 0
      ? ((totals.blocked - prev.blocked) / prev.blocked) * 100
      : 0;
  const deltaClean =
    prev.clean > 0 ? ((totals.clean - prev.clean) / prev.clean) * 100 : 0;
  const deltaClicks =
    prev.clicks > 0 ? ((totals.clicks - prev.clicks) / prev.clicks) * 100 : 0;
  const deltaSubs =
    prev.subs > 0 ? ((totals.subs - prev.subs) / prev.subs) * 100 : 0;

  return {
    ...totals,
    blockRate,
    trend,
    deltaTotal,
    deltaBlocked,
    deltaClean,
    deltaClicks,
    deltaSubs,
  };
}

// fmt, pct, delta are imported from ../services/trafficService

// ── Mini delta badge ──────────────────────────────────────────────────────────
function Delta({ val, inverse = false }) {
  const d = delta(val);
  const isGood = inverse ? d.cls === "dn" : d.cls === "up";
  const color =
    d.cls === "neutral" ? "#94a3b8" : isGood ? "#16a34a" : "#dc2626";
  return (
    <span className="sps-delta">
      {d.sign} {d.label}
    </span>
  );
}

// ── Stat mini card ────────────────────────────────────────────────────────────
function StatChip({ label, value, deltaVal, accent, inverse }) {
  return (
    <div className="sps-svc-card">
      <div className="sps-eyebrow">{label}</div>
      <div className="sps-stat-val">{value}</div>
      {deltaVal !== undefined && (
        <div className="sps-mt3">
          <Delta val={deltaVal} inverse={inverse} />
        </div>
      )}
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
const PREV_KEY_MAP = {
  total: "prevTotal",
  clean: "prevClean",
  blocked: "prevBlocked",
};

function Spark({ data, dataKey, color }) {
  const prevKey = PREV_KEY_MAP[dataKey];
  const gradId = `sg-${dataKey}-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Previous period — dashed grey */}
        {prevKey && (
          <Area
            type="monotone"
            dataKey={prevKey}
            stroke="#cbd5e1"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            fill="none"
            dot={false}
          />
        )}
        {/* Current period — solid colored */}
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Block rate arc ────────────────────────────────────────────────────────────
function BlockArc({ rate, color }) {
  const r = 28,
    stroke = 6;
  const circ = 2 * Math.PI * r;
  const filled = circ * rate;
  return (
    <svg width={72} height={72} viewBox="0 0 72 72">
      <circle
        cx={36}
        cy={36}
        r={r}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={stroke}
      />
      <circle
        cx={36}
        cy={36}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
      />
      <text
        x={36}
        y={38}
        textAnchor="middle"
        fontSize={11}
        fontWeight={800}
        fill={color}
      >
        {pct(rate)}
      </text>
      <text x={36} y={50} textAnchor="middle" fontSize={7} fill="#94a3b8">
        blocked
      </text>
    </svg>
  );
}

// ── Service Row Card ──────────────────────────────────────────────────────────
function ServiceCard({
  svc,
  stats,
  partnerColor,
  partnerName,
  days,
  expanded,
  onToggle,
  isAdmin,
}) {
  const trendColor = stats.deltaTotal >= 0 ? GREEN : ROSE;

  return (
    <div className="sps-expand-card">
      {/* ── Header row ── */}
      <div onClick={onToggle} className="sps-svc-grid">
        {/* Name + partner */}
        <div>
          <div className="sps-svc-header">
            <span
              className="sps-color-dot"
              style={{ "--c": partnerColor }}
            />
            <span className="sps-name-sm">{svc.name}</span>
          </div>
          <div className="sps-sub-pl">{partnerName}</div>
        </div>

        {/* KPI chips */}
        <div className="td-right">
          <div className="sps-sub">Traffic</div>
          <div className="sps-val-lg">{fmt(stats.total)}</div>
          <Delta val={stats.deltaTotal} />
        </div>
        <div className="td-right">
          <div className="sps-sub">Clean</div>
          <div className="sps-val-clean">{fmt(stats.clean)}</div>
          <Delta val={stats.deltaClean} />
        </div>
        <div className="td-right">
          <div className="sps-sub">Blocked</div>
          <div className="sps-val-blocked">{fmt(stats.blocked)}</div>
          <Delta val={stats.deltaBlocked} inverse />
        </div>
        <div className="td-right">
          <div className="sps-sub">Clicks</div>
          <div className="sps-val-clicks">{fmt(stats.clicks)}</div>
          <Delta val={stats.deltaClicks} />
        </div>

        {/* Expand toggle */}
        <div className="sps-avatar-sm">▼</div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="sps-expand-body">
          <div className="sps-chart-grid">
            {/* Traffic trend */}
            <div className="sps-chart-card">
              <div className="sps-eyebrow sps-mb6">Traffic Trend ({days}d)</div>
              <Spark data={stats.trend} dataKey="total" color={partnerColor} />
            </div>

            {/* Clean trend */}
            <div className="sps-chart-card">
              <div className="sps-eyebrow sps-mb6">Clean Trend ({days}d)</div>
              <Spark data={stats.trend} dataKey="clean" color={GREEN} />
            </div>

            {/* Clicks + subs */}
            <div className="sps-chart-card">
              <div className="sps-eyebrow sps-mb6">Clicks & Subs ({days}d)</div>
              <Spark data={stats.trend} dataKey="clicks" color={BLUE} />
            </div>

            {/* Block rate arc */}
            <div className="sps-chart-card">
              <BlockArc
                rate={stats.blockRate}
                color={
                  stats.blockRate > 0.4
                    ? ROSE
                    : stats.blockRate > 0.2
                      ? AMBER
                      : GREEN
                }
              />
              <div className="sps-micro-c">
                {fmt(stats.blocked)} blocked
                <br />
                {fmt(stats.clean)} clean
              </div>
            </div>
          </div>

          {/* Bottom stat row */}
          <div className="sps-btns-mt">
            <StatChip
              label="Total Traffic"
              value={fmt(stats.total)}
              deltaVal={stats.deltaTotal}
            />
            <StatChip
              label="Clean"
              value={fmt(stats.clean)}
              deltaVal={stats.deltaClean}
              accent={GREEN}
            />
            <StatChip
              label="Blocked"
              value={fmt(stats.blocked)}
              deltaVal={stats.deltaBlocked}
              accent={ROSE}
              inverse
            />
            <StatChip
              label="Block Rate"
              value={pct(stats.blockRate)}
              accent={
                stats.blockRate > 0.4
                  ? ROSE
                  : stats.blockRate > 0.2
                    ? AMBER
                    : GREEN
              }
            />
            <StatChip
              label="Clicks"
              value={fmt(stats.clicks)}
              deltaVal={stats.deltaClicks}
              accent={BLUE}
            />
            <StatChip
              label="Subscriptions"
              value={fmt(stats.subs)}
              deltaVal={stats.deltaSubs}
              accent="#7c3aed"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Partner Group (admin view) ────────────────────────────────────────────────
function PartnerGroup({ partner, services, days, allExpanded }) {
  const [collapsed, setCollapsed] = useState(true);
  const [expandedSvc, setExpandedSvc] = useState(null);

  const partnerStats = useMemo(() => {
    let total = 0,
      blocked = 0,
      clean = 0,
      clicks = 0,
      subs = 0;
    services.forEach((svc) => {
      const s = buildServiceStats(svc, days);
      total += s.total;
      blocked += s.blocked;
      clean += s.clean;
      clicks += s.clicks;
      subs += s.subs;
    });
    return {
      total,
      blocked,
      clean,
      clicks,
      subs,
      blockRate: total > 0 ? blocked / total : 0,
    };
  }, [services, days]);

  return (
    <div className="sps-mb24">
      {/* Partner header */}
      <div
        onClick={() => setCollapsed((c) => !c)}
        className={`sps-partner-hd${collapsed ? " collapsed" : ""}`}
        style={{ "--c": partner.color }}
      >
        <div className="sps-row-gap10">
          <div
            className="sps-partner-avatar"
            style={{ "--c": partner.color }}
          >
            {partner.name[0]}
          </div>
          <div>
            <div className="sps-name">{partner.name}</div>
            <div className="sps-sub2">
              {services.length} service{services.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div className="sps-stats-row">
          <div className="td-right">
            <div className="sps-micro">Total</div>
            <div className="sps-val-md">{fmt(partnerStats.total)}</div>
          </div>
          <div className="td-right">
            <div className="sps-micro">Clean</div>
            <div className="sps-val-clean-sm">{fmt(partnerStats.clean)}</div>
          </div>
          <div className="td-right">
            <div className="sps-micro">Blocked</div>
            <div className="sps-val-blocked-sm">
              {fmt(partnerStats.blocked)}
            </div>
          </div>
          <div className="td-right">
            <div className="sps-micro">Block Rate</div>
            <div
              className={`sps-block-rate${partnerStats.blockRate > 0.3 ? " high" : " med"}`}
            >
              {pct(partnerStats.blockRate)}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const period = days === 1 ? "Today" : `${days} Days`;
              const rows = [
                [
                  "Service",
                  "Partner",
                  "Total Traffic",
                  "Clean",
                  "Blocked",
                  "Block Rate %",
                  "Clicks",
                  "Subscriptions",
                  "Period",
                ],
              ];
              services.forEach((svc) => {
                const s = buildServiceStats(svc, days);
                const blockRate =
                  s.total > 0
                    ? ((s.blocked / s.total) * 100).toFixed(1)
                    : "0.0";
                rows.push([
                  svc.name,
                  partner.name,
                  s.total,
                  s.clean,
                  s.blocked,
                  blockRate,
                  s.clicks,
                  s.subs,
                  period,
                ]);
              });
              const csv = rows
                .map((r) => r.map((v) => `"${v}"`).join(","))
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${partner.name.replace(/\s+/g, "-")}-${period}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="sps-row-gap5"
          >
            ⬇ Export
          </button>
          <div
            className={`sps-collapse-arrow${collapsed ? " collapsed" : ""}`}
            style={{ "--c": partner.color }}
          >
            ▼
          </div>
        </div>
      </div>

      {!collapsed && (
        <div className="ob-col-gap8">
          {services.map((svc) => {
            const stats = buildServiceStats(svc, days);
            return (
              <ServiceCard
                key={svc.id}
                svc={svc}
                stats={stats}
                partnerColor={partner.color}
                partnerName={partner.name}
                days={days}
                expanded={expandedSvc === svc.id}
                onToggle={() =>
                  setExpandedSvc((p) => (p === svc.id ? null : svc.id))
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Summary Bar Chart ────────────────────────────────────────────────────────
function SummaryChart({ services, days, isAdmin }) {
  const data = useMemo(() => {
    if (isAdmin) {
      // Admin: aggregate by partner, show top 10 partners
      const partnerMap = {};
      services.forEach((svc) => {
        const s = buildServiceStats(svc, days);
        const partner = ALL_PARTNERS.find((p) => p.id === svc.partnerId);
        if (!partner) return;
        if (!partnerMap[partner.id]) {
          partnerMap[partner.id] = {
            name:
              partner.name.length > 14
                ? partner.name.slice(0, 14) + "…"
                : partner.name,
            total: 0,
            blocked: 0,
            clean: 0,
            color: partner.color,
          };
        }
        partnerMap[partner.id].total += s.total;
        partnerMap[partner.id].blocked += s.blocked;
        partnerMap[partner.id].clean += s.clean;
      });
      return Object.values(partnerMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    } else {
      // Partner: top 10 services
      return services
        .map((svc) => {
          const s = buildServiceStats(svc, days);
          const partner = ALL_PARTNERS.find((p) => p.id === svc.partnerId);
          return {
            name: svc.name.length > 14 ? svc.name.slice(0, 14) + "…" : svc.name,
            total: s.total,
            blocked: s.blocked,
            clean: s.clean,
            color: partner?.color || T,
          };
        })
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    }
  }, [services, days, isAdmin]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 50 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f1f5f9"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9, fill: "#64748b", fontWeight: 600 }}
          angle={-40}
          textAnchor="end"
          interval={0}
          height={60}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 9, fill: "#cbd5e1" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
        />
        <Tooltip
          contentStyle={{
            fontSize: 11,
            borderRadius: 8,
            border: "none",
            background: "#0f172a",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(0,0,0,.4)",
          }}
          formatter={(v, name) => [fmt(v), name]}
        />
        <Bar dataKey="clean" name="Clean" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={GREEN} fillOpacity={0.85} />
          ))}
        </Bar>
        <Bar dataKey="blocked" name="Blocked" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={ROSE} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── KPI Summary Strip ─────────────────────────────────────────────────────────
function KpiStrip({ services, days }) {
  const totals = useMemo(() => {
    let total = 0,
      blocked = 0,
      clean = 0,
      clicks = 0,
      subs = 0;
    services.forEach((svc) => {
      const s = buildServiceStats(svc, days);
      total += s.total;
      blocked += s.blocked;
      clean += s.clean;
      clicks += s.clicks;
      subs += s.subs;
    });
    return {
      total,
      blocked,
      clean,
      clicks,
      subs,
      blockRate: total > 0 ? blocked / total : 0,
    };
  }, [services, days]);

  const kpis = [
    {
      label: "Total Traffic",
      value: fmt(totals.total),
      color: "#6366f1",
      icon: "📊",
    },
    { label: "Clean", value: fmt(totals.clean), color: GREEN, icon: "✅" },
    { label: "Blocked", value: fmt(totals.blocked), color: ROSE, icon: "🚫" },
    {
      label: "Block Rate",
      value: pct(totals.blockRate),
      color: totals.blockRate > 0.3 ? ROSE : AMBER,
      icon: "🔒",
    },
    { label: "Clicks", value: fmt(totals.clicks), color: BLUE, icon: "👆" },
    {
      label: "Subscriptions",
      value: fmt(totals.subs),
      color: "#7c3aed",
      icon: "📨",
    },
  ];

  return (
    <div className="sps-kpi-grid">
      {kpis.map((k) => (
        <div key={k.label} className="sps-card-white">
          <div className="sps-kpi-icon">{k.icon}</div>
          <div className="sps-kpi-val">{k.value}</div>
          <div className="sps-kpi-lbl">{k.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Days filter pill bar ──────────────────────────────────────────────────────
function DaysPicker({ value, onChange }) {
  const opts = [
    { label: "Today", val: 1 },
    { label: "7 Days", val: 7 },
    { label: "14 Days", val: 14 },
    { label: "30 Days", val: 30 },
  ];
  return (
    <div className="sps-btn-row">
      {opts.map((o) => (
        <button
          key={o.val}
          onClick={() => onChange(o.val)}
          className="sps-pill-btn"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── C-Admin Partner Row (inside C-Admin group) ───────────────────────────────
// ── C-Admin Group Row ────────────────────────────────────────────────────────
function CAdminGroup({ cadmin, days }) {
  const [collapsed, setCollapsed] = useState(true);
  const partners = ALL_PARTNERS.filter((p) => cadmin.partnerIds.includes(p.id));
  const allSvcs = ALL_SERVICES.filter((s) =>
    cadmin.partnerIds.includes(s.partnerId),
  );

  const totals = useMemo(() => {
    let total = 0,
      clean = 0,
      blocked = 0,
      clicks = 0,
      subs = 0;
    allSvcs.forEach((svc) => {
      const s = buildServiceStats(svc, days);
      total += s.total;
      clean += s.clean;
      blocked += s.blocked;
      clicks += s.clicks;
      subs += s.subs;
    });
    return {
      total,
      clean,
      blocked,
      blockRate: total > 0 ? blocked / total : 0,
      clicks,
      subs,
    };
  }, [allSvcs, days]);

  const handleExport = (e) => {
    e.stopPropagation();
    const period = days === 1 ? "Today" : `${days} Days`;
    const rows = [
      [
        "C-Admin",
        "Partner",
        "Service",
        "Total Traffic",
        "Clean",
        "Blocked",
        "Block Rate %",
        "Clicks",
        "Subscriptions",
        "Period",
      ],
    ];
    allSvcs.forEach((svc) => {
      const s = buildServiceStats(svc, days);
      const partner = ALL_PARTNERS.find((p) => p.id === svc.partnerId);
      const blockRate =
        s.total > 0 ? ((s.blocked / s.total) * 100).toFixed(1) : "0.0";
      rows.push([
        cadmin.name,
        partner?.name || "",
        svc.name,
        s.total,
        s.clean,
        s.blocked,
        blockRate,
        s.clicks,
        s.subs,
        period,
      ]);
    });
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cadmin.name.replace(/\s+/g, "-")}-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sps-expand-card">
      {/* ── C-Admin header — same style as PartnerGroup ── */}
      <div
        onClick={() => setCollapsed((v) => !v)}
        className={`sps-cadmin-hd${collapsed ? "" : " open"}`}
        style={{ "--c": cadmin.color }}
      >
        {/* Left: avatar + name */}
        <div className="sps-cadmin-row">
          <div
            className="sps-cadmin-avatar"
            style={{ "--c": cadmin.color }}
          >
            {cadmin.name[0]}
          </div>
          <div>
            <div className="sps-val-lg">{cadmin.name}</div>
            <div className="sps-sub">
              {partners.length} partner{partners.length !== 1 ? "s" : ""} ·{" "}
              {allSvcs.length} services
            </div>
          </div>
        </div>

        {/* Right: stats + export + chevron */}
        <div className="sps-stats-row">
          {[
            { label: "Total", val: fmt(totals.total), color: "#0f172a" },
            { label: "Clean", val: fmt(totals.clean), color: GREEN },
            { label: "Blocked", val: fmt(totals.blocked), color: ROSE },
            {
              label: "Block Rate",
              val: pct(totals.blockRate),
              color: totals.blockRate > 0.3 ? ROSE : AMBER,
            },
            { label: "Clicks", val: fmt(totals.clicks), color: BLUE },
          ].map(({ label, val, color }) => (
            <div key={label} className="td-right">
              <div className="sps-micro">{label}</div>
              <div className="sps-stat-val" style={{ "--c": color }}>{val}</div>
            </div>
          ))}
          <button onClick={handleExport} className="sps-row-gap5">
            ⬇ Export
          </button>
          <div
            className={`sps-collapse-arrow${collapsed ? " collapsed" : ""}`}
            style={{ "--c": cadmin.color }}
          >
            ▼
          </div>
        </div>
      </div>

      {/* ── Expanded: reuse PartnerGroup for each assigned partner ── */}
      {!collapsed && (
        <div className="sps-expand-body">
          {partners.map((p) => (
            <PartnerGroup
              key={p.id}
              partner={p}
              services={ALL_SERVICES.filter((s) => s.partnerId === p.id)}
              days={days}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── C-Admin Tab ───────────────────────────────────────────────────────────────
function CAdminTab({ days }) {
  // All services across all C-Admin assigned partners
  const allSvcs = ALL_SERVICES;

  return (
    <div>
      {/* KPI Strip */}
      <KpiStrip services={allSvcs} days={days} />

      {/* Summary chart */}
      <div className="sps-card-white-lg">
        <div className="sps-section-lbl">
          Top 10 Partners — Clean vs Blocked
        </div>
        <SummaryChart services={allSvcs} days={days} isAdmin={true} />
      </div>

      {/* C-Admin list */}
      <div className="sps-hint">
        {ALL_CADMINS.length} C-Admins · {ALL_PARTNERS.length} partners ·{" "}
        {ALL_SERVICES.length} services
      </div>
      {ALL_CADMINS.map((cadmin) => (
        <CAdminGroup key={cadmin.id} cadmin={cadmin} days={days} />
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PageStatsPerService({
  role = "admin",
  partnerName = "True Digital",
}) {
  const isAdmin = role === "admin";
  const [days, setDays] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("total");
  const [partnerFilter, setPartnerFilter] = useState("All");
  const [expandedSvc, setExpandedSvc] = useState(null);

  // Filter services based on role
  const myPartner =
    ALL_PARTNERS.find((p) => p.name === partnerName) || ALL_PARTNERS[0];
  const baseServices = isAdmin
    ? ALL_SERVICES
    : ALL_SERVICES.filter((s) => s.partnerId === myPartner.id);

  const filteredServices = useMemo(() => {
    let svcs = baseServices;
    if (search)
      svcs = svcs.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      );
    if (isAdmin && partnerFilter !== "All")
      svcs = svcs.filter((s) => s.partnerId === Number(partnerFilter));
    return svcs;
  }, [baseServices, search, partnerFilter, isAdmin]);

  // Build stats for all filtered services for sorting
  const enriched = useMemo(
    () =>
      filteredServices.map((svc) => ({
        svc,
        stats: buildServiceStats(svc, days),
      })),
    [filteredServices, days],
  );

  const sorted = useMemo(() => {
    return [...enriched].sort(
      (a, b) => (b.stats[sortBy] ?? 0) - (a.stats[sortBy] ?? 0),
    );
  }, [enriched, sortBy]);

  // Group by partner for admin view
  const groupedByPartner = useMemo(() => {
    if (!isAdmin) return null;
    const groups = {};
    sorted.forEach(({ svc, stats }) => {
      if (!groups[svc.partnerId]) groups[svc.partnerId] = [];
      groups[svc.partnerId].push({ svc, stats });
    });
    return groups;
  }, [sorted, isAdmin]);

  const [activeTab, setActiveTab] = useState("services");

  const sortOptions = [
    { val: "total", label: "Traffic" },
    { val: "clean", label: "Clean" },
    { val: "blocked", label: "Blocked" },
    { val: "clicks", label: "Clicks" },
    { val: "subs", label: "Subs" },
  ];

  return (
    <div className="sps-root">
      {/* ── Page Header ── */}
      <div className="ob-mb20">
        <div className="sps-page-title">
          {isAdmin ? "Stats per Service" : `${myPartner.name} — Service Stats`}
        </div>
        <div className="sps-sub-text">
          {isAdmin
            ? `${ALL_SERVICES.length} services across ${ALL_PARTNERS.length} partners`
            : `${baseServices.length} services · ${partnerName}`}
        </div>
      </div>

      {/* ── Tabs — C-Admin tab only visible to admin ── */}
      {isAdmin && (
        <div className="sps-tabs">
          {[
            { key: "services", label: "Stats per Service" },
            { key: "cadmin", label: "Stats per C-Admin" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`sps-tab-btn${activeTab === tab.key ? " active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === "cadmin" && <CAdminTab days={days} />}

      {
        activeTab === "services" && (
          <>
            {/* ── KPI Strip ── */}
            <KpiStrip services={filteredServices} days={days} />

            {/* ── Controls ── */}
            <div className="sps-expand-header">
              <div className="sps-filter-row">
                <DaysPicker value={days} onChange={setDays} />

                {/* Partner filter — admin only */}
                {isAdmin && (
                  <select
                    value={partnerFilter}
                    onChange={(e) => setPartnerFilter(e.target.value)}
                    className="sps-select-pill"
                  >
                    <option value="All">All Partners</option>
                    {ALL_PARTNERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Sort by */}
                <div className="sps-sort-row">
                  <span className="sps-sort-lbl">Sort by:</span>
                  {sortOptions.map((o) => (
                    <button
                      key={o.val}
                      onClick={() => setSortBy(o.val)}
                      className="sps-badge-pill"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sps-search-row">
                {/* Search */}
                <div className="ob-pos-rel">
                  <span className="sps-search-icon">🔍</span>
                  <input
                    placeholder="Search services…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="sps-search-input"
                  />
                </div>
                {/* Partner only: export ALL services (ignores current search/filter) */}
                {!isAdmin && (
                  <button
                    onClick={() => {
                      const period = days === 1 ? "Today" : `${days} Days`;
                      const rows = [
                        [
                          "Service",
                          "Partner",
                          "Total Traffic",
                          "Clean",
                          "Blocked",
                          "Block Rate %",
                          "Clicks",
                          "Subscriptions",
                          "Period",
                        ],
                      ];
                      ALL_SERVICES.filter(
                        (s) =>
                          s.partnerId ===
                          (
                            ALL_PARTNERS.find((p) => p.name === partnerName) ||
                            ALL_PARTNERS[0]
                          ).id,
                      ).forEach((svc) => {
                        const s = buildServiceStats(svc, days);
                        const partner = ALL_PARTNERS.find(
                          (p) => p.id === svc.partnerId,
                        );
                        const blockRate =
                          s.total > 0
                            ? ((s.blocked / s.total) * 100).toFixed(1)
                            : "0.0";
                        rows.push([
                          svc.name,
                          partner?.name || "",
                          s.total,
                          s.clean,
                          s.blocked,
                          blockRate,
                          s.clicks,
                          s.subs,
                          period,
                        ]);
                      });
                      const csv = rows
                        .map((r) => r.map((v) => `"${v}"`).join(","))
                        .join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `all-services-${period}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="sps-action-row"
                  >
                    ⬇ Export All Services
                  </button>
                )}
              </div>
            </div>

            {/* ── Summary chart ── */}
            <div className="sps-card-white-lg">
              <div className="sps-section-lbl">
                {isAdmin
                  ? "Top 10 Partners — Clean vs Blocked"
                  : "Top 10 Services — Clean vs Blocked"}
              </div>
              <SummaryChart
                services={filteredServices}
                days={days}
                isAdmin={isAdmin}
              />
            </div>

            {/* ── Content: grouped (admin) or flat (partner) ── */}
            {isAdmin ? (
              <div>
                {Object.entries(groupedByPartner).map(([partnerId, items]) => {
                  const partner = ALL_PARTNERS.find(
                    (p) => p.id === Number(partnerId),
                  );
                  if (!partner) return null;
                  return (
                    <PartnerGroup
                      key={partnerId}
                      partner={partner}
                      services={items.map((i) => i.svc)}
                      days={days}
                    />
                  );
                })}
                {Object.keys(groupedByPartner).length === 0 && (
                  <div className="sps-empty">
                    No services match your filter.
                  </div>
                )}
              </div>
            ) : (
              /* Partner flat list */
              <div className="ob-col-gap8">
                {sorted.length === 0 && (
                  <div className="sps-empty">No services found.</div>
                )}
                {sorted.map(({ svc, stats }) => (
                  <ServiceCard
                    key={svc.id}
                    svc={svc}
                    stats={stats}
                    partnerColor={myPartner.color}
                    partnerName={myPartner.name}
                    days={days}
                    expanded={expandedSvc === svc.id}
                    onToggle={() =>
                      setExpandedSvc((p) => (p === svc.id ? null : svc.id))
                    }
                  />
                ))}
              </div>
            )}
          </>
        ) /* end activeTab === "services" */
      }
    </div>
  );
}
