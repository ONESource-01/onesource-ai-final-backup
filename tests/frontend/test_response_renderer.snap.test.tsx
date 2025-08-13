/**
 * Frontend Response Renderer Smoke Tests
 * Basic snapshot testing for v2 response rendering consistency
 * (Will be expanded in Phase 4)
 */

import React from 'react';
import { render } from '@testing-library/react';

// Mock ResponseRenderer component (will be created in Phase 4)
const ResponseRenderer: React.FC<{ response: any }> = ({ response }) => {
  return (
    <article data-testid="response-renderer">
      <h2>{response.title}</h2>
      <p className="text-muted">{response.summary}</p>
      {response.blocks.map((block: any, index: number) => (
        <section key={index} data-type={block.type}>
          {block.content}
        </section>
      ))}
      <div data-testid="meta" data-schema={response.meta.schema} data-emoji={response.meta.emoji}>
        Schema: {response.meta.schema}
      </div>
    </article>
  );
};

describe('ResponseRenderer', () => {
  const mockV2Response = {
    title: "## 🛠 **Technical Answer**",
    summary: "Information about construction requirements and standards",
    blocks: [
      { type: "markdown", content: "This is the main technical content about construction." },
      { type: "list", content: "• Point 1\n• Point 2\n• Point 3" }
    ],
    meta: {
      emoji: "🧐",
      schema: "v2",
      mapped: true
    }
  };

  test('renders v2 response consistently', () => {
    const { container } = render(<ResponseRenderer response={mockV2Response} />);
    
    // Basic structure checks
    expect(container.querySelector('article')).toBeInTheDocument();
    expect(container.querySelector('h2')).toHaveTextContent('## 🛠 **Technical Answer**');
    expect(container.querySelector('.text-muted')).toHaveTextContent('Information about construction requirements');
    
    // Blocks rendering
    const sections = container.querySelectorAll('section');
    expect(sections).toHaveLength(2);
    expect(sections[0]).toHaveAttribute('data-type', 'markdown');
    expect(sections[1]).toHaveAttribute('data-type', 'list');
    
    // Meta information
    const meta = container.querySelector('[data-testid="meta"]');
    expect(meta).toHaveAttribute('data-schema', 'v2');
    expect(meta).toHaveAttribute('data-emoji', '🧐');
    
    // Snapshot for layout consistency (will be uncommented in Phase 4)
    // expect(container).toMatchSnapshot();
  });

  test('handles different block types', () => {
    const responseWithMultipleBlocks = {
      ...mockV2Response,
      blocks: [
        { type: "markdown", content: "Markdown content" },
        { type: "code", content: "console.log('code content')" },
        { type: "list", content: "• Item 1\n• Item 2" },
        { type: "table", content: "| Header | Value |\n|--------|-------|\n| Cell 1 | Cell 2 |" }
      ]
    };

    const { container } = render(<ResponseRenderer response={responseWithMultipleBlocks} />);
    
    const sections = container.querySelectorAll('section');
    expect(sections).toHaveLength(4);
    
    const blockTypes = Array.from(sections).map(section => section.getAttribute('data-type'));
    expect(blockTypes).toEqual(['markdown', 'code', 'list', 'table']);
  });

  test('maintains consistent structure across different tiers', () => {
    // Test that tier differences don't change layout (only content depth)
    const starterResponse = { ...mockV2Response, meta: { ...mockV2Response.meta, tier: 'starter' } };
    const proResponse = { ...mockV2Response, meta: { ...mockV2Response.meta, tier: 'pro' } };
    const proPlusResponse = { ...mockV2Response, meta: { ...mockV2Response.meta, tier: 'pro_plus' } };

    const starterRender = render(<ResponseRenderer response={starterResponse} />);
    const proRender = render(<ResponseRenderer response={proResponse} />);
    const proPlusRender = render(<ResponseRenderer response={proPlusResponse} />);

    // Structure should be identical across tiers
    expect(starterRender.container.querySelector('article')).toBeInTheDocument();
    expect(proRender.container.querySelector('article')).toBeInTheDocument(); 
    expect(proPlusRender.container.querySelector('article')).toBeInTheDocument();

    // All should have same number of sections (structure parity)
    const starterSections = starterRender.container.querySelectorAll('section');
    const proSections = proRender.container.querySelectorAll('section');
    const proPlusSections = proPlusRender.container.querySelectorAll('section');

    expect(starterSections).toHaveLength(proSections.length);
    expect(proSections).toHaveLength(proPlusSections.length);
  });

  test('handles minimal v2 response', () => {
    const minimalResponse = {
      title: "## 🔧 **Technical Answer**",
      summary: "Basic response",
      blocks: [
        { type: "markdown", content: "Minimal content" }
      ],
      meta: {
        emoji: "💬",
        schema: "v2", 
        mapped: true
      }
    };

    const { container } = render(<ResponseRenderer response={minimalResponse} />);
    
    expect(container.querySelector('article')).toBeInTheDocument();
    expect(container.querySelector('section')).toHaveAttribute('data-type', 'markdown');
    expect(container.querySelector('[data-testid="meta"]')).toHaveAttribute('data-schema', 'v2');
  });

  test('schema v2 compliance validation', () => {
    const { container } = render(<ResponseRenderer response={mockV2Response} />);
    
    // Ensure v2 schema compliance in rendered output
    const metaElement = container.querySelector('[data-testid="meta"]');
    expect(metaElement?.getAttribute('data-schema')).toBe('v2');
    
    // Required v2 elements present
    expect(container.querySelector('h2')).toBeInTheDocument(); // title
    expect(container.querySelector('.text-muted')).toBeInTheDocument(); // summary
    expect(container.querySelectorAll('section').length).toBeGreaterThan(0); // blocks
    expect(metaElement).toBeInTheDocument(); // meta
  });
});

// Export for potential use in integration tests
export { ResponseRenderer };
export default ResponseRenderer;