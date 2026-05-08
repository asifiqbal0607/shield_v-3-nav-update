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
    const id = "app-theme-vars";
    let tag = document.getElementById(id);
    if (!tag) {
      tag = document.createElement("style");
      tag.id = id;
      document.head.appendChild(tag);
    }
    tag.textContent = `:root{${Object.entries(vars)
      .map(([key, val]) => `${key}:${val};`)
      .join("")}}`;
  }, []);

  return children;
}
