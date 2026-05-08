import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportIssueModal } from "../../pages/Support";

// ── Event template — all test names used per event type ──────────────────────
const EVENT_TEMPLATES = [
  {
    name: "Pointerdown",
    tests: ["Screen Test", "Event Layers Test", "Client Test"],
  },
  {
    name: "Touchstart",
    tests: ["Screen Test", "Client Test", "Touch Area Test"],
  },
  {
    name: "Pointerup",
    tests: ["Screen Test", "Event Layers Test", "Client Test"],
  },
  {
    name: "Touchend",
    tests: ["Screen Test", "Client Test", "Touch Area Test"],
  },
  {
    name: "Mousedown",
    tests: ["Screen Test", "Event Layers Test", "Client Test"],
  },
  {
    name: "Mouseup",
    tests: ["Screen Test", "Event Layers Test", "Client Test"],
  },
  { name: "Click", tests: ["Screen Test", "Event Layers Test", "Client Test"] },
];

// For blocked transactions: which specific tests fail per event
const BLOCKED_FAILURES = {
  Touchstart: ["Touch Area Test"],
  Mousedown: ["Event Layers Test"],
  Pointerdown: ["Client Test"], // only in seq 2
};

// Build one click sequence worth of events
// seqIdx 0 = first click, seqIdx 1 = second click etc.
// isBlocked drives whether any tests fail
function buildSequence(seqIdx, isBlocked, baseMs) {
  const offsets = [0, 4, 8, 40, 211, 215, 240]; // ms offsets per event
  const base = new Date(`2026-02-25T04:23:${19 + seqIdx * 2}.000`);

  return EVENT_TEMPLATES.map((tmpl, i) => {
    const t = new Date(base.getTime() + offsets[i] + baseMs);
    const timeStr =
      t.toISOString().replace("T", " ").replace("Z", "").slice(0, 23) + " AM";

    // Clean = every test is always pass. Blocked = specific tests fail per sequence.
    const tests = tmpl.tests.map((testName) => {
      if (!isBlocked) return { name: testName, status: "pass" };
      const failSet =
        seqIdx === 0
          ? {
              Touchstart: ["Touch Area Test"],
              Mousedown: ["Event Layers Test"],
            }
          : { Pointerdown: ["Client Test"], Mouseup: ["Event Layers Test"] };
      return {
        name: testName,
        status: failSet[tmpl.name]?.includes(testName) ? "fail" : "pass",
      };
    });

    return { name: tmpl.name, time: timeStr, tests };
  });
}

// Build device-check results driven by status
function buildDeviceChecks(isBlocked) {
  const p = "pass";
  const f = isBlocked ? "fail" : "pass"; // only fails when truly blocked
  return {
    "UI Rendering": [
      { name: "Point 0 Test", status: f },
      { name: "Background Rendering Test", status: p },
      { name: "0x0 0x0 Pixel View W.R.T Device", status: f },
      { name: "0x0 0x0 Pixel View W.R.T Browser", status: p },
    ],
    Spoofing: [
      { name: "Canvas Fingerprint Test", status: p },
      { name: "WebGL Renderer Test", status: f },
      { name: "Audio Context Test", status: p },
      { name: "Font Metrics Test", status: p },
    ],
    "JavaScript Challenge": [
      { name: "Timing Attack Test", status: p },
      { name: "Prototype Chain Test", status: f },
      { name: "Eval Behavior Test", status: p },
      { name: "Async Context Test", status: p },
    ],
  };
}

function groupIntoClickSequences(events) {
  const groups = [];
  let current = [];
  events.forEach((evt) => {
    current.push(evt);
    if (evt.name === "Click") {
      groups.push(current);
      current = [];
    }
  });
  if (current.length) groups.push(current);
  return groups;
}

function makeDetail(row) {
  const isBlocked = (row?.status || "").toLowerCase().includes("block");
  return {
    url: "http://aciq.playit.mobi/confirm-asiacell?uniquid=ask004b49312599e074c94c3951d698ad23",
    referrer:
      "http://aciq.playit.mobi/signup?parameter=60432life-15od-4cb2-837f-2e8e7f380f6b&trafficsource=OffyClick",
    time: row?.time || "Feb 25, 04:23:08.438 AM",
    timezone: "Asia/Baghdad",
    transactionId: row?.id || "20260225042308_fd1f907042ef4af9bfe261415926f45",
    client: "IQ Grand Technology",
    service: "GC 2231 Playit",
    queried: "Yes",
    queriedTime: "2026-02-25 07:23:08.488 AM",
    userIp: row?.userIp || "89.46.206.31",
    userAgent:
      "Mozilla/5.0 (Linux; Android 13; SM-M127F Build/TP1A.220624.014) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.135 Mobile Safari/537.36",
    country: "Iraq",
    continent: "Asia",
    timezone2: "Asia/Baghdad",
    device: "Samsung SM-M127F",
    os: "Android",
    browser: "Chrome Mobile",
    network: row?.network || "Asiacell Communications Pjsc",
    status: row?.status || "Clean",
    score: row?.score ?? (isBlocked ? 1.0 : 9.0),
    isBlocked,
    reasons: isBlocked ? ["MCPS-2000", "MCPS-1300", "MCPS-0041"] : [],
  };
}

// ── Small components ──────────────────────────────────────────────────────────
function TestBadge({ status }) {
  return status === "fail" ? (
    <span className="tdd-test-badge fail">Failed</span>
  ) : (
    <span className="tdd-test-badge pass">Passed</span>
  );
}

function eventHasFail(evt) {
  return evt.tests.some((t) => t.status === "fail");
}
function seqHasFail(seq) {
  return seq.some(eventHasFail);
}

// ── Raw Data Modal ────────────────────────────────────────────────────────────
function RawDataModal({ d, rawEvents, onClose, setPage, onParentClose, isAdmin, navigateTo }) {
  const [section, setSection] = useState("txn"); // "txn" | "events" | "apm"
  const [txnView, setTxnView] = useState("table"); // "table" | "json"
  const [evtPage, setEvtPage] = useState(1);
  const [evtPageSize, setEvtPageSize] = useState(10);
  const [evtSearch, setEvtSearch] = useState("");
  const EVT_PAGE_SIZE_OPTS = [10, 25, 50];

  const eventsRows = rawEvents.map((evt, i) => ({
    key: `evt-key-${i}-ts1773100${800000 + i * 551}`,
    serverTime: evt.time,
    method: i === 0 ? "POST" : "WS",
    type: [
      "NOW",
      "SRSCI",
      "SDCL",
      "SWL",
      "SRSCC",
      "CINFO",
      "SHIELDOKAYSUCCESS",
    ][i % 7],
    status: evt.tests.some((t) => t.status === "fail") ? "Block" : "Clear",
    requestIp: d.userIp,
    xForwardedFor: d.userIp,
  }));

  const filteredEvts = eventsRows.filter(
    (r) =>
      r.key.toLowerCase().includes(evtSearch.toLowerCase()) ||
      r.type.toLowerCase().includes(evtSearch.toLowerCase()) ||
      r.status.toLowerCase().includes(evtSearch.toLowerCase()),
  );
  const evtTotalPages = Math.ceil(filteredEvts.length / evtPageSize);
  const pagedEvts = filteredEvts.slice(
    (evtPage - 1) * evtPageSize,
    evtPage * evtPageSize,
  );

  const jsonPayload = {
    server_time: "2026-03-09T23:59:59.982Z",
    user_IP: d.userIp,
    fraud_report: {
      app: { pass: !d.isBlocked, score: d.score, full: !d.isBlocked },
      request_from: "111.223.33.241",
      agent: {
        os: { name: "Android", version: "15", full: "Android 15" },
        browser: { name: "Chrome Mobile" },
        device: { name: "V2520" },
      },
    },
    request_time: 1773100813924,
    comments: {
      events: {},
      ipBlocked: d.isBlocked ? "Auto IP Anomaly Blocked" : null,
      rbr: d.isBlocked ? "Report Data & Interaction Event Missing" : null,
      reasons: d.isBlocked
        ? { shieldCodes: { 0: "MCPS-2000", 1: "MCPS-1300" } }
        : {},
      uiRendering: {
        _0Test: d.isBlocked ? "Missing" : "Pass",
        bRendering: d.isBlocked ? "Missing" : "Pass",
      },
      spoofing: {
        os: d.isBlocked ? "Missing" : "Pass",
        browser: d.isBlocked ? "Missing" : "Pass",
        language: d.isBlocked ? "Missing" : "Pass",
      },
      jsChallenge: {
        clientSideVerification: d.isBlocked ? "Missing" : "Pass",
        serverSideVerification: d.isBlocked ? "Failed" : "Pass",
      },
      interaction: !d.isBlocked,
      ipIssue: d.isBlocked,
      deviceIssue: !d.isBlocked,
    },
    geoip: {
      continent_name: d.continent,
      city_name: "Baghdad",
      country_iso_code: "IQ",
      timezone: d.timezone,
      country_name: d.country,
      region_name: d.country,
      location: { lat: 33.3406, lon: 44.4009 },
    },
  };

  const jsonStr = JSON.stringify(jsonPayload, null, 2);

  function highlightJson(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let cls = "rdm-json-num";
          if (/^"/.test(match))
            cls = /:$/.test(match) ? "rdm-json-key" : "rdm-json-str";
          else if (/true|false/.test(match)) cls = "rdm-json-bool";
          else if (/null/.test(match)) cls = "rdm-json-null";
          return `<span class="${cls}">${match}</span>`;
        },
      );
  }

  const tableRows = [
    { name: "URL", data: d.url },
    { name: "Time", data: d.time },
    { name: "Transaction ID", data: d.transactionId },
    { name: "client_id", data: "IX7ig5QBQGMxF54qv1U2" },
    { name: "Clients", data: d.client, badge: "client" },
    { name: "Service ID", data: "dcssgpcB-W5fcuuf95Yb" },
    { name: "Services", data: d.service, badge: "service" },
    { name: "User IP", data: d.userIp },
    { name: "Queried", data: d.queriedTime, queried: true },
    { name: "User Agent", data: d.userAgent },
  ];

  const SECTIONS = [
    { key: "txn", label: "Transaction Information", bar: "rdm-bar-blue" },
    { key: "events", label: "Events Data Information", bar: "rdm-bar-violet" },
    { key: "apm", label: "APM Data", bar: "rdm-bar-amber" },
  ];

  return (
    <>
      <div className="rdm-backdrop" onClick={onClose} />
      <div className="rdm-modal">
        {/* ── Header ── */}
        <div className={`rdm-header ${d.isBlocked ? "rdm-header--blocked" : "rdm-header--clean"}`}>
          <div className="rdm-header-left">
            <div className="rdm-header-icon">📄</div>
            <div>
              <div className="rdm-header-title">Raw Transaction Data</div>
              <div className="rdm-header-sub">{d.transactionId}</div>
            </div>
          </div>
          <button onClick={onClose} className="rdm-close-btn">
            ×
          </button>
        </div>

        {/* ── Section Tab Bar ── */}
        <div className="rdm-section-tabs">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`rdm-section-tab${section === s.key ? " active" : ""}`}
              onClick={() => setSection(s.key)}
            >
              <span className={`rdm-section-tab-bar ${s.bar}`} />
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="rdm-body">
          {/* Transaction Information */}
          {section === "txn" && (
            <div className="rdm-section">
              <div className="rdm-tab-row">
                <button
                  type="button"
                  className={`rdm-tab-btn${txnView === "table" ? " active" : ""}`}
                  onClick={() => setTxnView("table")}
                >
                  <span className="rdm-tab-icon">⊞</span> Table
                </button>
                <button
                  type="button"
                  className={`rdm-tab-btn${txnView === "json" ? " active" : ""}`}
                  onClick={() => setTxnView("json")}
                >
                  <span className="rdm-tab-icon rdm-tab-icon-json">
                    &lt;/&gt;
                  </span>{" "}
                  JSON
                </button>
              </div>

              {txnView === "table" && (
                <div className="rdm-table-wrap">
                  <div className="rdm-tbl-controls">
                    <div className="rdm-tbl-entries">
                      Show
                      <select className="rdm-tbl-sel" defaultValue={10}>
                        <option>10</option>
                        <option>25</option>
                        <option>50</option>
                      </select>
                      entries
                    </div>
                    <div className="rdm-tbl-search-wrap">
                      Search: <input className="rdm-tbl-search" />
                    </div>
                  </div>
                  <table className="rdm-table">
                    <thead>
                      <tr className="rdm-thead-row">
                        <th className="rdm-th rdm-th-name">Name</th>
                        <th className="rdm-th">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((r, i) => (
                        <tr key={i} className="rdm-tr">
                          <td className="rdm-td-name">{r.name}</td>
                          <td className="rdm-td-data">
                            {r.badge === "client" ? (
                              isAdmin ? (
                                <span
                                  className="rdm-badge rdm-badge-client rdm-badge-clickable"
                                  title={`Filter overview by ${r.data}`}
                                  onClick={() => {
                                    onClose();
                                    onParentClose && onParentClose();
                                    navigateTo && navigateTo(r.data, "client");
                                  }}
                                >
                                  {r.data}
                                  <span className="rdm-badge-link-icon">↗</span>
                                </span>
                              ) : (
                                <span className="rdm-badge rdm-badge-client">{r.data}</span>
                              )
                            ) : r.badge === "service" ? (
                              <span
                                className="rdm-badge rdm-badge-service rdm-badge-clickable"
                                title={`Filter overview by ${r.data}`}
                                onClick={() => {
                                  onClose();
                                  onParentClose && onParentClose();
                                  navigateTo && navigateTo(r.data, "service");
                                }}
                              >
                                {r.data}
                                <span className="rdm-badge-link-icon">↗</span>
                              </span>
                            ) : r.queried ? (
                              <span className="rdm-queried-wrap">
                                <span className="rdm-queried-yes">Yes</span>
                                <span className="rdm-queried-time">
                                  {r.data}
                                </span>
                                <span
                                  className="rdm-queried-icon"
                                  title="Verified"
                                >
                                  ⅱ
                                </span>
                              </span>
                            ) : r.name === "URL" ? (
                              <a href="#" className="rdm-link">
                                {r.data}
                              </a>
                            ) : r.name === "User Agent" ? (
                              <span className="rdm-ua">{r.data}</span>
                            ) : (
                              r.data
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="rdm-tbl-footer">
                    <span className="rdm-tbl-count">
                      Showing 1 to {tableRows.length} of {tableRows.length}{" "}
                      entries
                    </span>
                    <div className="rdm-tbl-pager">
                      <button className="rdm-pg-btn disabled">Previous</button>
                      <button className="rdm-pg-btn active">1</button>
                      <button className="rdm-pg-btn disabled">Next</button>
                    </div>
                  </div>
                </div>
              )}

              {txnView === "json" && (
                <div className="rdm-json-wrap">
                  <div className="rdm-json-toolbar">
                    <span className="rdm-json-badge">JSON</span>
                    <button
                      type="button"
                      className="rdm-json-copy-btn"
                      onClick={() => navigator.clipboard.writeText(jsonStr)}
                    >
                      📋 Copy
                    </button>
                  </div>
                  <pre
                    className="rdm-json-block"
                    dangerouslySetInnerHTML={{ __html: highlightJson(jsonStr) }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Events Data Information */}
          {section === "events" && (
            <div className="rdm-section">
              <div className="rdm-tbl-controls">
                <div className="rdm-tbl-entries">
                  Show
                  <select
                    className="rdm-tbl-sel"
                    value={evtPageSize}
                    onChange={(e) => {
                      setEvtPageSize(+e.target.value);
                      setEvtPage(1);
                    }}
                  >
                    {EVT_PAGE_SIZE_OPTS.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                  entries
                </div>
                <div className="rdm-tbl-search-wrap">
                  Search:
                  <input
                    className="rdm-tbl-search"
                    value={evtSearch}
                    onChange={(e) => {
                      setEvtSearch(e.target.value);
                      setEvtPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="rdm-table-scroll">
                <table className="rdm-table rdm-events-table">
                  <thead>
                    <tr className="rdm-thead-row">
                      {[
                        "#",
                        "Key",
                        "Server Time",
                        "Method",
                        "Type",
                        "Status",
                        "Request IP",
                        "X Forwarded For",
                      ].map((h) => (
                        <th
                          key={h}
                          className={`rdm-th${h === "#" ? " rdm-th-num" : ""}`}
                        >
                          {h}
                          {h !== "#" && (
                            <span className="rdm-sort-icon">⇅</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedEvts.map((r, i) => (
                      <tr key={i} className="rdm-tr">
                        <td className="rdm-td-num">
                          <span
                            className={`rdm-status-dot ${r.status === "Block" ? "rdm-dot-red" : "rdm-dot-green"}`}
                          />
                        </td>
                        <td className="rdm-td-key rdm-mono">{r.key}</td>
                        <td className="rdm-td-time">{r.serverTime}</td>
                        <td className="rdm-td-center">
                          <span
                            className={`rdm-method-badge rdm-method-${r.method.toLowerCase()}`}
                          >
                            {r.method}
                          </span>
                        </td>
                        <td className="rdm-td-center">
                          <span className="rdm-type-badge">{r.type}</span>
                        </td>
                        <td className="rdm-td-center">
                          <span
                            className={`rdm-status-badge ${r.status === "Block" ? "rdm-s-block" : "rdm-s-clear"}`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="rdm-td-ip rdm-mono">{r.requestIp}</td>
                        <td className="rdm-td-ip rdm-mono">
                          {r.xForwardedFor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rdm-tbl-footer">
                <span className="rdm-tbl-count">
                  Showing{" "}
                  {Math.min(
                    (evtPage - 1) * evtPageSize + 1,
                    filteredEvts.length,
                  )}{" "}
                  to {Math.min(evtPage * evtPageSize, filteredEvts.length)} of{" "}
                  {filteredEvts.length} entries
                </span>
                <div className="rdm-tbl-pager">
                  <button
                    className={`rdm-pg-btn${evtPage === 1 ? " disabled" : ""}`}
                    onClick={() => setEvtPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  {Array.from({ length: evtTotalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`rdm-pg-btn${evtPage === i + 1 ? " active" : ""}`}
                      onClick={() => setEvtPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className={`rdm-pg-btn${evtPage === evtTotalPages ? " disabled" : ""}`}
                    onClick={() =>
                      setEvtPage((p) => Math.min(evtTotalPages, p + 1))
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* APM Data */}
          {section === "apm" && (
            <div className="rdm-section">
              <div className="rdm-tbl-controls">
                <div className="rdm-tbl-entries">
                  Show{" "}
                  <select className="rdm-tbl-sel" defaultValue={10}>
                    <option>10</option>
                    <option>25</option>
                  </select>{" "}
                  entries
                </div>
                <div className="rdm-tbl-search-wrap">
                  Search: <input className="rdm-tbl-search" />
                </div>
              </div>
              <table className="rdm-table">
                <thead>
                  <tr className="rdm-thead-row">
                    {[
                      "#",
                      "Time",
                      "ID",
                      "Service Name",
                      "Client IP",
                      "Country Name",
                      "Result",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`rdm-th${h === "#" ? " rdm-th-num" : ""}`}
                      >
                        {h}
                        {h !== "#" && <span className="rdm-sort-icon">⇅</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7} className="rdm-empty-cell">
                      No data available in table
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="rdm-tbl-footer">
                <span className="rdm-tbl-count">
                  Showing 0 to 0 of 0 entries
                </span>
                <div className="rdm-tbl-pager">
                  <button className="rdm-pg-btn disabled">Previous</button>
                  <button className="rdm-pg-btn disabled">Next</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="rdm-footer">
          <button type="button" onClick={onClose} className="rdm-footer-close">
            Close
          </button>
          <button type="button" className="rdm-footer-export">
            Export Raw Data
          </button>
        </div>
      </div>
    </>
  );
}

// ── Collapsible activity group ────────────────────────────────────────────────
function ActivityGroup({ group }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`tdd-act-group${open ? " open" : ""}`}>
      {/* ── Group header — always visible ── */}
      <button
        type="button"
        className={`tdd-act-group-hd ${group.groupColor}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="tdd-act-group-icon">{group.groupIcon}</span>
        <span className="tdd-act-group-name">{group.groupLabel}</span>
        <span className="tdd-act-group-count">{group.items.length}</span>
        <span className="tdd-act-group-range">{group.timeRange}</span>
        <span className={`tdd-act-group-chevron${open ? " open" : ""}`}>▾</span>
      </button>

      {/* ── Expanded items ── */}
      {open && (
        <div className="tdd-act-group-body">
          {group.items.map((item, i) => (
            <div
              key={i}
              className="tdd-activity-item tdd-activity-item--nested"
            >
              <div
                className={`tdd-act-icon tdd-act-icon--${item.label.toLowerCase().replace(/[^a-z]/g, "")}`}
              >
                <TddActivityIcon label={item.label} />
              </div>
              <div className="tdd-act-body">
                <span className="tdd-act-label">{item.label}</span>
                {item.tag !== null ? (
                  <>
                    <span className="tdd-act-desc"> {item.desc} </span>
                    <span
                      className={`tdd-act-tag tdd-act-tag--${item.tagType}`}
                    >
                      {item.tag}
                    </span>
                    <span className="tdd-act-desc"> TAG</span>
                  </>
                ) : (
                  <span className="tdd-act-desc"> {item.desc}</span>
                )}
              </div>
              <div className="tdd-act-time">2026-03-12 {item.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Activity icon helper ──────────────────────────────────────────────────────
function TddActivityIcon({ label }) {
  const l = (label || "").toUpperCase();
  if (l === "SHIELD-KIT") return <span>⚙</span>;
  if (l === "INTERACTIVE") return <span>⚡</span>;
  if (l === "LOADED") return <span>🌐</span>;
  if (l === "COMPLETED") return <span>✓</span>;
  if (l === "VISIBLE") return <span>👁</span>;
  if (l === "INPUT")
    return <span>I</span>;
  if (["POINTERDOWN", "POINTERUP", "MOUSEDOWN", "MOUSEUP", "CLICK"].includes(l))
    return <span>⬤</span>;
  if (["TOUCHSTART", "TOUCHEND"].includes(l)) return <span>👆</span>;
  return <span>●</span>;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TransactionDetailModal({
  row,
  onClose,
  onUserIp,
  setPage,
  onParentClose,
  role = "admin",
  hasImage = false,
  hasVideo = false,
}) {
  const isPartner = role === "partner";
  const isAdmin = role === "admin";

  // Close both this modal and the parent TransactionsModal, then navigate
  const navigateTo = (filterName, filterType) => {
    onClose();
    onParentClose && onParentClose();
    setPage && setPage("overview", { filterName, filterType });
  };

  const [activeTab, setActiveTab] = useState("info"); // "info" | "device" | "events" | "image" | "video"
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [devTab, setDevTab] = useState("UI Rendering");
  const [expandedSeq, setExpandedSeq] = useState(null); // which click group is open
  const [showReport, setShowReport] = useState(false);
  const [expandedEvt, setExpandedEvt] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const d = useMemo(() => makeDetail(row), [row]);

  const rawEvents = useMemo(
    () => [
      ...buildSequence(0, d.isBlocked, 0),
      ...buildSequence(1, d.isBlocked, 2000),
    ],
    [d.isBlocked],
  );

  const clickSequences = useMemo(
    () => groupIntoClickSequences(rawEvents),
    [rawEvents],
  );
  function handleExport() {
    // ── Sheet 1: Transaction Information ──
    const txnRows = [
      ["Field", "Value"],
      ["Transaction ID", d.transactionId],
      ["Status", d.isBlocked ? "Blocked" : "Clean"],
      ["Score", d.score],
      ["Block Reasons", d.reasons.join(", ") || "—"],
      ["URL", d.url],
      ["Referrer", d.referrer],
      ["Time", d.time],
      ["Time Zone", d.timezone],
      ["Client", d.client],
      ["Service", d.service],
      ["Queried", d.queried],
      ["Queried Time", d.queriedTime],
      ["User IP", d.userIp],
      ["User Agent", d.userAgent],
      ["Country", d.country],
      ["Continent", d.continent],
      ["Device", d.device],
      ["OS", d.os],
      ["Browser", d.browser],
      ["Network", d.network],
    ];

    // ── Sheet 2: Device Verification ──
    const checks = buildDeviceChecks(d.isBlocked);
    const deviceRows = [["Category", "Test", "Result"]];
    Object.entries(checks).forEach(([cat, items]) => {
      items.forEach((item) => {
        deviceRows.push([cat, item.name, item.status === "pass" ? "Pass" : "Fail"]);
      });
    });

    // ── Sheet 3: Events Timeline ──
    const evtRows = [["Click Seq", "Event", "Time", "Test", "Result"]];
    const seqs = groupIntoClickSequences([
      ...buildSequence(0, d.isBlocked, 0),
      ...buildSequence(1, d.isBlocked, 2000),
    ]);
    seqs.forEach((seq, si) => {
      seq.forEach((evt) => {
        evt.tests.forEach((test) => {
          evtRows.push([
            `Click ${si + 1}`,
            evt.name,
            evt.time,
            test.name,
            test.status === "pass" ? "Pass" : "Fail",
          ]);
        });
      });
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(txnRows), "Transaction Info");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(deviceRows), "Device Verification");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(evtRows), "Events Timeline");

    const filename = `transaction_${d.transactionId.slice(0, 16)}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  function handleExportPdf() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const primary = d.isBlocked ? [185, 28, 28] : [21, 128, 61];
    const pageW = doc.internal.pageSize.getWidth();

    // ── Header bar ──
    doc.setFillColor(...primary);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Transaction Detail Report", 14, 12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(d.isBlocked ? "Status: BLOCKED" : "Status: CLEAN", pageW - 14, 12, { align: "right" });

    // ── Transaction ID subline ──
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8);
    doc.text(`ID: ${d.transactionId}`, 14, 24);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - 14, 24, { align: "right" });

    // ── Block reasons (if any) ──
    let curY = 30;
    if (d.isBlocked && d.reasons.length) {
      doc.setFontSize(8);
      doc.setTextColor(...primary);
      doc.setFont("helvetica", "bold");
      doc.text("Block Reasons: " + d.reasons.join("  |  "), 14, curY);
      curY += 7;
    }

    // ── Section: Transaction Information ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text("Transaction Information", 14, curY + 4);
    curY += 8;

    autoTable(doc, {
      startY: curY,
      head: [["Field", "Value"]],
      body: [
        ["Transaction ID", d.transactionId],
        ["Status",         d.isBlocked ? "Blocked" : "Clean"],
        ["Score",          String(d.score)],
        ["Block Reasons",  d.reasons.join(", ") || "—"],
        ["URL",            d.url],
        ["Referrer",       d.referrer],
        ["Time",           d.time],
        ["Time Zone",      d.timezone],
        ["Client",         d.client],
        ["Service",        d.service],
        ["Queried",        d.queried],
        ["Queried Time",   d.queriedTime],
        ["User IP",        d.userIp],
        ["Country",        d.country],
        ["Continent",      d.continent],
        ["Device",         d.device],
        ["OS",             d.os],
        ["Browser",        d.browser],
        ["Network",        d.network],
        ["User Agent",     d.userAgent],
      ],
      headStyles: { fillColor: primary, textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: [248, 248, 252] },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 42 }, 1: { cellWidth: "auto" } },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.2,
    });

    // ── Section: Device Verification ──
    const checks = buildDeviceChecks(d.isBlocked);
    const deviceBody = [];
    Object.entries(checks).forEach(([cat, items]) =>
      items.forEach((item) => deviceBody.push([cat, item.name, item.status === "pass" ? "Pass" : "Fail"]))
    );

    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text("Device Verification", 14, 20);

    autoTable(doc, {
      startY: 25,
      head: [["Category", "Test", "Result"]],
      body: deviceBody,
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 248, 252] },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 52 },
        2: { cellWidth: 24, halign: "center",
          fontStyle: "bold",
        },
      },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === "body") {
          data.cell.styles.textColor = data.cell.raw === "Fail" ? [185, 28, 28] : [21, 128, 61];
        }
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.2,
    });

    // ── Section: Events Timeline ──
    const seqs = groupIntoClickSequences([
      ...buildSequence(0, d.isBlocked, 0),
      ...buildSequence(1, d.isBlocked, 2000),
    ]);
    const evtBody = [];
    seqs.forEach((seq, si) =>
      seq.forEach((evt) =>
        evt.tests.forEach((test) =>
          evtBody.push([`Click ${si + 1}`, evt.name, evt.time, test.name, test.status === "pass" ? "Pass" : "Fail"])
        )
      )
    );

    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text("Events Timeline", 14, 20);

    autoTable(doc, {
      startY: 25,
      head: [["Click", "Event", "Time", "Test", "Result"]],
      body: evtBody,
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [248, 248, 252] },
      columnStyles: {
        0: { cellWidth: 18, halign: "center" },
        4: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === "body") {
          data.cell.styles.textColor = data.cell.raw === "Fail" ? [185, 28, 28] : [21, 128, 61];
        }
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.2,
    });

    // ── Footer on every page ──
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(`Page ${i} of ${pageCount}  |  MCP Shield — Confidential`, pageW / 2, 290, { align: "center" });
    }

    doc.save(`transaction_${d.transactionId.slice(0, 16)}.pdf`);
  }

  const deviceChecks = useMemo(
    () => buildDeviceChecks(d.isBlocked),
    [d.isBlocked],
  );

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    if (!showMenu) return;
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showMenu]);

  useEffect(() => {
    setExpandedEvt(null);
  }, [row]);
  useEffect(() => {
    setActiveTab("info");
    setShowAdvanced(false);
  }, [row]);

  const totalFails = rawEvents.reduce(
    (a, e) => a + e.tests.filter((t) => t.status === "fail").length,
    0,
  );

  const deviceFailCount = Object.values(deviceChecks)
    .flat()
    .filter((c) => c.status === "fail").length;

  const ADVANCED_TABS = [
    {
      key: "device",
      label: "Device",
      dot: "tdd-dot-violet",
      badge: deviceFailCount > 0 ? `${deviceFailCount} failed` : null,
    },
    {
      key: "events",
      label: "Events",
      dot: totalFails > 0 ? "tdd-dot-red" : "tdd-dot-green",
      badge: totalFails > 0 ? `${totalFails} failed` : null,
    },
    ...(hasImage ? [{ key: "image", label: "Image", dot: "tdd-dot-cyan" }] : []),
    ...(hasVideo ? [{ key: "video", label: "Video", dot: "tdd-dot-amber" }] : []),
  ];

  return (
    <>
      <div onClick={onClose} className="tdd-backdrop" />
      <div className="tdd-modal">
        {/* ── Header ── */}
        <div
          className={`tdd-header${d.isBlocked ? " tdd-header-blocked" : ""}`}
        >
          <div className="tdd-header-left">
            <div className="tdd-header-icon">{d.isBlocked ? "🚫" : "✅"}</div>
            <div>
              <div className="tdd-header-title">Transaction Detail</div>
              <div className="tdd-header-txid">{d.transactionId}</div>
            </div>
          </div>
          <div className="tdd-header-actions">
            <span
              className={`tdd-header-status-pill ${d.isBlocked ? "blocked" : "clean"}`}
            >
              {d.isBlocked ? "🚫 BLOCKED" : "✅ CLEAN"}
              <span className="tdd-header-score">Score: {typeof d.score === "number" ? Math.round(d.score) : d.score}</span>
            </span>

            <button type="button" onClick={onClose} className="tdd-close-btn">
              ×
            </button>
          </div>
        </div>

        {/* ── Status banner (always shown) ── */}
        <div
          className={`tdd-block-banner${d.isBlocked ? "" : " tdd-block-banner-clear"}`}
        >
          <span className="tdd-block-banner-icon">
            {d.isBlocked ? "⚠" : "✓"}
          </span>
          <span className="tdd-block-banner-title">
            {d.isBlocked ? "Block Reasons:" : "Transaction Status:"}
          </span>
          <div className="tdd-block-banner-reasons">
            {d.isBlocked ? (
              d.reasons.map((r, i) => (
                <span key={i} className="tdd-block-reason-chip">
                  {r}
                </span>
              ))
            ) : (
              <span className="tdd-clear-reason-chip">MCPS-0000</span>
            )}
          </div>

          {/* ── Advanced button — right side of banner ── */}
          <div className="tdd-banner-advanced">
            {activeTab !== "info" ? (
              <button
                type="button"
                className="tdd-advanced-btn tdd-advanced-btn--back"
                onClick={() => { setActiveTab("info"); setShowAdvanced(true); }}
              >
                ← Back
              </button>
            ) : (
              <button
                type="button"
                className={`tdd-advanced-btn${showAdvanced ? " active" : ""}`}
                onClick={() => setShowAdvanced((v) => !v)}
              >
                Advanced
                <span className="tdd-advanced-btn-arrow">
                  {showAdvanced ? "▴" : "▾"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ── Advanced options bar (below banner, separate row) ── */}
        {showAdvanced && activeTab === "info" && (
          <div className="tdd-advanced-bar">
            
            <div className="tdd-advanced-scroll">
{/* ── View tabs ── */}
            {ADVANCED_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`tdd-adv-opt-btn${t.badge ? " has-issue" : ""}`}
                onClick={() => { setShowAdvanced(false); setActiveTab(t.key); }}
              >
                <span className={`tdd-adv-opt-dot ${t.dot}`} />
                {t.label}
                {t.badge && (
                  <span className="tdd-adv-opt-badge">{t.badge}</span>
                )}
              </button>
            ))}
            {isPartner && (
              <button
                type="button"
                className="tdd-adv-opt-btn tdd-adv-opt-report"
                onClick={() => { setShowAdvanced(false); setShowReport(true); }}
              >
                <span className="tdd-adv-opt-dot tdd-dot-rose" />
                Report
              </button>
            )}

            {/* ── Divider ── */}
            <div className="tdd-adv-bar-divider" />

            {/* ── Action buttons — same style as view tabs ── */}
              <button
                type="button"
                className="tdd-adv-opt-btn"
                onClick={() => { setShowAdvanced(false); onUserIp && onUserIp(d.userIp); }}
              >
                <span className="tdd-adv-opt-dot" />
              IP
              </button>

              {!isPartner && (
                <button
                  type="button"
                  className="tdd-adv-opt-btn"
                  onClick={() => setShowAdvanced(false)}
                >
                  <span className="tdd-adv-opt-dot" />
                Anomaly
                </button>
              )}

              {!isPartner && (
                <button
                  type="button"
                  className={`tdd-adv-opt-btn${showRaw ? " tdd-adv-opt-active" : ""}`}
                  onClick={() => { setShowAdvanced(false); setShowRaw((v) => !v); }}
                >
                  <span className="tdd-adv-opt-dot" />
                Raw{showRaw ? " ✓" : ""}
                </button>
              )}

            </div>

<button
              type="button"
              className="tdd-adv-collapse-btn"
              onClick={() => setShowAdvanced(false)}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Tab Body ── */}
        <div className="tdd-body">
          {/* ── Transaction Information (default view) ── */}
          {activeTab === "info" && (
            <div className="tdd-info-table">
              {[
                [
                  [
                    "URL",
                    <a href="#" className="tdd-url-link">
                      {d.url}
                    </a>,
                  ],
                  ["Country", d.country],
                ],
                [
                  [
                    "Referrer",
                    <a href="#" className="tdd-url-link">
                      {d.referrer}
                    </a>,
                  ],
                  ["Continent", d.continent],
                ],
                [
                  [
                    "Time",
                    <>
                      {d.time}{" "}
                      <span className="tdd-tz-note">({d.timezone})</span>
                    </>,
                  ],
                  ["Time Zone", d.timezone2],
                ],
                [
                  [
                    "Transaction ID",
                    <span className="tdd-mono-sm">{d.transactionId}</span>,
                  ],
                  ["Device", d.device],
                ],
                [
                  [
                    "Client",
                    isAdmin ? (
                      <span
                        className="tdd-color-tag tdd-tag-client-green tdd-clickable-tag"
                        title={`Filter overview by ${d.client}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo(d.client, "client");
                        }}
                      >
                        {d.client}
                        <span className="tdd-tag-link-icon">↗</span>
                      </span>
                    ) : (
                      <span className="tdd-color-tag tdd-tag-client-green">
                        {d.client}
                      </span>
                    ),
                  ],
                  ["OS", d.os],
                ],
                [
                  [
                    "Service",
                    <span
                      className="tdd-color-tag tdd-tag-service-cyan tdd-clickable-tag"
                      title={`Filter overview by ${d.service}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo(d.service, "service");
                      }}
                    >
                      {d.service}
                      <span className="tdd-tag-link-icon">↗</span>
                    </span>,
                  ],
                  ["Browser", d.browser],
                ],
                [
                  [
                    "Queried",
                    <>
                      <span className="tdd-queried-yes">{d.queried}</span>
                      <span className="tdd-queried-time">{d.queriedTime}</span>
                    </>,
                  ],
                  ["Network", d.network],
                ],
                [
                  ["User IP", <span className="tdd-mono-md">{d.userIp}</span>],
                  [
                    "Status",
                    <>
                      <span
                        className={`tdd-status-pill ${d.isBlocked ? "tdd-status-block" : "tdd-status-clean"}`}
                      >
                        {d.isBlocked ? "Block" : "Clear"}
                      </span>
                      <span className="tdd-score-label">
                        Score: <strong>{typeof d.score === "number" ? Math.round(d.score) : d.score}</strong>
                      </span>
                    </>,
                  ],
                ],
              ].map(([left, right], i) => (
                <div key={i} className="tdd-info-row">
                  <div className="tdd-info-label">{left[0]}</div>
                  <div className="tdd-info-value">{left[1]}</div>
                  <div className="tdd-info-label">{right[0]}</div>
                  <div className="tdd-info-value-last">{right[1]}</div>
                </div>
              ))}
              <div className="tdd-info-row-full">
                <div className="tdd-info-label">User Agent</div>
                <div className="tdd-info-value-ua">{d.userAgent}</div>
              </div>
            </div>
          )}

          {/* ── Advanced Panel (Device / Events / Image / Video) ── */}
          {activeTab !== "info" && (
            <div className="tdd-adv-panel-wrap">
              {/* Panel header with back button */}
              <div className="tdd-adv-panel-top">
                <button
                  type="button"
                  className="tdd-adv-back-btn"
                  onClick={() => { setActiveTab("info"); setShowAdvanced(true); }}
                >
                  ← Back
                </button>
                <span className="tdd-adv-panel-title">
                  {ADVANCED_TABS.find((t) => t.key === activeTab)?.label}
                </span>
                {ADVANCED_TABS.find((t) => t.key === activeTab)?.badge && (
                  <span className="tdd-adv-panel-badge">
                    {ADVANCED_TABS.find((t) => t.key === activeTab)?.badge}
                  </span>
                )}
              </div>

              {/* ── Device Verification ── */}
              {activeTab === "device" && (
                <>
                  <div className="tdd-tabs-wrap">
                    {Object.keys(deviceChecks).map((tab) => {
                      const tabFails = deviceChecks[tab].some(
                        (c) => c.status === "fail",
                      );
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setDevTab(tab)}
                          className={`tdd-tab-btn${devTab === tab ? " active" : ""}${tabFails ? " has-fail" : ""}`}
                        >
                          {tab}
                          {tabFails && <span className="tdd-tab-fail-dot" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="tdd-checks-grid">
                    {deviceChecks[devTab].map((check) => (
                      <div
                        key={check.name}
                        className={`tdd-check-item${check.status === "fail" ? " fail" : ""}`}
                      >
                        <span className="tdd-check-label">{check.name}</span>
                        <TestBadge status={check.status} />
                      </div>
                    ))}
                  </div>
                </>
              )}

          {/* ── Events Timeline ── */}
          {activeTab === "events" && (
            <div className="tdd-events-list">
              {clickSequences.map((seq, seqIdx) => {
                const seqFailed = seqHasFail(seq);
                const globalBase = clickSequences
                  .slice(0, seqIdx)
                  .reduce((a, s) => a + s.length, 0);
                const failCount = seq.reduce(
                  (a, e) =>
                    a + e.tests.filter((t) => t.status === "fail").length,
                  0,
                );
                const isSeqOpen = expandedSeq === seqIdx;

                return (
                  <div
                    key={seqIdx}
                    className={`tdd-click-group${seqFailed ? " has-fail" : ""}${isSeqOpen ? " expanded" : ""}`}
                  >
                    {/* ── Clickable group header ── */}
                    <div
                      className={`tdd-click-group-hd${seqFailed ? " fail" : ""}${isSeqOpen ? " open" : ""}`}
                      onClick={() => setExpandedSeq(isSeqOpen ? null : seqIdx)}
                    >
                      <div className="tdd-click-group-left">
                        <span
                          className={`tdd-click-group-pill${seqFailed ? " fail" : ""}`}
                        >
                          {seqFailed ? "🚫" : "✅"} Click {seqIdx + 1}
                        </span>
                        {seqFailed ? (
                          <span className="tdd-click-fail-badge">
                            ⚠ {failCount} test{failCount !== 1 ? "s" : ""}{" "}
                            failed
                          </span>
                        ) : (
                          <span className="tdd-click-pass-badge">
                            All clear
                          </span>
                        )}
                      </div>
                      <div className="tdd-click-group-right">
                        <span className="tdd-click-group-time">
                          {seq[0]?.time} → {seq[seq.length - 1]?.time}
                        </span>
                        <span
                          className={`tdd-click-group-arrow${isSeqOpen ? " open" : ""}`}
                        >
                          ▾
                        </span>
                      </div>
                    </div>

                    {/* ── Events — only shown when group is open ── */}
                    {isSeqOpen &&
                      seq.map((evt, evtIdx) => {
                        const globalIdx = globalBase + evtIdx;
                        const isOpen = expandedEvt === globalIdx;
                        const hasFail = eventHasFail(evt);
                        const evtFailCount = evt.tests.filter(
                          (t) => t.status === "fail",
                        ).length;

                        return (
                          <div
                            key={evtIdx}
                            className={`tdd-event-card${isOpen ? " open" : ""}${hasFail ? " evt-has-fail" : ""}`}
                          >
                            <div
                              onClick={() =>
                                setExpandedEvt(isOpen ? null : globalIdx)
                              }
                              className={`tdd-event-header${isOpen ? " open" : ""}${hasFail ? " evt-fail-hd" : ""}`}
                            >
                              <div className="tdd-event-left">
                                <div
                                  className={`tdd-event-icon${hasFail ? " fail" : ""}${isOpen ? " open" : ""}`}
                                >
                                  {evtIdx + 1}
                                </div>
                                <div>
                                  <div className="tdd-event-name-wrap">
                                    <span
                                      className={`tdd-event-name${hasFail ? " fail" : ""}`}
                                    >
                                      {evt.name}
                                    </span>
                                    {hasFail ? (
                                      <span className="tdd-evt-fail-pill">
                                        {evtFailCount} failed
                                      </span>
                                    ) : (
                                      <span className="tdd-evt-pass-pill">
                                        ✓ passed
                                      </span>
                                    )}
                                  </div>
                                  <div className="tdd-event-meta">
                                    Event Information
                                  </div>
                                </div>
                              </div>
                              <div className="tdd-event-right">
                                {hasFail && (
                                  <span className="tdd-evt-fail-dot" />
                                )}
                                <span className="tdd-event-time">
                                  {evt.time}
                                </span>
                                <span
                                  className={`tdd-event-arrow${isOpen ? " open" : ""}`}
                                >
                                  ▾
                                </span>
                              </div>
                            </div>

                            {isOpen && (
                              <div className="tdd-tests-grid">
                                {evt.tests.map((test) => (
                                  <div
                                    key={test.name}
                                    className={`tdd-test-item${test.status === "fail" ? " fail" : ""}`}
                                  >
                                    <div className="tdd-test-left">
                                      <span className="tdd-test-label">
                                        {test.name}
                                      </span>
                                    </div>
                                    <TestBadge status={test.status} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Image ── */}
          {activeTab === "image" && (
            <div className="tdd-capture-wrap">
              <div className="tdd-capture-hint">
                <span className="tdd-capture-dot" />
                Page screenshot captured at transaction time
              </div>
              <div className="tdd-mobile-frame">
                <div className="tdd-mobile-notch" />
                <div className="tdd-mobile-screen">
                  <span className="tdd-mobile-lang">AR</span>
                  <div className="tdd-mock-page">
                    <div className="tdd-mock-icons-row">
                      <span className="tdd-mock-ico">🔒</span>
                      <span className="tdd-mock-ico tdd-mock-ico--cloud">
                        ☁
                      </span>
                      <span className="tdd-mock-ico">🛡️</span>
                    </div>
                    <div className="tdd-mock-icons-row tdd-mock-icons-row--sm">
                      <span className="tdd-mock-ico">🔑</span>
                      <span className="tdd-mock-ico">📋</span>
                    </div>
                    <div className="tdd-mock-title">قريباً ستكون جاهزاً!</div>
                    <div className="tdd-mock-sub">أدخل رمز الوصول واستمتع!</div>
                    <div className="tdd-mock-pin-label">:رمز PIN</div>
                    <div className="tdd-mock-input">
                      <span className="tdd-mock-placeholder">الرمز</span>
                    </div>
                    <div className="tdd-mock-btn">تأكيد »</div>
                  </div>
                </div>
                <div className="tdd-mobile-bar" />
              </div>
              <div className="tdd-capture-meta">
                {[
                  ["Captured", d.time],
                  ["Device", d.device],
                  ["Browser", d.browser],
                ].map(([label, val]) => (
                  <div key={label} className="tdd-capture-meta-row">
                    <span className="tdd-capture-meta-label">{label}</span>
                    <span className="tdd-capture-meta-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Video ── */}
          {activeTab === "video" && (
            <div className="tdd-video-wrap">
              {/* Left — mobile preview + replay */}
              <div className="tdd-video-preview">
                <div className="tdd-mobile-frame">
                  <div className="tdd-mobile-notch" />
                  <div className="tdd-mobile-screen tdd-mobile-screen--video">
                    <span className="tdd-mobile-lang">AR</span>
                    <div className="tdd-mock-page">
                      <div className="tdd-mock-icons-row">
                        <span className="tdd-mock-ico">🔒</span>
                        <span className="tdd-mock-ico tdd-mock-ico--cloud">
                          ☁
                        </span>
                        <span className="tdd-mock-ico">🛡️</span>
                      </div>
                      <div className="tdd-mock-icons-row tdd-mock-icons-row--sm">
                        <span className="tdd-mock-ico">🔑</span>
                        <span className="tdd-mock-ico">📋</span>
                      </div>
                      <div className="tdd-mock-title">قريباً ستكون جاهزاً!</div>
                      <div className="tdd-mock-sub">
                        أدخل رمز الوصول واستمتع!
                      </div>
                      <div className="tdd-mock-pin-label">:رمز PIN</div>
                      <div className="tdd-mock-input">
                        <span className="tdd-mock-play-ring">▶</span>
                        <span className="tdd-mock-placeholder">الرمز</span>
                      </div>
                      <div className="tdd-mock-btn">تأكيد »</div>
                    </div>
                    <div className="tdd-replay-overlay">
                      <div className="tdd-replay-btn">
                        <span className="tdd-replay-icon">▶</span>
                        <span className="tdd-replay-label">REPLAY</span>
                      </div>
                    </div>
                  </div>
                  <div className="tdd-mobile-bar" />
                </div>
              </div>

              {/* Right — activity feed */}
              <div className="tdd-activity-panel">
                <div className="tdd-activity-hd">
                  <div className="tdd-activity-title">Activity</div>
                  <div className="tdd-activity-sub">
                    What people are doing right now
                  </div>
                </div>
                <div className="tdd-activity-list">
                  {[
                    {
                      key: "lifecycle",
                      groupLabel: "Page Lifecycle",
                      groupIcon: "🌐",
                      groupColor: "tdd-grp--blue",
                      timeRange: "10:04:31 – 10:04:35 AM",
                      items: [
                        {
                          label: "SHIELD-KIT",
                          desc: "Shield Loaded Successfully",
                          tag: null,
                          tagType: null,
                          time: "10:04:31 AM",
                        },
                        {
                          label: "SHIELD-KIT",
                          desc: "Shield Loaded Successfully",
                          tag: null,
                          tagType: null,
                          time: "10:04:33 AM",
                        },
                        {
                          label: "INTERACTIVE",
                          desc: "State Change To Interactive",
                          tag: null,
                          tagType: null,
                          time: "10:04:35 AM",
                        },
                        {
                          label: "LOADED",
                          desc: "DOM Content Loaded",
                          tag: null,
                          tagType: null,
                          time: "10:04:35 AM",
                        },
                        {
                          label: "COMPLETED",
                          desc: "State Change To Completed",
                          tag: null,
                          tagType: null,
                          time: "10:04:35 AM",
                        },
                        {
                          label: "VISIBLE",
                          desc: "Document Fully Loaded & Visible To User",
                          tag: null,
                          tagType: null,
                          time: "10:04:35 AM",
                        },
                      ],
                    },
                    {
                      key: "tag",
                      groupLabel: "Tag Events",
                      groupIcon: "🏷",
                      groupColor: "tdd-grp--green",
                      timeRange: "10:04:32 – 10:04:36 AM",
                      items: [
                        {
                          label: "STAN",
                          desc: "performed on",
                          tag: "null",
                          tagType: "null",
                          time: "10:04:32 AM",
                        },
                        {
                          label: "BKC",
                          desc: "performed on",
                          tag: "null",
                          tagType: "null",
                          time: "10:04:32 AM",
                        },
                        {
                          label: "UADATA",
                          desc: "performed on",
                          tag: "null",
                          tagType: "null",
                          time: "10:04:32 AM",
                        },
                        {
                          label: "STAN",
                          desc: "performed on",
                          tag: "null",
                          tagType: "null",
                          time: "10:04:35 AM",
                        },
                        {
                          label: "UADATA",
                          desc: "performed on",
                          tag: "null",
                          tagType: "null",
                          time: "10:04:35 AM",
                        },
                        {
                          label: "BKC",
                          desc: "performed on",
                          tag: "null",
                          tagType: "null",
                          time: "10:04:35 AM",
                        },
                        {
                          label: "SHIELDOKAYSUCCESS",
                          desc: "performed on",
                          tag: "null",
                          tagType: "null",
                          time: "10:04:36 AM",
                        },
                      ],
                    },
                    {
                      key: "interaction",
                      groupLabel: "User Interaction",
                      groupIcon: "👆",
                      groupColor: "tdd-grp--violet",
                      timeRange: "10:04:45 – 10:04:48 AM",
                      items: [
                        {
                          label: "INPUT",
                          desc: "performed on",
                          tag: "INPUT",
                          tagType: "input",
                          time: "10:04:45 AM",
                        },
                        {
                          label: "INPUT",
                          desc: "performed on",
                          tag: "INPUT",
                          tagType: "input",
                          time: "10:04:46 AM",
                        },
                        {
                          label: "INPUT",
                          desc: "performed on",
                          tag: "INPUT",
                          tagType: "input",
                          time: "10:04:46 AM",
                        },
                        {
                          label: "POINTERDOWN",
                          desc: "performed on",
                          tag: "BUTTON",
                          tagType: "button",
                          time: "10:04:47 AM",
                        },
                        {
                          label: "TOUCHSTART",
                          desc: "performed on",
                          tag: "BUTTON",
                          tagType: "button",
                          time: "10:04:47 AM",
                        },
                        {
                          label: "POINTERUP",
                          desc: "performed on",
                          tag: "BUTTON",
                          tagType: "button",
                          time: "10:04:47 AM",
                        },
                        {
                          label: "TOUCHEND",
                          desc: "performed on",
                          tag: "BUTTON",
                          tagType: "button",
                          time: "10:04:47 AM",
                        },
                        {
                          label: "MOUSEDOWN",
                          desc: "performed on",
                          tag: "BUTTON",
                          tagType: "button",
                          time: "10:04:47 AM",
                        },
                        {
                          label: "MOUSEUP",
                          desc: "performed on",
                          tag: "BUTTON",
                          tagType: "button",
                          time: "10:04:47 AM",
                        },
                        {
                          label: "CLICK",
                          desc: "performed on",
                          tag: "BUTTON",
                          tagType: "button",
                          time: "10:04:48 AM",
                        },
                      ],
                    },
                  ].map((group) => (
                    <ActivityGroup key={group.key} group={group} />
                  ))}
                </div>
              </div>
            </div>
          )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="tdd-footer">
          <div className="tdd-export-group">
            <button type="button" className="tdd-btn-export tdd-btn-export--xls" onClick={handleExport}>
              ↓ XLS
            </button>
            <div className="tdd-export-divider" />
            <button type="button" className="tdd-btn-export tdd-btn-export--pdf" onClick={handleExportPdf}>
              ↓ PDF
            </button>
          </div>
          <button type="button" onClick={onClose} className="tdd-btn-cancel">
            Close
          </button>
        </div>
      </div>

      {showRaw &&
        createPortal(
          <RawDataModal
            d={d}
            rawEvents={rawEvents}
            onClose={() => setShowRaw(false)}
            setPage={setPage}
            onParentClose={onClose}
            isAdmin={isAdmin}
            navigateTo={navigateTo}
          />,
          document.body,
        )}

      {showReport && (
        <ReportIssueModal
          prefillTransactionId={d.transactionId}
          partnerName="Partner"
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}
