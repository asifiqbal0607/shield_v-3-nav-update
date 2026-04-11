import { useEffect, useMemo, useState } from "react";
import { SearchIcon } from "../components/ui/Icons";
import { ALL_PARTNERS } from "../models/partners";
import { ALL_SERVICES } from "../models/services";

export const DEFAULT_FILTERS = {
  search: "",
  geo: "South Africa (ZA)",
  fromDate: "2024-09-01",
  toDate: "2024-09-26",
  service: "",
  network: "",
  os: "",
  platform: "",
  googleType: "",
  customVar: "",
};

const STATIC_FILTER_DATA = {
  network: ["MTN", "Vodacom", "Airtel", "Glo"],
  os: ["Android", "iOS", "Windows", "Other"],
  platform: ["Mobile", "Desktop", "Tablet"],
  googleType: ["Google", "Non-Google"],
  customVar: ["Variable 1", "Variable 2", "Variable 3"],
};

function SelectFilter({ label, value, options, onChange }) {
  return (
    <div className="fsb-field">
      <label className="fsb-label">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="fsb-input fsb-select-input">
        <option value="">- Select -</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export default function FilterSidebar({
  role,
  setRole,
  setPage,
  onSearch,
  filters = DEFAULT_FILTERS,
  onApplyFilters,
  onResetFilters,
}) {
  const [fromDate, setFromDate] = useState(filters.fromDate ?? DEFAULT_FILTERS.fromDate);
  const [toDate, setToDate] = useState(filters.toDate ?? DEFAULT_FILTERS.toDate);
  const [search, setSearch] = useState(filters.search ?? "");
  const [selected, setSelected] = useState({
    service: filters.service ?? "",
    network: filters.network ?? "",
    os: filters.os ?? "",
    platform: filters.platform ?? "",
    googleType: filters.googleType ?? "",
    customVar: filters.customVar ?? "",
  });

  useEffect(() => {
    setFromDate(filters.fromDate ?? DEFAULT_FILTERS.fromDate);
    setToDate(filters.toDate ?? DEFAULT_FILTERS.toDate);
    setSearch(filters.search ?? "");
    setSelected({
      service: filters.service ?? "",
      network: filters.network ?? "",
      os: filters.os ?? "",
      platform: filters.platform ?? "",
      googleType: filters.googleType ?? "",
      customVar: filters.customVar ?? "",
    });
  }, [filters]);

  const filterFields = useMemo(
    () => ([
      { key: "service", label: role === "admin" ? "Choose Partner" : "Choose Service" },
      { key: "network", label: "Choose Network" },
      { key: "os", label: "Choose OS" },
      { key: "platform", label: "Choose Platform" },
      { key: "googleType", label: "Choose Google/Non-Google" },
      { key: "customVar", label: "Custom Variables" },
    ]),
    [role],
  );

  const filterData = useMemo(
    () => ({
      ...STATIC_FILTER_DATA,
      service:
        role === "admin"
          ? ALL_PARTNERS.map((p) => p.name)
          : ALL_SERVICES.map((s) => s.name),
    }),
    [role],
  );

  function buildFiltersPayload() {
    return {
      ...DEFAULT_FILTERS,
      ...selected,
      search: search.trim(),
      fromDate,
      toDate,
      geo: filters.geo ?? DEFAULT_FILTERS.geo,
    };
  }

  function applyCurrentFilters() {
    const next = buildFiltersPayload();
    if (onApplyFilters) onApplyFilters(next);
    if (onSearch) onSearch(next.search);
  }

  function handleSearchApply() {
    applyCurrentFilters();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearchApply();
  }

  function handleReset() {
    setFromDate(DEFAULT_FILTERS.fromDate);
    setToDate(DEFAULT_FILTERS.toDate);
    setSearch("");
    setSelected({
      service: "",
      network: "",
      os: "",
      platform: "",
      googleType: "",
      customVar: "",
    });
    if (onResetFilters) onResetFilters();
    if (onSearch) onSearch("");
  }

  return (
    <aside className="fsb-root">
      <div className="fsb-header">
        <span className="fsb-header-icon">⚙</span>
        Filters
      </div>

      <div className="fsb-body">
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
              placeholder="UNIQID, MSISDN, IP..."
              className="sidebar-search-input"
              spellCheck={false}
              autoComplete="off"
            />
            {search && (
              <button type="button" className="sidebar-search-clear" onClick={() => setSearch("")}>x</button>
            )}
          </div>
          <button
            type="button"
            className={`sidebar-search-apply-btn${search.trim() ? " sidebar-search-apply-btn--active" : ""}`}
            onClick={handleSearchApply}
            disabled={!search.trim()}
          >
            <SearchIcon size={12} />
            Search Transactions
          </button>
        </div>

        <div className="fsb-section-divider" />

        <div className="fsb-field">
          <label className="fsb-label-lg">View As</label>
          <div className="fsb-role-toggle">
            {["admin", "partner"].map((r) => (
              <button
                type="button"
                key={r}
                className={`fsb-role-btn${role === r ? " active" : ""}`}
                onClick={() => {
                  if (setRole) setRole(r);
                  if (setPage) setPage("overview");
                }}
              >
                {r === "admin" ? "Admin" : "Partner"}
              </button>
            ))}
          </div>
        </div>

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
            {filters.geo ?? DEFAULT_FILTERS.geo}
          </div>
        </div>

        <div className="fsb-field">
          <label className="fsb-label-lg">Date From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="fsb-input"
          />
        </div>

        <div className="fsb-field">
          <label className="fsb-label-lg">Date To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="fsb-input"
          />
        </div>

        <div className="fsb-btn-row">
          <button type="button" className="fsb-btn-clear" onClick={handleReset}>Reset</button>
          <button type="button" className="fsb-btn-apply" onClick={applyCurrentFilters}>Apply</button>
        </div>

        <div className="fsb-options-hd">Options</div>
        {filterFields.map(({ key, label }) => (
          <SelectFilter
            key={key}
            label={label}
            value={selected[key]}
            options={filterData[key] || []}
            onChange={(value) => setSelected((prev) => ({ ...prev, [key]: value }))}
          />
        ))}
      </div>
    </aside>
  );
}
