/**
 * hooks/useAuth.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages authentication state and the 15-minute inactivity timeout.
 *
 * Extracted from App.jsx — all the auth-related useState, useRef, useCallback,
 * and useEffect logic now lives here.
 *
 * Returns:
 *   auth            string|null  — current role ('admin'|'partner') or null
 *   role            string       — 'admin' | 'partner'
 *   userType        string       — 'Admin' | 'Client Partner'
 *   showLogout      bool         — whether the logout confirmation screen is showing
 *   handleLogin     fn(role)     — call on successful login
 *   handleSetRole   fn(role)     — switch role (admin ↔ partner) from sidebar
 *   handleLogoutConfirm fn()     — confirm logout, clears session
 *   setShowLogout   fn(bool)     — show/hide logout confirmation
 *   setUserType     fn(string)   — manual override for userType
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  saveSession,
  loadSession,
  clearSession,
  SESSION_TIMEOUT,
} from "../services/sessionService";

export function useAuth() {
  const [auth,        setAuth]        = useState(() => loadSession());
  const [role,        setRole]        = useState(() => loadSession() || "admin");
  const [userType,    setUserType]    = useState(() =>
    loadSession() === "partner" ? "Client Partner" : "Admin",
  );
  const [showLogout,  setShowLogout]  = useState(false);
  const timerRef = useRef(null);

  // ── Reset 15-min inactivity timer ────────────────────────────────────────
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (auth) {
      saveSession(role);
      timerRef.current = setTimeout(() => {
        clearSession();
        setAuth(null);
        setShowLogout(false);
      }, SESSION_TIMEOUT);
    }
  }, [auth, role]);

  // ── Attach activity listeners ─────────────────────────────────────────────
  useEffect(() => {
    if (!auth) return;
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [auth, resetTimer]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleLogin = (r) => {
    setRole(r);
    setUserType(r === "partner" ? "Client Partner" : "Admin");
    setAuth(r);
    saveSession(r);
  };

  const handleSetRole = (r) => {
    setRole(r);
    setUserType(r === "partner" ? "Client Partner" : "Admin");
    saveSession(r);
  };

  const handleLogoutConfirm = () => {
    clearSession();
    setAuth(null);
    setShowLogout(false);
  };

  return {
    auth,
    role,
    userType,
    showLogout,
    setShowLogout,
    setUserType,
    handleLogin,
    handleSetRole,
    handleLogoutConfirm,
  };
}
