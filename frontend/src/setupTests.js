// src/setupTests.js
import '@testing-library/jest-dom';

// Mock window.URL for testing
global.URL = {
  createObjectURL: jest.fn(() => 'mocked-url'),
  revokeObjectURL: jest.fn(),
};

// Mock navigator.clipboard for testing
global.navigator = {
  ...global.navigator,
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
};

// Mock window.dispatchEvent for custom events
const originalDispatchEvent = window.dispatchEvent;
window.dispatchEvent = jest.fn(originalDispatchEvent);