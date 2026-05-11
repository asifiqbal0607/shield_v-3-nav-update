# MCP Shield Project Documentation

Last updated: 2026-05-11

## 1. Project Overview

MCP Shield is a React/Vite dashboard for security analytics, service onboarding, user management, traffic reporting, and support workflows. The product models different account roles, including Admin, Client/Partner, and C-Admin.

The current product is frontend-driven and uses local mock data from `src/data`. It is structured as a demo/prototype application that can later be connected to backend APIs.

## 2. Technology Stack

- React 18
- Vite 5
- Recharts for charts
- Lucide React and local icon wrappers for UI icons
- jsPDF, jsPDF AutoTable, and XLSX for exports/reporting utilities
- CSS in `src/styles/global.css`

## 3. Setup

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## 4. Demo Login Accounts

The demo login flow is defined in `src/auth/Login.jsx`.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@shield.com` | `admin` |
| Client/Partner | `partner@shield.com` | `partner` |
| C-Admin | `cadmin@shield.com` | `cadmin` |

## 5. High-Level Architecture

Important entry points:

- `src/main.jsx`: React app bootstrap.
- `src/App.jsx`: authentication gate, page state, layout composition.
- `src/routes/index.jsx`: maps current page key to page component and applies role routing rules.
- `src/layout/AppLayout.jsx`: top navigation, sidebar, filter drawer, page shell.
- `src/layout/Sidebar.jsx`: role-based sidebar menu.
- `src/components/constants/nav.js`: shared navigation metadata.
- `src/data/tables.js`: mock users, services, reports, and table data.
- `src/data/charts.js`: mock chart data.
- `src/styles/global.css`: global UI styling.

## 6. Main Pages

| Page | File | Purpose |
| --- | --- | --- |
| Overview | `src/pages/Overview.jsx` | Dashboard KPIs, traffic charts, partner/client stats. |
| Services | `src/pages/Services.jsx` | Service registry, C-Admin service scope, service actions, exports. |
| Users | `src/pages/Users.jsx` | User list, user details, edit users, assign C-Admin clients/services. |
| Reporting | `src/pages/Reporting.jsx` | Generate reports and view scoped reports by account owner. |
| Traffic Sources | `src/pages/TrafficSources.jsx` | Traffic source analytics. |
| Blocking | `src/pages/Blocking.jsx` | Block reason analytics. |
| Device Networks | `src/pages/DeviceNetworks.jsx` | Device/network analytics. |
| Geo | `src/pages/Geo.jsx` | Geographic distribution analytics. |
| APKs | `src/pages/APKs.jsx` | APK analytics. |
| Support | `src/pages/Support.jsx` | Support ticket workflow. |

## 7. Role Model

### Admin

Admin is the global platform role.

Admin can:

- View all main product sections.
- Manage users.
- Manage all services.
- Assign clients and services to C-Admin accounts.
- View reports for clients and C-Admins.
- Generate reports under a selected client or C-Admin account.

### Client/Partner

Client/Partner represents a normal client account.

Client/Partner can:

- Onboard services under its own account.
- View its own dashboard and analytics.
- View only reports generated under its own account.
- Generate reports only under its own account.

### C-Admin

C-Admin is a delegated client administrator. It is not a global admin.

C-Admin can:

- View dashboard stats only for assigned client accounts.
- View service access only for assigned clients/services.
- Onboard services only under assigned client accounts.
- Generate reports for:
  - the C-Admin account itself
  - clients assigned to that C-Admin
- View reports only for:
  - the C-Admin account itself
  - assigned client accounts

C-Admin cannot:

- Manage all users.
- Manage unassigned clients.
- Onboard services for unassigned clients.
- View reports for unassigned clients.
- Access global admin-only areas.

## 8. C-Admin Demo Account

The demo C-Admin account is stored in `src/data/tables.js`.

Current demo C-Admin:

- Name: Liam Patel
- Email: `liam@shield.io`
- Role: `C-Admins`
- Login role: `c-admin`
- Service onboarding enabled: `true`

Assigned clients:

- True Digital
- GVI
- Teleinfotech

Each assigned client has its own allowed service list. This controls which services C-Admin can view and manage.

## 9. C-Admin Client and Service Assignment

C-Admin client/service assignment is handled in:

- `src/components/modals/OnboardingUsers.jsx`
- `src/pages/Users.jsx`
- `src/data/tables.js`

Admin can assign clients to a C-Admin account. For each assigned client, Admin can also assign specific services.

The assignment UI uses a per-client search box. This means services are searched and selected within each client, instead of showing all services for all clients at once.

Stored fields:

- `assignedClientIds`: list of assigned client IDs.
- `assignedClientServices`: object keyed by client ID, with allowed service names.
- `serviceOnboardingEnabled`: controls whether the C-Admin can onboard services.

Example shape:

```js
{
  assignedClientIds: ["USR-051", "USR-052"],
  assignedClientServices: {
    "USR-051": ["Horo Sap4 - 4237424"],
    "USR-052": ["anus-sub-acc"]
  },
  serviceOnboardingEnabled: true
}
```

## 10. Service Onboarding Rules

Service onboarding is handled in:

- `src/components/modals/OnboardingServices.jsx`
- `src/pages/Services.jsx`

Client/Partner onboarding:

- Uses the normal service onboarding form.
- Service belongs to the logged-in client account.

C-Admin onboarding:

- Uses the same service onboarding form as client onboarding.
- Adds a required client account selector.
- The selector only contains clients assigned to the C-Admin.
- The new service is onboarded under the selected assigned client account.

C-Admin service onboarding entry points:

- Manage Services scope header: `+ Add Service for Client`
- Service Registration toolbar: `+ Onboard Service`

## 11. Dashboard Scope Rules

Dashboard scoping is implemented mainly in `src/pages/Overview.jsx`.

Admin:

- Sees global dashboard data.

Client/Partner:

- Sees only its own client dashboard.

C-Admin:

- Sees only assigned clients.
- Dashboard partner/client charts are scoped to assigned clients.
- Service pools are scoped to assigned clients and assigned service access.

## 12. Services Page Scope Rules

Services page scoping is implemented in `src/pages/Services.jsx`.

Admin:

- Sees all services.
- Can manage all services.

Client/Partner:

- Sees client-level services.
- Can onboard services for its own account.

C-Admin:

- Sees only assigned clients and assigned services.
- Can filter by all assigned clients or a specific assigned client.
- Can onboard a service under one selected assigned client.

## 13. Reporting Rules

Reporting is implemented in `src/pages/Reporting.jsx`.

Reports include ownership metadata:

- `ownerId`
- `ownerName`
- `ownerRole`

Admin reporting:

- Admin can view all reports for clients and C-Admins.
- Admin table shows `Account` and `Account Type`.
- Admin can generate a report under a selected client or C-Admin account.

Client/Partner reporting:

- Client sees only reports generated under its own account.
- Client generates reports only under its own account.

C-Admin reporting:

- C-Admin sees reports for:
  - its own C-Admin account
  - clients assigned to it
- C-Admin can generate reports for:
  - its own C-Admin account
  - assigned client accounts only
- C-Admin report table shows `Account` and `Account Type`.

## 14. Navigation Rules

Sidebar role visibility is implemented in:

- `src/layout/Sidebar.jsx`
- `src/components/constants/nav.js`
- `src/routes/index.jsx`

C-Admin sees client-facing sections, including:

- Overview
- Reporting
- Traffic Sources
- Manage Services
- Analytics sections
- Resources
- Support

C-Admin is blocked from global admin-only management pages such as full user management and partners.

## 15. Important Data Files

| File | Purpose |
| --- | --- |
| `src/data/tables.js` | Mock users, assigned clients, services, reports, transactions, partners. |
| `src/data/charts.js` | Mock chart data for dashboards and reporting. |
| `src/models/transactions.js` | Transaction-related model data. |
| `src/models/services.js` | Service model data. |
| `src/models/partners.js` | Partner model data. |

## 16. Current Limitations

This is currently a frontend prototype/demo.

Important limitations:

- Data is local and resets on page reload.
- Authentication is demo-only and hardcoded.
- Report generation is simulated.
- Service onboarding does not persist to a backend.
- Role authorization is enforced in frontend routing and UI logic only.
- A production version should enforce all scoping rules on the backend API.

## 17. Backend Integration Notes

For a production backend, the following API-level rules are required:

- Never trust frontend role checks alone.
- Store account ownership for reports, services, users, and dashboard data.
- Validate C-Admin access by assigned client IDs on every request.
- Validate assigned service access where service-level permissions apply.
- When C-Admin creates a service, require a target client ID and verify it is assigned.
- When C-Admin creates a report, require a target owner ID and verify it is either the C-Admin account or an assigned client.
- Admin can query across all client and C-Admin report owners.
- Client can query only its own reports and services.

## 18. Suggested QA Checklist

Admin:

- Can view all reports with account/account type columns.
- Can generate a report under a client account.
- Can generate a report under a C-Admin account.
- Can assign clients to C-Admin in edit user.
- Can assign client services to C-Admin using per-client search.

C-Admin:

- Sidebar shows client-facing options.
- Dashboard only shows assigned client stats.
- Manage Services only shows assigned clients/services.
- Service onboarding only lists assigned clients.
- Reporting shows C-Admin account and assigned client reports.
- Report generation only allows C-Admin account and assigned clients.
- Unassigned clients are not visible.

Client/Partner:

- Can onboard services under its own account.
- Sees only its own reports.
- Generates reports only under its own account.

## 19. Key Files Changed for C-Admin Scope

- `src/auth/Login.jsx`
- `src/hooks/useAuth.js`
- `src/layout/TopNav.jsx`
- `src/auth/Logout.jsx`
- `src/layout/Sidebar.jsx`
- `src/components/constants/nav.js`
- `src/routes/index.jsx`
- `src/data/tables.js`
- `src/pages/Overview.jsx`
- `src/pages/Services.jsx`
- `src/pages/Users.jsx`
- `src/pages/Reporting.jsx`
- `src/components/modals/OnboardingUsers.jsx`
- `src/components/modals/OnboardingServices.jsx`
- `src/components/charts/PartnersTrafficChart.jsx`
- `src/styles/global.css`

