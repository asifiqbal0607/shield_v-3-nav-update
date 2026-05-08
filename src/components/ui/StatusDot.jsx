import { STATUS_COLORS, SLATE } from "../../components/constants/colors";

/**
 * StatusDot — a small glowing circle indicating a row's live status.
 * @param {'active'|'warning'|'blocked'|'paused'} status
 */
export default function StatusDot({ status }) {
  const color = STATUS_COLORS[status] ?? SLATE;
  return (
    <span
    />
  );
}
