import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Card, SectionTitle } from "../components/ui";
import { transactionRows } from "../data/tables";
import { FRAUD_DESCRIPTIONS, getFraudReasonColor, getFraudReasonTitle } from "./FraudCodes";
import { makeTransactionDetail } from "../models/transactions";
import {
  PlusIcon, SendIcon, MessageIcon, SearchIcon,
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

const BLOCK_REASON_META = {
  "MCPS-1200": {
    title: "Desktop Traffic",
    detail:
      "The transaction matched a desktop or unsupported platform pattern instead of an expected mobile flow.",
  },
  "MCPS-1300": {
    title: "Shield Bypassing",
    detail:
      "Shield JS snippet was not rendered on the page, so Shield could not collect the required fraud-prevention signals.",
  },
  "AMCPS-1310": {
    title: "Bypassed",
    detail:
      "An additional bypass rule was triggered together with the parent Shield bypassing code.",
  },
  "MCPS-1400": {
    title: "Duplicate Shield Token",
    detail:
      "The same Shield token or unique transaction context appears to have been reused.",
  },
  "MCPS-2000": {
    title: "Excessive IP Access Attempts",
    detail:
      "Too many requests were observed from the same IP address in a short time window.",
  },
};

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

function getRiskLabel(score) {
  if (score == null) return "Unknown";
  if (score >= 7.9) return "Clean";
  if (score >= 3.9) return "Suspect";
  return "High Risk";
}

function normalizeLookupId(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const match = text.match(/(?:uniqid|uniqueid|mcpuniqid|mcp_uniqid)=([^&\s]+)/i);
  return decodeURIComponent(match?.[1] || text).trim().toLowerCase();
}

const IP_LOOKBACK_MS = 60 * 60 * 1000;

function parseTransactionTime(time) {
  if (!time) return null;
  const year = new Date().getFullYear();
  const normalized = time.replace(/^([A-Za-z]{3}\s+\d{1,2}),\s+/, `$1, ${year} `);
  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

function RelatedIpTransactions({ ip, currentId }) {
  const currentRow = transactionRows.find((t) => t.id === currentId);
  const currentTime = parseTransactionTime(currentRow?.time);
  const rows = transactionRows
    .filter((t) => {
      if (t.userIp !== ip) return false;
      const rowTime = parseTransactionTime(t.time);
      if (currentTime == null || rowTime == null) return t.id === currentId;
      return rowTime <= currentTime && currentTime - rowTime <= IP_LOOKBACK_MS;
    })
    .sort((a, b) => (parseTransactionTime(b.time) ?? 0) - (parseTransactionTime(a.time) ?? 0));

  return (
    <span className="spt-ip-hover">
      <strong className="spt-ip-hover-value">{ip}</strong>
      <span className="spt-ip-popover" role="tooltip">
        <span className="spt-ip-popover-title">
          Last hour only for this User IP
          <em>{rows.length} uniqid{rows.length === 1 ? "" : "s"}</em>
        </span>
        <span className="spt-ip-popover-note">
          Related to {ip}
        </span>
        <span className="spt-ip-popover-list">
          {rows.map((tx) => (
            <span
              key={tx.id}
              className={`spt-ip-popover-row spt-ip-popover-row--compact${tx.id === currentId ? " current" : ""}`}
            >
              <span className="spt-ip-popover-id">{tx.id}</span>
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}

function WhyBlockedLookup() {
  const [reasonSearch, setReasonSearch] = useState("");

  const reasonQuery = reasonSearch.trim().toLowerCase();
  const filterReasons = (rows) => !reasonQuery ? rows : rows.filter((item) => (
    item.code.toLowerCase().includes(reasonQuery) ||
    item.title.toLowerCase().includes(reasonQuery) ||
    item.description.toLowerCase().includes(reasonQuery)
  ));
  const shieldReasons = filterReasons(FRAUD_DESCRIPTIONS.shield);
  const adhocReasons = filterReasons(FRAUD_DESCRIPTIONS.adhoc);

  return (
    <div className="spt-why-wrap">
      <div className="spt-why-hero">
        <div>
          <div className="spt-why-eyebrow">Reason Library</div>
          <h2 className="spt-why-title">Shield Reason Descriptions</h2>
          <p className="spt-why-sub">
            Review the complete list of Shield block reasons and their exact descriptions.
          </p>
        </div>
      </div>

      <div className="spt-reason-library">
        <div className="spt-reason-library-head">
          <div>
            <div className="spt-why-section-title">Block Reasons and Descriptions</div>
            <p>
              Complete Shield reason reference for partners, grouped by Shield Codes and Adhoc Rules.
            </p>
          </div>
          <div className="spt-reason-search">
            <SearchIcon size={14} />
            <input
              value={reasonSearch}
              onChange={(e) => setReasonSearch(e.target.value)}
              placeholder="Search code, title, or description"
            />
          </div>
        </div>

        <ReasonDescriptionTable title="Shield Codes" rows={shieldReasons} />
        <ReasonDescriptionTable title="Adhoc Rules" rows={adhocReasons} />

        {!shieldReasons.length && !adhocReasons.length && (
          <div className="spt-empty">No reason descriptions match your search.</div>
        )}
      </div>
    </div>
  );
}

// ── StatusPill ────────────────────────────────────────────────────────────────
function ReasonDescriptionTable({ title, rows }) {
  if (!rows.length) return null;

  return (
    <div className="spt-reason-section">
      <div className="spt-reason-section-title">{title}</div>
      <div className="spt-reason-table-wrap">
        <table className="spt-reason-table">
          <thead>
            <tr>
              <th>Shield Code</th>
              <th>Fraud Title</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.code}>
                <td>
                  <span className="spt-reason-code">{item.code}</span>
                </td>
                <td className="spt-reason-title-cell">{item.title}</td>
                <td className="spt-reason-desc-cell">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span className="spt-status-pill">
      {m.label}
    </span>
  );
}

// ── ReportIssueModal — exported for TransactionsModal ─────────────────────────
// Shield AI chatbot
const CHATBOT_STORAGE_KEY = "shield-ai-chat-history";

const CHATBOT_WELCOME_MESSAGE = {
  id: "bot-welcome",
  sender: "bot",
  title: "Shield AI Support",
  text:
    "Hi, I can help partners understand block decisions, troubleshoot integration issues, and prepare cleaner support tickets.",
  next: "Share a question or paste a transaction ID to begin.",
};

function getStoredChatMessages() {
  if (typeof window === "undefined") return [CHATBOT_WELCOME_MESSAGE];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CHATBOT_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) && parsed.length ? parsed : [CHATBOT_WELCOME_MESSAGE];
  } catch {
    return [CHATBOT_WELCOME_MESSAGE];
  }
}

const CHATBOT_QUICK_PROMPTS = [
  "Why was my transaction blocked?",
  "How do I report overblocking?",
  "Shield JS is not loading",
  "What details should I share?",
];

const CHATBOT_INTENTS = [
  {
    match: ["blocked", "block", "why", "transaction", "uniqid", "uniqueid"],
    title: "Blocked transaction help",
    reply:
      "Please share the transaction ID or MCP uniqid. I can check the local Shield records and explain the decision, reason codes, network, APK, IP, and next action.",
    action: "If the test was made by a real user on a real device, log a Blocked During Testing ticket with tester name, device, landing page URL, and whether remote-control software was used.",
  },
  {
    match: ["overblocking", "false positive", "legitimate", "valid users"],
    title: "Overblocking investigation",
    reply:
      "For overblocking, include the affected network, APK/service, country, time range, sample uniqids, and expected conversion flow. I will suggest a high-priority ticket if real users are impacted.",
    action: "Use Log New Issue and choose OverBlocking so support can review the rule hit rate and affected traffic segment.",
  },
  {
    match: ["integration", "javascript", "js", "sdk", "not firing", "not loading", "ios", "safari"],
    title: "Integration troubleshooting",
    reply:
      "Check that Shield JS is loaded before the protected action, the partner key is correct, browser blockers are not preventing the script, and the token is sent with the final request.",
    action: "If it still fails, open an Integration Issue ticket with browser/device, page URL, console errors, and a sample request payload.",
  },
  {
    match: ["api", "500", "error", "response", "timeout", "endpoint"],
    title: "API response issue",
    reply:
      "For API errors, capture the endpoint, timestamp, response code, request ID, partner ID, and whether the failure is intermittent or constant.",
    action: "Choose Error In Response and mark Critical if production traffic is blocked.",
  },
  {
    match: ["data", "report", "mismatch", "conversion", "count", "stats"],
    title: "Data discrepancy",
    reply:
      "Data mismatches are usually investigated by comparing timezone, reporting window, service/APK filters, conversion status, and duplicate transaction handling.",
    action: "Open a Data Discrepancy ticket with both Shield numbers and your internal numbers for the same exact time window.",
  },
  {
    match: ["priority", "sla", "response", "urgent", "critical"],
    title: "Priority guidance",
    reply:
      "Use Critical for production outages or valid traffic being blocked at scale, High for active integration blockers, Medium for reporting mismatches, and Low for questions or cleanup.",
    action: "The support team target shown in this portal is within 2 business hours.",
  },
];

function extractLookupCandidate(text) {
  const directParam = String(text || "").match(/(?:uniqid|uniqueid|mcpuniqid|mcp_uniqid)=([^&\s]+)/i);
  if (directParam) return directParam[1];
  const token = String(text || "")
    .split(/\s+/)
    .map((part) => part.replace(/[.,;:!?()[\]{}"']/g, ""))
    .find((part) => /^(?:UUID-|TKT-|ssk|[a-z0-9]{18,})/i.test(part));
  return token || "";
}

function buildTransactionReply(message) {
  const candidate = extractLookupCandidate(message);
  const normalized = normalizeLookupId(candidate);
  if (!normalized) return null;

  const row = transactionRows.find((t) => normalizeLookupId(t.id) === normalized);
  if (!row) {
    return {
      title: "I could not find that ID",
      text:
        "I could not find that transaction in the current Shield sample data. Please check the uniqid and share the service/APK, network, timestamp, and country so support can trace it.",
      next: "If this is from live partner traffic, log a ticket and include the full raw uniqid.",
    };
  }

  const detail = makeTransactionDetail(row);
  const isBlocked = detail.status === "Block";
  const hasShieldBypassing = isBlocked && detail.reasons?.includes("MCPS-1300");
  const visibleReasons = hasShieldBypassing ? ["MCPS-1300"] : detail.reasons;
  const reasons = visibleReasons?.length ? visibleReasons.join(", ") : "no block reason codes";
  const primaryReason = visibleReasons?.[0];
  const primaryReasonTitle = getFraudReasonTitle(primaryReason) || BLOCK_REASON_META[primaryReason]?.title || primaryReason || "not available";
  return {
    type: "transaction",
    decision: detail.status,
    score: detail.score ?? "-",
    network: detail.network || "-",
    apk: detail.apk || "-",
    userIp: detail.userIp || "-",
    relatedIps: visibleReasons.includes("MCPS-8000") ? detail.relatedIps : [],
    userAgent: detail.userAgent || "-",
    device: detail.device || "-",
    reasons,
    reasonCodes: visibleReasons || [],
    title: hasShieldBypassing
      ? "Blocked by Shield Bypassing"
      : isBlocked ? "This transaction was blocked" : "This transaction was not blocked",
    text: `UNIQID: ${row.id}`,
    next: hasShieldBypassing
      ? "Shield Bypassing means the Shield JS snippet was not rendered on the page. Ask the partner to confirm the snippet is present before the protected action and share the page URL, browser/device details, and implementation notes if they believe this was a valid test."
      : isBlocked
      ? `The first matched reason is ${primaryReasonTitle}. Ask for review if the device was a verified human test or valid production user.`
      : "No block action is present in the current records. If the partner still saw a failure, compare the API response and landing-page event logs.",
  };
}

function createChatbotReply(message, partnerTickets) {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();
  const transactionReply = buildTransactionReply(trimmed);

  if (transactionReply) return transactionReply;

  if (lower === "why was my transaction blocked?") {
    return {
      title: "Share the transaction ID",
      text: "Please share the transaction ID or MCP uniqid.",
      next: "Once you send it, I will check the Shield decision, score, reason codes, network, APK, and recommended next action.",
    };
  }

  if (lower.includes("ticket") || lower.includes("status")) {
    const openTickets = partnerTickets.filter((t) => t.status !== "resolved");
    const latest = [...partnerTickets].sort((a, b) => b.created - a.created)[0];
    return {
      title: "Ticket status summary",
      text: `You currently have ${openTickets.length} open ticket${openTickets.length === 1 ? "" : "s"} in this portal.${latest ? ` Latest: ${latest.id} - ${latest.subject} (${STATUS_META[latest.status]?.label || latest.status}).` : ""}`,
      next: "Use the Support Tickets tab to filter by pending, in progress, or resolved tickets.",
    };
  }

  const intent = CHATBOT_INTENTS.find((item) => item.match.some((word) => lower.includes(word)));
  if (intent) {
    return {
      title: intent.title,
      text: intent.reply,
      next: intent.action,
    };
  }

  return {
    title: "I can help with Shield support",
    text:
      "Ask me about blocked transactions, overblocking, integration issues, API errors, data mismatches, ticket status, or what evidence to share with support.",
    next: "For the fastest answer, include a transaction ID, MCP uniqid, network, APK/service, and timestamp.",
  };
}

function ShieldAIChatbot({ tickets, onNew }) {
  const [messages, setMessages] = useState(getStoredChatMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  React.useEffect(() => {
    window.localStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  function clearChat() {
    window.localStorage.removeItem(CHATBOT_STORAGE_KEY);
    setMessages([CHATBOT_WELCOME_MESSAGE]);
    setInput("");
    setIsTyping(false);
  }

  function sendMessage(text = input) {
    const clean = text.trim();
    if (!clean || isTyping) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: clean,
      },
    ]);
    setInput("");
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          ...createChatbotReply(clean, tickets),
        },
      ]);
      setIsTyping(false);
    }, 420);
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage();
  }

  return (
    <div className="spt-ai-wrap">
      <div className="spt-ai-panel">
        <div className="spt-ai-header">
          <div className="spt-ai-avatar">AI</div>
          <div>
            <h2 className="spt-ai-title">Shield AI Chat Bot</h2>
            <p className="spt-ai-sub">Partner support assistant for Shield queries</p>
          </div>
          <button type="button" className="spt-ai-clear-btn" onClick={clearChat}>
            Clear Chat
          </button>
        </div>

        <div className="spt-ai-messages" aria-live="polite">
          {messages.map((msg) => (
            <div key={msg.id} className={`spt-ai-msg spt-ai-msg--${msg.sender}`}>
              {msg.sender === "bot" && msg.title && <div className="spt-ai-msg-title">{msg.title}</div>}
              {msg.sender === "bot" && msg.type === "transaction" ? (
                <div className="spt-ai-result-card">
                  <div className="spt-ai-result-summary">{msg.text}</div>
                  <div className="spt-ai-result-grid">
                    <div>
                      <span>Decision</span>
                      <strong>{msg.decision}</strong>
                    </div>
                    <div>
                      <span>Score</span>
                      <strong>{msg.score}</strong>
                    </div>
                    <div>
                      <span>Network</span>
                      <strong>{msg.network}</strong>
                    </div>
                    <div>
                      <span>APK</span>
                      <strong>{msg.apk}</strong>
                    </div>
                    <div>
                      <span>User IP</span>
                      <strong>{msg.userIp}</strong>
                    </div>
                    <div>
                      <span>Device Name</span>
                      <strong>{msg.device}</strong>
                    </div>
                  </div>
                  <div className="spt-ai-result-wide">
                    <span>User Agent</span>
                    <strong>{msg.userAgent}</strong>
                  </div>
                  <div className="spt-ai-result-reason">
                    <span>Block Reason</span>
                    {msg.reasonCodes?.length ? (
                      <div className="spt-ai-reason-chip-list">
                        {msg.reasonCodes.map((code) => {
                          const title = getFraudReasonTitle(code);
                          return (
                            <span
                              key={code}
                              className="spt-ai-reason-chip"
                              style={{ "--reason-color": getFraudReasonColor(code) }}
                              title={title ? `${code} - ${title}` : code}
                            >
                              <span>{code}</span>
                              {title && <strong>{title}</strong>}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <strong>{msg.reasons}</strong>
                    )}
                  </div>
                  {msg.relatedIps?.length > 0 && (
                    <div className="spt-ai-related-ips">
                      <div className="spt-ai-related-ips-head">
                        <span>Related IPs</span>
                        <strong>{msg.relatedIps.length} IPs detected</strong>
                      </div>
                      <div className="spt-ai-related-ips-list">
                        {msg.relatedIps.map((ip) => (
                          <span key={ip}>{ip}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="spt-ai-msg-text">{msg.text}</div>
              )}
              {msg.sender === "bot" && msg.next && <div className="spt-ai-msg-next">{msg.next}</div>}
            </div>
          ))}
          {isTyping && (
            <div className="spt-ai-msg spt-ai-msg--bot spt-ai-msg--typing">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        <div className="spt-ai-quick-row">
          {CHATBOT_QUICK_PROMPTS.map((prompt) => (
            <button key={prompt} type="button" onClick={() => sendMessage(prompt)}>
              {prompt}
            </button>
          ))}
        </div>

        <form className="spt-ai-compose" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Shield AI about blocked traffic, integration, API errors, or ticket status"
          />
          <button type="submit" aria-label="Send message" disabled={!input.trim() || isTyping}>
            <SendIcon size={15} />
          </button>
        </form>
      </div>

      <aside className="spt-ai-side">
        <div className="spt-ai-side-title">Need a human review?</div>
        <p>
          If Shield AI identifies a production impact or missing investigation data, create a ticket with the prepared details.
        </p>
        <button type="button" className="spt-submit-btn spt-ai-ticket-btn" onClick={onNew}>
          <PlusIcon size={13} />
          Log New Issue
        </button>
      </aside>
    </div>
  );
}

// ReportIssueModal - exported for TransactionsModal
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
          >
            <div className="spt-sdd-menu-title">Set Status</div>
            {STATUS_FLOW.map((s) => {
              const m = STATUS_META[s];
              return (
                <button key={s} type="button"
                  className={`spt-sdd-item${s === current ? " spt-sdd-item--active" : ""}`}
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
            <span className="spt-client-alert-open">
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
                      <span className="spt-priority-pill">
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
  const [tab, setTab] = useState("tickets");

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
      <div className="spt-main-tabs">
        <button
          type="button"
          className={`spt-main-tab${tab === "tickets" ? " spt-main-tab--active" : ""}`}
          onClick={() => setTab("tickets")}
        >
          Support Tickets
        </button>
        <button
          type="button"
          className={`spt-main-tab${tab === "why-blocked" ? " spt-main-tab--active" : ""}`}
          onClick={() => setTab("why-blocked")}
        >
          Shield Reason Descriptions
        </button>
        <button
          type="button"
          className={`spt-main-tab${tab === "shield-ai" ? " spt-main-tab--active" : ""}`}
          onClick={() => setTab("shield-ai")}
        >
          Shield AI
        </button>
      </div>

      {tab === "why-blocked" ? (
        <WhyBlockedLookup />
      ) : tab === "shield-ai" ? (
        <ShieldAIChatbot tickets={tickets} onNew={onNew} />
      ) : (
      <>
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
                <span className="spt-priority-pill">
                  <span className="spt-priority-dot" />
                  {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                </span>
                <StatusPill status={t.status} />
              </div>
            </div>
          ))
        }
      </div>
      </>
      )}
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
