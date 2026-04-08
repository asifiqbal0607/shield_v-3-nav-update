/**
 * hooks/useTrafficData.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Controller hook for the traffic bar charts (Partners / Services).
 *
 * Manages:
 *   - which bar is currently selected (null = all)
 *   - the filterScale derived from that selection (used to scale histogram)
 *
 * Used by: Overview.jsx
 *
 * @param {Array}  dataArr — the built traffic data array (from buildPartnerData or buildServiceData)
 * @returns {{ selectedName, setSelectedName, filterScale, clearSelection }}
 */

import { useState, useMemo, useCallback } from "react";
import { getFilterScale } from "../services/trafficService";

export function useTrafficData(dataArr) {
  const [selectedName, setSelectedName] = useState(null);

  const filterScale = useMemo(
    () => getFilterScale(selectedName, dataArr ?? []),
    [selectedName, dataArr],
  );

  const clearSelection = useCallback(() => setSelectedName(null), []);

  return { selectedName, setSelectedName, filterScale, clearSelection };
}
