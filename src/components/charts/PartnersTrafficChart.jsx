import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { Card, SectionTitle } from "../../components/ui";
import { PALETTE } from "../../components/constants/colors";
import { ALL_PARTNERS } from "../../models/partners";
import { buildPartnerData, fmt } from "../../services/trafficService";
import ChartExportButton from "./ChartExportButton";

function DeltaBadge({ value }) {
  if (value === 0) return <span className="svc-tt-delta neutral">→ 0%</span>;
  const up = value > 0;
  return (
    <span className={`svc-tt-delta ${up ? "up" : "down"}`}>
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function TooltipRow({ label, total, blocked, suspect, clean, blockRate, suspectRate, cleanRate, muted, badge }) {
  return (
    <div className={`tt-row${muted ? " tt-row--muted" : ""}`}>
      <div className="tt-row-head">
        <span className="tt-row-label">{label}</span>
        <div className="tt-row-total-group">
          <span className="tt-row-total">{fmt(total)}</span>
          {badge}
        </div>
      </div>
      <div className="tt-row-metric">
        <div className="tt-row-metric-inner">
          <span className="tt-row-dot tt-row-dot--blocked" />
          <span className="tt-row-blocked-val">{fmt(blocked)}</span>
          <span className="tt-row-metric-label">Blocked</span>
        </div>
        <span className="tt-row-pct">({(blockRate * 100).toFixed(1)}%)</span>
      </div>
      <div className="tt-row-suspect-metric">
        <div className="tt-row-metric-inner">
          <span className="tt-row-dot tt-row-dot--suspect" />
          <span className="tt-row-suspect-val">{fmt(suspect)}</span>
          <span className="tt-row-metric-label">Suspect</span>
        </div>
        <span className="tt-row-pct">({(suspectRate * 100).toFixed(1)}%)</span>
      </div>
      <div className="tt-row-clean-metric">
        <div className="tt-row-metric-inner">
          <span className="tt-row-dot tt-row-dot--clean" />
          <span className="tt-row-clean-val">{fmt(clean)}</span>
          <span className="tt-row-metric-label">Clear</span>
        </div>
        <span className="tt-row-pct">
          ({(cleanRate * 100).toFixed(1)}%)
        </span>
      </div>
      <div className="tt-progress">
        <div
          className="tt-progress-blocked"
          style={{ width: `${Math.max(blockRate * 100, blocked ? 2 : 0)}%` }}
        />
        <div
          className="tt-progress-suspect"
          style={{ width: `${Math.max(suspectRate * 100, suspect ? 2 : 0)}%` }}
        />
        <div className="tt-progress-clean" />
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, days }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  if (d._hidden || !d.traffic) return null;
  const color = PALETTE[d.colorIdx % PALETTE.length];
  const todayLabel = days === 1 ? "Today" : `Last ${days}d`;
  const prevLabel = days === 1 ? "Yesterday" : `Prev ${days}d`;

  return (
    <div className="tt-wrap">
      <div className="tt-header">
        <div className="tt-name-wrap">
          <span className="tt-name">{d.name}</span>
          {d.services?.length > 0 && (
            <span className="tt-sub">
              {d.services.length} service{d.services.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <DeltaBadge value={d.trafficDelta} />
      </div>
      <div className="tt-body">
        <TooltipRow
          label={todayLabel}
          total={d.traffic}
          blocked={d.blocked}
          suspect={d.suspect}
          clean={d.clean}
          blockRate={d.blockRate}
          suspectRate={d.suspectRate}
          cleanRate={d.cleanRate}
        />
        <div className="tt-divider" />
        <TooltipRow
          label={prevLabel}
          total={d.prevTotal}
          blocked={d.prevBlocked}
          suspect={d.prevSuspect}
          clean={d.prevClean}
          blockRate={d.prevBlockRate}
          suspectRate={d.prevSuspectRate}
          cleanRate={d.prevCleanRate}
          muted
          badge={<DeltaBadge value={d.blockDelta} />}
        />
      </div>
      <div className="tt-footer">Click bar to filter charts below</div>
    </div>
  );
}

function BarValueLabel({ x, y, width, value }) {
  if (!value) return null;
  const label =
    value >= 1000000
      ? `${(value / 1000000).toFixed(1)}M`
      : value >= 1000
        ? `${(value / 1000).toFixed(0)}k`
        : String(value);
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fontSize={9}
      fontWeight={700}
      fill="#64748b"
    >
      {label}
    </text>
  );
}

const PAGE_SIZE = 10;

export default function PartnersTrafficChart({
  days = 1,
  onPartnerFilter,
  initialName = null,
  partnerPool = ALL_PARTNERS,
  title = "Partners by Traffic",
  showAll = false,
}) {
  const allData = useMemo(() => buildPartnerData(days, partnerPool), [days, partnerPool]);

  // Resolve initialName → id once on mount so the bar is pre-selected
  const initialId = useMemo(() => {
    if (!initialName) return null;
    const match = partnerPool.find(
      (p) => p.name.toLowerCase() === initialName.toLowerCase()
    );
    return match ? match.id : null;
  }, [initialName, partnerPool]);

  const [selected, setSelected] = useState(initialId);
  const [page, setPage] = useState(() => {
    if (!initialId || showAll) return 0;
    const idx = allData.findIndex((d) => d.id === initialId);
    return idx === -1 ? 0 : Math.floor(idx / PAGE_SIZE);
  });
  const totalPages = Math.ceil(allData.length / PAGE_SIZE);

  const pageData = useMemo(
    () => showAll ? allData : allData.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [allData, page, showAll],
  );

  const chartData = useMemo(
    () =>
      pageData.map((d) => ({
        ...d,
        traffic: selected === null || selected === d.id ? d.traffic : 0,
        _hidden: selected !== null && selected !== d.id,
      })),
    [pageData, selected],
  );

  useEffect(() => {
    setPage(0);
  }, [days, showAll]);

  useEffect(() => {
    if (onPartnerFilter) {
      const partner = selected
        ? partnerPool.find((p) => p.id === selected)
        : null;
      onPartnerFilter(partner ? partner.name : null);
    }
  }, [selected, onPartnerFilter, partnerPool]);

  function handleBarClick(entry) {
    if (!entry?.activePayload?.[0]) return;
    const clicked = entry.activePayload[0].payload;
    setSelected((prev) => (prev === clicked.id ? null : clicked.id));
  }

  const selectedName = selected
    ? partnerPool.find((p) => p.id === selected)?.name
    : null;
  const startRank = showAll ? 1 : page * PAGE_SIZE + 1;
  const endRank = showAll ? allData.length : Math.min(page * PAGE_SIZE + PAGE_SIZE, allData.length);

  return (
    <Card className="svc-chart-card mb-section">
      <div className="svc-chart-header">
        <div className="svc-chart-header-left">
          <SectionTitle>{title}</SectionTitle>
          <span className="svc-chart-period-badge">
            {days === 1 ? "Today" : `Last ${days} days`}
          </span>
          {selectedName && (
            <div className="svc-chart-active-filter">
              <span className="svc-chart-filter-label">Filtering:</span>
              <span className="svc-chart-filter-name">{selectedName}</span>
              <button
                className="svc-chart-filter-clear"
                onClick={() => setSelected(null)}
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>
        <div className="svc-chart-header-right">
          <ChartExportButton
            title={title}
            data={pageData}
            fields={[
              { key: "name", label: "Partner" },
              { key: "traffic", label: "Traffic" },
              { key: "blocked", label: "Blocked" },
              { key: "suspect", label: "Suspect" },
              { key: "clean", label: "Clear" },
              { key: "blockRate", label: "Block Rate" },
              { key: "trafficDelta", label: "Traffic Delta %" },
            ]}
          />
          <span className="svc-chart-hint">
            {selected
              ? "Click same bar to clear"
              : "Click any bar to filter charts below ↓"}
          </span>
          {showAll ? (
            <span className="svc-chart-page-info">
              {startRank}–{endRank}{" "}
              <span className="svc-chart-page-total">/ {allData.length}</span>
            </span>
          ) : (
            <div className="svc-chart-pager">
              <button
                className={`svc-chart-page-btn${page === 0 ? " disabled" : ""}`}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                ‹
              </button>
              <span className="svc-chart-page-info">
                {startRank}–{endRank}{" "}
                <span className="svc-chart-page-total">/ {allData.length}</span>
              </span>
              <button
                className={`svc-chart-page-btn${page === totalPages - 1 ? " disabled" : ""}`}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="svc-chart-scroll-wrap">
        <div
          className="chart-scroll-inner"
          style={showAll ? { "--chart-min-w": `${Math.max(900, pageData.length * 86)}px` } : undefined}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={chartData}
              margin={{ top: 24, right: 20, bottom: 10, left: 10 }}
              onClick={handleBarClick}
              className="cur-pointer"
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                angle={-42}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#cbd5e1" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000000
                    ? `${(v / 1000000).toFixed(1)}M`
                    : v >= 1000
                      ? `${(v / 1000).toFixed(0)}k`
                      : v
                }
              />
              <Tooltip
                content={<CustomTooltip days={days} />}
                cursor={{ fill: "rgba(99,102,241,.05)" }}
                wrapperStyle={{
                  outline: "none",
                  border: "none",
                  background: "none",
                  boxShadow: "none",
                  padding: 0,
                  zIndex: 9999,
                }}
                contentStyle={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  boxShadow: "none",
                }}
                itemStyle={{ padding: 0 }}
                labelStyle={{ display: "none" }}
              />
              <Bar dataKey="traffic" radius={[5, 5, 0, 0]} maxBarSize={52}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={PALETTE[entry.colorIdx % PALETTE.length]}
                    opacity={selected === null || selected === entry.id ? 1 : 0}
                  />
                ))}
                <LabelList dataKey="traffic" content={<BarValueLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="svc-chart-legend-scroll">
        <div className="svc-chart-legend">
          {pageData.map((entry) => (
            <button
              key={entry.id}
              title={entry.name}
              className={[
                "svc-chart-legend-item",
                selected === entry.id ? "active" : "",
                selected !== null && selected !== entry.id ? "dimmed" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                setSelected((p) => (p === entry.id ? null : entry.id))
              }
            >
              <span
                className="svc-chart-legend-dot"
              />
              <span className="svc-chart-legend-name">{entry.name}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
