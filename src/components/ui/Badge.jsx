import { BLUE } from "../../components/constants/colors";

/**
 * Badge — a small pill-shaped label.
 * @param {string}  children  Text to display
 * @param {string}  color     Hex color for foreground + tinted background
 */
export default function Badge({ children, color = BLUE }) {
  return (
    <span
    >
      {children}
    </span>
  );
}
