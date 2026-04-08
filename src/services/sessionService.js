/**
 * services/sessionService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Browser session persistence helpers.
 * No React — pure functions that read/write sessionStorage.
 *
 * Extracted from App.jsx (saveSession, loadSession, clearSession).
 *
 * Usage:
 *   import { saveSession, loadSession, clearSession, SESSION_TIMEOUT } from '../services/sessionService';
 */

export const SESSION_KEY     = "shield_session";
export const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in ms

/**
 * Persist the current role and timestamp to sessionStorage.
 * @param {string} role — 'admin' | 'partner'
 */
export function saveSession(role) {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ role, lastActive: Date.now() }),
  );
}

/**
 * Load the stored session if it exists and hasn't expired.
 * Returns the role string or null.
 * @returns {'admin'|'partner'|null}
 */
export function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { role, lastActive } = JSON.parse(raw);
    if (Date.now() - lastActive > SESSION_TIMEOUT) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return role;
  } catch {
    return null;
  }
}

/**
 * Destroy the current session (on logout or timeout).
 */
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
