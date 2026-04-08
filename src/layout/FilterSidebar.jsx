import { useState } from "react";
import { SearchIcon } from "../components/ui/Icons";

const FILTER_OPTIONS = [
  "Choose Service",
  "Choose Network",
  "Choose OS",
  "Choose Platform",
  "Choose Google/Non-Google",
  "Custom Variables",
];

const FILTER_DATA = {
  "Choose Service":           ["Service A", "Service B", "Service C"],
  "Choose Network":           ["MTN", "Vodacom", "Airtel", "Glo"],
  "Choose OS":                ["Android", "iOS", "Windows", "Other"],
  "Choose Platform":          ["Mobile", "Desktop", "Tablet"],
  "Choose Google/Non-Google": ["Google", "Non-Google"],
  "Custom Variables":         ["Variable 1", "Variable 2", "Variable 3"],
};

// ── Filter data ──────────────────────────────────────────────────────────────
function SelectFilter({ label }) {
  return (
    <div className="fsb-field">
      <label className="fsb-label">{label}</label>
      <select defaultValue="" className="fsb-input fsb-select-input">
        <option value="" disabled>— Select —</option>
        {(FILTER_DATA[label] || []).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export default function FilterSidebar({ role, setRole, setPage, onSearch }) {
  const [fromDate, setFromDate] = useState("2024-09-01");
  const [toDate,   setToDate]   = useState("2024-09-26");
  const [search,   setSearch]   = useState("");

  function handleSearchApply() {
    if (onSearch) onSearch(search.trim());
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearchApply();
  }

  return (
    <aside className="fsb-root">

      {/* ── Header ── */}
      <div className="fsb-header">
        <span className="fsb-header-icon">⚙</span>
        Filters
      </div>

      {/* ── Body ── */}
      <div className="fsb-body">

        {/* ════ SEARCH SECTION ════ */}
        <div className="fsb-field">
          <label className="fsb-label-lg">Search</label>
          <div className="sidebar-search-wrap">
            <span className="sidebar-search-icon">
              <SearchIcon size={13} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="UNIQID, MSISDN, IP…"
              className="sidebar-search-input"
              spellCheck={false}
              autoComplete="off"
            />
            {search && (
              <button className="sidebar-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <button
            className={`sidebar-search-apply-btn${search.trim() ? " sidebar-search-apply-btn--active" : ""}`}
            onClick={handleSearchApply}
            disabled={!search.trim()}>
            <SearchIcon size={12} />
            Search Transactions
          </button>
        </div>

        {/* ════ DIVIDER ════ */}
        <div className="fsb-section-divider" />

        {/* Role toggle */}
        <div className="fsb-field">
          <label className="fsb-label-lg">View As</label>
          <div className="fsb-role-toggle">
            {["admin", "partner"].map((r) => (
              <button
                key={r}
                className={`fsb-role-btn${role === r ? " active" : ""}`}
                onClick={() => {
                  if (setRole) setRole(r);
                  if (setPage) setPage("overview");
                }}>
                {r === "admin" ? "⚙ Admin" : "🤝 Partner"}
              </button>
            ))}
          </div>
        </div>

        {/* GEO */}
        <div className="fsb-field">
          <label className="fsb-label-lg">GEO</label>
          <div className="fsb-geo-chip">
            <img
              src="https://flagcdn.com/w20/za.png"
              srcSet="https://flagcdn.com/w40/za.png 2x"
              width="20"
              height="15"
              alt="ZA"
              className="fsb-geo-flag fsb-geo-flag-img"
            />
            South Africa (ZA)
          </div>
        </div>

        {/* Date From */}
        <div className="fsb-field">
          <label className="fsb-label-lg">Date From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="fsb-input"
          />
        </div>

        {/* Date To */}
        <div className="fsb-field">
          <label className="fsb-label-lg">Date To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="fsb-input"
          />
        </div>

        {/* Apply / Reset */}
        <div className="fsb-btn-row">
          <button className="fsb-btn-clear">Reset</button>
          <button className="fsb-btn-apply">Apply</button>
        </div>

        {/* Options */}
        <div className="fsb-options-hd">Options</div>
        {FILTER_OPTIONS.map((label) => (
          <SelectFilter key={label} label={label} />
        ))}

      </div>
    </aside>
  );
}