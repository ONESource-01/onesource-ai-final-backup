// src/components/ResponseRenderer.js
import React from "react";
// If you use shadcn/ui, uncomment these:
// import { Card, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import Markdown from "./Markdown";
import TablePro from "./TablePro";

export default function ResponseRenderer({ response }) {
  const { title, summary, blocks, meta } = response;

  return (
    <article className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold leading-tight flex items-center gap-2">
          <span aria-hidden>{meta?.emoji ?? "💬"}</span>
          <span className="break-words">{title}</span>
        </h2>
        {summary ? (
          <p className="text-sm text-muted-foreground mt-1">{summary}</p>
        ) : null}
      </header>

      {/* Body blocks */}
      <div className="space-y-4">
        {blocks?.map((b, i) => {
          switch (b.type) {
            case "markdown":
            case "list":
              return <Markdown key={i} source={b.content} />;
            case "code":
              return (
                <pre key={i} className="rounded-2xl p-4 bg-muted/40 overflow-x-auto">
                  <code>{b.content}</code>
                </pre>
              );
            case "table":
              return <TablePro key={i} {...b} />;
            case "callout":
              return (
                <div key={i} className="rounded-2xl border p-4 bg-accent/40 text-foreground">
                  <Markdown source={b.content} />
                </div>
              );
            case "image":
              return (
                <figure key={i} className="rounded-2xl overflow-hidden border">
                  <img src={b.src} alt={b.alt} className="w-full h-auto" />
                  {b.caption && (
                    <figcaption className="p-2 text-xs text-muted-foreground">{b.caption}</figcaption>
                  )}
                </figure>
              );
            default:
              return null;
          }
        })}
      </div>

      {/* Optional Phase 3 follow-on actions */}
      {meta?.suggested_actions && meta.suggested_actions.length > 0 && (
        <footer className="pt-2">
          <div className="text-sm text-muted-foreground mb-2">Would you like to…</div>
          <div className="flex flex-wrap gap-2">
            {meta.suggested_actions.map((a, idx) => (
              <button
                key={idx}
                type="button"
                className="px-3 py-1.5 rounded-full border text-sm hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={() => window.dispatchEvent(new CustomEvent("suggested_action_clicked", { detail: a }))}
              >
                {a.label}
              </button>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}