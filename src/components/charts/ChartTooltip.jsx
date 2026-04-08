import { SLATE } from '../../components/constants/colors';

/**
 * ChartTooltip — a styled recharts custom tooltip.
 * Drop it into any Recharts chart as `<Tooltip content={<ChartTooltip />} />`.
 */
export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 11,
        boxShadow: '0 4px 16px rgba(0,0,0,.08)',
      }}
    >
      <div style={{ color: SLATE, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, lineHeight: 1.7 }}>
          {p.name}:{' '}
          <strong style={{ color: '#1a1a2e' }}>
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </strong>
        </div>
      ))}
    </div>
  );
}
