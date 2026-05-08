import { SLATE } from '../../components/constants/colors';

/**
 * ChartTooltip — a styled recharts custom tooltip.
 * Drop it into any Recharts chart as `<Tooltip content={<ChartTooltip />} />`.
 */
export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div
    >
      <div>{label}</div>
      {payload.map((p, i) => (
        <div key={i}>
          {p.name}:{' '}
          <strong>
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </strong>
        </div>
      ))}
    </div>
  );
}
