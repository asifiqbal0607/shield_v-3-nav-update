import { useState, useCallback, useEffect } from "react";

const T = "#1a6fd4"; // blue matching screenshot

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  special: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generate(length, options, custom) {
  let charset = "";
  if (options.uppercase) charset += CHAR_SETS.uppercase;
  if (options.lowercase) charset += CHAR_SETS.lowercase;
  if (options.numbers) charset += CHAR_SETS.numbers;
  if (options.special) charset += CHAR_SETS.special;
  if (custom) charset += custom;
  if (!charset) return "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((v) => charset[v % charset.length])
    .join("");
}

function PasswordModal({ onClose }) {
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
      setPassword(generate(len, opts, cust));
      setCopied(false);
    },
    [length, options, custom, useCustom],
  );

  useEffect(() => {
    regen();
  }, []);

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

  // Close on Escape
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const optButtons = [
    { key: "uppercase", label: "Uppercase Letters" },
    { key: "lowercase", label: "Lowercase Letters" },
    { key: "numbers", label: "Numbers" },
    { key: "special", label: "Special Characters" },
  ];

  return (
    <div className="pg-overlay">
      <div className="pg-modal">
        {/* Header */}
        <div className="pg-header">
          <div>
            <div className="pg-title">MCP Shield Password Generator</div>
            <div className="pg-subtitle">
              Modify the settings below as needed.
            </div>
          </div>
          <button onClick={onClose} className="pg-close-btn">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="pg-body">
          {/* Password output */}
          <div className="pg-field">
            <div className="pg-range-header">
              <span className="pg-range-label">Length</span>
              <span className="pg-range-val">{length}</span>
            </div>
            <input
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={(e) => {
                const v = Number(e.target.value);
                setLength(v);
                regen(v, options, useCustom ? custom : "");
              }}
              className="pg-range-input"
            />
          </div>

          {/* Option buttons — 2x2 grid */}
          <div className="pg-opts-grid">
            {optButtons.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleOpt(key)}
                className={`pg-opt-btn${options[key] ? " active" : ""}`}
              >
                <span className="pg-opt-check">✓</span>
                {label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Custom charset */}
          <div className="pg-custom-row">
            <input
              type="checkbox"
              id="custom-cb"
              checked={useCustom}
              onChange={(e) => {
                setUseCustom(e.target.checked);
                regen(length, options, e.target.checked ? custom : "");
              }}
              className="pg-checkbox"
            />
            <label htmlFor="custom-cb" className="pg-custom-label">
              CUSTOM
            </label>
            <input
              type="text"
              value={custom}
              disabled={!useCustom}
              onChange={(e) => {
                setCustom(e.target.value);
                regen(length, options, e.target.value);
              }}
              placeholder="Enter custom characters..."
              className="pg-custom-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PagePasswordGenerator() {
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Trigger button if modal is closed */}
      {!open && (
        <div className="pg-trigger-wrap">
          <button onClick={() => setOpen(true)} className="pg-gen-btn">
            🔑 Open Password Generator
          </button>
        </div>
      )}
      {open && <PasswordModal onClose={() => setOpen(false)} />}
    </>
  );
}
