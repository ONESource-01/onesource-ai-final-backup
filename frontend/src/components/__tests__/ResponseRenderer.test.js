/**
 * Frontend Response Renderer Tests
 * Comprehensive testing for V2 response rendering functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponseRenderer from '../ResponseRenderer';

// Mock the dependencies that may cause issues in testing environment
jest.mock('../Markdown', () => {
  return function MockMarkdown({ source }) {
    return <div data-testid="markdown-content">{source}</div>;
  };
});

jest.mock('../TablePro', () => {
  return function MockTablePro({ headers, rows, caption }) {
    return (
      <div data-testid="table-pro">
        <div data-testid="table-caption">{caption}</div>
        <div data-testid="table-headers">{headers?.join(', ')}</div>
        <div data-testid="table-rows">{rows?.map(row => row.join(', ')).join(' | ')}</div>
      </div>
    );
  };
});

describe('ResponseRenderer', () => {
  const mockV2Response = {
    title: "## 🔧 **Technical Answer**",
    summary: "Fire safety requirements for high-rise buildings in Australia",
    blocks: [
      { 
        type: "markdown", 
        content: "## 🔧 **Technical Answer**\n\nFire safety requirements for high-rise buildings in Australia are governed by the National Construction Code (NCC) and Australian Standards (AS).\n\n## 🧐 **Mentoring Insight**\n\nConsider engaging a fire safety engineer for complex projects to ensure compliance with all applicable standards.\n\n## 📋 **Next Steps**\n1. Review NCC Volume 1\n2. Consult AS 1851\n3. Engage qualified professionals" 
      }
    ],
    meta: {
      emoji: "🔧",
      schema: "v2",
      mapped: true,
      session_id: "test_session_123",
      tokens_used: 800,
      suggested_actions: [
        { label: "Get specific NCC clause", payload: "Show me specific NCC clause for fire safety" },
        { label: "Fire safety checklist", payload: "Generate fire safety compliance checklist" }
      ]
    }
  };

  beforeEach(() => {
    // Clear any custom event listeners
    jest.clearAllMocks();
  });

  test('renders V2 response with proper structure', () => {
    render(<ResponseRenderer response={mockV2Response} />);
    
    // Check main article structure
    expect(screen.getByRole('article')).toBeInTheDocument();
    
    // Check header elements
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByText('## 🔧 **Technical Answer**')).toBeInTheDocument();
    expect(screen.getByText('Fire safety requirements for high-rise buildings in Australia')).toBeInTheDocument();
    
    // Check blocks are rendered
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
  });

  test('displays emoji correctly in header', () => {
    render(<ResponseRenderer response={mockV2Response} />);
    
    const emojiElement = screen.getByRole('heading').querySelector('span[aria-hidden="true"]');
    expect(emojiElement).toHaveTextContent('🔧');
  });

  test('handles different block types correctly', () => {
    const responseWithMultipleBlocks = {
      ...mockV2Response,
      blocks: [
        { type: "markdown", content: "Markdown content with **bold** text" },
        { type: "code", content: "console.log('JavaScript code example');" },
        { type: "list", content: "• Fire exits\n• Sprinkler systems\n• Emergency lighting" },
        { 
          type: "table", 
          headers: ["Requirement", "Standard", "Application"],
          rows: [
            ["Fire exits", "AS 1851", "All buildings"],
            ["Sprinklers", "AS 2118", "High-rise only"]
          ],
          caption: "Fire safety requirements table"
        }
      ]
    };

    render(<ResponseRenderer response={responseWithMultipleBlocks} />);
    
    // Check markdown content
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    
    // Check code block
    const codeBlock = screen.getByText("console.log('JavaScript code example');");
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock.closest('pre')).toHaveClass('rounded-2xl', 'p-4', 'bg-muted/40');
    
    // Check table
    expect(screen.getByTestId('table-pro')).toBeInTheDocument();
  });

  test('renders suggested actions when provided', () => {
    render(<ResponseRenderer response={mockV2Response} />);
    
    // Check suggested actions section
    expect(screen.getByText('Would you like to…')).toBeInTheDocument();
    expect(screen.getByText('Get specific NCC clause')).toBeInTheDocument();
    expect(screen.getByText('Fire safety checklist')).toBeInTheDocument();
  });

  test('handles suggested action clicks', () => {
    const eventListener = jest.fn();
    window.addEventListener('suggested_action_clicked', eventListener);
    
    render(<ResponseRenderer response={mockV2Response} />);
    
    const actionButton = screen.getByText('Get specific NCC clause');
    fireEvent.click(actionButton);
    
    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { label: "Get specific NCC clause", payload: "Show me specific NCC clause for fire safety" }
      })
    );
    
    window.removeEventListener('suggested_action_clicked', eventListener);
  });

  test('handles response without summary', () => {
    const responseWithoutSummary = {
      ...mockV2Response,
      summary: null
    };

    render(<ResponseRenderer response={responseWithoutSummary} />);
    
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.queryByText('Fire safety requirements for high-rise buildings in Australia')).not.toBeInTheDocument();
  });

  test('handles response without suggested actions', () => {
    const responseWithoutActions = {
      ...mockV2Response,
      meta: {
        ...mockV2Response.meta,
        suggested_actions: []
      }
    };

    render(<ResponseRenderer response={responseWithoutActions} />);
    
    expect(screen.queryByText('Would you like to…')).not.toBeInTheDocument();
  });

  test('handles minimal V2 response', () => {
    const minimalResponse = {
      title: "Basic Response",
      summary: "",
      blocks: [
        { type: "markdown", content: "Simple answer" }
      ],
      meta: {
        emoji: "💬",
        schema: "v2",
        mapped: true
      }
    };

    render(<ResponseRenderer response={minimalResponse} />);
    
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toHaveTextContent('Basic Response');
    expect(screen.getByTestId('markdown-content')).toHaveTextContent('Simple answer');
  });

  test('handles callout block type', () => {
    const responseWithCallout = {
      ...mockV2Response,
      blocks: [
        { 
          type: "callout", 
          content: "⚠️ **Important**: Always consult with qualified professionals for fire safety compliance." 
        }
      ]
    };

    render(<ResponseRenderer response={responseWithCallout} />);
    
    const calloutElement = screen.getByTestId('markdown-content');
    expect(calloutElement.closest('div')).toHaveClass('rounded-2xl', 'border', 'p-4', 'bg-accent/40');
  });

  test('handles image block type', () => {
    const responseWithImage = {
      ...mockV2Response,
      blocks: [
        { 
          type: "image", 
          src: "https://example.com/fire-safety-diagram.jpg",
          alt: "Fire safety system diagram",
          caption: "Typical fire safety system layout for high-rise buildings"
        }
      ]
    };

    render(<ResponseRenderer response={responseWithImage} />);
    
    const image = screen.getByAltText('Fire safety system diagram');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/fire-safety-diagram.jpg');
    
    const caption = screen.getByText('Typical fire safety system layout for high-rise buildings');
    expect(caption).toBeInTheDocument();
  });

  test('applies proper accessibility attributes', () => {
    render(<ResponseRenderer response={mockV2Response} />);
    
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    
    // Check emoji has aria-hidden
    const emojiSpan = heading.querySelector('span[aria-hidden]');
    expect(emojiSpan).toBeInTheDocument();
  });

  test('snapshot test - V2 response structure', () => {
    const { container } = render(<ResponseRenderer response={mockV2Response} />);
    
    // Basic structure validation for snapshot consistency
    expect(container.querySelector('article')).toBeInTheDocument();
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('h2')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
    
    // This ensures consistent structure for snapshot testing
    expect(container).toMatchSnapshot();
  });
});