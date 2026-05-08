import { useState, useEffect, useCallback } from "react";
import ModalFooter from "../../layout/ModalFooter";

// ════════════════════════════════════════════════════════════════════════════
//  PASSWORD GENERATOR  (shared, used by both Admin + Partner forms)
// ════════════════════════════════════════════════════════════════════════════
const PG_CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  special: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function pgGenerate(length, options, custom) {
  let charset = "";
  if (options.uppercase) charset += PG_CHAR_SETS.uppercase;
  if (options.lowercase) charset += PG_CHAR_SETS.lowercase;
  if (options.numbers) charset += PG_CHAR_SETS.numbers;
  if (options.special) charset += PG_CHAR_SETS.special;
  if (custom) charset += custom;
  if (!charset) return "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((v) => charset[v % charset.length])
    .join("");
}

function PasswordGeneratorModal({ onClose, onUse }) {
  const [length, setLength] = useState(25);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: true,
  });
  const [custom, setCustom] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const regen = useCallback(
    (len = length, opts = options, cust = useCustom ? custom : "") => {
      setPassword(pgGenerate(len, opts, cust));
      setCopied(false);
    },
    [length, options, custom, useCustom],
  );

  useEffect(() => {
    regen();
  }, []);

  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const toggleOpt = (key) => {
    const next = { ...options, [key]: !options[key] };
    if (!Object.values(next).some(Boolean) && !useCustom) return;
    setOptions(next);
    regen(length, next, useCustom ? custom : "");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const OPT_BUTTONS = [
    { key: "uppercase", label: "Uppercase Letters" },
    { key: "lowercase", label: "Lowercase Letters" },
    { key: "numbers", label: "Numbers" },
    { key: "special", label: "Special Characters" },
  ];

  return (
    <>
      <div className="pg-overlay" onClick={onClose} />
      <div className="obf-pg-modal">
        <div className="obf-pg-header">
          <div>
            <div className="obf-pg-title">Password Generator</div>
            <div className="obf-pg-sub">
              Customize and use a secure password
            </div>
          </div>
          <button type="button" onClick={onClose} className="obf-close-btn">
            ✕
          </button>
        </div>

        <div className="obf-pg-body">
          <div className="obf-pg-output-wrap">
            <span className="obf-pg-output">{password || "—"}</span>
            <button
              type="button"
              className="obf-pg-copy-btn"
              onClick={handleCopy}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>

          <div className="obf-field">
            <div className="obf-label-row">
              <label className="obf-label">Length</label>
              <span className="obf-pg-length-val">{length}</span>
            </div>
            <input
              type="range"
              min={4}
              max={64}
              value={length}
              className="obf-pg-range"
              onChange={(e) => {
                const v = Number(e.target.value);
                setLength(v);
                regen(v, options, useCustom ? custom : "");
              }}
            />
          </div>

          <div className="obf-pg-opts-grid">
            {OPT_BUTTONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleOpt(key)}
                className={`obf-pg-opt-btn${options[key] ? " obf-pg-opt-btn--on" : ""}`}
              >
                <span className="obf-pg-check">{options[key] ? "✓" : ""}</span>
                {label.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="obf-pg-custom-row">
            <input
              type="checkbox"
              id="pg-custom-cb"
              checked={useCustom}
              className="obf-pg-checkbox"
              onChange={(e) => {
                setUseCustom(e.target.checked);
                regen(length, options, e.target.checked ? custom : "");
              }}
            />
            <label htmlFor="pg-custom-cb" className="obf-pg-custom-label">
              CUSTOM
            </label>
            <input
              type="text"
              value={custom}
              disabled={!useCustom}
              placeholder="Enter custom characters..."
              className="obf-pg-custom-input"
              onChange={(e) => {
                setCustom(e.target.value);
                regen(length, options, e.target.value);
              }}
            />
          </div>
        </div>

        <div className="obf-pg-footer">
          <button
            type="button"
            className="obf-pg-regen-btn"
            onClick={() => regen()}
          >
            ↻ Regenerate
          </button>
          <div className="obf-pg-footer-right">
            <button
              type="button"
              className="obf-pg-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="obf-pg-use-btn"
              onClick={() => {
                onUse(password);
                onClose();
              }}
            >
              Use This Password
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  SHARED PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════
function Section({ title, icon, children }) {
  return (
    <div className="obf-section">
      {title && (
        <div className="obf-section-header">
          {icon && <span className="obf-section-icon">{icon}</span>}
          <span className="obf-section-title">{title}</span>
        </div>
      )}
      <div className="obf-section-body">{children}</div>
    </div>
  );
}

function Field({ children, last }) {
  return (
    <div className={`obf-field${last ? " obf-field--last" : ""}`}>
      {children}
    </div>
  );
}

function Label({ children, required, hint }) {
  return (
    <label className="obf-label">
      {children}
      {required && <span className="obf-label-required">*</span>}
      {hint && <span className="obf-label-hint">— {hint}</span>}
    </label>
  );
}

function Input({
  placeholder,
  type = "text",
  value,
  onChange,
  className = "",
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`obf-input${className ? ` ${className}` : ""}`}
    />
  );
}

function Select({ placeholder, options = [], value, onChange }) {
  return (
    <div className="obf-select-wrap">
      <select value={value ?? ""} onChange={onChange} className="obf-select">
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span className="obf-select-arrow">▼</span>
    </div>
  );
}

function Textarea({ placeholder, value, onChange, rows = 3 }) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className="obf-textarea"
    />
  );
}

function YesNo({ name, value, onChange }) {
  return (
    <div className="obf-yesno">
      {["Yes", "No"].map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`obf-yesno-btn${o === "No" ? " obf-yesno-btn--no" : ""}${
            value === o
              ? o === "Yes"
                ? " obf-yesno-btn--active-yes"
                : " obf-yesno-btn--active-no"
              : ""
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Pill({ label, checked, radioName, onChange, variant = "teal" }) {
  return (
    <label className={`obf-pill${checked ? ` obf-pill--${variant}-on` : ""}`}>
      <input
        type="radio"
        name={radioName}
        value={label}
        checked={checked}
        onChange={onChange}
      />
      <span className="obf-pill-dot" />
      {label}
    </label>
  );
}

function LabelRow({ children }) {
  return <div className="obf-label-row">{children}</div>;
}

function AddMoreBtn({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="obf-add-btn">
      + Add More
    </button>
  );
}

function RemoveBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="obf-remove-btn"
      title="Remove"
    >
      ✕
    </button>
  );
}

// Shared password field with show/hide toggle
function PasswordField({ value, onChange, onOpenGenerator }) {
  const [showPw, setShowPw] = useState(false);
  // When generator fills the value, keep it visible briefly then hide
  useEffect(() => {
    if (value) setShowPw(false);
  }, []);
  return (
    <div className="obf-pw-wrap">
      <Input
        placeholder="Password"
        type={showPw ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="obf-input--pw"
      />
      <button
        type="button"
        className="obf-pw-toggle"
        onClick={() => setShowPw((s) => !s)}
      >
        {showPw ? "🙈" : "👁"}
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  DATA
// ════════════════════════════════════════════════════════════════════════════
const ADMIN_PERMISSIONS = [
  {
    key: "allowedTrafficCheck",
    label: "Allowed Traffic Check",
    default: "Yes",
  },
  { key: "allowedSubAccount", label: "Allowed Sub Account", default: "No" },
  { key: "enableVTXProcessing", label: "Enable VTX Processing", default: "No" },
  { key: "allowVerifyTrx", label: "Allow Verify Trx", default: "No" },
  { key: "allowRedirectFlow", label: "Allow Redirect Flow", default: "Yes" },
  { key: "allowPaymentManager", label: "Allow Payment Manager", default: "No" },
  { key: "allowMsisdnSearch", label: "Allow Msisdn Search", default: "No" },
  {
    key: "allowPerformanceMatrix",
    label: "Allow Performance Matrix",
    default: "Yes",
  },
  { key: "dualBlockAPI", label: "Dual Block API", default: "No" },
  { key: "forceClear", label: "Force Clear", default: "No" },
];

const ADMIN_ACCOUNT_TYPES = [
  "Supper Client",
  "Client",
  "Admin",
  "C - Admin",
  "Publisher",
  "Sub Account",
  "Operation Admin",
  "Client Partner",
];

const PARTNER_ACCOUNT_TYPES = [
  "SP Account Stats",
  "SP Account Details",
  "Sub Client",
  "Stats View",
];

const TIMEZONES = [
  "UTC-12:00",
  "UTC-11:00",
  "UTC-10:00",
  "UTC-09:00",
  "UTC-08:00",
  "UTC-07:00",
  "UTC-06:00",
  "UTC-05:00",
  "UTC-04:00",
  "UTC-03:00",
  "UTC-02:00",
  "UTC-01:00",
  "UTC+00:00",
  "UTC+01:00",
  "UTC+02:00",
  "UTC+03:00",
  "UTC+04:00",
  "UTC+05:00",
  "UTC+05:30",
  "UTC+06:00",
  "UTC+07:00",
  "UTC+08:00",
  "UTC+09:00",
  "UTC+10:00",
  "UTC+11:00",
  "UTC+12:00",
];

const CLIENT_OPTIONS = ["Client A", "Client B", "Client C"];
const SERVICE_OPTIONS = ["Service Alpha", "Service Beta", "Service Gamma"];
const NETWORK_OPTIONS = ["Network A", "Network B", "Network C"];
const COUNTRY_OPTIONS = ["USA", "UK", "Germany", "France", "UAE", "Singapore"];
const C_ADMIN_OPTIONS = ["C-Admin Alpha", "C-Admin Beta", "C-Admin Gamma"];

// ════════════════════════════════════════════════════════════════════════════
//  SHARED HEADER  (used by both forms)
// ════════════════════════════════════════════════════════════════════════════
function FormHeader({ title, subtitle, onClose, onOpenGenerator = null }) {
  return (
    <div className="obf-header">
      <div className="obf-header-left">
        <div className="obf-header-icon">👤</div>
        <div>
          <div className="obf-header-title">{title}</div>
          <div className="obf-header-sub">{subtitle}</div>
        </div>
      </div>
      <div className="obf-header-actions">
        {onOpenGenerator && (
          <button
            type="button"
            className="obf-pg-trigger-btn"
            onClick={onOpenGenerator}
          >
            🔑 Password Generator
          </button>
        )}
        <button
          type="button"
          className="obf-close-btn"
          onClick={onClose}
          title="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  ADMIN FORM
// ════════════════════════════════════════════════════════════════════════════
function AdminForm({ onClose, setPage, onAdd, clientAccounts = [] }) {
  const [name, setName] = useState("");
  const [emails, setEmails] = useState([""]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [timezone, setTimezone] = useState("");
  const [accountType, setAccountType] = useState("Supper Client");
  const [mode, setMode] = useState("Trial");
  const [perms, setPerms] = useState(
    Object.fromEntries(ADMIN_PERMISSIONS.map((p) => [p.key, p.default])),
  );
  const [cAdmin, setCAdmin] = useState("");
  const [client, setClient] = useState("");
  const [services, setServices] = useState([]);
  const [mirroredAccount, setMirroredAccount] = useState(false);
  const [parentClientOpt, setParentClientOpt] = useState("");
  const [subServices, setSubServices] = useState([]);
  const [publisherClients, setPublisherClients] = useState([]);
  const [assignedNet, setAssignedNet] = useState("");
  const [countries, setCountries] = useState("");
  const [adHocRule, setAdHocRule] = useState("No");
  const [ips, setIps] = useState([""]);
  const [ipRanges, setIpRanges] = useState([""]);
  const [accountPriv, setAccountPriv] = useState("All");
  const [showPgModal, setShowPgModal] = useState(false);

  const handleClose = () => {
    if (onClose) onClose();
    else if (setPage) setPage("users");
  };

  const handleSave = () => {
    if (!onAdd) return handleClose();

    const primaryEmail = emails.map((e) => e.trim()).find(Boolean) || "";

    const roleLabel =
      accountType === "Supper Client"
        ? "Supper Clients"
        : accountType === "Client"
          ? "Clients"
          : accountType === "Admin"
            ? "Admins"
            : accountType === "C - Admin"
              ? "C-Admins"
              : accountType === "Publisher"
                ? "Publisher"
                : accountType === "Sub Account"
                  ? "Sub Account"
                  : accountType === "Operation Admin"
                    ? "Operations"
                    : accountType === "Client Partner"
                      ? "Client Partner"
                      : "Clients";

    const newUser = {
      id: `USR-${Date.now()}`,
      name: (name || username || "New User").trim(),
      email: primaryEmail || `${(username || "user").trim()}@shield.io`,
      role: roleLabel,
      region: countries || "ZA",
      lastLogin: "Never",
      sessions: 0,
      status: "active",
    };

    if ((roleLabel === "Clients" || roleLabel === "C-Admins") && mirroredAccount) {
      newUser.isMirrored = true;
    }

    if (roleLabel === "Clients") {
      newUser.services = services;
    }

    if (roleLabel === "Sub Account") {
      newUser.parentClientId = parentClientId || "";
      newUser.services = subServices;
    }

    if (roleLabel === "Publisher") {
      newUser.assignedClientIds = publisherClients.map(parseClientId).filter(Boolean);
    }

    onAdd(newUser);
    handleClose();
  };

  const addEmail = () => setEmails((p) => [...p, ""]);
  const updateEmail = (i, v) =>
    setEmails((p) => p.map((e, idx) => (idx === i ? v : e)));
  const removeEmail = (i) => setEmails((p) => p.filter((_, idx) => idx !== i));

  const addIp = () => setIps((p) => [...p, ""]);
  const updateIp = (i, v) =>
    setIps((p) => p.map((x, idx) => (idx === i ? v : x)));
  const removeIp = (i) => setIps((p) => p.filter((_, idx) => idx !== i));

  const addIpRange = () => setIpRanges((p) => [...p, ""]);
  const updateIpRange = (i, v) =>
    setIpRanges((p) => p.map((x, idx) => (idx === i ? v : x)));
  const removeIpRange = (i) =>
    setIpRanges((p) => p.filter((_, idx) => idx !== i));

  const isSupperClient = accountType === "Supper Client";
  const isClient = accountType === "Client";
  const isAdmin = accountType === "Admin";
  const isCAdmin = accountType === "C - Admin";
  const isPublisher = accountType === "Publisher";
  const isSubAccount = accountType === "Sub Account";
  const isClientPartner = accountType === "Client Partner";

  const CLIENT_ACCOUNT_OPTIONS =
    clientAccounts.length > 0
      ? clientAccounts.map((u) => `${u.id} - ${u.name}`)
      : CLIENT_OPTIONS;

  const parseClientId = (opt) => (opt || "").split(" - ")[0];
  const parentClientId = parseClientId(parentClientOpt);
  const parentClient =
    clientAccounts.find((u) => u.id === parentClientId) ?? null;
  const parentServiceOptions =
    parentClient?.services?.length ? parentClient.services : SERVICE_OPTIONS;

  useEffect(() => {
    // Mirror only applies to Client / C-Admin account types.
    if (!(isClient || isCAdmin)) setMirroredAccount(false);
  }, [isClient, isCAdmin]);

  useEffect(() => {
    // Keep sub-account services limited to selected parent client.
    setSubServices((prev) => prev.filter((s) => parentServiceOptions.includes(s)));
  }, [parentClientOpt]);

  const showAdHocRule = isClient || isClientPartner;
  const showIPs = isClient;
  const showIPRanges = isClient;
  const showClientSingle = isAdmin || isCAdmin;
  const showPublisherClients = isPublisher;
  const showServices = isAdmin || isCAdmin || isClientPartner || isClient;
  const showNetworks = isAdmin || isCAdmin || isClientPartner;
  const showCountries = isAdmin || isPublisher || isClientPartner;
  const showCAdmins = isSupperClient || isPublisher;
  const showAccountPriv = isClient || isAdmin || isClientPartner;
  const showMirroredToggle = isClient || isCAdmin;

  const saveDisabled =
    !name.trim() ||
    emails.map((e) => e.trim()).every((e) => !e) ||
    (isSubAccount && !parentClientId);

  return (
    <>
      <FormHeader
        title="Add New User"
        subtitle="Fill in the details to create a new user account"
        onClose={handleClose}
        onOpenGenerator={() => setShowPgModal(true)}
      />

      {showPgModal && (
        <PasswordGeneratorModal
          onClose={() => setShowPgModal(false)}
          onUse={(pw) => setPassword(pw)}
        />
      )}

      <div className="obf-body">
        {/* ── Basic Information ── */}
        <Section title="Basic Information" icon="📋">
          <Field>
            <Label required>Full Name</Label>
            <Input
              placeholder="e.g. John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field>
            <LabelRow>
              <Label required>Email Address</Label>
              <AddMoreBtn onClick={addEmail} />
            </LabelRow>
            {emails.map((email, i) => (
              <div
                key={i}
                className={`obf-entry-row${i === emails.length - 1 ? " obf-entry-row--last" : ""}`}
              >
                <div className="obf-entry-input">
                  <Input
                    placeholder="user@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(i, e.target.value)}
                  />
                </div>
                {emails.length > 1 && (
                  <RemoveBtn onClick={() => removeEmail(i)} />
                )}
              </div>
            ))}
          </Field>

          <div className="obf-grid-2">
            <Field>
              <Label required>Username</Label>
              <Input
                placeholder="e.g. john_smith"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field>
            <Field>
              <Label required>Password</Label>
              <PasswordField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          </div>

          <Field last>
            <Label hint="optional">Description</Label>
            <Textarea
              placeholder="Brief description of this user account..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </Section>

        {/* ── Regional Settings ── */}
        <Section title="Regional Settings" icon="🌐">
          <Field last>
            <Label>Time Zone</Label>
            <Select
              placeholder="Select a timezone"
              options={TIMEZONES}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </Field>
        </Section>

        {/* ── Permissions ── */}
        <Section title="Permissions" icon="🔐">
          <div className="obf-perms-grid">
            {ADMIN_PERMISSIONS.map((p) => {
              const isYes = perms[p.key] === "Yes";
              return (
                <div
                  key={p.key}
                  className={`obf-perm-card${isYes ? " obf-perm-card--on" : ""}`}
                >
                  <span
                    className={`obf-perm-label${isYes ? " obf-perm-label--on" : ""}`}
                  >
                    {p.label}
                  </span>
                  <YesNo
                    name={p.key}
                    value={perms[p.key]}
                    onChange={(v) =>
                      setPerms((prev) => ({ ...prev, [p.key]: v }))
                    }
                  />
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Account Configuration ── */}
        <Section title="Account Configuration" icon="⚙️">
          <Field>
            <Label>Account Type</Label>
            <div className="obf-pill-row">
              {ADMIN_ACCOUNT_TYPES.map((t) => (
                <Pill
                  key={t}
                  label={t}
                  checked={accountType === t}
                  radioName="adminAccountType"
                  onChange={() => setAccountType(t)}
                  variant="teal"
                />
              ))}
            </div>
          </Field>

          <div className="obf-inner-divider" />

          {showAdHocRule && (
            <Field>
              <Label>Apply Ad-hoc Rule</Label>
              <YesNo
                name="adHocRule"
                value={adHocRule}
                onChange={setAdHocRule}
              />
            </Field>
          )}

          {showIPs && (
            <Field>
              <LabelRow>
                <Label required>Your IP's To Use API</Label>
                <AddMoreBtn onClick={addIp} />
              </LabelRow>
              {ips.map((val, i) => (
                <div
                  key={i}
                  className={`obf-entry-row${i === ips.length - 1 ? " obf-entry-row--last" : ""}`}
                >
                  <div className="obf-entry-input">
                    <Input
                      placeholder="e.g. 192.168.1.1"
                      value={val}
                      onChange={(e) => updateIp(i, e.target.value)}
                    />
                  </div>
                  {ips.length > 1 && <RemoveBtn onClick={() => removeIp(i)} />}
                </div>
              ))}
              <p className="obf-hint">
                Your Server IP you will use to get response from (Block) API.
              </p>
            </Field>
          )}

          {showIPRanges && (
            <Field>
              <LabelRow>
                <Label required>Your IP's Range To Whitelist API</Label>
                <AddMoreBtn onClick={addIpRange} />
              </LabelRow>
              {ipRanges.map((val, i) => (
                <div
                  key={i}
                  className={`obf-entry-row${i === ipRanges.length - 1 ? " obf-entry-row--last" : ""}`}
                >
                  <div className="obf-entry-input">
                    <Input
                      placeholder="e.g. 192.168.1.0/24"
                      value={val}
                      onChange={(e) => updateIpRange(i, e.target.value)}
                    />
                  </div>
                  {ipRanges.length > 1 && (
                    <RemoveBtn onClick={() => removeIpRange(i)} />
                  )}
                </div>
              ))}
            </Field>
          )}

          {showMirroredToggle && (
            <Field>
              <Label>Mirrored Account</Label>
              <div className="obf-check-row">
                <input
                  type="checkbox"
                  id="obf-mirrored-cb"
                  checked={mirroredAccount}
                  onChange={(e) => setMirroredAccount(e.target.checked)}
                />
                <label htmlFor="obf-mirrored-cb" className="obf-check-label">
                  Mark this account as mirrored
                </label>
              </div>
            </Field>
          )}

          {isSubAccount && (
            <Field>
              <Label required>Parent Client Account</Label>
              <Select
                placeholder="Select parent client"
                options={CLIENT_ACCOUNT_OPTIONS}
                value={parentClientOpt}
                onChange={(e) => setParentClientOpt(e.target.value)}
              />
            </Field>
          )}

          {isSubAccount && (
            <Field>
              <LabelRow>
                <Label>Services (from parent)</Label>
                <button
                  type="button"
                  className="obf-link-btn"
                  onClick={() =>
                    setSubServices(
                      subServices.length === parentServiceOptions.length
                        ? []
                        : [...parentServiceOptions],
                    )
                  }
                >
                  {subServices.length === parentServiceOptions.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </LabelRow>
              <Select
                placeholder="Select Service"
                options={parentServiceOptions}
                value={subServices[subServices.length - 1] ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setSubServices((prev) =>
                    prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                  );
                }}
              />
            </Field>
          )}

          {showPublisherClients && (
            <Field>
              <LabelRow>
                <Label>Assigned Clients</Label>
                <button
                  type="button"
                  className="obf-link-btn"
                  onClick={() =>
                    setPublisherClients(
                      publisherClients.length === CLIENT_ACCOUNT_OPTIONS.length
                        ? []
                        : [...CLIENT_ACCOUNT_OPTIONS],
                    )
                  }
                >
                  {publisherClients.length === CLIENT_ACCOUNT_OPTIONS.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </LabelRow>
              <Select
                placeholder="Select Client"
                options={CLIENT_ACCOUNT_OPTIONS}
                value={publisherClients[publisherClients.length - 1] ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setPublisherClients((prev) =>
                    prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                  );
                }}
              />
            </Field>
          )}

          {showClientSingle && (
            <Field>
              <Label>Client</Label>
              <Select
                placeholder="Select Client"
                options={CLIENT_ACCOUNT_OPTIONS}
                value={client}
                onChange={(e) => setClient(e.target.value)}
              />
            </Field>
          )}

          {showServices && !isSubAccount && (
            <Field>
              <LabelRow>
                <Label>Services</Label>
                <button
                  type="button"
                  className="obf-link-btn"
                  onClick={() =>
                    setServices(
                      services.length === SERVICE_OPTIONS.length
                        ? []
                        : [...SERVICE_OPTIONS],
                    )
                  }
                >
                  {services.length === SERVICE_OPTIONS.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </LabelRow>
              <Select
                placeholder="Select Service"
                options={SERVICE_OPTIONS}
                value={services[services.length - 1] ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setServices((prev) =>
                    prev.includes(v)
                      ? prev.filter((x) => x !== v)
                      : [...prev, v],
                  );
                }}
              />
            </Field>
          )}

          {showNetworks && (
            <Field>
              <Label>Assigned Networks</Label>
              <Select
                placeholder="Select Network"
                options={NETWORK_OPTIONS}
                value={assignedNet}
                onChange={(e) => setAssignedNet(e.target.value)}
              />
            </Field>
          )}

          {showCountries && (
            <Field>
              <Label>Countries</Label>
              <Select
                placeholder="Select Country"
                options={COUNTRY_OPTIONS}
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
              />
            </Field>
          )}

          {showCAdmins && (
            <Field>
              <Label>C Admins</Label>
              <Select
                placeholder="Select from the list"
                options={C_ADMIN_OPTIONS}
                value={cAdmin}
                onChange={(e) => setCAdmin(e.target.value)}
              />
            </Field>
          )}

          {showAccountPriv && (
            <Field>
              <Label>Account Privileges</Label>
              <div className="obf-pill-row">
                {["Read Only", "All"].map((opt) => (
                  <Pill
                    key={opt}
                    label={opt}
                    checked={accountPriv === opt}
                    radioName="accountPriv"
                    onChange={() => setAccountPriv(opt)}
                    variant="teal"
                  />
                ))}
              </div>
            </Field>
          )}

          <Field last>
            <Label>Account Mode</Label>
            <div className="obf-pill-row">
              <Pill
                label="Trial"
                checked={mode === "Trial"}
                radioName="mode"
                onChange={() => setMode("Trial")}
                variant="amber"
              />
              <Pill
                label="Live"
                checked={mode === "Live"}
                radioName="mode"
                onChange={() => setMode("Live")}
                variant="green"
              />
            </div>
          </Field>
        </Section>
      </div>

      <ModalFooter
        variant="modal"
        saveLabel="Save"
        cancelLabel="Cancel"
        onCancel={handleClose}
        onSave={handleSave}
        saveDisabled={saveDisabled}
      />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  PARTNER FORM  (sub-account onboarding, simplified)
// ════════════════════════════════════════════════════════════════════════════
function PartnerForm({ onClose, setPage }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [subAccountType, setSubAccountType] = useState("SP Account Stats");
  const [service, setService] = useState("");
  const handleClose = () => {
    if (onClose) onClose();
    else if (setPage) setPage("users");
  };

  return (
    <>
      <FormHeader
        title="User Information"
        subtitle="Create a sub-account under your account"
        onClose={handleClose}
      />

      <div className="obf-body">
        <Field>
          <Label required>Name</Label>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field>
          <Label required>Username</Label>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>

        <Field>
          <Label required>Password</Label>
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Field>
          <Label>Description</Label>
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <Field>
          <Label>Account Type</Label>
          <div className="obf-partner-type-grid">
            {PARTNER_ACCOUNT_TYPES.map((t) => (
              <label
                key={t}
                className={`obf-partner-type-pill${subAccountType === t ? " obf-partner-type-pill--on" : ""}`}
              >
                <input
                  type="radio"
                  name="subAccountType"
                  value={t}
                  checked={subAccountType === t}
                  onChange={() => setSubAccountType(t)}
                />
                <span className="obf-partner-type-dot" />
                {t}
              </label>
            ))}
          </div>
        </Field>

        <Field last>
          <Label>Services</Label>
          <Select
            placeholder="Select from the list"
            options={SERVICE_OPTIONS}
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
        </Field>
      </div>

      <ModalFooter
        variant="modal"
        saveLabel="Save"
        cancelLabel="Close"
        onCancel={handleClose}
      />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  MODAL WRAPPER  — role prop selects which form to render
// ════════════════════════════════════════════════════════════════════════════
export function AddUserModal({
  onClose,
  role = "admin",
  onAdd,
  clientAccounts = [],
}) {
  useEffect(() => {
    document.body.classList.add("modal-scroll-lock");
    return () => {
      document.body.classList.remove("modal-scroll-lock");
    };
  }, []);

  const isPartner = role === "partner";

  return (
    <>
      <div onClick={onClose} className="ob-overlay" />
      <div className="ob-spinner-overlay">
        <div className={`ob-modal${isPartner ? " ob-modal--narrow" : ""}`}>
          {isPartner ? (
            <PartnerForm onClose={onClose} onAdd={onAdd} />
          ) : (
            <AdminForm
              onClose={onClose}
              onAdd={onAdd}
              clientAccounts={clientAccounts}
            />
          )}
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  STANDALONE PAGE  — role prop selects which form to render
// ════════════════════════════════════════════════════════════════════════════
export default function PageOnboardingUsers({ setPage, role = "admin" }) {
  const isPartner = role === "partner";
  return (
    <div className={`ob-modal${isPartner ? " ob-modal--narrow" : ""}`}>
      {isPartner ? (
        <PartnerForm setPage={setPage} />
      ) : (
        <AdminForm setPage={setPage} />
      )}
    </div>
  );
}
