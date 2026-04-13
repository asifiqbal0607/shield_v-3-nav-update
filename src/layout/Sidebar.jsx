import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  BookOpen,
  Wrench,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ── Nav definition ────────────────────────────────────────────────────────────
const TOP_GROUPS = [
  {
    key: "dashboard",
    Icon: LayoutDashboard,
    label: "Dashboard",
    roles: ["admin", "partner"],
    items: [
      { key: "overview",        label: "Overview" },
      { key: "reporting",       label: "Reporting" },
      { key: "traffic-sources", label: "Traffic Sources" },
    ],
  },
  {
    key: "management",
    Icon: Users,
    label: "Management",
    roles: ["admin"],
    items: [
      { key: "users",    label: "Manage Users" },
      { key: "services", label: "Manage Services" },
      { key: "partners", label: "Partners" },
    ],
  },
  {
    key: "analytics",
    Icon: BarChart3,
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
    Icon: BookOpen,
    label: "Resources",
    roles: ["admin", "partner"],
    items: [
      { key: "docs",    label: "Documentation" },
      { key: "sandbox", label: "Sandbox" },
    ],
  },
  {
    key: "tools",
    Icon: Wrench,
    label: "Tools",
    roles: ["admin"],
    items: [
      { key: "ip-manager", label: "IP Manager" },
      { key: "password-generator", label: "Password Generator" },
    ],
  },
  {
    key: "system",
    Icon: Settings,
    label: "System",
    roles: ["admin"],
    items: [
      { key: "audit",   label: "Audit Log" },
    ],
  },
];

const BOTTOM_GROUP = {
  key: "support",
  Icon: HelpCircle,
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
  const [pinned, setPinned] = useState(false);

  const topGroups  = TOP_GROUPS.filter((g) => g.roles.includes(role));
  const showBottom = BOTTOM_GROUP.roles.includes(role);
  const allGroups  = [...topGroups, ...(showBottom ? [BOTTOM_GROUP] : [])];
  const openGroup  = allGroups.find((g) => g.key === openKey) ?? null;

  function toggle(key) {
    setOpenKey((cur) => {
      if (cur === key) {
        setPinned(false);
        return null;
      }
      return key;
    });
  }

  function openOnHover(key) {
    if (pinned) return;
    setOpenKey(key);
  }

  function handleMouseLeave() {
    if (!pinned) setOpenKey(null);
  }

  function isGroupActive(g) {
    return g.items.some((i) => i.key === page);
  }

  return (
    <>
      {openKey && pinned && (
        <div
          className="sb-backdrop"
          onClick={() => {
            setPinned(false);
            setOpenKey(null);
          }}
        />
      )}

      <div className="sb-root" onMouseLeave={handleMouseLeave}>
        {/* ── 52px icon strip ── */}
        <div className="sb-strip">
          <div className="sb-strip-top">
            {topGroups.map(({ key, Icon, label }) => {
              const active = isGroupActive(TOP_GROUPS.find(g => g.key === key)) || openKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  title={label}
                  className={`sb-icon-btn${active ? " active" : ""}`}
                  onClick={() => toggle(key)}
                  onMouseEnter={() => openOnHover(key)}
                  onFocus={() => openOnHover(key)}
                >
                  <Icon size={18} strokeWidth={1.8} />
                </button>
              );
            })}
          </div>

          {showBottom && (
            <div className="sb-strip-bottom">
              <button
                type="button"
                title={BOTTOM_GROUP.label}
                className={`sb-icon-btn${isGroupActive(BOTTOM_GROUP) || openKey === BOTTOM_GROUP.key ? " active" : ""}`}
                onClick={() => toggle(BOTTOM_GROUP.key)}
                onMouseEnter={() => openOnHover(BOTTOM_GROUP.key)}
                onFocus={() => openOnHover(BOTTOM_GROUP.key)}
              >
                <BOTTOM_GROUP.Icon size={18} strokeWidth={1.8} />
              </button>
            </div>
          )}
        </div>

        {/* ── 210px slide panel ── */}
        <div className={`sb-panel${openKey ? " open" : ""}`}>
          {openGroup && (
            <>
              <div className="sb-panel-header">
                <div className="sb-panel-section-label">{openGroup.label}</div>
                <button
                  type="button"
                  className={`sb-panel-pin${pinned ? " is-pinned" : ""}`}
                  title={pinned ? "Unpin sidebar" : "Pin sidebar"}
                  onClick={() => setPinned((v) => !v)}
                >
                  {pinned ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
              {openGroup.items.map((item) => {
                const active = page === item.key;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`sb-panel-item${active ? " active" : ""}`}
                    onClick={() => {
                      setPage(item.key);
                      if (!pinned) setOpenKey(null);
                    }}
                  >
                    <span className="sb-panel-dot" />
                    {item.label}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}
