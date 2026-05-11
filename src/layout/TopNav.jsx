import { useState, useRef, useEffect } from "react";
import { CopyIcon, SettingsIcon, LogOutIcon } from "../components/ui/Icons";
import { useTickets } from "../context/TicketContext";

// ── GUI Settings panel (unchanged logic) ─────────────────────────────────────
function GUISettings() {
  const [clientStats,   setClientStats]   = useState("regular");
  const [clientListing, setClientListing] = useState("show");
  const [fontSize,      setFontSize]      = useState(8);
  const [annotations,   setAnnotations]   = useState(true);

  return (
    <div className="gui-s-wrap">
      <div className="gui-s-section">
        <div className="gui-s-section-title">Clients</div>
        <div className="gui-s-row">
          <span className="gui-s-label">Stats</span>
          <div className="gui-s-radio-group">
            {["demo", "regular"].map((v) => (
              <label key={v} className="gui-s-radio">
                <input type="radio" name="clientStats" value={v}
                  checked={clientStats === v} onChange={() => setClientStats(v)} />
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
                <input type="radio" name="clientListing" value={v}
                  checked={clientListing === v} onChange={() => setClientListing(v)} />
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
          <input type="range" min={8} max={20} step={2} value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))} className="gui-s-slider" />
          <div className="gui-s-slider-ticks">
            {[8,10,12,14,16,18,20].map((v) => <span key={v}>{v}</span>)}
          </div>
        </div>
      </div>
      <div className="gui-s-divider" />
      <div className="gui-s-section">
        <div className="gui-s-section-title">Annotations</div>
        <div className="gui-s-row gui-s-row-between">
          <span className="gui-s-label">Show/Hide</span>
          <button className={`gui-s-toggle${annotations ? " on" : ""}`}
            onClick={() => setAnnotations((v) => !v)} type="button">
            <span className="gui-s-toggle-knob" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Notification dropdown (unchanged logic) ───────────────────────────────────
const PARTNER_ALERTS = [
  { id: "TKT-0041", partner: "Tiot",        category: "blocking",    priority: "critical", subject: "Clicks blocked on ZA network during UAT", time: "2 min ago" },
  { id: "TKT-0040", partner: "DTAC",        category: "integration", priority: "high",     subject: "Shield JS not firing on iOS 17 Safari",   time: "1 hr ago"  },
  { id: "TKT-0039", partner: "IQ InterCom", category: "data",        priority: "medium",   subject: "Conversion count mismatch vs reports",     time: "2 hrs ago" },
];
const PRI_COLOR = { critical: "#dc2626", high: "#d97706", medium: "#1652c8", low: "#0d9e6e" };
const CAT_ICON  = { blocking: "🚫", integration: "🔗", performance: "⚡", data: "📊", access: "🔑", other: "💬" };

// ── Slim topbar ───────────────────────────────────────────────────────────────
export default function TopNav({ role, setPage, onLogout }) {
  const [settingsOpen,  setSettingsOpen]  = useState(false);
  const [stagingCopied, setStagingCopied] = useState(false);
  const [stagingHover,  setStagingHover]  = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const notifWrapRef = useRef(null);

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!notifOpen) return;
    function handleOutside(e) {
      if (notifWrapRef.current && !notifWrapRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [notifOpen]);

  const isPartner    = role === "partner";
  const isCAdmin     = role === "c-admin";
  const { getUnreadCount } = useTickets();
  const supportUnread = isPartner ? getUnreadCount("Tiot") : 0;
  const UNREAD_COUNT  = PARTNER_ALERTS.length;

  return (
    <header className="topbar">
      {/* Brand */}
      <div className="topbar-brand">
        <span className="topbar-logo">S</span>
        <span className="topbar-name">MCP SHIELD</span>
        <span className="topbar-sub">{isPartner ? "Partner" : isCAdmin ? "C-Admin" : "Admin"}</span>
      </div>

      {/* Right side */}
      <div className="topbar-right">
        {/* Live pill */}
        <div className="topbar-live-pill">
          <span className="topbar-live-dot" />
          LIVE · ZA
        </div>

        {/* Copy staging key */}
        <div className="topbar-icon-wrap"
          onMouseEnter={() => setStagingHover(true)}
          onMouseLeave={() => setStagingHover(false)}>
          <button
            type="button"
            className={`topbar-icon-btn${stagingCopied ? " copied" : ""}`}
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
              <div className="tnav-staging-tooltip-header">Shield Testing Key</div>
              <div className="tnav-staging-tooltip-copied">
                {stagingCopied ? "✓ Copied to clipboard!" : "Click to copy staging key"}
              </div>
              <div className="tnav-staging-tooltip-hint">
                Pass value as a parameter in Shield JS API call<br />
                i.e <span className="tnav-staging-tooltip-code">mcpstagingkey=xxxxxxxx</span>
              </div>
              <div className="tnav-staging-tooltip-arrow" />
            </div>
          )}
        </div>

        {/* Bell — admin only */}
        {!isPartner && (
          <div className="topbar-notif-wrap" ref={notifWrapRef}>
            <button type="button" className="topbar-icon-btn"
              onClick={() => setNotifOpen((v) => !v)}>
              🔔
            </button>
            {UNREAD_COUNT > 0 && (
              <span className="topbar-notif-badge">{UNREAD_COUNT}</span>
            )}
            {notifOpen && (
              <div className="tnav-notif-dropdown topbar-notif-dropdown">
                  <div className="tnav-notif-hd">
                    <span className="tnav-notif-hd-title">Partner Tickets</span>
                    <span className="tnav-notif-hd-count">{UNREAD_COUNT} new</span>
                  </div>
                  <div className="tnav-notif-list">
                    {PARTNER_ALERTS.map((t) => (
                      <div key={t.id} className="tnav-notif-item"
                        onClick={() => { setNotifOpen(false); setPage("support"); }}>
                        <span className="tnav-notif-cat-icon">{CAT_ICON[t.category] ?? "💬"}</span>
                        <div className="tnav-notif-item-body">
                          <div className="tnav-notif-item-subject">{t.subject}</div>
                          <div className="tnav-notif-item-meta">
                            <span className="tnav-notif-item-partner">{t.partner}</span>
                            <span className="tnav-notif-item-sep">·</span>
                            <span className="tnav-notif-item-time">{t.time}</span>
                          </div>
                        </div>
                        <span className="tnav-notif-pri-dot" />
                      </div>
                    ))}
                  </div>
                  <button className="tnav-notif-footer" type="button"
                    onClick={() => { setNotifOpen(false); setPage("support"); }}>
                    View all tickets →
                  </button>
                </div>
            )}
          </div>
        )}

        {/* Support pill — partner only */}
        {isPartner && (
          <div className="topbar-support-wrap">
            <button type="button" className="topbar-support-btn"
              onClick={() => setPage("support")}>
              Support
            </button>
            {supportUnread > 0 && (
              <span className="topbar-notif-badge">{supportUnread}</span>
            )}
          </div>
        )}

        {/* Settings */}
        <button type="button" className="topbar-icon-btn" title="GUI Settings"
          onClick={() => setSettingsOpen((v) => !v)}>
          <SettingsIcon size={15} />
        </button>

        {/* Separator */}
        <div className="topbar-sep" />

        {/* Avatar */}
        <div className="topbar-avatar">{isPartner ? "P" : "A"}</div>

        {/* Logout */}
        <button type="button" className="topbar-icon-btn topbar-logout" title="Sign out"
          onClick={onLogout}>
          <LogOutIcon size={15} />
        </button>
      </div>

      {/* GUI Settings panel */}
      {settingsOpen && (
        <>
          <div className="gui-settings-backdrop" onClick={() => setSettingsOpen(false)} />
          <div className="gui-settings-panel">
            <div className="gui-settings-header">
              <span className="gui-settings-title">GUI Settings</span>
              <button className="gui-settings-close" onClick={() => setSettingsOpen(false)}>×</button>
            </div>
            <div className="gui-settings-body"><GUISettings /></div>
          </div>
        </>
      )}
    </header>
  );
}
