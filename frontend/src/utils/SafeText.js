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

/** Safe inline formatting without dangerouslySetInnerHTML */
function formatInlineText(text) {
  if (!text) return text;
  
  // First escape HTML
  let escaped = escapeHtml(text);
  
  // Split by various patterns and create React elements
  const parts = [];
  let remaining = escaped;
  let keyCounter = 0;
  
  // Process **bold** text
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;
  
  while ((match = boldRegex.exec(escaped)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      const beforeText = escaped.slice(lastIndex, match.index);
      if (beforeText) {
        parts.push(<span key={`text-${keyCounter++}`}>{beforeText}</span>);
      }
    }
    
    // Add bold text
    parts.push(<strong key={`bold-${keyCounter++}`} className="font-semibold">{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < escaped.length) {
    const remainingText = escaped.slice(lastIndex);
    if (remainingText) {
      parts.push(<span key={`text-${keyCounter++}`}>{remainingText}</span>);
    }
  }
  
  // If no bold formatting found, just return escaped text
  if (parts.length === 0) {
    return escaped;
  }
  
  return <>{parts}</>;
}

/** Process line-by-line content safely */
function processLines(text) {
  if (!text) return [];
  
  const lines = text.split(/\r?\n/);
  const elements = [];
  let inList = false;
  let listItems = [];
  
  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-6 my-2 space-y-1">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Empty line
    if (!trimmed) {
      flushList();
      elements.push(<div key={`empty-${index}`} className="h-2" />);
      return;
    }
    
    // List item
    if (trimmed.startsWith('- ')) {
      if (!inList) {
        inList = true;
      }
      const content = trimmed.slice(2).trim();
      listItems.push(
        <li key={`li-${index}`} className="text-gray-800">
          {formatInlineText(content)}
        </li>
      );
      return;
    }
    
    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${index}`} className="mb-2 text-gray-800 leading-relaxed">
        {formatInlineText(trimmed)}
      </p>
    );
  });
  
  // Flush any remaining list
  flushList();
  
  return elements;
}

export function SafeText({ text }) {
  if (!text || typeof text !== 'string') return null;
  
  const elements = processLines(text);
  
  return (
    <div className="prose max-w-none text-gray-800 leading-relaxed">
      {elements}
    </div>
  );
}