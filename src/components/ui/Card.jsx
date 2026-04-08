/**
 * Card — base surface used across every page.
 * ➜ Appearance (bg, radius, shadow, padding) controlled by theme.js → card.*
 *    which writes CSS vars consumed by the .card class in global.css.
 */
export default function Card({
  children,
  style = {},
  className = "",
  ...props
}) {
  return (
    <div className={`card ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}
