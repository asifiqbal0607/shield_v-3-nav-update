import { BLUE } from "../../components/constants/colors";

/**
 * Badge — a small pill-shaped label.
 * @param {string}  children  Text to display
 * @param {string}  color     Hex color for foreground + tinted background
 */
export default function Badge({ children, color = BLUE }) {
  return (
    <span
      style={{
        background: `${color}14`,
        color,
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 20,
        border: `1px solid ${color}30`,
      }}
    >
      {children}
    </span>
  );
}
