import React, { useState, useEffect, useRef } from "react";

import { createPortal } from "react-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

import { Card, SectionTitle, Badge } from "../components/ui";
import {
  BLUE,
  GREEN,
  AMBER,
  ROSE,
  VIOLET,
  SLATE,
} from "../components/constants/colors";
import { repTrend } from "../data/charts";
import { userRows } from "../data/tables";
import {
  EyeIcon,
  EditIcon,
  SettingsIcon,
  ChevronDownIcon,
  LockIcon,
  PlusIcon,
  CloseIcon,
} from "../components/ui/Icons";

const T = "#0d9488"; // teal accent

const API_CALL_DATA = [
  { name: "Shield", calls: 10 },
  { name: "Click", calls: 8 },
  { name: "APK", calls: 6 },
  { name: "Fraud", calls: 5 },
  { name: "Export", calls: 70 },
  { name: "Geo", calls: 4 },
  { name: "Notification", calls: 320 },
];

const BAR_COLORS = [BLUE, GREEN, VIOLET, ROSE, AMBER, "#06b6d4", "#f97316"];

function getDemoCAdminAccount() {
  return userRows.find((u) => u.role === "C-Admins" && u.serviceOnboardingEnabled) || null;
}

function getAssignedClientAccounts(cAdmin = getDemoCAdminAccount()) {
  if (!cAdmin?.assignedClientIds?.length) return [];
  return cAdmin.assignedClientIds
    .map((id) => userRows.find((u) => u.id === id && u.role === "Clients"))
    .filter(Boolean);
}

function isServiceAllowedForCAdmin(service, cAdmin, client) {
  if (!cAdmin?.assignedClientServices || !client?.id) return true;
  const allowedServices = cAdmin.assignedClientServices[client.id] || [];
  if (!allowedServices.length) return false;
  return allowedServices.some((name) => service.name.includes(name));
}

const svcRows = [
  {
    id: 1,
    name: "True Digital Group Co.,Ltd (4237) | Horo Sap4 - 4237424 - True",
    serviceId: "-36KlpABQGMxF54qLUGn",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-01-10",
    lastUpdate: "2024-06-01",
  },
  {
    id: 2,
    name: "True Digital Group Co.,Ltd (4239) | Wan Duang dee 3 - 4239469 - True",
    serviceId: "-37bZ5MBQGMxF54qXIB_",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-01-12",
    lastUpdate: "2024-06-03",
  },
  {
    id: 3,
    name: "True Digital Group Co.,Ltd (4238) | Hora Duange4 - 4238572 - True",
    serviceId: "-6gEeJcBP_A8TV-HbUzE",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-01-15",
    lastUpdate: "2024-06-05",
  },
  {
    id: 4,
    name: "gvi services | anus-sub-acc",
    serviceId: "-8u4q5cB1fchDeWJNjg3",
    status: "active",
    client: "GVI",
    vsBrand: "--",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-02-01",
    lastUpdate: "2024-06-10",
  },
  {
    id: 5,
    name: "True Digital Group Co.,Ltd (4237) | Horo Sap - 4237421 - True",
    serviceId: "-H6llpABQGMxF54qjEGX",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-02-10",
    lastUpdate: "2024-06-12",
  },
  {
    id: 6,
    name: "Teleinfotech | Duang Den - 4218043 - True",
    serviceId: "-H6kiZEBQGMxF54qRUQX",
    status: "active",
    client: "Teleinfotech",
    vsBrand: "--",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-03-01",
    lastUpdate: "2024-06-15",
  },
  {
    id: 7,
    name: "True Digital Group Co.,Ltd (4239) | Health care 2 - 4239462 - True",
    serviceId: "-H7RZ5MBQGMxF54q0IAp",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-03-05",
    lastUpdate: "2024-06-18",
  },
  {
    id: 8,
    name: "True Digital Group Co.,Ltd (4238) | XR Academy - 4238069 - True",
    serviceId: "-Mp2d5AB-W5fcuufUc83",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-03-10",
    lastUpdate: "2024-06-20",
  },
  {
    id: 9,
    name: "True Digital Group Co.,Ltd (4239) | Horo Lucky Dee9 - 4239355 - True",
    serviceId: "-Muv_ZQB-W5fcuufnkmx",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-03-15",
    lastUpdate: "2024-06-22",
  },
  {
    id: 10,
    name: "True Digital Group Co.,Ltd (4237) | Horo Sap2 - 4237422 - True",
    serviceId: "-X6JlpABQGMxF54qHkFO",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-04-01",
    lastUpdate: "2024-06-25",
  },
  {
    id: 11,
    name: "iPay Service",
    serviceId: "qcmk0vBzyQ83DjMqcw",
    status: "inactive",
    client: "TPay",
    vsBrand: "--",
    type: "API",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-05-01",
    lastUpdate: "2024-07-01",
  },
  {
    id: 12,
    name: "True Digital Group Co.,Ltd (4237) | Playit 4G - 4237501 - True",
    serviceId: "-HojgaAp0UTzhMFYlJtg",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "Zain-IQ",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-01-13",
    lastUpdate: "2024-02-16",
  },
  {
    id: 13,
    name: "True Digital Group Co.,Ltd (4239) | iPay Gold - 4239510 - True",
    serviceId: "-udbpnuwsOUWVUbgcvu",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "TRUE",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-02-14",
    lastUpdate: "2024-03-17",
  },
  {
    id: 14,
    name: "True Digital Group Co.,Ltd (4238) | Lucky Star - 4238601 - True",
    serviceId: "-RD7dwLUJB7MlHxwlV7",
    status: "active",
    client: "True Digital",
    vsBrand: "ZainBrand",
    type: "--",
    mno: "DTAC",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-03-15",
    lastUpdate: "2024-04-18",
  },
  {
    id: 15,
    name: "GVI Services | sub-acc-gold",
    serviceId: "qa8vpn7mGbxDEYzXGiM",
    status: "active",
    client: "GVI",
    vsBrand: "GVI-Brand",
    type: "--",
    mno: "AIS",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-04-16",
    lastUpdate: "2024-05-19",
  },
  {
    id: 16,
    name: "True Digital Group Co.,Ltd (4237) | Wan Dee5 - 4237530 - True",
    serviceId: "-Hzq3gp48ycSwb6TXfpX",
    status: "active",
    client: "True Digital",
    vsBrand: "TrueMove",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-05-17",
    lastUpdate: "2024-06-20",
  },
  {
    id: 17,
    name: "Teleinfotech | Duang Den 2 - 4218080 - True",
    serviceId: "qBm3U5M_khmCilTedPF",
    status: "active",
    client: "Teleinfotech",
    vsBrand: "Shield",
    type: "--",
    mno: "Airtel-NG",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-06-18",
    lastUpdate: "2024-07-21",
  },
  {
    id: 18,
    name: "True Digital Group Co.,Ltd (4239) | Health Care 3 - 4239480 - True",
    serviceId: "-Hn6yV9LTo1L384N0dvP",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "Safaricom-KE",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-07-19",
    lastUpdate: "2024-08-22",
  },
  {
    id: 19,
    name: "True Digital Group Co.,Ltd (4238) | XR Plus - 4238090 - True",
    serviceId: "-X42QmITQr5gQ1r65plZ",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "MTN-NG",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-08-20",
    lastUpdate: "2024-09-23",
  },
  {
    id: 20,
    name: "Zain Iraq | Click Guard - ZQ001",
    serviceId: "KZmtyKXIKuGEo7nQBp_",
    status: "active",
    client: "Zain",
    vsBrand: "ZainBrand",
    type: "--",
    mno: "Zain-IQ",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-09-21",
    lastUpdate: "2024-10-24",
  },
  {
    id: 21,
    name: "Asiacell | Shield Pro - AC002",
    serviceId: "-M1WdDi_gqrW96ZHDTSJ",
    status: "active",
    client: "Asiacell",
    vsBrand: "GVI-Brand",
    type: "--",
    mno: "TRUE",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-10-22",
    lastUpdate: "2024-11-25",
  },
  {
    id: 22,
    name: "True Digital Group Co.,Ltd (4237) | Horo Sap3 - 4237440 - True",
    serviceId: "-XuIAX8WjUv4OgtSHICM",
    status: "active",
    client: "True Digital",
    vsBrand: "TrueMove",
    type: "--",
    mno: "DTAC",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-11-23",
    lastUpdate: "2024-12-26",
  },
  {
    id: 23,
    name: "MTN Nigeria | Fraud Net - MT003",
    serviceId: "-oU_WleySeIowS0N4Td",
    status: "active",
    client: "MTN",
    vsBrand: "Shield",
    type: "--",
    mno: "AIS",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-12-24",
    lastUpdate: "2024-01-27",
  },
  {
    id: 24,
    name: "Safaricom Kenya | Geo Shield - SK004",
    serviceId: "-HIqFuOL-5fM-D_pWSgE",
    status: "active",
    client: "Safaricom",
    vsBrand: "--",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-01-25",
    lastUpdate: "2024-02-28",
  },
  {
    id: 25,
    name: "True Digital Group Co.,Ltd (4239) | Hora Duange5 - 4239500 - True",
    serviceId: "-MWbLCzM65Ba8V81GhQt",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "Airtel-NG",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-02-26",
    lastUpdate: "2024-03-28",
  },
  {
    id: 26,
    name: "Airtel Nigeria | Click Tracker - AN005",
    serviceId: "-MbZnXgU9CX_w365dpH3",
    status: "active",
    client: "Airtel",
    vsBrand: "ZainBrand",
    type: "--",
    mno: "Safaricom-KE",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-03-27",
    lastUpdate: "2024-04-28",
  },
  {
    id: 27,
    name: "GVI Services | sub-acc-platinum",
    serviceId: "qESZmZF6e4OCdE5QMCC",
    status: "active",
    client: "GVI",
    vsBrand: "GVI-Brand",
    type: "--",
    mno: "MTN-NG",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-04-28",
    lastUpdate: "2024-05-28",
  },
  {
    id: 28,
    name: "True Digital Group Co.,Ltd (4238) | Horo Lucky2 - 4238700 - True",
    serviceId: "-5fG6GFVZXiCJeM1UGr",
    status: "active",
    client: "True Digital",
    vsBrand: "TrueMove",
    type: "--",
    mno: "Zain-IQ",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-05-01",
    lastUpdate: "2024-06-04",
  },
  {
    id: 29,
    name: "Vodacom Tanzania | Shield Basic - VT006",
    serviceId: "q1e93RIVoBP00rJ3K27",
    status: "active",
    client: "Vodacom",
    vsBrand: "Shield",
    type: "--",
    mno: "TRUE",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-06-02",
    lastUpdate: "2024-07-05",
  },
  {
    id: 30,
    name: "True Digital Group Co.,Ltd (4237) | Wan Duang6 - 4237550 - True",
    serviceId: "-sRpi2gDNtfM1DGOk2X",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "DTAC",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-07-03",
    lastUpdate: "2024-08-06",
  },
  {
    id: 31,
    name: "Teleinfotech | Duang Den 3 - 4218100 - True",
    serviceId: "KwGFnfCtWEmUJjAoN9Y",
    status: "active",
    client: "Teleinfotech",
    vsBrand: "--",
    type: "--",
    mno: "AIS",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-08-04",
    lastUpdate: "2024-09-07",
  },
  {
    id: 32,
    name: "True Digital Group Co.,Ltd (4239) | Horo Sap5 - 4239520 - True",
    serviceId: "-USyZ5PSUvn7jV4KqvK",
    status: "active",
    client: "True Digital",
    vsBrand: "ZainBrand",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-09-05",
    lastUpdate: "2024-10-08",
  },
  {
    id: 33,
    name: "Zain Iraq | Bot Filter - ZQ007",
    serviceId: "qM_F5Hpha-b7EAWrB_P",
    status: "active",
    client: "Zain",
    vsBrand: "GVI-Brand",
    type: "--",
    mno: "Airtel-NG",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-10-06",
    lastUpdate: "2024-11-09",
  },
  {
    id: 34,
    name: "True Digital Group Co.,Ltd (4238) | Health Care 4 - 4238800 - True",
    serviceId: "-X9F98qQP1Aa9KINbRgy",
    status: "active",
    client: "True Digital",
    vsBrand: "TrueMove",
    type: "--",
    mno: "Safaricom-KE",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-11-07",
    lastUpdate: "2024-12-10",
  },
  {
    id: 35,
    name: "Asiacell | Redirect Flow - AC008",
    serviceId: "-HUffVreDG708fXlP6Ct",
    status: "active",
    client: "Asiacell",
    vsBrand: "Shield",
    type: "--",
    mno: "MTN-NG",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-12-08",
    lastUpdate: "2024-01-11",
  },
  {
    id: 36,
    name: "True Digital Group Co.,Ltd (4237) | XR Academy2 - 4237560 - True",
    serviceId: "-HLmsdIWGE-SNRe_IYTq",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "Zain-IQ",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-01-09",
    lastUpdate: "2024-02-12",
  },
  {
    id: 37,
    name: "MTN Nigeria | Click Guard2 - MT009",
    serviceId: "-M5_nsGpdQHhFO2gmla5",
    status: "active",
    client: "MTN",
    vsBrand: "--",
    type: "--",
    mno: "TRUE",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-02-10",
    lastUpdate: "2024-03-13",
  },
  {
    id: 38,
    name: "True Digital Group Co.,Ltd (4239) | Lucky Dee10 - 4239540 - True",
    serviceId: "-X8G-FBobbU750WpFGGC",
    status: "active",
    client: "True Digital",
    vsBrand: "ZainBrand",
    type: "--",
    mno: "DTAC",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-03-11",
    lastUpdate: "2024-04-14",
  },
  {
    id: 39,
    name: "Safaricom Kenya | Fraud Net2 - SK010",
    serviceId: "qoChudk_Cziq9f-vEqu",
    status: "active",
    client: "Safaricom",
    vsBrand: "GVI-Brand",
    type: "--",
    mno: "AIS",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-04-12",
    lastUpdate: "2024-05-15",
  },
  {
    id: 40,
    name: "GVI Services | sub-acc-silver",
    serviceId: "-H7ZKvGkg4WpyoQMwDEw",
    status: "active",
    client: "GVI",
    vsBrand: "TrueMove",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-05-13",
    lastUpdate: "2024-06-16",
  },
  {
    id: 41,
    name: "True Digital Group Co.,Ltd (4238) | Wan Dee7 - 4238900 - True",
    serviceId: "-H-lw3aNHXTV_tlewB52",
    status: "active",
    client: "True Digital",
    vsBrand: "Shield",
    type: "--",
    mno: "Airtel-NG",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-06-14",
    lastUpdate: "2024-07-17",
  },
  {
    id: 42,
    name: "TPay | Gold Payment API",
    serviceId: "-AqesEfJ7btbdTu2Gqi",
    status: "inactive",
    client: "TPay",
    vsBrand: "--",
    type: "MSISDN",
    mno: "Safaricom-KE",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-07-15",
    lastUpdate: "2024-08-18",
  },
  {
    id: 43,
    name: "Airtel Nigeria | OTP Gateway - AN011",
    serviceId: "-HV4pTKbqK_lAvZuVMq5",
    status: "inactive",
    client: "Airtel",
    vsBrand: "--",
    type: "WAP",
    mno: "MTN-NG",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-08-16",
    lastUpdate: "2024-09-19",
  },
  {
    id: 44,
    name: "True Digital Group Co.,Ltd (4237) | Legacy Sap - 4237099 - True",
    serviceId: "KJra92SY7dKi-KDExkd",
    status: "inactive",
    client: "True Digital",
    vsBrand: "ZainBrand",
    type: "OTP",
    mno: "Zain-IQ",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-09-17",
    lastUpdate: "2024-10-20",
  },
  {
    id: 45,
    name: "Vodacom Tanzania | WAP Shield - VT012",
    serviceId: "-M98dWWIR1_8r1HWhzX3",
    status: "inactive",
    client: "Vodacom",
    vsBrand: "GVI-Brand",
    type: "API",
    mno: "TRUE",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-10-18",
    lastUpdate: "2024-11-21",
  },
  {
    id: 46,
    name: "Zain Iraq | Old Click - ZQ013",
    serviceId: "-HTsVyrMFraAr5xgd3aF",
    status: "inactive",
    client: "Zain",
    vsBrand: "TrueMove",
    type: "--",
    mno: "DTAC",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-11-19",
    lastUpdate: "2024-12-22",
  },
  {
    id: 47,
    name: "GVI Services | sub-acc-archived",
    serviceId: "-Mrp-ojRvGH7jRbyGRBd",
    status: "inactive",
    client: "GVI",
    vsBrand: "Shield",
    type: "Redirect",
    mno: "AIS",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-12-20",
    lastUpdate: "2024-01-23",
  },
  {
    id: 48,
    name: "Asiacell | Basic Flow - AC014",
    serviceId: "-MRDKa7QKC3bT6WIXm7Z",
    status: "inactive",
    client: "Asiacell",
    vsBrand: "--",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-01-21",
    lastUpdate: "2024-02-24",
  },
  {
    id: 49,
    name: "MTN Nigeria | Old Fraud - MT015",
    serviceId: "-MZpUTQV03h-GsiciJgH",
    status: "inactive",
    client: "MTN",
    vsBrand: "--",
    type: "DCB",
    mno: "Airtel-NG",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-02-22",
    lastUpdate: "2024-03-25",
  },
  {
    id: 50,
    name: "True Digital Group Co.,Ltd (4237) (4237) | Lucky Star Premium - 4237601 - True",
    serviceId: "KgyrZWLwVmXzOLudiG",
    status: "active",
    client: "True Digital",
    vsBrand: "Shield",
    type: "--",
    mno: "Zain-IQ",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-02-11",
    lastUpdate: "2024-03-13",
  },
  {
    id: 51,
    name: "True Digital Group Co.,Ltd (4239) (4239) | Wan Dee Gold - 4239710 - True",
    serviceId: "-iLCfo05pY1s6nMl-v",
    status: "active",
    client: "True Digital",
    vsBrand: "TrueMove",
    type: "--",
    mno: "TRUE",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-03-14",
    lastUpdate: "2024-04-16",
  },
  {
    id: 52,
    name: "True Digital Group Co.,Ltd (4238) (4238) | Horo Pro Max - 4238800 - True",
    serviceId: "-N7ZZ-Df95vplKCb5Q",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "DTAC",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-04-17",
    lastUpdate: "2024-05-19",
  },
  {
    id: 53,
    name: "GVI Services | sub-acc-platinum",
    serviceId: "qxdMEADAGq2wLu5kyG",
    status: "inactive",
    client: "GVI",
    vsBrand: "AIS-Brand",
    type: "--",
    mno: "AIS",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-05-20",
    lastUpdate: "2024-06-22",
  },
  {
    id: 54,
    name: "True Digital Group Co.,Ltd (4237) (4237) | Playit 5G - 4237700 - True",
    serviceId: "qlVjFq7B2Ft8Uk68Fa",
    status: "active",
    client: "True Digital",
    vsBrand: "MTN-Brand",
    type: "--",
    mno: "Airtel-NG",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-06-23",
    lastUpdate: "2024-07-25",
  },
  {
    id: 55,
    name: "Teleinfotech | Duang Den 3",
    serviceId: "-QJTay1-f4MCOajYP1",
    status: "active",
    client: "Teleinfotech",
    vsBrand: "--",
    type: "--",
    mno: "Safaricom-KE",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-07-26",
    lastUpdate: "2024-08-28",
  },
  {
    id: 56,
    name: "True Digital Group Co.,Ltd (4239) (4239) | Health Care Plus - 4239600 - True",
    serviceId: "-Q7LiAHNTXGOgLXbsI",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "API",
    mno: "MTN-NG",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-08-01",
    lastUpdate: "2024-09-03",
  },
  {
    id: 57,
    name: "True Digital Group Co.,Ltd (4238) (4238) | XR Academy Pro - 4238200 - True",
    serviceId: "q459yq_gaTGAs3h2wL",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "Zain-SD",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-09-04",
    lastUpdate: "2024-10-06",
  },
  {
    id: 58,
    name: "Zain Iraq | Shield Elite - ZQ010",
    serviceId: "qNGIRYMxGm4241tM6Q",
    status: "active",
    client: "Zain",
    vsBrand: "TrueMove",
    type: "--",
    mno: "Orange-SN",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2025-10-07",
    lastUpdate: "2025-11-09",
  },
  {
    id: 59,
    name: "True Digital Group Co.,Ltd (4237) (4237) | Horo Sap5 - 4237800 - True",
    serviceId: "KMqR3FrT8KTxsVf3-Q",
    status: "active",
    client: "True Digital",
    vsBrand: "ZainBrand",
    type: "--",
    mno: "Vodacom-TZ",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2025-11-10",
    lastUpdate: "2025-12-12",
  },
  {
    id: 60,
    name: "Asiacell | Click Guard Plus - AC020",
    serviceId: "-PnjhKpwsUfTiw8KoI",
    status: "active",
    client: "Asiacell",
    vsBrand: "GVI-Brand",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2025-12-13",
    lastUpdate: "2025-01-15",
  },
  {
    id: 61,
    name: "True Digital Group Co.,Ltd (4239) (4239) | iPay Platinum - 4239620 - True",
    serviceId: "-HJvH_TkZ3IVLb5iX-",
    status: "active",
    client: "True Digital",
    vsBrand: "Shield",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-01-16",
    lastUpdate: "2024-02-18",
  },
  {
    id: 62,
    name: "MTN Nigeria | Fraud Shield - MT010",
    serviceId: "-E6UpTF8i7Pm93rF76",
    status: "inactive",
    client: "MTN",
    vsBrand: "TrueMove",
    type: "--",
    mno: "Zain-IQ",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-02-19",
    lastUpdate: "2024-03-21",
  },
  {
    id: 63,
    name: "Safaricom Kenya | Geo Shield Pro - SK020",
    serviceId: "-9-as4Uu4gEnhxpCzo",
    status: "active",
    client: "Safaricom",
    vsBrand: "--",
    type: "API",
    mno: "TRUE",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-03-22",
    lastUpdate: "2024-04-24",
  },
  {
    id: 64,
    name: "True Digital Group Co.,Ltd (4238) (4238) | Lucky Star Ultra - 4238900 - True",
    serviceId: "qGCcfL32aRgjiWgWLk",
    status: "active",
    client: "True Digital",
    vsBrand: "AIS-Brand",
    type: "--",
    mno: "DTAC",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-04-25",
    lastUpdate: "2024-05-27",
  },
  {
    id: 65,
    name: "GVI Services | premium-sub-acc",
    serviceId: "KfXjsPqNmEFi4GqU6n",
    status: "active",
    client: "GVI",
    vsBrand: "MTN-Brand",
    type: "--",
    mno: "AIS",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-05-28",
    lastUpdate: "2024-06-28",
  },
  {
    id: 66,
    name: "Teleinfotech | Duang Den 4",
    serviceId: "-wSTvyxUaVwhRhrqEl",
    status: "active",
    client: "Teleinfotech",
    vsBrand: "--",
    type: "--",
    mno: "Airtel-NG",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-06-03",
    lastUpdate: "2024-07-05",
  },
  {
    id: 67,
    name: "Airtel Nigeria | Click Net - AN001",
    serviceId: "qGyis4nxMiur_WemeN",
    status: "active",
    client: "Airtel",
    vsBrand: "--",
    type: "--",
    mno: "Safaricom-KE",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-07-06",
    lastUpdate: "2024-08-08",
  },
  {
    id: 68,
    name: "True Digital Group Co.,Ltd (4237) (4237) | Wan Dee Pro - 4237900 - True",
    serviceId: "-0GzpIATWoSUskrpI2",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "MTN-NG",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-08-09",
    lastUpdate: "2024-09-11",
  },
  {
    id: 69,
    name: "Orange Senegal | Shield Basic - OS001",
    serviceId: "qp2wyJzqpjF8ijQUjB",
    status: "active",
    client: "Orange",
    vsBrand: "TrueMove",
    type: "--",
    mno: "Zain-SD",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-09-12",
    lastUpdate: "2024-10-14",
  },
  {
    id: 70,
    name: "True Digital Group Co.,Ltd (4239) (4239) | Health Care 4 - 4239700 - True",
    serviceId: "q9h-y37sCepxFvmZNQ",
    status: "active",
    client: "True Digital",
    vsBrand: "ZainBrand",
    type: "API",
    mno: "Orange-SN",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2025-10-15",
    lastUpdate: "2025-11-17",
  },
  {
    id: 71,
    name: "Vodacom Tanzania | Geo Track - VT001",
    serviceId: "-HUYUdWxxlR_t0K1G6",
    status: "inactive",
    client: "Vodacom",
    vsBrand: "GVI-Brand",
    type: "--",
    mno: "Vodacom-TZ",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2025-11-18",
    lastUpdate: "2025-12-20",
  },
  {
    id: 72,
    name: "True Digital Group Co.,Ltd (4238) (4238) | XR Plus Pro - 4238300 - True",
    serviceId: "-d7Y1XksA12iD7LNGW",
    status: "active",
    client: "True Digital",
    vsBrand: "Shield",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2025-12-21",
    lastUpdate: "2025-01-23",
  },
  {
    id: 73,
    name: "Zain Iraq | Lucky Net - ZQ020",
    serviceId: "KGuyG67-Z_gaY6UI1v",
    status: "active",
    client: "Zain",
    vsBrand: "TrueMove",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-01-24",
    lastUpdate: "2024-02-26",
  },
  {
    id: 74,
    name: "True Digital Group Co.,Ltd (4237) (4237) | Horo Sap6 - 4237950 - True",
    serviceId: "Kka3AN_Tcx5cMy5Fk8",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "Zain-IQ",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-02-27",
    lastUpdate: "2024-03-28",
  },
  {
    id: 75,
    name: "Ethio Telecom | Shield Pro - ET001",
    serviceId: "-Vyg05TIezfTffReTW",
    status: "active",
    client: "Ethio Telecom",
    vsBrand: "AIS-Brand",
    type: "--",
    mno: "TRUE",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-03-02",
    lastUpdate: "2024-04-04",
  },
  {
    id: 76,
    name: "True Digital Group Co.,Ltd (4239) (4239) | Wan Dee Ultra - 4239800 - True",
    serviceId: "-IFl4UFK3BrjLEwbbp",
    status: "active",
    client: "True Digital",
    vsBrand: "MTN-Brand",
    type: "--",
    mno: "DTAC",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-04-05",
    lastUpdate: "2024-05-07",
  },
  {
    id: 77,
    name: "Sudatel | Click Guard - SD001",
    serviceId: "Kn856ZxiwlrnaoqzGR",
    status: "active",
    client: "Sudatel",
    vsBrand: "--",
    type: "API",
    mno: "AIS",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-05-08",
    lastUpdate: "2024-06-10",
  },
  {
    id: 78,
    name: "True Digital Group Co.,Ltd (4238) (4238) | Health Monitor - 4238400 - True",
    serviceId: "KtSvaxvTHVl7_ZD5Iq",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "Airtel-NG",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-06-11",
    lastUpdate: "2024-07-13",
  },
  {
    id: 79,
    name: "GVI Services | sub-acc-enterprise",
    serviceId: "-wVlsE4g4Gn9aT_3WO",
    status: "active",
    client: "GVI",
    vsBrand: "--",
    type: "--",
    mno: "Safaricom-KE",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-07-14",
    lastUpdate: "2024-08-16",
  },
  {
    id: 80,
    name: "Asiacell | Fraud Net Pro - AC030",
    serviceId: "KsRydjr4h2oYFZ-pFW",
    status: "inactive",
    client: "Asiacell",
    vsBrand: "TrueMove",
    type: "--",
    mno: "MTN-NG",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-08-17",
    lastUpdate: "2024-09-19",
  },
  {
    id: 81,
    name: "True Digital Group Co.,Ltd (4237) (4237) | Playit 4K - 4237980 - True",
    serviceId: "Kl_1p2CUxjTkc9LF3S",
    status: "active",
    client: "True Digital",
    vsBrand: "ZainBrand",
    type: "--",
    mno: "Zain-SD",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-09-20",
    lastUpdate: "2024-10-22",
  },
  {
    id: 82,
    name: "Teleinfotech | Duang Den 5",
    serviceId: "KetfgMTvWo4K2ETH_x",
    status: "active",
    client: "Teleinfotech",
    vsBrand: "GVI-Brand",
    type: "--",
    mno: "Orange-SN",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2025-10-23",
    lastUpdate: "2025-11-25",
  },
  {
    id: 83,
    name: "MTN Nigeria | Geo Shield - MT020",
    serviceId: "-p39Aec_3RQSjEFDxP",
    status: "active",
    client: "MTN",
    vsBrand: "Shield",
    type: "--",
    mno: "Vodacom-TZ",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2025-11-26",
    lastUpdate: "2025-12-28",
  },
  {
    id: 84,
    name: "True Digital Group Co.,Ltd (4239) (4239) | iPay Diamond - 4239900 - True",
    serviceId: "KjXmSPxBrYz8DYhrwf",
    status: "active",
    client: "True Digital",
    vsBrand: "TrueMove",
    type: "API",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2025-12-01",
    lastUpdate: "2025-01-03",
  },
  {
    id: 85,
    name: "Safaricom Kenya | Click Shield - SK030",
    serviceId: "KNSt4sTTXHU1mnRniT",
    status: "active",
    client: "Safaricom",
    vsBrand: "--",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-01-04",
    lastUpdate: "2024-02-06",
  },
  {
    id: 86,
    name: "True Digital Group Co.,Ltd (4238) (4238) | Lucky Star Max - 4238500 - True",
    serviceId: "-zreBoJ4cSxk7srWEz",
    status: "active",
    client: "True Digital",
    vsBrand: "AIS-Brand",
    type: "--",
    mno: "Zain-IQ",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-02-07",
    lastUpdate: "2024-03-09",
  },
  {
    id: 87,
    name: "Airtel Nigeria | Shield Elite - AN010",
    serviceId: "-a19jINudwJzS3Vi8N",
    status: "active",
    client: "Airtel",
    vsBrand: "MTN-Brand",
    type: "--",
    mno: "TRUE",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-03-10",
    lastUpdate: "2024-04-12",
  },
  {
    id: 88,
    name: "Zain Iraq | Health Net - ZQ030",
    serviceId: "qVNl2HZd28q6252jZZ",
    status: "active",
    client: "Zain",
    vsBrand: "--",
    type: "--",
    mno: "DTAC",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-04-13",
    lastUpdate: "2024-05-15",
  },
  {
    id: 89,
    name: "True Digital Group Co.,Ltd (4237) (4237) | Horo Sap7 - 4237990 - True",
    serviceId: "-FrI_4OE43vwNSBe2v",
    status: "inactive",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "AIS",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-05-16",
    lastUpdate: "2024-06-18",
  },
  {
    id: 90,
    name: "Orange Senegal | Traffic Guard - OS010",
    serviceId: "qtCt1SIB5kds1QCWdE",
    status: "active",
    client: "Orange",
    vsBrand: "--",
    type: "--",
    mno: "Airtel-NG",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-06-19",
    lastUpdate: "2024-07-21",
  },
  {
    id: 91,
    name: "True Digital Group Co.,Ltd (4239) (4239) | XR Academy 2 - 4239950 - True",
    serviceId: "Kck2O2CiK68YougtfW",
    status: "active",
    client: "True Digital",
    vsBrand: "TrueMove",
    type: "API",
    mno: "Safaricom-KE",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-07-22",
    lastUpdate: "2024-08-24",
  },
  {
    id: 92,
    name: "Vodacom Tanzania | Fraud Shield - VT010",
    serviceId: "q6XcLTfzvSz9aLMyJC",
    status: "active",
    client: "Vodacom",
    vsBrand: "ZainBrand",
    type: "--",
    mno: "MTN-NG",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-08-25",
    lastUpdate: "2024-09-27",
  },
  {
    id: 93,
    name: "True Digital Group Co.,Ltd (4238) (4238) | Wan Dee Gold - 4238600 - True",
    serviceId: "qUjGbbFpcEEhd2-qXI",
    status: "active",
    client: "True Digital",
    vsBrand: "GVI-Brand",
    type: "--",
    mno: "Zain-SD",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-09-28",
    lastUpdate: "2024-10-28",
  },
  {
    id: 94,
    name: "Ethio Telecom | Click Net Pro - ET010",
    serviceId: "-xWHeHlUwE1oSObwMm",
    status: "active",
    client: "Ethio Telecom",
    vsBrand: "Shield",
    type: "--",
    mno: "Orange-SN",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2025-10-03",
    lastUpdate: "2025-11-05",
  },
  {
    id: 95,
    name: "True Digital Group Co.,Ltd (4237) (4237) | iPay Service 2 - 4237995 - True",
    serviceId: "-W3DK1zrVc8oo3yqNW",
    status: "active",
    client: "True Digital",
    vsBrand: "TrueMove",
    type: "--",
    mno: "Vodacom-TZ",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2025-11-06",
    lastUpdate: "2025-12-08",
  },
  {
    id: 96,
    name: "Sudatel | Geo Pro - SD010",
    serviceId: "KtBb494j9pcy98_86T",
    status: "active",
    client: "Sudatel",
    vsBrand: "--",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2025-12-09",
    lastUpdate: "2025-01-11",
  },
  {
    id: 97,
    name: "True Digital Group Co.,Ltd (4239) (4239) | Horo Lucky 2 - 4239980 - True",
    serviceId: "-kp75cnQpQ7sm-RSa-",
    status: "active",
    client: "True Digital",
    vsBrand: "AIS-Brand",
    type: "--",
    mno: "--",
    carrierGradeNat: "--",
    shieldMode: "Standard",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-01-12",
    lastUpdate: "2024-02-14",
  },
  {
    id: 98,
    name: "GVI Services | sub-acc-global",
    serviceId: "qfl5yNWu1NV3t3sICg",
    status: "inactive",
    client: "GVI",
    vsBrand: "MTN-Brand",
    type: "API",
    mno: "Zain-IQ",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-02-15",
    lastUpdate: "2024-03-17",
  },
  {
    id: 99,
    name: "True Digital Group Co.,Ltd (4238) (4238) | Shield Core - 4238700 - True",
    serviceId: "KaiANM-AC5QhQV3OoE",
    status: "active",
    client: "True Digital",
    vsBrand: "--",
    type: "--",
    mno: "TRUE",
    carrierGradeNat: "--",
    shieldMode: "--",
    headerEnrichedFlow: "--",
    hePaymentFlow: "--",
    wifiPaymentFlow: "--",
    serviceCreated: "2024-03-18",
    lastUpdate: "2024-04-20",
  },
];

const PARTNER_ACTIONS = [
  {
    key: "view",
    icon: "view",
    label: "View",
    color: "#17a2b8",
    iconOnly: true,
  },
  {
    key: "edit",
    icon: "edit",
    label: "Edit",
    color: "#0d6efd",
    iconOnly: true,
  },
  {
    key: "customVars",
    icon: "settings",
    label: "Custom Variables",
    color: "#0d9488",
    iconOnly: true,
  },
];

const ADMIN_ACTIONS = [
  { group: "Service" },
  { key: "view", label: "View", icon: "👁️", color: "#17a2b8" },
  // { key: "solution", label: "Solution", icon: "🔧", color: "#6c757d" },
  { key: "mapService", label: "Map Service", icon: "🗺️", color: "#17a2b8" },
  { key: "dashboard", label: "Dashboard", icon: "📊", color: "#6c757d" },
  { divider: true },
  { group: "Management" },
  { key: "edit", label: "Edit", icon: "✏️", color: "#0d6efd" },
  { key: "ip", label: "IP", icon: "🌐", color: "#6c757d" },
  { key: "toggleStatus", label: "Toggle Status", icon: "⏻", color: "#f59e0b" },
  // { key: "cloneService", label: "Clone Service", icon: "📋", color: "#0d9488" },
  { divider: true },
  { group: "Data" },
  {
    key: "customVars",
    label: "Custom Variables",
    icon: "⚙️",
    color: "#0d9488",
  },
  {
    key: "updateSummary",
    label: "Update Summary",
    icon: "📝",
    color: "#6c757d",
  },
  {
    key: "exportServices",
    label: "Export Services",
    icon: "⬇",
    color: "#2563eb",
  },
];

function ActionsDropdown({ rowId, openRow, setOpenRow, onAction, row }) {
  const open = openRow === rowId;
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const [coords, setCoords] = useState(null);

  function calcCoords() {
    if (!btnRef.current) return null;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipUp = spaceBelow < 300;
    return {
      top: flipUp ? null : rect.bottom + 4,
      bottom: flipUp ? window.innerHeight - rect.top + 4 : null,
      right: window.innerWidth - rect.right,
    };
  }

  function handleToggle() {
    if (!open) setCoords(calcCoords());
    setOpenRow(open ? null : rowId);
  }

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e) {
      const inBtn = btnRef.current && btnRef.current.contains(e.target);
      const inDrop = dropRef.current && dropRef.current.contains(e.target);
      if (!inBtn && !inDrop) setOpenRow(null);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpenRow(null);
    }
    function onScroll() {
      setCoords(calcCoords());
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, setOpenRow]);

  const dropdown =
    open &&
    coords &&
    createPortal(
      <div
        ref={dropRef}
        className="svc-adm-dropdown-portal"
      >
      {ADMIN_ACTIONS.map((a, i) => {
          if (a.divider) return <div key={i} className="svc-adm-divider" />;
          if (a.group)
            return (
              <div key={i} className="svc-adm-group">
                {a.group}
              </div>
            );
          const isToggle = a.key === "toggleStatus";
          const label = isToggle
            ? row?.status === "active" ? "Inactive" : "Active"
            : a.label;
          const color = isToggle
            ? row?.status === "active" ? "#ef4444" : "#22c55e"
            : a.color;
          return (
            <button
              key={a.label}
              onClick={() => {
                setOpenRow(null);
                onAction && onAction(a.key);
              }}
              className="svc-adm-item"
            >
              <span className="svc-adm-icon">
                {a.icon}
              </span>
              <span className="svc-adm-label">
                {label}
              </span>
            </button>
          );
        })}
      </div>,
      document.body,
    );

  return (
    <div className="svc-actions-wrap">
      <button
        ref={btnRef}
        onClick={handleToggle}
        className={`svc-ver-btn ${open ? "open" : "closed"}`}
      >
        ···
      </button>
      {dropdown}
    </div>
  );
}

const PARTNER_ICONS = {
  view: <EyeIcon size={14} />,
  edit: <EditIcon size={14} />,
  settings: <SettingsIcon size={13} />,
};

// ─── Shared modal shell ───────────────────────────────────────────────────────
function SvcModal({ title, subtitle, onClose, children, width = 560 }) {
  return createPortal(
    <div className="svc-modal-overlay" onClick={onClose}>
      <div
        className="svc-modal-box svc-modal-box-responsive"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="svc-modal-header">
          <div>
            <div className="svc-modal-title">{title}</div>
            {subtitle && <div className="svc-modal-subtitle">{subtitle}</div>}
          </div>
          <button className="svc-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="svc-modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function SvcField({ label, value, mono }) {
  return (
    <div className="svc-modal-row">
      <span className="svc-modal-label">{label}</span>
      <span
        className={mono ? "svc-modal-value svc-val-mono" : "svc-modal-value"}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function SvcInput({ label, value, onChange, disabled, type = "text" }) {
  return (
    <div className="svc-form-field">
      <label className="svc-form-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={
          "svc-form-input" + (disabled ? " svc-form-input--disabled" : "")
        }
      />
    </div>
  );
}

// ─── Map Service Modal ────────────────────────────────────────────────────────
const VS_BRANDS_MOCK = [
  {
    group: "MCP VS",
    items: [
      "SMSTheSenseMA2 - 4242172",
      "Clip Cute - 827147664",
      "Asia Cute - 4584310",
    ],
  },
  {
    group: "TrueMove VS",
    items: ["TrueMove Pro - 1234567", "TrueMove Lite - 9876543"],
  },
  { group: "GVI VS", items: ["GVI Standard - 3312001", "GVI Plus - 3312002"] },
];
const TIMEZONES_LIST = [
  "Asia/Bangkok",
  "Asia/Singapore",
  "UTC",
  "Europe/London",
  "America/New_York",
  "Asia/Tokyo",
];
const COUNTRIES_LIST = [
  "Thailand (TH)",
  "Singapore (SG)",
  "United Kingdom (GB)",
  "United States (US)",
  "Japan (JP)",
  "Germany (DE)",
];

function MapServiceModal({ row, onClose }) {
  const [form, setForm] = useState({
    name: row?.name || "",
    companyName: row?.client || "",
    clientName: row?.client || "",
    timezone: "Asia/Bangkok",
    country: "Thailand (TH)",
    serviceUrl: `https://operator.shield.io/api/v1/gateway/${row?.id || ""}`,
  });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [approved, setApproved] = useState(null);

  const filtered = VS_BRANDS_MOCK.map((g) => ({
    ...g,
    items: g.items.filter((i) =>
      i.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((g) => g.items.length > 0);

  function toggleBrand(item) {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  }

  if (approved !== null) {
    return (
      <SvcModal title="Map Service" onClose={onClose} width={500}>
        <div className="svc-confirm-result">
          <div className="svc-confirm-icon">{approved ? "✅" : "❌"}</div>
          <div className="svc-confirm-title">
            {approved ? "Service Approved" : "Service Dis-Approved"}
          </div>
          <div className="svc-confirm-sub">
            <strong>{row?.name}</strong> has been{" "}
            {approved ? "approved and mapped" : "dis-approved"}.
          </div>
          <button className="svc-btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </SvcModal>
    );
  }

  return (
    <SvcModal
      title="Update Service"
      subtitle="Map and configure service settings"
      onClose={onClose}
      width={920}
    >
      <div className="svc-map-form-grid">
        <div className="svc-map-form-col">
          <label className="svc-map-field-label">Name</label>
          <input
            className="svc-map-field-input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="svc-map-form-col right">
          <label className="svc-map-field-label">Company Name</label>
          <input
            className="svc-map-field-input"
            value={form.companyName}
            onChange={(e) =>
              setForm((f) => ({ ...f, companyName: e.target.value }))
            }
          />
        </div>
        <div className="svc-map-form-col">
          <label className="svc-map-field-label">Client Name</label>
          <input
            className="svc-map-field-input"
            value={form.clientName}
            onChange={(e) =>
              setForm((f) => ({ ...f, clientName: e.target.value }))
            }
          />
        </div>
        <div className="svc-map-form-col right">
          <label className="svc-map-field-label">Time Zone</label>
          <select
            className="svc-map-field-select"
            value={form.timezone}
            onChange={(e) =>
              setForm((f) => ({ ...f, timezone: e.target.value }))
            }
          >
            {TIMEZONES_LIST.map((tz) => (
              <option key={tz}>{tz}</option>
            ))}
          </select>
        </div>
        <div className="svc-map-form-col">
          <label className="svc-map-field-label">Assigned Countries</label>
          <select
            className="svc-map-field-select"
            value={form.country}
            onChange={(e) =>
              setForm((f) => ({ ...f, country: e.target.value }))
            }
          >
            {COUNTRIES_LIST.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="svc-map-form-col right">
          <label className="svc-map-field-label">Service URL</label>
          <div className="svc-map-url-row">
            <input
              value={form.serviceUrl}
              readOnly
              className="svc-map-url-input"
            />
            <button
              className="svc-map-url-copy"
              title="Copy URL"
              onClick={() => navigator.clipboard?.writeText(form.serviceUrl)}
            >
              📋
            </button>
          </div>
        </div>
      </div>

      <div className="svc-map-brands-section">
        <label className="svc-map-brands-label">Vs Brands List</label>
        <div className="svc-map-brands-grid">
          <div className="svc-map-brands-left">
            <input
              className="svc-map-brands-search"
              placeholder="Search brands in list"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="svc-map-brands-list">
              {filtered.map((g) => (
                <div key={g.group}>
                  <div className="svc-map-brand-group">{g.group}</div>
                  {g.items.map((item) => (
                    <div
                      key={item}
                      className={
                        "svc-map-brand-item" +
                        (selected.includes(item) ? " selected" : "")
                      }
                      onClick={() => toggleBrand(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="svc-map-brands-empty">No brands found</div>
              )}
            </div>
          </div>
          <div className="svc-map-brands-right">
            {selected.length === 0 ? (
              <div className="svc-map-brands-empty-right">
                No brands selected
              </div>
            ) : (
              selected.map((item) => (
                <div key={item} className="svc-map-brand-selected">
                  <span>{item}</span>
                  <button
                    className="svc-map-brand-remove"
                    onClick={() => toggleBrand(item)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="svc-map-footer">
        <button className="svc-btn-approve" onClick={() => setApproved(true)}>
          Approve
        </button>
        <button
          className="svc-btn-disapprove"
          onClick={() => setApproved(false)}
        >
          Dis-Approve
        </button>
        <button className="svc-btn-reset" onClick={onClose}>
          Reset Mapping
        </button>
      </div>
    </SvcModal>
  );
}

// ─── Solution Modal ───────────────────────────────────────────────────────────
// function SolutionModal({ row, onClose }) {
//   const solutions = [
//     "Shield Standard",
//     "Shield Premium",
//     "Fraud Detection",
//     "Geo Resolver",
//     "APK Vault",
//   ];
//   const [selected, setSelected] = useState(solutions[0]);
//   return (
//     <SvcModal
//       title="Service Solution"
//       subtitle={`Configure solution for ${row?.name}`}
//       onClose={onClose}
//       width={480}
//     >
//       <div className="svc-modal-row">
//         <span className="svc-modal-label">Service</span>
//         <span className="svc-modal-value">{row?.name}</span>
//       </div>
//       <div className="svc-modal-row">
//         <span className="svc-modal-label">Service ID</span>
//         <span className="svc-modal-value svc-val-mono">{row?.serviceId}</span>
//       </div>
//       <div className="svc-form-field" className="ob-mt16">
//         <label className="svc-form-label">Solution Type</label>
//         <select
//           className="svc-form-input svc-form-select"
//           value={selected}
//           onChange={(e) => setSelected(e.target.value)}
//         >
//           {solutions.map((s) => (
//             <option key={s}>{s}</option>
//           ))}
//         </select>
//       </div>
//       <div className="svc-modal-actions">
//         <button className="svc-btn-primary" onClick={onClose}>
//           Apply Solution
//         </button>
//         <button className="svc-btn-cancel" onClick={onClose}>
//           Cancel
//         </button>
//       </div>
//     </SvcModal>
//   );
// }

// ─── Edit Modal ───────────────────────────────────────────────────────────────
// Full onboarding form (all 8 steps) embedded in a modal, pre-filled from row.
function EditServiceModal({ row, onClose, role = "admin" }) {
  const isPartner = role === "partner";
  const T = "#0d9488";

  // ── local sub-components (scoped to avoid conflicts) ──────────────────────
  function ObFieldLabel({ children, required }) {
    return (
      <label className="ob-label">
        {children}
        {required && <span className="ob-required">*</span>}
      </label>
    );
  }
  function ObInput({
    label,
    required,
    placeholder,
    hint,
    value,
    onChange,
    disabled,
  }) {
    return (
      <div className="ob-field">
        {label && <ObFieldLabel required={required}>{label}</ObFieldLabel>}
        <input
          className={`ob-input${disabled ? " ob-input--disabled" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        {hint && <p className="ob-hint">{hint}</p>}
      </div>
    );
  }
  function ObSelect({
    label,
    required,
    options,
    value,
    onChange,
    hint,
    disabled,
  }) {
    return (
      <div className="ob-field">
        {label && <ObFieldLabel required={required}>{label}</ObFieldLabel>}
        <div className="ob-select-wrap">
          <select
            className={`ob-input ob-select${disabled ? " ob-input--disabled" : ""}`}
            value={value}
            onChange={onChange}
            disabled={disabled}
          >
            {options.map((o) => (
              <option key={o.value ?? o} value={o.value ?? o}>
                {o.label ?? o}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="ob-chevron" size={14} />
        </div>
        {hint && <p className="ob-hint">{hint}</p>}
      </div>
    );
  }
  function ObYesNo({ label, required, value, onChange, hint }) {
    return (
      <div className="ob-field">
        {label && <ObFieldLabel required={required}>{label}</ObFieldLabel>}
        <div className="ob-yesno">
          {["Yes", "No", "I Don't Know"].map((opt) => (
            <button
              key={opt}
              type="button"
              className={`ob-yesno-btn${value === opt ? " ob-yesno-btn--on" : ""}`}
              onClick={() => onChange(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
        {hint && <p className="ob-hint">{hint}</p>}
      </div>
    );
  }
  function ObAddMore({ label, onClick }) {
    return (
      <button type="button" className="ob-add-more" onClick={onClick}>
        <PlusIcon size={12} />
        {label}
      </button>
    );
  }
  function ObSection({ step, title, subtitle, badge, children }) {
    return (
      <div className="ob-section">
        <div className="ob-section-head">
          <span className="ob-step-badge">{step}</span>
          <div>
            <div className="ob-section-title">
              {title}
              {badge && <span className="ob-optional-badge">{badge}</span>}
            </div>
            {subtitle && <div className="ob-section-sub">{subtitle}</div>}
          </div>
        </div>
        <div className="ob-section-body">{children}</div>
      </div>
    );
  }

  // ── data lists ──────────────────────────────────────────────────────────────
  const TIMEZONES = [
    { value: "", label: "Select timezone..." },
    "UTC-03:00 – Asia/Baghdad",
    "UTC+00:00 – UTC",
    "UTC+05:30 – Asia/Kolkata",
    "UTC+07:00 – Asia/Bangkok",
    "UTC+08:00 – Asia/Singapore",
    "UTC+09:00 – Asia/Tokyo",
    "UTC+01:00 – Europe/London",
    "UTC-05:00 – America/New_York",
  ];
  const COUNTRIES = [
    { value: "", label: "Select country..." },
    "Thailand (TH)",
    "Singapore (SG)",
    "United Kingdom (GB)",
    "United States (US)",
    "Japan (JP)",
    "Germany (DE)",
    "India (IN)",
    "Nigeria (NG)",
    "Kenya (KE)",
    "Tanzania (TZ)",
    "Iraq (IQ)",
    "Senegal (SN)",
    "Sudan (SD)",
  ];
  const MNO_OPTS = [
    { value: "", label: "Select..." },
    "TRUE",
    "DTAC",
    "AIS",
    "Zain-IQ",
    "Airtel-NG",
    "MTN-NG",
    "Safaricom-KE",
    "Orange-SN",
    "Vodacom-TZ",
    "Zain-SD",
  ];
  const SHIELD_MODES = ["Standard"];
  const SERVICE_TYPES = [
    { value: "", label: "Select..." },
    "API",
    "SDK",
    "Web",
    "Mobile",
    "Hybrid",
  ];
  const HOSTED_BY = [
    { value: "", label: "Select..." },
    "Shield",
    "Operator",
    "Partner",
    "Third Party",
  ];
  const SHIELD_PAGES = [
    { value: "", label: "Select an option" },
    "All Pages",
    "Landing Page Only",
    "Payment Page",
    "Custom",
  ];
  const PROFILES = [
    { value: "", label: "Select a profile..." },
    "Shield Standard Config",
    "Fraud Detection Profile",
    "Geo Resolver Profile",
  ];

  // ── state (pre-filled from row) ──────────────────────────────────────────
  const [profile, setProfile] = useState("");
  const norm = (v) => (!v || v === "--" ? "" : v);
  const [serviceName, setServiceName] = useState(row?.name || "");
  const [shortCode, setShortCode] = useState(row?.shortCode || "");
  const [cspMerchant, setCspMerchant] = useState(row?.client || "");
  const [serviceType, setServiceType] = useState(norm(row?.type));
  const [country, setCountry] = useState(norm(row?.country));
  const [mno, setMno] = useState(norm(row?.mno));
  const [timezone, setTimezone] = useState(
    row?.timezone || "UTC-03:00 – Asia/Baghdad",
  );
  const [shieldMode, setShieldMode] = useState(
    norm(row?.shieldMode) || "Standard",
  );
  const [headerEnriched, setHeaderEnriched] = useState(
    norm(row?.headerEnrichedFlow) || "Yes",
  );
  const [lpRedirection, setLpRedirection] = useState(
    norm(row?.lpRedirection) || "Yes",
  );
  const [numPages, setNumPages] = useState(row?.numPages || 2);
  const [pageUrls, setPageUrls] = useState(
    Array.from({ length: row?.numPages || 2 }, () => [""]),
  );
  const [page1Host, setPage1Host] = useState("");
  const [page2Host, setPage2Host] = useState("");
  const [shieldPages, setShieldPages] = useState("");
  const [ips, setIps] = useState(["0.0.0.0"]);
  const [newIp, setNewIp] = useState("");
  const [urlParams, setUrlParams] = useState([""]);
  const [referrers, setReferrers] = useState([""]);
  const [apiVars, setApiVars] = useState([""]);
  const [summaryConfirmed, setSummaryConfirmed] = useState(false);

  const paymentLocked = !mno || !serviceType;

  function addPageUrl(pi) {
    setPageUrls((prev) => {
      const n = prev.map((a) => [...a]);
      n[pi] = [...n[pi], ""];
      return n;
    });
  }
  function updatePageUrl(pi, ui, val) {
    setPageUrls((prev) => {
      const n = prev.map((a) => [...a]);
      n[pi][ui] = val;
      return n;
    });
  }

  return (
    <SvcModal
      title="Edit Service"
      subtitle="Update service configuration"
      onClose={onClose}
      width={900}
    >
      {/* scrollable form body */}
      <div className="svc-modal-body">
        <div className="ob-body">
          {/* 0 – Load Profile */}
          <div className="ob-section ob-section--load">
            <div className="ob-section-head">
              <span className="ob-step-badge ob-step-badge--alt">⚡</span>
              <div>
                <div className="ob-section-title">
                  Load Service Flow Profile
                  <span className="ob-optional-badge">Optional</span>
                </div>
              </div>
            </div>
            <div className="ob-section-body">
              <ObSelect
                label="Select a Profile"
                options={PROFILES}
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                hint="Select a saved profile to pre-fill form fields with common configuration patterns."
              />
            </div>
          </div>

          {/* 1 – Basic Information */}
          <ObSection
            step="1"
            title="Basic Information"
            subtitle="Core identifiers for your service"
          >
            {isPartner && (
              <div className="svc-row-gap8">
                <LockIcon size={14} />
                <span className="svc-warn-text">
                  Basic information is <strong>read-only</strong> for partners.
                </span>
              </div>
            )}
            <ObInput
              label="Service Name"
              required
              placeholder="e.g. GameZone UK MTN · Newscape NG Airtel"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              disabled={isPartner}
              hint="Choose a descriptive name that identifies this specific service."
            />
            <div className="ob-grid-2">
              <ObInput
                label="Short Code"
                required
                placeholder="Enter short code"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                disabled={isPartner}
                hint="Enter a unique short code identifier for this service."
              />
              <div className="ob-field">
                <ObFieldLabel required>CSP/Merchant Name</ObFieldLabel>
                <div className="ob-input-btn-row">
                  <div className="ob-select-wrap ob-flex1">
                    <select
                      className="ob-input ob-select"
                      value={cspMerchant}
                      onChange={(e) => setCspMerchant(e.target.value)}
                      disabled={isPartner}
                    >
                      <option value="">Select...</option>
                      <option>True Digital</option>
                      <option>GVI Services</option>
                      <option>Teleinfotech</option>
                      <option>Zain</option>
                    </select>
                    <ChevronDownIcon className="ob-chevron" size={14} />
                  </div>
                  {!isPartner && (
                    <button className="ob-icon-btn" title="Add new CSP">
                      <PlusIcon size={14} />
                    </button>
                  )}
                </div>
                <p className="ob-hint">
                  Select the Content Service Provider or Merchant who owns this
                  service.
                </p>
              </div>
            </div>
            <ObSelect
              label="Type of Service"
              required
              options={SERVICE_TYPES}
              value={serviceType}
              onChange={(e) => !isPartner && setServiceType(e.target.value)}
              disabled={isPartner}
              hint="Categorise your service type. This helps with analytics and benchmarking."
            />
            {row?.serviceId && (
              <ObInput
                label="Service ID"
                value={row.serviceId}
                disabled
                hint="Auto-generated identifier — read only."
              />
            )}
          </ObSection>

          {/* 2 – Geographic & Network */}
          <ObSection
            step="2"
            title="Geographic & Network Configuration"
            subtitle="Location and carrier settings"
          >
            <div className="ob-grid-2">
              <div className="ob-field">
                <ObFieldLabel required>Country</ObFieldLabel>
                <div className="ob-select-wrap">
                  <select
                    className="ob-input ob-select"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.value ?? c} value={c.value ?? c}>
                        {c.label ?? c}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="ob-chevron" size={14} />
                </div>
                <p className="ob-hint">
                  Select the country where the service operates.
                </p>
              </div>
              <div className="ob-field">
                <ObFieldLabel required>
                  Mobile Network Operator (MNO)
                </ObFieldLabel>
                <div className="ob-input-btn-row">
                  <div className="ob-select-wrap ob-flex1">
                    <select
                      className="ob-input ob-select"
                      value={mno}
                      onChange={(e) => setMno(e.target.value)}
                    >
                      {MNO_OPTS.map((m) => (
                        <option key={m.value ?? m} value={m.value ?? m}>
                          {m.label ?? m}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="ob-chevron" size={14} />
                  </div>
                  <button className="ob-icon-btn" title="Add custom MNO">
                    <PlusIcon size={14} />
                  </button>
                </div>
                <p className="ob-hint">
                  Select the mobile network operator for this service.
                </p>
              </div>
              <ObSelect
                label="Time Zone"
                required
                options={TIMEZONES}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                hint="Select the timezone for your service."
              />
            </div>
          </ObSection>

          {/* 3 – Service Flow Configuration */}
          <ObSection
            step="3"
            title="Service Flow Configuration"
            subtitle="Shield mode and page flow settings"
          >
            <div className="ob-field">
              <ObFieldLabel required>Shield Mode</ObFieldLabel>
              <div className="ob-shield-tabs">
                {SHIELD_MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`ob-shield-tab${shieldMode === m ? " ob-shield-tab--on" : ""}`}
                    onClick={() => setShieldMode(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <p className="ob-hint">
                Standard prompts visitor from fraud. Monitor only tracks without
                blocking.
              </p>
            </div>
            <div className="ob-grid-2 ob-mt16">
              <ObYesNo
                label="Header Enriched Flow"
                required
                value={headerEnriched}
                onChange={setHeaderEnriched}
                hint="Whether the mobile operator injects the subscriber's MSISDN via HTTP headers."
              />
              <ObYesNo
                label="LP Redirection"
                required
                value={lpRedirection}
                onChange={setLpRedirection}
                hint="Whether your landing page implements redirection rules for traffic routing."
              />
            </div>
            <div className="ob-field ob-mt16">
              <ObFieldLabel required>Number of HTML Pages in Flow</ObFieldLabel>
              <div className="ob-num-row">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`ob-num-btn${numPages === n ? " ob-num-btn--on" : ""}`}
                    onClick={() => {
                      setNumPages(n);
                      setPageUrls(
                        Array.from(
                          { length: n },
                          (_, i) => pageUrls[i] || [""],
                        ),
                      );
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="ob-hint">
                Count the number of web pages (HTML) in your subscription flow.
              </p>
            </div>
            {pageUrls.slice(0, numPages).map((urls, pi) => (
              <div key={pi} className="ob-page-block">
                <div className="ob-page-block-title">Page {pi + 1} URL(s)</div>
                {urls.map((url, ui) => (
                  <input
                    key={ui}
                    className="ob-input ob-mb6"
                    placeholder="Enter a landing page URL for this page"
                    value={url}
                    onChange={(e) => updatePageUrl(pi, ui, e.target.value)}
                  />
                ))}
                <ObAddMore
                  label={`+ Add Another URL for Page ${pi + 1}`}
                  onClick={() => addPageUrl(pi)}
                />
              </div>
            ))}
          </ObSection>

          {/* 4 – Multi-Page Configuration */}
          <ObSection
            step="4"
            title="Multi-Page Configuration"
            subtitle="Hosting and Shield placement across pages"
          >
            <div className="ob-grid-2">
              <ObSelect
                label="Page 1 Hosted By"
                required
                options={HOSTED_BY}
                value={page1Host}
                onChange={(e) => setPage1Host(e.target.value)}
                hint="Specify who hosts/maintains each page in your flow."
              />
              <ObSelect
                label="Page 2 Hosted By"
                required
                options={HOSTED_BY}
                value={page2Host}
                onChange={(e) => setPage2Host(e.target.value)}
                hint="Specify who hosts/maintains each page in your flow."
              />
            </div>
            <ObSelect
              label="Page(s) Where Shield is Implemented"
              required
              options={SHIELD_PAGES}
              value={shieldPages}
              onChange={(e) => setShieldPages(e.target.value)}
              hint="Select all pages where the Shield JavaScript snippet is deployed."
            />
          </ObSection>

          {/* 5 – Payment Flows */}
          <ObSection
            step="5"
            title="Payment Flows"
            subtitle="Configure payment settings"
          >
            {paymentLocked ? (
              <div className="ob-locked-notice">
                <LockIcon size={16} />
                <div>
                  <div className="ob-locked-title">Payment Flow Options</div>
                  <div className="ob-locked-sub">
                    Payment flow configuration will be available after selecting
                    your MNO and service type above.
                  </div>
                </div>
              </div>
            ) : (
              <div className="ob-grid-2">
                <ObYesNo
                  label="HE Payment Flow"
                  required
                  value="Yes"
                  onChange={() => {}}
                  hint="Header Enrichment based payment flow."
                />
                <ObYesNo
                  label="WiFi Payment Flow"
                  required
                  value="No"
                  onChange={() => {}}
                  hint="WiFi-based payment flow configuration."
                />
              </div>
            )}
          </ObSection>

          {/* 6 – IP Details */}
          <ObSection
            step="6"
            title="IP Details"
            subtitle="Your IPs to use with the API"
          >
            <p className="ob-hint ob-mb12">
              Your Server IP. We will use it to get response from Shield API.
            </p>
            <div className="ob-ip-list">
              {ips.map((ip, i) => (
                <div key={i} className="ob-ip-row">
                  <span className="ob-ip-val">{ip}</span>
                  <button
                    className="ob-ip-remove"
                    onClick={() =>
                      setIps((p) => p.filter((_, idx) => idx !== i))
                    }
                  >
                    <CloseIcon size={11} />
                  </button>
                </div>
              ))}
            </div>
            <div className="ob-ip-add-row">
              <input
                className="ob-input"
                placeholder="Enter IP address"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newIp.trim()) {
                    setIps((p) => [...p, newIp.trim()]);
                    setNewIp("");
                  }
                }}
              />
              <button
                className="ob-add-ip-btn"
                onClick={() => {
                  if (newIp.trim()) {
                    setIps((p) => [...p, newIp.trim()]);
                    setNewIp("");
                  }
                }}
              >
                <PlusIcon size={13} />
                Add IP
              </button>
            </div>
          </ObSection>

          {/* 7 – Advanced Tracking */}
          <ObSection
            step="7"
            title="Advanced Tracking"
            badge="Optional"
            subtitle="Custom parameters, referrers and API variables"
          >
            <div className="ob-tracking-block">
              <div className="ob-tracking-title">
                Custom URL Parameters to Track
              </div>
              {urlParams.map((p, i) => (
                <input
                  key={i}
                  className="ob-input ob-mb6"
                  placeholder="e.g. revenue_id"
                  value={p}
                  onChange={(e) =>
                    setUrlParams((prev) =>
                      prev.map((v, idx) => (idx === i ? e.target.value : v)),
                    )
                  }
                />
              ))}
              <p className="ob-hint">
                These URL parameters are passed to Shield and will be visible in
                your dashboard.
              </p>
              <ObAddMore
                label="+ Add Parameter"
                onClick={() => setUrlParams((p) => [...p, ""])}
              />
            </div>
            <div className="ob-tracking-block">
              <div className="ob-tracking-title">
                Custom Referrers (Referrer URL Parameters)
              </div>
              {referrers.map((r, i) => (
                <input
                  key={i}
                  className="ob-input ob-mb6"
                  placeholder="e.g. ref_source"
                  value={r}
                  onChange={(e) =>
                    setReferrers((prev) =>
                      prev.map((v, idx) => (idx === i ? e.target.value : v)),
                    )
                  }
                />
              ))}
              <p className="ob-hint">These come from the referrer URL.</p>
              <ObAddMore
                label="+ Add Referrer"
                onClick={() => setReferrers((r) => [...r, ""])}
              />
            </div>
            <div className="ob-tracking-block">
              <div className="ob-tracking-title">Shield API Variables</div>
              {apiVars.map((v, i) => (
                <input
                  key={i}
                  className="ob-input ob-mb6"
                  placeholder="e.g. user_attribute_age"
                  value={v}
                  onChange={(e) =>
                    setApiVars((prev) =>
                      prev.map((val, idx) =>
                        idx === i ? e.target.value : val,
                      ),
                    )
                  }
                />
              ))}
              <p className="ob-hint">
                These variables are passed via the Shield API integration.
              </p>
              <ObAddMore
                label="+ Add Variable"
                onClick={() => setApiVars((v) => [...v, ""])}
              />
            </div>
          </ObSection>

          {/* 8 – Service Summary */}
          <ObSection
            step="8"
            title="Service Summary"
            subtitle="Quick overview — review before submitting"
          >
            <div className="ob-summary-grid">
              {[
                ["Service Name", serviceName || "—"],
                ["Short Code", shortCode || "—"],
                ["CSP/Merchant", cspMerchant || "—"],
                ["Type of Service", serviceType || "—"],
                ["Country", country || "—"],
                ["MNO", mno || "—"],
                ["Timezone", timezone || "—"],
                ["Shield Mode", shieldMode],
                ["Header Enriched", headerEnriched],
                ["LP Redirection", lpRedirection],
                ["Pages in Flow", numPages],
                ["Page 1 Hosted By", page1Host || "—"],
                ["Page 2 Hosted By", page2Host || "—"],
                ["Shield Pages", shieldPages || "—"],
                ["IPs", ips.join(", ") || "—"],
              ].map(([k, v]) => (
                <div key={k} className="ob-summary-row">
                  <span className="ob-summary-key">{k}</span>
                  <span className="ob-summary-val">{v}</span>
                </div>
              ))}
            </div>
            <p className="ob-hint ob-mt14">
              Review the summary above before saving. All changes will take
              effect immediately.
            </p>
            <label className="ob-confirm-check">
              <input
                type="checkbox"
                checked={summaryConfirmed}
                onChange={(e) => setSummaryConfirmed(e.target.checked)}
              />
              <span>
                I confirm that the service summary above accurately describes my
                service configuration and I understand that Shield will enforce
                these parameters for fraud detection.
              </span>
            </label>
          </ObSection>
        </div>
      </div>

      {/* ── Sticky footer ── */}
      <div className="ob-footer">
        <button className="ob-footer-cancel" onClick={onClose} type="button">
          ← Cancel
        </button>
        <div className="ob-footer-right">
          <button className="ob-footer-profile" type="button">
            Save as Profile
          </button>
          <button
            className="ob-footer-save"
            type="button"
            disabled={!summaryConfirmed}
            onClick={onClose}
          >
            ✓ Save Changes
          </button>
        </div>
      </div>
    </SvcModal>
  );
}

// ─── IP Modal ─────────────────────────────────────────────────────────────────
function IpModal({ row, onClose }) {
  const [ips, setIps] = useState(["192.168.1.1", "10.0.0.1"]);
  const [newIp, setNewIp] = useState("");
  return (
    <SvcModal
      title="IP Whitelist"
      subtitle={`Manage allowed IPs for ${row?.client}`}
      onClose={onClose}
      width={480}
    >
      <div className="svc-ip-list">
        {ips.map((ip, i) => (
          <div key={i} className="svc-ip-row">
            <span className="svc-val-mono">{ip}</span>
            <button
              className="svc-ip-remove"
              onClick={() =>
                setIps((prev) => prev.filter((_, idx) => idx !== i))
              }
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="svc-ip-add">
        <input
          className="svc-form-input"
          placeholder="Enter IP address"
          value={newIp}
          onChange={(e) => setNewIp(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newIp.trim()) {
              setIps((p) => [...p, newIp.trim()]);
              setNewIp("");
            }
          }}
        />
        <button
          className="svc-btn-primary"
          onClick={() => {
            if (newIp.trim()) {
              setIps((p) => [...p, newIp.trim()]);
              setNewIp("");
            }
          }}
        >
          Add
        </button>
      </div>
      <div className="svc-modal-actions">
        <button className="svc-btn-primary" onClick={onClose}>
          Save
        </button>
        <button className="svc-btn-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </SvcModal>
  );
}

// ─── Clone Service Modal ──────────────────────────────────────────────────────
// function CloneServiceModal({ row, onClose }) {
//   const [cloneName, setCloneName] = useState(`${row?.name || ""} (Copy)`);
//   const [done, setDone] = useState(false);
//   if (done)
//     return (
//       <SvcModal title="Clone Service" onClose={onClose} width={440}>
//         <div className="svc-confirm-result">
//           <div className="svc-confirm-icon">✅</div>
//           <div className="svc-confirm-title">Service Cloned</div>
//           <div className="svc-confirm-sub">
//             A copy of <strong>{row?.name}</strong> has been created as{" "}
//             <strong>{cloneName}</strong>.
//           </div>
//           <button className="svc-btn-primary" onClick={onClose}>
//             Done
//           </button>
//         </div>
//       </SvcModal>
//     );
//   return (
//     <SvcModal
//       title="Clone Service"
//       subtitle="Create a duplicate of this service"
//       onClose={onClose}
//       width={480}
//     >
//       <SvcField label="Source Service" value={row?.name} />
//       <SvcField label="Service ID" value={row?.serviceId} mono />
//       <div className="svc-form-field" className="ob-mt16">
//         <SvcInput
//           label="New Service Name"
//           value={cloneName}
//           onChange={(e) => setCloneName(e.target.value)}
//         />
//       </div>
//       <div className="svc-modal-actions">
//         <button className="svc-btn-primary" onClick={() => setDone(true)}>
//           Clone
//         </button>
//         <button className="svc-btn-cancel" onClick={onClose}>
//           Cancel
//         </button>
//       </div>
//     </SvcModal>
//   );
// }

// ─── Custom Variables Modal ───────────────────────────────────────────────────
function CustomVarsModal({ row, onClose }) {
  const [vars, setVars] = useState([
    { key: "CALLBACK_URL", value: "https://example.com/callback" },
    { key: "MAX_RETRY", value: "3" },
  ]);
  const [editIdx, setEditIdx] = useState(null);
  return (
    <SvcModal
      title="Custom Variables"
      subtitle={`Variables for ${row?.client}`}
      onClose={onClose}
      width={560}
    >
      <div className="svc-vars-list">
        {vars.map((v, i) => (
          <div key={i} className="svc-var-row">
            {editIdx === i ? (
              <>
                <input
                  className="svc-form-input svc-var-key"
                  value={v.key}
                  onChange={(e) =>
                    setVars((p) =>
                      p.map((x, j) =>
                        j === i ? { ...x, key: e.target.value } : x,
                      ),
                    )
                  }
                />
                <input
                  className="svc-form-input svc-var-val"
                  value={v.value}
                  onChange={(e) =>
                    setVars((p) =>
                      p.map((x, j) =>
                        j === i ? { ...x, value: e.target.value } : x,
                      ),
                    )
                  }
                />
                <button
                  className="svc-btn-primary svc-var-btn"
                  onClick={() => setEditIdx(null)}
                >
                  ✓
                </button>
              </>
            ) : (
              <>
                <span className="svc-var-key-lbl">{v.key}</span>
                <span className="svc-var-val-lbl">{v.value}</span>
                <button className="svc-var-edit" onClick={() => setEditIdx(i)}>
                  ✏️
                </button>
                <button
                  className="svc-var-del"
                  onClick={() => setVars((p) => p.filter((_, j) => j !== i))}
                >
                  🗑
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <button
        className="svc-var-add"
        onClick={() => {
          setVars((p) => [...p, { key: "NEW_VAR", value: "" }]);
          setEditIdx(vars.length);
        }}
      >
        + Add Variable
      </button>
      <div className="svc-modal-actions">
        <button className="svc-btn-primary" onClick={onClose}>
          Save
        </button>
        <button className="svc-btn-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </SvcModal>
  );
}

// ─── Update Summary Modal ─────────────────────────────────────────────────────
function UpdateSummaryModal({ row, onClose }) {
  const HISTORY = [
    {
      date: "2024-06-25",
      field: "Shield Mode",
      from: "Standard",
      to: "Premium",
      by: "admin@shield.io",
    },
    {
      date: "2024-05-10",
      field: "MNO",
      from: "--",
      to: "TRUE",
      by: "admin@shield.io",
    },
    {
      date: "2024-03-01",
      field: "Status",
      from: "inactive",
      to: "active",
      by: "system",
    },
  ];
  return (
    <SvcModal
      title="Update Summary"
      subtitle={`Change history for ${row?.name}`}
      onClose={onClose}
      width={640}
    >
      <div className="svc-history-list">
        {HISTORY.map((h, i) => (
          <div key={i} className="svc-history-row">
            <span className="svc-history-date">{h.date}</span>
            <span className="svc-history-field">{h.field}</span>
            <span className="svc-history-change">
              <span className="svc-history-from">{h.from}</span>
              <span className="svc-history-arrow">→</span>
              <span className="svc-history-to">{h.to}</span>
            </span>
            <span className="svc-history-by">{h.by}</span>
          </div>
        ))}
      </div>
      <div className="svc-modal-actions">
        <button className="svc-btn-cancel" onClick={onClose}>
          Close
        </button>
      </div>
    </SvcModal>
  );
}

function ServiceViewModal({ row, onClose }) {
  if (!row) return null;
  return (
    <SvcModal
      title="Service Details"
      subtitle={row.name}
      onClose={onClose}
      width={580}
    >
      <div className="svc-p6">
        {[
          ["Name", row.name],
          ["Service ID", row.serviceId],
          ["Status", row.status?.toUpperCase()],
          ["Client", row.client || "--"],
          ["VS Brand", row.vsBrand || "--"],
          ["Service Type", row.type || "--"],
          ["MNO", row.mno || "--"],
          ["Shield Mode", row.shieldMode || "--"],
          ["Header Enriched Flow", row.headerEnrichedFlow || "--"],
          ["HE Payment Flow", row.hePaymentFlow || "--"],
          ["WiFi Payment Flow", row.wifiPaymentFlow || "--"],
          ["Service Created", row.serviceCreated],
          ["Last Update", row.lastUpdate],
        ].map(([label, value]) => (
          <div key={label} className="svc-modal-row">
            <span className="svc-modal-label">{label}</span>
            <span className="svc-modal-value">{value || "—"}</span>
          </div>
        ))}
      </div>
      <div className="svc-modal-footer">
        <button className="svc-btn-cancel" onClick={onClose}>
          Close
        </button>
      </div>
    </SvcModal>
  );
}

// ─── Toggle Status Confirmation Modal ────────────────────────────────────────
function ToggleStatusModal({ row, onConfirm, onClose }) {
  const isActive = row?.status === "active";
  return createPortal(
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div>
            <div className="svc-modal-title">
              {isActive ? "Service Inactive" : "Service Active"}
            </div>
            <div className="svc-modal-subtitle">{row?.name}</div>
          </div>
          <button className="svc-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="svc-modal-body">
          <div className="svc-toggle-confirm-body">
            <div className={`svc-toggle-confirm-icon${isActive ? " inactive" : " active"}`} />
            <p className="svc-toggle-confirm-msg">
              {isActive
                ? "This will deactivate the service. It will no longer process transactions until reactivated."
                : "This will reactivate the service and resume transaction processing."}
            </p>
            <div className="svc-toggle-confirm-meta">
              <span>Service ID:</span>
              <span className="svc-toggle-id">{row?.serviceId}</span>
            </div>
          </div>
          <div className="svc-modal-footer">
            <button className="svc-modal-btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className={`svc-modal-btn-confirm${isActive ? " inactive" : " active"}`}
              onClick={onConfirm}
            >
              {isActive ? "Yes, Inactive" : "Yes, Active"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function PartnerActions({ row, openModal }) {
  return (
    <div className="f-gap-4">
      {PARTNER_ACTIONS.map((a) => (
        <button
          key={a.key}
          title={a.label}
          className={a.iconOnly ? "svc-action-icon-btn" : "svc-action-badge"}
          onClick={() => openModal(a.key, row)}
        >
          {a.iconOnly ? (
            PARTNER_ICONS[a.icon]
          ) : (
            <>
              <span className="svc-action-btn-icon">
                {PARTNER_ICONS[a.icon]}
              </span>
              {a.label}
            </>
          )}
        </button>
      ))}
      <button
        className="svc-export-icon-btn"
        title="Export Services"
        onClick={() => openModal("exportServices", row)}
      >
        ⬇
      </button>
      <button
        className={`svc-partner-toggle-btn${row.status === "active" ? " inactive" : " active"}`}
        title={row.status === "active" ? "Inactive" : "Active"}
        onClick={() => openModal("toggleStatus", row)}
      >
        {row.status === "active" ? "Inactive" : "Active"}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ── Services Export Modal ─────────────────────────────────────────────────────
const ALL_EXPORT_COLUMNS = [
  { key: "sr", label: "Sr.", partner: true },
  { key: "name", label: "Service Name", partner: true },
  { key: "serviceId", label: "Service ID", partner: true },
  { key: "status", label: "Status", partner: true },
  { key: "client", label: "Client", partner: false },
  { key: "vsBrand", label: "VS Brand", partner: false },
  { key: "serviceType", label: "Service Type", partner: true },
  { key: "mno", label: "MNO", partner: false },
  { key: "shieldMode", label: "Shield Mode", partner: true },
  { key: "headerEnrichedFlow", label: "Header Enriched Flow", partner: true },
  { key: "hePaymentFlow", label: "HE Payment Flow", partner: false },
  { key: "wifiPaymentFlow", label: "WiFi Payment Flow", partner: false },
  { key: "serviceCreated", label: "Service Created", partner: false },
  { key: "lastUpdate", label: "Last Update", partner: true },
];

function SvcExportModal({
  filter,
  allRows,
  activeRows,
  inactiveRows,
  onClose,
  role,
  initialPartner = null,
}) {
  const isPartnerRole = role === "partner";

  const baseRows =
    filter === "all"
      ? allRows
      : filter === "active"
        ? activeRows
        : inactiveRows;

  const filterLabel =
    filter === "all"
      ? "All Services"
      : filter === "active"
        ? "Active Services"
        : "Inactive Services";

  const color =
    filter === "all" ? "#2563eb" : filter === "active" ? "#22c55e" : "#ef4444";

  // Partner list for admin step-1
  const uniqueClients = [
    ...new Set(allRows.map((r) => r.client).filter(Boolean)),
  ].sort();

  // Admin flow: step 1 = pick partner, step 2 = configure & export
  // If initialPartner is provided (triggered from Actions row), skip step 1
  const [adminStep, setAdminStep] = useState(isPartnerRole || initialPartner !== null ? 2 : 1);
  const [selPartner, setSelPartner] = useState(initialPartner ?? "");

  const filteredRows = isPartnerRole
    ? baseRows
    : selPartner
      ? baseRows.filter((r) => r.client === selPartner)
      : baseRows;

  // Columns available per role
  const availableCols = ALL_EXPORT_COLUMNS.filter((c) =>
    isPartnerRole ? c.partner : true,
  );
  const [selected, setSelected] = useState(availableCols.map((c) => c.key));
  const [fmt, setFmt] = useState("xlsx");
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  function toggleCol(key) {
    setSelected((s) =>
      s.includes(key) ? s.filter((k) => k !== key) : [...s, key],
    );
  }
  function toggleAll() {
    setSelected((s) =>
      s.length === availableCols.length ? [] : availableCols.map((c) => c.key),
    );
  }

  function doExport() {
    setExporting(true);
    setTimeout(() => {
      try {
        const cols = availableCols.filter((c) => selected.includes(c.key));
        const rows = filteredRows;

        if (fmt === "csv") {
          const escape = (v) => {
            const s = String(v ?? "");
            return s.includes(",") || s.includes('"') || s.includes("\n")
              ? `"${s.replace(/"/g, '""')}"`
              : s;
          };
          const header = cols.map((c) => escape(c.label)).join(",");
          const body = rows.map((r, i) =>
            cols
              .map((c) => {
                if (c.key === "sr") return i + 1;
                return escape(r[c.key] ?? "");
              })
              .join(","),
          );
          const csv = [header, ...body].join("\n");
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `services-${filterLabel.replace(/\s+/g, "-").toLowerCase()}${selPartner ? "-" + selPartner.replace(/\s+/g, "-").toLowerCase() : ""}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          const xmlEscape = (v) =>
            String(v ?? "")
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;");
          const headerRow = cols
            .map(
              (c) =>
                `<Cell><Data ss:Type="String">${xmlEscape(c.label)}</Data></Cell>`,
            )
            .join("");
          const dataRows = rows
            .map((r, i) => {
              const cells = cols
                .map((c) => {
                  const val = c.key === "sr" ? i + 1 : (r[c.key] ?? "");
                  const type = typeof val === "number" ? "Number" : "String";
                  return `<Cell><Data ss:Type="${type}">${xmlEscape(val)}</Data></Cell>`;
                })
                .join("");
              return `<Row>${cells}</Row>`;
            })
            .join("");
          const xml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<?mso-application progid="Excel.Sheet"?>',
            '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
            '  <Worksheet ss:Name="Services">',
            "    <Table>",
            `      <Row>${headerRow}</Row>`,
            `      ${dataRows}`,
            "    </Table>",
            "  </Worksheet>",
            "</Workbook>",
          ].join("\n");
          const blob = new Blob([xml], {
            type: "application/vnd.ms-excel;charset=utf-8;",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `services-${filterLabel.replace(/\s+/g, "-").toLowerCase()}${selPartner ? "-" + selPartner.replace(/\s+/g, "-").toLowerCase() : ""}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        setExporting(false);
        setDone(true);
      } catch (err) {
        console.error("Export failed:", err);
        setExporting(false);
      }
    }, 400);
  }

  const previewCols = availableCols.filter((c) => selected.includes(c.key));

  // ── Step 1: Admin partner selection ───────────────────────────────────────
  if (!isPartnerRole && adminStep === 1) {
    return (
      <>
        <div className="svc-exp-backdrop" onClick={onClose} />
        <div className="svc-exp-modal svc-exp-modal--sm">
          {/* Header */}
          <div className="svc-exp-header">
            <div className="svc-exp-header-left">
              <div className="svc-exp-icon">
                ⬇
              </div>
              <div>
                <div className="svc-exp-title">Export {filterLabel}</div>
                <div className="svc-exp-sub">
                  Step 1 of 2 — Select a partner
                </div>
              </div>
            </div>
            <button type="button" className="svc-exp-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="svc-exp-body">
            <div className="svc-exp-section">
              <div className="svc-exp-section-title">Select Partner</div>
              <div className="svc-exp-partner-grid">
                {uniqueClients.map((c) => {
                  const cnt = baseRows.filter((r) => r.client === c).length;
                  if (cnt === 0) return null;
                  return (
                    <button
                      key={c}
                      type="button"
                      className={`svc-exp-partner-card${selPartner === c ? " selected" : ""}`}
                      onClick={() => setSelPartner(c === selPartner ? "" : c)}
                    >
                      <span className="svc-exp-partner-name">{c}</span>
                      <span className="svc-exp-partner-cnt">
                        {cnt} services
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className={`svc-exp-all-btn${selPartner === "" ? " active" : ""}`}
                onClick={() => setSelPartner("")}
              >
                {selPartner === "" ? "✓ " : ""}Export all partners (
                {baseRows.length} services)
              </button>
            </div>
          </div>

          <div className="svc-exp-footer">
            <button type="button" className="svc-exp-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="svc-exp-next-btn"
              onClick={() => setAdminStep(2)}
            >
              Continue →
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Step 2: Configure & export (both roles) ───────────────────────────────
  return (
    <>
      <div className="svc-exp-backdrop" onClick={onClose} />
      <div className="svc-exp-modal">
        {/* Header */}
        <div className="svc-exp-header">
          <div className="svc-exp-header-left">
            <div className="svc-exp-icon">
              ⬇
            </div>
            <div>
              <div className="svc-exp-title">Export {filterLabel}</div>
              <div className="svc-exp-sub">
                {isPartnerRole ? (
                  <>{filteredRows.length} services · your access level</>
                ) : selPartner ? (
                  <>
                    <strong>{selPartner}</strong> · {filteredRows.length}{" "}
                    services
                  </>
                ) : (
                  <>{filteredRows.length} services · all partners</>
                )}
              </div>
            </div>
          </div>
          <div className="svc-exp-header-right">
            {!isPartnerRole && (
              <button
                type="button"
                className="svc-exp-back-btn"
                onClick={() => {
                  setAdminStep(1);
                  setDone(false);
                }}
              >
                ← Change Partner
              </button>
            )}
            <button type="button" className="svc-exp-close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {!isPartnerRole && selPartner && (
          <div className="svc-exp-partner-pill">
            <span
              className="svc-exp-partner-pill-dot"
            />
            <span>
              Partner: <strong>{selPartner}</strong>
            </span>
            <span className="svc-exp-partner-pill-count">
              {filteredRows.length} services
            </span>
          </div>
        )}

        <div className="svc-exp-body">
          {/* Format */}
          <div className="svc-exp-section">
            <div className="svc-exp-section-title">File Format</div>
            <div className="svc-exp-fmt-row">
              {[
                { id: "xlsx", icon: "📊", label: "Excel (.xlsx)" },
                { id: "csv", icon: "📄", label: "CSV (.csv)" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`svc-exp-fmt-btn${fmt === f.id ? " active" : ""}`}
                  onClick={() => setFmt(f.id)}
                >
                  <span className="svc-exp-fmt-icon">{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div className="svc-exp-section">
            <div className="svc-exp-section-title">
              Columns
              <span className="svc-exp-col-count">
                {selected.length}/{availableCols.length} selected
              </span>
              <button
                type="button"
                className="svc-exp-toggle-all"
                onClick={toggleAll}
              >
                {selected.length === availableCols.length
                  ? "Deselect all"
                  : "Select all"}
              </button>
            </div>
            <div className="svc-exp-cols-grid">
              {availableCols.map((c) => (
                <label
                  key={c.key}
                  className={`svc-exp-col-item${selected.includes(c.key) ? " checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(c.key)}
                    onChange={() => toggleCol(c.key)}
                    className="svc-exp-col-checkbox"
                  />
                  <span className="svc-exp-col-label">{c.label}</span>
                </label>
              ))}
            </div>
            {isPartnerRole && (
              <div className="svc-exp-role-note">
                🔒 Columns are limited to your access level
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="svc-exp-section">
            <div className="svc-exp-section-title">
              Preview <span className="svc-exp-col-count">first 3 rows</span>
            </div>
            <div className="svc-exp-preview-wrap">
              <table className="svc-exp-preview-table">
                <thead>
                  <tr>
                    {previewCols.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.slice(0, 3).map((r, i) => (
                    <tr key={i}>
                      {previewCols.map((c) => (
                        <td key={c.key}>
                          {c.key === "sr" ? i + 1 : String(r[c.key] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={previewCols.length}
                        className="svc-exp-preview-empty"
                      >
                        No services match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="svc-exp-footer">
          {done ? (
            <div className="svc-exp-done">
              ✅ Export complete — file downloaded!
              <button
                type="button"
                className="svc-exp-done-close"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="svc-exp-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="svc-exp-export-btn"
                onClick={doExport}
                disabled={
                  exporting ||
                  selected.length === 0 ||
                  filteredRows.length === 0
                }
              >
                {exporting
                  ? "Preparing…"
                  : `⬇ Export ${filteredRows.length} Services`}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function PageServices({ role = "admin", setPage }) {
  const [tab, setTab] = useState("active");
  const [perPageSvc, setPerPageSvc] = useState(10);
  const [openRow, setOpenRow] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [exportModal, setExportModal] = useState(null);
  const [exportPartner, setExportPartner] = useState(null);
  const [services, setServices] = useState(svcRows);
  const [confirmToggle, setConfirmToggle] = useState(null); // row to confirm toggle
  const [cAdminClientId, setCAdminClientId] = useState("all");

  function openModal(key, row) {
    if (key === "dashboard") {
      if (setPage) setPage("overview", row);
      return;
    }
    if (key === "toggleStatus") {
      setConfirmToggle(row);
      return;
    }
    if (key === "exportServices") {
      setExportModal("all");
      setExportPartner(row?.client ?? null);
      return;
    }
    setActiveModal(key);
    setActiveRow(row);
  }
  function closeModal() {
    setActiveModal(null);
    setActiveRow(null);
  }
  function handleConfirmToggle() {
    if (!confirmToggle) return;
    setServices((prev) =>
      prev.map((s) =>
        s.id === confirmToggle.id
          ? { ...s, status: s.status === "active" ? "inactive" : "active" }
          : s,
      ),
    );
    setConfirmToggle(null);
    // Switch tab to reflect new status
    setTab(confirmToggle.status === "active" ? "inactive" : "active");
  }

  const isPartner = role === "partner";
  const isAdmin = role === "admin";
  const isCAdmin = role === "c-admin";
  const cAdminAccount = getDemoCAdminAccount();
  const cAdminClients = getAssignedClientAccounts(cAdminAccount);
  const cAdminClientNames = cAdminClients.map((client) => client.name);
  const scopedServices = isCAdmin
    ? services.filter((service) => {
        const client = cAdminClients.find((item) => item.name === service.client);
        return cAdminClientNames.includes(service.client) &&
          isServiceAllowedForCAdmin(service, cAdminAccount, client);
      })
    : services;
  const selectedCAdminClient =
    cAdminClients.find((client) => client.id === cAdminClientId) || null;
  const filteredServices =
    isCAdmin && selectedCAdminClient
      ? scopedServices.filter((service) => service.client === selectedCAdminClient.name)
      : scopedServices;

  const activeServices = filteredServices.filter((r) => r.status === "active");
  const inactiveServices = filteredServices.filter((r) => r.status !== "active");
  const displayed = tab === "active" ? activeServices : inactiveServices;
  const visibleServices = displayed.slice(0, perPageSvc);
  const defaultCAdminOnboardingClient = selectedCAdminClient || cAdminClients[0] || null;

  const SUMMARY_STATS = [
    { label: "Total Services",  value: filteredServices.length, color: "#2563eb", filter: "all"      },
    { label: "Active",          value: activeServices.length,   color: "#22c55e", filter: "active"   },
    { label: "Inactive",        value: inactiveServices.length, color: "#f50b1f", filter: "inactive" },
  ];

  const ALL_COLUMNS = [
    { key: "sr", label: "Sr.", admin: true, partner: true },
    { key: "name", label: "Name", admin: true, partner: true },
    { key: "serviceId", label: "Service ID", admin: true, partner: true },
    { key: "status", label: "Status", admin: true, partner: true },
    { key: "client", label: "Client", admin: true, partner: false },
    { key: "vsBrand", label: "VS Brand", admin: true, partner: false },
    { key: "serviceType", label: "Service Type", admin: true, partner: true },
    { key: "mno", label: "MNO", admin: true, partner: false },
    { key: "shieldMode", label: "ShieldMode", admin: true, partner: true },
    {
      key: "headerEnrichedFlow",
      label: "Header Enriched Flow",
      admin: true,
      partner: true,
    },
    {
      key: "hePaymentFlow",
      label: "HE Payment Flow",
      admin: true,
      partner: false,
    },
    {
      key: "wifiPaymentFlow",
      label: "WiFi Payment Flow",
      admin: true,
      partner: false,
    },
    {
      key: "serviceCreated",
      label: "Service Created",
      admin: true,
      partner: false,
    },
    { key: "lastUpdate", label: "Last Update", admin: true, partner: true },
    { key: "actions", label: "Actions", admin: true, partner: true },
  ];

  const visibleCols = ALL_COLUMNS.filter((c) =>
    isAdmin || isCAdmin ? c.admin : c.partner,
  );

  function renderCell(col, row, idx) {
    switch (col.key) {
      case "sr":
        return <span className="txt-muted">{idx + 1}</span>;
      case "name":
        return (
          <div className="text-flow" title={row.name}>
            <span className="txt-label-md">{row.name}</span>
          </div>
        );
      case "serviceId":
        return (
          <div className="text-flow" title={row.serviceId}>
            <span className="txt-mono">{row.serviceId}</span>
          </div>
        );
      case "status":
        return (
          <span
            className="svc-status-badge"
          >
            {row.status.toUpperCase()}
          </span>
        );
      case "client":
        return <span className="txt-body">{row.client || "--"}</span>;
      case "vsBrand":
        return <span className="svc-dash">{row.vsBrand || "--"}</span>;
      case "serviceType":
        return <span className="svc-dash">{row.type || "--"}</span>;
      case "mno":
        return <span className="svc-dash">{row.mno || "--"}</span>;
      case "shieldMode":
        return row.shieldMode && row.shieldMode !== "--" ? (
          <span className="svc-pill">{row.shieldMode}</span>
        ) : (
          <span className="txt-muted">--</span>
        );
      case "headerEnrichedFlow":
        return (
          <span className="svc-dash">{row.headerEnrichedFlow || "--"}</span>
        );
      case "hePaymentFlow":
        return <span className="svc-dash">{row.hePaymentFlow || "--"}</span>;
      case "wifiPaymentFlow":
        return <span className="svc-dash">{row.wifiPaymentFlow || "--"}</span>;
      case "serviceCreated":
        return <span className="svc-code">{row.serviceCreated}</span>;
      case "lastUpdate":
        return <span className="svc-code">{row.lastUpdate}</span>;
      case "actions":
        return isAdmin ? (
          <ActionsDropdown
            rowId={row.id}
            openRow={openRow}
            setOpenRow={setOpenRow}
            onAction={(key) => openModal(key, row)}
            row={row}
          />
        ) : (
          <PartnerActions row={row} openModal={openModal} />
        );
      default:
        return "--";
    }
  }

  return (
    <div>
      {activeModal === "view" && (
        <ServiceViewModal row={activeRow} onClose={closeModal} />
      )}
      {activeModal === "mapService" && (
        <MapServiceModal row={activeRow} onClose={closeModal} />
      )}
      {/* {activeModal === "solution" && (
        <SolutionModal row={activeRow} onClose={closeModal} />
      )} */}
      {activeModal === "edit" && (
        <EditServiceModal row={activeRow} onClose={closeModal} role={role} />
      )}
      {activeModal === "ip" && <IpModal row={activeRow} onClose={closeModal} />}
      {activeModal === "cloneService" && (
        <CloneServiceModal row={activeRow} onClose={closeModal} />
      )}
      {activeModal === "customVars" && (
        <CustomVarsModal row={activeRow} onClose={closeModal} />
      )}
      {activeModal === "updateSummary" && (
        <UpdateSummaryModal row={activeRow} onClose={closeModal} />
      )}
      {isCAdmin && (
        <div className="svc-cadmin-scope">
          <div className="svc-cadmin-main">
            <div className="svc-cadmin-kicker">C-Admin service scope</div>
            <div className="svc-cadmin-title">{cAdminAccount?.name || "C-Admin"}</div>
            <div className="svc-cadmin-sub">
              Can view and onboard services only for assigned client accounts.
            </div>
          </div>
          <div className="svc-cadmin-controls">
            <select
              className="svc-cadmin-select"
              value={cAdminClientId}
              onChange={(e) => {
                setCAdminClientId(e.target.value);
                setPerPageSvc(10);
              }}
            >
              <option value="all">All assigned clients</option>
              {cAdminClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="svc-add-btn"
              disabled={cAdminClients.length === 0}
              onClick={() =>
                setPage &&
                setPage("onboarding", {
                  clientId: selectedCAdminClient?.id || cAdminClients[0]?.id,
                  clientName: selectedCAdminClient?.name || cAdminClients[0]?.name,
                  cAdminId: cAdminAccount?.id,
                })
              }
            >
              + Add Service for Client
            </button>
          </div>
        </div>
      )}
      {/* Summary stats */}
      <div className="g-stats3 mb-section">
        {SUMMARY_STATS.map(({ label, value, color, filter }) => (
          <div
            key={label}
            className="svc-stat-clickable"
            role="button"
            tabIndex={0}
            onClick={() => {
              setExportPartner(isCAdmin && selectedCAdminClient ? selectedCAdminClient.name : null);
              setExportModal(filter);
            }}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              (setExportPartner(isCAdmin && selectedCAdminClient ? selectedCAdminClient.name : null),
              setExportModal(filter))
            }
          >
            <Card className="stat-top-4">
              <div className="kpi-stat dyn-color">
                {value}
              </div>
              <div className="stat-sublabel">{label}</div>
              <div className="svc-stat-export-hint">
                ↓ Export
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Export modal */}
      {exportModal &&
        createPortal(
          <SvcExportModal
            filter={exportModal}
            allRows={filteredServices}
            activeRows={activeServices}
            inactiveRows={inactiveServices}
            role={role}
            initialPartner={exportPartner}
            onClose={() => { setExportModal(null); setExportPartner(null); }}
          />,
          document.body,
        )}

      {confirmToggle && (
        <ToggleStatusModal
          row={confirmToggle}
          onClose={() => setConfirmToggle(null)}
          onConfirm={handleConfirmToggle}
        />
      )}

      {/* Charts */}
      <div className="g-split2 mb-section">
        <Card>
          <SectionTitle>Uptime Trend (14 days)</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={repTrend}>
              <XAxis dataKey="d" />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="visits"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle>API Calls by Service</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={API_CALL_DATA}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calls" radius={[4, 4, 0, 0]}>
                {API_CALL_DATA.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Service Registry */}
      <Card>
        <div className="svc-toolbar">
          <div className="svc-toolbar-left">
            <SectionTitle>Service Registration</SectionTitle>
            <div className="dt-entries-bar">
              <span className="dt-entries-lbl">Show</span>
              <select
                className="dt-entries-sel"
                value={perPageSvc}
                onChange={(e) => setPerPageSvc(Number(e.target.value))}
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="dt-entries-lbl">entries</span>
            </div>
            {(isPartner || isCAdmin) && (
              <button
                onClick={() => {
                  if (!setPage) return;
                  if (isCAdmin) {
                    setPage("onboarding", {
                      clientId: defaultCAdminOnboardingClient?.id,
                      clientName: defaultCAdminOnboardingClient?.name,
                      cAdminId: cAdminAccount?.id,
                    });
                    return;
                  }
                  setPage("onboarding");
                }}
                className="svc-add-btn"
                disabled={isCAdmin && !defaultCAdminOnboardingClient}
              >
                {isCAdmin ? "+ Onboard Service" : "⊕ Add New Service"}
              </button>
            )}
          </div>

          <div className="svc-toolbar-right">
            {[
              ["active", "22c55e", "dcfce7", "16a34a"],
              ["inactive", "f59e0b", "fef3c7", "d97706"],
            ].map(([key, dotHex, bgHex, textHex]) => {
              const isOn = tab === key;
              const count =
                key === "active"
                  ? activeServices.length
                  : inactiveServices.length;
              const label = key === "active" ? "✓ Active" : "⊘ Inactive";
              return (
                <button
                  key={key}
                  onClick={() => {
                    setPerPageSvc(25);
                    setTab(key);
                  }}
                  className={`svc-tab-btn ${isOn ? "on" : "off"}`}
                >
                  <span
                    className={`svc-tab-dot ${isOn ? "on" : "off"}`}
                  />
                  {label}
                  <span
                    className={`svc-tab-pill ${isOn ? "on" : "off"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="svc-tbl-wrap">
          <table className="svc-tbl">
            <colgroup>
              {visibleCols.map((col) => {
                const colClassMap = {
                  sr: "svc-col-sr",
                  name: "svc-col-name",
                  serviceId: "svc-col-id",
                  status: "svc-col-status",
                  client: "svc-col-client",
                  vsBrand: "svc-col-vsbrand",
                  serviceType: "svc-col-type",
                  mno: "svc-col-mno",
                  shieldMode: "svc-col-shield",
                  headerEnrichedFlow: "svc-col-hef",
                  hePaymentFlow: "svc-col-hepay",
                  wifiPaymentFlow: "svc-col-wifipay",
                  serviceCreated: "svc-col-created",
                  lastUpdate: "svc-col-updated",
                  actions: isPartner || isCAdmin ? "svc-col-actions-partner" : "svc-col-actions",
                };
                return (
                  <col key={col.key} className={colClassMap[col.key] || ""} />
                );
              })}
            </colgroup>
            <thead>
              <tr>
                {visibleCols.map((col) => (
                  <th key={col.key} className="dt-th">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={visibleCols.length} className="dt-empty">
                    No {tab} services found.
                  </td>
                </tr>
              ) : (
                visibleServices.map((row, idx) => (
                  <tr key={idx}>
                    {visibleCols.map((col) => (
                      <td
                        key={col.key}
                        className={
                          col.key === "sr"
                            ? "svc-td-sr"
                            : col.key === "actions"
                              ? "svc-td-actions"
                              : ""
                        }
                      >
                        {renderCell(col, row, idx)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
