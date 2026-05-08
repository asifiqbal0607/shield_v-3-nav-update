import { useState, useCallback } from "react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip,
} from "recharts";
import { Card, SectionTitle } from "../components/ui";
import {
  BLUE, GREEN, AMBER, ROSE,
  statusBg, statusText,
} from "../components/constants/colors";
import { UsersIcon } from "../components/ui/Icons";

/* ── Data ─────────────────────────────────────────────────────────────────── */
const FLAG = {
  ZA:"🇿🇦",TH:"🇹🇭",TZ:"🇹🇿",NG:"🇳🇬",SN:"🇸🇳",KE:"🇰🇪",GH:"🇬🇭",
  ZW:"🇿🇼",ET:"🇪🇹",SD:"🇸🇩",ZM:"🇿🇲",UG:"🇺🇬",IQ:"🇮🇶",SA:"🇸🇦",AE:"🇦🇪",
};

const PARTNER_ROWS = [
  { id:"PTR-012", name:"IQ Services",      contact:"Karwan",          email:"karwan@gmail.com",          country:"IQ", revenue:"UGX 1.8M",      status:"active",   joined:"2023-10-20", lastActive:"Today",   type:"Aggregator", isDirectClient:false, aggregatorId:null },
  { id:"PTR-006", name:"Safaricom Kenya",  contact:"Grace Wanjiru",   email:"grace@safaricom.co.ke",     country:"KE", revenue:"KES 3,400,000", status:"active",   joined:"2022-11-30", lastActive:"Today",   type:"Aggregator", isDirectClient:false, aggregatorId:null },
  { id:"PTR-001", name:"Aplimedia",        contact:"John Smith",      email:"john@truedigital.com",      country:"IQ", revenue:"฿1,240,000",   status:"active",   joined:"2023-01-15", lastActive:"Today",   type:"CSP", isDirectClient:false, aggregatorId:"PTR-012" },
  { id:"PTR-002", name:"Iraqcom",          contact:"Sipho Dlamini",   email:"sipho@mtn.co.za",           country:"IQ", revenue:"R 980,000",     status:"active",   joined:"2023-03-08", lastActive:"Today",   type:"CSP", isDirectClient:false, aggregatorId:"PTR-012" },
  { id:"PTR-003", name:"Gameloft",         contact:"Amina Hassan",    email:"amina@vodacom.tz",          country:"IQ", revenue:"TZS 4.2M",      status:"active",   joined:"2023-06-22", lastActive:"2d ago",  type:"CSP", isDirectClient:true,  aggregatorId:"PTR-012" },
  { id:"PTR-004", name:"Mobimind",         contact:"Kwame Asante",    email:"kwame@glo.com.gh",          country:"IQ", revenue:"GHS 210,000",   status:"inactive", joined:"2024-01-05", lastActive:"22d ago", type:"CSP", isDirectClient:true,  aggregatorId:"PTR-012" },
  { id:"PTR-005", name:"Iraqtel",          contact:"Sipho Dlamini",   email:"sipho2@mtn.co.za",          country:"IQ", revenue:"R 980,000",     status:"active",   joined:"2023-03-08", lastActive:"Today",   type:"CSP", isDirectClient:false, aggregatorId:"PTR-012" },
  { id:"PTR-007", name:"IQNet",            contact:"Sipho Dlamini",   email:"sipho3@mtn.co.za",          country:"IQ", revenue:"R 980,000",     status:"active",   joined:"2023-03-08", lastActive:"Today",   type:"CSP", isDirectClient:false, aggregatorId:"PTR-012" },
  { id:"PTR-013", name:"IQMedia",          contact:"Sipho Dlamini",   email:"sipho4@mtn.co.za",          country:"IQ", revenue:"R 980,000",     status:"active",   joined:"2023-03-08", lastActive:"Today",   type:"CSP", isDirectClient:false, aggregatorId:"PTR-012" },
  { id:"PTR-014", name:"IQConnect",        contact:"Sipho Dlamini",   email:"sipho5@mtn.co.za",          country:"IQ", revenue:"R 980,000",     status:"active",   joined:"2023-03-08", lastActive:"Today",   type:"CSP", isDirectClient:false, aggregatorId:"PTR-012" },
  { id:"PTR-015", name:"IQBroadband",      contact:"Sipho Dlamini",   email:"sipho6@mtn.co.za",          country:"IQ", revenue:"R 980,000",     status:"active",   joined:"2023-03-08", lastActive:"Today",   type:"CSP", isDirectClient:false, aggregatorId:"PTR-012" },
  { id:"PTR-008", name:"Airtel Nigeria",   contact:"Chukwuemeka O.",  email:"chukwu@airtel.ng",          country:"NG", revenue:"₦ 2,100,000",   status:"active",   joined:"2023-07-01", lastActive:"Today",   type:"CSP", isDirectClient:true,  aggregatorId:"PTR-006" },
  { id:"PTR-016", name:"Orange Senegal",   contact:"Moussa Diop",     email:"moussa@orange.sn",          country:"SN", revenue:"CFA 890,000",   status:"needsattention",  joined:"2023-09-14", lastActive:"8d ago",  type:"CSP", isDirectClient:false, aggregatorId:"PTR-006" },
  { id:"PTR-017", name:"Telecel Zimbabwe", contact:"Tatenda Moyo",    email:"tatenda@telecel.co.zw",     country:"ZW", revenue:"USD 45,000",    status:"active",   joined:"2024-02-18", lastActive:"1d ago",  type:"CSP", isDirectClient:false, aggregatorId:"PTR-006" },
  { id:"PTR-009", name:"True",             contact:"Bereket Alemu",   email:"bereket@ethiotelecom.et",   country:"ET", revenue:"ETB 820,000",   status:"active",   joined:"2023-08-09", lastActive:"Today",   type:"CSP", isDirectClient:true,  aggregatorId:null },
  { id:"PTR-010", name:"Dtac",             contact:"Omar Al-Rashid",  email:"omar@sudatel.sd",           country:"SD", revenue:"SDG 340,000",   status:"needsattention",  joined:"2024-03-01", lastActive:"5d ago",  type:"CSP", isDirectClient:true,  aggregatorId:null },
  { id:"PTR-018", name:"IQ Services",      contact:"Mwila Mwansa",    email:"mwila@zamtel.zm",           country:"ZM", revenue:"ZMW 98,000",    status:"active",   joined:"2024-04-12", lastActive:"3d ago",  type:"CSP", isDirectClient:true,  aggregatorId:null },
  { id:"PTR-019", name:"Media World",      contact:"Mwila Mwansa",    email:"mwila2@zamtel.zm",          country:"ZM", revenue:"ZMW 98,000",    status:"active",   joined:"2024-04-12", lastActive:"3d ago",  type:"CSP", isDirectClient:true,  aggregatorId:null },
  { id:"PTR-020", name:"Gameloft",         contact:"Mwila Mwansa",    email:"mwila3@zamtel.zm",          country:"ZM", revenue:"ZMW 98,000",    status:"active",   joined:"2024-04-12", lastActive:"3d ago",  type:"CSP", isDirectClient:true,  aggregatorId:null },
  { id:"PTR-021", name:"Mobimind",         contact:"Mwila Mwansa",    email:"mwila4@zamtel.zm",          country:"ZM", revenue:"ZMW 98,000",    status:"active",   joined:"2024-04-12", lastActive:"3d ago",  type:"CSP", isDirectClient:true,  aggregatorId:null },
  { id:"PTR-022", name:"Dharam",           contact:"Mwila Mwansa",    email:"mwila5@zamtel.zm",          country:"ZM", revenue:"ZMW 98,000",    status:"active",   joined:"2024-04-12", lastActive:"3d ago",  type:"CSP", isDirectClient:true,  aggregatorId:null },
];

const TREND_DATA = [
  { d:"Sep 1",partners:8 },{ d:"Sep 7",partners:9 },
  { d:"Sep 14",partners:9 },{ d:"Sep 21",partners:10 },{ d:"Sep 26",partners:12 },
];

function deriveNodes(partners) {
  return partners.map((p) => ({
    id:             `node-${p.id}`,
    name:           p.name,
    geo:            p.country,
    // A partner is "direct" if isDirectClient===true, regardless of aggregator
    // A partner is "aggregator" if type==="Aggregator"
    // Otherwise plain "csp"
    role:           p.type === "Aggregator" ? "aggregator"
                  : p.isDirectClient ? "direct" : "csp",
    parentId:       p.aggregatorId ? `node-${p.aggregatorId}` : null,
    status:         p.status,
    isDirectClient: p.isDirectClient || false,
  }));
}

/* Avatar — pre-computed palette, no color-mix */
const AV_PALETTE = [
  {bg:"#dbeafe",c:"#1e40af"},{bg:"#dcfce7",c:"#15803d"},{bg:"#ede9fe",c:"#6d28d9"},
  {bg:"#fef3c7",c:"#92400e"},{bg:"#fee2e2",c:"#991b1b"},{bg:"#e0f2fe",c:"#075985"},
  {bg:"#d1fae5",c:"#065f46"},{bg:"#f3e8ff",c:"#6b21a8"},
];
function avColors(name) {
  return AV_PALETTE[name.charCodeAt(0) % AV_PALETTE.length];
}

const COUNTRIES = [
  {code:"AE",name:"United Arab Emirates"},{code:"ET",name:"Ethiopia"},
  {code:"GH",name:"Ghana"},{code:"IQ",name:"Iraq"},{code:"KE",name:"Kenya"},
  {code:"NG",name:"Nigeria"},{code:"SA",name:"Saudi Arabia"},{code:"SD",name:"Sudan"},
  {code:"SN",name:"Senegal"},{code:"TH",name:"Thailand"},{code:"TZ",name:"Tanzania"},
  {code:"UG",name:"Uganda"},{code:"ZA",name:"South Africa"},{code:"ZM",name:"Zambia"},
  {code:"ZW",name:"Zimbabwe"},
];
const PARTNER_TYPES   = ["Aggregator","CSP"];
const AGGREGATOR_LIST = PARTNER_ROWS.filter((p) => p.type === "Aggregator");

/* ── Alert definitions ───────────────────────────────────────────────────── */
const ALERT_TYPES = [
  {
    key: "daily_peak",
    label: "Daily Peak Alert",
    desc: "Triggered when transaction volume exceeds the set threshold in a single day.",
    unit: "transactions",
    defaultThreshold: 10000,
    defaultTime: "08:00",
  },
  {
    key: "traffic_spike",
    label: "Abnormal Traffic Spike Alert",
    desc: "Triggered when abnormal traffic patterns are detected.",
    unit: "% spike",
    defaultThreshold: 30,
    defaultTime: "08:00",
  },
  // {
  //   key: "block_rate",
  //   label: "Block Rate Alert",
  //   desc: "Triggered when the block rate exceeds a set percentage threshold.",
  //   unit: "% block rate",
  //   defaultThreshold: 20,
  //   defaultTime: "08:00",
  // },
];

/* Initial alert state per partner — all disabled by default */
function makeDefaultAlerts(partnerId) {
  return ALERT_TYPES.reduce((acc, t) => {
    acc[t.key] = {
      enabled: false,
      threshold: t.defaultThreshold,
      time: t.defaultTime,
      email: "",
    };
    return acc;
  }, { partnerId });
}

/* ── UTC offset helper ───────────────────────────────────────────────────── */
const UTC_OFFSETS = [
  { label: "UTC−12:00", value: -12 }, { label: "UTC−11:00", value: -11 },
  { label: "UTC−10:00", value: -10 }, { label: "UTC−09:00", value: -9  },
  { label: "UTC−08:00", value: -8  }, { label: "UTC−07:00", value: -7  },
  { label: "UTC−06:00", value: -6  }, { label: "UTC−05:00", value: -5  },
  { label: "UTC−04:00", value: -4  }, { label: "UTC−03:00", value: -3  },
  { label: "UTC−02:00", value: -2  }, { label: "UTC−01:00", value: -1  },
  { label: "UTC+00:00", value: 0   }, { label: "UTC+01:00", value: 1   },
  { label: "UTC+02:00", value: 2   }, { label: "UTC+03:00 (Baghdad/Riyadh)", value: 3 },
  { label: "UTC+03:30", value: 3.5 }, { label: "UTC+04:00", value: 4   },
  { label: "UTC+04:30", value: 4.5 }, { label: "UTC+05:00", value: 5   },
  { label: "UTC+05:30", value: 5.5 }, { label: "UTC+05:45", value: 5.75},
  { label: "UTC+06:00", value: 6   }, { label: "UTC+06:30", value: 6.5 },
  { label: "UTC+07:00", value: 7   }, { label: "UTC+08:00", value: 8   },
  { label: "UTC+09:00", value: 9   }, { label: "UTC+09:30", value: 9.5 },
  { label: "UTC+10:00", value: 10  }, { label: "UTC+11:00", value: 11  },
  { label: "UTC+12:00", value: 12  },
];

function toUtcLabel(localTime, offsetHours = 0) {
  if (!localTime) return "—";
  const [h, m] = localTime.split(":").map(Number);
  const totalMin = h * 60 + m - offsetHours * 60;
  const utcMin = ((totalMin % 1440) + 1440) % 1440;
  const uh = String(Math.floor(utcMin / 60)).padStart(2, "0");
  const um = String(utcMin % 60).padStart(2, "0");
  return `${uh}:${um} UTC`;
}

/* ── Alerts Modal ────────────────────────────────────────────────────────── */
function AlertsModal({ partner, alerts, onClose, onSave }) {
  const [form, setForm] = useState({ ...alerts });
  const [saved, setSaved] = useState(false);
  const [utcOffset, setUtcOffset] = useState(alerts.utcOffset ?? 3); // default UTC+3 (Baghdad)

  function setField(key, field, value) {
    setForm((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  function handleSave() {
    onSave({ ...form, utcOffset });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const av = avColors(partner.name);
  const enabledCount = ALERT_TYPES.filter((t) => form[t.key]?.enabled).length;

  return (
    <div className="partner-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="partner-box partner-box--alerts">
        <div className="partner-modal-header">
          <div className="f-gap-14">
            <div className="partner-avatar">
              {partner.name[0]}
            </div>
            <div>
              <div className="txt-white-hd">Alert Settings</div>
              <div className="txt-white-sub">
                {partner.name} · {enabledCount} of {ALERT_TYPES.length} alerts active
              </div>
            </div>
          </div>
          <button className="partner-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="p-section">
          {/* Partner timezone selector */}
          <div className="alert-tz-row">
            <div className="alert-tz-row-left">
              <div className="alert-tz-row-title">Partner Timezone</div>
              <div className="alert-tz-row-desc">
                All send times below are entered in this timezone and converted to UTC for delivery.
              </div>
            </div>
            <select
              className="form-input alert-tz-select"
              value={utcOffset}
              onChange={(e) => setUtcOffset(Number(e.target.value))}
            >
              {UTC_OFFSETS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="alerts-list">
            {ALERT_TYPES.map((type) => {
              const cfg = form[type.key] || {};
              return (
                <div key={type.key} className={`alert-card${cfg.enabled ? " alert-card--on" : ""}`}>
                  <div className="alert-card-header">
                    <div className="alert-card-left">
                      <div className="alert-card-title">{type.label}</div>
                      <div className="alert-card-desc">{type.desc}</div>
                    </div>
                    <button
                      type="button"
                      className={`ph-toggle${cfg.enabled ? " on" : ""}`}
                      onClick={() => setField(type.key, "enabled", !cfg.enabled)}
                    >
                      <span className="ph-toggle-knob" />
                    </button>
                  </div>

                  {cfg.enabled && (
                    <div className="alert-card-body">
                      <div className="g-halves">
                        <div>
                          <label className="form-label">
                            Threshold ({type.unit})
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            value={cfg.threshold}
                            min={1}
                            onChange={(e) => setField(type.key, "threshold", +e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="form-label">
                            Send time
                            <span className="alert-tz-note"> (partner local time)</span>
                          </label>
                          <input
                            type="time"
                            className="form-input"
                            value={cfg.time}
                            onChange={(e) => setField(type.key, "time", e.target.value)}
                          />
                          <div className="alert-tz-hint">
                            UTC equivalent: {cfg.time ? toUtcLabel(cfg.time, utcOffset) : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="form-field-mt12">
                        <label className="form-label">
                          Recipient email
                          <span className="txt-optional"> (leave blank to use partner email)</span>
                        </label>
                        <input
                          type="email"
                          className="form-input"
                          placeholder={partner.email}
                          value={cfg.email}
                          onChange={(e) => setField(type.key, "email", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="ph-modal-actions">
            <button className="partner-btn-ghost" onClick={onClose}>Cancel</button>
            <button className="partner-btn-primary" onClick={handleSave}>
              {saved ? "Saved" : "Save Alerts"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Partner Modal ───────────────────────────────────────────────────────── */
function PartnerModal({ partner, onClose, onSave, onMarkInactive, alerts, onSaveAlerts }) {
  const [mode, setMode] = useState("view");
  const [form, setForm] = useState({ ...partner });
  const [saving, setSaving] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  function set(f, v) { setForm((x) => ({ ...x, [f]: v })); }
  function handleSave() {
    setSaving(true);
    setTimeout(() => { onSave(form); setSaving(false); setMode("view"); }, 500);
  }
  function handleMarkInactive() {
    // Mark partner inactive and auto-disable all their alerts
    onMarkInactive(partner.id);
    onClose();
  }
  if (!partner) return null;

  const av = avColors(partner.name);
  const isAlreadyInactive = partner.status === "inactive";

  return (
    <div className="partner-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="partner-box">
        <div className="partner-modal-header">
          <div className="f-gap-14">
            <div className="partner-avatar">
              {partner.name[0]}
            </div>
            <div>
              <div className="txt-white-hd">
                {mode === "edit" ? "Edit Partner" : mode === "confirm-inactive" ? "Mark Inactive" : partner.name}
              </div>
              <div className="txt-white-sub">{FLAG[partner.country] ?? "🌐"} {partner.country} · {partner.id}</div>
            </div>
          </div>
          <button className="partner-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="p-section">
          {mode === "view" && (
            <>
              {[
                ["Contact",     partner.contact],
                ["Email",       partner.email],
                ["Country",     `${FLAG[partner.country] ?? "🌐"} ${partner.country}`],
                ["Revenue",     partner.revenue],
                ["Status",      partner.status],
                ["Type",        partner.type],
                ["Joined",      partner.joined],
                ["Last active", partner.lastActive],
              ].map(([label, value]) => (
                <div key={label} className="partner-detail-row">
                  <span className="stat-sublabel">{label}</span>
                  {label === "Status" ? (
                    <span className="partner-status-badge">{value}</span>
                  ) : label === "Type" ? (
                    <span className={`badge ${partner.type === "Aggregator" ? "badge-amber" : "badge-blue"}`}>{value}</span>
                  ) : (
                    <span className="detail-val">{value}</span>
                  )}
                </div>
              ))}
              <div className="ph-modal-actions">
                <button className="partner-btn-primary" onClick={() => setMode("edit")}>Edit Partner</button>
                <button className="partner-btn-alerts"  onClick={() => setShowAlerts(true)}>Manage Alerts</button>
                {!isAlreadyInactive && (
                  <button className="partner-btn-inactive" onClick={() => setMode("confirm-inactive")}>Mark Inactive</button>
                )}
              </div>
            </>
          )}

          {mode === "edit" && (
            <>
              <div className="g-halves mb-section">
                {[
                  ["name","Partner Name","text"],["contact","Contact Person","text"],
                  ["email","Email Address","email"],["revenue","Revenue","text"],
                ].map(([f,l,t]) => (
                  <div key={f}>
                    <label className="form-label">{l}</label>
                    <input className="form-input" type={t} value={form[f]} onChange={(e) => set(f,e.target.value)} />
                  </div>
                ))}
                <div>
                  <label className="form-label">Country</label>
                  <select className="form-input" value={form.country} onChange={(e) => set("country",e.target.value)}>
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{FLAG[c.code]??""} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={(e) => set("status",e.target.value)}>
                    <option value="active">Active</option>
                    <option value="needsattention">Needs Attention</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="ph-modal-actions">
                <button className="partner-btn-ghost"   onClick={() => setMode("view")}>Cancel</button>
                <button className="partner-btn-primary" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Save Changes"}</button>
              </div>
            </>
          )}

          {mode === "confirm-inactive" && (
            <div className="ph-delete-confirm">
              <div className="ph-inactive-icon" />
              <p className="ph-delete-msg">
                Mark <strong>{partner.name}</strong> as inactive?
                All active alerts for this partner will be automatically disabled.
              </p>
              <div className="ph-modal-actions">
                <button className="partner-btn-ghost"    onClick={() => setMode("view")}>Cancel</button>
                <button className="partner-btn-inactive" onClick={handleMarkInactive}>Yes, Mark Inactive</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showAlerts && (
        <AlertsModal
          partner={partner}
          alerts={alerts || makeDefaultAlerts(partner.id)}
          onClose={() => setShowAlerts(false)}
          onSave={(updated) => { onSaveAlerts(updated); setShowAlerts(false); }}
        />
      )}
    </div>
  );
}
function AddPartnerModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name:"", contact:"", email:"", country:"",
    type:"CSP", isDirectClient:false, aggregatorId:"", revenue:"",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function set(f,v) { setForm((x)=>({...x,[f]:v})); setErrors((e)=>({...e,[f]:""})); }
  function validate() {
    const e={};
    if (!form.name.trim())    e.name="Required";
    if (!form.contact.trim()) e.contact="Required";
    if (!form.email.trim())   e.email="Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email="Invalid email";
    if (!form.country)        e.country="Required";
    return e;
  }
  function handleSubmit() {
    const errs=validate();
    if (Object.keys(errs).length){setErrors(errs);return;}
    setSaving(true);
    setTimeout(()=>{
      onAdd({
        id:`PTR-${String(Date.now()).slice(-3)}`, name:form.name.trim(),
        contact:form.contact.trim(), email:form.email.trim(), country:form.country,
        revenue:form.revenue.trim()||"—", status:"active",
        joined:new Date().toISOString().slice(0,10), lastActive:"Today",
        type:form.type, isDirectClient:form.isDirectClient,
        aggregatorId:form.type==="CSP"?(form.aggregatorId||null):null,
      });
      setSaving(false); onClose();
    },600);
  }

  return (
    <div className="partner-backdrop" onClick={(e)=>e.target===e.currentTarget&&onClose()}>
      <div className="partner-box">
        <div className="partner-modal-header">
          <div className="f-gap-14">
            <div className="partner-avatar">+</div>
            <div>
              <div className="txt-white-hd">Add New Partner</div>
              <div className="txt-white-sub">Fill in the details below</div>
            </div>
          </div>
          <button className="partner-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="p-section">
          {/* Type selector */}
          <div className="mb-section">
            <label className="form-label">Partner Type</label>
            <div className="f-gap-8">
              {PARTNER_TYPES.map((t) => (
                <button key={t} type="button" onClick={()=>set("type",t)}
                  className={`ph-type-btn${form.type===t?" ph-type-btn-on":""}`}>{t}</button>
              ))}
            </div>
          </div>

          {form.type==="CSP" && (
            <div className="mb-section">
              <div className="ph-toggle-row">
                <div>
                  <div className="form-label form-label-tight">Also a Direct Client?</div>
                  <div className="stat-sublabel">This CSP has a direct contract with us</div>
                </div>
                <button type="button" className={`ph-toggle${form.isDirectClient?" on":""}`}
                  onClick={()=>set("isDirectClient",!form.isDirectClient)}>
                  <span className="ph-toggle-knob"/>
                </button>
              </div>
              <div className="form-field-mt12">
                <label className="form-label">Under Aggregator <span className="txt-optional">(optional)</span></label>
                <select className="form-input" value={form.aggregatorId} onChange={(e)=>set("aggregatorId",e.target.value)}>
                  <option value="">— None (standalone CSP) —</option>
                  {AGGREGATOR_LIST.map((a)=><option key={a.id} value={a.id}>{a.name} · {FLAG[a.country]??""} {a.country}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="g-halves mb-section">
            {[
              {f:"name",  l:"Partner Name",  t:"text",  ph:"e.g. Safaricom Kenya",req:true},
              {f:"contact",l:"Contact Person",t:"text", ph:"Full name",           req:true},
              {f:"email", l:"Email Address", t:"email", ph:"contact@company.com", req:true},
              {f:"revenue",l:"Revenue",      t:"text",  ph:"e.g. KES 3,400,000",  req:false},
            ].map(({f,l,t,ph,req})=>(
              <div key={f}>
                <label className="form-label">{l}{req&&<span className="txt-required"> *</span>}</label>
                <input className={errors[f] ? "form-input form-input-error" : "form-input"} type={t} placeholder={ph} value={form[f]}
                  onChange={(e)=>set(f,e.target.value)} />
                {errors[f]&&<div className="form-error-msg">{errors[f]}</div>}
              </div>
            ))}
            <div>
              <label className="form-label">Country <span className="txt-required">*</span></label>
              <select className={errors.country ? "form-input form-input-error" : "form-input"} value={form.country} onChange={(e)=>set("country",e.target.value)}>
                <option value="">Select country…</option>
                {COUNTRIES.map((c)=><option key={c.code} value={c.code}>{FLAG[c.code]??""} {c.name}</option>)}
              </select>
              {errors.country&&<div className="form-error-msg">{errors.country}</div>}
            </div>
          </div>

          <div className="ph-modal-actions">
            <button className="partner-btn-ghost" type="button" onClick={onClose}>Cancel</button>
            <button className="partner-btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
              {saving?"Adding…":"Add Partner"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Hierarchy: CSP Node ─────────────────────────────────────────────────── */
function NodeCard({ node, isDragging, onDragStart }) {
  const av = avColors(node.name);
  return (
    <div className={`ph-hier-node${isDragging?" ph-hier-dragging":""}${node.isDirectClient&&node.role==="csp"?" ph-hier-dual":""}`}
      draggable onDragStart={(e)=>onDragStart(e,node.id)}>
      <span className="ph-hier-handle">⠿</span>
      <div className="partner-row-avatar partner-row-avatar--sm">
        {node.name[0]}
      </div>
      <div className="ph-node-info">
        <div className="txt-strong-sm ph-node-name">{node.name}</div>
        <div className="f-gap-4">
          <span className="badge badge-blue ph-badge-xs">CSP</span>
          <span className="badge badge-gray ph-badge-xs">{FLAG[node.geo]??""} {node.geo}</span>
          {node.isDirectClient&&<span className="badge badge-green ph-badge-xs">Direct</span>}
        </div>
      </div>
    </div>
  );
}

/* ── Hierarchy: Aggregator Lane ─────────────────────────────────────────── */
function AggLane({ agg, children, onDrop, onDragOver, draggingId }) {
  // Start collapsed — show first 5, expand on click
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? children : children.slice(0, 5);
  const extra = children.length - 5;
  const av    = avColors(agg.name);

  return (
    <div className="ph-hier-lane">
      <div className="ph-hier-lane-hd">
        <div className="f-gap-10">
          <div className="partner-row-avatar partner-row-avatar--md">
            {agg.name[0]}
          </div>
          <div>
            <div className="txt-strong-sm">{agg.name}</div>
            <div className="txt-mono ph-agg-geo">{FLAG[agg.geo]??""} {agg.geo}</div>
          </div>
        </div>
        <span className="badge badge-blue">{children.length} CSPs</span>
      </div>
      <div className={`ph-hier-drop${draggingId?" ph-hier-drop-over":""}`}
        onDragOver={onDragOver} onDrop={(e)=>onDrop(e,agg.id)}>
        {shown.length>0 ? shown : <div className="ph-hier-empty">Drop a CSP here</div>}
        {!expanded&&extra>0&&(
          <button className="ph-hier-more" onClick={()=>setExpanded(true)}>+{extra} more · View all</button>
        )}
        {expanded&&extra>0&&(
          <button className="ph-hier-more ph-hier-less" onClick={()=>setExpanded(false)}>Show less</button>
        )}
      </div>
    </div>
  );
}

/* ── Hierarchy: Direct Clients ───────────────────────────────────────────── */
// FIX 2: Added onRemove prop and × button on each chip
function DirectSection({ nodes, onDrop, onDragOver, draggingId, onDragStart, onRemove }) {
  return (
    <div className="ph-hier-direct">
      <div className="ph-hier-direct-hd">
        <div className="f-gap-10">
          <span className="ph-hier-direct-dot"/>
          <span className="txt-strong-sm">Direct Clients</span>
          <span className="badge badge-green">{nodes.length}</span>
        </div>
        <span className="stat-sublabel">Standalone direct contracts</span>
      </div>
      <div className={`ph-hier-direct-grid${draggingId?" ph-hier-drop-over":""}`}
        onDragOver={onDragOver} onDrop={(e)=>onDrop(e,"__direct__")}>
        {nodes.length>0 ? nodes.map((n)=>{
          const av=avColors(n.name);
          return (
            <div key={n.id} className={`ph-hier-chip${draggingId===n.id?" ph-hier-dragging":""}`}
              draggable onDragStart={(e)=>onDragStart(e,n.id)}>
              <span className="ph-hier-handle">⠿</span>
              <div className="partner-row-avatar partner-row-avatar--sm">
                {n.name[0]}
              </div>
              <div className="ph-node-info">
                <div className="ph-direct-chip-name">{n.name}</div>
                <div className="ph-direct-chip-geo">{FLAG[n.geo]??""} {n.geo}</div>
              </div>
              {/* FIX 2: Remove button */}
              <button
                onClick={(e)=>{e.stopPropagation();onRemove(n.id);}}
                title="Remove from direct clients"
                className="ph-direct-chip-remove"
              >×</button>
            </div>
          );
        }) : <div className="ph-hier-empty ph-hier-direct-empty">Drop clients here</div>}
      </div>
    </div>
  );
}

/* ── Hierarchy Tab ───────────────────────────────────────────────────────── */
function HierarchyTab({ nodes, onReparent }) {
  const [draggingId, setDraggingId] = useState(null);
  const [toast, setToast]           = useState(null);

  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),2800);};
  const handleDragStart=useCallback((e,id)=>{e.dataTransfer.effectAllowed="move";setDraggingId(id);},[]);
  const handleDragOver =useCallback((e)=>e.preventDefault(),[]);
  const handleDrop=useCallback((e,targetId)=>{
    e.preventDefault();
    if(!draggingId)return;
    const dragged=nodes.find((n)=>n.id===draggingId);
    if(!dragged)return;
    if(dragged.role==="aggregator"&&targetId!=="__direct__")return;
    const newParentId=targetId==="__direct__"?null:targetId;
    const newRole    =targetId==="__direct__"?"direct":"csp";
    if(dragged.parentId===newParentId)return;
    const target=nodes.find((n)=>n.id===targetId);
    showToast(`"${dragged.name}" → ${targetId==="__direct__"?"Direct Clients":target?.name}`);
    onReparent(draggingId,newParentId,newRole);
    setDraggingId(null);
  },[draggingId,nodes,onReparent]);

  // FIX 2: handler to remove a direct client (demotes back to plain CSP)
  const handleRemoveDirect = useCallback((nodeId) => {
    const node = nodes.find((n) => n.id === `node-${nodeId}`);
    if (!node) return;
    showToast(`"${node.name}" removed from Direct Clients`);
    onReparent(`node-${nodeId}`, null, "csp");
  }, [nodes, onReparent]);

  const aggregators   = nodes.filter((n)=>n.role==="aggregator");
  // Show only ACTIVE direct clients
  const directClients = nodes.filter((n)=>n.role==="direct"&&n.status==="active");

  return (
    <div className="ph-hier-root">
      {/* Legend */}
      <div className="ph-hier-legend">
        <div className="f-gap-8 ph-legend-align">
          <span/>
          <span className="stat-sublabel">Aggregator</span>
        </div>
        <div className="f-gap-8 ph-legend-align">
          <span className="badge badge-blue ph-badge-xs">CSP</span>
          <span className="stat-sublabel">Content Service Provider</span>
        </div>
        <div className="f-gap-8 ph-legend-align">
          <span/>
          <span className="stat-sublabel">Direct client — standalone</span>
        </div>
        <div className="f-gap-8 ph-legend-align">
          <span className="badge badge-green ph-badge-xs">Direct</span>
          <span className="stat-sublabel">CSP with direct contract</span>
        </div>
        <span className="stat-sublabel ph-lang-ml-auto">⠿ Drag to reassign</span>
      </div>

      <DirectSection
        nodes={directClients}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        draggingId={draggingId}
        onDragStart={handleDragStart}
        onRemove={handleRemoveDirect}
      />

      <div className="ph-hier-grid">
        {aggregators.map((agg)=>{
          const children=nodes.filter((n)=>n.parentId===agg.id);
          return(
            <AggLane key={agg.id} agg={agg} draggingId={draggingId}
              children={children.map((n)=>(
                <NodeCard key={n.id} node={n} isDragging={draggingId===n.id} onDragStart={handleDragStart}/>
              ))}
              onDrop={handleDrop} onDragOver={handleDragOver}/>
          );
        })}
      </div>

      {toast&&<div className="ph-hier-toast">{toast}</div>}
    </div>
  );
}

/* ── Manage Tab ─────────────────────────────────────────────────────────── */
const CHART_TICK = {fontSize:10,fill:"#94a3b8"};
const CHART_DOT  = {r:3,fill:BLUE,strokeWidth:0};
const CHART_TT   = {fontSize:11,borderRadius:8,border:"none",background:"#0f172a",color:"#fff"};

function ManageTab({ partners, setPartners, onAddClick, partnerAlerts, setPartnerAlerts }) {
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState("All");
  const [selected,     setSelected]     = useState(null);
  const [perPage,      setPerPage]      = useState(10);

  const filtered = partners.filter((p)=>{
    const q=search.toLowerCase();
    return (p.name.toLowerCase().includes(q)||p.contact.toLowerCase().includes(q)||p.country.toLowerCase().includes(q))
      &&(filter==="All"||p.status===filter.toLowerCase().replace(/\s+/g,""));
  });
  const visible  = filtered.slice(0,perPage);
  const total    = partners.length;
  const active   = partners.filter((p)=>p.status==="active").length;
  const needsattention  = partners.filter((p)=>p.status==="needsattention").length;
  const inactive = partners.filter((p)=>p.status==="inactive").length;

  return (
    <div>
      {/* KPI row */}
      <div className="g-stats4 mb-section">
        {[
          {label:"Total Partners", value:total,    color:BLUE },
          {label:"Active",         value:active,   color:GREEN},
          {label:"Needs Attention",value:needsattention,  color:AMBER},
          {label:"Inactive",       value:inactive, color:ROSE },
        ].map((s)=>(
          <Card key={s.label}>
            <div className="kpi-stat">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="g-split2 mb-section">
        <Card>
          <SectionTitle>Partner Growth</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={TREND_DATA} margin={{top:4,right:8,bottom:0,left:-20}}>
              <defs>
                <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={BLUE} stopOpacity={0.12}/>
                  <stop offset="95%" stopColor={BLUE} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={CHART_TICK} axisLine={false} tickLine={false}/>
              <YAxis tick={CHART_TICK} axisLine={false} tickLine={false} domain={[6,14]}/>
              <Tooltip contentStyle={CHART_TT}/>
              <Area type="monotone" dataKey="partners" name="Partners" stroke={BLUE} strokeWidth={2} fill="url(#areaG)" dot={CHART_DOT}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle>By Status</SectionTitle>
          <div className="f-col-10 manage-status-col">
            {[
              {label:"Active",         count:active,   color:GREEN,pct:Math.round(active/total*100)},
              {label:"Needs Attention",count:needsattention,  color:AMBER,pct:Math.round(needsattention/total*100)},
              {label:"Inactive",       count:inactive, color:ROSE, pct:Math.round(inactive/total*100)},
            ].map((s)=>(
              <div key={s.label}>
                <div className="f-gap-8 manage-stat-row-lbl">
                  <span/>
                  <span className="manage-stat-lbl-txt">{s.label}</span>
                  <span className="manage-stat-count">{s.count}</span>
                  <span className="manage-stat-pct">{s.pct}%</span>
                </div>
                <div className="manage-stat-bar">
                  <div/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="partner-toolbar">
          <SectionTitle className="m-0">All Partners</SectionTitle>
          <div className="f-wrap-10">
            <div className="dt-entries-bar">
              <span className="dt-entries-lbl">Show</span>
              <select className="dt-entries-sel" value={perPage} onChange={(e)=>setPerPage(+e.target.value)}>
                {[10,25,50,100].map((n)=><option key={n}>{n}</option>)}
              </select>
              <span className="dt-entries-lbl">entries</span>
            </div>
            <div className="f-gap-6">
              {["All","Active","Needs Attention","Inactive"].map((f)=>(
                <button key={f} onClick={()=>setFilter(f)}
                  className={`partner-filter-pill ${filter===f?"active":"inactive"}`}>{f}</button>
              ))}
            </div>
            <div className="p-rel">
              <span className="partner-search-icon">🔍</span>
              <input className="partner-search" placeholder="Search partners…"
                value={search} onChange={(e)=>setSearch(e.target.value)}/>
            </div>
            <button className="partner-add-btn" onClick={onAddClick}>+ Add Partner</button>
          </div>
        </div>

        <div className="page-table-scroll">
          <table className="dt">
            <thead>
              <tr className="dt-head-row">
                {["Partner","Contact","Country","Type","Revenue","Status","Last Active",""].map((h)=>(
                  <th key={h} className="dt-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((p)=>{
                const av=avColors(p.name);
                return(
                  <tr key={p.id} className="dt-tr" onClick={()=>setSelected(p)}>
                    <td className="p-sm">
                      <div className="f-gap-10">
                        <div className="partner-row-avatar">{p.name[0]}</div>
                        <div>
                          <div className="txt-strong-sm">{p.name}</div>
                          <div className="txt-mono">{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-p-body">{p.contact}</td>
                    <td className="td-p-flag">{FLAG[p.country]??""} {p.country}</td>
                    <td className="p-sm">
                      <div className="f-gap-4">
                        <span className={`badge ${p.type==="Aggregator"?"badge-amber":"badge-blue"}`}>{p.type}</span>
                        {p.isDirectClient&&p.type!=="Aggregator"&&<span className="badge badge-green">Direct</span>}
                      </div>
                    </td>
                    <td className="td-p-mono">{p.revenue}</td>
                    <td className="p-sm">
                      <span className="partner-status-badge">
                        {p.status}
                      </span>
                    </td>
                    <td className="td-p-slate">{p.lastActive}</td>
                    <td className="p-sm">
                      <div className="f-gap-6">
                        {(() => {
                          const cfg = partnerAlerts[p.id];
                          const count = cfg ? ALERT_TYPES.filter((t) => cfg[t.key]?.enabled).length : 0;
                          return count > 0 ? (
                            <span className="partner-alert-badge">{count} alert{count > 1 ? "s" : ""}</span>
                          ) : null;
                        })()}
                        <button className="partner-view-btn" onClick={(e)=>{e.stopPropagation();setSelected(p);}}>View</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0&&(
                <tr><td colSpan={8} className="dt-empty">No partners match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="partner-footer-txt">Showing {visible.length} of {total} partners</div>
      </Card>

      {selected&&(
        <PartnerModal
          partner={selected}
          onClose={()=>setSelected(null)}
          alerts={partnerAlerts[selected.id] || makeDefaultAlerts(selected.id)}
          onSaveAlerts={(updated) => setPartnerAlerts((prev) => ({ ...prev, [selected.id]: updated }))}
          onSave={(u)=>{setPartners((prev)=>prev.map((p)=>p.id===u.id?u:p));setSelected(u);}}
          onMarkInactive={(id) => {
            setPartners((prev) => prev.map((p) => p.id === id ? { ...p, status: "inactive" } : p));
            setPartnerAlerts((prev) => {
              const existing = prev[id] || makeDefaultAlerts(id);
              const disabled = { ...existing };
              ALERT_TYPES.forEach((t) => {
                disabled[t.key] = { ...disabled[t.key], enabled: false };
              });
              return { ...prev, [id]: disabled };
            });
            setSelected(null);
          }}
        />
      )}

    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function PagePartners() {
  const [activeTab,     setActiveTab]     = useState("manage");
  const [showAdd,       setShowAdd]       = useState(false);
  const [partners,      setPartners]      = useState(PARTNER_ROWS);
  const [partnerAlerts, setPartnerAlerts] = useState({});

  const nodes       = deriveNodes(partners);
  const aggregators = nodes.filter((n)=>n.role==="aggregator").length;
  const direct      = nodes.filter((n)=>n.role==="direct").length;

  return (
    <div className="partners-page-wrap">

      {/* Page header */}
      <div className="ph-page-hd">
        <div className="f-gap-14 ph-page-hd-align">
          <div className="ph-page-icon">
            <UsersIcon size={20} />
          </div>
          <div>
            <h1 className="ph-page-title">Partners</h1>
            <div className="ph-page-sub">
              <span>{partners.length} partners</span>
              <span className="ph-page-sub-sep">·</span>
              <span>{aggregators} aggregators</span>
              <span className="ph-page-sub-sep">·</span>
              <span>{direct} direct clients</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab strip */}
      <div className="ph-tab-strip">
        {[
          { key: "manage",    label: "Manage Partners", color: BLUE },
          { key: "hierarchy", label: "Hierarchy View",  color: "var(--color-violet)" },
        ].map((t) => (
          <button key={t.key}
            className={`ph-tab${activeTab === t.key ? " ph-tab-active" : ""}`}
            onClick={() => setActiveTab(t.key)}>
            <span className="ph-tab-pip" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="ph-tab-body">
        {activeTab === "manage" && (
          <ManageTab
            partners={partners}
            setPartners={setPartners}
            onAddClick={() => setShowAdd(true)}
            partnerAlerts={partnerAlerts}
            setPartnerAlerts={setPartnerAlerts}
          />
        )}
        {activeTab === "hierarchy" && (
          <HierarchyTab nodes={nodes} onReparent={(nodeId, newParentId, newRole) => {
            setPartners((prev) => prev.map((p) =>
              `node-${p.id}` === nodeId
                ? { ...p, type: newRole === "aggregator" ? "Aggregator" : "CSP",
                    isDirectClient: newRole === "direct",
                    aggregatorId: newParentId ? newParentId.replace("node-", "") : null }
                : p
            ));
          }} />
        )}
      </div>

      {showAdd && (
        <AddPartnerModal onClose={() => setShowAdd(false)}
          onAdd={(p) => { setPartners((prev) => [p, ...prev]); setShowAdd(false); }} />
      )}
    </div>
  );
}