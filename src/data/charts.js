// ─── Histogram (visits / clicks / subs — 26 time periods) ───────────────────
// Realistic telecom campaign: fast early ramp, sharp peak around P8-P10,
// then a realistic stepped decline with small mid-day bumps.
// Subs are clearly visible (not near zero), clicks track well below visits.
const VISITS_RAW = [
   42,  186,  420,  680,  890, 1020, 1140, 1260, 1380, 1440,
  1420, 1360, 1280, 1200, 1140, 1080, 1020,  960,  880,  800,
   710,  620,  520,  420,  320,  210,
];
const CLICKS_RAW = [
   18,   78,  174,  278,  362,  414,  460,  508,  556,  580,
  572,  548,  516,  484,  460,  436,  412,  388,  356,  324,
  288,  252,  212,  172,  130,   86,
];
const SUBS_RAW = [
   8,   36,   80,  128,  166,  190,  212,  234,  256,  268,
  264,  252,  238,  222,  212,  200,  190,  178,  164,  148,
  132,  116,   98,   78,   60,   40,
];

export const histogramData = Array.from({ length: 26 }, (_, i) => ({
  x: i,
  visits: VISITS_RAW[i] ?? 0,
  clicks: CLICKS_RAW[i] ?? 0,
  subs:   SUBS_RAW[i]   ?? 0,
}));

// ─── Blocking reasons (radar chart — by weekday) ─────────────────────────────
export const blockLegend = [
  { key: "Shield Bypassing", color: "#4a6fa5" },
  { key: "Desktop Traffic", color: "#c0392b" },
  { key: "Failed Interaction", color: "#e91e8c" },
  { key: "Bot Detected", color: "#f1c40f" },
  { key: "Remotely Controlled", color: "#8bc34a" },
  { key: "Spoofing", color: "#b0bec5" },
  { key: "APK Fraud", color: "#00bcd4" },
  { key: "Excessive IP", color: "#9c27b0" },
];

export const blockReasons = [
  {
    subject: "Sun",
    "Shield Bypassing": 4200,
    "Desktop Traffic": 2100,
    "Failed Interaction": 1600,
    "Bot Detected": 700,
    "Remotely Controlled": 2400,
    Spoofing: 1200,
    "APK Fraud": 600,
    "Excessive IP": 600,
  },
  {
    subject: "Mon",
    "Shield Bypassing": 3600,
    "Desktop Traffic": 2600,
    "Failed Interaction": 2200,
    "Bot Detected": 1400,
    "Remotely Controlled": 1700,
    Spoofing: 700,
    "APK Fraud": 1100,
    "Excessive IP": 750,
  },
  {
    subject: "Tue",
    "Shield Bypassing": 5100,
    "Desktop Traffic": 1700,
    "Failed Interaction": 1500,
    "Bot Detected": 2000,
    "Remotely Controlled": 2600,
    Spoofing: 1500,
    "APK Fraud": 600,
    "Excessive IP": 400,
  },
  {
    subject: "Wed",
    "Shield Bypassing": 3200,
    "Desktop Traffic": 3200,
    "Failed Interaction": 2600,
    "Bot Detected": 1100,
    "Remotely Controlled": 2100,
    Spoofing: 700,
    "APK Fraud": 1300,
    "Excessive IP": 880,
  },
  {
    subject: "Thu",
    "Shield Bypassing": 4500,
    "Desktop Traffic": 2400,
    "Failed Interaction": 1200,
    "Bot Detected": 1600,
    "Remotely Controlled": 3200,
    Spoofing: 1600,
    "APK Fraud": 700,
    "Excessive IP": 520,
  },
  {
    subject: "Fri",
    "Shield Bypassing": 3700,
    "Desktop Traffic": 2700,
    "Failed Interaction": 2000,
    "Bot Detected": 1300,
    "Remotely Controlled": 2500,
    Spoofing: 1100,
    "APK Fraud": 700,
    "Excessive IP": 640,
  },
  {
    subject: "Sat",
    "Shield Bypassing": 2600,
    "Desktop Traffic": 1600,
    "Failed Interaction": 1400,
    "Bot Detected": 600,
    "Remotely Controlled": 1600,
    Spoofing: 600,
    "APK Fraud": 500,
    "Excessive IP": 320,
  },
];

// ─── 30-day reporting trend ───────────────────────────────────────────────────
export const repTrend = Array.from({ length: 30 }, (_, i) => ({
  d: `Sep ${i + 1}`,
  visits: Math.floor(Math.sin(i / 4) * 200 + 600 + Math.random() * 80),
  clicks: Math.floor(Math.sin(i / 4) * 80 + 220 + Math.random() * 30),
  blocked: Math.floor(Math.sin(i / 3) * 40 + 100 + Math.random() * 20),
}));

// ── Top 20 Partners (admin view bar chart) ────────────────────────────────────
export const top20Partners = [
  { name: "Tiot",                total: 2068656, blocked: 124120, suspect: 291680, clean: 1652856 },
  { name: "DTAC",                total: 324419,  blocked: 89210,  suspect: 35286,  clean: 199923  },
  { name: "IQ InterCom",         total: 82586,   blocked: 12430,  suspect: 10523,  clean: 59633   },
  { name: "one-plan",            total: 57717,   blocked: 8900,   suspect: 7323,   clean: 41494   },
  { name: "Media World",         total: 46657,   blocked: 7200,   suspect: 5919,   clean: 33538   },
  { name: "IQ Saleno",           total: 34234,   blocked: 5100,   suspect: 4347,   clean: 24787   },
  { name: "IQ Ademmdia",         total: 20348,   blocked: 3800,   suspect: 2482,   clean: 14066   },
  { name: "IQ Mobileker",        total: 17233,   blocked: 2900,   suspect: 2150,   clean: 12183   },
  { name: "Mobimrall ISA",       total: 15444,   blocked: 2600,   suspect: 1927,   clean: 10917   },
  { name: "IQ Beneot",           total: 14162,   blocked: 2400,   suspect: 1764,   clean: 9998    },
  { name: "IQ Stane Media",      total: 13430,   blocked: 2200,   suspect: 1685,   clean: 9545    },
  { name: "IQ Digital Union",    total: 13089,   blocked: 2100,   suspect: 1648,   clean: 9341    },
  { name: "Mobimrall Corp",      total: 11878,   blocked: 1900,   suspect: 1497,   clean: 8481    },
  { name: "IQ Takanda",          total: 11523,   blocked: 1800,   suspect: 1452,   clean: 8271    },
  { name: "IQ TROU2",            total: 6422,    blocked: 1100,   suspect: 800,    clean: 4522    },
  { name: "IQ Namake",           total: 5615,    blocked: 900,    suspect: 703,    clean: 4012    },
  { name: "JIOUZ",               total: 5075,    blocked: 820,    suspect: 635,    clean: 3620    },
  { name: "IQ Grand Technology", total: 4881,    blocked: 790,    suspect: 612,    clean: 3479    },
  { name: "jtor",                total: 4140,    blocked: 670,    suspect: 519,    clean: 2951    },
  { name: "IQ Arc",              total: 3710,    blocked: 600,    suspect: 465,    clean: 2645    },
];

// ── Top 20 Services (partner view bar chart) ──────────────────────────────────
export const top20Services = [
  { name: "Shield Core",         total: 1840000, blocked: 110400, suspect: 276000, clean: 1453600 },
  { name: "Shield APK",          total: 290000,  blocked: 79750,  suspect: 31625,  clean: 178625  },
  { name: "Shield Browser",      total: 74000,   blocked: 11100,  suspect: 9435,   clean: 53465   },
  { name: "Shield In-App",       total: 51000,   blocked: 7900,   suspect: 6477,   clean: 36623   },
  { name: "Shield Geo",          total: 41000,   blocked: 6400,   suspect: 5207,   clean: 29393   },
  { name: "Shield Verify",       total: 30000,   blocked: 4500,   suspect: 3810,   clean: 21690   },
  { name: "Shield Fraud Log",    total: 18200,   blocked: 3400,   suspect: 2184,   clean: 12616   },
  { name: "Shield Traffic",      total: 15400,   blocked: 2600,   suspect: 1848,   clean: 10952   },
  { name: "Shield Analytics",    total: 13800,   blocked: 2300,   suspect: 1656,   clean: 9844    },
  { name: "Shield Block API",    total: 12600,   blocked: 2100,   suspect: 1512,   clean: 8988    },
  { name: "Shield Click Track",  total: 12000,   blocked: 2000,   suspect: 1440,   clean: 8560    },
  { name: "Shield Device Net",   total: 10600,   blocked: 1700,   suspect: 1272,   clean: 7628    },
  { name: "Shield Onboard",      total: 10500,   blocked: 1650,   suspect: 1260,   clean: 7590    },
  { name: "Shield Radar",        total: 10200,   blocked: 1600,   suspect: 1224,   clean: 7376    },
  { name: "Shield Score",        total: 5700,    blocked: 980,    suspect: 684,    clean: 4036    },
  { name: "Shield Proxy",        total: 5000,    blocked: 800,    suspect: 600,    clean: 3600    },
  { name: "Shield Stub",         total: 4500,    blocked: 730,    suspect: 540,    clean: 3230    },
  { name: "Shield Report",       total: 4300,    blocked: 700,    suspect: 516,    clean: 3084    },
  { name: "Shield Monitor",      total: 3700,    blocked: 590,    suspect: 444,    clean: 2666    },
  { name: "Shield Audit",        total: 3300,    blocked: 530,    suspect: 396,    clean: 2374    },
];