import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, SectionTitle } from "../components/ui";
import { TransactionsModal } from "../components/modals";
import {
  BLUE,
  GREEN,
  AMBER,
  ROSE,
  SLATE,
  PALETTE,
} from "../components/constants/colors";
import { geoSpreadData } from "../data/tables";

function lonToX(lon) {
  return ((lon + 180) / 360) * 600;
}
function latToY(lat) {
  return ((90 - lat) / 180) * 420;
}

const COUNTRY_SHAPES = [
  { code: "SD", name: "Sudan", lon: 30, lat: 15, w: 60, h: 55 },
  { code: "ZA", name: "South Africa", lon: 25, lat: -29, w: 55, h: 40 },
  { code: "NG", name: "Nigeria", lon: 8, lat: 8, w: 30, h: 30 },
  { code: "ET", name: "Ethiopia", lon: 40, lat: 9, w: 40, h: 35 },
  { code: "KE", name: "Kenya", lon: 37, lat: 0, w: 30, h: 30 },
  { code: "EG", name: "Egypt", lon: 30, lat: 26, w: 45, h: 30 },
  { code: "GH", name: "Ghana", lon: -1, lat: 8, w: 18, h: 20 },
  { code: "TZ", name: "Tanzania", lon: 35, lat: -6, w: 30, h: 28 },
  { code: "UG", name: "Uganda", lon: 32, lat: 1, w: 18, h: 18 },
  { code: "ZM", name: "Zambia", lon: 28, lat: -14, w: 28, h: 25 },
  { code: "US", name: "United States", lon: -100, lat: 38, w: 80, h: 40 },
];

function GeoMap({ data, onCountryClick }) {
  const maxVal = Math.max(...data.map((d) => d.visits));
  const byCode = Object.fromEntries(data.map((d) => [d.code, d]));
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 0.5;

  function handleZoomIn() {
    setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  }
  function handleZoomOut() {
    setZoom((z) => {
      const next = Math.max(z - ZOOM_STEP, MIN_ZOOM);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }
  function handleReset() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function handleMouseDown(e) {
    if (zoom === 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }
  function handleMouseMove(e) {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }
  function handleMouseUp() {
    setDragging(false);
  }

  function handleWheel(e) {
    e.preventDefault();
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
  }

  return (
    <div className="map-wrap">
      {/* Zoom controls */}
      <div className="geo-zoom-controls">
        <button
          className="geo-zoom-btn"
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          title="Zoom in"
        >
          +
        </button>
        <span className="geo-zoom-level">{Math.round(zoom * 100)}%</span>
        <button
          className="geo-zoom-btn"
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          title="Zoom out"
        >
          −
        </button>
        <button
          className="geo-zoom-btn geo-zoom-reset"
          onClick={handleReset}
          disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
          title="Reset"
        >
          ⊙
        </button>
      </div>

      <div
        className={`geo-canvas-wrap${dragging ? " dragging" : ""}${zoom > 1 ? " zoomable" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div className={`geo-canvas-inner geo-zoom-${Math.round(zoom * 100)}`}>
          <svg viewBox="0 0 600 420" className="map-img">
            <rect width="600" height="420" fill="#d6eaf8" rx="8" />

            {[-60, -30, 0, 30, 60].map((lat) => (
              <line
                key={lat}
                x1="0"
                y1={latToY(lat)}
                x2="600"
                y2={latToY(lat)}
                stroke="#b3d4ec"
                strokeWidth="0.5"
                strokeDasharray="4,4"
              />
            ))}
            {[-120, -60, 0, 60, 120].map((lon) => (
              <line
                key={lon}
                x1={lonToX(lon)}
                y1="0"
                x2={lonToX(lon)}
                y2="420"
                stroke="#b3d4ec"
                strokeWidth="0.5"
                strokeDasharray="4,4"
              />
            ))}

            {[
              "M 370 100 L 440 95 L 460 120 L 455 200 L 430 260 L 395 295 L 370 290 L 345 265 L 330 220 L 335 150 Z",
              "M 340 40 L 430 35 L 445 70 L 420 85 L 380 80 L 345 70 Z",
              "M 450 35 L 680 30 L 720 80 L 700 130 L 640 150 L 560 145 L 490 120 L 455 90 Z",
              "M 50 50 L 200 45 L 220 100 L 200 160 L 150 175 L 80 160 L 45 110 Z",
              "M 150 190 L 220 185 L 235 260 L 210 320 L 165 330 L 135 290 L 130 230 Z",
              "M 580 230 L 660 225 L 675 270 L 650 300 L 590 295 L 565 265 Z",
            ].map((d, i) => (
              <path
                key={i}
                d={d}
                fill="#c8ddb0"
                stroke="#a8c890"
                strokeWidth="1"
              />
            ))}

            {COUNTRY_SHAPES.map((c) => {
              const d = byCode[c.code];
              if (!d) return null;
              const intensity = d.visits / maxVal;
              const alpha = 0.3 + intensity * 0.65;
              const x = lonToX(c.lon) - c.w / 2;
              const y = latToY(c.lat) - c.h / 2;
              return (
                <g
                  key={c.code}
                  onClick={() => onCountryClick && onCountryClick(c.name)}
                  className={onCountryClick ? "p-rel clickable" : ""}
                >
                  <rect
                    x={x}
                    y={y}
                    width={c.w}
                    height={c.h}
                    rx="4"
                    fill={BLUE}
                    fillOpacity={alpha}
                    stroke={BLUE}
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                  />
                  <text
                    x={x + c.w / 2}
                    y={y + c.h / 2 - 4}
                    textAnchor="middle"
                    fontSize="7"
                    fill="#fff"
                    fontWeight="600"
                  >
                    {c.code}
                  </text>
                  <text
                    x={x + c.w / 2}
                    y={y + c.h / 2 + 7}
                    textAnchor="middle"
                    fontSize="7"
                    fill="rgba(255,255,255,.9)"
                  >
                    {d.visits.toLocaleString()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="geo-legend-row">
        <span className="stat-label-sm">30</span>
        <div className="geo-grad-bar" />
        <span className="stat-label-sm">
          {Math.max(...geoSpreadData.map((d) => d.visits)).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// ── Recharts config constants ──────────────────────────────────────────────
const CHART_TICK_SM = { fontSize: 9, fill: "#cbd5e1" };
const CHART_TICK_MD = { fontSize: 10, fill: "#64748b" };
const CHART_MARGIN_R = { top: 0, right: 20, left: 10, bottom: 0 };

const CHART_TOOLTIP = {
  fontSize: 11,
  borderRadius: 8,
  border: "none",
  background: "#0f172a",
  color: "#fff",
  boxShadow: "0 8px 24px rgba(0,0,0,.4)",
};
export default function PageGeo() {
  const sortedData = [...geoSpreadData].sort((a, b) => b.visits - a.visits);
  const [modal, setModal] = useState(null);
  const open = (title) => setModal(title);
  const close = () => setModal(null);
  const [perPageGeo, setPerPageGeo] = useState(10);
  const geoVisible = sortedData.slice(0, perPageGeo);

  return (
    <div className="geo-page-wrap">
      {/* Summary stats */}
      <div className="g-stats4 mb-section">
        {[
          {
            label: "Countries Reached",
            value: "12",
            color: BLUE,
            tone: "cc-blue",
            clickable: false,
          },
          {
            label: "Top Country",
            value: "Sudan",
            color: ROSE,
            tone: "cc-red",
            clickable: false,
          },
          {
            label: "Total Visits",
            value: "5,23,690",
            color: GREEN,
            tone: "cc-emerald",
            clickable: true,
          },
          {
            label: "Total Clicks",
            value: "2,31,000",
            color: AMBER,
            tone: "cc-amber",
            clickable: true,
          },
        ].map((s) => (
          <Card
            key={s.label}
            onClick={
              s.clickable ? () => open(`${s.label} — Transactions`) : undefined
            }
            className={`${s.clickable ? "stat-card-click" : "stat-card-click-opt"} ${s.tone}`}
          >
            <div className={`kpi-stat-sm dyn-color ${s.tone}`}>
              {s.value}
            </div>
            <div className="stat-lbl-12">{s.label}</div>
            {s.clickable && (
              <div className="stat-hint">View Transactions ↗</div>
            )}
          </Card>
        ))}
      </div>

      {/* World map */}
      <Card className="mb-18">
        <div className="toolbar">
          <SectionTitle>Geo Spread</SectionTitle>
          <button className="geo-collapse-btn">≡</button>
        </div>
        <GeoMap
          data={geoSpreadData}
          onCountryClick={(country) => open(`${country} — Transactions`)}
        />
      </Card>

      {/* Bar chart + table */}
      <div className="g-halves">
        <Card>
          <SectionTitle>Visits by Country</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={CHART_MARGIN_R}
            >
              <XAxis
                type="number"
                tick={CHART_TICK_SM}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="country"
                width={90}
                tick={CHART_TICK_MD}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Bar
                dataKey="visits"
                name="Visits"
                radius={[0, 4, 4, 0]}
                onClick={(data) => open(`${data.country} — Transactions`)}
                className="p-rel clickable"
              >
                {sortedData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>Country Breakdown</SectionTitle>
          <div className="dt-entries-bar">
            <span className="dt-entries-lbl">Show</span>
            <select
              className="dt-entries-sel"
              value={perPageGeo}
              onChange={(e) => setPerPageGeo(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="dt-entries-lbl">entries</span>
          </div>
          <div className="page-table-scroll">
            <table className="dt">
              <thead>
                <tr className="dt-head-row">
                  {["Country", "Visits", "Clicks", "Share", ""].map((h) => (
                    <th key={h} className="dt-th">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {geoVisible.map((r, i) => (
                  <tr
                    key={i}
                    className="dt-tr"
                    onClick={() => open(`${r.country} — Transactions`)}
                  >
                    <td className="td-p-num">
                      <div className="f-gap-7">
                        <div className={`color-square pie-palette-${i % PALETTE.length}`} />
                        {r.country}
                      </div>
                    </td>
                    <td className="td-p-mono-sm">
                      {r.visits.toLocaleString()}
                    </td>
                    <td className="td-p-mono-sm">
                      {r.clicks.toLocaleString()}
                    </td>
                    <td className="geo-td-blue">{r.pct}%</td>
                    <td className="geo-td-narrow">
                      <div className="progress-track">
                        <div className={`progress-bar pie-palette-${i % PALETTE.length} ts-w-${Math.round(r.pct / 5) * 5}`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {modal && <TransactionsModal title={modal} onClose={close} />}
    </div>
  );
}
