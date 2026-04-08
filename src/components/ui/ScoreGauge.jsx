function fmtNum(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

function describeArc(cx, cy, r, startDeg, endDeg) {
  const toRad = d => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

const LEGEND = [
  { key: "clean",   label: "Clean",     cls: "clean"   },
  { key: "suspect", label: "Low Risk",  cls: "suspect" },
  { key: "blocked", label: "High Risk", cls: "blocked" },
];

export default function ScoreGauge({ clean = 0, suspect = 0, blocked = 0 }) {
  const total = (clean + suspect + blocked) || 1;
  const cleanPct   = clean   / total;
  const suspectPct = suspect / total;
  const blockedPct = blocked / total;

  const cx = 110, cy = 110, r = 75;
  const START = 180, END = 360;
  const SWEEP = END - START;

  const cleanEnd   = START + SWEEP * cleanPct;
  const suspectEnd = cleanEnd + SWEEP * suspectPct;

  const dominant = cleanPct >= suspectPct && cleanPct >= blockedPct ? "clean"
    : suspectPct >= blockedPct ? "suspect" : "blocked";

  const needleMid = dominant === "clean"
    ? START + SWEEP * (cleanPct / 2)
    : dominant === "suspect"
    ? cleanEnd + SWEEP * (suspectPct / 2)
    : suspectEnd + SWEEP * (blockedPct / 2);

  const toRad = d => (d * Math.PI) / 180;
  const needleX = cx + 60 * Math.cos(toRad(needleMid));
  const needleY = cy + 60 * Math.sin(toRad(needleMid));
  const dominantCount = dominant === "clean" ? clean : dominant === "suspect" ? suspect : blocked;

  const vals = { clean, suspect, blocked };

  return (
    <div className={`ov2-gauge-wrap ov2-gauge-wrap--${dominant}`}>
      <svg viewBox="0 0 220 120" className="ov2-gauge-svg">
        {/* Track */}
        <path d={describeArc(cx, cy, r, START, END)}
          className="ov2-gauge-arc ov2-gauge-arc--bg" />

        {/* Clean */}
        {cleanPct > 0.001 && (
          <path d={describeArc(cx, cy, r, START, cleanEnd - 0.5)}
            className="ov2-gauge-arc ov2-gauge-arc--clean" />
        )}
        {/* Suspect */}
        {suspectPct > 0.001 && (
          <path d={describeArc(cx, cy, r, cleanEnd + 0.5, suspectEnd - 0.5)}
            className="ov2-gauge-arc ov2-gauge-arc--suspect" />
        )}
        {/* Blocked */}
        {blockedPct > 0.001 && (
          <path d={describeArc(cx, cy, r, suspectEnd + 0.5, END)}
            className="ov2-gauge-arc ov2-gauge-arc--blocked" />
        )}

        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY}
          className="ov2-gauge-needle" />
        <circle cx={cx} cy={cy} r={5}
          className="ov2-gauge-needle-pivot" />

        {/* Count */}
        <text x={cx} y={cy - 10} textAnchor="middle"
          className="ov2-gauge-num">{fmtNum(dominantCount)}</text>
      </svg>

      <div className="ov2-gauge-legend">
        {LEGEND.map(({ key, label, cls }) => (
          <div key={key} className="ov2-gauge-legend-item">
            <span className={`ov2-gauge-legend-dot ov2-gauge-legend-dot--${cls}`} />
            <span className="ov2-gauge-legend-label">{label}</span>
            <span className="ov2-gauge-legend-val">{fmtNum(vals[key])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}