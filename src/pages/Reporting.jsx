import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, SectionTitle, Badge } from "../components/ui";
import { GREEN, AMBER, VIOLET, CYAN } from "../components/constants/colors";
import {
  CloseIcon,
  CheckIcon,
  EyeIcon,
  DownloadIcon,
} from "../components/ui/Icons";
import { repTrend } from "../data/charts";
import { repReports, userRows } from "../data/tables";

/* ── Static config ───────────────────────────────────────────────────────── */
const SUMMARY_STATS = (reports) => [
  {
    label: "Total Reports",
    value: String(reports.length),
    colorClass: "rep-val-blue",
  },
  {
    label: "Monthly Reports",
    value: String(reports.filter((r) => r.freq !== "Manual").length),
    colorClass: "rep-val-violet",
  },
  {
    label: "On-demand",
    value: String(reports.filter((r) => r.freq === "Manual").length),
    colorClass: "rep-val-cyan",
  },
];

const REPORT_TYPES = [
  {
    id: "traffic",
    label: "Traffic Overview",
    icon: "📈",
    desc: "Visits, clicks and blocked traffic",
  },
  {
    id: "block",
    label: "Block Summary",
    icon: "🚫",
    desc: "Fraud block reasons and counts",
  },
  {
    id: "apk",
    label: "APK Health Report",
    icon: "📱",
    desc: "APK performance and health status",
  },
  {
    id: "fraud",
    label: "Fraud Detection Log",
    icon: "🛡️",
    desc: "Detailed fraud event log",
  },
  {
    id: "geo",
    label: "Geo Distribution",
    icon: "🌐",
    desc: "Traffic breakdown by country",
  },
  {
    id: "partner",
    label: "Partner Performance",
    icon: "🤝",
    desc: "Per-partner stats and conversion",
  },
];

const FREQUENCIES = ["One-time"];
const FORMATS = ["CSV", "Excel (XLSX)", "PDF", "JSON"];
const PARTNERS = [
  "All Partners",
  "Vodacom",
  "MTN",
  "Telkom",
  "Cell C",
  "Rain",
  "Liquid",
];
const SERVICES = [
  "All Services",
  "Shield Core",
  "Shield APK",
  "Shield Browser",
  "Shield In-App",
];

const today = new Date().toISOString().split("T")[0];
const thirtyAgo = new Date(Date.now() - 30 * 864e5).toISOString().split("T")[0];

function getDemoCAdminAccount() {
  return userRows.find((u) => u.role === "C-Admins" && u.serviceOnboardingEnabled) || null;
}

function getAdminReportOwners() {
  const demoClientIds = new Set(["USR-051", "USR-052", "USR-053"]);
  const clientOwners = userRows
    .filter((u) => u.role === "Clients" && demoClientIds.has(u.id))
    .map((client) => ({
      id: client.id,
      name: client.name,
      ownerRole: "client",
    }));
  const cAdmin = getDemoCAdminAccount();
  const cAdminOwners = cAdmin
    ? [{ id: cAdmin.id, name: cAdmin.name, ownerRole: "c-admin" }]
    : [];

  return [...clientOwners, ...cAdminOwners];
}

function getCAdminReportOwners() {
  const cAdmin = getDemoCAdminAccount();
  if (!cAdmin) return [];

  const ownAccount = {
    id: cAdmin.id,
    name: cAdmin.name,
    ownerRole: "c-admin",
  };
  const assignedClients = (cAdmin.assignedClientIds || [])
    .map((clientId) => userRows.find((u) => u.id === clientId && u.role === "Clients"))
    .filter(Boolean)
    .map((client) => ({
      id: client.id,
      name: client.name,
      ownerRole: "client",
    }));

  return [ownAccount, ...assignedClients];
}

function getReportingAccount(role) {
  if (role === "c-admin") {
    const cAdmin = getDemoCAdminAccount();
    return {
      id: cAdmin?.id || "c-admin-demo",
      name: cAdmin?.name || "C-Admin",
      ownerRole: "c-admin",
    };
  }

  if (role === "partner") {
    return {
      id: "client-vodacom",
      name: "Vodacom",
      ownerRole: "client",
    };
  }

  return {
    id: "admin",
    name: "Shield Admin",
    ownerRole: "admin",
  };
}

function withReportOwner(report, owner) {
  return {
    ...report,
    ownerRole: owner.ownerRole,
    ownerId: owner.id,
    ownerName: owner.name,
  };
}

function buildInitialReports(role) {
  const account = getReportingAccount(role);

  if (role === "admin") {
    const adminOwners = getAdminReportOwners();
    const [trueDigital, gvi, teleinfotech, cAdmin] = adminOwners;
    return [
      withReportOwner(repReports[0], trueDigital || account),
      withReportOwner(repReports[1], gvi || account),
      withReportOwner(repReports[2], teleinfotech || account),
      withReportOwner(repReports[3], cAdmin || account),
      withReportOwner(
        {
          name: "True Digital Traffic Overview",
          type: "On-demand",
          freq: "Manual",
          lastRun: "Today 08:10",
          rows: "18,450",
          status: "active",
        },
        trueDigital || account,
      ),
      withReportOwner(
        {
          name: "Liam Patel Assigned Client Summary",
          type: "On-demand",
          freq: "Manual",
          lastRun: "Today 07:35",
          rows: "7,120",
          status: "active",
        },
        cAdmin || account,
      ),
    ];
  }

  if (role === "c-admin") {
    const cAdminOwners = getCAdminReportOwners();
    const [cAdminOwner, trueDigital, gvi] = cAdminOwners;
    return [
      withReportOwner(
        {
          name: "Assigned Clients Traffic Overview",
          type: "On-demand",
          freq: "Manual",
          lastRun: "Today 07:35",
          rows: "7,120",
          status: "active",
        },
        cAdminOwner || account,
      ),
      withReportOwner(
        {
          name: "Assigned Services Block Summary",
          type: "Scheduled",
          freq: "Daily",
          lastRun: "Today 06:00",
          rows: "2,840",
          status: "active",
        },
        cAdminOwner || account,
      ),
      withReportOwner(
        {
          name: "True Digital Traffic Overview",
          type: "Scheduled",
          freq: "Daily",
          lastRun: "Today 06:00",
          rows: "3,540",
          status: "active",
        },
        trueDigital || account,
      ),
      withReportOwner(
        {
          name: "GVI Block Summary",
          type: "On-demand",
          freq: "Manual",
          lastRun: "Yesterday",
          rows: "1,480",
          status: "active",
        },
        gvi || account,
      ),
    ];
  }

  return [
    withReportOwner(
      {
        name: `${account.name} Traffic Overview`,
        type: "Scheduled",
        freq: "Daily",
        lastRun: "Today 06:00",
        rows: "18,450",
        status: "active",
      },
      account,
    ),
    withReportOwner(
      {
        name: `${account.name} Block Summary`,
        type: "On-demand",
        freq: "Manual",
        lastRun: "Yesterday",
        rows: "4,250",
        status: "active",
      },
      account,
    ),
  ];
}

/* ── New Report Modal ────────────────────────────────────────────────────── */
function NewReportModal({ onClose, onSave, role, partnerName, reportOwnerOptions = [] }) {
  const isAdmin = role === "admin";
  const isCAdmin = role === "c-admin";

  const hasAccountSelection = isAdmin || isCAdmin;
  const STEPS = hasAccountSelection
    ? ["Select Account", "Report Type", "Filters & Date", "On-Demand Report"]
    : ["Report Type", "Filters & Date", "On-Demand Report"];

  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState("");
  const [dateFrom, setDateFrom] = useState(thirtyAgo);
  const [dateTo, setDateTo] = useState(today);
  const [datePreset, setDatePreset] = useState("30d");
  const [partner, setPartner] = useState(
    hasAccountSelection ? reportOwnerOptions[0]?.id || "" : partnerName || "",
  );
  const [service, setService] = useState("All Services");
  const [frequency, setFrequency] = useState("One-time");
  const [format, setFormat] = useState("CSV");
  const [reportName, setReportName] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const selectedReportOwner = hasAccountSelection
    ? reportOwnerOptions.find((owner) => owner.id === partner) || null
    : null;
  const selectedOwnerName = selectedReportOwner?.name || partner || "";

  const applyPreset = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    const from = new Date(now);
    if (preset === "7d") from.setDate(now.getDate() - 7);
    if (preset === "30d") from.setDate(now.getDate() - 30);
    if (preset === "90d") from.setDate(now.getDate() - 90);
    if (preset === "mtd") from.setDate(1);
    if (preset === "ytd") {
      from.setMonth(0);
      from.setDate(1);
    }
    setDateFrom(from.toISOString().split("T")[0]);
    setDateTo(now.toISOString().split("T")[0]);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setDone(true);
    await new Promise((r) => setTimeout(r, 800));
    onSave({
      reportType,
      dateFrom,
      dateTo,
      partner: selectedOwnerName,
      ownerId: selectedReportOwner?.id,
      ownerRole: selectedReportOwner?.ownerRole,
      ownerName: selectedReportOwner?.name,
      service,
      frequency,
      format,
      reportName,
    });
    onClose();
  };

  // Per-step validation
  const canNext = () => {
    if (hasAccountSelection) {
      if (step === 1) return !!partner;
      if (step === 2) return !!reportType && !!reportName.trim();
      if (step === 3) return !!dateFrom && !!dateTo;
      return true;
    } else {
      if (step === 1) return !!reportType && !!reportName.trim();
      if (step === 2) return !!dateFrom && !!dateTo;
      return true;
    }
  };

  const totalSteps = STEPS.length;
  const isLastStep = step === totalSteps;
  const selectedType = REPORT_TYPES.find((r) => r.id === reportType);

  // Which logical section is this step?
  const getStepType = () => {
    if (hasAccountSelection)
      return ["partner", "reporttype", "filters", "schedule"][step - 1];
    return ["reporttype", "filters", "schedule"][step - 1];
  };
  const stepType = getStepType();

  return (
    <div
      className="nr-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="nr-modal">
        {/* Header */}
        <div className="nr-header">
          <div>
            <div className="nr-title">Generate New Report</div>
            <div className="nr-subtitle">
              {hasAccountSelection
                ? "Select an account, then configure the report"
                : "Configure filters and schedule for your report"}
            </div>
          </div>
          <button className="nr-close" onClick={onClose}>
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Steps */}
        <div className="nr-steps">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`nr-step${step === i + 1 ? " active" : step > i + 1 ? " done" : ""}`}
            >
              <div className="nr-step-dot">
                {step > i + 1 ? <CheckIcon size={10} /> : i + 1}
              </div>
              <span className="nr-step-label">{label}</span>
              {i < totalSteps - 1 && (
                <div className={`nr-step-line${step > i + 1 ? " done" : ""}`} />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="nr-body">
          {/* ── Admin Step 1: Partner selection ── */}
          {stepType === "partner" && (
            <div>
              <div className="nr-section-title">Select Account</div>
              <div className="nr-partner-grid">
                {reportOwnerOptions.map((owner) => (
                  <div
                    key={owner.id}
                    className={`nr-partner-card${partner === owner.id ? " selected" : ""}`}
                    onClick={() => setPartner(owner.id)}
                  >
                    <div className="nr-partner-avatar">{owner.name.charAt(0)}</div>
                    <div className="nr-partner-name">{owner.name}</div>
                    <div className="nr-type-desc">
                      {owner.ownerRole === "c-admin" ? "C-Admin" : "Client"}
                    </div>
                    {partner === owner.id && (
                      <div className="nr-type-check">
                        <CheckIcon size={10} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Report Type ── */}
          {stepType === "reporttype" && (
            <div>
              <div className="nr-section-title">
                {hasAccountSelection && partner
                  ? `Report for ${selectedOwnerName}`
                  : "Select Report Type"}
              </div>
              <div className="nr-type-grid">
                {REPORT_TYPES.map((rt) => (
                  <div
                    key={rt.id}
                    className={`nr-type-card${reportType === rt.id ? " selected" : ""}`}
                    onClick={() => setReportType(rt.id)}
                  >
                    <div className="nr-type-icon">{rt.icon}</div>
                    <div className="nr-type-label">{rt.label}</div>
                    <div className="nr-type-desc">{rt.desc}</div>
                    {reportType === rt.id && (
                      <div className="nr-type-check">
                        <CheckIcon size={10} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="nr-field nr-field-mt">
                <label className="nr-label">Report Name</label>
                <input
                  className="nr-input"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder={
                    selectedType
                      ? `e.g. ${selectedType.label} - ${new Date().toLocaleDateString()}`
                      : "Enter a name for this report…"
                  }
                />
              </div>
            </div>
          )}

          {/* ── Filters & Date ── */}
          {stepType === "filters" && (
            <div>
              <div className="nr-section-title">Date Range</div>
              <div className="nr-presets">
                {[
                  ["7d", "Last 7 days"],
                  ["30d", "Last 30 days"],
                  ["90d", "Last 90 days"],
                  ["mtd", "Month to date"],
                  ["custom", "Custom"],
                ].map(([val, lbl]) => (
                  <button
                    key={val}
                    className={`nr-preset-btn${datePreset === val ? " active" : ""}`}
                    onClick={() => applyPreset(val)}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              <div className="nr-date-row">
                <div className="nr-field">
                  <label className="nr-label">From</label>
                  <input
                    type="date"
                    className="nr-input"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setDatePreset("custom");
                    }}
                  />
                </div>
                <div className="nr-date-sep">→</div>
                <div className="nr-field">
                  <label className="nr-label">To</label>
                  <input
                    type="date"
                    className="nr-input"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setDatePreset("custom");
                    }}
                  />
                </div>
              </div>

              <div className="nr-divider" />
              <div className="nr-section-title">Filters</div>
              <div className="nr-filters-grid">
                {/* Admin: partner was chosen in step 1. Client/C-Admin account is locked. */}
                <div className="nr-field">
                  <label className="nr-label">{isCAdmin ? "Account" : "Partner"}</label>
                  {hasAccountSelection ? (
                    <div className="nr-input nr-readonly">
                      <span className="nr-readonly-dot" />
                      {selectedOwnerName || "Select account"}
                    </div>
                  ) : (
                    <div className="nr-input nr-readonly">
                      <span className="nr-readonly-dot" />
                      {partner || "All Partners"}
                      <span className="nr-readonly-lock">🔒</span>
                    </div>
                  )}
                </div>
                <div className="nr-field">
                  <label className="nr-label">Service</label>
                  <select
                    className="nr-input nr-select"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                  >
                    {SERVICES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="nr-filter-summary">
                <span className="nr-filter-chip">
                  <span>📋</span>
                  {selectedType?.label}
                </span>
                <span className="nr-filter-chip">
                  <span>📅</span>
                  {dateFrom} → {dateTo}
                </span>
                {partner && partner !== "All Partners" && (
                  <span className="nr-filter-chip">
                    <span>🤝</span>
                    {selectedOwnerName}
                  </span>
                )}
                {service !== "All Services" && (
                  <span className="nr-filter-chip">
                    <span>⚙️</span>
                    {service}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Schedule & Format ── */}
          {stepType === "schedule" && (
            <div>
              {/* Monthly auto-report info banner */}
              <div className="nr-monthly-banner">
                <div className="nr-monthly-icon">🗓️</div>
                <div>
                  <div className="nr-monthly-title">
                    Monthly Report — Auto Generated
                  </div>
                  <div className="nr-monthly-desc">
                    A full monthly report is automatically generated at the end
                    of each month and will appear in your reports list. No
                    action required.
                  </div>
                </div>
              </div>

              <div className="nr-divider" />

              {/* On-Demand section */}
              <div className="nr-section-title">On-Demand Report</div>
              <div className="nr-ondemand-card">
                <div className="nr-freq-icon">⚡</div>
                <div>
                  <div className="nr-ondemand-title">One-time / On-Demand</div>
                  <div className="nr-ondemand-desc">
                    Generate this report immediately for the selected date range
                    and filters.
                  </div>
                </div>
                <div className="nr-type-check nr-type-check-static">
                  <CheckIcon size={10} />
                </div>
              </div>

              <div className="nr-divider" />
              <div className="nr-section-title">Export Format</div>
              <div className="nr-format-grid">
                {FORMATS.map((f) => (
                  <div
                    key={f}
                    className={`nr-format-card${format === f ? " selected" : ""}`}
                    onClick={() => setFormat(f)}
                  >
                    <div className="nr-format-icon">
                      {f === "CSV"
                        ? "📄"
                        : f.includes("Excel")
                          ? "📊"
                          : f === "PDF"
                            ? "📕"
                            : "{ }"}
                    </div>
                    <div className="nr-format-label">{f}</div>
                    {format === f && (
                      <div className="nr-type-check">
                        <CheckIcon size={10} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="nr-divider" />
              <div className="nr-summary-box">
                <div className="nr-summary-title">Report Summary</div>
                <div className="nr-summary-grid">
                  <div className="nr-summary-row">
                    <span>Name</span>
                    <strong>{reportName}</strong>
                  </div>
                  <div className="nr-summary-row">
                    <span>Type</span>
                    <strong>{selectedType?.label}</strong>
                  </div>
                  {(isAdmin || isCAdmin) && (
                    <div className="nr-summary-row">
                      <span>Account</span>
                      <strong>{selectedOwnerName}</strong>
                    </div>
                  )}
                  <div className="nr-summary-row">
                    <span>Date Range</span>
                    <strong>
                      {dateFrom} → {dateTo}
                    </strong>
                  </div>
                  <div className="nr-summary-row">
                    <span>Service</span>
                    <strong>{service}</strong>
                  </div>
                  <div className="nr-summary-row">
                    <span>Generation</span>
                    <strong>On-Demand</strong>
                  </div>
                  <div className="nr-summary-row">
                    <span>Format</span>
                    <strong>{format}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="nr-footer">
          <button
            className="nr-btn-ghost"
            onClick={step === 1 ? onClose : () => setStep((s) => s - 1)}
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>
          {!isLastStep ? (
            <button
              className={`nr-btn-primary${!canNext() ? " disabled" : ""}`}
              onClick={() => canNext() && setStep((s) => s + 1)}
            >
              Continue →
            </button>
          ) : (
            <button
              className={`nr-btn-save${done ? " done" : ""}`}
              onClick={handleSave}
              disabled={saving || done}
            >
              {done
                ? "✓ Generated!"
                : saving
                  ? "Generating…"
                  : "Generate Report"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────────────── */
export default function PageReporting({ role = "admin" }) {
  const reportingAccount = getReportingAccount(role);
  const adminReportOwners = getAdminReportOwners();
  const cAdminReportOwners = getCAdminReportOwners();
  const reportOwnerOptions = role === "c-admin" ? cAdminReportOwners : adminReportOwners;
  const cAdminAllowedOwnerIds = new Set(cAdminReportOwners.map((owner) => owner.id));
  const sessionAccountName = role === "admin" ? "" : reportingAccount.name;
  const [query, setQuery] = useState("");
  const [perPageRep, setPerPageRep] = useState(10);
  const [showNewReport, setShowNewReport] = useState(false);
  const [reports, setReports] = useState(() => buildInitialReports(role));

  const scopedReports =
    role === "admin"
      ? reports
      : role === "c-admin"
        ? reports.filter((report) => cAdminAllowedOwnerIds.has(report.ownerId))
        : reports.filter((report) => report.ownerId === reportingAccount.id);
  const filteredRep = scopedReports.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.type.toLowerCase().includes(query.toLowerCase()) ||
      (r.ownerName || "").toLowerCase().includes(query.toLowerCase()) ||
      (r.ownerRole || "").toLowerCase().includes(query.toLowerCase()),
  );
  const visibleRep = filteredRep.slice(0, perPageRep);

  const handleSave = (data) => {
    const targetOwner = role === "admin" || role === "c-admin"
      ? reportOwnerOptions.find((owner) => owner.id === data.ownerId) || reportingAccount
      : reportingAccount;
    setReports((prev) => [
      {
        name: data.reportName,
        type: data.frequency === "One-time" ? "On-demand" : "Scheduled",
        freq: "Manual",
        lastRun: "Just now",
        ownerRole: targetOwner.ownerRole,
        ownerId: targetOwner.id,
        ownerName: targetOwner.name,
        rows: "—",
        status: "active",
      },
      ...prev,
    ]);
  };

  return (
    <div className="reporting-page-wrap">
      {showNewReport && (
        <NewReportModal
          onClose={() => setShowNewReport(false)}
          onSave={handleSave}
          role={role}
          partnerName={sessionAccountName}
          reportOwnerOptions={reportOwnerOptions}
        />
      )}

      {/* Summary stats */}
      <div className="grid-2 mb-24">
        {SUMMARY_STATS(scopedReports).map(({ label, value, colorClass }) => (
          <Card key={label} className={`stat-top-4 rep-stat-card`}>
            <div className={`kpi-stat rep-stat-val ${colorClass}`}>{value}</div>
            <div className="stat-sublabel">{label}</div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2 mb-24">
        <Card>
          <SectionTitle>30-Day Reporting Trends</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={repTrend}>
              <XAxis dataKey="d" />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="visits"
                stroke="var(--color-primary)"
                strokeWidth={2}
              />
              <Line
                dataKey="clicks"
                stroke="var(--color-success)"
                strokeWidth={2}
              />
              <Line
                dataKey="blocked"
                stroke="var(--color-danger)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle>Report Type Split</SectionTitle>
          <div className="rep-summary-row">
            <div className="rep-donut-wrap">
              <PieChart width={160} height={160}>
                <Pie
                  data={[
                    { v: scopedReports.filter((r) => r.freq !== "Manual").length },
                    { v: scopedReports.filter((r) => r.freq === "Manual").length },
                  ]}
                  dataKey="v"
                  cx={80}
                  cy={80}
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={4}
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="#8b5cf6" />
                  <Cell fill="#06b6d4" />
                </Pie>
              </PieChart>
              <div className="rep-donut-center">
                <div className="rep-donut-total">{scopedReports.length}</div>
                <div className="rep-donut-sub">Reports</div>
              </div>
            </div>
            <div className="rep-list-col">
              {[
                {
                  color: "#8b5cf6",
                  label: "Monthly",
                  val: scopedReports.filter((r) => r.freq !== "Manual").length,
                },
                {
                  color: "#06b6d4",
                  label: "On-demand",
                  val: scopedReports.filter((r) => r.freq === "Manual").length,
                },
              ].map(({ color, label, val }) => (
                <div key={label} className="rep-legend-row">
                  <div className="rep-legend-dot" />
                  <div className="rep-legend-lbl">{label}</div>
                  <div className="rep-legend-val">
                    {val} <span className="rep-legend-unit">reports</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Reports table */}
      <Card>
        <div className="toolbar">
          <SectionTitle>All Reports</SectionTitle>
          <div className="f-gap-10">
            <div className="dt-entries-bar">
              <span className="dt-entries-lbl">Show</span>
              <select
                className="dt-entries-sel"
                value={perPageRep}
                onChange={(e) => setPerPageRep(Number(e.target.value))}
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="dt-entries-lbl">entries</span>
            </div>
            <div className="p-rel">
              <span className="partner-search-icon">🔍</span>
              <input
                placeholder="Search reports…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="partner-search"
              />
            </div>
            <button className="tab-pill" onClick={() => setShowNewReport(true)}>
              + New Report
            </button>
          </div>
        </div>
        <div className="page-table-scroll">
          <table className="dt dt-lg">
            <thead>
              <tr className="dt-head-row">
                {[
                  "Report Name",
                  ...(role === "admin" || role === "c-admin" ? ["Account", "Account Type"] : []),
                  "Type",
                  "Frequency",
                  "Last Run",
                  "Rows",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="dt-th">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRep.map((r, i) => (
                <tr key={i} className="dt-tr-plain">
                  <td className="td-p-10">{r.name}</td>
                  {(role === "admin" || role === "c-admin") && (
                    <>
                      <td className="td-p-10">{r.ownerName}</td>
                      <td className="p-10">
                        <Badge color={r.ownerRole === "c-admin" ? VIOLET : CYAN}>
                          {r.ownerRole === "c-admin" ? "C-Admin" : "Client"}
                        </Badge>
                      </td>
                    </>
                  )}
                  <td className="p-10">
                    <Badge color={r.type === "Scheduled" ? VIOLET : CYAN}>
                      {r.type}
                    </Badge>
                  </td>
                  <td className="p-10">{r.freq}</td>
                  <td className="p-10">{r.lastRun}</td>
                  <td className="td-p-10m">{r.rows}</td>
                  <td className="p-10">
                    <Badge color={r.status === "active" ? GREEN : AMBER}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="td-actions-wide">
                    <div className="f-gap-6">
                      <button className="btn-icon" title="View">
                        <EyeIcon size={16} />
                      </button>
                      <button className="btn-icon" title="Download">
                        <DownloadIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
