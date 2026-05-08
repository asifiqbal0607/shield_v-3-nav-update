import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip,
} from "recharts";
import { TrafficIcon, InfoIcon } from "../components/ui/Icons";
import { transactionRows } from "../data/tables";
import { ALL_PARTNERS } from "../models/partners";

const TREND_BUCKETS = ["T-5", "T-4", "T-3", "T-2", "T-1", "Now"];

const SOURCES = [
  {
    id:"SRC-001", name:"Google Ads",       icon:"G", color:"#4285f4",
    identifier:"gclid", identifierLabel:"gclid param",
    visits:42800, clicks:37600, conversions:2462, convRate:7.2,
    revenue:"$74,100", revShare:30, avgSession:"3m 22s",
    bounce:32, status:"active", trend:"+19%", trendUp:true,
    topCountry:"KE", topDevice:"Desktop",
    domains:["google.com","googleadservices.com"],
  },
  {
    id:"SRC-002", name:"Facebook",         icon:"F", color:"#18f2dc",
    identifier:"fbclid", identifierLabel:"fbclid param",
    visits:38600, clicks:32100, conversions:1621, convRate:5.7,
    revenue:"$58,400", revShare:24, avgSession:"2m 48s",
    bounce:41, status:"active", trend:"+14%", trendUp:true,
    topCountry:"IQ", topDevice:"Mobile",
    domains:["facebook.com","m.facebook.com"],
  },
  {
    id:"SRC-003", name:"Instagram",        icon:"I", color:"#e1306c",
    identifier:"fbclid", identifierLabel:"fbclid param",
    visits:22400, clicks:18900, conversions:820, convRate:5.0,
    revenue:"$34,800", revShare:14, avgSession:"2m 12s",
    bounce:46, status:"active", trend:"+24%", trendUp:true,
    topCountry:"NG", topDevice:"Mobile",
    domains:["instagram.com","l.instagram.com"],
  },
  {
    id:"SRC-004", name:"TikTok",           icon:"T", color:"#ff0050",
    identifier:"ttclid", identifierLabel:"ttclid param",
    visits:28100, clicks:23400, conversions:915, convRate:4.4,
    revenue:"$31,200", revShare:13, avgSession:"1m 38s",
    bounce:54, status:"active", trend:"+38%", trendUp:true,
    topCountry:"NG", topDevice:"Mobile",
    domains:["tiktok.com","vm.tiktok.com"],
  },
  {
    id:"SRC-005", name:"X (Twitter)",      icon:"X", color:"#16b0f2",
    identifier:"twclid", identifierLabel:"twclid param",
    visits:10800, clicks:8200, conversions:281, convRate:3.8,
    revenue:"$9,600", revShare:4, avgSession:"1m 44s",
    bounce:57, status:"active", trend:"+5%", trendUp:true,
    topCountry:"SD", topDevice:"Mobile",
    domains:["t.co","twitter.com","x.com"],
  },
  {
    id:"SRC-006", name:"Snapchat",         icon:"S", color:"#f7c948",
    identifier:"ScCid", identifierLabel:"ScCid param",
    visits:7900, clicks:6100, conversions:196, convRate:3.5,
    revenue:"$7,200", revShare:3, avgSession:"1m 02s",
    bounce:61, status:"active", trend:"+11%", trendUp:true,
    topCountry:"SA", topDevice:"Mobile",
    domains:["snapchat.com"],
  },
];

const PARTNER_SESSION_NAME = "Tiot";

const LP_URL_TEMPLATES = [
  "https://lp.playit.mobi/subscribe?gclid=GCL-{id}&campaign=search",
  "https://m.facebook.com/l.php?fbclid=FB-{id}&u=https%3A%2F%2Flp.playit.mobi%2Foffer",
  "https://l.instagram.com/?fbclid=IG-{id}&u=https%3A%2F%2Flp.playit.mobi%2Fstory",
  "https://ads.tiktok.com/i18n/pixel/events?ttclid=TT-{id}&redirect=https%3A%2F%2Flp.playit.mobi",
  "https://t.co/offer?twclid=TW-{id}&url=https%3A%2F%2Flp.playit.mobi%2Fx",
  "https://www.snapchat.com/scan?ScCid=SC-{id}&destination=https%3A%2F%2Flp.playit.mobi",
  "https://newsletter.partner.mobi/lp?utm_source=newsletter&utm_medium=email&click={id}",
  "https://publisher.example.com/native?source=affiliate&subid={id}",
];

function getPartnerForTransaction(index) {
  const preferredPartnerIds = [1, 1, 1, 2, 2, 3, 4, 5];
  const partnerId = preferredPartnerIds[index % preferredPartnerIds.length];
  return ALL_PARTNERS.find((p) => p.id === partnerId) || ALL_PARTNERS[0];
}

function buildTransactionLpRows() {
  return transactionRows.map((tx, index) => {
    const fallbackPartner = getPartnerForTransaction(index);
    const partner = tx.partnerId
      ? ALL_PARTNERS.find((p) => p.id === tx.partnerId) || fallbackPartner
      : ALL_PARTNERS.find((p) => p.name === tx.partnerName) || fallbackPartner;
    const shortId = tx.id.slice(-8);
    const lpUrl = tx.lpUrl || tx.landingPageUrl || LP_URL_TEMPLATES[index % LP_URL_TEMPLATES.length].replace("{id}", shortId);
    return {
      ...tx,
      partnerId: partner.id,
      partnerName: tx.partnerName || partner.name,
      lpUrl,
    };
  });
}

function getParam(params, name) {
  const key = Array.from(params.keys()).find((item) => item.toLowerCase() === name.toLowerCase());
  return key ? params.get(key) : "";
}

function cleanParamValue(value) {
  const text = String(value || "").trim();
  if (!text || /^your_/i.test(text) || /^\{.+\}$/.test(text)) return "";
  return text;
}

function titleize(value) {
  return String(value || "Unknown")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function detectSourceFromUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const params = parsed.searchParams;
    const source = SOURCES.find((src) => {
      const hasIdentifier = Array.from(params.keys()).some(
        (key) => key.toLowerCase() === src.identifier.toLowerCase()
      );
      const hasDomain = src.domains?.some((domain) => host === domain || host.endsWith("." + domain));
      if (src.name === "Facebook" || src.name === "Instagram") return hasIdentifier && hasDomain;
      return hasIdentifier || hasDomain;
    });

    if (source) return source;

    const affId = cleanParamValue(getParam(params, "Aff_ID"));
    const pubId = cleanParamValue(getParam(params, "Pub_ID"));
    const clickId = cleanParamValue(getParam(params, "ClickID"));
    const smCampaign = cleanParamValue(getParam(params, "SMCampaign"));
    const utmSource = cleanParamValue(getParam(params, "utm_source"));
    const rsrc = cleanParamValue(getParam(params, "rsrc"));

    if (affId) {
      return {
        id: "SRC-AFF-" + affId.replace(/[^a-z0-9]/gi, "").toUpperCase(),
        name: "Affiliate " + affId,
        icon: "A",
        color: "#0d9488",
        identifier: "Aff_ID",
        identifierLabel: "Affiliate ID",
        domains: host ? [host] : [],
      };
    }

    if (pubId) {
      return {
        id: "SRC-PUB-" + pubId.replace(/[^a-z0-9]/gi, "").toUpperCase(),
        name: "Publisher " + pubId,
        icon: "P",
        color: "#6366f1",
        identifier: "Pub_ID",
        identifierLabel: "Publisher ID",
        domains: host ? [host] : [],
      };
    }

    if (utmSource || rsrc || smCampaign || clickId) {
      const namedSource = utmSource || rsrc || "Tracked Campaign";
      return {
        id: "SRC-TRACKED-" + namedSource.replace(/[^a-z0-9]/gi, "").toUpperCase(),
        name: titleize(namedSource),
        icon: namedSource.charAt(0).toUpperCase() || "T",
        color: "#f97316",
        identifier: utmSource ? "utm_source" : rsrc ? "rsrc" : smCampaign ? "SMCampaign" : "ClickID",
        identifierLabel: utmSource ? "UTM Source" : rsrc ? "Redirect Source" : smCampaign ? "SM Campaign" : "Click ID",
        domains: host ? [host] : [],
      };
    }

    const namedSource = getParam(params, "source") || host || "Unknown";
    return {
      id: "SRC-CUSTOM-" + namedSource.replace(/[^a-z0-9]/gi, "").toUpperCase(),
      name: titleize(namedSource),
      icon: namedSource.charAt(0).toUpperCase() || "?",
      color: "#64748b",
      identifier: getParam(params, "source") ? "source" : "domain",
      identifierLabel: getParam(params, "source") ? "source param" : "LP domain",
      domains: host ? [host] : [],
    };
  } catch {
    return {
      id: "SRC-UNKNOWN",
      name: "Unknown",
      icon: "?",
      color: "#64748b",
      identifier: "invalid-url",
      identifierLabel: "Invalid LP URL",
      domains: [],
    };
  }
}

function deriveSourcesFromTransactions(rows) {
  const grouped = new Map();
  rows.forEach((tx) => {
    const src = detectSourceFromUrl(tx.lpUrl);
    const existing = grouped.get(src.id) || {
      ...src,
      visits: 0,
      clicks: 0,
      conversions: 0,
      revenueAmount: 0,
      partnerNames: new Set(),
      lpUrls: new Set(),
      transactionIds: [],
      topCountry: "TH",
      topDevice: "Mobile",
      bounce: 42,
      avgSession: "2m 10s",
      trend: "0%",
      trendUp: true,
      status: "active",
    };
    existing.visits += 1;
    existing.clicks += 1;
    existing.conversions += tx.status === "Clear" ? 0 : 1;
    existing.revenueAmount += tx.status === "Clear" ? 18 : 32;
    existing.partnerNames.add(tx.partnerName);
    existing.lpUrls.add(tx.lpUrl);
    existing.transactionIds.push(tx.id);
    grouped.set(src.id, existing);
  });

  const totalRevenue = Array.from(grouped.values()).reduce((sum, src) => sum + src.revenueAmount, 0) || 1;
  return Array.from(grouped.values())
    .map((src) => ({
      ...src,
      partnerNames: Array.from(src.partnerNames),
      lpUrls: Array.from(src.lpUrls),
      convRate: src.visits ? Number(((src.conversions / src.visits) * 100).toFixed(1)) : 0,
      revenue: "$" + src.revenueAmount.toLocaleString(),
      revShare: Math.round((src.revenueAmount / totalRevenue) * 100),
      trend: Math.max(3, src.clicks * 7) + "%",
      trendUp: true,
    }))
    .sort((a, b) => b.clicks - a.clicks);
}

function buildRoleTrendData(rows, sourceList) {
  const clickRows = TREND_BUCKETS.map((label) => ({ d: label }));
  const convRows = TREND_BUCKETS.map((label) => ({ d: label }));
  const bucketStats = TREND_BUCKETS.map(() => ({}));

  sourceList.forEach((src) => {
    clickRows.forEach((row) => { row[src.id] = 0; });
    convRows.forEach((row) => { row[src.id] = 0; });
  });

  rows.forEach((tx, index) => {
    const src = detectSourceFromUrl(tx.lpUrl);
    const bucketIndex = index % TREND_BUCKETS.length;
    if (!bucketStats[bucketIndex][src.id]) {
      bucketStats[bucketIndex][src.id] = { visits: 0, conversions: 0 };
    }
    bucketStats[bucketIndex][src.id].visits += 1;
    bucketStats[bucketIndex][src.id].conversions += tx.status === "Clear" ? 0 : 1;
    clickRows[bucketIndex][src.id] += 1;
  });

  bucketStats.forEach((bucket, index) => {
    sourceList.forEach((src) => {
      const stats = bucket[src.id] || { visits: 0, conversions: 0 };
      convRows[index][src.id] = stats.visits
        ? Number(((stats.conversions / stats.visits) * 100).toFixed(1))
        : 0;
    });
  });

  return { clickRows, convRows };
}

const CHART_TICK = { fontSize:10, fill:"#94a3b8" };
const CHART_TT   = { fontSize:11, borderRadius:8, border:"none", background:"#0f172a", color:"#fff" };

function sourceTone(src) {
  const name = String(src?.name || "").toLowerCase();
  const id = String(src?.id || "").toLowerCase();
  if (name.includes("google")) return "ts-tone-google";
  if (name.includes("facebook")) return "ts-tone-facebook";
  if (name.includes("instagram")) return "ts-tone-instagram";
  if (name.includes("tiktok")) return "ts-tone-tiktok";
  if (name.includes("twitter") || name === "x" || name.includes("x (")) return "ts-tone-x";
  if (name.includes("snapchat")) return "ts-tone-snapchat";
  if (id.includes("aff")) return "ts-tone-affiliate";
  if (id.includes("pub")) return "ts-tone-publisher";
  if (id.includes("tracked")) return "ts-tone-tracked";
  return "ts-tone-slate";
}

function widthClass(value, max = 100) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return `ts-w-${Math.round(pct / 5) * 5}`;
}

function avatarSizeClass(size) {
  if (size <= 30) return "ts-src-avatar--sm";
  if (size >= 46) return "ts-src-avatar--lg";
  return "ts-src-avatar--md";
}

function convRateTitle(conversions, visits) {
  return `Conv. Rate = Conversions / Visits x 100 (${conversions.toLocaleString()} / ${visits.toLocaleString()} x 100)`;
}

function SourceAvatar({ src, size }) {
  return (
    <div className={`ts-src-avatar ${sourceTone(src)} ${avatarSizeClass(size || 38)}`}>
      {src.icon}
    </div>
  );
}

function TrendBadge({ trend, trendUp }) {
  return (
    <span className={`ts-trend-badge ${trendUp ? "ts-trend-badge-up" : "ts-trend-badge-dn"}`}>
      {trendUp ? "+" : ""}{trend}
    </span>
  );
}

function MiniBar({ value, max, tone }) {
  return (
    <div className="ts-mini-bar-track">
      <div className={`ts-mini-bar-fill ${tone} ${widthClass(value, max)}`} />
    </div>
  );
}

function IdTag({ value }) {
  return <span className="ts-id-tag">{value}</span>;
}

function BarChartTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const src = payload[0].payload;
  const tone = sourceTone(src);
  return (
    <div className="ts-bar-tt-box">
      <div className="ts-bar-tt-hd">
        <div className={`ts-bar-tt-dot ${tone}`} />
        <span className="ts-bar-tt-name">{src.name}</span>
      </div>
      {[
        { label:"Visits",     value: src.visits.toLocaleString(),  tone:"ts-tone-success" },
        { label:"Clicks",     value: src.clicks.toLocaleString(),  tone },
        { label:"Conv. Rate", value: src.convRate + "%",            tone:"ts-tone-amber", title: convRateTitle(src.conversions, src.visits) },
      ].map((r) => (
        <div key={r.label} className="ts-bar-tt-row">
          <span className="ts-bar-tt-lbl">{r.label}</span>
          <span className={`ts-bar-tt-val ${r.tone}`} title={r.title}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function SourceModal({ source, onClose }) {
  if (!source) return null;
  const tone = sourceTone(source);
  return (
    <div className="partner-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="partner-box ts-modal-box">
        <div className={`partner-modal-header ts-modal-header ${tone}`}>
          <div className="f-gap-14">
            <SourceAvatar src={source} size={46} />
            <div>
              <div className="txt-white-hd">{source.name}</div>
              <div className="txt-white-sub">{source.id} - Traffic Source</div>
            </div>
          </div>
          <button className="partner-modal-close" onClick={onClose}>x</button>
        </div>
        <div className="p-section">
          <div className="ts-modal-kpi-grid">
            {[
              { label:"Visits",      value: source.visits.toLocaleString(),      tone:"ts-tone-success" },
              { label:"Clicks",      value: source.clicks.toLocaleString(),      tone },
              { label:"Conversions", value: source.conversions.toLocaleString(), tone:"ts-tone-amber" },
              { label:"Conv. Rate",  value: source.convRate + "%",              tone:"ts-tone-violet", title: convRateTitle(source.conversions, source.visits) },
            ].map((k) => (
              <div key={k.label} className="ts-modal-kpi-cell">
                <div className={`ts-modal-kpi-val ${k.tone}`} title={k.title}>{k.value}</div>
                <div className="ts-modal-kpi-lbl">{k.label}</div>
              </div>
            ))}
          </div>
          {[
            ["Identified By",  source.identifierLabel],
            ["Identifier",     source.identifier],
            ["Known Domains",  source.domains && source.domains.join(", ")],
            ["Partners",       source.partnerNames?.join(", ")],
            ["LP URLs",        source.lpUrls?.slice(0, 3).join(", ")],
            ["Revenue",        source.revenue],
            ["Revenue Share",  source.revShare + "% of total"],
            ["Avg. Session",   source.avgSession],
            ["Bounce Rate",    source.bounce + "%"],
            ["Top Country",    source.topCountry],
            ["Top Device",     source.topDevice],
            ["Status",         source.status],
            ["Trend",          source.trend],
          ].map(([label, value]) => (
            <div key={label} className="ts-modal-detail-row">
              <span className="ts-modal-detail-lbl">{label}</span>
              {label === "Status" ? (
                <span className={`partner-status-badge ts-status-${value}`}>{value}</span>
              ) : label === "Trend" ? (
                <TrendBadge trend={value} trendUp={source.trendUp} />
              ) : (label === "Identified By" || label === "Identifier") ? (
                <IdTag value={value} />
              ) : (
                <span className="ts-modal-detail-val">{value}</span>
              )}
            </div>
          ))}
          <div className="ph-modal-actions">
            <button className="partner-btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Trafficsources({ role = "admin" }) {
  const isAdmin = role === "admin";
  const transactionLpRows = buildTransactionLpRows();
  const sessionPartner = ALL_PARTNERS.find((p) => p.name === PARTNER_SESSION_NAME) || ALL_PARTNERS[0];
  const [tab,      setTab]      = useState("overview");
  const [selected, setSelected] = useState(null);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("All");
  const [partnerFilter, setPartnerFilter] = useState(isAdmin ? "All" : String(sessionPartner.id));
  const [perPage,  setPerPage]  = useState(10);
  const [series,   setSeries]   = useState({});

  function toggleSeries(key) {
    setSeries((prev) => ({ ...prev, [key]: prev[key] === false }));
  }

  const scopedTransactions = transactionLpRows.filter((tx) => (
    isAdmin && partnerFilter === "All" ? true : tx.partnerId === Number(partnerFilter)
  ));
  const sources = deriveSourcesFromTransactions(scopedTransactions);
  const dynamicSeries = sources.map((src) => ({
    key: src.id,
    label: src.name,
    color: src.color,
  }));
  const { clickRows: trendData, convRows: convData } = buildRoleTrendData(scopedTransactions, sources);
  const scopeLabel = isAdmin && partnerFilter === "All"
    ? "All onboarded partners"
    : ALL_PARTNERS.find((p) => p.id === Number(partnerFilter))?.name || sessionPartner.name;
  const totalVisits      = sources.reduce((a, r) => a + r.visits, 0);
  const totalClicks      = sources.reduce((a, r) => a + r.clicks, 0);
  const totalConversions = sources.reduce((a, r) => a + r.conversions, 0);
  const avgConvRate      = sources.length
    ? (sources.reduce((a, r) => a + r.convRate, 0) / sources.length).toFixed(1)
    : "0.0";
  const maxClicks        = Math.max(...sources.map((s) => s.clicks), 1);

  const filtered = sources.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.partnerNames?.some((partner) => partner.toLowerCase().includes(q)) ||
      r.lpUrls?.some((url) => url.toLowerCase().includes(q))
    )
      && (filter === "All" || r.status === filter);
  });
  const visible = filtered.slice(0, perPage);

  const KPI = [
    { label:"Total Visits",    value: totalVisits.toLocaleString(),      tone:"ts-tone-success", sub:"Page landings" },
    { label:"Total Clicks",    value: totalClicks.toLocaleString(),      tone:"ts-tone-google", sub:"Subscribe taps" },
    { label:"Conversions",     value: totalConversions.toLocaleString(), tone:"ts-tone-amber", sub:"Block API called" },
    { label:"Avg. Conv. Rate", value: avgConvRate + "%",                 tone:"ts-tone-violet", sub:"Across all sources" },
  ];

  const TABS = [
    { key:"overview", label:"Overview" },
    { key:"trends",   label:"Trend Analysis" },
    { key:"sources",  label:"All Sources" },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="ts-page-header">
        <div className="ts-page-hd-row">
          <div className="ts-page-icon-wrap">
            <div className="ts-page-icon-box">
              <TrafficIcon size={20} />
            </div>
            <div>
              <h1 className="ts-page-title">Traffic Sources</h1>
              <div className="ts-page-meta">
                <span>{sources.length} sources</span>
                <span className="ts-page-meta-sep">·</span>
                <span className="ts-page-meta-active">{sources.filter((r) => r.status === "active").length} active</span>
                <span className="ts-page-meta-sep">·</span>
                <span>{totalClicks.toLocaleString()} total clicks</span>
              </div>
            </div>
          </div>
          <div className="f-wrap-10">
            {isAdmin ? (
              <select
                className="spt-admin-select"
                value={partnerFilter}
                onChange={(e) => {
                  setPartnerFilter(e.target.value);
                  setSelected(null);
                }}
              >
                <option value="All">All onboarded partners</option>
                {ALL_PARTNERS.map((partner) => (
                  <option key={partner.id} value={partner.id}>{partner.name}</option>
                ))}
              </select>
            ) : (
              <div className="ts-info-badge">{sessionPartner.name}</div>
            )}
            <div className="ts-info-badge">
              <InfoIcon size={13} />
              Sources detected from LP URL params and domains
            </div>
          </div>
        </div>
      </div>

      {/* Tab strip */}
      <div className="ts-tab-strip">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`ts-tab-btn ts-tab-btn--${t.key}${tab === t.key ? " ts-tab-btn--active" : ""}`}>
            <span className="ts-tab-pip" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="ts-tab-body">

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div>
            <div className="g-stats4 mb-section">
              {KPI.map((k) => (
                <div key={k.label} className={`ts-kpi-card ${k.tone}`}>
                  <div className={`ts-kpi-val ${k.tone}`}>{k.value}</div>
                  <div className="ts-kpi-lbl">{k.label}</div>
                  <div className="ts-kpi-sub">{k.sub}</div>
                </div>
              ))}
            </div>

            <div className="g-split2 mb-section">
              <div className="ts-chart-card">
                <div className="ts-chart-title">Clicks by Source</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={sources} margin={{ top:4, right:8, bottom:0, left:-10 }}>
                    <XAxis dataKey="name" tick={{ ...CHART_TICK, fontSize:9 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => v.split(" ")[0]} />
                    <YAxis tick={CHART_TICK} axisLine={false} tickLine={false}
                      tickFormatter={(v) => v >= 1000 ? (v / 1000).toFixed(0) + "k" : v} />
                    <Tooltip cursor={{ fill:"rgba(0,0,0,.04)" }} content={<BarChartTooltip />} />
                    <Bar dataKey="clicks" radius={[5, 5, 0, 0]}>
                      {sources.map((s) => <Cell key={s.id} fill={s.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="ts-chart-card">
                <div className="ts-chart-title">Revenue Share</div>
                <div className="ts-rev-share-wrap">
                  <PieChart width={130} height={130}>
                    <Pie data={sources} cx="50%" cy="50%" innerRadius={36} outerRadius={60}
                      dataKey="revShare" paddingAngle={2}>
                      {sources.map((s) => <Cell key={s.id} fill={s.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize:11, borderRadius:8, border:"1px solid #e8ecf3", background:"#fff", color:"#0f172a", boxShadow:"0 4px 16px rgba(0,0,0,0.10)" }}
                      wrapperStyle={{ zIndex:50 }}
                      formatter={(v, _n, props) => [v + "%", props.payload.name]}
                    />
                  </PieChart>
                  <div className="ts-rev-legend">
                    {sources.map((s) => (
                      <div key={s.id} className="ts-rev-legend-item">
                        <span className={`ts-rev-legend-dot ${sourceTone(s)}`} />
                        <span className="ts-rev-legend-name">{s.name.split(" ")[0]}</span>
                        <span className="ts-rev-legend-pct">{s.revShare}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="g-auto-md">
              {sources.map((src) => {
                const tone = sourceTone(src);
                return (
                  <div key={src.id} className="card ts-src-card"
                    onClick={() => setSelected(src)}
                  >
                    <div className="ts-src-hd">
                      <div className="ts-src-avatar-wrap">
                        <SourceAvatar src={src} size={38} />
                        <div>
                          <div className="ts-src-name">{src.name}</div>
                          <div className="ts-src-id">
                            {src.identifierLabel} {isAdmin ? "- " + src.partnerNames.join(", ") : ""}
                          </div>
                        </div>
                      </div>
                      <span className={`partner-status-badge ts-status-${src.status}`}>
                        {src.status}
                      </span>
                    </div>

                    <div className="ts-src-kpi-grid">
                      {[
                        { label:"Clicks",    value: src.clicks.toLocaleString() },
                        { label:"Conv. %",   value: src.convRate + "%", title: convRateTitle(src.conversions, src.visits) },
                        { label:"Revenue",   value: src.revenue },
                        { label:"Bounce",    value: src.bounce + "%" },
                      ].map((k) => (
                        <div key={k.label} className="ts-src-kpi-cell">
                          <div className="ts-src-kpi-val" title={k.title}>{k.value}</div>
                          <div className="ts-src-kpi-lbl">{k.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="ts-revshare-row">
                      <span className="ts-revshare-lbl">Revenue share</span>
                      <span className={`ts-src-kpi-val ts-revshare-val-color ${tone}`}>{src.revShare}%</span>
                    </div>
                    <div className="ts-revshare-track">
                      <div className={`ts-revshare-fill ${tone} ${widthClass(src.revShare)}`} />
                    </div>

                    <div className={`ts-src-trend ${src.trendUp ? "ts-src-trend--up" : "ts-src-trend--dn"}`}>
                      {src.trendUp ? "+" : ""}{src.trend} vs last period
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TRENDS */}
        {tab === "trends" && (
          <div>
            <div className="ts-trends-btn-row">
              {dynamicSeries.map((s) => (
                <button key={s.key} onClick={() => toggleSeries(s.key)}
                  className={`ts-trends-series-btn ${sourceTone(s)}${series[s.key] !== false ? " ts-trends-series-btn--on" : ""}`}>
                  <span className="ts-trends-pip" />
                  {s.label}
                </button>
              ))}
            </div>

            <div className="ts-trends-chart-card">
              <div className="ts-chart-title">Click Volume by Source</div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trendData} margin={{ top:4, right:8, bottom:0, left:-10 }}>
                  <defs>
                    {dynamicSeries.map((s) => (
                      <linearGradient key={s.key} id={"tg-" + s.key} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={s.color} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis dataKey="d" tick={CHART_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={CHART_TICK} axisLine={false} tickLine={false}
                    tickFormatter={(v) => v >= 1000 ? (v / 1000).toFixed(0) + "k" : v} />
                  <Tooltip contentStyle={CHART_TT}
                    formatter={(v, name) => [v.toLocaleString(), dynamicSeries.find((s) => s.key === name)?.label || name]} />
                  {dynamicSeries.map((s) => series[s.key] !== false && (
                    <Area key={s.key} type="monotone" dataKey={s.key}
                      stroke={s.color} strokeWidth={2}
                      fill={"url(#tg-" + s.key + ")"}
                      dot={{ r:3, fill:s.color, strokeWidth:0 }} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="ts-trends-conv-card">
              <div className="ts-chart-title">Conversion Rate Trend</div>
              <div className="ts-trends-conv-sub">% of visits that triggered the Block API (subscribe click)</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={convData} margin={{ top:4, right:8, bottom:0, left:-10 }}>
                  <defs>
                    {dynamicSeries.map((s) => (
                      <linearGradient key={s.key} id={"cg-" + s.key} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={s.color} stopOpacity={0.12} />
                        <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis dataKey="d" tick={CHART_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={CHART_TICK} axisLine={false} tickLine={false}
                    tickFormatter={(v) => v + "%"} />
                  <Tooltip contentStyle={CHART_TT}
                    formatter={(v, name) => [v + "%", dynamicSeries.find((s) => s.key === name)?.label || name]} />
                  {dynamicSeries.map((s) => series[s.key] !== false && (
                    <Area key={s.key} type="monotone" dataKey={s.key}
                      stroke={s.color} strokeWidth={2}
                      fill={"url(#cg-" + s.key + ")"}
                      dot={{ r:3, fill:s.color, strokeWidth:0 }} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ALL SOURCES */}
        {tab === "sources" && (
          <div>
            <div className="g-stats4 mb-section">
              {KPI.map((k) => (
                <div key={k.label} className={`ts-kpi-card ${k.tone}`}>
                  <div className={`ts-kpi-val ${k.tone}`}>{k.value}</div>
                  <div className="ts-kpi-lbl">{k.label}</div>
                </div>
              ))}
            </div>

            <div className="ts-src-tbl-header">
              <div>
                <div className="ts-src-tbl-title">All Traffic Sources</div>
                <div className="ts-page-meta">{scopeLabel} - derived from transaction LP URLs</div>
              </div>
              <div className="f-wrap-10">
                <div className="dt-entries-bar">
                  <span className="dt-entries-lbl">Show</span>
                  <select className="dt-entries-sel" value={perPage}
                    onChange={(e) => setPerPage(+e.target.value)}>
                    {[10, 25, 50].map((n) => <option key={n}>{n}</option>)}
                  </select>
                  <span className="dt-entries-lbl">entries</span>
                </div>
                <div className="f-gap-6">
                  {[{ label:"All", value:"All" },
                    ...["active","needsattention","inactive"]
                      .filter((s) => sources.some((r) => r.status === s))
                      .map((s) => ({
                        label: s === "needsattention" ? "Needs Attention"
                          : s.charAt(0).toUpperCase() + s.slice(1),
                        value: s,
                      })),
                  ].map((f) => (
                    <button key={f.value} onClick={() => setFilter(f.value)}
                      className={"partner-filter-pill " + (filter === f.value ? "active" : "inactive")}>
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="p-rel">
                  <span className="partner-search-icon ts-search-icon-sm">&#9906;</span>
                  <input className="partner-search" placeholder="Search sources..."
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="ts-tbl-wrap">
              <table className="dt">
                <thead>
                  <tr className="ts-tbl-hd">
                    {[
                      "Source",
                      ...(isAdmin ? ["Partner"] : []),
                      "Identifier",
                      "Visits",
                      "Clicks",
                      "Conv. Rate",
                      "Revenue",
                      "Rev. Share",
                      "Trend",
                      "",
                    ].map((h) => (
                      <th key={h} className="dt-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((src) => {
                    const tone = sourceTone(src);
                    return (
                      <tr key={src.id} className="dt-tr" onClick={() => setSelected(src)}>
                        <td className="p-sm">
                          <div className="f-gap-10">
                            <SourceAvatar src={src} size={30} />
                            <div>
                              <div className="txt-strong-sm">{src.name}</div>
                              <div className="txt-mono">{src.id}</div>
                            </div>
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="p-sm">
                            <div className="txt-strong-sm">{src.partnerNames.join(", ")}</div>
                          </td>
                        )}
                        <td className="p-sm"><IdTag value={src.identifier} /></td>
                        <td className="ts-tbl-visits">{src.visits.toLocaleString()}</td>
                        <td className="p-sm">
                          <div className="ts-tbl-clicks-row">
                            <MiniBar value={src.clicks} max={maxClicks} tone={tone} />
                            <span className={`ts-tbl-clicks-val ${tone}`}>
                              {src.clicks.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="p-sm">
                          <div className="ts-tbl-conv-row">
                            <div className="ts-tbl-conv-track">
                              <div className={`ts-tbl-conv-fill ${widthClass(src.convRate * 8)}`} />
                            </div>
                            <span className="ts-tbl-conv-val" title={convRateTitle(src.conversions, src.visits)}>{src.convRate}%</span>
                          </div>
                        </td>
                        <td className="ts-tbl-revenue">{src.revenue}</td>
                        <td className="p-sm">
                          <div className="ts-tbl-revshare-row">
                            <div className="ts-tbl-revshare-track">
                              <div className={`ts-tbl-revshare-fill ${tone} ${widthClass(src.revShare)}`} />
                            </div>
                            <span className="ts-tbl-revshare-val">{src.revShare}%</span>
                          </div>
                        </td>
                        <td className="p-sm"><TrendBadge trend={src.trend} trendUp={src.trendUp} /></td>
                        <td className="p-sm">
                          <button className="partner-view-btn"
                            onClick={(e) => { e.stopPropagation(); setSelected(src); }}>
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {visible.length === 0 && (
                    <tr><td colSpan={isAdmin ? 10 : 9} className="dt-empty">No sources match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="partner-footer-txt">Showing {visible.length} of {sources.length} sources</div>
          </div>
        )}
      </div>

      {selected && <SourceModal source={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
