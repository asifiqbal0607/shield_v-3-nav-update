const fs = await import("node:fs/promises");
const path = await import("node:path");
const { createRequire } = await import("node:module");
const { pathToFileURL } = await import("node:url");
const require = createRequire(import.meta.url);
const artifactToolPath = require.resolve("@oai/artifact-tool", {
  paths: ["C:\\Users\\Asif\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules"],
});
const { Presentation, PresentationFile } = await import(pathToFileURL(artifactToolPath).href);

const W = 1280;
const H = 720;
const OUT_DIR = "E:\\projects\\shield_v-3-updated\\outputs\\mcp-shield-demo";
const SCRATCH_DIR = "E:\\projects\\shield_v-3-updated\\tmp\\slides\\mcp-shield-demo";
const PREVIEW_DIR = path.join(SCRATCH_DIR, "preview");
const INSPECT_PATH = path.join(SCRATCH_DIR, "inspect-demo.ndjson");

const C = {
  ink: "#0F172A",
  graphite: "#334155",
  muted: "#64748B",
  paper: "#F8FAFC",
  white: "#FFFFFF",
  line: "#D7E0EA",
  teal: "#0D9488",
  tealDark: "#115E59",
  blue: "#2563EB",
  indigo: "#4F46E5",
  amber: "#F59E0B",
  red: "#DC2626",
  green: "#16A34A",
  slate: "#102033",
};

const FONT = {
  title: "Poppins",
  body: "Lato",
  mono: "Aptos Mono",
};

const slides = [
  {
    kicker: "MCP SHIELD DEMO",
    title: "Role-aware security dashboard",
    subtitle:
      "A guided demo for service onboarding, scoped analytics, and report ownership across Admin, Client, and C-Admin accounts.",
    callout: "Show scope, not just screens",
    notes:
      "Open by positioning MCP Shield as a security analytics and service management dashboard. The demo focus is role-based access, especially the C-Admin workflow.",
  },
  {
    kicker: "PRODUCT OVERVIEW",
    title: "What the project demonstrates",
    subtitle:
      "MCP Shield combines analytics, service operations, user control, and reporting into one role-aware portal.",
    cards: [
      ["Analytics", "Dashboards summarize traffic, blocks, device networks, geography, APK health, and service-level signals."],
      ["Service Ops", "Clients onboard services. Admins manage all services. C-Admins onboard only for assigned client accounts."],
      ["Access Control", "Every major workflow changes by role: Admin, Client/Partner, or delegated C-Admin."],
    ],
    notes: "Use this slide to explain the product before you begin switching between demo accounts.",
  },
  {
    kicker: "ROLE MODEL",
    title: "Three account experiences",
    subtitle:
      "The core demo story is the permission boundary: global Admin, self-service Client, and delegated C-Admin.",
    metrics: [
      ["Admin", "Global visibility", "Can view users, services, clients, C-Admins, and all reports."],
      ["Client", "Own account only", "Can onboard services and generate reports only under itself."],
      ["C-Admin", "Delegated scope", "Can operate for assigned clients plus its own C-Admin account."],
    ],
    notes: "Mention the three demo logins: admin@shield.com/admin, partner@shield.com/partner, cadmin@shield.com/cadmin.",
  },
  {
    kicker: "C-ADMIN SCOPE",
    title: "C-Admin is delegated, not global",
    subtitle:
      "Liam Patel can operate only inside assigned client accounts and assigned service access.",
    cards: [
      ["Assigned clients", "True Digital, GVI, and Teleinfotech are assigned to the demo C-Admin account."],
      ["Assigned services", "Each assigned client has its own allowed service list. Access is not shared across all clients."],
      ["Blocked boundary", "Unassigned clients, global user management, and admin-only areas stay outside the C-Admin scope."],
    ],
    notes: "Show Manage Services as C-Admin and point out the assigned client selector and scoped service list.",
  },
  {
    kicker: "SERVICE ONBOARDING",
    title: "Same form, scoped owner",
    subtitle:
      "C-Admin uses the normal client service onboarding flow, with one extra professional step: choose the assigned client owner.",
    flow: [
      ["Admin setup", "Assign clients and service access to C-Admin"],
      ["C-Admin selects client", "Only assigned clients appear"],
      ["Onboarding form", "Same form as client onboarding"],
      ["Service owner", "New service belongs to selected client"],
    ],
    notes: "Use + Onboard Service from Manage Services. Show that the form starts with an assigned client selector.",
  },
  {
    kicker: "REPORTING",
    title: "Reports follow account ownership",
    subtitle:
      "Reports are owned by an account. Each role sees and generates reports only within its allowed owner set.",
    metrics: [
      ["Admin", "All owners", "Can view and generate reports for Clients and C-Admins."],
      ["Client", "Self only", "Can view and generate reports only under its own account."],
      ["C-Admin", "Own + assigned", "Can generate reports for Liam Patel and assigned clients only."],
    ],
    notes: "Show Account and Account Type columns in Reporting for Admin and C-Admin.",
  },
  {
    kicker: "LIVE DEMO FLOW",
    title: "Recommended demo path",
    subtitle:
      "Move from global control to delegated control to client self-service so the differences are obvious.",
    cards: [
      ["1. Admin", "Login as Admin. Show Users, edit Liam Patel, assigned clients/services, and all-account reporting."],
      ["2. C-Admin", "Login as C-Admin. Show scoped dashboard, assigned services, service onboarding, and scoped reporting."],
      ["3. Client", "Login as Client. Show own-service onboarding and own-account reports only."],
    ],
    notes: "Keep this slide visible before the live browser portion. It is your run-of-show.",
  },
  {
    kicker: "QA CHECKLIST",
    title: "What to validate during the demo",
    subtitle:
      "The strongest proof is not that a page opens; it is that unassigned data never appears.",
    cards: [
      ["Admin", "Can assign C-Admin client/service access and generate reports for Clients or C-Admins."],
      ["C-Admin", "Can onboard services and generate reports only for its own account and assigned clients."],
      ["Client", "Can onboard and report only under its own account. No cross-account visibility."],
    ],
    notes: "Use this as acceptance criteria for the completed role-scope update.",
  },
  {
    kicker: "NEXT STEPS",
    title: "Production readiness path",
    subtitle:
      "The prototype demonstrates the product behavior. Production should enforce the same rules in backend authorization.",
    metrics: [
      ["API", "Server-side scope checks", "Validate role, ownerId, assignedClientIds, and service access on every request."],
      ["Data", "Persist ownership", "Reports and services need durable account owner metadata."],
      ["Audit", "Trace delegated actions", "Record who onboarded services and who generated each report."],
    ],
    notes: "Close by making clear that the frontend proves the workflow, while production needs backend enforcement.",
  },
];

const inspect = [];

function line(fill = C.line, width = 1) {
  return { style: "solid", fill, width };
}

function addShape(slide, geometry, x, y, w, h, fill, stroke = C.line, strokeWidth = 1, role = "shape", slideNo = 0) {
  const shape = slide.shapes.add({
    geometry,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: line(stroke, strokeWidth),
  });
  inspect.push({ kind: "shape", slide: slideNo, role, bbox: [x, y, w, h] });
  return shape;
}

function addText(slide, slideNo, text, x, y, w, h, opts = {}) {
  const box = addShape(slide, "rect", x, y, w, h, opts.fill || "#00000000", opts.stroke || "#00000000", opts.strokeWidth || 0, opts.role || "text", slideNo);
  box.text = text;
  box.text.fontSize = opts.size || 22;
  box.text.color = opts.color || C.ink;
  box.text.bold = Boolean(opts.bold);
  box.text.typeface = opts.face || FONT.body;
  box.text.alignment = opts.align || "left";
  box.text.verticalAlignment = opts.valign || "top";
  box.text.insets = opts.insets || { left: 0, right: 0, top: 0, bottom: 0 };
  if (opts.autoFit) box.text.autoFit = opts.autoFit;
  inspect.push({ kind: "textbox", slide: slideNo, role: opts.role || "text", text, bbox: [x, y, w, h] });
  return box;
}

function addFooter(slide, slideNo) {
  addShape(slide, "rect", 64, 654, 1152, 1.5, C.line, "#00000000", 0, "footer rule", slideNo);
  addText(slide, slideNo, "MCP Shield demo", 64, 668, 260, 24, {
    size: 12,
    color: C.muted,
    face: FONT.mono,
    role: "footer",
  });
  addText(slide, slideNo, `${String(slideNo).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`, 1112, 668, 104, 24, {
    size: 12,
    color: C.muted,
    face: FONT.mono,
    align: "right",
    role: "footer",
  });
}

function addHeader(slide, slideNo, data) {
  addText(slide, slideNo, data.kicker, 64, 34, 430, 24, {
    size: 12,
    color: C.tealDark,
    bold: true,
    face: FONT.mono,
    role: "kicker",
  });
  addShape(slide, "ellipse", 1152, 30, 26, 26, C.teal, C.tealDark, 1, "status mark", slideNo);
  addShape(slide, "ellipse", 1188, 30, 26, 26, C.indigo, C.indigo, 1, "status mark", slideNo);
}

function addTitle(slide, slideNo, data) {
  addText(slide, slideNo, data.title, 64, 86, 760, 92, {
    size: 40,
    color: C.ink,
    bold: true,
    face: FONT.title,
    role: "title",
    autoFit: "shrinkText",
  });
  addText(slide, slideNo, data.subtitle, 66, 184, 760, 68, {
    size: 18,
    color: C.graphite,
    face: FONT.body,
    role: "subtitle",
    autoFit: "shrinkText",
  });
}

function addCard(slide, slideNo, x, y, w, h, label, body, accent = C.teal) {
  addShape(slide, "roundRect", x, y, w, h, C.white, C.line, 1.2, `card ${label}`, slideNo);
  addShape(slide, "rect", x, y, 8, h, accent, "#00000000", 0, `card accent ${label}`, slideNo);
  addShape(slide, "ellipse", x + 24, y + 24, 48, 48, `${accent}22`, accent, 1.2, `card icon ${label}`, slideNo);
  addShape(slide, "rect", x + 40, y + 47, 20, 4, accent, "#00000000", 0, `card icon ${label}`, slideNo);
  addShape(slide, "rect", x + 48, y + 39, 4, 20, accent, "#00000000", 0, `card icon ${label}`, slideNo);
  addText(slide, slideNo, label, x + 92, y + 24, w - 116, 28, {
    size: 16,
    color: C.tealDark,
    bold: true,
    face: FONT.mono,
    role: "card label",
  });
  addText(slide, slideNo, body, x + 28, y + 92, w - 56, h - 112, {
    size: 17,
    color: C.ink,
    face: FONT.body,
    role: "card body",
    autoFit: "shrinkText",
  });
}

function addMetric(slide, slideNo, x, y, w, h, top, middle, bottom, accent = C.teal) {
  addShape(slide, "roundRect", x, y, w, h, C.white, C.line, 1.2, `metric ${top}`, slideNo);
  addShape(slide, "rect", x, y, w, 8, accent, "#00000000", 0, `metric accent ${top}`, slideNo);
  addText(slide, slideNo, top, x + 24, y + 26, w - 48, 46, {
    size: 30,
    color: C.ink,
    bold: true,
    face: FONT.title,
    role: "metric heading",
    autoFit: "shrinkText",
  });
  addText(slide, slideNo, middle, x + 24, y + 84, w - 48, 32, {
    size: 17,
    color: C.tealDark,
    bold: true,
    face: FONT.body,
    role: "metric label",
  });
  addText(slide, slideNo, bottom, x + 24, y + 126, w - 48, h - 146, {
    size: 15,
    color: C.graphite,
    face: FONT.body,
    role: "metric note",
    autoFit: "shrinkText",
  });
}

function addRoleStrip(slide, slideNo) {
  const roles = [
    ["Admin", C.indigo],
    ["Client", C.blue],
    ["C-Admin", C.teal],
  ];
  roles.forEach(([label, color], i) => {
    const x = 860 + i * 120;
    addShape(slide, "roundRect", x, 104, 94, 36, `${color}18`, color, 1, `role pill ${label}`, slideNo);
    addText(slide, slideNo, label, x + 10, 112, 74, 18, {
      size: 12,
      color,
      bold: true,
      face: FONT.mono,
      align: "center",
      role: "role pill",
    });
  });
}

function addCardsSlide(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  slide.background.fill = C.paper;
  addHeader(slide, slideNo, data);
  addTitle(slide, slideNo, data);
  addRoleStrip(slide, slideNo);
  const accents = [C.teal, C.indigo, C.amber];
  data.cards.forEach(([label, body], i) => {
    addCard(slide, slideNo, 74 + i * 382, 366, 350, 210, label, body, accents[i % accents.length]);
  });
  addFooter(slide, slideNo);
  slide.speakerNotes.setText(data.notes);
}

function addMetricsSlide(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  slide.background.fill = C.paper;
  addHeader(slide, slideNo, data);
  addTitle(slide, slideNo, data);
  const accents = [C.indigo, C.blue, C.teal];
  data.metrics.forEach(([top, middle, bottom], i) => {
    addMetric(slide, slideNo, 74 + i * 382, 350, 350, 226, top, middle, bottom, accents[i % accents.length]);
  });
  addFooter(slide, slideNo);
  slide.speakerNotes.setText(data.notes);
}

function addFlowSlide(presentation, data, slideNo) {
  const slide = presentation.slides.add();
  slide.background.fill = C.paper;
  addHeader(slide, slideNo, data);
  addTitle(slide, slideNo, data);
  data.flow.forEach(([label, body], i) => {
    const x = 78 + i * 292;
    addShape(slide, "roundRect", x, 344, 248, 180, C.white, C.line, 1.2, `flow card ${label}`, slideNo);
    addShape(slide, "ellipse", x + 24, 372, 42, 42, `${C.teal}22`, C.teal, 1.2, "flow number", slideNo);
    addText(slide, slideNo, String(i + 1), x + 36, 381, 18, 22, {
      size: 18,
      color: C.tealDark,
      bold: true,
      face: FONT.title,
      align: "center",
      role: "flow number",
    });
    addText(slide, slideNo, label, x + 24, 434, 200, 28, {
      size: 17,
      color: C.ink,
      bold: true,
      face: FONT.body,
      role: "flow label",
    });
    addText(slide, slideNo, body, x + 24, 472, 198, 42, {
      size: 14,
      color: C.graphite,
      face: FONT.body,
      role: "flow body",
      autoFit: "shrinkText",
    });
    if (i < data.flow.length - 1) {
      addShape(slide, "rightArrow", x + 252, 416, 34, 28, C.teal, "#00000000", 0, "flow arrow", slideNo);
    }
  });
  addFooter(slide, slideNo);
  slide.speakerNotes.setText(data.notes);
}

function addCover(presentation) {
  const slideNo = 1;
  const data = slides[0];
  const slide = presentation.slides.add();
  slide.background.fill = C.slate;
  addShape(slide, "rect", 0, 0, W, H, C.slate, "#00000000", 0, "background", slideNo);
  addShape(slide, "ellipse", 850, -130, 520, 520, "#0D948833", "#00000000", 0, "orb", slideNo);
  addShape(slide, "ellipse", 980, 420, 420, 420, "#4F46E533", "#00000000", 0, "orb", slideNo);
  addShape(slide, "rect", 76, 92, 8, 450, C.teal, "#00000000", 0, "accent", slideNo);
  addText(slide, slideNo, data.kicker, 106, 94, 420, 24, {
    size: 13,
    color: "#8BE4DA",
    bold: true,
    face: FONT.mono,
    role: "kicker",
  });
  addText(slide, slideNo, data.title, 100, 142, 760, 120, {
    size: 50,
    color: C.white,
    bold: true,
    face: FONT.title,
    role: "title",
    autoFit: "shrinkText",
  });
  addText(slide, slideNo, data.subtitle, 104, 288, 650, 92, {
    size: 20,
    color: "#D9E5F2",
    face: FONT.body,
    role: "subtitle",
    autoFit: "shrinkText",
  });
  addShape(slide, "roundRect", 104, 456, 440, 92, "#FFFFFF14", "#8BE4DA", 1.2, "callout panel", slideNo);
  addText(slide, slideNo, data.callout, 134, 482, 380, 34, {
    size: 24,
    color: C.white,
    bold: true,
    face: FONT.title,
    role: "callout",
  });
  addText(slide, slideNo, "Demo deck | Admin, Client, C-Admin", 104, 668, 520, 24, {
    size: 13,
    color: "#B8C7D9",
    face: FONT.mono,
    role: "footer",
  });
  slide.speakerNotes.setText(data.notes);
}

async function createDeck() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  const presentation = Presentation.create({ slideSize: { width: W, height: H } });
  addCover(presentation);
  for (let i = 1; i < slides.length; i += 1) {
    const slideNo = i + 1;
    const data = slides[i];
    if (data.flow) addFlowSlide(presentation, data, slideNo);
    else if (data.metrics) addMetricsSlide(presentation, data, slideNo);
    else addCardsSlide(presentation, data, slideNo);
  }
  return presentation;
}

async function saveBlobToFile(blob, filePath) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  await fs.writeFile(filePath, bytes);
}

async function exportDeck() {
  const presentation = await createDeck();
  await fs.writeFile(INSPECT_PATH, inspect.map((record) => JSON.stringify(record)).join("\n") + "\n", "utf8");
  for (let i = 0; i < presentation.slides.items.length; i += 1) {
    const preview = await presentation.export({ slide: presentation.slides.items[i], format: "png", scale: 1 });
    await saveBlobToFile(preview, path.join(PREVIEW_DIR, `slide-${String(i + 1).padStart(2, "0")}.png`));
  }
  const pptx = await PresentationFile.exportPptx(presentation);
  const pptxPath = path.join(OUT_DIR, "mcp-shield-demo.pptx");
  await pptx.save(pptxPath);
  console.log(pptxPath);
}

await exportDeck();
