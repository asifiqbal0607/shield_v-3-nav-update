import React, { useEffect, useState } from "react";
import AppLayout from "./layout/AppLayout";
import PageRouter from "./routes";
import Login from "./auth/Login";
import Logout from "./auth/Logout";
import { useAuth } from "./hooks/useAuth";
import { TicketProvider } from "./context/TicketContext";
import { ALL_PAGES } from "./components/constants/nav";

const PAGE_STORAGE_KEY = "shield-active-page";
const VALID_PAGE_KEYS = new Set([
  ...ALL_PAGES.map((item) => item.key),
  "onboarding",
  "svc-onboarding",
  "user-onboarding",
  "users-all",
  "users-roles",
  "svc-registry",
  "svc-api",
  "svc-webhooks",
]);

function getStoredPage() {
  if (typeof window === "undefined") return "overview";
  const stored = window.localStorage.getItem(PAGE_STORAGE_KEY);
  return VALID_PAGE_KEYS.has(stored) ? stored : "overview";
}

export default function App() {
  const {
    auth,
    role,
    userType,
    showLogout,
    setShowLogout,
    setUserType,
    handleLogin,
    handleSetRole,
    handleLogoutConfirm,
  } = useAuth();

  const [page, setPage] = useState(getStoredPage);
  const [pageContext, setPageContext] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(PAGE_STORAGE_KEY, page);
  }, [page]);

  const handleLoginAndRedirect = (role) => {
    handleLogin(role);
    setPage("overview");
    setPageContext(null);
  };

  const handleNav = (newPage, context) => {
    // context is either a string (legacy role switch) or an object (page context)
    if (context !== null && typeof context === "object") {
      setPage(newPage);
      setPageContext(context);
    } else if (typeof context === "string") {
      // legacy: setPage(page, role)
      handleSetRole(context);
      setPage("overview");
      setPageContext(null);
    } else {
      setPage(newPage);
      setPageContext(null);
    }
  };

  if (!auth)
    return <Login onLogin={handleLoginAndRedirect} />;

  if (showLogout)
    return (
      <Logout
        role={role}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogout(false)}
      />
    );

  return (
    <TicketProvider>
      <AppLayout
        role={role}
        setRole={(r) => { handleSetRole(r); setPage("overview"); setPageContext(null); }}
        page={page}
        setPage={handleNav}
        onLogout={() => setShowLogout(true)}
        capLimit={role === "partner" ? { value: 500, period: "day", used: 347 } : null}
      >
        <PageRouter
          page={page}
          pageContext={pageContext}
          role={role}
          userType={userType}
          setUserType={setUserType}
          setPage={handleNav}
        />
      </AppLayout>
    </TicketProvider>
  );
}
