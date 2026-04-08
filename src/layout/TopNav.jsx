import React, { useState } from "react";
import { groupsForRole } from "../components/constants/nav";
import { CopyIcon, SettingsIcon, LogOutIcon } from "../components/ui/Icons";
import { useTickets } from "../context/TicketContext";

function GUISettings() {
  const [clientStats, setClientStats] = useState("regular");
  const [clientListing, setClientListing] = useState("show");
  const [fontSize, setFontSize] = useState(8);
  const [annotations, setAnnotations] = useState(true);

  return (
    <div className="gui-s-wrap">
      <div className="gui-s-section">
        <div className="gui-s-section-title">Clients</div>
        <div className="gui-s-row">
          <span className="gui-s-label">Stats</span>
          <div className="gui-s-radio-group">
            {["demo", "regular"].map((v) => (
              <label key={v} className="gui-s-radio">
                <input
                  type="radio"
                  name="clientStats"
                  value={v}
                  checked={clientStats === v}
                  onChange={() => setClientStats(v)}
                />
                <span className="gui-s-radio-dot" />
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <div className="gui-s-row">
          <span className="gui-s-label">Listing</span>
          <div className="gui-s-radio-group">
            {["show", "hide"].map((v) => (
              <label key={v} className="gui-s-radio">
                <input
                  type="radio"
                  name="clientListing"
                  value={v}
                  checked={clientListing === v}
                  onChange={() => setClientListing(v)}
                />
                <span className="gui-s-radio-dot" />
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="gui-s-divider" />

      <div className="gui-s-section">
        <div className="gui-s-section-title">Charts</div>
        <div className="gui-s-row gui-s-row-col">
          <div className="gui-s-slider-header">
            <span className="gui-s-label">Font Size</span>
            <span className="gui-s-slider-val">{fontSize}</span>
          </div>
          <input
            type="range"
            min={8}
            max={20}
            step={2}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="gui-s-slider"
          />
          <div className="gui-s-slider-ticks">
            {[8, 10, 12, 14, 16, 18, 20].map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="gui-s-divider" />

      <div className="gui-s-section">
        <div className="gui-s-section-title">Annotations</div>
        <div className="gui-s-row gui-s-row-between">
          <span className="gui-s-label">Show/Hide</span>
          <button
            className={`gui-s-toggle${annotations ? " on" : ""}`}
            onClick={() => setAnnotations((v) => !v)}
            type="button"
          >
            <span className="gui-s-toggle-knob" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TopNav({ role, setRole, page, setPage, onLogout }) {
  const [openGroup, setOpenGroup] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [stagingCopied, setStagingCopied] = useState(false);
  const [stagingHover, setStagingHover] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const groups = groupsForRole(role);
  const isPartner = role === "partner";
  const { getUnreadCount } = useTickets();
  const supportUnread = isPartner ? getUnreadCount("Tiot") : 0;
  const flatItems = groups
    .filter((g) => g.group === null)
    .flatMap((g) => g.items);
  const groupedSecs = groups.filter((g) => g.group !== null);

  const allPartnerItems = [
    ...flatItems,
    ...groupedSecs.flatMap((g) => g.items),
  ];
  const partnerVisible = allPartnerItems.slice(0, 3);
  const partnerMore = allPartnerItems.slice(3);
  const moreHasActive = partnerMore.some((i) => i.key === page);

  const closeAll = () => setOpenGroup(null);
  const toggleGroup = (g) => setOpenGroup((open) => (open === g ? null : g));

  const NavTabs = () => (
    <div className="tnav-nav-hl">
      {isPartner ? (
        <>
          {partnerVisible.map((p) => (
            <button
              key={p.key}
              className={`nav-tab${page === p.key ? " active" : ""}`}
              onClick={() => {
                setPage(p.key);
                closeAll();
              }}
            >
              <span className="t-icon" style={{ "--ic": p.color || "#6366f1" }}>{p.icon && React.createElement(p.icon, { size: 14 })}</span>
              {p.label}
            </button>
          ))}
          {partnerMore.length > 0 && (
            <div className="tnav-nav-link">
              <button
                className={`group-btn${moreHasActive ? " active" : ""}${openGroup === "__more__" ? " open" : ""}`}
                onClick={() => toggleGroup("__more__")}
              >
                ⊞ MORE <span className="chev">▾</span>
              </button>
              {openGroup === "__more__" && (
                <>
                  <div className="tnav-overlay" onClick={closeAll} />
                  <div className="group-drop tnav-dropdown">
                    {partnerMore.map((p) => (
                      <button
                        key={p.key}
                        className={`drop-item${page === p.key ? " active" : ""}`}
                        onClick={() => {
                          setPage(p.key);
                          closeAll();
                        }}
                      >
                        <span className="di-ic" style={{ "--ic": p.color || "#6366f1" }}>{p.icon && React.createElement(p.icon, { size: 14 })}</span>
                        <span className="tnav-dropdown-flex">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {flatItems.map((p) => (
            <button
              key={p.key}
              className={`nav-tab${page === p.key ? " active" : ""}`}
              onClick={() => {
                setPage(p.key);
                closeAll();
              }}
            >
              <span className="t-icon" style={{ "--ic": p.color || "#6366f1" }}>{p.icon && React.createElement(p.icon, { size: 14 })}</span>
              {p.label}
            </button>
          ))}
          {groupedSecs.map((sec) => {
            const secActive = sec.items.some((i) => i.key === page);
            const isOpen = openGroup === sec.group;
            return (
              <div key={sec.group} className="tnav-nav-link">
                <button
                  className={`group-btn${secActive ? " active" : ""}${isOpen ? " open" : ""}`}
                  onClick={() => toggleGroup(sec.group)}
                >
                  {sec.group} <span className="chev">▾</span>
                </button>
                {isOpen && (
                  <>
                    <div className="tnav-overlay" onClick={closeAll} />
                    <div className="group-drop">
                      <div className="tnav-dropdown-label">{sec.group}</div>
                      {sec.items.map((p) => (
                        <button
                          key={p.key}
                          className={`drop-item${page === p.key ? " active" : ""}`}
                          onClick={() => {
                            setPage(p.key);
                            closeAll();
                          }}
                        >
                          <span className="di-ic" style={{ "--ic": p.color || "#6366f1" }}>{p.icon && React.createElement(p.icon, { size: 14 })}</span>
                          <span className="tnav-dropdown-flex">{p.label}</span>
                          {p.badge && (
                            <span
                              className="tnav-dropdown-badge"
                              style={{
                                "--bg": `${p.badge.c}25`,
                                "--c": p.badge.c,
                              }}
                            >
                              {p.badge.n}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );

  const SettingsPanel = () => (
    <>
      <div
        className="gui-settings-backdrop"
        onClick={() => setSettingsOpen(false)}
      />
      <div className="gui-settings-panel">
        <div className="gui-settings-header">
          <span className="gui-settings-title">GUI Settings</span>
          <button
            className="gui-settings-close"
            onClick={() => setSettingsOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="gui-settings-body">
          <GUISettings />
        </div>
      </div>
    </>
  );


  // ── Mock new partner tickets (in real app, fetch from API) ────────────────
  const PARTNER_ALERTS = [
    { id: "TKT-0041", partner: "Tiot",        category: "blocking",    priority: "critical", subject: "Clicks blocked on ZA network during UAT", time: "2 min ago"  },
    { id: "TKT-0040", partner: "DTAC",        category: "integration", priority: "high",     subject: "Shield JS not firing on iOS 17 Safari",   time: "1 hr ago"   },
    { id: "TKT-0039", partner: "IQ InterCom", category: "data",        priority: "medium",   subject: "Conversion count mismatch vs reports",     time: "2 hrs ago"  },
  ];
  const UNREAD_COUNT = PARTNER_ALERTS.length;

  const PRI_COLOR = { critical: "#dc2626", high: "#d97706", medium: "#1652c8", low: "#0d9e6e" };
  const CAT_ICON  = { blocking: "🚫", integration: "🔗", performance: "⚡", data: "📊", access: "🔑", other: "💬" };

  const NotifDropdown = () => (
    <>
      <div className="tnav-notif-overlay" onClick={() => setNotifOpen(false)} />
      <div className="tnav-notif-dropdown">
        <div className="tnav-notif-hd">
          <span className="tnav-notif-hd-title">Partner Tickets</span>
          <span className="tnav-notif-hd-count">{UNREAD_COUNT} new</span>
        </div>
        <div className="tnav-notif-list">
          {PARTNER_ALERTS.map((t) => (
            <div key={t.id} className="tnav-notif-item" onClick={() => { setNotifOpen(false); setPage && setPage("support"); }}>
              <span className="tnav-notif-cat-icon">{CAT_ICON[t.category] ?? "💬"}</span>
              <div className="tnav-notif-item-body">
                <div className="tnav-notif-item-subject">{t.subject}</div>
                <div className="tnav-notif-item-meta">
                  <span className="tnav-notif-item-partner">{t.partner}</span>
                  <span className="tnav-notif-item-sep">·</span>
                  <span className="tnav-notif-item-time">{t.time}</span>
                </div>
              </div>
              <span className="tnav-notif-pri-dot" style={{ "--pri": PRI_COLOR[t.priority] }} />
            </div>
          ))}
        </div>
        <button className="tnav-notif-footer" onClick={() => { setNotifOpen(false); setPage && setPage("support"); }} type="button">
          View all tickets →
        </button>
      </div>
    </>
  );

  return (
    <header className="tnav-header">
      <div
        className="tnav-inner"
        onClick={(e) => {
          if (e.currentTarget === e.target) closeAll();
        }}
      >
        {/* Logo */}
        <div className="tnav-brand">
          <div className="tnav-logo">S</div>
          <div>
            <div className="tnav-product-name">MCP Shield</div>
            <div className="tnav-product-sub">
              {isPartner ? "Partner Portal" : "Admin Portal"}
            </div>
          </div>
        </div>

        <div className="nav-divider" />
        <div className="tnav-nav-area">
          <NavTabs />
        </div>

        {/* Right */}
        <div className="tnav-right">
          <div className="tnav-status">
            <span className="tnav-status-dot" />
            <span className="tnav-status-text">LIVE · ZA</span>
          </div>
          <div className="nav-divider" />

          {/* Staging key */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setStagingHover(true)}
            onMouseLeave={() => setStagingHover(false)}
          >
            <button
              className={`tnav-icon-btn${stagingCopied ? " tnav-icon-btn-copied" : ""}`}
              onClick={() => {
                navigator.clipboard.writeText("stg-key-shield-a1b2c3d4e5f6");
                setStagingCopied(true);
                setTimeout(() => setStagingCopied(false), 2500);
              }}
            >
              <CopyIcon size={14} />
            </button>
            {stagingHover && (
              <div className="tnav-staging-tooltip">
                <div className="tnav-staging-tooltip-header">
                  Shield Testing Key
                </div>
                {stagingCopied ? (
                  <div className="tnav-staging-tooltip-copied">
                    ✓ Copied to clipboard!
                  </div>
                ) : (
                  <div className="tnav-staging-tooltip-copied">
                    Click to copy staging key
                  </div>
                )}
                <div className="tnav-staging-tooltip-hint">
                  Pass value as a parameter in Shield JS API call
                  <br />
                  i.e{" "}
                  <span className="tnav-staging-tooltip-code">
                    mcpstagingkey=xxxxxxxx
                  </span>
                </div>
                <div className="tnav-staging-tooltip-arrow" />
              </div>
            )}
          </div>

          {/* Notifications — admin only */}
          {!isPartner && (
            <div className="tnav-notif-wrap">
              <button
                className="tnav-notif-btn"
                onClick={() => setNotifOpen((v) => !v)}
                type="button"
              >
                🔔
              </button>
              {UNREAD_COUNT > 0 ? (
                <span className="tnav-notif-badge">{UNREAD_COUNT}</span>
              ) : (
                <span className="tnav-notif-pip" />
              )}
              {notifOpen && <NotifDropdown />}
            </div>
          )}

          {/* Support — partner only */}
          {isPartner && (
            <div className="tnav-support-wrap">
              <button
                className="tnav-support-btn"
                onClick={() => setPage("support")}
                type="button"
              >
                Support
              </button>
              {supportUnread > 0 && (
                <span className="tnav-support-badge">{supportUnread}</span>
              )}
            </div>
          )}

          {/* Settings */}
          <button
            className="tnav-icon-btn"
            title="GUI Settings"
            onClick={() => setSettingsOpen((v) => !v)}
          >
            <SettingsIcon size={16} />
          </button>

          <div className="tnav-avatar">{isPartner ? "P" : "A"}</div>
          <div className="nav-divider" />

          {/* Sign out */}
          <button
            className="tnav-icon-btn tnav-logout-icon"
            title="Sign out"
            onClick={onLogout}
            type="button"
          >
            <LogOutIcon size={16} />
          </button>
        </div>
      </div>
      {settingsOpen && <SettingsPanel />}
    </header>
  );
}