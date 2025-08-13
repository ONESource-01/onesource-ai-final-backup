// src/components/V2Renderer.js - The One True V2 Schema Renderer
import React from 'react';
import TechnicalAnswerCard from './TechnicalAnswerCard';
import MentoringCard from './MentoringCard';
import NextStepsList from './NextStepsList';
import Markdown from './Markdown';
import TablePro from './TablePro';

export default function V2Renderer({ response }) {
  // V2 Schema Validation
  if (!response || typeof response !== 'object') {
    return (
      <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
        <h3 className="text-red-800 font-semibold">Schema Error - V2 Required</h3>
        <p className="text-red-600 text-sm">Invalid response format. Expected V2 schema.</p>
      </div>
    );
  }

  const { title, summary, blocks, meta } = response;
  
  // Parse content sections from blocks
  const sections = parseV2Sections(blocks);
  
  return (
    <article className="space-y-6" data-schema-version={meta?.schema}>
      {/* Title & Summary */}
      {title && (
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {summary && (
            <p className="text-sm text-gray-600">{summary}</p>
          )}
        </header>
      )}

      {/* V2 Schema Sections */}
      <div className="space-y-6">
        {sections.technical && (
          <TechnicalAnswerCard 
            title="Technical Answer"
            content={sections.technical}
          />
        )}
        
        {sections.mentoring && (
          <MentoringCard 
            title="Mentoring Insight"
            content={sections.mentoring}
          />
        )}
        
        {sections.nextSteps && (
          <NextStepsList 
            title="Next Steps"
            content={sections.nextSteps}
            steps={sections.nextStepsArray}
          />
        )}
        
        {/* Additional blocks */}
        {sections.additional.map((block, index) => (
          <div key={index} className="prose max-w-none">
            {renderBlock(block)}
          </div>
        ))}
      </div>
      
      {/* Schema version for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mt-4">
          Schema: {meta?.schema} | Tokens: {meta?.tokens_used}
        </div>
      )}
    </article>
  );
}

// Parse V2 schema blocks into sections
function parseV2Sections(blocks) {
  if (!blocks || !Array.isArray(blocks)) {
    return { additional: [] };
  }
  
  const sections = {
    technical: null,
    mentoring: null, 
    nextSteps: null,
    nextStepsArray: [],
    additional: []
  };
  
  blocks.forEach(block => {
    if (!block.content) return;
    
    const content = block.content;
    
    // Technical Answer section
    if (content.includes('🔧') && content.includes('Technical Answer')) {
      sections.technical = extractSection(content, 'Technical Answer');
    }
    // Mentoring section  
    else if (content.includes('🧐') && content.includes('Mentoring Insight')) {
      sections.mentoring = extractSection(content, 'Mentoring Insight');
    }
    // Next Steps section
    else if (content.includes('📋') && content.includes('Next Steps')) {
      sections.nextSteps = extractSection(content, 'Next Steps');
      sections.nextStepsArray = extractNextStepsArray(content);
    }
    // Other content
    else {
      sections.additional.push(block);
    }
  });
  
  return sections;
}

// Extract section content after header
function extractSection(content, sectionName) {
  const regex = new RegExp(`##\\s*�[^\\*]+\\*\\*${sectionName}\\*\\*([\\s\\S]*?)(?=##|$)`, 'i');
  const match = content.match(regex);
  if (match) {
    return match[1].trim();
  }
  
  // Fallback: look for any content after section name
  const fallbackRegex = new RegExp(`${sectionName}\\*\\*([\\s\\S]*?)(?=##|\\*\\*[A-Z]|$)`, 'i');
  const fallbackMatch = content.match(fallbackRegex);
  if (fallbackMatch) {
    return fallbackMatch[1].trim();
  }
  
  return content;
}

// Extract numbered steps from Next Steps
function extractNextStepsArray(content) {
  const steps = [];
  const stepRegex = /\d+\.\s+([^\n]+(?:\n(?!\d+\.)[^\n]*)*)/g;
  let match;
  
  while ((match = stepRegex.exec(content)) !== null) {
    steps.push(match[1].trim());
  }
  
  return steps;
}

// Render individual blocks
function renderBlock(block) {
  switch (block.type) {
    case 'markdown':
    case 'list':
      return <Markdown source={block.content} />;
    case 'code':
      return (
        <pre className="rounded-lg p-4 bg-gray-100 overflow-x-auto">
          <code>{block.content}</code>
        </pre>
      );
    case 'table':
      return <TablePro {...block} />;
    case 'callout':
      return (
        <div className="rounded-lg border p-4 bg-blue-50 text-blue-900">
          <Markdown source={block.content} />
        </div>
      );
    default:
      return <div>{block.content}</div>;
  }
}