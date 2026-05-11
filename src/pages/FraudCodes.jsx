import { useState, useRef, useEffect } from "react";
import { SearchIcon, CloseIcon, EyeIcon, CheckIcon, SaveIcon, ArrowLeftIcon, EditIcon, FileTextIcon } from "../components/ui/Icons";

const T = "#0d9488";
export const FRAUD_CODE_COLOR_KEY = "shield.fraudCodeColors.v1";
export const FRAUD_CODE_EDIT_KEY = "shield.fraudCodeEdits.v1";

/* ─── Design tokens ──────────────────────────────────────────────────────────── */
/* ─── Data ────────────────────────────────────────────────────────────────── */
export const FRAUD_CODES = [
  { id: "AMCPS-1320", label: "Single Page Deployment", color: "#e87979", type: "parent", children: [] },
  { id: "AMCPS-2400", label: "Legacy Devices/Browsers", color: "#fb9077", type: "parent", children: [] },
  { id: "AMCPS-1310", label: "Bypassed", color: "#3b82f6", type: "parent", children: [] },
  { id: "AMCPS-3500", label: "Forced Clear", color: "#22c55e", type: "parent", children: [] },
  { id: "MCPS-1300", label: "Shield Bypassing", color: "#38bdf8", type: "parent", children: [
    { id: "MCPS-1305", label: "No Interaction Event Found", color: "#22c55e" },
    { id: "MCPS-1304", label: "No Event Found", color: "#22c55e" },
    { id: "MCPS-1301", label: "Shield Bypass", color: "#22c55e" },
    { id: "MCPS-1302", label: "No FP", color: "#a855f7" },
    { id: "MCPS-1303", label: "APK With No RD", color: "#38bdf8" },
  ]},
  { id: "MCPS-1200", label: "Desktop Traffic", color: "#7f1d1d", type: "parent", children: [
    { id: "MCPS-1202", label: "Blocked OS", color: "#22c55e" },
    { id: "MCPS-1201", label: "Blocked Platforms", color: "#22c55e" },
  ]},
  { id: "MCPS-1800", label: "Opera Mini Traffic", color: "#e11d48", type: "parent", children: [
    { id: "MCPS-1801", label: "Opera Mini", color: "#22c55e" },
  ]},
  { id: "MCPS-2200", label: "Facebook Traffic", color: "#111827", type: "parent", children: [
    { id: "MCPS-2201", label: "FBCLID", color: "#8b5cf6" },
  ]},
  { id: "MCPS-2100", label: "Google Traffic", color: "#fca5a5", type: "parent", children: [
    { id: "MCPS-2103", label: "Google App to Web", color: "#581c87" },
    { id: "MCPS-2102", label: "Google Web to App", color: "#f59e0b" },
    { id: "MCPS-2101", label: "GCLID", color: "#92400e" },
  ]},
  { id: "MCPS-9000", label: "Failed Interaction", color: "#ef4444", type: "parent", children: [
    { id: "MCPS-9010", label: "No Interaction", color: "#ef4444" },
    { id: "MCPS-9009", label: "Screen Property Test Failed", color: "#b45309" },
    { id: "MCPS-9008", label: "Layer Property Test Failed", color: "#22c55e" },
    { id: "MCPS-9007", label: "Page Property Test Failed", color: "#b91c1c" },
    { id: "MCPS-9006", label: "Offset Property Test Failed", color: "#b45309" },
    { id: "MCPS-9005", label: "Device Check Failed", color: "#111827" },
    { id: "MCPS-9004", label: "Interaction Area Test Failed", color: "#b45309" },
    { id: "MCPS-9003", label: "Target Element Not Visible", color: "#92400e" },
    { id: "MCPS-9002", label: "Target Element Not In Viewport", color: "#ef4444" },
    { id: "MCPS-9001", label: "Programmatic Click Detected", color: "#22c55e" },
  ]},
  { id: "MCPS-5000", label: "Bot Detected", color: "#d4d000", type: "parent", children: [
    { id: "MCPS-5008", label: "Point 00 Failed", color: "#22c55e" },
    { id: "MCPS-5007", label: "Headless", color: "#8b5e5e" },
    { id: "MCPS-5006", label: "Emulator Detected", color: "#8b5e5e" },
    { id: "MCPS-5005", label: "Cloud Instances Pretending to be Devices", color: "#8b5e5e" },
    { id: "MCPS-5004", label: "Selenium", color: "#4b5563" },
    { id: "MCPS-5003", label: "PhantomJS", color: "#6b5b5b" },
    { id: "MCPS-5002", label: "Simulators", color: "#8b5e5e" },
    { id: "MCPS-5001", label: "Bot Detected", color: "#22c55e" },
  ]},
  { id: "MCPS-1100", label: "Failed Input Verification", color: "#fca5a5", type: "parent", children: [
    { id: "MCPS-1107", label: "Input Verification Failed", color: "#22c55e" },
    { id: "MCPS-1106", label: "Input Verification Failed", color: "#22c55e" },
    { id: "MCPS-1105", label: "Input Verification Failed", color: "#22c55e" },
    { id: "MCPS-1104", label: "Input Verification Failed", color: "#22c55e" },
    { id: "MCPS-1103", label: "Input Verification Failed", color: "#22c55e" },
    { id: "MCPS-1102", label: "Input Verification Failed", color: "#22c55e" },
    { id: "MCPS-1101", label: "Input Verification Failed", color: "#22c55e" },
  ]},
  { id: "MCPS-2000", label: "Excessive IP Access Attempts", color: "#a855f7", type: "parent", children: [
    { id: "MCPS-2002", label: "IP Hitting Too Quickly", color: "#22c55e" },
    { id: "MCPS-2001", label: "IP Hitting Too Quickly", color: "#22c55e" },
  ]},
  { id: "MCPS-8000", label: "Remotely Controlled Fraud", color: "#a3b18a", type: "parent", children: [
    { id: "MCPS-8001", label: "Transactions Span Across Multiple IP Addresses", color: "#4f46e5" },
    { id: "MCPS-8002", label: "Transactions Span Over Multiple Devices", color: "#22c55e" },
  ]},
  { id: "MCPS-7000", label: "Clickjacking", color: "#8b5e5e", type: "parent", children: [
    { id: "MCPS-7001", label: "Click Jacking Found", color: "#22c55e" },
  ]},
  { id: "MCPS-6000", label: "Spoofing", color: "#94a3b8", type: "parent", children: [
    { id: "MCPS-6007", label: "Platform Spoofing", color: "#a855f7" },
    { id: "MCPS-6006", label: "Hidden Webpage", color: "#d946ef" },
    { id: "MCPS-6005", label: "Dimensions Spoofing", color: "#8b5e5e" },
    { id: "MCPS-6004", label: "Point 90 Failed", color: "#d946ef" },
    { id: "MCPS-6003", label: "Spoofed Languages", color: "#a855f7" },
    { id: "MCPS-6002", label: "Spoofed Browsers", color: "#22c55e" },
    { id: "MCPS-6001", label: "Spoofed OS", color: "#22c55e" },
  ]},
  { id: "MCPS-4000", label: "APK Fraud", color: "#0ea5a8", type: "parent", children: [
    { id: "MCPS-4003", label: "Fraudulent APK", color: "#4b2f2f" },
    { id: "MCPS-4002", label: "APK Name is Hidden", color: "#164e63" },
    { id: "MCPS-4001", label: "Hidden APKs", color: "#22c55e" },
  ]},
  { id: "MCPS-1000", label: "Unauthorised IP Address", color: "#7f1d3a", type: "parent", children: [
    { id: "MCPS-1002", label: "IP Not Allowed", color: "#eab308" },
    { id: "MCPS-1001", label: "Network Not Allowed", color: "#111827" },
  ]},
  { id: "MCPS-2300", label: "Blacklist/Whitelist", color: "#e11d48", type: "parent", children: [] },
  { id: "MCPS-1900", label: "Google Proxy Traffic", color: "#ef233c", type: "parent", children: [] },
  { id: "MCPS-1700", label: "Old Gen Browser", color: "#fca5a5", type: "parent", children: [] },
  { id: "MCPS-1600", label: "Adult Keywords", color: "#ef4444", type: "parent", children: [] },
  { id: "MCPS-1500", label: "APK Not From Play Store", color: "#ef4444", type: "parent", children: [] },
  { id: "MCPS-1400", label: "Duplicate Shield Token", color: "#f97316", type: "parent", children: [] },
  { id: "MCPS-3000", label: "Replay Attack", color: "#8b5cf6", type: "parent", children: [] },
];

const COLOR_PRESETS = [
  "#ef4444", "#e11d48", "#fca5a5", "#f97316", "#f59e0b", "#eab308",
  "#d4d000", "#22c55e", "#a3b18a", "#38bdf8", "#0ea5a8", "#3b82f6",
  "#4f46e5", "#8b5cf6", "#a855f7", "#d946ef", "#92400e", "#8b5e5e",
  "#7f1d1d", "#7f1d3a", "#111827", "#6b7280", "#94a3b8",
];

export const FRAUD_DESCRIPTIONS = {
  shield: [
    { code: "MCPS-0000", title: "Clear", description: "Transaction was cleared because no Shield block reason was matched." },
    { code: "MCPS-1000", title: "Unauthorised IP Address", description: "Request was denied because the IP address used does not fall within the approved range specified by the client." },
    { code: "MCPS-1100", title: "Failed Input Verification", description: "Failed Input Verification is used when there's a problem with verifying the information entered on MSISDN/PIN entry pages. This can happen due to various reasons, including automated processes (like bots or app controllers) or extremely fast data entry that doesn't match normal human behaviour. It's a signal that something might not be quite right with the information provided." },
    { code: "MCPS-1200", title: "Desktop Traffic", description: "Indicates a situation where fraudsters use old devices with outdated operating systems to avoid specific security tests or checks. They do this to hide certain activities that may not comply with security measures. This behavior can create risks, potentially allowing fraudulent actions to go unnoticed." },
    { code: "MCPS-1300", title: "Shield Bypassing", description: "Shield Bypassing is a term used to describe a fraudulent tactic where malicious actors intentionally disrupt the proper functioning of our anti-fraud system. It's akin to someone trying to disable security measures in a building to carry out unauthorized activities unnoticed. In the digital realm, fraudsters attempt to prevent our Shield JavaScript engine from working correctly on a webpage. This obstructs our ability to effectively detect and prevent fraudulent transactions. By identifying instances where the Shield JavaScript engine fails to load or render, we can uncover and thwart potential fraud attempts. Shield Bypassing serves as a critical defense mechanism, helping us protect against malicious efforts to interfere with our fraud prevention measures." },
    { code: "MCPS-1400", title: "Duplicate Shield Token", description: "Clear Uniqid is getting used Multiple times against multiple URL's" },
    { code: "MCPS-2000", title: "Excessive IP Access Attempts", description: "Request was declined because there have been too many access attempts from the same IP address within a short period of time." },
    { code: "MCPS-2400", title: "Legacy Devices/Browsers", description: "Indicates a situation where fraudsters use old devices with outdated operating systems to avoid specific security tests or checks. They do this to hide certain activities that may not comply with security measures. This behaviour can create risks, potentially allowing fraudulent actions to go unnoticed. It underscores the importance of vigilant monitoring and addressing such instances to maintain robust security measures." },
    { code: "MCPS-3000", title: "Replay Attack", description: "A replay attack refers to a fraudulent act in which an attacker attempts to reuse or \"replay\" legitimate transaction data to gain unauthorised access. It typically involves the following steps: Initial Legitimate Transaction takes place, the user provides valid information and credentials. Data Capture: The fraudster captures all relevant data associated with the legitimate transaction. Replay Attempt: The fraudster then attempts to replay this captured data, essentially submitting the same transaction again without the legitimate user's consent or knowledge." },
    { code: "MCPS-4000", title: "APK Fraud", description: "The app might disguise itself by pretending to be a web browser in its request headers. It can also deceive by claiming to be from one package (Package A) while actually originating from another (Package B). Additionally, the app attempts to conceal its true identity by hiding its package name." },
    { code: "MCPS-5000", title: "Bot Detected", description: "The system detects the presence of automated bots. These bots often use headless browsers like PhantomJS, Selenium, Appium, and similar tools. Additionally, they may run on emulators or desktops hosted on cloud-based servers, mimicking the behaviour of real mobile devices." },
    { code: "MCPS-6000", title: "Spoofing", description: "Indicates instances where attackers manipulate or falsify information related to the Mobile OS, Browsers or Apps. For example, an attacker might disguise their system to appear as though it's using a different web browser or app or present an outdated version of an operating system. This deceptive tactic aims to trick the system into granting unauthorised access." },
    { code: "MCPS-7000", title: "Clickjacking", description: "Click jacking or malicious code injection attempts, which are both common OWASP-defined web application security risks. It involves overlaying hidden elements on web pages to deceive users into unintentional interactions. For instance, a malicious actor might place an invisible button on a subscription page, tricking users into activating subscriptions without their knowledge." },
    { code: "MCPS-8000", title: "Remotely Controlled Fraud", description: "Refers to remote-controlled fraud, where a single transaction spans multiple devices and networks. A fraudster gains control of a victim's device via a malware app, manipulating it remotely through emulators or cloud servers to subscribe to a specific service without the victim's knowledge. The fraudster initiates requests from a gateway IP but processes them on a remote server, spoofing the gateway IP during landing page interaction and executing the transaction via a command-and-control server." },
    { code: "MCPS-9000", title: "Failed Interaction", description: "Encompasses programmatic interactions within web applications where an element is clicked but is not visible or falls entirely outside of the user's visible screen area. Additionally, it identifies cases where no user activity is observed on the page; if a block API call is received from the server indicating the subscribe button was clicked with no genuine user action, it suggests fraudulent activity. This reason code is crucial for detecting and mitigating fraudulent or automated interactions within web applications." },
  ],
  adhoc: [
    { code: "AMCPS-1310", title: "Bypassed", description: "Additional reason code AMCPS-1310 with MCPS-1300 in API response." },
    { code: "AMCPS-1320", title: "Single Page Deployment", description: "Shield must be applied on 2 Pages, only 1 Page Found." },
    { code: "AMCPS-3500", title: "Forced Clear", description: "Forced Clear for Clients" },
  ],
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const codeColor = (code) => {
  if (code === "MCPS-0000") return "#16a34a";
  for (const item of FRAUD_CODES) {
    if (item.id === code) return item.color;
    const child = item.children?.find((entry) => entry.id === code);
    if (child) return child.color;
  }
  return "#6b7280";
};

const readJsonStorage = (key, fallback = {}) => {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const readSavedReasonEdits = () => readJsonStorage(FRAUD_CODE_EDIT_KEY, {});

const defaultReasonDescription = (code) => {
  const rows = [...FRAUD_DESCRIPTIONS.shield, ...FRAUD_DESCRIPTIONS.adhoc];
  return rows.find((row) => row.code === code)?.description || "";
};

export const getFraudReasonTitle = (code) => {
  const key = String(code || "").trim();
  const saved = readSavedReasonEdits();
  if (saved[key]?.label) return saved[key].label;
  if (code === "MCPS-0000") return "Clear";
  for (const item of FRAUD_CODES) {
    if (item.id === key) return item.label;
    const child = item.children?.find((entry) => entry.id === key);
    if (child) return child.label;
  }
  return "";
};

export const getFraudReasonDescription = (code) => {
  const key = String(code || "").trim();
  const saved = readSavedReasonEdits();
  return saved[key]?.description ?? defaultReasonDescription(key);
};

export const getFraudReasonColor = (code, fallback = "#64748b") => {
  const key = String(code || "").trim();
  if (!key) return fallback;

  const savedEdits = readSavedReasonEdits();
  if (savedEdits[key]?.color) return savedEdits[key].color;

  const saved = readJsonStorage(FRAUD_CODE_COLOR_KEY, {});
  if (saved[key]) return saved[key];

  return codeColor(key) || fallback;
};

const withSavedFraudColors = () => {
  const savedColors = readJsonStorage(FRAUD_CODE_COLOR_KEY, {});
  const savedEdits = readSavedReasonEdits();

  const decorate = (entry) => ({
    ...entry,
    description: savedEdits[entry.id]?.description ?? defaultReasonDescription(entry.id),
    status: savedEdits[entry.id]?.status || "Active",
    allowClients: savedEdits[entry.id]?.allowClients || "Yes",
    adHoc: savedEdits[entry.id]?.adHoc || (entry.id.startsWith("AMCPS-") ? "Yes" : "No"),
    label: savedEdits[entry.id]?.label || entry.label,
    color: savedEdits[entry.id]?.color || savedColors[entry.id] || entry.color,
  });

  return FRAUD_CODES.map((code) => ({
    ...decorate(code),
    children: (code.children || []).map(decorate),
  }));
};

const flattenReasonColors = (codes) => codes.reduce((acc, code) => {
  acc[code.id] = code.color;
  code.children?.forEach((child) => {
    acc[child.id] = child.color;
  });
  return acc;
}, {});

const flattenReasonEdits = (codes) => codes.reduce((acc, code) => {
  acc[code.id] = {
    label: code.label,
    description: code.description || "",
    color: code.color,
    status: code.status || "Active",
    allowClients: code.allowClients || "Yes",
    adHoc: code.adHoc || "No",
  };
  code.children?.forEach((child) => {
    acc[child.id] = {
      label: child.label,
      description: child.description || "",
      color: child.color,
      status: child.status || "Active",
      allowClients: child.allowClients || "Yes",
      adHoc: child.adHoc || "No",
    };
  });
  return acc;
}, {});

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
};

function RadioGroup({ options, value, onChange }) {
  return (
    <div className="fc-radio-group">
      {options.map((opt) => (
        <label key={opt} className="fc-radio-opt" onClick={() => onChange(opt)}>
          <span className={`fc-radio-dot${value === opt ? " on" : ""}`}>
            {value === opt && <span className="fc-radio-inner" />}
          </span>
          {opt}
        </label>
      ))}
    </div>
  );
}

/* ─── Fraud Descriptions Modal ────────────────────────────────────────────── */

function DescCell({ code, description, expandedRows, toggleRow }) {
  const ref = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const isExpanded = !!expandedRows[code];

  useEffect(() => {
    if (ref.current) {
      setIsOverflowing(ref.current.scrollHeight > ref.current.clientHeight + 2);
    }
  }, [description]);

  return (
    <td className="fc-td-top" onClick={() => isOverflowing || isExpanded ? toggleRow(code) : null}>
      <div ref={ref} className={`fc-desc-text fc-desc-collapsible${isExpanded ? " expanded" : ""}`}>
        {description}
      </div>
      {(isOverflowing || isExpanded) && (
        <span className="fc-desc-expand-hint">
          {isExpanded ? "Click to collapse ▴" : "Click to expand ▾"}
        </span>
      )}
    </td>
  );
}

export function FraudDescriptionsModal({ onClose }) {
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const toggleRow = (code) => setExpandedRows((p) => ({ ...p, [code]: !p[code] }));
  const q = search.toLowerCase();

  const filter = (rows) => !q ? rows : rows.filter((r) => (
    r.code.toLowerCase().includes(q) ||
    getFraudReasonTitle(r.code).toLowerCase().includes(q) ||
    getFraudReasonDescription(r.code).toLowerCase().includes(q)
  ));

  const shieldRows = filter(FRAUD_DESCRIPTIONS.shield);
  const adhocRows  = filter(FRAUD_DESCRIPTIONS.adhoc);
  const total = shieldRows.length + adhocRows.length;

  return (
    <div className="fc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fc-modal">
        {/* Header */}
        <div className="fc-modal-header">
          <div className="fc-row-center">
            <span className="fc-modal-title">Fraud Code Descriptions</span>
            <span className="fc-modal-count">{total} entries</span>
          </div>
          <div className="fc-row-gap10">
            <div className="fc-modal-search">
              <SearchIcon size={14} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search codes, titles…" autoFocus />
            </div>
            <button className="fc-modal-close" onClick={onClose}>
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="fc-modal-body">
          {total === 0 ? (
            <div className="fc-no-results">
              <div className="fc-no-results-icon">🔍</div>
              No results for "<strong>{search}</strong>"
            </div>
          ) : (
            <table className="fc-desc-table">
              <thead className="fc-desc-thead">
                <tr>
                  <th className="fc-th-code">Shield Code</th>
                  <th className="fc-th-type">Fraud Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {shieldRows.map((row) => {
                  const color = getFraudReasonColor(row.code);
                  const title = getFraudReasonTitle(row.code);
                  const description = getFraudReasonDescription(row.code);
                  return (
                    <tr key={row.code} className="fc-desc-row">
                      <td className="fc-td-top">
                        <span className="fc-code-pill" style={{ "--fc-code-color": color }}>
                          <span className="fc-code-dot" />
                          {row.code}
                        </span>
                      </td>
                      <td className="fc-td-top">
                        <span className="fc-desc-title">{title}</span>
                      </td>
                      <DescCell code={row.code} description={description} expandedRows={expandedRows} toggleRow={toggleRow} />
                    </tr>
                  );
                })}

                {adhocRows.length > 0 && (
                  <>
                    <tr className="fc-section-divider">
                      <td colSpan={3}>⚡ Adhoc Rules</td>
                    </tr>
                    {adhocRows.map((row) => {
                      const color = getFraudReasonColor(row.code);
                      const title = getFraudReasonTitle(row.code);
                      const description = getFraudReasonDescription(row.code);
                      return (
                        <tr key={row.code} className="fc-desc-row fc-desc-row-click" onClick={() => toggleRow(row.code)}>
                          <td className="fc-td-top">
                            <span className="fc-code-pill" style={{ "--fc-code-color": color }}>
                              <span className="fc-code-dot" />
                              {row.code}
                            </span>
                          </td>
                          <td className="fc-td-top">
                            <span className="fc-desc-title">{title}</span>
                          </td>
                          <DescCell code={row.code} description={description} expandedRows={expandedRows} toggleRow={toggleRow} />
                        </tr>
                      );
                    })}
                  </>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Map Form ────────────────────────────────────────────────────────────── */
function MapForm({ onViewAll }) {
  const [reasonType,   setReasonType]   = useState("Parent");
  const [shieldCode,   setShieldCode]   = useState("");
  const [fraudType,    setFraudType]    = useState("");
  const [description,  setDescription]  = useState("");
  const [color,        setColor]        = useState("#6bf178");
  const [allowClients, setAllowClients] = useState("Yes");
  const [adHoc,        setAdHoc]        = useState("No");
  const [saved,        setSaved]        = useState(false);
  const [showDesc,     setShowDesc]     = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="fc-root">
      {showDesc && <FraudDescriptionsModal onClose={() => setShowDesc(false)} />}

      <div className="fc-page-title">Map Shield Block Reasons</div>
      <div className="fc-page-sub">Configure and manage fraud detection rules for MCP Shield</div>

      <div className="fc-card">
        {/* Top bar */}
        <div className="fc-card-topbar">
          <button className="fc-btn fc-btn-indigo" onClick={() => setShowDesc(true)}>
            <FileTextIcon size={14} />
            Fraud Descriptions
          </button>
          <button className="fc-btn fc-btn-primary" onClick={onViewAll}>
            <EyeIcon size={14} />
            View Fraud Codes
          </button>
        </div>

        {/* Reason Type */}
        <div className="fc-field">
          <span className="fc-field-label">Reason Type</span>
          <RadioGroup options={["Parent", "Child"]} value={reasonType} onChange={setReasonType} />
        </div>
        <div className="fc-divider" />

        {/* Shield Code */}
        <div className="fc-field">
          <span className="fc-field-label">Shield Code</span>
          <input className="fc-input" value={shieldCode} onChange={(e) => setShieldCode(e.target.value)} placeholder="e.g. MCPS-1300" />
        </div>

        {/* Fraud Type */}
        <div className="fc-field">
          <span className="fc-field-label">Shield Fraud Type</span>
          <input className="fc-input" value={fraudType} onChange={(e) => setFraudType(e.target.value)} placeholder="e.g. Bot Detected" />
        </div>

        {/* Description */}
        <div className="fc-field">
          <span className="fc-field-label fc-pt9">Fraud Description</span>
          <textarea className="fc-input fc-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the fraud type and detection logic…" />
        </div>
        <div className="fc-divider" />

        {/* Color */}
        <div className="fc-field">
          <span className="fc-field-label">Color</span>
          <div className="fc-color-row">
            <input className="fc-input fc-mono-input" value={color} onChange={(e) => setColor(e.target.value)} placeholder="#6bf178"  />
            <div className="fc-color-swatch">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div className="fc-color-preview" />
          </div>
        </div>
        <div className="fc-divider" />

        {/* Allow Clients */}
        <div className="fc-field">
          <span className="fc-field-label">Allow Clients</span>
          <RadioGroup options={["No", "Yes"]} value={allowClients} onChange={setAllowClients} />
        </div>

        {/* Ad-hoc */}
        <div className="fc-field">
          <span className="fc-field-label">Ad-hoc Rule</span>
          <RadioGroup options={["No", "Yes"]} value={adHoc} onChange={setAdHoc} />
        </div>

        {/* Save */}
        <div className="fc-form-footer">
          <button className={`fc-btn fc-btn-save${saved ? " fc-btn-saved" : ""}`} onClick={handleSave}>
            {saved ? (
              <><CheckIcon size={14} /> Saved</>
            ) : (
              <><SaveIcon size={14} /> Save Rule</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── View All ────────────────────────────────────────────────────────────── */
function ViewAll({ onBack }) {
  const [codes, setCodes] = useState(withSavedFraudColors);
  const [expanded, setExpanded] = useState({});
  const [search,   setSearch]   = useState("");
  const [editing,  setEditing]  = useState(null);

  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(FRAUD_CODE_COLOR_KEY, JSON.stringify(flattenReasonColors(codes)));
      window.localStorage.setItem(FRAUD_CODE_EDIT_KEY, JSON.stringify(flattenReasonEdits(codes)));
    } catch {
      // Local customisation is optional; the built-in map remains available.
    }
  }, [codes]);

  const filtered = search
    ? codes.filter((c) =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.children?.some((ch) => ch.label.toLowerCase().includes(search.toLowerCase()) || ch.id.toLowerCase().includes(search.toLowerCase()))
      )
    : codes;

  const totalChildren = codes.reduce((a, c) => a + (c.children?.length || 0), 0);

  const openReasonEditor = (event, parentId, childId = null) => {
    event.stopPropagation();
    const parent = codes.find((code) => code.id === parentId);
    const item = childId ? parent?.children?.find((child) => child.id === childId) : parent;
    if (item) setEditing({ parentId, childId, item });
  };

  const saveReasonEdit = (nextItem) => {
    setCodes((current) => current.map((code) => {
      if (code.id !== editing.parentId) return code;
      if (!editing.childId) return { ...code, ...nextItem, id: code.id };

      return {
        ...code,
        children: code.children?.map((child) => (
          child.id === editing.childId ? { ...child, ...nextItem, id: child.id } : child
        )),
      };
    }));
    setEditing(null);
  };

  return (
    <div className="fc-root">

      <div className="fc-va-header">
        <div>
          <div className="fc-page-title">Shield Fraud Codes</div>
          <div className="fc-page-sub">Complete reference of all detection codes and sub-codes</div>
        </div>
        <div className="fc-modal-actions">
          <div className="fc-modal-search fc-modal-search-wrap">
            <SearchIcon size={13} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search codes…" className="fc-search-input" />
          </div>
          <button className="fc-btn fc-btn-outline" onClick={onBack}>
            <ArrowLeftIcon size={13} />
            Back
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="fc-stats-row">
        {[
          { label: "Total Codes", val: codes.length + totalChildren, color: "#4f46e5" },
          { label: "Parent Codes", val: codes.length, color: T },
          { label: "Child Codes",  val: totalChildren, color: "#16a34a" },
        ].map(({ label, val, color }) => (
          <div key={label} className="fc-stat-card">
            <div className="fc-stat-bar" style={{ background: color }} />
            <div>
              <div className="fc-stat-num">{val}</div>
              <div className="fc-stat-lbl">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="fc-list-card">
        {filtered.map((code) => (
          <div key={code.id}>
            <div
              className="fc-list-row"
              style={{ "--fc-code-color": code.color }}
              onClick={() => code.children?.length && toggle(code.id)}>
              <div className="fc-list-dot" />
              <span className="fc-list-label">
                {code.label}
                <span className="fc-list-id">{code.id}</span>
              </span>
              {code.children?.length > 0 && (
                <span className="fc-list-badge">{code.children.length} {code.children.length === 1 ? "child" : "children"}</span>
              )}
              {code.status === "In Active" && <span className="fc-list-state inactive">In Active</span>}
              {code.adHoc === "Yes" && <span className="fc-list-state adhoc">Ad-hoc</span>}
              <div className="fc-list-swatch" style={{ background: code.color }} />
              <button
                type="button"
                className="fc-list-edit"
                onClick={(e) => openReasonEditor(e, code.id)}
                title={`Edit ${code.id}`}
                aria-label={`Edit ${code.id}`}
              >
                <EditIcon size={13} />
              </button>
              {code.children?.length > 0 && (
                <span className={`fc-list-chevron${expanded[code.id] ? " open" : ""}`}>▼</span>
              )}
            </div>

            {expanded[code.id] && code.children?.map((child) => (
              <div key={child.id} className="fc-child-row" style={{ "--fc-code-color": child.color }}>
                <div className="fc-child-dot" />
                <span className="fc-list-label fc-child-label">
                  {child.label}
                  <span className="fc-list-id">{child.id}</span>
                </span>
                {child.status === "In Active" && <span className="fc-list-state inactive">In Active</span>}
                {child.adHoc === "Yes" && <span className="fc-list-state adhoc">Ad-hoc</span>}
                <div className="fc-list-swatch fc-child-swatch" style={{ background: child.color }} />
                <button
                  type="button"
                  className="fc-list-edit"
                  onClick={(e) => openReasonEditor(e, code.id, child.id)}
                  title={`Edit ${child.id}`}
                  aria-label={`Edit ${child.id}`}
                >
                  <EditIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {editing && (
        <ReasonEditorModal
          item={editing.item}
          onClose={() => setEditing(null)}
          onSave={saveReasonEdit}
        />
      )}
    </div>
  );
}

function ReasonEditorModal({ item, onClose, onSave }) {
  const [draft, setDraft] = useState({
    label: item.label || "",
    description: item.description || "",
    color: item.color || "#64748b",
    status: item.status || "Active",
    allowClients: item.allowClients || "Yes",
    adHoc: item.adHoc || "No",
  });
  const hasValidColor = /^#[0-9A-Fa-f]{6}$/.test(draft.color);
  const canSave = draft.label.trim() && hasValidColor;

  useEffect(() => {
    setDraft({
      label: item.label || "",
      description: item.description || "",
      color: item.color || "#64748b",
      status: item.status || "Active",
      allowClients: item.allowClients || "Yes",
      adHoc: item.adHoc || "No",
    });
  }, [item]);

  const setField = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  return (
    <div className="fc-color-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="fc-color-modal fc-reason-editor" role="dialog" aria-modal="true" aria-labelledby="fc-color-title">
        <div className="fc-color-header" style={{ "--fc-code-color": draft.color }}>
          <div className="fc-reason-editor-title-wrap">
            <div id="fc-color-title" className="fc-color-title">
              {draft.label || "Shield Reason"} - {item.id}
            </div>
            <div className="fc-color-sub">Edit the display settings and partner-facing metadata for this reason.</div>
          </div>
          <button type="button" className="fc-modal-close" onClick={onClose} aria-label="Close reason editor">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="fc-color-body">
          <div className="fc-editor-grid">
            <label className="fc-editor-field">
              <span>Shield Code</span>
              <input value={item.id} disabled />
            </label>

            <label className="fc-editor-field">
              <span>Shield Fraud Type</span>
              <input
                value={draft.label}
                onChange={(event) => setField("label", event.target.value)}
                placeholder="Reason title"
              />
            </label>

            <label className="fc-editor-field fc-editor-field-full">
              <span>Fraud Description</span>
              <textarea
                value={draft.description}
                onChange={(event) => setField("description", event.target.value)}
                placeholder="Add a clear partner-facing description for this reason"
                rows={5}
              />
            </label>

            <label className="fc-editor-field">
              <span>Color Picker</span>
              <div className="fc-color-input-row">
                <input
                  type="color"
                  value={hasValidColor ? draft.color : "#64748b"}
                  onChange={(event) => setField("color", event.target.value)}
                  className="fc-color-picker"
                />
                <input
                  value={draft.color}
                  onChange={(event) => setField("color", event.target.value)}
                  maxLength={7}
                  className="fc-color-hex"
                  placeholder="#64748b"
                />
              </div>
            </label>

            <div className="fc-editor-field">
              <span>Status</span>
              <EditorChoiceGroup
                value={draft.status}
                options={["Active", "In Active"]}
                onChange={(value) => setField("status", value)}
              />
            </div>

            <div className="fc-editor-field">
              <span>Allow Clients</span>
              <EditorChoiceGroup
                value={draft.allowClients}
                options={["Yes", "No"]}
                onChange={(value) => setField("allowClients", value)}
              />
            </div>

            <div className="fc-editor-field">
              <span>Ad-hoc Rule</span>
              <EditorChoiceGroup
                value={draft.adHoc}
                options={["Yes", "No"]}
                onChange={(value) => setField("adHoc", value)}
              />
            </div>
          </div>

          <div className="fc-color-presets" aria-label="Color presets">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`fc-color-preset${preset.toLowerCase() === draft.color.toLowerCase() ? " selected" : ""}`}
                style={{ background: preset }}
                onClick={() => setField("color", preset)}
                aria-label={`Use ${preset}`}
              />
            ))}
          </div>
        </div>

        <div className="fc-color-footer">
          <button type="button" className="fc-btn fc-btn-outline" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="fc-btn fc-btn-save"
            onClick={() => canSave && onSave({
              label: draft.label.trim(),
              description: draft.description.trim(),
              color: draft.color,
              status: draft.status,
              allowClients: draft.allowClients,
              adHoc: draft.adHoc,
            })}
            disabled={!canSave}
          >
            <SaveIcon size={14} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function EditorChoiceGroup({ value, options, onChange }) {
  return (
    <div className="fc-editor-choice-group">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`fc-editor-choice${value === option ? " selected" : ""}`}
          onClick={() => onChange(option)}
        >
          <span />
          {option}
        </button>
      ))}
    </div>
  );
}

/* ─── Root ────────────────────────────────────────────────────────────────── */
// ── Partner view: descriptions only ──────────────────────────────────────────
function PartnerDescriptions() {
  const [showDesc, setShowDesc] = useState(false);

  return (
    <div className="fc-root">
      <div className="fc-page-title">Fraud Code Descriptions</div>
      <div className="fc-page-sub">Reference guide for all Shield block reason codes</div>
      <div className="fc-card fc-card-sm">
        <p className="fc-partner-desc">
          View the full reference guide for all Shield fraud detection codes and their descriptions.
        </p>
        <button className="fc-btn fc-btn-indigo" onClick={() => setShowDesc(true)}>
          <FileTextIcon size={14} />
          View Fraud Descriptions
        </button>
      </div>
      {showDesc && <FraudDescriptionsModal onClose={() => setShowDesc(false)} />}
    </div>
  );
}

export default function PageFraudCodes({ role }) {
  const [view, setView] = useState("form");

  if (role === "partner") return <PartnerDescriptions />;

  return view === "form"
    ? <MapForm onViewAll={() => setView("all")} />
    : <ViewAll onBack={() => setView("form")} />;
}
