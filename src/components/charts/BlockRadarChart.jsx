import { useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from "recharts";
import { SLATE } from "../../components/constants/colors";
import { blockReasons, blockLegend } from "../../data/charts";

// ─── Dark tooltip ─────────────────────────────────────────────────────────────
function RadarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="brc-tooltip">
      <div className="brc-tooltip-title">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="brc-row-between">
          <div className="brc-legend-row">
            <div
              className="brc-tooltip-dot" style={{ "--dot-color": p.color }}
            />
            <span className="brc-legend-val">{p.name}</span>
          </div>
          <span className="brc-legend-key">
            {Number(p.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Pill day label — clickable if onDayClick provided ───────────────────────
function DayTick({ x, y, payload, onDayClick }) {
  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={
        onDayClick
          ? (e) => {
              e.stopPropagation();
              onDayClick(payload.value);
            }
          : undefined
      }
      className={onDayClick ? "brc-day-tick brc-day-tick--clickable" : "brc-day-tick"}
    >
      <rect
        x={-22}
        y={-11}
        width={44}
        height={22}
        rx={11}
        fill="#eff6ff"
        stroke="none"
        strokeWidth={0}
      />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#1d4ed8"
        fontSize={11}
        fontWeight={700}
      >
        {payload.value}
      </text>
    </g>
  );
}

/**
 * BlockRadarChart
 * @param {number}   height       Chart height in px (default 300)
 * @param {boolean}  showBadge    Show "7-day view" badge (default true)
 * @param {number}   seriesLimit  How many series to show (default 5)
 * @param {function} onChartClick Called only when the radar graph area is clicked
 */
export default function BlockRadarChart({
  height = 300,
  showBadge = true,
  seriesLimit = 5,
  onChartClick,
  onDayClick,
}) {
  const [hidden, setHidden] = useState({});
  const [hovered, setHovered] = useState(null);

  const toggle = (key) => setHidden((h) => ({ ...h, [key]: !h[key] }));
  const series = blockLegend.slice(0, seriesLimit);

  // Sum each series across all days for the hover tooltip
  const totals = series.reduce((acc, b) => {
    acc[b.key] = blockReasons.reduce((sum, day) => sum + (day[b.key] || 0), 0);
    return acc;
  }, {});

  return (
    <div className="brc-card">
      {/* Header */}
      <div className="brc-header">
        <div>
          <div className="brc-title">Weekly Block Pattern</div>
          <div className="brc-sub">Threat distribution by day of week</div>
        </div>
        {showBadge && <div className="brc-day-badge">7-day view</div>}
      </div>

      {/* ── Radar — no wrapper click, button below triggers modal ── */}
      <div className="ov-radar-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={blockReasons}
            margin={{ top: 16, right: 50, bottom: 16, left: 50 }}
          >
            <PolarGrid
              gridType="polygon"
              stroke="#dde5f5"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={<DayTick onDayClick={onDayClick} />}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5500]}
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              axisLine={false}
              tickCount={4}
            />
            <Tooltip content={<RadarTooltip />} />
            {series.map(
              (b) =>
                !hidden[b.key] && (
                  <Radar
                    key={b.key}
                    name={b.key}
                    dataKey={b.key}
                    stroke={b.color}
                    strokeWidth={2}
                    fill={b.color}
                    fillOpacity={0.18}
                    dot={{ fill: b.color, r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  />
                ),
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend — NOT inside the click zone ── */}
      <div className="brc-legend-wrap">
        {series.map((b) => (
          <div key={b.key} className="pos-rel">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggle(b.key);
              }}
              onMouseEnter={() => setHovered(b.key)}
              onMouseLeave={() => setHovered(null)}
              className={`brc-legend-btn${hidden[b.key] ? " brc-legend-btn--hidden" : ""}`}
              style={{ "--legend-bg": `${b.color}18` }}
            >
              <div className="brc-legend-dot" style={{ "--dot-color": b.color, "--dot-shadow": `0 0 4px ${b.color}88` }} />
              <span className="brc-bar-label">{b.key}</span>
            </button>

            {/* Hover count tooltip */}
            {hovered === b.key && (
              <div className="brc-popover-top">
                <div className="brc-hint">7-day total</div>
                <div className="brc-popover-total" style={{ "--dot-color": b.color }}>
                  {totals[b.key]?.toLocaleString() ?? "--"}
                </div>
                <div className="brc-popover-bot" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
