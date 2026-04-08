import React, { useState } from "react";
import TopNav from "./TopNav";
import FilterSidebar from "./FilterSidebar";
import { ALL_PAGES } from "../components/constants/nav";
import { SLATE } from "../components/constants/colors";
import { FiltersIcon } from "../components/ui/Icons";

/**
 * AppLayout
 * ➜ Page padding responds to screen size via .page-main CSS class (global.css)
 * ➜ TopNav height synced to theme.js → topNav.height (--topnav-h CSS var)
 */
export default function AppLayout({
  role,
  setRole,
  page,
  setPage,
  onLogout,
  children,
  capLimit = null,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const curPage = ALL_PAGES.find((p) => p.key === page);
  const curLabel = curPage?.label ?? "Dashboard";
  const isAdminOnly =
    curPage?.roles?.includes("admin") && !curPage?.roles?.includes("partner");

  return (
    <div className="app-root-shell">
      {/* TopNav — always visible, height = var(--topnav-h) */}
      <TopNav
        role={role}
        setRole={setRole}
        page={page}
        setPage={setPage}
        onLogout={onLogout}
      />

      {/* Body */}
      <div className="app-body">
        {/* Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="app-sidebar-bd"
          />
        )}

        {/* Slide-in drawer */}
        <div
          className="app-drawer"
          style={{
            "--drawer-tx": sidebarOpen ? "translateX(0)" : "translateX(-320px)",
            "--drawer-shadow": sidebarOpen ? "var(--shadow-md)" : "none",
          }}
        >
          <FilterSidebar role={role} setRole={setRole} setPage={setPage} />
        </div>

        {/* Close button — outside drawer, only when open */}
        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="app-drawer-close"
          >
            ×
          </button>
        )}

        {/* Main content — shifts right when sidebar is open */}
        <main
          className="page-main"
          style={{
            marginLeft: sidebarOpen ? "280px" : "0",
            transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Breadcrumb + filter toggle */}
          <div className="app-breadcrumb-row">
            <div className="app-breadcrumb-left">
              <span className="app-bc-sep">Shield</span>
              <span className="app-bc-trail">›</span>
              <span className="app-bc-current">{curLabel}</span>
              {isAdminOnly && <span className="app-env-badge">Admin only</span>}

              {/* Cap limit inline — right after page title, partner only */}
              {role === "partner" && capLimit && (() => {
                const used = capLimit.used ?? 0;
                const pct  = Math.round((used / capLimit.value) * 100);
                const col  = pct >= 90 ? "#dc2626" : pct >= 60 ? "#d97706" : "#0369a1";
                function fmt(n) {
                  if (n >= 1000000) return (n/1000000).toFixed(n%1000000===0?0:1)+"M";
                  if (n >= 1000)    return (n/1000).toFixed(n%1000===0?0:1)+"K";
                  return n.toLocaleString();
                }
                return (
                  <div className="app-cap-inline">
                    <span className="app-cap-inline-icon">🔒</span>
                    <span className="app-cap-inline-label">Cap</span>
                    <span className="app-cap-inline-divider" />
                    <span className="app-cap-inline-used" style={{ color: col }}>{fmt(used)}</span>
                    <span className="app-cap-inline-sep">/</span>
                    <span className="app-cap-inline-total">{fmt(capLimit.value)}</span>
                    <span className="app-cap-inline-period">per {capLimit.period}</span>
                    <span className="app-cap-inline-divider" />
                    <span className="app-cap-inline-pct" style={{ color: col }}>{pct}%</span>
                  </div>
                );
              })()}
            </div>

            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="app-filter-btn"
              style={{
                "--fb-bdr": sidebarOpen
                  ? "1px solid #bfdbfe"
                  : "1px solid var(--border)",
                "--fb-bg": sidebarOpen ? "#eff6ff" : "var(--bg-card)",
                "--fb-clr": sidebarOpen ? "#1d4ed8" : "var(--text-3)",
              }}
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