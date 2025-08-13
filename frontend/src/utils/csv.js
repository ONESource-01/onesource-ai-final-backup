// src/utils/csv.js
export function exportToCsv(
  filename,
  headers,
  rows
) {
  const encode = (v: any) => {
    const s = typeof v === "string" || typeof v === "number" ? String(v) : "";
    const needsQuotes = /[",\n]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const chunks: string[] = [];
  chunks.push(headers.map(encode).join(","));
  for (let i = 0; i < rows.length; i++) {
    chunks.push(rows[i].map(encode).join(","));
  }
  const blob = new Blob([chunks.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}