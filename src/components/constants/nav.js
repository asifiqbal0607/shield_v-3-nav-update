import { GREEN } from "./colors";
import {
  LayoutDashboard,
  Users,
  Settings2,
  Handshake,
  Globe,
  ClipboardList,
  BarChart3,
  ShieldBan,
  MapPin,
  Smartphone,
  PackageSearch,
  Activity,
  BookOpen,
  ShieldAlert,
  KeyRound,
  HeadphonesIcon,
} from "lucide-react";

export const NAV_GROUPS = [
  {
    group: null,
    items: [
      { key: "overview",   label: "Dashboard",   icon: LayoutDashboard, color: "#6366f1", roles: ["admin", "partner", "c-admin"] },
    ],
  },
  {
    group: "Management",
    items: [
      { key: "users",      label: "Manage Users",    icon: Users,         color: "#3b82f6", roles: ["admin", "partner"] },
      { key: "services",   label: "Manage Services", icon: Settings2,     color: "#8b5cf6", roles: ["admin", "partner", "c-admin"] },
      { key: "partners",   label: "Partners",        icon: Handshake,     color: "#10b981", roles: ["admin"], badge: { n: "12", c: GREEN } },
      { key: "ip-manager", label: "IP Manager",      icon: Globe,         color: "#0ea5e9", roles: ["admin"] },
      { key: "audit",      label: "Audit Log",       icon: ClipboardList, color: "#f59e0b", roles: ["admin"], badge: { n: "New", c: GREEN } },
    ],
  },
  {
    group: "Analytics",
    items: [
      { key: "reporting",       label: "Reporting",       icon: BarChart3,     color: "#f97316", roles: ["admin", "partner", "c-admin"] },
      { key: "block",           label: "Block Reasons",   icon: ShieldBan,     color: "#ef4444", roles: ["admin", "partner", "c-admin"] },
      { key: "geo",             label: "GEO Stats",       icon: MapPin,        color: "#14b8a6", roles: ["admin", "partner", "c-admin"] },
      { key: "device",          label: "Device Stats",    icon: Smartphone,    color: "#a78bfa", roles: ["admin", "partner", "c-admin"] },
      { key: "apks",            label: "APK Stats",       icon: PackageSearch, color: "#f59e0b", roles: ["admin", "partner", "c-admin"] },
      { key: "traffic-sources", label: "Traffic Sources", icon: Activity,      color: "#06b6d4", roles: ["admin", "partner", "c-admin"], badge: { n: "New", c: GREEN } },
      { key: "ip-manager",      label: "IP Manager",      icon: Globe,         color: "#0ea5e9", roles: ["partner"] },
    ],
  },
  {
    group: "More",
    items: [
      { key: "traffic-sources", label: "Traffic Sources", icon: Activity, color: "#06b6d4", roles: ["partner", "c-admin"], badge: { n: "New", c: GREEN } },
    ],
  },
  {
    group: "Resources",
    items: [
      { key: "docs",        label: "Documentation",     icon: BookOpen,    color: "#64748b", roles: ["admin", "partner", "c-admin"] },
      { key: "fraud-codes", label: "Shield Fraud Codes", icon: ShieldAlert, color: "#dc2626", roles: ["admin"] },
      { key: "sandbox",     label: "Sandbox",           icon: KeyRound,    color: "#7c3aed", roles: ["admin", "partner", "c-admin"], badge: { n: "New", c: GREEN } },
      { key: "support",     label: "Support",           icon: HeadphonesIcon, color: "#0d9488", roles: ["partner", "c-admin"] },
    ],
  },
];

export const ALL_PAGES = NAV_GROUPS.flatMap((g) => g.items);

export function groupsForRole(role) {
  return NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.roles.includes(role)),
  })).filter((g) => g.items.length > 0);
}
