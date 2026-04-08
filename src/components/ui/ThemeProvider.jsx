import { useEffect } from 'react';
import { buildCSSVars } from '../config/theme';

/**
 * ThemeProvider
 * ─────────────────────────────────────────────────
 * Wrap your <App /> with this ONCE in main.jsx:
 *
 *   <ThemeProvider>
 *     <App />
 *   </ThemeProvider>
 *
 * On mount it writes every value from theme.js as a
 * CSS custom property on :root — so every component
 * automatically picks up changes made in theme.js.
 *
 * To restyle the entire app:  edit src/config/theme.js
 */
export default function ThemeProvider({ children }) {
  useEffect(() => {
    const vars = buildCSSVars();
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }, []);

  return children;
}
