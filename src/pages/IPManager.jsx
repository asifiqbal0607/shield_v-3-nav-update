import { useState } from "react";
import { userRows } from "../data/tables";

/* ── Mock data ──────────────────────────────────────────────────────────── */
const CLIENTS = ["360VUZ", "Dharam IQ", "Kids Plus", "MediaNet", "StreamCore"];
const SERVICES = [
  "360VUZ VIP",
  "360VUZ Premium",
  "Kids Games",
  "Sports HD",
  "News Live",
];

const NETOP_BLOCKS = [];

const CALC_RESULTS = [
  { id: 1, network: "Libyana-Mobile-AS", total: 1575 },
  { id: 2, network: "U Mobile Sdn Bhd", total: 862 },
  {
    id: 3,
    network:
      "Hulum Almustakbal Company for Communication Engineering and Services Ltd",
    total: 821,
  },
  {
    id: 4,
    network: "Earthlink Telecommunications Equipment Trading & Services DMCC",
    total: 791,
  },
  {
    id: 5,
    network: "Emirates Telecommunications Group Company (etisalat Group) Pjsc",
    total: 510,
  },
  {
    id: 6,
    network: "Kurdistan Net Company for Computer and Internet Ltd.",
    total: 473,
  },
  {
    id: 7,
    network: "Spark for Information Technology Services Ltd",
    total: 436,
  },
  { id: 8, network: "General Post and Telecommunication Company", total: 428 },
  {
    id: 9,
    network: "Allay Nawroz Telecom Company for Communication/Ltd.",
    total: 274,
  },
  { id: 10, network: "Horizon Scope Mobile Telecom WLL", total: 209 },
];

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 1 — Attach Netops
═══════════════════════════════════════════════════════════════════════════ */
function AttachNetops() {
  const [client, setClient] = useState("360VUZ");
  const [service, setService] = useState("360VUZ VIP");

  return (
    <div className="ipm-tab-content">
      <div className="ipm-form-card">
        <h2 className="ipm-card-title">Proxy IP Ranges</h2>

        <div className="ipm-field-row">
          <span className="ipm-field-label">Clients</span>
          <select
            className="ipm-underline-select"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          >
            {CLIENTS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="ipm-field-row">
          <span className="ipm-field-label">Services</span>
          <select
            className="ipm-underline-select"
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            {SERVICES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="ipm-card-footer">
          <button className="ipm-process-link">Process</button>
        </div>
      </div>

      <div className="ipm-netops-list">
        {NETOP_BLOCKS.map((n) => (
          <div key={n.id} className="ipm-netop-card">
            <span className="ipm-netop-badge">{n.name}</span>
            <div className="ipm-asn-header">
              <span className="ipm-asn-header-label">ASN-Numbers</span>
              <button className="ipm-update-btn">Update Ips</button>
            </div>
            <div className="ipm-asn-chips">
              {n.asns.length > 0 ? (
                n.asns.map((asn) => (
                  <span key={asn} className="ipm-asn-chip">
                    {asn}
                  </span>
                ))
              ) : (
                <span className="ipm-asn-none">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 2 — Export IP Ranges
═══════════════════════════════════════════════════════════════════════════ */
function ExportIPRanges() {
  const [client, setClient] = useState("");
  const [service, setService] = useState("");
  const [netops, setNetops] = useState("");
  const [email, setEmail] = useState("");
  const [days, setDays] = useState("");

  return (
    <div className="ipm-tab-content">
      <div className="ipm-form-card">
        <h2 className="ipm-card-title">Export Top 10 Netop Ranges</h2>

        <div className="ipm-field-row">
          <span className="ipm-field-label">Clients</span>
          <select
            className="ipm-underline-select"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          >
            <option value="" disabled>
              Select from the list
            </option>
            {CLIENTS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="ipm-field-row">
          <span className="ipm-field-label">Services</span>
          <select
            className="ipm-underline-select"
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="" disabled>
              Select from the list
            </option>
            {SERVICES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="ipm-field-row">
          <span className="ipm-field-label">Netops to exclude</span>
          <select
            className="ipm-underline-select"
            value={netops}
            onChange={(e) => setNetops(e.target.value)}
          >
            <option value="" disabled>
              Select from the list
            </option>
            {NETOP_BLOCKS.map((n) => (
              <option key={n.id}>{n.name}</option>
            ))}
          </select>
        </div>

        <div className="ipm-field-row">
          <span className="ipm-field-label">Email Address</span>
          <input
            className="ipm-underline-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Add To Email Address, (,) Separated"
          />
        </div>

        <div className="ipm-field-row">
          <span className="ipm-field-label ipm-label-with-info">
            Data To Process
            <span className="ipm-info-badge" title="Minimum 3 days required">
              i
            </span>
          </span>
          <input
            className="ipm-underline-input"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="min 3 days"
            type="number"
            min="3"
          />
        </div>

        <div className="ipm-card-footer">
          <button className="ipm-process-link">Process</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 3 — IP Ranges Calculator
═══════════════════════════════════════════════════════════════════════════ */
const PAGE_SIZES = [10, 25, 50];
const TOTAL_ENTRIES = 174;
const TOTAL_PAGES = 18;

function IPRangesCalculator() {
  const [client, setClient] = useState("360VUZ");
  const [service, setService] = useState("360VUZ VIP");
  const [dateRange] = useState("03/12/2026 - 03/12/2026");
  const [txType, setTxType] = useState("all");
  const [calculated, setCalculated] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = CALC_RESULTS.filter((r) =>
    r.network.toLowerCase().includes(search.toLowerCase()),
  );
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pageNums = [1, 2, 3, 4, 5, "…", TOTAL_PAGES];

  return (
    <div className="ipm-tab-content">
      {/* filter card */}
      <div className="ipm-form-card">
        <div className="ipm-field-row">
          <span className="ipm-field-label">Clients</span>
          <select
            className="ipm-underline-select ipm-has-arrow"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          >
            {CLIENTS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="ipm-field-row">
          <span className="ipm-field-label">Services</span>
          <select
            className="ipm-underline-select ipm-has-arrow"
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            {SERVICES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="ipm-field-row">
          <span className="ipm-field-label">Date Range</span>
          <div className="ipm-date-display">{dateRange}</div>
        </div>

        <div className="ipm-field-row">
          <span className="ipm-field-label">Transaction Type</span>
          <div className="ipm-radio-row">
            <label className="ipm-radio-opt">
              <input
                type="radio"
                name="ipm-txtype"
                value="all"
                checked={txType === "all"}
                onChange={() => setTxType("all")}
                className="ipm-radio-input"
              />
              <span
                className={`ipm-radio-circle${txType === "all" ? " ipm-radio-on" : ""}`}
              />
              All
            </label>
            <label className="ipm-radio-opt">
              <input
                type="radio"
                name="ipm-txtype"
                value="queried"
                checked={txType === "queried"}
                onChange={() => setTxType("queried")}
                className="ipm-radio-input"
              />
              <span
                className={`ipm-radio-circle${txType === "queried" ? " ipm-radio-on" : ""}`}
              />
              Queried Only
            </label>
          </div>
        </div>

        <div className="ipm-card-footer">
          <button
            className="ipm-process-link"
            onClick={() => {
              setCalculated(true);
              setPage(1);
            }}
          >
            Calculate
          </button>
        </div>
      </div>

      {/* results */}
      {calculated && (
        <div className="ipm-results-card">
          <div className="ipm-results-top">
            <div className="ipm-results-top-left">
              <h3 className="ipm-results-title">Network With Transactions</h3>
              <div className="ipm-show-row">
                <span className="ipm-show-lbl">Show</span>
                <select
                  className="ipm-show-select"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(+e.target.value);
                    setPage(1);
                  }}
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
                <span className="ipm-show-lbl">entries</span>
              </div>
              <button className="ipm-composite-btn">Composite Report</button>
            </div>
            <div className="ipm-results-top-right">
              <span className="ipm-search-lbl">Search:</span>
              <input
                className="ipm-search-input"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="ipm-table-wrap">
            <table className="ipm-table">
              <thead>
                <tr className="ipm-thead-row">
                  <th className="ipm-th ipm-col-num">
                    # <span className="ipm-sort">↕</span>
                  </th>
                  <th className="ipm-th ipm-col-net">
                    Network <span className="ipm-sort">↕</span>
                  </th>
                  <th className="ipm-th ipm-col-tot">
                    Total Transactions <span className="ipm-sort">↕</span>
                  </th>
                  <th className="ipm-th ipm-col-act">
                    Action <span className="ipm-sort">↕</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r, idx) => (
                  <tr key={r.id} className="ipm-tr">
                    <td className="ipm-td ipm-td-num">
                      {(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="ipm-td ipm-td-net">{r.network}</td>
                    <td className="ipm-td ipm-td-tot">
                      {r.total.toLocaleString()}
                    </td>
                    <td className="ipm-td ipm-td-act">
                      <button className="ipm-dl-btn">Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ipm-tbl-footer">
            <span className="ipm-showing-txt">
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, TOTAL_ENTRIES)} of {TOTAL_ENTRIES}{" "}
              entries
            </span>
            <div className="ipm-pagination">
              <button
                className={`ipm-pg-btn${page === 1 ? " ipm-pg-disabled" : ""}`}
                onClick={() => page > 1 && setPage((p) => p - 1)}
              >
                Previous
              </button>
              {pageNums.map((n, i) =>
                typeof n === "number" ? (
                  <button
                    key={i}
                    className={`ipm-pg-num${page === n ? " ipm-pg-active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ) : (
                  <span key={i} className="ipm-pg-ellipsis">
                    {n}
                  </span>
                ),
              )}
              <button
                className={`ipm-pg-btn${page === TOTAL_PAGES ? " ipm-pg-disabled" : ""}`}
                onClick={() => page < TOTAL_PAGES && setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 4 — IP Whitelist
═══════════════════════════════════════════════════════════════════════════ */

/* Seeded whitelist data — keyed by userRows id (Clients role) */
const WHITELIST_SEED = {
  "USR-004": [
    { id: 1, scope: ["All Services"],                  cidr: "192.168.1.0/24", note: "Office network", addedAt: "2024-11-10" },
    { id: 2, scope: ["360VUZ VIP", "Sports HD"],       cidr: "10.0.0.0/8",     note: "Internal VPN",   addedAt: "2025-01-05" },
  ],
  "USR-011": [
    { id: 3, scope: ["All Services"],                  cidr: "203.0.113.0/24", note: "Partner HQ",     addedAt: "2024-12-01" },
  ],
};

/* Helper — readable scope label */
function scopeLabel(scope) {
  if (!scope || scope.length === 0) return "—";
  if (scope.includes("All Services")) return "All Services";
  if (scope.length === 1) return scope[0];
  return `${scope.length} services`;
}

function validateCIDR(v) {
  const parts = v.trim().split("/");
  if (parts.length !== 2) return false;
  const octets = parts[0].split(".");
  if (octets.length !== 4) return false;
  if (!octets.every((o) => /^\d+$/.test(o) && +o >= 0 && +o <= 255)) return false;
  const prefix = +parts[1];
  return Number.isInteger(prefix) && prefix >= 0 && prefix <= 32;
}

function AddIPModal({ partner, onClose, onAdd }) {
  const services = partner.services?.length ? partner.services : SERVICES;
  const [allSvc,   setAllSvc]   = useState(true);
  const [selSvcs,  setSelSvcs]  = useState(new Set());
  const [svcQuery, setSvcQuery] = useState("");
  const [showSel,  setShowSel]  = useState(false); // toggle: show selected only
  const [cidr,     setCidr]     = useState("");
  const [note,     setNote]     = useState("");
  const [err,      setErr]      = useState("");

  function toggleSvc(svc) {
    setSelSvcs((prev) => {
      const next = new Set(prev);
      next.has(svc) ? next.delete(svc) : next.add(svc);
      return next;
    });
    setErr("");
  }

  // When searching: filter services; when "show selected" is on: only show selected
  const listSource = showSel ? [...selSvcs] : services;
  const filtered   = listSource.filter((s) =>
    s.toLowerCase().includes(svcQuery.toLowerCase())
  );

  function handleAdd() {
    if (!cidr.trim()) { setErr("IP range is required."); return; }
    if (!validateCIDR(cidr)) { setErr("Invalid CIDR format (e.g. 192.168.1.0/24)."); return; }
    if (!allSvc && selSvcs.size === 0) { setErr("Select at least one service or choose All Services."); return; }
    onAdd({ scope: allSvc ? ["All Services"] : [...selSvcs], cidr: cidr.trim(), note: note.trim() });
  }

  return (
    <div className="ipm-wl-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ipm-wl-modal">
        <div className="ipm-wl-modal-hd">
          <div>
            <div className="ipm-wl-modal-title">Add IP Range</div>
            <div className="ipm-wl-modal-sub">{partner.name}</div>
          </div>
          <button className="ipm-wl-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="ipm-wl-modal-body">
          {/* Service Scope */}
          <div className="ipm-wl-field">
            <label className="ipm-wl-label">Service Scope <span className="ipm-wl-req">*</span></label>

            {/* All Services toggle */}
            <label className="ipm-wl-chk-row ipm-wl-chk-all">
              <input
                type="checkbox"
                className="ipm-wl-chk"
                checked={allSvc}
                onChange={(e) => {
                  setAllSvc(e.target.checked);
                  if (e.target.checked) { setSelSvcs(new Set()); setSvcQuery(""); setShowSel(false); }
                  setErr("");
                }}
              />
              <span className="ipm-wl-chk-label">All Services</span>
              <span className="ipm-wl-chk-hint">Apply to every service under this partner</span>
            </label>

            {/* Specific services picker */}
            {!allSvc && services.length > 0 && (
              <div className="ipm-wl-svc-picker">

                {/* Selection summary bar */}
                <div className="ipm-wl-sel-bar">
                  {selSvcs.size > 0 ? (
                    <>
                      <span className="ipm-wl-sel-count">
                        <span className="ipm-wl-sel-num">{selSvcs.size}</span>
                        {" "}of {services.length} selected
                      </span>
                      <button
                        className="ipm-wl-sel-toggle"
                        onClick={() => { setShowSel((v) => !v); setSvcQuery(""); }}
                      >
                        {showSel ? "Show all" : "View selected"}
                      </button>
                      <button
                        className="ipm-wl-sel-clear"
                        onClick={() => { setSelSvcs(new Set()); setShowSel(false); }}
                      >
                        Clear all
                      </button>
                    </>
                  ) : (
                    <span className="ipm-wl-sel-hint">Click services below to select</span>
                  )}
                </div>

                {/* Search */}
                <input
                  className="ipm-wl-svc-search"
                  placeholder={showSel ? "Filter selected…" : "Search services…"}
                  value={svcQuery}
                  onChange={(e) => setSvcQuery(e.target.value)}
                />

                {/* List */}
                <div className="ipm-wl-svc-list">
                  {filtered.length === 0 ? (
                    <div className="ipm-wl-svc-none">
                      {showSel ? "No selected services match" : "No services match"}
                    </div>
                  ) : filtered.map((svc) => {
                    const on = selSvcs.has(svc);
                    return (
                      <div
                        key={svc}
                        className={`ipm-wl-svc-item${on ? " ipm-wl-svc-item-on" : ""}`}
                        onClick={() => toggleSvc(svc)}
                      >
                        <span className="ipm-wl-svc-check">{on ? "✓" : ""}</span>
                        {svc}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* IP / CIDR */}
          <div className="ipm-wl-field">
            <label className="ipm-wl-label">IP / CIDR Range <span className="ipm-wl-req">*</span></label>
            <input
              className={`ipm-wl-input${err ? " ipm-wl-input-err" : ""}`}
              placeholder="e.g. 192.168.1.0/24"
              value={cidr}
              onChange={(e) => { setCidr(e.target.value); setErr(""); }}
            />
            {err && <div className="ipm-wl-err">{err}</div>}
          </div>

          {/* Note */}
          <div className="ipm-wl-field">
            <label className="ipm-wl-label">Note <span className="ipm-wl-opt">(optional)</span></label>
            <input
              className="ipm-wl-input"
              placeholder="e.g. Office network"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <div className="ipm-wl-modal-footer">
          <button className="ipm-wl-cancel" onClick={onClose}>Cancel</button>
          <button className="ipm-wl-save" onClick={handleAdd}>
            Add{selSvcs.size > 0 && !allSvc ? ` (${selSvcs.size} services)` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

const PREVIEW_COUNT = 2; // how many service names to show inline before "+N more"

function ScopeCell({ scope }) {
  const [open, setOpen] = useState(false);

  if (scope.includes("All Services")) {
    return <span className="ipm-wl-scope-badge ipm-wl-scope-all">All Services</span>;
  }

  const preview = scope.slice(0, PREVIEW_COUNT);
  const rest    = scope.slice(PREVIEW_COUNT);

  return (
    <div className="ipm-wl-scope-cell">
      {preview.map((s) => (
        <span key={s} className="ipm-wl-scope-badge ipm-wl-scope-svc">{s}</span>
      ))}
      {rest.length > 0 && (
        <div className="ipm-wl-scope-more-wrap">
          <button
            className="ipm-wl-scope-more"
            onClick={() => setOpen((o) => !o)}
          >
            +{rest.length} more
          </button>
          {open && (
            <div className="ipm-wl-scope-popover">
              <div className="ipm-wl-scope-popover-hd">
                All {scope.length} services
                <button className="ipm-wl-scope-popover-close" onClick={() => setOpen(false)}>×</button>
              </div>
              <div className="ipm-wl-scope-popover-list">
                {scope.map((s) => (
                  <div key={s} className="ipm-wl-scope-popover-item">{s}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IPWhitelistTable({ rows, isReadOnly, delId, setDelId, onDelete }) {
  if (rows.length === 0) return null;
  return (
    <div className="ipm-wl-table-wrap">
      <table className="ipm-wl-table">
        <thead>
          <tr className="ipm-wl-thead-row">
            <th className="ipm-wl-th">#</th>
            <th className="ipm-wl-th">IP / CIDR Range</th>
            <th className="ipm-wl-th">Scope</th>
            <th className="ipm-wl-th">Note</th>
            <th className="ipm-wl-th">Added At</th>
            {!isReadOnly && <th className="ipm-wl-th">Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className="ipm-wl-tr">
              <td className="ipm-wl-td ipm-wl-td-num">{i + 1}</td>
              <td className="ipm-wl-td">
                <span className="ipm-wl-cidr">{r.cidr}</span>
              </td>
              <td className="ipm-wl-td">
                <ScopeCell scope={r.scope} />
              </td>
              <td className="ipm-wl-td ipm-wl-td-note">{r.note || <span className="ipm-wl-dash">—</span>}</td>
              <td className="ipm-wl-td ipm-wl-td-date">{r.addedAt}</td>
              {!isReadOnly && (
                <td className="ipm-wl-td">
                  {delId === r.id ? (
                    <div className="ipm-wl-confirm-row">
                      <span className="ipm-wl-confirm-txt">Remove?</span>
                      <button className="ipm-wl-confirm-yes" onClick={() => onDelete(r.id)}>Yes</button>
                      <button className="ipm-wl-confirm-no"  onClick={() => setDelId(null)}>No</button>
                    </div>
                  ) : (
                    <button className="ipm-wl-del-btn" onClick={() => setDelId(r.id)}>Remove</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IPWhitelist({ role = "admin" }) {
  const isAdmin   = role === "admin";
  const partners  = userRows.filter((u) => u.role === "Clients");

  const [selPartnerId, setSelPartnerId] = useState(isAdmin ? "" : partners[0]?.id ?? "");
  const [selScope,     setSelScope]     = useState("All");
  const [whitelist,    setWhitelist]    = useState(WHITELIST_SEED);
  const [showAdd,      setShowAdd]      = useState(false);
  const [delId,        setDelId]        = useState(null);

  const partner = partners.find((p) => p.id === selPartnerId) || null;
  const allRanges = (partner && whitelist[partner.id]) || [];

  // 3 fixed filter options — never grows no matter how many services exist
  const scopeTabs = ["All", "All Services", "Specific Services"];

  const filtered = selScope === "All"
    ? allRanges
    : selScope === "All Services"
      ? allRanges.filter((r) => r.scope.includes("All Services"))
      : allRanges.filter((r) => !r.scope.includes("All Services"));

  function handleAdd({ scope, cidr, note }) {
    setWhitelist((prev) => ({
      ...prev,
      [partner.id]: [
        { id: Date.now(), scope, cidr, note, addedBy: "admin", addedAt: new Date().toISOString().slice(0, 10) },
        ...(prev[partner.id] || []),
      ],
    }));
    setShowAdd(false);
  }

  function handleDelete(id) {
    setWhitelist((prev) => ({
      ...prev,
      [partner.id]: prev[partner.id].filter((r) => r.id !== id),
    }));
    setDelId(null);
  }

  return (
    <div className="ipm-tab-content">

      {/* ── Admin: Select Partner ── */}
      {isAdmin && (
        <div className="ipm-form-card">
          <h2 className="ipm-card-title">IP Whitelist Management</h2>
          <div className="ipm-field-row">
            <span className="ipm-field-label">Partner</span>
            <select
              className="ipm-underline-select"
              value={selPartnerId}
              onChange={(e) => { setSelPartnerId(e.target.value); setSelScope("All"); }}
            >
              <option value="">— Select a partner —</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── Partner: read-only header ── */}
      {!isAdmin && (
        <div className="ipm-form-card">
          <h2 className="ipm-card-title">Your Whitelisted IP Ranges</h2>
          <div className="ipm-wl-readonly-note">
            These are the IP ranges whitelisted for your account. Contact your administrator to make changes.
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {partner && (
        <div className="ipm-wl-results">
          <div className="ipm-wl-results-hd">
            <div>
              <div className="ipm-wl-results-title">
                Whitelisted IP Ranges
                <span className="ipm-wl-count">{allRanges.length}</span>
              </div>
              {isAdmin && (
                <div className="ipm-wl-results-sub">{partner.name}</div>
              )}
            </div>
            {isAdmin && (
              <button className="ipm-wl-add-btn" onClick={() => setShowAdd(true)}>
                + Add IP Range
              </button>
            )}
          </div>

          {/* ── Scope filter pills — always 3 fixed options ── */}
          {allRanges.length > 0 && (
            <div className="ipm-wl-scope-tabs">
              {scopeTabs.map((s) => {
                const cnt = s === "All"
                  ? allRanges.length
                  : s === "All Services"
                    ? allRanges.filter((r) => r.scope.includes("All Services")).length
                    : allRanges.filter((r) => !r.scope.includes("All Services")).length;
                return (
                  <button
                    key={s}
                    className={`ipm-wl-scope-tab${selScope === s ? " ipm-wl-scope-tab-on" : ""}`}
                    onClick={() => setSelScope(s)}
                  >
                    {s}
                    <span className="ipm-wl-scope-tab-cnt">{cnt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {allRanges.length === 0 ? (
            <div className="ipm-wl-empty">
              <div className="ipm-wl-empty-icon">🔒</div>
              <div className="ipm-wl-empty-title">No IP ranges whitelisted</div>
              <div className="ipm-wl-empty-sub">
                {isAdmin
                  ? <>No entries for <strong>{partner.name}</strong>. Add one to get started.</>
                  : "No whitelisted IP ranges have been configured for your account yet."}
              </div>
              {isAdmin && (
                <button className="ipm-wl-add-btn" onClick={() => setShowAdd(true)}>
                  + Add IP Range Now
                </button>
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div className="ipm-wl-empty">
              <div className="ipm-wl-empty-icon">🔍</div>
              <div className="ipm-wl-empty-title">No entries for this scope</div>
            </div>
          ) : (
            <IPWhitelistTable
              rows={filtered}
              isReadOnly={!isAdmin}
              delId={delId}
              setDelId={setDelId}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}

      {showAdd && partner && (
        <AddIPModal
          partner={partner}
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════════════ */
const ALL_TABS = [
  {
    key: "attach",
    label: "Attach Netops",
    dot: "ipm-dot-blue",
    roles: ["admin"],
  },
  {
    key: "export",
    label: "Export IP Ranges",
    dot: "ipm-dot-violet",
    roles: ["admin"],
  },
  {
    key: "calculator",
    label: "IP Ranges Calculator",
    dot: "ipm-dot-amber",
    roles: ["admin", "partner"],
  },
  {
    key: "whitelist",
    label: "IP Whitelist",
    dot: "ipm-dot-green",
    roles: ["admin", "partner"],
  },
];

export default function IPManager({ role }) {
  const isPartner = role === "partner";
  const tabs = ALL_TABS.filter((t) => t.roles.includes(role));
  const [activeTab, setActiveTab] = useState(
    isPartner ? "calculator" : "attach",
  );

  return (
    <div className="page-main ipm-page">
      <div className="ipm-page-hd">
        <div className="ipm-page-hd-left">
          <div className="ipm-page-icon">🌐</div>
          <div>
            <h1 className="ipm-page-title">IP Manager</h1>
            <p className="ipm-page-sub">
              Manage IP ranges, netops and export configurations
            </p>
          </div>
        </div>
      </div>

      <div className="ipm-tab-strip">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`ipm-tab${activeTab === t.key ? " ipm-tab-active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            <span className={`ipm-tab-dot ${t.dot}`} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "attach"     && <AttachNetops />}
      {activeTab === "export"     && <ExportIPRanges />}
      {activeTab === "calculator" && <IPRangesCalculator />}
      {activeTab === "whitelist"  && <IPWhitelist role={role} />}
    </div>
  );
}
