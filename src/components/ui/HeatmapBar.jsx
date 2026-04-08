import { useState } from "react";

export default function HeatmapBar({ data }) {
  const max   = Math.max(...data.map(d => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const LABELS = { 0: "12a", 6: "6a", 12: "12p", 18: "6p", 23: "11p" };
  const [hovered, setHovered] = useState(null);

  // Format hour label e.g. "2:00 AM" / "3:00 PM"
  function fmtHour(h) {
    if (h === 0)  return "12:00 AM";
    if (h < 12)  return `${h}:00 AM`;
    if (h === 12) return "12:00 PM";
    return `${h - 12}:00 PM`;
  }

  return (
    <div className="ov2-heatmap">
      <div className="ov2-heatmap-bars">
        {data.map((d) => {
          const pct    = d.value / max;
          const sharePct = total > 0 ? (d.value / total * 100) : 0;
          const isHov  = hovered === d.h;

          return (
            <div
              key={d.h}
              className={`ov2-heatmap-col${isHov ? " is-hovered" : ""}`}
              onMouseEnter={() => setHovered(d.h)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHov && (
                <div className="ov2-heatmap-tip">
                  <div className="ov2-heatmap-tip-hour">{fmtHour(d.h)}</div>
                  <div className="ov2-heatmap-tip-row">
                    <span className="ov2-heatmap-tip-label">Transactions</span>
                    <span className="ov2-heatmap-tip-val">{d.value.toLocaleString()}</span>
                  </div>
                  <div className="ov2-heatmap-tip-row">
                    <span className="ov2-heatmap-tip-label">Previous Hour</span>
                    <span className="ov2-heatmap-tip-val">{sharePct.toFixed(1)}%</span>
                  </div>
                  <div className="ov2-heatmap-tip-track">
                    <div className="ov2-heatmap-tip-fill" style={{ "--w": `${sharePct}%` }} />
                  </div>
                </div>
              )}
              <div
                className="ov2-heatmap-bar"
                style={{ "--h": `${Math.max(6, pct * 100)}%`, "--o": 0.15 + pct * 0.85 }}
              />
            </div>
          );
        })}
      </div>
      <div className="ov2-heatmap-axis">
        {data.map((d) => (
          <div key={d.h} className="ov2-heatmap-tick-slot">
            {LABELS[d.h] && <span className="ov2-heatmap-tick">{LABELS[d.h]}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}