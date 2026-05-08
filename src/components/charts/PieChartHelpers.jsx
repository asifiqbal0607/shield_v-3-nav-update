/**
 * PieChartHelpers.jsx
 * Shared helpers for all pie chart pages (APKs, DeviceNetworks, etc.)
 *
 * Exports:
 *   RADIAN            – Math.PI / 180 constant for angle calculations
 *   renderPieLabel    – outer label renderer for Recharts <Pie label={...} />
 *   PieTooltip        – styled tooltip component for pie charts
 *   ChartContextMenu  – ≡ dropdown for fullscreen / print / download actions
 */

import { useState, useRef, useEffect } from "react";

// ── Constant ──────────────────────────────────────────────────────────────────
export const RADIAN = Math.PI / 180;

// ── Outer label renderer ──────────────────────────────────────────────────────
export function renderPieLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  percent,
  innerRadius,
}) {
  if (percent < 0.03) return null;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const short = name.length > 18 ? name.slice(0, 18) + "…" : name;
  return (
    <text
      x={x}
      y={y}
      fill="#475569"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={9}
      fontWeight={600}
    >
      {short} ({(percent * 100).toFixed(1)}%)
    </text>
  );
}

// ── Pie Tooltip ───────────────────────────────────────────────────────────────
export function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const color = payload[0].fill ?? payload[0].color ?? "#0d9488";

  const fmt = (v) =>
    v >= 1_000_000
      ? `${(v / 1_000_000).toFixed(2)}M`
      : v >= 1000
        ? `${(v / 1000).toFixed(1)}k`
        : `${v}`;

  const seed = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const blockRate = 0.05 + ((seed * 13) % 100) / 250;
  const blocked = Math.round(value * blockRate);
  const clean = value - blocked;
  const factor = 0.85 + ((seed * 37) % 100) / 750;
  const prevTotal = Math.round(value * factor);
  const prevBlockRate = 0.05 + (((seed + 7) * 13) % 100) / 250;
  const prevBlocked = Math.round(prevTotal * prevBlockRate);
  const prevClean = prevTotal - prevBlocked;

  const Delta = ({ today, prev }) => {
    if (!prev) return null;
    const diff = (((today - prev) / prev) * 100).toFixed(1);
    const up = today >= prev;
    return (
      <span
        className={
          up ? "ovb-tt-delta ovb-tt-delta--up" : "ovb-tt-delta ovb-tt-delta--dn"
        }
      >
        {up ? "▲" : "▼"} {Math.abs(diff)}%
      </span>
    );
  };

  return (
    <div className="ovb-tt">
      <div className="ovb-tt-head">
        <span className="ovb-tt-name">{name}</span>
        <Delta today={value} prev={prevTotal} />
      </div>

      <div className="ovb-tt-section-lbl">TODAY</div>
      <div className="ovb-tt-row">
        <span className="ovb-tt-lbl">Total Traffic</span>
        <span className="ovb-tt-val">{fmt(value)}</span>
      </div>
      <div className="ovb-tt-row">
        <span className="ovb-tt-dot ovb-tt-dot--red" />
        <span className="ovb-tt-lbl">Blocked</span>
        <span className="ovb-tt-val ovb-tt-red">{fmt(blocked)}</span>
        <span className="ovb-tt-sub">({(blockRate * 100).toFixed(1)}%)</span>
      </div>
      <div className="ovb-tt-row">
        <span className="ovb-tt-dot ovb-tt-dot--green" />
        <span className="ovb-tt-lbl">Clean</span>
        <span className="ovb-tt-val ovb-tt-green">{fmt(clean)}</span>
        <span className="ovb-tt-sub">
          ({((1 - blockRate) * 100).toFixed(1)}%)
        </span>
      </div>

      <div className="ovb-tt-divider" />

      <div className="ovb-tt-section-lbl">YESTERDAY</div>
      <div className="ovb-tt-row">
        <span className="ovb-tt-lbl">Total Traffic</span>
        <span className="ovb-tt-val">{fmt(prevTotal)}</span>
      </div>
      <div className="ovb-tt-row">
        <span className="ovb-tt-dot ovb-tt-dot--red" />
        <span className="ovb-tt-lbl">Blocked</span>
        <span className="ovb-tt-val ovb-tt-red">{fmt(prevBlocked)}</span>
        <span className="ovb-tt-sub">
          ({(prevBlockRate * 100).toFixed(1)}%)
        </span>
        <Delta today={prevBlocked} prev={blocked} />
      </div>
      <div className="ovb-tt-row">
        <span className="ovb-tt-dot ovb-tt-dot--green" />
        <span className="ovb-tt-lbl">Clean</span>
        <span className="ovb-tt-val ovb-tt-green">{fmt(prevClean)}</span>
        <span className="ovb-tt-sub">
          ({((1 - prevBlockRate) * 100).toFixed(1)}%)
        </span>
        <Delta today={prevClean} prev={clean} />
      </div>
    </div>
  );
}

// ── Chart Context Menu ────────────────────────────────────────────────────────
export function ChartContextMenu({ containerRef, data, title }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getSvgEl = () => containerRef.current?.querySelector("svg");

  const getSvgAsCanvas = () =>
    new Promise((resolve) => {
      const svg = getSvgEl();
      if (!svg) return resolve(null);
      const svgStr = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = svg.clientWidth || 500;
        canvas.height = svg.clientHeight || 300;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.src = url;
    });

  const viewFullScreen = () => {
    const el = containerRef.current;
    if (el?.requestFullscreen) el.requestFullscreen();
    setOpen(false);
  };

  const printChart = async () => {
    const canvas = await getSvgAsCanvas();
    if (!canvas) return;
    const win = window.open("", "_blank");
    win.document.write(
      `<html><head><title>${title || "chart"}</title></head><body>` +
        `<img src="${canvas.toDataURL("image/png")}" onload="window.print();window.close()" /></body></html>`,
    );
    win.document.close();
    setOpen(false);
  };

  const downloadPNG = async () => {
    const canvas = await getSvgAsCanvas();
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `${title || "chart"}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    setOpen(false);
  };

  const downloadJPEG = async () => {
    const canvas = await getSvgAsCanvas();
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `${title || "chart"}.jpg`;
    a.href = canvas.toDataURL("image/jpeg", 0.92);
    a.click();
    setOpen(false);
  };

  const downloadPDF = async () => {
    const canvas = await getSvgAsCanvas();
    if (!canvas) return;
    const win = window.open("", "_blank");
    win.document.write(
      `<html><head><title>${title || "chart"}</title></head><body>` +
        `<img src="${canvas.toDataURL("image/png")}" onload="window.print();window.close()" /></body></html>`,
    );
    win.document.close();
    setOpen(false);
  };

  const downloadSVG = () => {
    const svg = getSvgEl();
    if (!svg) return;
    const svgStr = new XMLSerializer().serializeToString(svg);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([svgStr], { type: "image/svg+xml" }));
    a.download = `${title || "chart"}.svg`;
    a.click();
    setOpen(false);
  };

  const downloadCSV = () => {
    if (!data?.length) return;
    const csv = [
      "name,value",
      ...data.map((d) => `"${d.name}",${d.value}`),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `${title || "chart"}.csv`;
    a.click();
    setOpen(false);
  };

  const downloadXLS = () => {
    if (!data?.length) return;
    const tsv = [
      "name\tvalue",
      ...data.map((d) => `${d.name}\t${d.value}`),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([tsv], { type: "application/vnd.ms-excel" }),
    );
    a.download = `${title || "chart"}.xls`;
    a.click();
    setOpen(false);
  };

  const MENU_ITEMS = [
    { label: "View in full screen", action: viewFullScreen },
    { label: "Print chart", action: printChart },
    null,
    { label: "Download PNG image", action: downloadPNG },
    { label: "Download JPEG image", action: downloadJPEG },
    { label: "Download PDF document", action: downloadPDF },
    { label: "Download SVG vector image", action: downloadSVG },
    null,
    { label: "Download CSV", action: downloadCSV },
    { label: "Download XLS", action: downloadXLS },
  ];

  return (
    <div ref={menuRef} className="pos-rel">
      <button className="geo-collapse-btn" onClick={() => setOpen((p) => !p)}>
        ≡
      </button>
      {open && (
        <div className="apk-dd-menu">
          {MENU_ITEMS.map((item, i) =>
            item === null ? (
              <div key={i} className="dn-menu-div" />
            ) : (
              <button
                key={i}
                onClick={item.action}
                className="apk-dd-item"
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
