import PageStatsPerService from "../pages/StatsPerService";
import PageFraudCodes, { FraudDescriptionsModal } from "../pages/FraudCodes";
import PageIPManager from "../pages/IPManager";
import PageOverview from "../pages/Overview";
import PageBlock from "../pages/Blocking";
import PageAPKs from "../pages/APKs";
import PageReporting from "../pages/Reporting";
import PageUsers from "../pages/Users";
import PageServices from "../pages/Services";
import PageDevice from "../pages/DeviceNetworks";
import PageGeo from "../pages/Geo";
import PageOnboardingServices from "../components/modals/OnboardingServices";
import PageOnboardingUsers from "../components/modals/OnboardingUsers";
import PageStub from "../pages/Stub";
import PagePasswordGenerator from "../pages/PasswordGenerator";
import PagePartners from "../pages/Partners";
import Trafficsources from "../pages/TrafficSources";
import PageSupport from "../pages/Support";

const ALIASES = {
  "users-all": "users",
  "users-roles": "users",
  "svc-registry": "services",
  "svc-api": "services",
  "svc-webhooks": "services",
};

export default function PageRouter({
  page,
  pageContext,
  role = "admin",
  userType = "Admin",
  setUserType,
  setPage,
}) {
  const key = ALIASES[page] ?? page;

  // Partner clicking fraud-codes: show modal over overview, close returns to overview
  if (key === "fraud-codes" && role === "partner") {
    return (
      <>
        <PageOverview role={role} setPage={setPage}
          capLimit={role === "partner" ? { value: 500, period: "day", usedToday: 347 } : null} />
        <FraudDescriptionsModal onClose={() => setPage("overview")} />
      </>
    );
  }

  if (key === "users") return <PageUsers role={role} setPage={setPage} />;
  if (key === "services") return <PageServices role={role} setPage={setPage} />;

  if (key === "onboarding") return <PageOnboardingServices setPage={setPage} />;
  if (key === "svc-onboarding")
    return <PageOnboardingServices setPage={setPage} />;

  if (key === "user-onboarding")
    return <PageOnboardingUsers setPage={setPage} role={role} />;

  const ROUTES = {
    overview: (
      <PageOverview
        role={role}
        setPage={setPage}
        initialFilter={pageContext?.filterName ?? null}
        filterType={pageContext?.filterType ?? null}
        capLimit={role === "partner" ? { value: 500, period: "day", usedToday: 347 } : null}
      />
    ),
    "stats-per-service": <PageStatsPerService role={role} />,
    reporting: <PageReporting role={role} />,
    block: <PageBlock />,
    apks: <PageAPKs role={role} />,
    device: <PageDevice role={role} />,
    geo: <PageGeo />,
    partners: <PagePartners />,
    "fraud-codes": <PageFraudCodes role={role} />,
    audit: <PageStub title="Audit Log" icon="📋" />,
    docs: <PageStub title="Documentation" icon="📖" />,
    sandbox: <PageStub title="Sandbox Environment" icon="🧪" />,
    "password-generator": <PagePasswordGenerator />,
    "ip-manager": <PageIPManager role={role} />,
    "traffic-sources": <Trafficsources />,
    "support": <PageSupport role={role} />,
  };

  return ROUTES[key] ?? <PageOverview role={role} setPage={setPage} />;
}