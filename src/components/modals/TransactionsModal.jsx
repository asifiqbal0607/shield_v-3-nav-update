import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { transactionRows } from "../../data/tables";
import TransactionDetailModal from "./TransactionDetailModal";
import TransactionDashboardModal from "./TransactionDashboardModal";
import { CheckIcon, CopyIcon } from "../ui/Icons";

/* ── Risk helpers ───────────────────────────────────────────────
   Score 0–10:  7.9–10 = Clean | 3.9–7.9 = Low Risk | 0–3.9 = High Risk
──────────────────────────────────────────────────────────────── */
function getRiskTier(score) {
  if (score == null) return { label: "—",         cls: "",           lblCls: "risk-lbl-none",  tier: "none"  };
  if (score >= 7.9)  return { label: "Clean",     cls: "risk-clean", lblCls: "risk-lbl-clean", tier: "clean" };
  if (score >= 3.9)  return { label: "Low Risk",  cls: "risk-low",   lblCls: "risk-lbl-low",   tier: "low"   };
  return                    { label: "High Risk", cls: "risk-high",  lblCls: "risk-lbl-high",  tier: "high"  };
}

/** Derive the display status and reasons for a row based on its risk score */
function deriveRow(r) {
  const { tier } = getRiskTier(r.score);
  if (tier === "low") {
    const reasons = r.reasons.includes("MCPS-1200")
      ? r.reasons
      : ["MCPS-1200", ...r.reasons];
    return { ...r, status: "Suspect", reasons };
  }
  return r;
}

function RiskCell({ score }) {
  const { label, cls, lblCls } = getRiskTier(score);
  const pct = score != null ? Math.min(100, (score / 10) * 100) : 0;
  return (
    <div className="txn-risk-cell">
      <div className="txn-risk-top">
        <span className={`txn-risk-label ${lblCls}`}>{label}</span>
        {score != null && <span className="txn-risk-score">{Math.round(score)}</span>}
      </div>
      <div className="txn-risk-bar">
        <div className={`txn-risk-fill ${cls}`} />
      </div>
    </div>
  );
}

/* ── Stat Bar ───────────────────────────────────────────────── */
function StatBar({ total, clearCount, blockCount, suspectCount, onFilter }) {
  const blockRate = total > 0 ? ((blockCount / total) * 100).toFixed(1) : "0.0";
  return (
    <div className="txn-stat-bar">
      <div className="txn-stat-cell" onClick={() => onFilter("All")}>
        <span className="txn-stat-dot dot-stat-all" />
        <div>
          <div className="txn-stat-num">{total >= 1000 ? `${Math.round(total / 1000)}k` : total}</div>
          <div className="txn-stat-lbl">Total</div>
        </div>
      </div>
      <div className="txn-stat-cell" onClick={() => onFilter("Clear")}>
        <span className="txn-stat-dot dot-stat-clear" />
        <div>
          <div className="txn-stat-num">{clearCount}</div>
          <div className="txn-stat-lbl">Clear</div>
        </div>
      </div>
      <div className="txn-stat-cell" onClick={() => onFilter("Block")}>
        <span className="txn-stat-dot dot-stat-block" />
        <div>
          <div className="txn-stat-num">{blockCount}</div>
          <div className="txn-stat-lbl">Blocked</div>
        </div>
      </div>
      <div className="txn-stat-cell" onClick={() => onFilter("Suspect")}>
        <span className="txn-stat-dot dot-stat-suspect" />
        <div>
          <div className="txn-stat-num">{suspectCount}</div>
          <div className="txn-stat-lbl">Suspect</div>
        </div>
      </div>
      <div className="txn-stat-cell">
        <span className="txn-stat-dot dot-stat-warn" />
        <div>
          <div className="txn-stat-num">{blockRate}%</div>
          <div className="txn-stat-lbl">Block Rate</div>
        </div>
      </div>
    </div>
  );
}


async function copyToClipboard(value) {
  const text = String(value ?? "");

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back for browsers that expose the API but block it in this context.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

function CopyCell({ value, display, className }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e) {
    e.stopPropagation();
    const didCopy = await copyToClipboard(value);
    if (didCopy) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <span
      className={`txn-copy-cell${copied ? " copied" : ""}${className ? " " + className : ""}`}
      onClick={handleCopy}
      title={`Click to copy: ${value}`}
    >
      <span className="txn-copy-text">{display ?? value}</span>
      <span className={`txn-copy-icon${copied ? " copied" : ""}`}>
        {copied ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
      </span>
      {copied && <span className="txn-copy-toast">Copied!</span>}
    </span>
  );
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const VISIBLE_REASONS = 2;

function ReasonCell({ reasons }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const visible = reasons.slice(0, VISIBLE_REASONS);
  const extra = reasons.slice(VISIBLE_REASONS);

  function handleOpen(e) {
    e.stopPropagation();
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 5, left: r.left });
    }
    setOpen((v) => !v);
  }

  return (
    <div className="txn-reasons-wrap">
      {visible.map((rsn) => (
        <span
          key={rsn}
          className={`txn-reason-badge rsn-${rsn.replace(/[^a-z0-9]/gi, "").toLowerCase()}`}
        >
          {rsn}
        </span>
      ))}
      {extra.length > 0 && (
        <>
          <button
            ref={btnRef}
            className={`txn-reason-more-btn${open ? " active" : ""}`}
            onClick={handleOpen}
          >
            +{extra.length}
          </button>
          {open &&
            createPortal(
              <>
                <div
                  className="txn-reason-overlay"
                  onClick={() => setOpen(false)}
                />
                <div
                  className="txn-reason-popover"
                  style={{ top: pos.top, left: pos.left }}
                >
                  {extra.map((rsn) => (
                    <span
                      key={rsn}
                      className={`txn-reason-badge rsn-${rsn.replace(/[^a-z0-9]/gi, "").toLowerCase()}`}
                    >
                      {rsn}
                    </span>
                  ))}
                </div>
              </>,
              document.body,
            )}
        </>
      )}
    </div>
  );
}

export default function TransactionsModal({
  onClose,
  title = "Clicked Clean — Transactions",
  ipFilter: initialIp = "",
  role = "admin",
  setPage: onNavigate,
}) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [dashMode, setDashMode]       = useState(null);
  const [ipFilter, setIpFilter] = useState(initialIp);
  const [search, setSearch] = useState(initialIp);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("All"); // "All" | "Clear" | "Block"

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const derived = transactionRows.map(deriveRow);

  const filtered = derived.filter((r) => {
    const matchSearch =
      r.id.includes(search) ||
      r.network.toLowerCase().includes(search.toLowerCase()) ||
      r.apk.toLowerCase().includes(search.toLowerCase()) ||
      r.userIp.includes(search);
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Block"   && r.status === "Block")   ||
      (statusFilter === "Clear"   && r.status === "Clear")   ||
      (statusFilter === "Suspect" && r.status === "Suspect");
    return matchSearch && matchStatus;
  });

  // Counts for stat bar
  const countAll     = derived.length;
  const countBlock   = derived.filter((r) => r.status === "Block").length;
  const countClear   = derived.filter((r) => r.status === "Clear").length;
  const countSuspect = derived.filter((r) => r.status === "Suspect").length;

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function shortUniqId(v) {
    const s = String(v ?? "");
    if (s.length <= 18) return s;
    return `${s.slice(0, 10)}...${s.slice(-6)}`;
  }

  const pageNums = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNums.push(i);
  } else {
    pageNums.push(1, 2, 3, 4, 5, "…", totalPages);
  }

  return (
    <>
      <div onClick={onClose} className="txn-backdrop" />

      <div className="txn-modal">
        {/* ── Header ── */}
        <div className="txn-header">
          <div className="txn-header-left">
            <div className="txn-icon">✓</div>
            <div>
              <div className="txn-title">
                {ipFilter ? `Transactions — IP: ${ipFilter}` : title}
              </div>
              <div className="txn-subtitle">
                Showing {filtered.length.toLocaleString()} of{" "}
                {countAll.toLocaleString()} entries
              </div>
            </div>
          </div>
          <div className="txn-header-actions">
            <button className="txn-toolbar-btn txn-btn-export">
              Export Transactions
            </button>
            <button
              onClick={() => setDashMode("dashboard")}
              className="txn-toolbar-btn txn-btn-dashboard"
            >
              Dashboard
            </button>
            <button
              onClick={() => setDashMode("excluded")}
              className="txn-toolbar-btn txn-btn-excluded"
            >
              Excluded Dashboard
            </button>
            <button onClick={onClose} className="txn-close-btn">
              ×
            </button>
          </div>
        </div>

        {/* ── Stat Bar ── */}
        <StatBar
          total={countAll}
          clearCount={countClear}
          blockCount={countBlock}
          suspectCount={countSuspect}
          onFilter={(f) => { setStatusFilter(f); setPage(1); }}
        />

        {/* ── IP filter banner ── */}
        {ipFilter && (
          <div className="txn-ip-banner">
            <span className="txn-ip-label">🔍 Filtering by User IP:</span>
            <span className="txn-ip-chip">{ipFilter}</span>
            <button
              onClick={() => {
                setIpFilter("");
                setSearch("");
              }}
              className="txn-ip-clear"
            >
              ✕ Clear
            </button>
          </div>
        )}

        {/* ── Controls ── */}
        <div className="txn-controls">
          <div className="txn-ctrl-group">
            Show
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(+e.target.value);
                setPage(1);
              }}
              className="txn-select"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            entries
          </div>
          <div className="txn-ctrl-group">
            Search:
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="txn-search"
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="txn-table-scroll">
          <table className="txn-table">
            <thead className="txn-thead">
              <tr className="txn-thead-row">
                {[
                  "Sr.",
                  "UNIQID",
                  "Time",
                  "Network",
                  "APK",
                  "User IP",
                  "MSISDN",
                  "Status",
                  "Risk",
                  "Reason",
                  "Interaction",
                  "View",
                ].map((h) => (
                  <th key={h} className="txn-th">
                    {h}{" "}
                    {h !== "View" && h !== "Sr." && h !== "Risk" && (
                      <span className="txn-sort-icon">↕</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((r, i) => (
                <tr key={r.id} className="txn-tr">
                  <td className="txn-td-sr">{(page - 1) * pageSize + i + 1}</td>
                  <td className="txn-td-id">
                    <CopyCell value={r.id} display={shortUniqId(r.id)} />
                  </td>
                  <td className="txn-td-time">{r.time}</td>
                  <td className="txn-td-network">
                    <CopyCell value={r.network} display={r.network} />
                  </td>
                  <td className="txn-td-apk">
                    <CopyCell value={r.apk || "—"} display={r.apk || "—"} />
                  </td>
                  <td className="txn-td-ip">
                    <CopyCell value={r.userIp} />
                  </td>
                  <td className="txn-td-msisdn">{r.msisdn || "—"}</td>
                  <td className="txn-td-badge">
                    <span
                      className={`txn-status-badge ${
                        r.status === "Block"   ? "status-block"   :
                        r.status === "Suspect" ? "status-suspect" :
                        "status-allow"
                      }`}
                    >
                      {r.status === "Block" ? "Block" : r.status === "Suspect" ? "Suspect" : "Clear"}
                    </span>
                  </td>
                  <td className="txn-td-risk">
                    <RiskCell score={r.score} />
                  </td>
                  <td className="txn-td-reasons">
                    <ReasonCell reasons={r.reasons} />
                  </td>
                  <td className="txn-td-interaction">
                    <span className="txn-interact-badge">{r.interaction}</span>
                  </td>
                  <td className="txn-td-view">
                    <button
                      onClick={() => setSelectedRow(r)}
                      className="txn-view-btn"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Footer / Pagination ── */}
        <div className="txn-footer">
          <div className="txn-footer-count">
            Showing {Math.min((page - 1) * pageSize + 1, filtered.length)} to{" "}
            {Math.min(page * pageSize, filtered.length)} of{" "}
            {countAll.toLocaleString()} entries
          </div>
          <div className="txn-pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`txn-page-prev${page === 1 ? " disabled" : ""}`}
            >
              Previous
            </button>

            {pageNums.map((n, i) =>
              typeof n === "number" ? (
                <button
                  key={i}
                  onClick={() => setPage(n)}
                  className={`txn-page-num${page === n ? " active" : ""}`}
                >
                  {n}
                </button>
              ) : (
                <span key={i} className="txn-page-ellipsis">
                  {n}
                </span>
              ),
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="txn-page-next"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedRow && (
        <TransactionDetailModal
          row={selectedRow}
          onClose={() => setSelectedRow(null)}
          role={role}
          setPage={onNavigate}
          onParentClose={onClose}
          hasImage={!!selectedRow?.hasImage}
          hasVideo={!!selectedRow?.hasVideo}
          onUserIp={(ip) => {
            setSelectedRow(null);
            setIpFilter(ip);
            setSearch(ip);
            setPage(1);
          }}
        />
      )}
      {dashMode && (
        <TransactionDashboardModal
          title={ipFilter ? `IP: ${ipFilter}` : title}
          mode={dashMode}
          onClose={() => setDashMode(null)}
        />
      )}
    </>
  );
}
