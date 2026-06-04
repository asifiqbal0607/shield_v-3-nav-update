function slug(value) {
  return String(value || "chart")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normaliseRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    if (row && typeof row === "object" && !Array.isArray(row)) return row;
    return { value: row };
  });
}

export function downloadChartCsv(title, rows) {
  const data = normaliseRows(rows);
  if (!data.length) return;
  const headers = Array.from(
    data.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set()),
  );
  const escape = (value) => {
    if (value == null) return "";
    const str = Array.isArray(value) ? value.join("; ") : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const csv = [
    headers.map(escape).join(","),
    ...data.map((row) => headers.map((key) => escape(row[key])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug(title)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function toFlatChartRows(rows, fields) {
  const data = normaliseRows(rows);
  if (!fields?.length) return data;
  return data.map((row) =>
    fields.reduce((acc, field) => {
      const key = typeof field === "string" ? field : field.key;
      const label = typeof field === "string" ? field : field.label;
      acc[label] = row[key];
      return acc;
    }, {}),
  );
}
