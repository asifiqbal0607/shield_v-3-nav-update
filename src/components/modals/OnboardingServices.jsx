import { useState, useRef } from "react";
import ModalFooter from "../../layout/ModalFooter";
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, LockIcon, CloseIcon } from "../../components/ui/Icons";
import { userRows } from "../../data/tables";

const T = "#0d9488"; // teal brand

// ── Shared small components ──────────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label className="ob-label">
      {children}
      {required && <span className="ob-required">*</span>}
    </label>
  );
}

function Input({
  label,
  required,
  placeholder,
  hint,
  value,
  onChange,
  disabled,
}) {
  return (
    <div className="ob-field">
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <input
        className={`ob-input${disabled ? " ob-input--disabled" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      {hint && <p className="ob-hint">{hint}</p>}
    </div>
  );
}

function Select({ label, required, options, value, onChange, hint }) {
  return (
    <div className="ob-field">
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div className="ob-select-wrap">
        <select
          className="ob-input ob-select"
          value={value}
          onChange={onChange}
        >
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
        <ChevronDownIcon size={14} className="ob-chevron" />
      </div>
      {hint && <p className="ob-hint">{hint}</p>}
    </div>
  );
}

function YesNo({ label, required, value, onChange, hint }) {
  return (
    <div className="ob-field">
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div className="ob-yesno">
        {["Yes", "No", "I Don't Know"].map((opt) => (
          <button
            key={opt}
            type="button"
            className={`ob-yesno-btn${value === opt ? " ob-yesno-btn--on" : ""}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      {hint && <p className="ob-hint">{hint}</p>}
    </div>
  );
}

function AddMore({ label, onClick }) {
  return (
    <button type="button" className="ob-add-more" onClick={onClick}>
      <PlusIcon size={12} />
      {label}
    </button>
  );
}

function SectionCard({ step, title, subtitle, badge, children }) {
  return (
    <div className="ob-section">
      <div className="ob-section-head">
        <span className="ob-step-badge">{step}</span>
        <div>
          <div className="ob-section-title">
            {title}
            {badge && <span className="ob-optional-badge">{badge}</span>}
          </div>
          {subtitle && <div className="ob-section-sub">{subtitle}</div>}
        </div>
      </div>
      <div className="ob-section-body">{children}</div>
    </div>
  );
}

// ── TIMEZONES / COUNTRIES ────────────────────────────────────────────────────
const TIMEZONES = [
  { value: "", label: "Select timezone..." },
  "UTC-03:00 – Asia/Baghdad",
  "UTC+00:00 – UTC",
  "UTC+05:30 – Asia/Kolkata",
  "UTC+07:00 – Asia/Bangkok",
  "UTC+08:00 – Asia/Singapore",
  "UTC+09:00 – Asia/Tokyo",
  "UTC+01:00 – Europe/London",
  "UTC-05:00 – America/New_York",
];

const COUNTRIES = [
  { value: "", label: "Select country..." },
  "Thailand (TH)",
  "Singapore (SG)",
  "United Kingdom (GB)",
  "United States (US)",
  "Japan (JP)",
  "Germany (DE)",
  "India (IN)",
  "Nigeria (NG)",
  "Kenya (KE)",
  "Tanzania (TZ)",
  "Iraq (IQ)",
  "Senegal (SN)",
  "Sudan (SD)",
];

const MNO_LIST = [
  { value: "", label: "Select..." },
  "TRUE",
  "DTAC",
  "AIS",
  "Zain-IQ",
  "Airtel-NG",
  "MTN-NG",
  "Safaricom-KE",
  "Orange-SN",
  "Vodacom-TZ",
  "Zain-SD",
];

const SHIELD_MODES = ["Standard"];

const SERVICE_TYPES = [
  { value: "", label: "Select..." },
  "API",
  "SDK",
  "Web",
  "Mobile",
  "Hybrid",
];

const HOSTED_BY = [
  { value: "", label: "Select..." },
  "Shield",
  "Operator",
  "Partner",
  "Third Party",
];

const SHIELD_PAGES = [
  { value: "", label: "Select an option" },
  "All Pages",
  "Landing Page Only",
  "Payment Page",
  "Custom",
];

const PROFILES = [
  { value: "", label: "Select a profile..." },
  "Shield Standard Config",
  "Shield Premium Config",
  "Fraud Detection Profile",
  "Geo Resolver Profile",
];

function getDemoCAdminAccount() {
  return userRows.find((u) => u.role === "C-Admins" && u.serviceOnboardingEnabled) || null;
}

function getAssignedClientAccounts(cAdmin = getDemoCAdminAccount()) {
  if (!cAdmin?.assignedClientIds?.length) return [];
  return cAdmin.assignedClientIds
    .map((id) => userRows.find((u) => u.id === id && u.role === "Clients"))
    .filter(Boolean);
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PageOnboardingServices({ setPage, role = "admin", pageContext = null }) {
  const isCAdmin = role === "c-admin";
  const cAdminAccount = getDemoCAdminAccount();
  const assignedClients = getAssignedClientAccounts(cAdminAccount);
  const initialClientId =
    isCAdmin && assignedClients.some((client) => client.id === pageContext?.clientId)
      ? pageContext.clientId
      : isCAdmin
        ? assignedClients[0]?.id || ""
        : "";
  const [selectedClientId, setSelectedClientId] = useState(initialClientId);
  const selectedClient =
    assignedClients.find((client) => client.id === selectedClientId) || null;

  // Step 0: Load Profile
  const [profile, setProfile] = useState("");

  // Step 1: Basic Info
  const [serviceName, setServiceName] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [cspMerchant, setCspMerchant] = useState("");
  const [serviceType, setServiceType] = useState("");

  // Step 2: Geo & Network
  const [country, setCountry] = useState("");
  const [mno, setMno] = useState("");
  const [timezone, setTimezone] = useState("UTC-03:00 – Asia/Baghdad");

  // Step 3: Flow Config
  const [shieldMode, setShieldMode] = useState("Standard");
  const [headerEnriched, setHeaderEnriched] = useState("Yes");
  const [lpRedirection, setLpRedirection] = useState("Yes");
  const [numPages, setNumPages] = useState(2);
  const [pageUrls, setPageUrls] = useState([[""], [""]]);

  // Step 4: Multi-Page
  const [page1Host, setPage1Host] = useState("");
  const [page2Host, setPage2Host] = useState("");
  const [shieldPages, setShieldPages] = useState("");

  // Step 5: Payment (locked until MNO + type chosen)

  // Step 6: IP Details
  const [ips, setIps] = useState(["0.0.0.0"]);
  const [newIp, setNewIp] = useState("");

  // Step 7: Advanced Tracking
  const [urlParams, setUrlParams] = useState([""]);
  const [referrers, setReferrers] = useState([""]);
  const [apiVars, setApiVars] = useState([""]);

  // Step 8: Summary
  const [summaryConfirmed, setSummaryConfirmed] = useState(false);

  function addPageUrl(pageIdx) {
    setPageUrls((prev) => {
      const next = prev.map((arr) => [...arr]);
      next[pageIdx] = [...next[pageIdx], ""];
      return next;
    });
  }
  function updatePageUrl(pageIdx, urlIdx, val) {
    setPageUrls((prev) => {
      const next = prev.map((arr) => [...arr]);
      next[pageIdx][urlIdx] = val;
      return next;
    });
  }

  const paymentLocked = !mno || !serviceType;

  return (
    <div className="ob-wrap">
      {/* ── Header ── */}
      <div className="ob-hero">
        <div className="ob-breadcrumb">
          <span
            className="ob-breadcrumb-link"
            onClick={() => setPage && setPage("services")}
          >
            MCP Shield
          </span>
          <ChevronRightIcon size={12} />
          <span
            className="ob-breadcrumb-link"
            onClick={() => setPage && setPage("services")}
          >
            Partner Portal
          </span>
          <ChevronRightIcon size={12} />
          <span>New Service Onboarding</span>
        </div>
        <h1 className="ob-hero-title">New Service Onboarding</h1>
        <p className="ob-hero-sub">
          Configure your service details using the form below.{" "}
          <a className="ob-hero-link" href="#">
            User guide
          </a>
        </p>
      </div>

      {/* ── Steps ── */}
      <div className="ob-body">
        {/* 0 — Load Profile */}
        <div className="ob-section ob-section--load">
          <div className="ob-section-head">
            <span className="ob-step-badge ob-step-badge--alt">⚡</span>
            <div>
              <div className="ob-section-title">
                Load Service Flow Profile
                <span className="ob-optional-badge">Optional</span>
              </div>
            </div>
          </div>
          <div className="ob-section-body">
            <Select
              label="Select a Profile"
              options={PROFILES}
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              hint="Select a saved profile to pre-fill form fields with common configuration patterns."
            />
          </div>
        </div>

        {isCAdmin && (
          <SectionCard
            step="A"
            title="Client Account Scope"
            subtitle="Choose the assigned client account that will own this service"
          >
            <Select
              label="Client Account"
              required
              options={[
                { value: "", label: "Select assigned client..." },
                ...assignedClients.map((client) => ({
                  value: client.id,
                  label: `${client.name} (${client.region})`,
                })),
              ]}
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            />
          </SectionCard>
        )}

        {/* 1 — Basic Information */}
        <SectionCard
          step="1"
          title="Basic Information"
          subtitle="Core identifiers for your service"
        >
          <Input
            label="Service Name"
            required
            placeholder="e.g. GameZone UK MTN · Newscape NG Airtel"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            hint="Choose a descriptive name that identifies this specific service. If you have multiple services, use clear naming conventions."
          />
          <div className="ob-grid-2">
            <Input
              label="Short Code"
              required
              placeholder="Enter short code"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              hint="Enter a unique short code identifier for this service."
            />
            <div className="ob-field">
              <FieldLabel required>CSP/Merchant Name</FieldLabel>
              <div className="ob-input-btn-row">
                <div className="ob-select-wrap ob-flex1">
                  <select
                    className="ob-input ob-select"
                    value={cspMerchant}
                    onChange={(e) => setCspMerchant(e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option>True Digital</option>
                    <option>GVI Services</option>
                    <option>Teleinfotech</option>
                    <option>Zain</option>
                  </select>
                  <ChevronDownIcon size={14} className="ob-chevron" />
                </div>
                <button className="ob-icon-btn" title="Add new CSP">
                  <PlusIcon size={14} />
                </button>
              </div>
              <p className="ob-hint">
                Select the Content Service Provider or Merchant who owns this
                service.
              </p>
            </div>
          </div>
          <Select
            label="Type of Service"
            required
            options={SERVICE_TYPES}
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            hint="Categorise your service type. This helps with analytics and benchmarking."
          />
        </SectionCard>

        {/* 2 — Geo & Network */}
        <SectionCard
          step="2"
          title="Geographic & Network Configuration"
          subtitle="Location and carrier settings"
        >
          <div className="ob-grid-2">
            <div className="ob-field">
              <FieldLabel required>Country</FieldLabel>
              <div className="ob-select-wrap">
                <select
                  className="ob-input ob-select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.value ?? c} value={c.value ?? c}>
                      {c.label ?? c}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon size={14} className="ob-chevron" />
              </div>
              <p className="ob-hint">
                Select the country where the service operates. This determines
                available mobile network operators.
              </p>
            </div>
            <div className="ob-field">
              <FieldLabel required>Mobile Network Operator (MNO)</FieldLabel>
              <div className="ob-input-btn-row">
                <div className="ob-select-wrap ob-flex1">
                  <select
                    className="ob-input ob-select"
                    value={mno}
                    onChange={(e) => setMno(e.target.value)}
                  >
                    {MNO_LIST.map((m) => (
                      <option key={m.value ?? m} value={m.value ?? m}>
                        {m.label ?? m}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon size={14} className="ob-chevron" />
                </div>
                <button className="ob-icon-btn" title="Add custom MNO">
                  <PlusIcon size={14} />
                </button>
              </div>
              <p className="ob-hint">
                Select the mobile network operator for this service.
              </p>
            </div>
            <Select
              label="Time Zone"
              required
              options={TIMEZONES}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              hint="Select the timezone for your service. This is used for reporting and analytics."
            />
          </div>
        </SectionCard>

        {/* 3 — Service Flow Configuration */}
        <SectionCard
          step="3"
          title="Service Flow Configuration"
          subtitle="Shield mode and page flow settings"
        >
          <div className="ob-field">
            <FieldLabel required>Shield Mode</FieldLabel>
            <div className="ob-shield-tabs">
              {SHIELD_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`ob-shield-tab${shieldMode === m ? " ob-shield-tab--on" : ""}`}
                  onClick={() => setShieldMode(m)}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="ob-hint">
              Select the Shield mode. Standard will prompt your visitor from
              fraud. Monitor will only track but not block suspicious activity.
            </p>
          </div>

          <div className="ob-grid-2 ob-mt16">
            <YesNo
              label="Header Enriched Flow"
              required
              value={headerEnriched}
              onChange={setHeaderEnriched}
              hint="This indicates whether the mobile operator injects the subscriber's phone number (MSISDN) via HTTP headers."
            />
            <YesNo
              label="LP Redirection"
              required
              value={lpRedirection}
              onChange={setLpRedirection}
              hint="Specifies whether your landing page implements redirection rules for traffic routing."
            />
          </div>

          <div className="ob-field ob-mt16">
            <FieldLabel required>Number of HTML Pages in Flow</FieldLabel>
            <div className="ob-num-row">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`ob-num-btn${numPages === n ? " ob-num-btn--on" : ""}`}
                  onClick={() => {
                    setNumPages(n);
                    setPageUrls(
                      Array.from({ length: n }, (_, i) => pageUrls[i] || [""]),
                    );
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="ob-hint">
              Count the number of web pages (HTML documents) in your
              subscription flow.
            </p>
          </div>

          {pageUrls.slice(0, numPages).map((urls, pi) => (
            <div key={pi} className="ob-page-block">
              <div className="ob-page-block-title">Page {pi + 1} URL(s)</div>
              {urls.map((url, ui) => (
                <input
                  key={ui}
                  className="ob-input ob-mb6"
                  placeholder={`Enter a landing page URL for this page`}
                  value={url}
                  onChange={(e) => updatePageUrl(pi, ui, e.target.value)}
                />
              ))}
              <AddMore
                label={`+ Add Another URL for Page ${pi + 1}`}
                onClick={() => addPageUrl(pi)}
              />
            </div>
          ))}
        </SectionCard>

        {/* 4 — Multi-Page Configuration */}
        <SectionCard
          step="4"
          title="Multi-Page Configuration"
          subtitle="Hosting and Shield placement across pages"
        >
          <div className="ob-grid-2">
            <Select
              label="Page 1 Hosted By"
              required
              options={HOSTED_BY}
              value={page1Host}
              onChange={(e) => setPage1Host(e.target.value)}
              hint="Specify who hosts/maintains each page in your flow."
            />
            <Select
              label="Page 2 Hosted By"
              required
              options={HOSTED_BY}
              value={page2Host}
              onChange={(e) => setPage2Host(e.target.value)}
              hint="Specify who hosts/maintains each page in your flow."
            />
          </div>
          <Select
            label="Page(s) Where Shield is Implemented"
            required
            options={SHIELD_PAGES}
            value={shieldPages}
            onChange={(e) => setShieldPages(e.target.value)}
            hint="Select all pages where the Shield JavaScript snippet is deployed. For maximum protection, we recommend deploying Shield on all pages."
          />
        </SectionCard>

        {/* 5 — Payment Flows */}
        <SectionCard
          step="5"
          title="Payment Flows"
          subtitle="Configure payment settings"
        >
          {paymentLocked ? (
            <div className="ob-locked-notice">
              <LockIcon size={16} />
              <div>
                <div className="ob-locked-title">Payment Flow Options</div>
                <div className="ob-locked-sub">
                  Payment flow configuration will be available after selecting
                  your MNO and service type above.
                </div>
              </div>
            </div>
          ) : (
            <div className="ob-grid-2">
              <YesNo
                label="HE Payment Flow"
                required
                value="Yes"
                onChange={() => {}}
                hint="Header Enrichment based payment flow."
              />
              <YesNo
                label="WiFi Payment Flow"
                required
                value="No"
                onChange={() => {}}
                hint="WiFi-based payment flow configuration."
              />
            </div>
          )}
        </SectionCard>

        {/* 6 — IP Details */}
        <SectionCard
          step="6"
          title="IP Details"
          subtitle="Your IPs to use with the API"
        >
          <p className="ob-hint ob-mb12">
            Your Server IP. We will use it to get response from Shield API.
          </p>
          <div className="ob-ip-list">
            {ips.map((ip, i) => (
              <div key={i} className="ob-ip-row">
                <span className="ob-ip-val">{ip}</span>
                <button
                  className="ob-ip-remove"
                  onClick={() => setIps((p) => p.filter((_, idx) => idx !== i))}
                >
                  <CloseIcon size={11} />
                </button>
              </div>
            ))}
          </div>
          <div className="ob-ip-add-row">
            <input
              className="ob-input"
              placeholder="Enter IP address"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newIp.trim()) {
                  setIps((p) => [...p, newIp.trim()]);
                  setNewIp("");
                }
              }}
            />
            <button
              className="ob-add-ip-btn"
              onClick={() => {
                if (newIp.trim()) {
                  setIps((p) => [...p, newIp.trim()]);
                  setNewIp("");
                }
              }}
            >
              <PlusIcon size={13} />
              Add IP
            </button>
          </div>
        </SectionCard>

        {/* 7 — Advanced Tracking */}
        <SectionCard
          step="7"
          title="Advanced Tracking"
          badge="Optional"
          subtitle="Custom parameters, referrers and API variables"
        >
          {/* URL Params */}
          <div className="ob-tracking-block">
            <div className="ob-tracking-title">
              Custom URL Parameters to Track
            </div>
            {urlParams.map((p, i) => (
              <input
                key={i}
                className="ob-input ob-mb6"
                placeholder="e.g. revenue_id"
                value={p}
                onChange={(e) =>
                  setUrlParams((prev) =>
                    prev.map((v, idx) => (idx === i ? e.target.value : v)),
                  )
                }
              />
            ))}
            <p className="ob-hint">
              These URL parameters are passed to Shield and will be visible in
              your dashboard.
            </p>
            <AddMore
              label="+ Add Parameter"
              onClick={() => setUrlParams((p) => [...p, ""])}
            />
          </div>

          {/* Referrers */}
          <div className="ob-tracking-block">
            <div className="ob-tracking-title">
              Custom Referrers (Referrer URL Parameters)
            </div>
            {referrers.map((r, i) => (
              <input
                key={i}
                className="ob-input ob-mb6"
                placeholder="e.g. ref_source"
                value={r}
                onChange={(e) =>
                  setReferrers((prev) =>
                    prev.map((v, idx) => (idx === i ? e.target.value : v)),
                  )
                }
              />
            ))}
            <p className="ob-hint">
              These come from the referrer URL. Note: Due to browser privacy
              protections, these are typically only available for same-origin
              navigation.
            </p>
            <AddMore
              label="+ Add Referrer"
              onClick={() => setReferrers((r) => [...r, ""])}
            />
          </div>

          {/* Shield API Variables */}
          <div className="ob-tracking-block">
            <div className="ob-tracking-title">Shield API Variables</div>
            {apiVars.map((v, i) => (
              <input
                key={i}
                className="ob-input ob-mb6"
                placeholder="e.g. user_attribute_age"
                value={v}
                onChange={(e) =>
                  setApiVars((prev) =>
                    prev.map((val, idx) => (idx === i ? e.target.value : val)),
                  )
                }
              />
            ))}
            <p className="ob-hint">
              These variables are passed via the Shield API integration. Shield
              will automatically extract these variables and create separate
              solution profiles for each.
            </p>
            <AddMore
              label="+ Add Variable"
              onClick={() => setApiVars((v) => [...v, ""])}
            />
          </div>
        </SectionCard>

        {/* 8 — Service Summary */}
        <SectionCard
          step="8"
          title="Service Summary"
          subtitle="Quick overview — review before submitting"
        >
          <div className="ob-summary-grid">
            {[
              ...(isCAdmin ? [["Client Account", selectedClient?.name || "—"]] : []),
              ["Service Name", serviceName || "—"],
              ["Short Code", shortCode || "—"],
              ["CSP/Merchant", cspMerchant || "—"],
              ["Type of Service", serviceType || "—"],
              ["Country", country || "—"],
              ["MNO", mno || "—"],
              ["Timezone", timezone || "—"],
              ["Shield Mode", shieldMode],
              ["Header Enriched Flow", headerEnriched],
              ["LP Redirection", lpRedirection],
              ["Pages in Flow", numPages],
              ["Page 1 Hosted By", page1Host || "—"],
              ["Page 2 Hosted By", page2Host || "—"],
              ["Shield Pages", shieldPages || "—"],
              ["IPs", ips.join(", ") || "—"],
            ].map(([k, v]) => (
              <div key={k} className="ob-summary-row">
                <span className="ob-summary-key">{k}</span>
                <span className="ob-summary-val">{v}</span>
              </div>
            ))}
          </div>
          <p className="ob-hint ob-mt14">
            This section will auto-generate a description of the service
            configuration once you've completed the form.
          </p>
          <label className="ob-confirm-check">
            <input
              type="checkbox"
              checked={summaryConfirmed}
              onChange={(e) => setSummaryConfirmed(e.target.checked)}
            />
            <span>
              I confirm that the service summary above accurately describes my
              service configuration and I understand that Shield will enforce
              these parameters for fraud detection.
            </span>
          </label>
        </SectionCard>

        {/* ── Footer Actions ── */}
        <ModalFooter
          variant="page"
          cancelLabel="← Cancel"
          saveLabel="Save Service →"
          showProfile
          saveDisabled={!summaryConfirmed || (isCAdmin && !selectedClient)}
          onCancel={() => setPage && setPage("services")}
        />
      </div>
    </div>
  );
}
