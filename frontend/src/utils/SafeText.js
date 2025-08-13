import React from 'react';

/** Strict HTML escape */
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Very small markdown-ish helpers: `code`, bullets, links, line breaks */
function tokenizeLines(text) {
  const out = [];
  const lines = (text || '').split(/\r?\n/);

  let listOpen = false;
  const pushCloseList = () => {
    if (listOpen) {
      out.push(<ul key={`ul-close-${out.length}`} className="list-disc pl-6 my-2" />);
      listOpen = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? '';
    const line = raw.trim();

    // unordered list: lines starting with "- "
    if (/^- /.test(line)) {
      if (!listOpen) {
        out.push(<ul key={`ul-${i}`} className="list-disc pl-6 my-2" />);
        listOpen = true;
      }
      const itemText = line.replace(/^- /, '');
      out.push(
        <li key={`li-${i}`}>{inlineFormat(itemText)}</li>
      );
      continue;
    }

    // blank line = paragraph break
    if (line === '') {
      pushCloseList();
      out.push(<br key={`br-${i}`} />);
      continue;
    }

    // normal paragraph line
    pushCloseList();
    out.push(<p key={`p-${i}`} className="mb-2">{inlineFormat(raw)}</p>);
  }
  pushCloseList();
  return out;
}

/** inline: backticks → <code>, **bold** → <strong>, _em_ → <em>, urls → <a> */
function inlineFormat(text) {
  const safe = escapeHtml(text);

  // url autolink (http/https only)
  const urlPattern = /\bhttps?:\/\/[^\s<]+/g;

  // split by backticks for inline code
  const parts = safe.split(/`([^`]+)`/g); // odd indexes are code
  const nodes = [];

  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i];
    if (i % 2 === 1) {
      nodes.push(<code key={`code-${i}`} className="px-1 py-0.5 rounded bg-gray-100 text-sm">{chunk}</code>);
    } else {
      // bold **text** and italic _text_
      let html = chunk
        .replace(/\*\*([^*]+)\*\*/g, (_, m) => `<strong>${m}</strong>`)
        .replace(/_([^_]+)_/g, (_, m) => `<em>${m}</em>`);

      // convert urls to anchors safely (still escaped)
      const pieces = [];
      let lastIndex = 0;
      let m;
      urlPattern.lastIndex = 0; // reset regex
      while ((m = urlPattern.exec(html)) !== null) {
        const [url] = m;
        const start = m.index;
        if (start > lastIndex) {
          const htmlSlice = html.slice(lastIndex, start);
          if (htmlSlice) {
            pieces.push(<span key={`t-${i}-${start}`} dangerouslySetInnerHTML={{ __html: htmlSlice }} />);
          }
        }
        pieces.push(
          <a key={`a-${i}-${start}`} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-words hover:text-blue-800">
            {url.replace(/^https?:\/\//, '')}
          </a>
        );
        lastIndex = start + url.length;
      }
      if (lastIndex < html.length) {
        const htmlSlice = html.slice(lastIndex);
        if (htmlSlice) {
          pieces.push(<span key={`t-end-${i}`} dangerouslySetInnerHTML={{ __html: htmlSlice }} />);
        }
      }
      
      if (pieces.length === 0) {
        // No URLs found, just render the HTML directly
        nodes.push(<span key={`span-${i}`} dangerouslySetInnerHTML={{ __html: html }} />);
      } else {
        nodes.push(<React.Fragment key={`frag-${i}`}>{pieces}</React.Fragment>);
      }
    }
  }
  return <>{nodes}</>;
}

export function SafeText({ text }) {
  if (!text) return null;
  return <div className="prose max-w-none text-gray-800 leading-relaxed">{tokenizeLines(text)}</div>;
}