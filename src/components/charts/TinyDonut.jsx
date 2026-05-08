import { BLUE } from "../../components/constants/colors";

const COLOR_CLICKS = "#7c3aed"; // purple — clicks (same across all cards)
const COLOR_VISITS = "#06b6d4"; // cyan   — visits (same across all cards)

/**
 * TinyDonut — two-color SVG donut comparing clicks vs visits.
 * Both colors are fixed regardless of which card it appears in.
 */
export default function TinyDonut({ clicks, visits, pct, color = BLUE }) {
  const SIZE = 72;
  const R    = 26;
  const SW   = 11;
  const CIRC = 2 * Math.PI * R;
  const cx   = SIZE / 2;
  const cy   = SIZE / 2;

  const useComparison = clicks !== undefined && visits !== undefined;
  const total  = useComparison ? clicks + visits : 100;
  const aDash  = useComparison
    ? (clicks / total) * CIRC
    : ((pct ?? 25) / 100) * CIRC;
  const bDash  = CIRC - aDash;

  const fillA  = useComparison ? COLOR_CLICKS : color;
  const fillB  = useComparison ? COLOR_VISITS : "#e8ecf3";
  const label  = useComparison
    ? `${Math.round((clicks / total) * 100)}%`
    : `${pct ?? 25}%`;

  return (
    <div className="tiny-donut-wrap">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="tiny-donut-svg">
        {/* Full circle — visits (cyan) */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={fillB} strokeWidth={SW} />
        {/* Clicks arc — purple */}
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={fillA}
          strokeWidth={SW}
          strokeDasharray={`${aDash} ${bDash}`}
          strokeLinecap="butt"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div className="tiny-donut-label">{label}</div>
    </div>
  );
}
