import { useState } from "react";
import { EyeIcon, EyeOffIcon, AlertIcon, MailIcon } from "../components/ui/Icons";

/* ─────────────────────────────────────────────────────────────────────────────
   Authentication/Login.jsx
   ➜ Two views: "login" | "forgot"  — toggled by local state
   ➜ Zero inline styles — all classes defined in global.css (.login-*)
   ➜ Props:
       onLogin(role)  — called with 'admin' | 'partner' on success

   Demo credentials (swap handleSubmit with a real API call when ready):
       admin@shield.com   /  admin
       partner@shield.com /  partner
───────────────────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: "🛡️",
    label: "Real-time Threat Detection",
    desc: "Block malicious traffic across all channels instantly",
  },
  {
    icon: "📊",
    label: "Unified Analytics",
    desc: "Deep insights across apps, browsers and in-app traffic",
  },
  {
    icon: "🌐",
    label: "Global Coverage",
    desc: "Geo-aware protection with 190+ country intelligence",
  },
  {
    icon: "⚙️",
    label: "Granular Controls",
    desc: "Per-service rules, partner access and permission tiers",
  },
];

/* ── Shared left brand panel ─────────────────────────────────────────────── */
function BrandPanel() {
  return (
    <aside className="login-left">
      <div className="login-logo">S</div>
      <p className="login-eyebrow">MCP Shield</p>
      <h1 className="login-hero-title">
        Intelligent<br />Threat Protection
      </h1>
      <p className="login-hero-sub">
        Enterprise-grade security analytics and access control
        for your entire traffic ecosystem.
      </p>
      <div className="login-features">
        {FEATURES.map((f) => (
          <div key={f.label} className="login-feature">
            <span className="login-feature-icon">{f.icon}</span>
            <div>
              <div className="login-feature-label">{f.label}</div>
              <div className="login-feature-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ── Login form ──────────────────────────────────────────────────────────── */
function LoginForm({ onLogin, onForgot }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email.trim())    return setError("Please enter your email address.");
    if (!password.trim()) return setError("Please enter your password.");

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);

    // ── Replace with your real API call ──────────────────────────────────
    if (email === "admin@shield.com" && password === "admin") {
      onLogin("admin");
    } else if (email === "partner@shield.com" && password === "partner") {
      onLogin("partner");
    } else {
      setError("Invalid email or password. Please try again.");
    }
    // ─────────────────────────────────────────────────────────────────────
  };

  return (
    <div className="login-card">
      <div className="login-card-header">
        <h2 className="login-card-title">Welcome back</h2>
        <p className="login-card-sub">
          Sign in to your Shield dashboard to continue.
        </p>
      </div>

      {error && (
        <div className="login-alert err">
          <AlertIcon size={15} /> {error}
        </div>
      )}

      <div className="login-field">
        <label className="login-label" htmlFor="login-email">
          Email address
        </label>
        <input
          id="login-email"
          className="login-input"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoComplete="email"
        />
      </div>

      <div className="login-field">
        <label className="login-label" htmlFor="login-pw">Password</label>
        <div className="login-pw-wrap">
          <input
            id="login-pw"
            className="login-input login-pw-input"
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoComplete="current-password"
          />
          <button
            className="login-pw-eye"
            onClick={() => setShowPw((v) => !v)}
            type="button"
            aria-label="Toggle password visibility"
          >
            {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        </div>
      </div>

      <div className="login-meta">
        <label className="login-remember">
          <input
            className="login-remember-check"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember me
        </label>
        <button
          className="login-forgot-link"
          onClick={onForgot}
          type="button"
        >
          Forgot password?
        </button>
      </div>

      <button
        className="login-btn"
        onClick={handleSubmit}
        disabled={loading}
        type="button"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p className="login-footer">
        Protected by MCP Shield · 256-bit encryption
      </p>
    </div>
  );
}

/* ── Forgot password form ────────────────────────────────────────────────── */
function ForgotForm({ onBack }) {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email.trim()) return setError("Please enter your email address.");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="login-card">
        <button className="login-back-btn" onClick={onBack} type="button">
          ← Back to sign in
        </button>
        <div className="login-success-icon"><MailIcon size={40} /></div>
        <div className="login-card-header">
          <h2 className="login-card-title">Check your inbox</h2>
          <p className="login-card-sub">
            We've sent a reset link to <strong>{email}</strong>.
            It may take a minute — check your spam folder if needed.
          </p>
        </div>
        <button className="login-btn" onClick={onBack} type="button">
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="login-card">
      <button className="login-back-btn" onClick={onBack} type="button">
        ← Back to sign in
      </button>

      <div className="login-card-header">
        <h2 className="login-card-title">Reset your password</h2>
        <p className="login-card-sub">
          Enter your account email and we'll send you a secure link
          to create a new password.
        </p>
      </div>

      {error && (
        <div className="login-alert err">
          <AlertIcon size={15} /> {error}
        </div>
      )}

      <div className="login-field">
        <label className="login-label" htmlFor="forgot-email">
          Email address
        </label>
        <input
          id="forgot-email"
          className="login-input"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoComplete="email"
        />
      </div>

      <button
        className="login-btn"
        onClick={handleSubmit}
        disabled={loading}
        type="button"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>

      <p className="login-footer">
        Remember your password?{" "}
        <button className="login-forgot-link" onClick={onBack} type="button">
          Sign in
        </button>
      </p>
    </div>
  );
}

/* ── Root export ─────────────────────────────────────────────────────────── */
export default function Login({ onLogin }) {
  const [view, setView] = useState("login"); // "login" | "forgot"

  return (
    <div className="login-root">
      <BrandPanel />
      <main className="login-right">
        {view === "login" ? (
          <LoginForm
            onLogin={onLogin}
            onForgot={() => setView("forgot")}
          />
        ) : (
          <ForgotForm onBack={() => setView("login")} />
        )}
      </main>
    </div>
  );
}