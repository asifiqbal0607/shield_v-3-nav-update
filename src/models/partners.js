/**
 * models/partners.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Raw partner registry — the single source of truth for all partner data.
 * No logic, no React. Just the shape of a partner record.
 *
 * Shape:
 *   id           number   — unique identifier
 *   name         string   — display name
 *   services     string[] — list of service names belonging to this partner
 *   baseTraffic  number   — monthly traffic baseline (used by trafficService)
 */

export const ALL_PARTNERS = [
  {
    id: 1,
    name: "Tiot",
    services: ["GC 2231 Playit", "True Digital Horo Sap4"],
    baseTraffic: 2068656,
  },
  {
    id: 2,
    name: "DTAC",
    services: ["Teleinfotech Duang Den", "GVI Services Sub-Acc"],
    baseTraffic: 324419,
  },
  {
    id: 3,
    name: "IQ InterCom",
    services: ["True Digital XR Academy", "Health Care 2"],
    baseTraffic: 82586,
  },
  {
    id: 4,
    name: "one-plan",
    services: ["Horo Lucky Dee9"],
    baseTraffic: 57717,
  },
  {
    id: 5,
    name: "Media World",
    services: ["iPay Service", "Wan Duang Dee 3"],
    baseTraffic: 46657,
  },
  {
    id: 6,
    name: "IQ Saleno",
    services: ["Hora Duange4"],
    baseTraffic: 34234,
  },
  {
    id: 7,
    name: "IQ Ademmdia",
    services: ["Horo Sap2"],
    baseTraffic: 20348,
  },
  {
    id: 8,
    name: "IQ Mobileker",
    services: ["Shield Core API"],
    baseTraffic: 17233,
  },
  {
    id: 9,
    name: "Mobimrall ISA",
    services: ["Click Guard Pro"],
    baseTraffic: 15444,
  },
  {
    id: 10,
    name: "IQ Beneot",
    services: ["True Digital Wan Dee"],
    baseTraffic: 14162,
  },
  {
    id: 11,
    name: "IQ Stane Media",
    services: ["APK Scanner v2"],
    baseTraffic: 13430,
  },
  {
    id: 12,
    name: "IQ Digital Union",
    services: ["Fraud Net Detector"],
    baseTraffic: 13089,
  },
  {
    id: 13,
    name: "Mobimrall Corp",
    services: ["GVI Export Service"],
    baseTraffic: 11878,
  },
  {
    id: 14,
    name: "IQ Takanda",
    services: ["Notification Hub"],
    baseTraffic: 11523,
  },
  {
    id: 15,
    name: "IQ TROU2",
    services: ["Map Service Gateway"],
    baseTraffic: 6422,
  },
  {
    id: 16,
    name: "IQ Namake",
    services: ["IP Shield Layer"],
    baseTraffic: 5615,
  },
  { id: 17, name: "JIOUZ",               services: [], baseTraffic: 5075  },
  { id: 18, name: "IQ Grand Technology", services: [], baseTraffic: 4881  },
  { id: 19, name: "jtor",                services: [], baseTraffic: 4140  },
  { id: 20, name: "IQ Arc",              services: [], baseTraffic: 3710  },
];
