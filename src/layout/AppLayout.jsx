import { useMemo, useState } from "react";
import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import FilterSidebar, { DEFAULT_FILTERS } from "./FilterSidebar";
import { ALL_PAGES } from "../components/constants/nav";
import { FiltersIcon } from "../components/ui/Icons";

const FILTER_LABELS = {
  search: "Search",
  fromDate: "From",
  toDate: "To",
  service: "Service",
  network: "Network",
  os: "OS",
  platform: "Platform",
  googleType: "Google",
  customVar: "Variable",
};

function formatFilterValue(key, value) {
  if (key === "fromDate" || key === "toDate") {
    const dt = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(dt.getTime())) {
      return dt.toLocaleDateString();
    }
  }
  return String(value);
}

function getActiveFilters(filters) {
  const active = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (!(key in FILTER_LABELS)) return;
    if (value === DEFAULT_FILTERS[key]) return;
    if (String(value).trim() === "") return;
    active[key] = value;
  });
  return active;
}

export default function AppLayout({
  role,
  setRole,
  page,
  setPage,
  onLogout,
  children,
  capLimit = null,
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [drawerFilters, setDrawerFilters] = useState(DEFAULT_FILTERS);

  const activeFilters = useMemo(() => getActiveFilters(drawerFilters), [drawerFilters]);

  const curPage = ALL_PAGES.find((p) => p.key === page);
  const curLabel = curPage?.label ?? "Dashboard";
  const isAdminOnly = curPage?.roles?.includes("admin") && !curPage?.roles?.includes("partner");

  function fmt(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
    return n.toLocaleString();
  }

  function handleApplyFilters(nextFilters) {
    setDrawerFilters(nextFilters);
    setPage("overview", { globalFilters: nextFilters });
    setFilterOpen(false);
  }

  function handleResetFilters() {
    setDrawerFilters(DEFAULT_FILTERS);
    setPage("overview", { globalFilters: DEFAULT_FILTERS });
  }

  function handleRemoveFilter(key) {
    const next = {
      ...drawerFilters,
      [key]: DEFAULT_FILTERS[key],
    };
    setDrawerFilters(next);
    setPage("overview", { globalFilters: next });
  }

  function handleClearAllFilters() {
    setDrawerFilters(DEFAULT_FILTERS);
    setPage("overview", { globalFilters: DEFAULT_FILTERS });
  }

  return (
    <div className="app-shell">
      <TopNav role={role} setPage={setPage} onLogout={onLogout} />

      <div className="app-below-topbar">
        <Sidebar role={role} page={page} setPage={setPage} />

        {filterOpen && (
          <>
            <div className="app-filter-backdrop" onClick={() => setFilterOpen(false)} />
            <div className="app-filter-drawer">
              <FilterSidebar
                role={role}
                setRole={setRole}
                setPage={setPage}
                filters={drawerFilters}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
              />
            </div>
            <button type="button" className="app-drawer-close" onClick={() => setFilterOpen(false)}>x</button>
          </>
        )}

        <main className="page-main">
          <div className="app-breadcrumb-row">
            <div className="app-breadcrumb-left">
              <span className="app-bc-sep">Shield</span>
              <span className="app-bc-trail">&gt;</span>
              <span className="app-bc-current">{curLabel}</span>
              {isAdminOnly && <span className="app-env-badge">Admin only</span>}

              {role === "partner" && capLimit && (() => {
                const used = capLimit.used ?? 0;
                const pct = Math.round((used / capLimit.value) * 100);
                const col = pct >= 90 ? "#dc2626" : pct >= 60 ? "#d97706" : "#0369a1";
                return (
                  <div className="app-cap-inline">
                    <span className="app-cap-inline-icon">Cap</span>
                    <span className="app-cap-inline-divider" />
                    <span className="app-cap-inline-used">{fmt(used)}</span>
                    <span className="app-cap-inline-sep">/</span>
                    <span className="app-cap-inline-total">{fmt(capLimit.value)}</span>
                    <span className="app-cap-inline-period">per {capLimit.period}</span>
                    <span className="app-cap-inline-divider" />
                    <span className="app-cap-inline-pct">{pct}%</span>
                  </div>
                );
              })()}

              {Object.keys(activeFilters).length > 0 && (
                <div className="app-active-filters" aria-label="Applied filters">
                  {Object.entries(activeFilters).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      className="app-filter-chip"
                      onClick={() => handleRemoveFilter(key)}
                      title="Click to clear this filter"
                    >
                      <span className="app-filter-chip-label">{FILTER_LABELS[key]}:</span>
                      <span className="app-filter-chip-value">{formatFilterValue(key, value)}</span>
                      <span className="app-filter-chip-x">x</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    className="app-filter-chip app-filter-chip--clearall"
                    onClick={handleClearAllFilters}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="app-filter-btn"
              onClick={() => setFilterOpen((v) => !v)}
            >
              <FiltersIcon size={14} />
              Filters
            </button>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
