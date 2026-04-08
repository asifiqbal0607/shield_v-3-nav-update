/**
 * services/trafficService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure business-logic functions for traffic data calculations.
 * No React, no JSX — fully testable in isolation.
 *
 * Extracted from:
 *   - components/charts/ServicesTrafficChart.jsx  (seededRand, getDayStats, buildServiceData)
 *   - components/charts/PartnersTrafficChart.jsx  (getDayStats, buildPartnerData — identical logic)
 */

// ── Deterministic pseudo-random ───────────────────────────────────────────────
// Uses a seeded LCG so data is stable across renders (no Math.random).
export function seededRand(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ── Single-day stats for one entity (service or partner) ─────────────────────
// dayOffset: 0 = today, 1 = yesterday, 2 = two days ago, …
export function getDayStats(entity, dayOffset) {
  const dailyBase = entity.baseTraffic / 30;
  const variance  = 0.6 + seededRand(entity.id * 31 + dayOffset) * 0.8;
  const total     = Math.round(dailyBase * variance);
  const blockRate = 0.08 + seededRand(entity.id * 17 + dayOffset + 99) * 0.55;
  const blocked   = Math.round(total * blockRate);
  const clean     = total - blocked;
  return { total, blocked, clean, blockRate };
}

// ── Build aggregated data for a pool of services ──────────────────────────────
// Returns array sorted by descending traffic, each row containing:
//   current period totals + previous period totals + delta percentages
export function buildServiceData(days, servicePool) {
  return servicePool
    .map((svc, idx) => {
      let total = 0, blocked = 0;
      for (let d = 0; d < days; d++) {
        const s = getDayStats(svc, d);
        total   += s.total;
        blocked += s.blocked;
      }
      const clean     = total - blocked;
      const blockRate = total > 0 ? blocked / total : 0;

      let prevTotal = 0, prevBlocked = 0;
      for (let d = 0; d < days; d++) {
        const s  = getDayStats(svc, d + days);
        prevTotal   += s.total;
        prevBlocked += s.blocked;
      }
      const prevClean     = prevTotal - prevBlocked;
      const prevBlockRate = prevTotal > 0 ? prevBlocked / prevTotal : 0;

      const trafficDelta = prevTotal   > 0 ? ((total   - prevTotal)   / prevTotal)   * 100 : 0;
      const blockDelta   = prevBlocked > 0 ? ((blocked - prevBlocked) / prevBlocked) * 100 : 0;

      return {
        id: svc.id,
        name: svc.name,
        colorIdx: idx,
        traffic: total, blocked, clean, blockRate,
        prevTotal, prevBlocked, prevClean, prevBlockRate,
        trafficDelta, blockDelta,
      };
    })
    .sort((a, b) => b.traffic - a.traffic);
}

// ── Build aggregated data for a pool of partners ──────────────────────────────
// Same logic as buildServiceData but also carries the partner's service list.
export function buildPartnerData(days, partnerPool) {
  return partnerPool
    .map((partner, idx) => {
      let total = 0, blocked = 0;
      for (let d = 0; d < days; d++) {
        const s = getDayStats(partner, d);
        total   += s.total;
        blocked += s.blocked;
      }
      const clean     = total - blocked;
      const blockRate = total > 0 ? blocked / total : 0;

      let prevTotal = 0, prevBlocked = 0;
      for (let d = 0; d < days; d++) {
        const s = getDayStats(partner, d + days);
        prevTotal   += s.total;
        prevBlocked += s.blocked;
      }
      const prevClean     = prevTotal - prevBlocked;
      const prevBlockRate = prevTotal > 0 ? prevBlocked / prevTotal : 0;

      const trafficDelta = prevTotal   > 0 ? ((total   - prevTotal)   / prevTotal)   * 100 : 0;
      const blockDelta   = prevBlocked > 0 ? ((blocked - prevBlocked) / prevBlocked) * 100 : 0;

      return {
        id: partner.id,
        name: partner.name,
        services: partner.services,
        colorIdx: idx,
        traffic: total, blocked, clean, blockRate,
        prevTotal, prevBlocked, prevClean, prevBlockRate,
        trafficDelta, blockDelta,
      };
    })
    .sort((a, b) => b.traffic - a.traffic);
}

// ── Number formatters ─────────────────────────────────────────────────────────
// Shared across tooltips, bar labels, and stat chips.

/** Format large numbers: 1.42M, 59.1k, 123 */
export function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

/** Format a 0–1 ratio as a percentage string: 0.431 → "43.1%" */
export function pct(n) {
  return `${(n * 100).toFixed(1)}%`;
}

/**
 * Classify a delta percentage into a direction object.
 * @param {number} n – delta as a plain number (e.g. 12.3 means +12.3%)
 * @returns {{ sign: string, cls: "up"|"dn"|"neutral", label: string }}
 */
export function delta(n) {
  if (Math.abs(n) < 0.05) return { sign: "→", cls: "neutral", label: "0%" };
  const up = n > 0;
  return {
    sign: up ? "▲" : "▼",
    cls: up ? "up" : "dn",
    label: `${Math.abs(n).toFixed(1)}%`,
  };
}

// ── Filter scale helper ───────────────────────────────────────────────────────
// Given a selected entity name and the full data array, returns a 0–1 scale
// factor representing that entity's share of total traffic.
// Used by Overview to proportionally scale histogram data when a bar is clicked.
export function getFilterScale(selectedName, dataArr) {
  if (!selectedName) return 1;
  const row        = dataArr.find((d) => d.name === selectedName);
  if (!row) return 1;
  const grandTotal = dataArr.reduce((s, d) => s + d.traffic, 0);
  return Math.max(0.04, row.traffic / grandTotal);
}
