import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Card, SectionTitle } from "../components/ui";
import {
  PlusIcon, SendIcon, MessageIcon, ChevronDownIcon,
} from "../components/ui/Icons";

// ── Constants ─────────────────────────────────────────────────────────────────
const SUPPORT_EMAIL = "asifiqbal@mcpinsight.com";

const ISSUE_TYPES = [
  { key: "blocked-testing", label: "Blocked During Testing", icon: "🚫" },
  { key: "overblocking",    label: "OverBlocking",           icon: "⚠️" },
  { key: "integration",     label: "Integration Issue",      icon: "🔗" },
  { key: "data",            label: "Data Discrepancy",       icon: "📊" },
  { key: "error-response",  label: "Error In Response",      icon: "❌" },
];

const PRIORITY_LEVELS = [
  { key: "critical", label: "Critical", color: "#dc2626" },
  { key: "high",     label: "High",     color: "#d97706" },
  { key: "medium",   label: "Medium",   color: "#1d4ed8" },
  { key: "low",      label: "Low",      color: "#0d9e6e" },
];

const STATUS_FLOW = ["pending", "review", "processing", "feedback", "resolved"];
const STATUS_META = {
  pending:    { label: "Pending",    color: "#b45309", bg: "#fef3c7" },
  review:     { label: "Review",     color: "#1d4ed8", bg: "#dbeafe" },
  processing: { label: "Processing", color: "#7c3aed", bg: "#ede9fe" },
  feedback:   { label: "Feedback",   color: "#0e7490", bg: "#cffafe" },
  resolved:   { label: "Resolved",   color: "#16a34a", bg: "#dcfce7" },
};

const getIssueType = (k) => ISSUE_TYPES.find((t) => t.key === k);
const getPriColor  = (k) => PRIORITY_LEVELS.find((l) => l.key === k)?.color ?? "#94a3b8";

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED_TICKETS = [
  {
    id: "TKT-0041", partner: "Tiot", partnerEmail: "karwan@tiot.com",
    category: "blocked-testing",
    subject: "Clicks blocked on ZA network during UAT",
    description: "Multiple valid clicks are being blocked during UAT on the ZA network.",
    uniqId: "UUID-ZA-83742", priority: "critical", status: "pending",
    created: Date.now() - 2 * 60 * 1000,
  },
  {
    id: "TKT-0040", partner: "DTAC", partnerEmail: "tech@dtac.com",
    category: "integration",
    subject: "Shield JS not firing on iOS 17 Safari",
    description: "Shield script does not execute on iOS 17 Safari.",
    uniqId: null, priority: "high", status: "review",
    created: Date.now() - 60 * 60 * 1000,
  },
  {
    id: "TKT-0039", partner: "IQ InterCom", partnerEmail: "tech@iqintercom.com",
    category: "data",
    subject: "Conversion count mismatch vs internal reports",
    description: "Conversion numbers in Shield dashboard don't match internal figures.",
    uniqId: null, priority: "medium", status: "processing",
    created: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: "TKT-0038", partner: "Tiot", partnerEmail: "karwan@tiot.com",
    category: "overblocking",
    subject: "Legitimate users being blocked on MTN",
    description: "~15% false positive block rate on MTN network.",
    uniqId: null, priority: "high", status: "feedback",
    created: Date.now() - 5 * 60 * 60 * 1000,
  },
  {
    id: "TKT-0037", partner: "DTAC", partnerEmail: "tech@dtac.com",
    category: "error-response",
    subject: "API returning 500 on subscription endpoint",
    description: "Subscription API endpoint intermittently returns 500 errors.",
    uniqId: null, priority: "critical", status: "resolved",
    created: Date.now() - 24 * 60 * 60 * 1000,
  },
  {
    id: "TKT-0036", partner: "one-plan", partnerEmail: "dev@oneplan.co",
    category: "blocked-testing",
    subject: "Block happening on clean test devices",
    description: "Fresh emulators with no prior history are being blocked during integration testing.",
    uniqId: "UUID-OP-11203", priority: "high", status: "resolved",
    created: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
];

function timeAgo(ts) {
  const d = Date.now() - ts;
  if (d < 60000)    return "just now";
  if (d < 3600000)  return `${Math.floor(d / 60000)} min ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)} hr ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

// ── StatusPill ────────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span className="spt-status-pill" style={{ "--s-color": m.color, "--s-bg": m.bg }}>
      {m.label}
    </span>
  );
}

// ── ReportIssueModal — exported for TransactionsModal ─────────────────────────
export function ReportIssueModal({ onClose, prefillTransactionId = null, partnerName = "Partner" }) {
  const [category,    setCategory]    = useState("");
  const [subject,     setSubject]     = useState("");
  const [description, setDescription] = useState("");
  const [priority,    setPriority]    = useState("medium");
  const [uniqId,      setUniqId]      = useState(prefillTransactionId || "");
  const [submitted,   setSubmitted]   = useState(false);
  const [errors,      setErrors]      = useState({});

  // Transaction context fields — only required when category === "blocked-testing"
  const [reporterEmail,    setReporterEmail]    = useState("");
  const [isHumanTest,      setIsHumanTest]      = useState(null);
  const [testerName,       setTesterName]       = useState("");
  const [remoteControl,    setRemoteControl]    = useState(null);
  const [deviceUsed,       setDeviceUsed]       = useState("");
  const [establishedMerch, setEstablishedMerch] = useState(null);
  const [landingPageUrl,   setLandingPageUrl]   = useState("");

  const showUniqId      = category === "blocked-testing";
  const showTxContext   = category === "blocked-testing";

  function validate() {
    const e = {};
    if (!category)           e.category    = "Please select an issue type";
    if (!reporterEmail.trim())                          e.reporterEmail = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail)) e.reporterEmail = "Please enter a valid email";
    if (!subject.trim())     e.subject     = "Subject is required";
    if (!description.trim()) e.description = "Description is required";
    if (showTxContext) {
      if (isHumanTest === null)                      e.isHumanTest      = "Please select an option";
      if (isHumanTest && !testerName.trim())         e.testerName       = "Please enter the tester's name";
      if (remoteControl === null)                    e.remoteControl    = "Please select an option";
      if (!deviceUsed.trim())                        e.deviceUsed       = "Please specify the device";
      if (establishedMerch === null)                 e.establishedMerch = "Please select an option";
      if (!landingPageUrl.trim())                    e.landingPageUrl   = "Please provide the landing page URL";
    }
    setErrors(e);
    return !Object.keys(e).length;
  }

  function handleSubmit() {
    if (!validate()) return;
    const catLabel = getIssueType(category)?.label ?? category;
    const priLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
    const emailSub = encodeURIComponent(`[Shield Support] ${catLabel}: ${subject}`);
    const lines = [
      `Partner: ${partnerName}`,
      `Reporter Email: ${reporterEmail}`,
      `Issue Type: ${catLabel}`,
      `Priority: ${priLabel}`,
      ...(showUniqId && uniqId ? [`Transaction UniqueID: ${uniqId}`] : []),
      ...(showTxContext ? [
        "",
        "── Transaction Context ──",
        `Verified Human Test: ${isHumanTest ? "Yes" : "No"}`,
        ...(isHumanTest ? [`Tester: ${testerName}`] : []),
        `Remote Control Software: ${remoteControl ? "Yes" : "No"}`,
        `Device Used: ${deviceUsed}`,
        `Established Merchant: ${establishedMerch ? "Yes" : "No"}`,
        `Landing Page URL: ${landingPageUrl}`,
      ] : []),
      "",
      `Subject: ${subject}`,
      "",
      "Description:",
      description,
      "",
      "---",
      "Sent via MCP Shield Support Portal",
    ];
    window.open(`mailto:${SUPPORT_EMAIL}?subject=${emailSub}&body=${encodeURIComponent(lines.join("\n"))}`);
    setSubmitted(true);
  }

  return createPortal(
    <>
      <div className="spt-modal-overlay" onClick={onClose} />
      <div className="spt-modal-box" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="spt-success-wrap">
            <div className="spt-success-icon">✓</div>
            <div className="spt-success-title">Ticket Submitted!</div>
            <div className="spt-success-sub">
              Your request has been logged and a notification email sent to the support team.
            </div>
            <button onClick={onClose} className="spt-submit-btn" type="button">Close</button>
          </div>
        ) : (
          <>
            <div className="spt-modal-header">
              <div>
                <div className="spt-modal-title">Log a Support Ticket</div>
                <div className="spt-modal-sub">Our team responds within 2 business hours.</div>
              </div>
              <button onClick={onClose} className="spt-modal-close-btn" type="button">×</button>
            </div>

            <div className="spt-modal-body">
              {/* Issue Type */}
              <div className="spt-field">
                <label className="spt-label">Issue Type <span className="spt-required">*</span></label>
                <div className="spt-category-grid">
                  {ISSUE_TYPES.map((t) => (
                    <button key={t.key} type="button"
                      className={`spt-cat-btn${category === t.key ? " spt-cat-btn--active" : ""}`}
                      onClick={() => {
                        setCategory(t.key);
                        setErrors((e) => ({ ...e, category: null }));
                        // Reset context fields when switching away from blocked-testing
                        if (t.key !== "blocked-testing") {
                          setIsHumanTest(null); setTesterName(""); setRemoteControl(null);
                          setDeviceUsed(""); setEstablishedMerch(null); setLandingPageUrl("");
                        }
                      }}
                    >
                      <span className="spt-cat-icon">{t.icon}</span>
                      <span className="spt-cat-label">{t.label}</span>
                    </button>
                  ))}
                </div>
                {errors.category && <span className="spt-err-msg">{errors.category}</span>}
              </div>

              {/* ── Transaction Context — only for Blocked During Testing ── */}
              {showTxContext && (
                <div className="spt-tx-context-block">
                  <div className="spt-tx-context-header">
                    <span className="spt-tx-context-icon">🔍</span>
                    <div>
                      <div className="spt-tx-context-title">Transaction Context</div>
                      <div className="spt-tx-context-sub">Help us investigate by answering a few quick questions.</div>
                    </div>
                  </div>

                  {/* UniqueID */}
                  <div className="spt-field">
                    <label className="spt-label">Transaction UniqueID</label>
                    <input
                      value={uniqId}
                      onChange={(e) => setUniqId(e.target.value)}
                      placeholder="e.g. UUID-ZA-83742"
                      className={`spt-input${prefillTransactionId ? " spt-input-linked" : ""}`}
                      readOnly={!!prefillTransactionId}
                    />
                    {prefillTransactionId && (
                      <span className="spt-field-hint">🔗 Auto-linked from transaction</span>
                    )}
                  </div>

                  {/* Q1: Human test? */}
                  <div className="spt-field">
                    <label className="spt-label">Is this a verified human test? <span className="spt-required">*</span></label>
                    <div className="spt-yesno-row">
                      {[{ val: true, label: "Yes" }, { val: false, label: "No" }].map(({ val, label }) => (
                        <button key={String(val)} type="button"
                          className={`spt-yesno-btn${isHumanTest === val ? " spt-yesno-btn--active" : ""}`}
                          onClick={() => { setIsHumanTest(val); setErrors((e) => ({ ...e, isHumanTest: null, testerName: null })); }}
                        >{label}</button>
                      ))}
                    </div>
                    {errors.isHumanTest && <span className="spt-err-msg">{errors.isHumanTest}</span>}
                  </div>

                 

                  {/* Q2: Remote control software */}
                  <div className="spt-field">
                    <label className="spt-label">Is any remote control software being used? <span className="spt-required">*</span></label>
                    <div className="spt-yesno-row">
                      {[{ val: true, label: "Yes" }, { val: false, label: "No" }].map(({ val, label }) => (
                        <button key={String(val)} type="button"
                          className={`spt-yesno-btn${remoteControl === val ? " spt-yesno-btn--active" : ""}`}
                          onClick={() => { setRemoteControl(val); setErrors((e) => ({ ...e, remoteControl: null })); }}
                        >{label}</button>
                      ))}
                    </div>
                    {errors.remoteControl && <span className="spt-err-msg">{errors.remoteControl}</span>}
                  </div>

                  {/* Q3: Device used */}
                  <div className="spt-field">
                    <label className="spt-label">What device was used? <span className="spt-required">*</span></label>
                    <input
                      value={deviceUsed}
                      onChange={(e) => { setDeviceUsed(e.target.value); setErrors((v) => ({ ...v, deviceUsed: null })); }}
                      placeholder="e.g. iPhone 15, Samsung Galaxy S23, Chrome on Windows…"
                      className={`spt-input${errors.deviceUsed ? " spt-input-err" : ""}`}
                    />
                    {errors.deviceUsed && <span className="spt-err-msg">{errors.deviceUsed}</span>}
                  </div>

                  {/* Q4: Established merchant */}
                  <div className="spt-field">
                    <label className="spt-label">
                      Is this from an established merchant that already understands the integration with Shield?{" "}
                      <span className="spt-required">*</span>
                    </label>
                    <div className="spt-yesno-row">
                      {[{ val: true, label: "Yes" }, { val: false, label: "No" }].map(({ val, label }) => (
                        <button key={String(val)} type="button"
                          className={`spt-yesno-btn${establishedMerch === val ? " spt-yesno-btn--active" : ""}`}
                          onClick={() => { setEstablishedMerch(val); setErrors((e) => ({ ...e, establishedMerch: null })); }}
                        >{label}</button>
                      ))}
                    </div>
                    {errors.establishedMerch && <span className="spt-err-msg">{errors.establishedMerch}</span>}
                  </div>

                  {/* Q5: Landing page URL */}
                  <div className="spt-field">
                    <label className="spt-label">What is the landing page URL? <span className="spt-required">*</span></label>
                    <input
                      value={landingPageUrl}
                      onChange={(e) => { setLandingPageUrl(e.target.value); setErrors((v) => ({ ...v, landingPageUrl: null })); }}
                      placeholder="https://…"
                      className={`spt-input${errors.landingPageUrl ? " spt-input-err" : ""}`}
                      type="url"
                    />
                    {errors.landingPageUrl && <span className="spt-err-msg">{errors.landingPageUrl}</span>}
                  </div>
                </div>
              )}

              {/* Priority */}
              <div className="spt-field">
                <label className="spt-label">Priority</label>
                <div className="spt-priority-row">
                  {PRIORITY_LEVELS.map((p) => (
                    <button key={p.key} type="button"
                      className={`spt-priority-btn${priority === p.key ? " spt-priority-btn--active" : ""}`}
                      style={{ "--pri-color": p.color }}
                      onClick={() => setPriority(p.key)}
                    >
                      <span className="spt-priority-dot" />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reporter Email */}
              <div className="spt-field">
                <label className="spt-label">Your Email <span className="spt-required">*</span></label>
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => { setReporterEmail(e.target.value); setErrors((v) => ({ ...v, reporterEmail: null })); }}
                  placeholder="e.g. john@company.com"
                  className={`spt-input${errors.reporterEmail ? " spt-input-err" : ""}`}
                />
                {errors.reporterEmail && <span className="spt-err-msg">{errors.reporterEmail}</span>}
              </div>

              {/* Subject */}
              <div className="spt-field">
                <label className="spt-label">Subject <span className="spt-required">*</span></label>
                <input
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); setErrors((v) => ({ ...v, subject: null })); }}
                  placeholder="Brief description of the issue…"
                  className={`spt-input${errors.subject ? " spt-input-err" : ""}`}
                />
                {errors.subject && <span className="spt-err-msg">{errors.subject}</span>}
              </div>

              {/* Description */}
              <div className="spt-field">
                <label className="spt-label">Description <span className="spt-required">*</span></label>
                <textarea
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setErrors((v) => ({ ...v, description: null })); }}
                  placeholder="Full details: what you tested, what was blocked, expected vs actual behaviour, any error codes…"
                  className={`spt-textarea${errors.description ? " spt-input-err" : ""}`}
                  rows={5}
                />
                {errors.description && <span className="spt-err-msg">{errors.description}</span>}
              </div>
            </div>

            <div className="spt-modal-footer">
              <button onClick={onClose} className="spt-cancel-btn" type="button">Cancel</button>
              <button onClick={handleSubmit} type="button" className="spt-submit-btn">
                <SendIcon size={13} />
                Submit Ticket
              </button>
            </div>
          </>
        )}
      </div>
    </>,
    document.body,
  );
}

// ── Admin: Status dropdown via ··· button ────────────────────────────────────
function StatusDropdown({ ticketId, current, onChange }) {
  const [open, setOpen]   = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = React.useRef(null);

  const currentMeta = STATUS_META[current] ?? STATUS_META.pending;
  const nextKey     = STATUS_FLOW[STATUS_FLOW.indexOf(current) + 1];
  const nextMeta    = nextKey ? STATUS_META[nextKey] : null;

  function handleOpen() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setCoords({ top: r.bottom + 6, left: r.right });
    }
    setOpen((v) => !v);
  }

  return (
    <div className="spt-sdd">
      {/* Current status pill — read-only display */}
      <StatusPill status={current} />

      {/* Three-dot trigger */}
      <button ref={btnRef} type="button"
        className={`spt-sdd-dots${open ? " spt-sdd-dots--open" : ""}`}
        onClick={handleOpen}
        title="Change status"
      >
        ···
      </button>

      {/* Portal dropdown — rendered outside the table section */}
      {open && createPortal(
        <>
          <div className="spt-sdd-backdrop" onClick={() => setOpen(false)} />
          <div className="spt-sdd-menu"
            style={{ "--menu-top": `${coords.top}px`, "--menu-left": `${coords.left}px` }}
          >
            <div className="spt-sdd-menu-title">Set Status</div>
            {STATUS_FLOW.map((s) => {
              const m = STATUS_META[s];
              return (
                <button key={s} type="button"
                  className={`spt-sdd-item${s === current ? " spt-sdd-item--active" : ""}`}
                  style={{ "--s-color": m.color, "--s-bg": m.bg }}
                  onClick={() => { onChange(ticketId, s); setOpen(false); }}
                >
                  <span className="spt-sdd-dot" />
                  {m.label}
                  {s === current && <span className="spt-sdd-check">✓</span>}
                </button>
              );
            })}
            {nextMeta && (
              <>
                <div className="spt-sdd-divider" />
                <button type="button"
                  className="spt-sdd-advance-item"
                  style={{ "--s-color": nextMeta.color, "--s-bg": nextMeta.bg }}
                  onClick={() => { onChange(ticketId, nextKey); setOpen(false); }}
                >
                  <span className="spt-sdd-dot" />
                  Advance → {nextMeta.label}
                </button>
              </>
            )}
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}

// ── Admin: Alerts by Client cards ─────────────────────────────────────────────
function ClientAlerts({ tickets }) {
  const byPartner = {};
  tickets.forEach((t) => {
    if (!byPartner[t.partner]) byPartner[t.partner] = { open: 0, total: 0 };
    byPartner[t.partner].total++;
    if (t.status !== "resolved") byPartner[t.partner].open++;
  });

  return (
    <div className="spt-client-alerts-grid">
      {Object.entries(byPartner).map(([partner, c]) => (
        <div key={partner} className={`spt-client-alert-card${c.open > 0 ? " has-open" : ""}`}>
          {c.open > 0 && <span className="spt-client-alert-dot" />}
          <div className="spt-client-alert-name">{partner}</div>
          <div className="spt-client-alert-counts">
            <span className="spt-client-alert-open" style={{ color: c.open > 0 ? "#dc2626" : "#94a3b8" }}>
              {c.open} open
            </span>
            <span className="spt-client-alert-sep">·</span>
            <span className="spt-client-alert-total">{c.total} total</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Admin: Tickets grid grouped by partner ────────────────────────────────────
function AdminGrid({ tickets, onStatusChange }) {
  const [filterPartner, setFilterPartner] = useState("all");
  const [filterStatus,  setFilterStatus]  = useState("all");

  const partners = [...new Set(tickets.map((t) => t.partner))].sort();
  const filtered = tickets.filter((t) => {
    const mp = filterPartner === "all" || t.partner === filterPartner;
    const ms = filterStatus  === "all" || t.status  === filterStatus;
    return mp && ms;
  });

  const grouped = {};
  filtered.forEach((t) => {
    if (!grouped[t.partner]) grouped[t.partner] = [];
    grouped[t.partner].push(t);
  });

  return (
    <div className="spt-admin-wrap">
      <div className="spt-admin-filters">
        <div className="spt-admin-filter-group">
          <label className="spt-admin-filter-lbl">Partner</label>
          <select value={filterPartner} onChange={(e) => setFilterPartner(e.target.value)} className="spt-admin-select">
            <option value="all">All Partners</option>
            {partners.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="spt-admin-filter-group">
          <label className="spt-admin-filter-lbl">Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="spt-admin-select">
            <option value="all">All Statuses</option>
            {STATUS_FLOW.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </select>
        </div>
        <span className="spt-admin-filter-count">{filtered.length} ticket{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {Object.entries(grouped).map(([partner, rows]) => (
        <div key={partner} className="spt-partner-section">
          <div className="spt-partner-section-hd">
            <span className="spt-partner-section-name">{partner}</span>
            <span className="spt-partner-section-count">{rows.length} ticket{rows.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="spt-grid-scroll">
            <table className="spt-grid-table">
              <thead>
                <tr className="spt-grid-head-row">
                  {["ID", "Issue Type", "Subject", "UniqueID", "Priority", "Time", "Status & Actions"].map((h) => (
                    <th key={h} className="spt-grid-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="spt-grid-row">
                    <td className="spt-grid-td spt-grid-td-id">{t.id}</td>
                    <td className="spt-grid-td">
                      <span className="spt-grid-type">
                        {getIssueType(t.category)?.icon}{" "}
                        {getIssueType(t.category)?.label ?? t.category}
                      </span>
                    </td>
                    <td className="spt-grid-td spt-grid-td-subject">{t.subject}</td>
                    <td className="spt-grid-td">
                      {t.uniqId
                        ? <span className="spt-uniq-chip">{t.uniqId}</span>
                        : <span className="spt-uniq-none">—</span>}
                    </td>
                    <td className="spt-grid-td">
                      <span className="spt-priority-pill" style={{ "--pri-color": getPriColor(t.priority) }}>
                        <span className="spt-priority-dot" />
                        {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                      </span>
                    </td>
                    <td className="spt-grid-td spt-grid-td-time">{timeAgo(t.created)}</td>
                    <td className="spt-grid-td">
                      <StatusDropdown ticketId={t.id} current={t.status} onChange={onStatusChange} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {!filtered.length && <div className="spt-empty">No tickets match the current filters.</div>}
    </div>
  );
}

// ── Partner: Ticket list ──────────────────────────────────────────────────────
function PartnerTicketList({ tickets, onNew }) {
  const [filter, setFilter] = useState("all");

  const counts = {
    all:        tickets.length,
    pending:    tickets.filter((t) => t.status === "pending").length,
    inprogress: tickets.filter((t) => ["review", "processing", "feedback"].includes(t.status)).length,
    resolved:   tickets.filter((t) => t.status === "resolved").length,
  };

  const filtered =
    filter === "all"        ? tickets :
    filter === "inprogress" ? tickets.filter((t) => ["review", "processing", "feedback"].includes(t.status)) :
                              tickets.filter((t) => t.status === filter);

  return (
    <div className="spt-wrap">
      <div className="spt-kpi-row">
        {[
          { label: "Total",       val: counts.all,        cls: "total"    },
          { label: "Pending",     val: counts.pending,    cls: "open"     },
          { label: "In Progress", val: counts.inprogress, cls: "progress" },
          { label: "Resolved",    val: counts.resolved,   cls: "resolved" },
        ].map((k) => (
          <div key={k.label} className="spt-kpi-card">
            <div className={`spt-kpi-val spt-kpi-val--${k.cls}`}>{k.val}</div>
            <div className="spt-kpi-lbl">{k.label}</div>
          </div>
        ))}
        <button className="spt-new-btn" onClick={onNew} type="button">
          <PlusIcon size={13} />
          Log New Issue
        </button>
      </div>

      <div className="spt-filter-tabs">
        {[
          { key: "all",        label: "All",         count: counts.all        },
          { key: "pending",    label: "Pending",     count: counts.pending    },
          { key: "inprogress", label: "In Progress", count: counts.inprogress },
          { key: "resolved",   label: "Resolved",    count: counts.resolved   },
        ].map((f) => (
          <button key={f.key} type="button"
            className={`spt-filter-tab${filter === f.key ? " spt-filter-tab--active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="spt-filter-count">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="spt-ticket-list">
        {!filtered.length
          ? <div className="spt-empty">No tickets in this category.</div>
          : filtered.map((t) => (
            <div key={t.id} className="spt-ticket-row">
              <span className="spt-ticket-cat-icon">{getIssueType(t.category)?.icon ?? "💬"}</span>
              <div className="spt-ticket-info">
                <div className="spt-ticket-subject">{t.subject}</div>
                <div className="spt-ticket-meta">
                  <span className="spt-ticket-id">{t.id}</span>
                  <span className="spt-ticket-sep">·</span>
                  <span className="spt-ticket-cat">{getIssueType(t.category)?.label ?? t.category}</span>
                  {t.uniqId && (
                    <><span className="spt-ticket-sep">·</span>
                    <span className="spt-uniq-chip spt-uniq-chip-sm">{t.uniqId}</span></>
                  )}
                  <span className="spt-ticket-sep">·</span>
                  <span className="spt-ticket-time">{timeAgo(t.created)}</span>
                </div>
              </div>
              <div className="spt-ticket-right">
                <span className="spt-priority-pill" style={{ "--pri-color": getPriColor(t.priority) }}>
                  <span className="spt-priority-dot" />
                  {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                </span>
                <StatusPill status={t.status} />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PageSupport({ role = "admin" }) {
  const isPartner = role === "partner";
  const [tickets,   setTickets]   = useState(SEED_TICKETS);
  const [showModal, setShowModal] = useState(false);

  // Mock: partner is always "Tiot" — in real app derive from auth context
  const myPartner = "Tiot";
  const myTickets = isPartner ? tickets.filter((t) => t.partner === myPartner) : tickets;

  function handleStatusChange(ticketId, newStatus) {
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status: newStatus } : t));
  }

  return (
    <div className="spt-page-wrap">
      <div className="spt-page-hd">
        <div className="spt-page-hd-left">
          <div className="spt-page-icon">
            <MessageIcon size={20} />
          </div>
          <div>
            <h1 className="spt-page-title">Support & Issues</h1>
            <div className="spt-page-sub">
              {isPartner
                ? "Log issues, report blocked traffic and track your support requests"
                : "Manage partner support tickets and track resolutions"}
            </div>
          </div>
        </div>
      </div>

      {/* Admin: alerts by client */}
      {!isPartner && (
        <Card className="mb-section">
          <SectionTitle>Alerts by Client</SectionTitle>
          <ClientAlerts tickets={tickets} />
        </Card>
      )}

      <Card>
        {isPartner
          ? <PartnerTicketList tickets={myTickets} onNew={() => setShowModal(true)} />
          : <AdminGrid tickets={tickets} onStatusChange={handleStatusChange} />
        }
      </Card>

      {showModal && (
        <ReportIssueModal
          onClose={() => setShowModal(false)}
          partnerName={myPartner}
        />
      )}
    </div>
  );
}