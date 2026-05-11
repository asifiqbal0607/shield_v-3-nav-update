import { useState } from "react";
import { LockIcon } from "../components/ui/Icons";

/* ─────────────────────────────────────────────────────────────────────────────
   Authentication/Logout.jsx
   ➜ Full-screen confirmation shown when user clicks "Sign out" in TopNav
   ➜ Zero inline styles — all classes defined in global.css (.logout-*)
   ➜ Props:
       role       — 'admin' | 'partner'  (displays current session details)
       onConfirm  — called after confirming → App.jsx sets auth = null
       onCancel   — called on cancel → returns user to dashboard
───────────────────────────────────────────────────────────────────────────── */

export default function Logout({ role, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    // Replace with your real logout / session-clear API call
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    onConfirm();
  };

  const isAdmin      = role === "admin";
  const isCAdmin     = role === "c-admin";
  const displayName  = isAdmin ? "Admin User" : isCAdmin ? "Liam Patel" : "Partner User";
  const displayEmail = isAdmin ? "admin@shield.com" : isCAdmin ? "cadmin@shield.com" : "partner@shield.com";
  const roleLabel    = isAdmin ? "Administrator" : isCAdmin ? "C-Admin" : "Partner";
  const avatarLetter = isAdmin ? "A" : isCAdmin ? "C" : "P";

  return (
    <div className="logout-root">
      <div className="logout-card">

        {/* Shield logo */}
        <div className="logout-logo">S</div>

        {/* Icon */}
        <div className="logout-icon-wrap"><LockIcon size={32} /></div>

        <h2 className="logout-title">Sign out of Shield?</h2>
        <p className="logout-sub">
          You're about to end your current session. Any unsaved changes
          will be lost. You can sign back in at any time.
        </p>

        {/* Current session card */}
        <div className="logout-session-info">
          <div className="logout-session-avatar">{avatarLetter}</div>
          <div>
            <div className="logout-session-name">{displayName}</div>
            <div className="logout-session-role">
              {roleLabel} · {displayEmail}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="logout-btn-row">
          <button
            className="logout-btn-cancel"
            onClick={onCancel}
            type="button"
            disabled={loading}
          >
            Stay signed in
          </button>
          <button
            className="logout-btn-confirm"
            onClick={handleConfirm}
            type="button"
            disabled={loading}
          >
            {loading ? "Signing out…" : "Yes, sign out"}
          </button>
        </div>

      </div>
    </div>
  );
}
