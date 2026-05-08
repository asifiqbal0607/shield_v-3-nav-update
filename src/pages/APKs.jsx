import { useState, useRef, useCallback, useMemo } from "react";
import ServicesTrafficChart from "../components/charts/ServicesTrafficChart";
import PartnersTrafficChart from "../components/charts/PartnersTrafficChart";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, SectionTitle, Badge, StatusDot } from "../components/ui";
import { TransactionsModal } from "../components/modals";
import {
  BLUE,
  GREEN,
  AMBER,
  ROSE,
  PALETTE,
} from "../components/constants/colors";
import {
  PIE_TOOLTIP_WRAPPER,
  PIE_TOOLTIP_CONTENT,
} from "../components/constants/chartStyles";
import {
  PieTooltip,
  ChartContextMenu,
} from "../components/charts/PieChartHelpers";
import {
  trustedApkData,
  cleanApkData,
  spoofedApkData,
  hiddenApkData,
} from "../data/tables";

const RISK_COLORS = { Low: GREEN, Medium: AMBER, High: ROSE };

function ApkPieCard({ title, data, onSliceClick, serviceFilter }) {
  const containerRef = useRef(null);
  const isFiltered = Boolean(serviceFilter);
  const filteredData = useMemo(() => {
    if (!isFiltered) return data;
    const seed = serviceFilter
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0);
    return data.map((d, i) => ({
      ...d,
      value: Math.max(
        1,
        Math.round(d.value * (0.4 + ((seed * (i + 7)) % 100) / 150)),
      ),
    }));
  }, [data, serviceFilter, isFiltered]);

  const total = filteredData.reduce((s, d) => s + d.value, 0);

  return (
    <Card className={isFiltered ? "pie-card-filtered" : ""}>
      <div className="ov-chart-header">
        <SectionTitle>{title}</SectionTitle>
        <div className="pie-card-header-right">
          {isFiltered && (
            <span
              className="pie-filter-badge"
              title={`Filtered by: ${serviceFilter}`}
            >
              🔍{" "}
              {serviceFilter.length > 20
                ? serviceFilter.slice(0, 20) + "…"
                : serviceFilter}
            </span>
          )}
          <ChartContextMenu
            containerRef={containerRef}
            data={filteredData}
            title={title}
          />
        </div>
      </div>
      <div ref={containerRef} className="pie-chart-area">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={filteredData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="38%"
              outerRadius="72%"
              paddingAngle={2}
              onClick={(entry) => onSliceClick && onSliceClick(entry.name)}
              className="p-rel clickable"
            >
              {filteredData.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              content={<PieTooltip />}
              wrapperStyle={PIE_TOOLTIP_WRAPPER}
              contentStyle={PIE_TOOLTIP_CONTENT}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="pie-legend-grid">
        {filteredData.map((d, i) => (
          <div
            key={d.name}
            className="pie-legend-item"
            onClick={() => onSliceClick && onSliceClick(d.name)}
          >
            <span
              className={`pie-legend-dot pie-palette-${i % PALETTE.length}`}
            />
            <span className="pie-legend-name">
              {d.name.length > 18 ? d.name.slice(0, 18) + "…" : d.name}
            </span>
            <span className="pie-legend-pct">
              {total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%
            </span>
          </div>
        ))}
      </div>
      <div className="stat-hint-center">
        {isFiltered
          ? `Showing data for: ${serviceFilter}`
          : "Click a slice to view transactions ↗"}
      </div>
    </Card>
  );
}

const TYPE_META = {
  "Blocked Apps": { risk: "Low", status: "active" },
  Clean: { risk: "Low", status: "active" },
  Specified: { risk: "Medium", status: "warning" },
  Hidden: { risk: "High", status: "blocked" },
};

function buildTop20() {
  const all = [
    ...trustedApkData.map((d) => ({ ...d, type: "Blocked Apps" })),
    ...cleanApkData.map((d) => ({ ...d, type: "Clean" })),
    ...spoofedApkData.map((d) => ({ ...d, type: "Specified" })),
    ...hiddenApkData.map((d) => ({ ...d, type: "Hidden" })),
  ];
  return all
    .sort((a, b) => b.value - a.value)
    .slice(0, 20)
    .map((d, i) => ({
      rank: i + 1,
      name: d.name,
      type: d.type,
      share: d.value,
      risk: TYPE_META[d.type].risk,
      status: TYPE_META[d.type].status,
    }));
}

export default function PageAPKs({ role = "admin" }) {
  const isPartner = role === "partner";
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [serviceFilter, setServiceFilter] = useState(null);
  const [days] = useState(1);
  const open = (title) => setModal(title);
  const close = () => setModal(null);
  const handleServiceFilter = useCallback((name) => setServiceFilter(name), []);
  const top20 = buildTop20();
  const [perPage, setPerPage] = useState(10);
  const filtered = top20.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.type.toLowerCase().includes(query.toLowerCase()),
  );
  const rows = filtered.slice(0, perPage);

  return (
    <div>
      <div className="g-stats3 mb-section">
        {[
          { label: "Total APKs", value: "170", color: BLUE, tone: "cc-blue" },
          { label: "Clean APKs", value: "142", color: GREEN, tone: "cc-emerald" },
          { label: "Flagged APKs", value: "28", color: ROSE, tone: "cc-red" },
        ].map((s) => (
          <Card
            key={s.label}
            onClick={() => open(`${s.label} — Transactions`)}
            className={`stat-card-click ${s.tone}`}
          >
            <div className={`dyn-color ${s.tone}`}>
              {s.value}
            </div>
            <div className="stat-lbl-12">{s.label}</div>
            <div className="stat-hint">View Transactions ↗</div>
          </Card>
        ))}
      </div>

      {isPartner ? (
        <ServicesTrafficChart
          days={days}
          onServiceFilter={handleServiceFilter}
        />
      ) : (
        <PartnersTrafficChart
          days={days}
          onPartnerFilter={handleServiceFilter}
        />
      )}

      <div className="g-halves mb-section">
        <ApkPieCard
          title="Block APKs"
          data={trustedApkData}
          onSliceClick={(n) => open(`${n} — Transactions`)}
          serviceFilter={serviceFilter}
        />
        <ApkPieCard
          title="Clean APKs"
          data={cleanApkData}
          onSliceClick={(n) => open(`${n} — Transactions`)}
          serviceFilter={serviceFilter}
        />
      </div>
      <div className="g-halves mb-18">
        <ApkPieCard
          title="Spoofed APKs"
          data={spoofedApkData}
          onSliceClick={(n) => open(`${n} — Transactions`)}
          serviceFilter={serviceFilter}
        />
        <ApkPieCard
          title="Hidden APKs"
          data={hiddenApkData}
          onSliceClick={(n) => open(`${n} — Transactions`)}
          serviceFilter={serviceFilter}
        />
      </div>

      <Card>
        <div className="toolbar">
          <div className="f-gap-8">
            <SectionTitle className="m-0">Top 20 Apps</SectionTitle>
          </div>
          <div className="f-gap-12">
            <div className="dt-entries-bar">
              <span>Show</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="dt-entries-sel"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span>entries</span>
            </div>
            <input
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="apk-search"
            />
          </div>
        </div>
        <div className="apk-table-scroll-wrap">
          <table className="dt apk-table-fixed">
            <colgroup>
              <col className="apk-col-48" />
              <col className="apk-col-35" />
              <col className="apk-col-130" />
              <col className="apk-col-110" />
              <col className="apk-col-100" />
              <col className="apk-col-120" />
            </colgroup>
            <thead>
              <tr className="dt-head-row">
                <th className="dt-th td-center">#</th>
                <th className="dt-th td-left">Package Name</th>
                <th className="dt-th td-center">Type</th>
                <th className="dt-th td-right-pr">Share %</th>
                <th className="dt-th td-center">Risk</th>
                <th className="dt-th td-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={i}
                  className="dt-tr"
                  onClick={() => open(`${r.name} — Transactions`)}
                >
                  <td className="apk-td-rank">{r.rank}</td>
                  <td className="apk-mono-cell">{r.name}</td>
                  <td className="td-center-p">
                    <Badge
                      color={
                        r.type === "Blocked Apps"
                          ? GREEN
                          : r.type === "Clean"
                            ? BLUE
                            : r.type === "Specified"
                              ? AMBER
                              : ROSE
                      }
                    >
                      {r.type}
                    </Badge>
                  </td>
                  <td className="apk-td-share">{r.share}%</td>
                  <td className="td-center-p">
                    <Badge color={RISK_COLORS[r.risk]}>{r.risk}</Badge>
                  </td>
                  <td className="td-center-p">
                    <span className="apk-inline-row">
                      <StatusDot status={r.status} />
                      <span className="apk-ver-text">{r.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {modal && <TransactionsModal title={modal} onClose={close} role={role} />}
    </div>
  );
}
