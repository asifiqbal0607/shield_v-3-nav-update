/**
 * models/services.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Raw service registry — the single source of truth for all service data.
 * No logic, no React. Just the shape of a service record.
 *
 * Shape:
 *   id           number  — unique identifier
 *   name         string  — display name
 *   baseTraffic  number  — monthly traffic baseline (used by trafficService)
 */

export const ALL_SERVICES = [
  { id: 1,  name: "GC 2231 Playit",            baseTraffic: 1421866 },
  { id: 2,  name: "True Digital Horo Sap4",    baseTraffic: 326726  },
  { id: 3,  name: "Teleinfotech Duang Den",    baseTraffic: 120482  },
  { id: 4,  name: "GVI Services Sub-Acc",      baseTraffic: 46666   },
  { id: 5,  name: "True Digital XR Academy",   baseTraffic: 41037   },
  { id: 6,  name: "Health Care 2",             baseTraffic: 39854   },
  { id: 7,  name: "Horo Lucky Dee9",           baseTraffic: 33546   },
  { id: 8,  name: "iPay Service",              baseTraffic: 30668   },
  { id: 9,  name: "Wan Duang Dee 3",           baseTraffic: 28926   },
  { id: 10, name: "Hora Duange4",              baseTraffic: 24355   },
  { id: 11, name: "Horo Sap2",                 baseTraffic: 23254   },
  { id: 12, name: "Shield Core API",           baseTraffic: 21514   },
  { id: 13, name: "Click Guard Pro",           baseTraffic: 19903   },
  { id: 14, name: "True Digital Wan Dee",      baseTraffic: 16487   },
  { id: 15, name: "APK Scanner v2",            baseTraffic: 15187   },
  { id: 16, name: "Fraud Net Detector",        baseTraffic: 15171   },
  { id: 17, name: "GVI Export Service",        baseTraffic: 8234    },
  { id: 18, name: "Notification Hub",          baseTraffic: 7705    },
  { id: 19, name: "Map Service Gateway",       baseTraffic: 5351    },
  { id: 20, name: "IP Shield Layer",           baseTraffic: 5089    },
];
