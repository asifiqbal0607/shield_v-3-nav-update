import { useState, useEffect } from 'react';
import { theme } from '../config/theme';

const { mobile, tablet } = theme.breakpoints;

function calc(w) {
  if (w < mobile) return 'mobile';
  if (w < tablet) return 'tablet';
  return 'desktop';
}

/**
 * useBreakpoint — returns 'mobile' | 'tablet' | 'desktop'
 * Updates live on resize. Breakpoints defined in theme.js.
 */
export function useBreakpoint() {
  const [bp, set] = useState(() =>
    typeof window !== 'undefined' ? calc(window.innerWidth) : 'desktop'
  );
  useEffect(() => {
    const fn = () => set(calc(window.innerWidth));
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return bp;
}

export const isMobile  = (bp) => bp === 'mobile';
export const isTablet  = (bp) => bp === 'tablet';
export const isDesktop = (bp) => bp === 'desktop';
export const isSmall   = (bp) => bp === 'mobile' || bp === 'tablet';
