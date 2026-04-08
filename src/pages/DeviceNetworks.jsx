import { useState, useRef, useCallback, useMemo } from "react";
import ServicesTrafficChart from "../components/charts/ServicesTrafficChart";
import PartnersTrafficChart from "../components/charts/PartnersTrafficChart";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, SectionTitle } from "../components/ui";
import { TransactionsModal } from "../components/modals";
import { PALETTE } from "../components/constants/colors";
import {
  PIE_TOOLTIP_WRAPPER,
  PIE_TOOLTIP_CONTENT,
} from "../components/constants/chartStyles";
import {
  PieTooltip,
  ChartContextMenu,
} from "../components/charts/PieChartHelpers";
import {
  topDevicesData,
  topOsData,
  topBrowsersData,
  topNetworksData,
} from "../data/tables";

function StatPieCard({ title, data, onSliceClick, serviceFilter }) {
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
              className="pie-legend-dot"
              style={{ "--c": PALETTE[i % PALETTE.length] }}
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

export default function PageDevice({ role = "admin" }) {
  const isPartner = role === "partner";
  const [modal, setModal] = useState(null);
  const [serviceFilter, setServiceFilter] = useState(null);
  const [days] = useState(1);
  const open = (title) => setModal(title);
  const close = () => setModal(null);
  const handleServiceFilter = useCallback((name) => setServiceFilter(name), []);

  const stats = [
    {
      label: "Unique Devices",
      value: "48,291",
      color: "#1d4ed8",
      clickable: true,
    },
    { label: "Top OS", value: "Android", color: "#f59e0b", clickable: true },
    {
      label: "Top Browser",
      value: "Chrome",
      color: "#8b5cf6",
      clickable: true,
    },
  ];

  return (
    <div>
      <div className="g-stats3 mb-section">
        {stats.map((s) => (
          <Card
            key={s.label}
            onClick={
              s.clickable ? () => open(`${s.label} — Transactions`) : undefined
            }
            className={s.clickable ? "stat-card-click" : "stat-card-click-opt"}
            style={{ "--c": s.color }}
            onMouseEnter={
              s.clickable
                ? (e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,.1)")
                : undefined
            }
            onMouseLeave={
              s.clickable
                ? (e) => (e.currentTarget.style.boxShadow = "")
                : undefined
            }
          >
            <div className="dyn-color" style={{ "--c": s.color }}>
              {s.value}
            </div>
            <div className="stat-lbl-12">{s.label}</div>
            {s.clickable && (
              <div className="stat-hint">View Transactions ↗</div>
            )}
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
        <StatPieCard
          title="Top 10 Devices"
          data={topDevicesData}
          onSliceClick={(n) => open(`${n} — Transactions`)}
          serviceFilter={serviceFilter}
        />
        <StatPieCard
          title="Top 10 Operating Systems"
          data={topOsData}
          onSliceClick={(n) => open(`${n} — Transactions`)}
          serviceFilter={serviceFilter}
        />
      </div>
      <div className="g-halves">
        <StatPieCard
          title="Top 10 Browsers"
          data={topBrowsersData}
          onSliceClick={(n) => open(`${n} — Transactions`)}
          serviceFilter={serviceFilter}
        />
        <StatPieCard
          title="Top 10 Networks"
          data={topNetworksData}
          onSliceClick={(n) => open(`${n} — Transactions`)}
          serviceFilter={serviceFilter}
        />
      </div>

      {modal && <TransactionsModal title={modal} onClose={close} role={role} />}
    </div>
  );
}
