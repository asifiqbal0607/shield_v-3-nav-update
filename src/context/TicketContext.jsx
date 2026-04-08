import { createContext, useContext, useState, useCallback } from "react";

// ── Status metadata ───────────────────────────────────────────────────────────
export const STATUS_FLOW = ["pending", "review", "processing", "feedback", "resolved"];
export const STATUS_META = {
  pending:    { label: "Pending",    color: "#b45309", bg: "#fef3c7" },
  review:     { label: "Review",     color: "#1d4ed8", bg: "#dbeafe" },
  processing: { label: "Processing", color: "#7c3aed", bg: "#ede9fe" },
  feedback:   { label: "Feedback",   color: "#0e7490", bg: "#cffafe" },
  resolved:   { label: "Resolved",   color: "#16a34a", bg: "#dcfce7" },
};

export const ISSUE_TYPES = [
  { key: "blocked-testing", label: "Blocked During Testing", icon: "🚫" },
  { key: "overblocking",    label: "OverBlocking",           icon: "⚠️" },
  { key: "integration",     label: "Integration Issue",      icon: "🔗" },
  { key: "data",            label: "Data Discrepancy",       icon: "📊" },
  { key: "error-response",  label: "Error In Response",      icon: "❌" },
];

// ── Seed data with full status histories ──────────────────────────────────────
const now = Date.now();
const mins = (n) => now - n * 60 * 1000;
const hrs  = (n) => now - n * 60 * 60 * 1000;
const days = (n) => now - n * 24 * 60 * 60 * 1000;

const SEED_TICKETS = [
  {
    id: "TKT-0041", partner: "Tiot",
    category: "blocked-testing",
    subject: "Clicks blocked on ZA network during UAT",
    description: "Multiple valid clicks are being blocked during UAT on the ZA network.",
    uniqId: "UUID-ZA-83742", priority: "critical",
    status: "review",
    created: mins(7),
    statusHistory: [
      { status: "pending",    at: mins(7),  by: "Partner",  note: "Ticket submitted" },
      { status: "review",     at: mins(3),  by: "Admin",    note: "Under investigation" },
    ],
    unreadForPartner: true,
  },
  {
    id: "TKT-0040", partner: "DTAC",
    category: "integration",
    subject: "Shield JS not firing on iOS 17 Safari",
    description: "Shield script does not execute on iOS 17 Safari.",
    uniqId: null, priority: "high",
    status: "processing",
    created: hrs(1),
    statusHistory: [
      { status: "pending",    at: hrs(1),    by: "Partner", note: "Ticket submitted" },
      { status: "review",     at: mins(50),  by: "Admin",   note: "Reproduced on test device" },
      { status: "processing", at: mins(20),  by: "Admin",   note: "Fix in progress" },
    ],
    unreadForPartner: false,
  },
  {
    id: "TKT-0039", partner: "IQ InterCom",
    category: "data",
    subject: "Conversion count mismatch vs internal reports",
    description: "Conversion numbers in Shield dashboard don't match internal figures.",
    uniqId: null, priority: "medium",
    status: "feedback",
    created: hrs(2),
    statusHistory: [
      { status: "pending",    at: hrs(2),    by: "Partner", note: "Ticket submitted" },
      { status: "review",     at: hrs(1.5),  by: "Admin",   note: "Data audit started" },
      { status: "processing", at: hrs(1),    by: "Admin",   note: "Discrepancy identified in reporting pipeline" },
      { status: "feedback",   at: mins(30),  by: "Admin",   note: "Please confirm if updated numbers are now correct" },
    ],
    unreadForPartner: true,
  },
  {
    id: "TKT-0038", partner: "Tiot",
    category: "overblocking",
    subject: "Legitimate users being blocked on MTN",
    description: "~15% false positive block rate on MTN network.",
    uniqId: null, priority: "high",
    status: "pending",
    created: hrs(5),
    statusHistory: [
      { status: "pending", at: hrs(5), by: "Partner", note: "Ticket submitted" },
    ],
    unreadForPartner: false,
  },
  {
    id: "TKT-0037", partner: "DTAC",
    category: "error-response",
    subject: "API returning 500 on subscription endpoint",
    description: "Subscription API endpoint intermittently returns 500 errors.",
    uniqId: null, priority: "critical",
    status: "resolved",
    created: days(1),
    statusHistory: [
      { status: "pending",    at: days(1),       by: "Partner", note: "Ticket submitted" },
      { status: "review",     at: hrs(22),        by: "Admin",   note: "Investigating server logs" },
      { status: "processing", at: hrs(18),        by: "Admin",   note: "Root cause found — rate limiter misconfiguration" },
      { status: "feedback",   at: hrs(10),        by: "Admin",   note: "Fix deployed to staging, please verify" },
      { status: "resolved",   at: hrs(6),         by: "Admin",   note: "Confirmed fixed in production" },
    ],
    unreadForPartner: false,
  },
  {
    id: "TKT-0036", partner: "one-plan",
    category: "blocked-testing",
    subject: "Block happening on clean test devices",
    description: "Fresh emulators with no prior history are being blocked.",
    uniqId: "UUID-OP-11203", priority: "high",
    status: "resolved",
    created: days(3),
    statusHistory: [
      { status: "pending",    at: days(3),   by: "Partner", note: "Ticket submitted" },
      { status: "review",     at: days(2.5), by: "Admin",   note: "Reviewing emulator fingerprints" },
      { status: "processing", at: days(2),   by: "Admin",   note: "Emulator detection threshold adjusted" },
      { status: "resolved",   at: days(1.5), by: "Admin",   note: "Issue resolved, re-test confirmed clean" },
    ],
    unreadForPartner: false,
  },
];

// ── Context ───────────────────────────────────────────────────────────────────
const TicketContext = createContext(null);

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState(SEED_TICKETS);

  // Admin updates status — marks ticket as unread for partner
  const updateTicketStatus = useCallback((ticketId, newStatus, note = "") => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const entry = {
          status: newStatus,
          at: Date.now(),
          by: "Admin",
          note: note || `Status changed to ${STATUS_META[newStatus]?.label}`,
        };
        return {
          ...t,
          status: newStatus,
          statusHistory: [...(t.statusHistory || []), entry],
          unreadForPartner: true,
        };
      }),
    );
  }, []);

  // Partner adds a new ticket
  const addTicket = useCallback((ticket) => {
    const newTicket = {
      ...ticket,
      id: `TKT-${String(Date.now()).slice(-4)}`,
      created: Date.now(),
      status: "pending",
      unreadForPartner: false,
      statusHistory: [
        { status: "pending", at: Date.now(), by: "Partner", note: "Ticket submitted" },
      ],
    };
    setTickets((prev) => [newTicket, ...prev]);
  }, []);

  // Partner opens Support — mark their tickets as read
  const markReadForPartner = useCallback((partnerName) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.partner === partnerName ? { ...t, unreadForPartner: false } : t,
      ),
    );
  }, []);

  // Count of unread status updates for a partner
  const getUnreadCount = useCallback(
    (partnerName) =>
      tickets.filter((t) => t.partner === partnerName && t.unreadForPartner).length,
    [tickets],
  );

  return (
    <TicketContext.Provider
      value={{ tickets, updateTicketStatus, addTicket, markReadForPartner, getUnreadCount }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used inside <TicketProvider>");
  return ctx;
}