import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import { Card, SectionTitle, Badge } from "../components/ui";
import { BlockRadarChart, ChartTooltip } from "../components/charts";
import { TransactionsModal } from "../components/modals";
import {
  ROSE,
  AMBER,
  GREEN,
  SLATE,
  BLUE,
} from "../components/constants/colors";
import { blkRows } from "../data/tables";

const SEVERITY_COLORS = {
  Critical: ROSE,
  High: AMBER,
  Medium: GREEN,
  // Low: GREEN,
};

const SUMMARY_STATS = [
  { label: "Total Blocked", value: "15,39,810", color: ROSE, tone: "cc-red" },
  { label: "Critical Events", value: "2,53,660", color: ROSE, tone: "cc-red" },
  { label: "Clean", value: "6,15,350", color: GREEN, tone: "cc-emerald" },
  // { label: "Auto-Resolved", value: "8,24,110", color: GREEN },
];

function blockTone(index) {
  return ["cc-blue", "cc-red", "cc-pink", "cc-amber", "cc-emerald", "cc-slate", "cc-purple", "cc-cyan2"][index % 8];
}

function blockWidthClass(pct) {
  return `ts-w-${Math.round(Math.min(100, pct * 3.5) / 5) * 5}`;
}

// ── Recharts config constants ──────────────────────────────────────────────
const CHART_TICK_X = { fontSize: 9, fill: "#cbd5e1" };
const CHART_TICK_Y = { fontSize: 9, fill: "#64748b" };
const CHART_MARGIN_0 = { top: 0, right: 10, left: 10, bottom: 0 };

export default function PageBlocking() {
  const [modal, setModal] = useState(null);
  const open = (title) => setModal(title);
  const close = () => setModal(null);
  const [perPageBlk, setPerPageBlk] = useState(10);
  const blkVisible = blkRows.slice(0, perPageBlk);

  return (
    <div className="block-page-wrap">
      {/* Summary stats */}
      <div className="g-stats3 mb-section">
        {SUMMARY_STATS.map((s) => (
          <Card
            key={s.label}
            onClick={() => open(`${s.label} — Transactions`)}
            className={`stat-card-click ${s.tone}`}
          >
            <div className={`kpi-stat-sm dyn-color ${s.tone}`}>
              {s.value}
            </div>
            <div className="stat-lbl">{s.label}</div>
            <div className="stat-hint">View Transactions ↗</div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="g-split mb-section">
        <Card>
          <BlockRadarChart
            height={200}
            showBadge={true}
            onDayClick={(day) => open(`${day} Block Pattern — Transactions`)}
          />
        </Card>

        <Card>
          <SectionTitle>Volume by Reason</SectionTitle>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={blkRows} layout="vertical" margin={CHART_MARGIN_0}>
              <XAxis
                type="number"
                tick={CHART_TICK_X}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="reason"
                tick={CHART_TICK_Y}
                axisLine={false}
                tickLine={false}
                width={130}
                tickFormatter={(v) =>
                  v.length > 16 ? v.slice(0, 16) + "…" : v
                }
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="pct"
                name="Share %"
                radius={[0, 4, 4, 0]}
                onClick={(data) => open(`${data.reason} — Transactions`)}
                className="p-rel clickable"
              >
                {blkRows.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Full Breakdown Block Reason */}
      <Card>
        <SectionTitle>Full Breakdown Block Reasons</SectionTitle>
        <div className="dt-entries-bar">
          <span className="dt-entries-lbl">Show</span>
          <select
            className="dt-entries-sel"
            value={perPageBlk}
            onChange={(e) => setPerPageBlk(Number(e.target.value))}
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
                {[
                  "Block Reason",
                  "Count",
                  "Share",
                  "7d Trend",
                  "Severity",
                  "Progress",
                ].map((h) => (
                  <th key={h} className="dt-th">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blkVisible.map((r, i) => (
                <tr
                  key={i}
                  className="dt-tr"
                  onClick={() => open(`${r.reason} — Transactions`)}
                >
                  <td className="p-sm">
                    <div className="f-gap-9">
                      <div className={`bl-color-square ${blockTone(i)}`} />
                      <span className="txt-strong">{r.reason}</span>
                    </div>
                  </td>
                  <td className="bl-td-mono">{r.count}</td>
                  <td className={`bl-td-color ${blockTone(i)}`}>
                    {r.pct}%
                  </td>
                  <td
                    className={`bl-td-trend ${r.trend.startsWith("+") ? "txt-danger" : "txt-success"}`}
                  >
                    {r.trend}
                  </td>
                  <td className="p-sm">
                    <Badge color={SEVERITY_COLORS[r.sev]}>{r.sev}</Badge>
                  </td>
                  <td className="bl-td-wide">
                    <div className="progress-track">
                      <div className={`progress-bar ${blockTone(i)} ${blockWidthClass(r.pct)}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Transactions modal */}
      {modal && <TransactionsModal title={modal} onClose={close} />}
    </div>
  );
}
