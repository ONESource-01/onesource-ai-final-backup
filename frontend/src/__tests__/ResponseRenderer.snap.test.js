import React from 'react';
import { render } from '@testing-library/react';
import ResponseRenderer from '../components/ResponseRenderer';
import { sampleV2, sampleV2Enhanced } from '../fixtures/sampleV2';

// Mock the CSV utility since it uses DOM APIs
jest.mock('../utils/csv', () => ({
  exportToCsv: jest.fn()
}));

describe('ResponseRenderer', () => {
  test('renders basic v2 payload consistently', () => {
    const { container } = render(<ResponseRenderer response={sampleV2} />);
    expect(container).toMatchSnapshot();
  });

  test('renders enhanced v2 payload with suggested actions', () => {
    const { container } = render(<ResponseRenderer response={sampleV2Enhanced} />);
    expect(container).toMatchSnapshot();
  });

  test('renders v2 payload with all block types', () => {
    const complexResponse = {
      title: "## 🧪 **Test Response**",
      summary: "Testing all block types in ResponseRenderer",
      blocks: [
        { type: "markdown", content: "This is **markdown** content with *emphasis*." },
        { type: "list", content: "- Item 1\n- Item 2\n- Item 3" },
        { type: "code", content: "console.log('Hello, World!');", language: "javascript" },
        {
          type: "table",
          caption: "Test Table",
          headers: ["Column 1", "Column 2", "Column 3"],
          rows: [["A", "B", "C"], ["1", "2", "3"]],
          dense: true
        },
        { type: "callout", content: "**Important:** This is a callout message." },
        { type: "image", src: "/test-image.jpg", alt: "Test Image", caption: "Test Caption" }
      ],
      meta: { emoji: "🧪", schema: "v2", mapped: true }
    };

    const { container } = render(<ResponseRenderer response={complexResponse} />);
    expect(container).toMatchSnapshot();
  });

  test('handles empty blocks gracefully', () => {
    const emptyResponse = {
      title: "## 📭 **Empty Response**",
      summary: "Response with no blocks",
      blocks: [],
      meta: { emoji: "📭", schema: "v2", mapped: true }
    };

    const { container } = render(<ResponseRenderer response={emptyResponse} />);
    expect(container).toMatchSnapshot();
  });

  test('renders without summary', () => {
    const noSummaryResponse = {
      title: "## 🎯 **No Summary**",
      blocks: [
        { type: "markdown", content: "Response without summary field." }
      ],
      meta: { emoji: "🎯", schema: "v2", mapped: true }
    };

    const { container } = render(<ResponseRenderer response={noSummaryResponse} />);
    expect(container).toMatchSnapshot();
  });
});