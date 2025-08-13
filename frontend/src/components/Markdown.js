// src/components/Markdown.js
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import TablePro from "./TablePro";

export default function Markdown({ source }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // Intercept <table> and render via TablePro
        table({ children }) {
          // Simple extraction for common markdown tables.
          // For complex tables, consider a rehype plugin that yields arrays directly.
          const headerRow = children?.props?.children?.[0];
          const body = children?.props?.children?.slice?.(1) ?? [];

          const headers =
            headerRow?.props?.children?.map((th) => th?.props?.children?.[0]?.props?.value ?? "") ?? [];

          const rows = body.map((tr) =>
            tr?.props?.children?.map((td) => td?.props?.children?.[0]?.props?.value ?? "")
          );

          return <TablePro headers={headers} rows={rows} caption="Markdown table" />;
        },
      }}
      className="prose prose-sm md:prose-base dark:prose-invert max-w-none"
    >
      {source}
    </ReactMarkdown>
  );
}