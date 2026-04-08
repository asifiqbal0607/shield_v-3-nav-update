import { useState } from "react";

// ── Sidebar nav groups ────────────────────────────────────────────────────────
const MAIN_GROUPS = [
  {
    key: "dashboard",
    icon: "⌂",
    label: "Dashboard",
    roles: ["admin", "partner"],
    items: [
      { key: "overview",        label: "Overview" },
      { key: "reporting",       label: "Reporting" },
      { key: "services",        label: "Stats per Service" },
      { key: "traffic-sources", label: "Traffic Sources" },
    ],
  },
  {
    key: "management",
    icon: "≡",
    label: "Management",
    roles: ["admin"],
    items: [
      { key: "users",      label: "Manage Users" },
      { key: "services",   label: "Manage Services" },
      { key: "partners",   label: "Partners" },
      { key: "onboarding", label: "Onboarding" },
    ],
  },
  {
    key: "analytics",
    icon: "◫",
    label: "Analytics",
    roles: ["admin", "partner"],
    items: [
      { key: "fraud-codes", label: "Fraud Codes" },
      { key: "block",       label: "Blocking" },
      { key: "device",      label: "Device Networks" },
      { key: "geo",         label: "Geo" },
      { key: "apks",        label: "APKs" },
    ],
  },
  {
    key: "resources",
    icon: "⊞",
    label: "Resources",
    roles: ["admin", "partner"],
    items: [
      { key: "docs",        label: "Documentation" },
      { key: "sandbox",     label: "Sandbox" },
      { key: "fraud-codes", label: "API Reference" },
    ],
  },
  {
    key: "tools",
    icon: "⚒",
    label: "Tools",
    roles: ["admin"],
    items: [
      { key: "ip-manager",   label: "IP Manager" },
      { key: "audit",        label: "Password Generator" },
      { key: "apks",         label: "Export APKs" },
      { key: "reporting",    label: "Export Transactions" },
    ],
  },
  {
    key: "system",
    icon: "⚙",
    label: "System",
    roles: ["admin"],
    items: [
      { key: "audit",   label: "Audit Log" },
      { key: "sandbox", label: "Settings" },
    ],
  },
];

const BOTTOM_GROUP = {
  key: "support",
  icon: "?",
  label: "Support",
  roles: ["admin", "partner"],
  items: [
    { key: "support", label: "Raise a Ticket" },
    { key: "docs",    label: "Documentation" },
  ],
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Sidebar({ role, page, setPage }) {
  const [openKey, setOpenKey] = useState(null);

  const topGroups   = MAIN_GROUPS.filter((g) => g.roles.includes(role));
  const showBottom  = BOTTOM_GROUP.roles.includes(role);
  const allGroups   = [...topGroups, ...(showBottom ? [BOTTOM_GROUP] : [])];
  const openGroup   = allGroups.find((g) => g.key === openKey) ?? null;

  function toggle(key) {
    setOpenKey((cur) => (cur === key ? null : key));
  }

  function groupIsActive(g) {
    return g.items.some((i) => i.key === page);
  }

  return (
    <div className="slsb-wrap">
      {/* ── Icon strip ── */}
      <nav className="slsb-strip">
        <div className="slsb-strip-top">
          {topGroups.map((g) => {
            const active = groupIsActive(g) || openKey === g.key;
            return (
              <button
                key={g.key}
                type="button"
                title={g.label}
                className={`slsb-icon-btn${active ? " active" : ""}`}
                onClick={() => toggle(g.key)}
              >
                <span className="slsb-icon">{g.icon}</span>
              </button>
            );
          })}
        </div>

        {showBottom && (
          <div className="slsb-strip-bottom">
            <button
              type="button"
              title={BOTTOM_GROUP.label}
              className={`slsb-icon-btn${groupIsActive(BOTTOM_GROUP) || openKey === BOTTOM_GROUP.key ? " active" : ""}`}
              onClick={() => toggle(BOTTOM_GROUP.key)}
            >
              <span className="slsb-icon">{BOTTOM_GROUP.icon}</span>
            </button>
          </div>
        )}
      </nav>

      {/* ── Slide panel ── */}
      <div className={`slsb-panel${openKey ? " open" : ""}`}>
        {openGroup && (
          <>
            <div className="slsb-panel-header">{openGroup.label}</div>
            <div className="slsb-panel-items">
              {openGroup.items.map((item) => {
                const active = page === item.key;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`slsb-panel-item${active ? " active" : ""}`}
                    onClick={() => {
                      setPage(item.key);
                      setOpenKey(null);
                    }}
                  >
                    {active && <span className="slsb-panel-dot" />}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Click-outside backdrop */}
      {openKey && (
        <div className="slsb-backdrop" onClick={() => setOpenKey(null)} />
      )}
    </div>
  );
}
