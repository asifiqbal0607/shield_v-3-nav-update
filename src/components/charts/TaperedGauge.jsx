import { SLATE } from '../../components/constants/colors';

const W = 480, H = 258, cx = W / 2, cy = 210;
const D = Math.PI / 180;
const START_DEG = 200, TOTAL_DEG = 140;

const SEGMENTS = [
  { t0: 0,    t1: 0.62, color: '#43a84a' },
  { t0: 0.62, t1: 0.76, color: '#ffc107' },
  { t0: 0.76, t1: 1,    color: '#f44336' },
];

const NEEDLE_T = 0.72; // position of the needle (0–1)

function getRadius(t) {
  return { inner: 97 - t * 26, outer: 98 + t * 22 };
}

function polarPoint(deg, r) {
  return { x: cx + r * Math.cos(deg * D), y: cy + r * Math.sin(deg * D) };
}

function f(n) { return n.toFixed(2); }

function buildPath(t0, t1) {
  const N = 60;
  const outer = [], inner = [];

  for (let i = 0; i <= N; i++) {
    const t   = t0 + (t1 - t0) * (i / N);
    const deg = START_DEG + t * TOTAL_DEG;
    const { inner: ri, outer: ro } = getRadius(t);
    outer.push(polarPoint(deg, ro));
    inner.push(polarPoint(deg, ri));
  }

  let d = `M${f(outer[0].x)},${f(outer[0].y)}`;
  outer.slice(1).forEach((p) => { d += ` L${f(p.x)},${f(p.y)}`; });
  d += ` L${f(inner[N].x)},${f(inner[N].y)}`;
  for (let i = N - 1; i >= 0; i--) d += ` L${f(inner[i].x)},${f(inner[i].y)}`;
  return d + ' Z';
}

/**
 * TaperedGauge — SVG arc gauge used on the Overview page.
 * The needle position and displayed value can be customised via props.
 *
 * @param {number} needleT  0–1 position of the needle (default 0.72)
 * @param {string} label    Value displayed below the needle (default '500k')
 */
export default function TaperedGauge({ needleT = NEEDLE_T, label = '500k' }) {
  const nDeg = START_DEG + needleT * TOTAL_DEG;
  const tip  = polarPoint(nDeg, 85);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => START_DEG + t * TOTAL_DEG);

  const lClean   = polarPoint(START_DEG + 2,                  130);
  const lLowRisk = polarPoint(START_DEG + TOTAL_DEG * 0.5,    130);
  const lHighRisk = polarPoint(START_DEG + TOTAL_DEG - 2,     130);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {/* Tick marks */}
      {ticks.map((deg, i) => {
        const a = polarPoint(deg, 104);
        const b = polarPoint(deg, 116);
        return (
          <line key={i} x1={f(a.x)} y1={f(a.y)} x2={f(b.x)} y2={f(b.y)}
            stroke="#d0d8e4" strokeWidth="2" />
        );
      })}

      {/* Coloured arc segments */}
      {SEGMENTS.map((s, i) => (
        <path key={i} d={buildPath(s.t0, s.t1)} fill={s.color} />
      ))}

      {/* Needle */}
      <line x1={f(cx)} y1={f(cy)} x2={f(tip.x)} y2={f(tip.y)}
        stroke="#1a1a2e" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={f(cx)} cy={f(cy)} r="13" fill="#1a1a2e" />
      <circle cx={f(cx)} cy={f(cy)} r="5"  fill="#fff" />

      {/* Zone labels */}
      <text x={f(lClean.x - 14)}    y={f(lClean.y)}    fontSize="11" fill={SLATE} textAnchor="middle" fontWeight="600">Clean</text>
      <text x={f(lLowRisk.x)}       y={f(lLowRisk.y - 6)} fontSize="11" fill={SLATE} textAnchor="middle" fontWeight="600">Low Risk</text>
      <text x={f(lHighRisk.x + 18)} y={f(lHighRisk.y)} fontSize="11" fill={SLATE} textAnchor="middle" fontWeight="600">High Risk</text>

      {/* Central value */}
      <text x={f(cx)} y={f(cy + 55)} fontSize="48" fontWeight="900" fill="#1a1a2e"
        textAnchor="middle" fontFamily="var(--font-display)">
        {label}
      </text>
    </svg>
  );
}
