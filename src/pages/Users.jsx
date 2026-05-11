import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AddUserModal } from "../components/modals/OnboardingUsers";
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
import {
  BLUE,
  GREEN,
  AMBER,
  ROSE,
  SLATE,
  statusColor,
} from "../components/constants/colors";
import { repTrend } from "../data/charts";
import { userRows as initialUserRows, partnerAccounts } from "../data/tables";

const USER_TYPES = [
  "All",
  "Admins",
  "C-Admins",
  "Supper Clients",
  "Clients",
  "Client Partner",
  "Sub Account",
  "Publisher",
  "Mirrored",
  "Operations",
];
const TYPE_COLORS = {
  Admins: "#1d4ed8",
  "C-Admins": "#7c3aed",
  "Supper Clients": "#0891b2",
  Clients: "#16a34a",
  "Client Partner": "#d97706",
  "Sub Account": "#dc2626",
  Publisher: "#db2777",
  Mirrored: "#6366f1",
  Operations: "#0f766e",
};
const TYPE_COUNTS = [
  { label: "Admins", count: 12, color: "#1d4ed8" },
  { label: "C-Admins", count: 8, color: "#7c3aed" },
  { label: "Supper Clients", count: 15, color: "#0891b2" },
  { label: "Clients", count: 34, color: "#16a34a" },
  { label: "Client Partner", count: 9, color: "#d97706" },
  { label: "Sub Account", count: 21, color: "#dc2626" },
  { label: "Publisher", count: 7, color: "#db2777" },
  { label: "Mirrored", count: 5, color: "#6366f1" },
  { label: "Operations", count: 11, color: "#0f766e" },
];
const TOTAL_USERS = TYPE_COUNTS.reduce((s, t) => s + t.count, 0);
// statusColor imported from colors.js
const T = "#0d9488";

const PARTNER_SUB_ACCOUNTS_INIT = partnerAccounts;

const PRIMARY_ACTIONS = [
  { key: "view", icon: "👁", title: "View", color: "#0891b2" },
  { key: "edit", icon: "✏️", title: "Edit", color: "#1d4ed8" },
  { key: "loginAs", icon: "🔑", title: "Login As", color: "#7c3aed" },
];
const MORE_ACTIONS = [
  { key: "loginAs", label: "Login As", icon: "🔑", color: "#7c3aed" },
  { key: "updateStatus", label: "Update Status", icon: "🔄", color: "#d97706" },
  { key: "clearHistory", label: "Clear History", icon: "🗑", color: "#dc2626" },
  { key: "updateHistory", label: "User Update History", icon: "📜", color: "#16a34a" },
  { key: "capLimit", label: "Cap Limit", icon: "🔒", color: "#0891b2" },
];

// ─── Shared Modal shell ───────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children, width = 520 }) {
  return (
    <>
      <div onClick={onClose} className="usr-backdrop" />
      <div
        className="usr-modal-box"
      >
        <div className="usr-modal-hdr">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle && <div className="modal-subtitle">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="usr-modal-close">
            ✕
          </button>
        </div>
        <div className="modal-scroll">{children}</div>
      </div>
    </>
  );
}

function Field({ label, value, mono }) {
  return (
    <div className="mb-14">
      <div className="txt-section-hd">{label}</div>
      <div className={mono ? "usr-field-val-mono" : "usr-field-val"}>
        {value || "—"}
      </div>
    </div>
  );
}

function FormInput({ label, defaultValue, type = "text" }) {
  return (
    <div className="mb-14">
      <label className="usr-field-label">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="usr-input"
      />
    </div>
  );
}

function FormSelect({ label, defaultValue, options }) {
  return (
    <div className="mb-14">
      <label className="usr-field-label">{label}</label>
      <select
        defaultValue={defaultValue}
        className="usr-input-white"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function ActionBtn({ label, onClick }) {
  return (
    <button onClick={onClick} className="usr-btn-save">
      {label}
    </button>
  );
}

function CancelBtn({ onClick }) {
  return (
    <button onClick={onClick} className="usr-btn-cancel">
      Cancel
    </button>
  );
}

function toggleListValue(list, value) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function getClientServices(clientAccounts, clientId) {
  const client = clientAccounts.find((u) => u.id === clientId);
  return client?.services?.length ? client.services : [];
}

function CAdminAssignmentEditor({
  clientAccounts,
  assignedClientIds,
  assignedClientServices,
  onClientIdsChange,
  onClientServicesChange,
}) {
  const [serviceSearch, setServiceSearch] = useState({});

  return (
    <div className="usr-cadmin-editor">
      <div className="usr-cadmin-editor-head">
        <div>
          <div className="usr-cadmin-editor-title">Client and Service Scope</div>
          <div className="usr-cadmin-editor-sub">
            Assign only the clients and services this C-Admin can manage.
          </div>
        </div>
      </div>
      <div className="usr-client-check-grid">
        {clientAccounts.map((client) => (
          <label key={client.id} className="usr-client-check">
            <input
              type="checkbox"
              checked={assignedClientIds.includes(client.id)}
              onChange={() => onClientIdsChange(toggleListValue(assignedClientIds, client.id))}
            />
            <span>{client.name}</span>
          </label>
        ))}
      </div>
      {assignedClientIds.map((clientId) => {
        const client = clientAccounts.find((row) => row.id === clientId);
        const services = getClientServices(clientAccounts, clientId);
        const selectedServices = assignedClientServices[clientId] || [];
        const query = serviceSearch[clientId] || "";
        const results = query.trim()
          ? services.filter((service) =>
              service.toLowerCase().includes(query.trim().toLowerCase()),
            )
          : [];
        const allSelected =
          services.length > 0 &&
          services.every((service) => selectedServices.includes(service));

        return (
          <div key={clientId} className="usr-client-service-card">
            <div className="usr-client-service-head">
              <div>
                <div className="usr-client-service-name">{client?.name || clientId}</div>
                <div className="usr-client-service-count">
                  {selectedServices.length} of {services.length} services assigned
                </div>
              </div>
              <button
                type="button"
                className="obf-link-btn"
                onClick={() =>
                  onClientServicesChange(clientId, allSelected ? [] : [...services])
                }
              >
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            </div>
            {selectedServices.length > 0 && (
              <div className="usr-selected-service-chips">
                {selectedServices.map((service) => (
                  <button
                    key={service}
                    type="button"
                    className="usr-selected-service-chip"
                    onClick={() =>
                      onClientServicesChange(
                        clientId,
                        selectedServices.filter((item) => item !== service),
                      )
                    }
                  >
                    <span>{service}</span>
                    <strong>x</strong>
                  </button>
                ))}
              </div>
            )}
            <input
              className="usr-service-search"
              placeholder={`Search ${client?.name || "client"} services...`}
              value={query}
              onChange={(e) =>
                setServiceSearch((prev) => ({
                  ...prev,
                  [clientId]: e.target.value,
                }))
              }
            />
            <div className="usr-service-search-results">
              {!query.trim() ? (
                <div className="usr-service-search-empty">
                  Search to assign services for this client.
                </div>
              ) : results.length === 0 ? (
                <div className="usr-service-search-empty">No matching services found.</div>
              ) : (
                results.map((service) => {
                  const selected = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      className={`usr-service-result${selected ? " selected" : ""}`}
                      onClick={() =>
                        onClientServicesChange(
                          clientId,
                          toggleListValue(selectedServices, service),
                        )
                      }
                    >
                      <span>{service}</span>
                      <strong>{selected ? "Selected" : "Add"}</strong>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({ user, onClose }) {
  const assignedClients = (user.assignedClientIds || [])
    .map((id) => initialUserRows.find((row) => row.id === id)?.name || id)
    .join(", ");
  const assignedServiceCount = Object.values(user.assignedClientServices || {})
    .reduce((sum, services) => sum + services.length, 0);

  return (
    <Modal
      title="User Details"
      subtitle={`Viewing profile for ${user.name}`}
      onClose={onClose}
    >
      <div className="usr-preview-row">
        <div
          className="usr-avatar-lg"
        >
          {user.name[0]}
        </div>
        <div>
          <div className="modal-title">{user.name}</div>
          <div className="txt-body">{user.email}</div>
          <span
            className="usr-role-badge"
          >
            {user.role}
          </span>
        </div>
      </div>
      <div className="g-halves">
        <Field label="Region" value={user.region} />
        <Field label="Last Login" value={user.lastLogin} />
        <Field label="Status" value={user.status} />
        {user.plan && <Field label="Plan" value={user.plan} />}
        {user.role === "C-Admins" && (
          <>
            <Field label="Assigned Clients" value={assignedClients || "None"} />
            <Field label="Assigned Services" value={assignedServiceCount || "None"} />
            <Field
              label="Service Onboarding"
              value={user.serviceOnboardingEnabled ? "Allowed for assigned clients" : "Not allowed"}
            />
          </>
        )}
        <Field label="User ID" value={user.id} mono />
      </div>
      <div className="mt-8-end">
        <CancelBtn onClick={onClose} />
      </div>
    </Modal>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ user, onSave, onClose, clientAccounts = [] }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    region: user.region,
    status: user.status,
    assignedClientIds: user.assignedClientIds || [],
    assignedClientServices: user.assignedClientServices || {},
    serviceOnboardingEnabled: user.serviceOnboardingEnabled || false,
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isCAdmin = form.role === "C-Admins";

  useEffect(() => {
    if (!isCAdmin) return;
    setForm((prev) => {
      const assignedClientServices = {};
      prev.assignedClientIds.forEach((clientId) => {
        const serviceOptions = getClientServices(clientAccounts, clientId);
        assignedClientServices[clientId] = (prev.assignedClientServices[clientId] || []).filter(
          (service) => serviceOptions.includes(service),
        );
      });
      return {
        ...prev,
        assignedClientServices,
        serviceOnboardingEnabled:
          prev.assignedClientIds.length > 0 &&
          prev.assignedClientIds.every((clientId) => assignedClientServices[clientId]?.length),
      };
    });
  }, [isCAdmin, form.assignedClientIds, clientAccounts]);

  return (
    <Modal
      title="Edit User"
      subtitle={`Editing ${user.name}`}
      onClose={onClose}
    >
      <div className="usr-grid-2">
        <div className="mb-14">
          <label className="usr-field-label">Full Name</label>
          <input
            value={form.name}
            onChange={set("name")}
            className="usr-input"
          />
        </div>
        <div className="mb-14">
          <label className="usr-field-label">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            className="usr-input"
          />
        </div>
        <div className="mb-14">
          <label className="usr-field-label">Role</label>
          <select
            value={form.role}
            onChange={set("role")}
            className="usr-input-white"
          >
            {USER_TYPES.filter((t) => t !== "All").map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="mb-14">
          <label className="usr-field-label">Region</label>
          <input
            value={form.region}
            onChange={set("region")}
            className="usr-input"
          />
        </div>
        <div className="mb-14">
          <label className="usr-field-label">Status</label>
          <select
            value={form.status}
            onChange={set("status")}
            className="usr-input-white"
          >
            {["active", "warning", "blocked"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>
      {isCAdmin && (
        <CAdminAssignmentEditor
          clientAccounts={clientAccounts}
          assignedClientIds={form.assignedClientIds}
          assignedClientServices={form.assignedClientServices}
          onClientIdsChange={(assignedClientIds) =>
            setForm((prev) => ({ ...prev, assignedClientIds }))
          }
          onClientServicesChange={(clientId, servicesForClient) =>
            setForm((prev) => ({
              ...prev,
              assignedClientServices: {
                ...prev.assignedClientServices,
                [clientId]: servicesForClient,
              },
            }))
          }
        />
      )}
      <div className="usr-action-row-end">
        <CancelBtn onClick={onClose} />
        <ActionBtn
          label="Save Changes"
          onClick={() => {
            const payload = { ...form };
            if (payload.role !== "C-Admins") {
              delete payload.assignedClientIds;
              delete payload.assignedClientServices;
              delete payload.serviceOnboardingEnabled;
            } else {
              payload.serviceOnboardingEnabled =
                payload.assignedClientIds.length > 0 &&
                payload.assignedClientIds.every(
                  (clientId) => payload.assignedClientServices[clientId]?.length,
                );
            }
            onSave(payload);
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}

// ─── Login As Modal ───────────────────────────────────────────────────────────
function LoginAsModal({ user, onClose }) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <Modal
      title="Login As User"
      subtitle="Impersonate this user account"
      onClose={onClose}
      width={460}
    >
      {!confirmed ? (
        <>
          {/* Warning banner */}
          <div className="usr-warn-box">
            <div className="usr-warn-row">
              <span className="usr-icon14">⚠️</span>
              <span className="usr-warn-title">Admin Impersonation</span>
            </div>
            <div className="usr-warn-body">
              You are about to log in as <strong>{user.name}</strong>. All
              actions performed will be under their account. This session will
              be logged for auditing purposes.
            </div>
          </div>

          {/* Fields */}
          <div className="ob-mb12">
            <div className="usr-field-meta">User</div>
            <div className="usr-detail-name">{user.name || "—"}</div>
          </div>
          <div className="ob-mb12">
            <div className="usr-field-meta">Email</div>
            <div className="usr-detail-val">{user.email || "—"}</div>
          </div>
          <div className="ob-mb20">
            <div className="usr-field-meta">Role</div>
            <div className="usr-detail-val">{user.role || "—"}</div>
          </div>

          {/* Actions */}
          <div className="ob-footer-btns">
            <CancelBtn onClick={onClose} />
            <ActionBtn
              label="Confirm & Login As"
              onClick={() => setConfirmed(true)}
            />
          </div>
        </>
      ) : (
        <div className="ob-pw-center">
          <div className="usr-key-icon">🔑</div>
          <div className="usr-modal-title">Session Started</div>
          <div className="usr-modal-sub">
            You are now logged in as <strong>{user.name}</strong>. Session has
            been logged.
          </div>
          <div className="usr-success-box">
            <div>
              ✓ Session ID: session-{Date.now().toString(36).toUpperCase()}
            </div>
            <div>✓ Account: {user.email}</div>
            <div>✓ Logged for audit</div>
          </div>
          <ActionBtn label="Close" onClick={onClose} />
        </div>
      )}
    </Modal>
  );
}

// ─── Make Status Modal ────────────────────────────────────────────────────────
function UpdateStatusModal({ user, onSave, onClose }) {
  const statuses = [
    {
      value: "active",
      label: "Active",
      color: "#16a34a",
      bg: "#dcfce7",
      desc: "User can log in and access all features.",
    },
    {
      value: "warning",
      label: "Warning",
      color: "#d97706",
      bg: "#fef3c7",
      desc: "User is flagged. Your account is going to Inactive.",
    },
    {
      value: "blocked",
      label: "InActive",
      color: "#dc2626",
      bg: "#fee2e2",
      desc: "User is inactive and cannot log in.",
    },
  ];
  const [selected, setSelected] = useState(user.status || "active");
  return (
    <Modal
      title="Change User Status"
      subtitle={`Update status for ${user.name}`}
      onClose={onClose}
      width={440}
    >
      <div className="usr-col-gap8">
        {statuses.map((s) => (
          <label
            key={s.value}
            className="usr-perm-opt"
          >
            <input
              type="radio"
              name="status"
              checked={selected === s.value}
              onChange={() => setSelected(s.value)}
              className="perm-check usr-radio-accent"
            />
            <div>
              <div className="stat-num-val">
                {s.label}
              </div>
              <div className="txt-body-mt">{s.desc}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="toolbar-end">
        <CancelBtn onClick={onClose} />
        <ActionBtn
          label="Apply Status"
          onClick={() => {
            onSave(selected);
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}

// ─── Clear History Modal ──────────────────────────────────────────────────────
function ClearHistoryModal({ user, onClear, onClose }) {
  const [done, setDone] = useState(false);
  return (
    <Modal
      title="Clear History"
      subtitle={`Clear activity history for ${user.name}`}
      onClose={onClose}
      width={420}
    >
      {!done ? (
        <>
          <div className="alert-danger">
            <div className="alert-title dyn-color">
              ⚠️ This action cannot be undone
            </div>
            <div className="alert-body">
              You are about to permanently delete all login history, session
              logs and activity records for <strong>{user.name}</strong>.
            </div>
          </div>
          <div className="toolbar-end">
            <CancelBtn onClick={onClose} />
            <button
              onClick={() => {
                setDone(true);
                onClear && onClear();
              }}
              className="usr-btn-danger"
            >
              Yes, Clear History
            </button>
          </div>
        </>
      ) : (
        <div className="txt-center-20">
          <div className="txt-img-icon">✅</div>
          <div className="usr-modal-title">History Cleared</div>
          <div className="txt-body-mb">
            All history for <strong>{user.name}</strong> has been removed.
          </div>
          <ActionBtn label="Close" onClick={onClose} />
        </div>
      )}
    </Modal>
  );
}

// ─── User Update History Modal ────────────────────────────────────────────────
function UpdateHistoryModal({ user, log, onClose }) {
  const entries =
    log && log.length > 0
      ? log
      : [
          {
            date: user.lastLogin || "—",
            action: "Account created",
            detail: "New user added",
            by: "superadmin",
          },
        ];
  const ACTION_ICON = {
    "Status toggled": "🔄",
    "Status changed": "🟡",
    "Profile edited": "✏️",
    "Plan updated": "📋",
    "User deleted": "🗑",
    "Account created": "✅",
    "History cleared": "🧹",
  };
  return (
    <Modal
      title="User Update History"
      subtitle={`Audit trail for ${user.name}`}
      onClose={onClose}
      width={600}
    >
      <div className="usr-row-mb12">
        <span className="usr-field-meta">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </div>
      <div className="f-col-8 usr-history-list">
        {entries.map((h, i) => (
          <div key={i} className={`usr-history-row${i === 0 ? " latest" : ""}`}>
            <div className="usr-mono-hint">{h.date}</div>
            <div className="usr-entry-name">
              {ACTION_ICON[h.action] || "•"} {h.action}
            </div>
            <div className="usr-entry-sub">{h.detail}</div>
            <div className="usr-detail-meta">{h.by}</div>
          </div>
        ))}
      </div>
      <div className="mt-16-end">
        <CancelBtn onClick={onClose} />
      </div>
    </Modal>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ user, onDelete, onClose }) {
  return (
    <Modal
      title="Delete User"
      subtitle="This action is permanent"
      onClose={onClose}
      width={400}
    >
      <div className="alert-danger">
        <div className="alert-title dyn-color">
          ⚠️ Cannot be undone
        </div>
        <div className="alert-body">
          Are you sure you want to permanently delete{" "}
          <strong>{user.name}</strong>? All associated data will be removed.
        </div>
      </div>
      <div className="toolbar-end">
        <CancelBtn onClick={onClose} />
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="usr-btn-danger"
        >
          Delete User
        </button>
      </div>
    </Modal>
  );
}

// AddUserModal is imported from ./Onboarding_users

// ─── Cap Limit Modal ─────────────────────────────────────────────────────────
const CAP_STEPS = [250,500,1000,2000,5000,10000,25000,50000,100000,250000,500000,1000000,2000000,5000000,10000000,25000000,50000000];

function fmtCap(n) {
  if (n >= 1000000) return (n / 1000000 % 1 === 0 ? n / 1000000 : (n / 1000000).toFixed(1)) + "M";
  if (n >= 1000)    return (n / 1000    % 1 === 0 ? n / 1000    : (n / 1000).toFixed(1))    + "K";
  return n.toLocaleString();
}

function EmailTagsField({ label, hint, emails, onChange, placeholder }) {
  const [inputVal, setInputVal] = useState("");
  const [error, setError]       = useState("");
  const inputRef = useRef(null);
  const valRef   = useRef(inputVal);
  useEffect(() => { valRef.current = inputVal; }, [inputVal]);

  function isValid(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

  function add(raw) {
    const val = (raw ?? valRef.current).trim().toLowerCase();
    if (!val) return;
    if (!isValid(val)) { setError("Invalid email address"); return; }
    if (emails.includes(val)) { setError("Already added"); return; }
    onChange([...emails, val]);
    setInputVal(""); valRef.current = "";
    setError(""); inputRef.current?.focus();
  }

  function remove(i) { onChange(emails.filter((_, idx) => idx !== i)); }

  return (
    <div className="cap-email-field">
      <div className="cap-email-label-row">
        <span className="usr-field-label">{label}</span>
        <span className="cap-email-hint">{hint}</span>
      </div>
      {emails.length > 0 && (
        <div className="cap-email-chips">
          {emails.map((em, i) => (
            <span key={em} className="cap-email-chip">
              {em}
              <button type="button" className="cap-chip-remove"
                onMouseDown={(e) => { e.preventDefault(); remove(i); }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div className="cap-email-input-row">
        <input
          ref={inputRef} type="text"
          className="usr-input cap-email-input"
          value={inputVal}
          placeholder={emails.length === 0 ? placeholder : "Add another…"}
          onChange={(e) => { setInputVal(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(inputVal); } }}
        />
        <button type="button" className="cap-add-btn"
          onMouseDown={(e) => { e.preventDefault(); add(inputVal); }}
          disabled={!inputVal.trim()}>+ Add</button>
      </div>
      {error && <div className="cap-email-error">{error}</div>}
    </div>
  );
}

function CapLimitModal({ user, existing, onSave, onClose }) {
  const [period,       setPeriod]       = useState(existing?.period      || "day");
  const [stepIdx,      setStepIdx]      = useState(existing?.stepIdx     ?? 0);
  const [partnerEmails,setPartnerEmails]= useState(existing?.partnerEmails|| []);
  const [internalEmails,setInternalEmails]= useState(existing?.internalEmails||[]);
  const [saved,        setSaved]        = useState(false);

  function handleSave() {
    onSave({ period, stepIdx, value: CAP_STEPS[stepIdx], partnerEmails, internalEmails });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Modal
      title="Cap Limit"
      subtitle={`${user.name} · ${user.role}`}
      onClose={onClose}
      width={500}
    >
      <div className="cap-info-banner">
        <span className="cap-info-dot" />
        When the limit is reached, the API call is blocked and alert emails are sent automatically.
      </div>

      {/* Period */}
      <div className="mb-14">
        <label className="usr-field-label">Billing period</label>
        <div className="cap-period-row">
          {["day", "month"].map((p) => (
            <button key={p} type="button"
              className={`cap-period-btn${period === p ? " active" : ""}`}
              onClick={() => setPeriod(p)}>
              Per {p}
            </button>
          ))}
        </div>
      </div>

      {/* Slider */}
      <div className="mb-14">
        <div className="cap-slider-header">
          <label className="usr-field-label">Cap limit</label>
          <span className="cap-limit-val">{fmtCap(CAP_STEPS[stepIdx])}</span>
        </div>
        <input type="range" className="cap-slider"
          min="0" max={CAP_STEPS.length - 1} step="1"
          value={stepIdx}
          onChange={(e) => setStepIdx(+e.target.value)} />
        <div className="cap-slider-labels">
          <span>250</span><span>50M / {period}</span>
        </div>
      </div>

      {/* Quick presets */}
      <div className="mb-14">
        <label className="usr-field-label">Quick select</label>
        <div className="cap-presets">
          {CAP_STEPS.map((val, i) => (
            <button key={val} type="button"
              className={`cap-preset-btn${i === stepIdx ? " active" : ""}`}
              onClick={() => setStepIdx(i)}>
              {fmtCap(val)}
            </button>
          ))}
        </div>
      </div>

      <div className="detail-sep" />

      {/* Partner emails */}
      <EmailTagsField
        label="Partner alert emails"
        hint="Notified when limit is hit"
        emails={partnerEmails}
        onChange={setPartnerEmails}
        placeholder="partner@company.com"
      />

      {/* Internal emails */}
      <EmailTagsField
        label="Internal alert emails"
        hint="Internal team notifications"
        emails={internalEmails}
        onChange={setInternalEmails}
        placeholder="team@shield.io"
      />

      {/* Action indicator */}
      <div className="cap-action-row">
        <span className="cap-action-label">Action when limit reached</span>
        <span className="cap-action-value">Block API call</span>
      </div>

      {/* Footer */}
      <div className="usr-action-row-end">
        <button onClick={onClose} className="usr-btn-cancel">Cancel</button>
        <button onClick={handleSave} className="usr-btn-save">
          {saved ? "✓ Saved" : "Save Cap Limit"}
        </button>
      </div>
    </Modal>
  );
}

// ─── UserActions component ────────────────────────────────────────────────────
function UserActions({
  user,
  onBlock,
  onDelete,
  onStatusChange,
  onEdit,
  onPlanChange,
  userAuditLog,
  onClearHistory,
  capLimit,
  onSaveCapLimit,
  isAdmin,
  clientAccounts = [],
}) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const ref = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const inRow = ref.current && ref.current.contains(e.target);
      const inMenu = menuRef.current && menuRef.current.contains(e.target);
      if (!inRow && !inMenu) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isBlocked = user.status === "blocked";
  const openModal = (key) => {
    setOpen(false);
    setModal(key);
  };

  const [coords, setCoords] = useState(null);
  const dotsRef = useRef(null);

  function calcCoords() {
    if (!dotsRef.current) return null;
    const rect = dotsRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipUp = spaceBelow < 320;
    return {
      top: flipUp ? null : rect.bottom + 4,
      bottom: flipUp ? window.innerHeight - rect.top + 4 : null,
      right: window.innerWidth - rect.right,
    };
  }

  return (
    <>
      {modal === "view" && (
        <ViewModal user={user} onClose={() => setModal(null)} />
      )}
      {modal === "edit" && (
        <EditModal
          user={user}
          onSave={(updated) => onEdit(user, updated)}
          onClose={() => setModal(null)}
          clientAccounts={clientAccounts}
        />
      )}
      {modal === "loginAs" && (
        <LoginAsModal user={user} onClose={() => setModal(null)} />
      )}
      {modal === "updateStatus" && (
        <UpdateStatusModal
          user={user}
          onSave={(s) => onStatusChange(user, s)}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "clearHistory" && (
        <ClearHistoryModal
          user={user}
          onClear={() => onClearHistory(user)}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "updateHistory" && (
        <UpdateHistoryModal
          user={user}
          log={userAuditLog}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "capLimit" && isAdmin && (
        <CapLimitModal
          user={user}
          existing={capLimit}
          onSave={(cfg) => { onSaveCapLimit(user.email, cfg); setModal(null); }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "delete" && (
        <DeleteModal
          user={user}
          onDelete={() => onDelete(user)}
          onClose={() => setModal(null)}
        />
      )}

      <div ref={ref} className="usr-row-actions">
        {PRIMARY_ACTIONS.map((a) => (
          <button
            key={a.key}
            title={a.title}
            onClick={() => openModal(a.key)}
            className="usr-action-icon"
          >
            {a.icon}
          </button>
        ))}

        <button
          title={isBlocked ? "Active" : "InActive"}
          onClick={() => onBlock(user)}
          className={`usr-toggle-block-btn ${isBlocked ? "blocked" : "unblocked"}`}
        >
          {isBlocked ? "Active" : "InActive"}
        </button>

        <div className="p-rel">
          <button
            ref={dotsRef}
            onClick={() => {
              if (!open) setCoords(calcCoords());
              setOpen((o) => !o);
            }}
            title="More actions"
            className={`usr-action-dots ${open ? "open" : "closed"}`}
          >
            ⋯
          </button>
          {open &&
            coords &&
            createPortal(
              <div
                ref={menuRef}
                className="usr-action-menu"
              >
                <div className="usr-action-hdr">
                  <div className="txt-strong">{user.name}</div>
                  <div className="txt-muted-sm">{user.email}</div>
                </div>
                {MORE_ACTIONS.filter(a => a.key !== "capLimit" || isAdmin).map((a) => (
                  <button
                    key={a.key}
                    onClick={() => openModal(a.key)}
                    className="usr-action-item"
                  >
                    <span
                      className="usr-action-icon"
                    >
                      {a.icon}
                    </span>
                    <span className="txt-name">{a.label}</span>
                  </button>
                ))}
                <div className="detail-sep" />
                <button
                  onClick={() => openModal("delete")}
                  className="usr-action-item"
                >
                  <span className="usr-action-icon-del">🗑</span>
                  <span className="txt-danger">Delete User</span>
                </button>
              </div>,
              document.body,
            )}
        </div>
      </div>
    </>
  );
}

// ─── Active/Inactive Tabs ─────────────────────────────────────────────────────
function ActiveInactiveTabs({ value, onChange, activeCount, inactiveCount }) {
  const tabs = [
    {
      key: "active",
      label: "Active",
      count: activeCount,
      color: "#16a34a",
      bg: "#dcfce7",
      dot: "#22c55e",
    },
    {
      key: "inactive",
      label: "Inactive",
      count: inactiveCount,
      color: "#d9060d",
      bg: "#fef3c7",
      dot: "#f59e0b",
    },
  ];
  return (
    <div className="tab-bar">
      {tabs.map(({ key, label, count, color, bg, dot }) => {
        const on = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`svc-tab-btn ${on ? "on" : "off"}`}
          >
            <span
              className={`svc-tab-dot ${on ? "on" : "off"}`}
            />
            {label}
            <span
              className={`svc-tab-pill ${on ? "on" : "off"}`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ── Recharts config constants ──────────────────────────────────────────────
const USR_TICK = { fontSize: 9, fill: "#cbd5e1" };
const USR_MARGIN = { top: 4, right: 8, bottom: 0, left: -24 };
const USR_PIE_CX = 52;
const USR_PIE_CY = 52;
const USR_PIE_IR = 28;
const USR_PIE_OR = 50;
const USR_PIE_PA = 2;

export default function PageUsers({ role = "admin", setPage }) {
  const [users, setUsers] = useState(initialUserRows);
  const [auditLog, setAuditLog] = useState({}); // { email: [{date,action,detail,by}] }
  const addAudit = (email, action, detail) => {
    const now = new Date();
    const date =
      now.toISOString().slice(0, 10) + " " + now.toTimeString().slice(0, 5);
    setAuditLog((prev) => ({
      ...prev,
      [email]: [
        { date, action, detail, by: "admin@shield.io" },
        ...(prev[email] || []),
      ],
    }));
  };
  const [partnerAccounts, setPartnerAccounts] = useState(
    PARTNER_SUB_ACCOUNTS_INIT,
  );
  const [activeType, setActiveType] = useState("All");
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState("active");
  const isPartner = role === "partner";

  // ── User actions ──
  const handleBlock = (user) => {
    const newStatus = user.status === "blocked" ? "active" : "blocked";
    setUsers((prev) =>
      prev.map((u) =>
        u.email === user.email ? { ...u, status: newStatus } : u,
      ),
    );
    addAudit(user.email, "Status toggled", `${user.status} → ${newStatus}`);
  };
  const handleDelete = (user) => {
    setUsers((prev) => prev.filter((u) => u.email !== user.email));
    addAudit(user.email, "User deleted", "Account permanently removed");
  };
  const handleStatusChange = (user, newStatus) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email === user.email ? { ...u, status: newStatus } : u,
      ),
    );
    addAudit(user.email, "Status changed", `${user.status} → ${newStatus}`);
  };
  const handleEdit = (user, updated) => {
    setUsers((prev) =>
      prev.map((u) => (u.email === user.email ? { ...u, ...updated } : u)),
    );
    const changed = Object.keys(updated)
      .filter((k) => updated[k] !== user[k])
      .map((k) => `${k}: ${user[k]} → ${updated[k]}`)
      .join(", ");
    if (changed) addAudit(user.email, "Profile edited", changed);
  };
  const handlePlanChange = (user, plan) => {
    setUsers((prev) =>
      prev.map((u) => (u.email === user.email ? { ...u, plan } : u)),
    );
    addAudit(user.email, "Plan updated", `${user.plan || "None"} → ${plan}`);
  };
  const handleClearHistory = (user) => {
    setAuditLog((prev) => ({ ...prev, [user.email]: [] }));
  };
  const [capLimits, setCapLimits] = useState({}); // { email: { period, stepIdx, value, partnerEmails, internalEmails } }
  const handleSaveCapLimit = (email, cfg) => {
    setCapLimits((prev) => ({ ...prev, [email]: cfg }));
    addAudit(email, "Cap limit set", `${fmtCap(cfg.value)} per ${cfg.period}`);
  };

  const [addModal, setAddModal] = useState(false);
  const handleAddUser = (user) => {
    if (!user) return;
    setUsers((prev) => [user, ...prev]);
    if (user.email) addAudit(user.email, 'Account created', role);
  };

  const isActiveStatus = (u) => u.status === "active";
  const isInactiveStatus = (u) => u.status !== "active";

  const filtered = users.filter((u) => {
    const matchStatus =
      statusTab === "active" ? isActiveStatus(u) : isInactiveStatus(u);
    const matchType =
      activeType === "All"
        ? true
        : activeType === "Mirrored"
          ? u.isMirrored === true
          : u.role === activeType;
    const matchQuery =
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase());
    return matchStatus && matchType && matchQuery;
  });
  const [perPageUsr, setPerPageUsr] = useState(10);
  const visibleUsers = filtered.slice(0, perPageUsr);

  const activeUsersCount = users.filter(isActiveStatus).length;
  const inactiveUsersCount = users.filter(isInactiveStatus).length;

  // ── Partner view ──
  const [expandedAccounts, setExpandedAccounts] = useState({});
  const [partnerTab, setPartnerTab] = useState("active");
  const toggleAccount = (id) =>
    setExpandedAccounts((p) => ({ ...p, [id]: !p[id] }));
  const SERVICES_PREVIEW = 4;

  const handlePartnerToggle = (id) => {
    setPartnerAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: !a.status } : a)),
    );
  };

  const filteredPartnerAccounts = partnerAccounts.filter((u) =>
    partnerTab === "active" ? u.status === true : u.status === false,
  );
  const [perPagePtnAcc, setPerPagePtnAcc] = useState(10);
  const visiblePartnerAccounts = filteredPartnerAccounts.slice(
    0,
    perPagePtnAcc,
  );
  const activePartnerCount = partnerAccounts.filter(
    (u) => u.status === true,
  ).length;
  const inactivePartnerCount = partnerAccounts.filter(
    (u) => u.status === false,
  ).length;

  if (isPartner) {
    return (
      <div className="usr-partner-page">
        <div className="usr-table-card">
          <div className="flex-between p-10-14">
            <div>
              <div className="txt-label-lg">My Sub-Accounts</div>
              <div className="txt-slate-11">
                {partnerAccounts.length} accounts ·{" "}
                {partnerAccounts.reduce((s, u) => s + u.services.length, 0)}{" "}
                total services
              </div>
            </div>
            <button
              className="usr-btn-save"
              onClick={() => setAddModal(true)}
            >
              ⊕ New Account
            </button>
          </div>
          <ActiveInactiveTabs
            value={partnerTab}
            onChange={setPartnerTab}
            activeCount={activePartnerCount}
            inactiveCount={inactivePartnerCount}
          />
        </div>

        <div className="f-col-12">
          {filteredPartnerAccounts.length === 0 && (
            <div className="usr-empty">No {partnerTab} accounts found.</div>
          )}
          {visiblePartnerAccounts.map((u) => {
            const isExpanded = !!expandedAccounts[u.id];
            const preview = u.services.slice(0, SERVICES_PREVIEW);
            const rest = u.services.slice(SERVICES_PREVIEW);
            return (
              <div
                key={u.id}
                className="usr-partner-card"
              >
                <div
                  className="usr-partner-row"
                >
                  <div className="usr-table-cell">
                    <div
                      className="usr-partner-avatar"
                    >
                      {u.name.slice(0, 3)}
                    </div>
                    <div>
                      <div className="txt-label">{u.name}</div>
                      <div className="txt-muted-xs">ID: {u.id}</div>
                    </div>
                  </div>
                  <div className="p-card">
                    <span className="usr-plan-badge">{u.type}</span>
                  </div>
                  <div className="p-card">
                    <div className="txt-body-2">Last Login</div>
                    <div className="usr-login-val">{u.lastLogin}</div>
                  </div>
                  <div className="p-card">
                    <div className="txt-body-2">Last Accessed From</div>
                    <div className="usr-txt-mono">{u.lastAccessed}</div>
                  </div>
                  {/* Clickable status toggle */}
                  <div className="p-card">
                    <div
                      onClick={() => handlePartnerToggle(u.id)}
                      className="usr-toggle"
                    >
                      <div
                        className="usr-toggle-thumb"
                      />
                    </div>
                  </div>
                  <div className="usr-service-wrap">
                    {preview.map((svc) => (
                      <span
                        key={svc}
                        className="usr-svc-tag"
                      >
                        {svc}
                      </span>
                    ))}
                    {rest.length > 0 && (
                      <button
                        onClick={() => toggleAccount(u.id)}
                        className="usr-svc-add"
                      >
                        {isExpanded ? "▲ Less" : `+${rest.length} more`}
                      </button>
                    )}
                  </div>
                  <div className="usr-tabs-wrap">
                    <button title="View" className="usr-icon-teal">
                      👁
                    </button>
                    <button title="Edit" className="usr-icon-blue">
                      ✏️
                    </button>
                  </div>
                  {/* Read-only cap limit for partner view */}
                  {capLimits[u.id] && (
                    <div className="cap-partner-badge">
                      <span className="cap-partner-icon">🔒</span>
                      <span className="cap-partner-text">
                        Cap: {fmtCap(capLimits[u.id].value)} / {capLimits[u.id].period}
                      </span>
                    </div>
                  )}
                </div>
                {isExpanded && (
                  <div className="tab-body">
                    <div className="txt-section-hd mb-10">
                      All Services ({u.services.length})
                    </div>
                    <div className="usr-permission-grid">
                      {u.services.map((svc) => {
                        const isTrue = svc.endsWith("True");
                        return (
                          <div
                            key={svc}
                            className="usr-perm-item"
                          >
                            <span>{svc.replace(/ - (True|False)$/, "")}</span>
                            <span
                              className="usr-perm-badge"
                            >
                              {isTrue ? "True" : "False"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {addModal && (
          <AddUserModal
            onAdd={() => {}}
            onClose={() => setAddModal(false)}
            role={role}
          />
        )}
      </div>
    );
  }

  // ── Admin view ────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="g-stats3 mb-section">
        {[
          { label: "Total Users", value: TOTAL_USERS, color: BLUE },
          {
            label: "Active",
            value: users.filter((u) => u.status === "active").length,
            color: GREEN,
          },
          {
            label: "Inactive",
            value: users.filter((u) => u.status === "warning").length,
            color: AMBER,
          },
          // {
          //   label: "Blocked",
          //   value: users.filter((u) => u.status === "blocked").length,
          //   color: ROSE,
          // },
        ].map(({ label, value, color }) => (
          <Card key={label} className="stat-top-4">
            <div className="kpi-stat">{value}</div>
            <div className="stat-sublabel">{label}</div>
          </Card>
        ))}
      </div>

      <div className="g-split2 mb-section">
        <Card>
          <SectionTitle>Login &amp; Action Activity</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={repTrend}>
              <XAxis dataKey="d" />
              <YAxis />
              <Tooltip />
              <Line dataKey="visits" stroke="#2563eb" strokeWidth={2} />
              <Line
                dataKey="clicks"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle>Users by Type</SectionTitle>
          <div className="f-gap-14">
            <div className="p-rel-sh">
              <PieChart width={110} height={110}>
                <Pie
                  data={TYPE_COUNTS}
                  dataKey="count"
                  cx={USR_PIE_CX}
                  cy={USR_PIE_CY}
                  innerRadius={USR_PIE_IR}
                  outerRadius={USR_PIE_OR}
                  paddingAngle={USR_PIE_PA}
                >
                  {TYPE_COUNTS.map((t, i) => (
                    <Cell key={i} fill={t.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="usr-donut-label">{TOTAL_USERS}</div>
            </div>
            <div className="usr-legend-item">
              {TYPE_COUNTS.map((t) => (
                <div key={t.label} className="f-gap-7">
                  <div className="usr-legend-dot" />
                  <span className="usr-legend-count">{t.count}</span>
                  <span className="usr-legend-name">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="usr-filter-wrap">
          <SectionTitle>User Directory</SectionTitle>
          <div className="f-gap-8">
            <div className="dt-entries-bar">
              <span className="dt-entries-lbl">Show</span>
              <select
                className="dt-entries-sel"
                value={perPageUsr}
                onChange={(e) => setPerPageUsr(Number(e.target.value))}
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="dt-entries-lbl">entries</span>
            </div>
            <input
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="usr-filter-select"
            />
            <button onClick={() => setAddModal(true)} className="btn-success">
              + Add User
            </button>
          </div>
        </div>

        <ActiveInactiveTabs
          value={statusTab}
          onChange={(v) => {
            setStatusTab(v);
            setActiveType("All");
          }}
          activeCount={activeUsersCount}
          inactiveCount={inactiveUsersCount}
        />

        <div className="usr-perm-filter-bar">
          {USER_TYPES.map((t) => {
            const isActive = activeType === t;
            const color = t === "All" ? BLUE : TYPE_COLORS[t];
            return (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className="usr-perm-filter-pill"
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className="usr-tbl-wrap">
          <table className="usr-tbl">
            <colgroup>
              <col className="usr-col-user" />
              <col className="usr-col-email" />
              <col className="usr-col-type" />
              <col className="usr-col-region" />
              <col className="usr-col-scope" />
              <col className="usr-col-login" />
              <col className="usr-col-status" />
              <col className="usr-col-cap" />
              <col className="usr-col-actions" />
            </colgroup>
            <thead>
              <tr>
                {[
                  "User",
                  "Email",
                  "Type",
                  "Region",
                  "Client Scope",
                  "Last Login",
                  "Status",
                  "Cap Limit",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="dt-th">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="usr-td-user">
                      <div
                        className="usr-avatar-sm"
                      >
                        {u.name[0]}
                      </div>
                      <span className="usr-td-user-name">{u.name}</span>
                    </div>
                  </td>
                  <td className="td-p-10s">{u.email}</td>
                  <td>
                    <div className="usr-type-badges">
                      <Badge color={TYPE_COLORS[u.role] || BLUE}>{u.role}</Badge>
                      {u.isMirrored === true && (
                        <Badge color={TYPE_COLORS.Mirrored || "#6366f1"}>
                          Mirrored
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="dt-td">{u.region}</td>
                  <td className="td-p-10s">
                    {u.role === "C-Admins" && u.assignedClientIds?.length ? (
                      <span className="usr-scope-pill">
                        {u.assignedClientIds.length} clients
                      </span>
                    ) : (
                      <span className="cap-not-set">—</span>
                    )}
                  </td>
                  <td className="td-p-10s">{u.lastLogin}</td>
                  <td>
                    <div className="usr-td-status">
                      <span
                        className="usr-status-dot"
                      />
                      <span className="txt-cap">{u.status}</span>
                    </div>
                  </td>
                  <td className="cap-col-cell">
                    {capLimits[u.email] ? (
                      <span className="cap-admin-badge">
                        🔒 {fmtCap(capLimits[u.email].value)}<span className="cap-period-tag">/ {capLimits[u.email].period === "day" ? "day" : "month"}</span>
                      </span>
                    ) : (
                      <span className="cap-not-set">—</span>
                    )}
                  </td>
                  <td className="usr-td-actions">
                    <UserActions
                      user={u}
                      onBlock={handleBlock}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                      onEdit={handleEdit}
                      onPlanChange={handlePlanChange}
                      onClearHistory={handleClearHistory}
                      userAuditLog={auditLog[u.email] || []}
                      capLimit={capLimits[u.email]}
                      onSaveCapLimit={handleSaveCapLimit}
                      isAdmin={role === "admin"}
                      clientAccounts={users.filter((row) => row.role === "Clients")}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="dt-empty">
                    No {statusTab} users found
                    {activeType !== "All" ? ` for ${activeType}` : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {addModal && (
        <AddUserModal
          onAdd={handleAddUser}
          onClose={() => setAddModal(false)}
          role={role}
          clientAccounts={users.filter((u) => u.role === "Clients")}
        />
      )}
    </div>
  );
}
