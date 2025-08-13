// src/components/TablePro.tsx
import React from "react";
import { exportToCsv } from "../utils/csv";

export type TableProProps = {
  caption?: string;
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
  dense?: boolean;
  // Feature flags
  zebra?: boolean;
  stickyHeader?: boolean;
  allowCopy?: boolean;
  allowCsv?: boolean;
};

export default function TablePro({
  caption,
  headers,
  rows,
  dense,
  zebra = true,
  stickyHeader = true,
  allowCopy = true,
  allowCsv = true,
}: TableProProps) {
  const id = React.useId();

  const handleCopy = async () => {
    const plain = [headers, ...rows].map(r => r.map(c => (typeof c === "string" || typeof c === "number" ? String(c) : "")).join("\t")).join("\n");
    await navigator.clipboard.writeText(plain);
    window.dispatchEvent(new CustomEvent("table_copy", { detail: { id } }));
  };

  const handleCsv = async () => {
    exportToCsv(`table-${id}.csv`, headers, rows);
    window.dispatchEvent(new CustomEvent("table_export_csv", { detail: { id } }));
  };

  return (
    <section aria-labelledby={`tbl-${id}-caption`} className="not-prose">
      {/* Controls */}
      {(allowCopy || allowCsv) && (
        <div className="flex items-center justify-end gap-2 mb-2">
          {allowCopy && (
            <button
              type="button"
              className="px-2 py-1 text-xs rounded border hover:bg-accent/40 focus:ring-2 focus:ring-ring"
              onClick={handleCopy}
            >
              Copy
            </button>
          )}
          {allowCsv && (
            <button
              type="button"
              className="px-2 py-1 text-xs rounded border hover:bg-accent/40 focus:ring-2 focus:ring-ring"
              onClick={handleCsv}
            >
              Export CSV
            </button>
          )}
        </div>
      )}

      <div className="relative -mx-2 md:mx-0">
        {/* Scroll affordance */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent rounded-r-2xl" />
        <div className="overflow-x-auto rounded-2xl ring-1 ring-[color:var(--border-subtle)] shadow-sm">
          <table
            aria-describedby={caption ? `tbl-${id}-caption` : undefined}
            className={[
              "min-w-full border-collapse table-fixed",
              dense ? "text-sm" : "text-base",
            ].join(" ")}
          >
            {caption && (
              <caption id={`tbl-${id}-caption`} className="sr-only">
                {caption}
              </caption>
            )}

            <thead
              className={stickyHeader ? "sticky top-0 z-10" : ""}
              style={{ background: "var(--bg-elevated)", color: "var(--text-strong)" }}
            >
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-3 text-left font-medium border-b"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="px-4 py-6 text-center text-muted-foreground">
                    No data available
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr
                    key={idx}
                    className="group"
                    style={{
                      background: zebra && idx % 2 ? "var(--bg-surface)" : undefined,
                    }}
                  >
                    {r.map((c, j) => (
                      <td
                        key={j}
                        className="px-4 py-3 align-top border-b group-hover:bg-[color:var(--accent-50)]"
                        style={{ borderColor: "var(--border-subtle)" }}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card-table (<md) */}
      <div className="md:hidden mt-3 space-y-2">
        {rows.map((r, idx) => (
          <div key={idx} className="rounded-2xl border p-3 bg-card">
            {headers.map((h, j) => (
              <div key={j} className="flex justify-between gap-4 py-1">
                <div className="text-xs text-muted-foreground">{h}</div>
                <div className="text-sm max-w-[60%] text-right">{r[j] as any}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}