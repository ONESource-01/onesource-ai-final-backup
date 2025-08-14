/**
 * API Contract Tests
 * Ensures API endpoints hit correct routes and handle responses properly
 * @jest-environment jsdom
 */

/* eslint-env jest */

import { apiEndpoints } from '../api';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('API Contract Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default axios instance mock
    mockedAxios.create = jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      defaults: { headers: { common: {} } }
    }));
  });

  test('getChatSession hits the correct route', async () => {
    const mockGet = jest.fn().mockResolvedValue({ 
      data: { 
        messages: [
          { role: 'user', content: 'Test question' },
          { role: 'assistant', content: { title: 'Test response' } }
        ],
        session_id: 'test-session-123'
      } 
    });
    
    // Mock the api instance
    const mockApiInstance = {
      get: mockGet,
      post: jest.fn(),
      defaults: { headers: { common: {} } }
    };
    
    mockedAxios.create.mockReturnValue(mockApiInstance);
    
    // Re-import to get fresh instance with mocked axios
    jest.resetModules();
    const { apiEndpoints: freshEndpoints } = require('../api');
    
    await freshEndpoints.getChatSession('test-session-123');
    
    expect(mockGet).toHaveBeenCalledWith('/chat/session/test-session-123');
  });

  test('getChatHistory hits the correct route with limit param', async () => {
    const mockGet = jest.fn().mockResolvedValue({ 
      data: { 
        chat_history: [
          { session_id: 'session-1', title: 'Test conversation' }
        ]
      } 
    });
    
    const mockApiInstance = {
      get: mockGet,
      post: jest.fn(),
      defaults: { headers: { common: {} } }
    };
    
    mockedAxios.create.mockReturnValue(mockApiInstance);
    
    jest.resetModules();
    const { apiEndpoints: freshEndpoints } = require('../api');
    
    await freshEndpoints.getChatHistory(10);
    
    expect(mockGet).toHaveBeenCalledWith('/chat/history', { params: { limit: 10 } });
  });

  test('askQuestion hits the correct route with proper payload', async () => {
    const mockPost = jest.fn().mockResolvedValue({ 
      data: { 
        title: 'Test Response',
        blocks: [{ type: 'markdown', content: 'Test content' }],
        meta: { schema: 'v2' }
      } 
    });
    
    const mockApiInstance = {
      get: jest.fn(),
      post: mockPost,
      defaults: { headers: { common: {} } }
    };
    
    mockedAxios.create.mockReturnValue(mockApiInstance);
    
    jest.resetModules();
    const { apiEndpoints: freshEndpoints } = require('../api');
    
    const testPayload = {
      question: 'What are fire safety requirements?',
      session_id: 'test-session',
      tier: 'starter',
      topics: {}
    };
    
    await freshEndpoints.askQuestion(testPayload);
    
    expect(mockPost).toHaveBeenCalledWith('/chat/ask', testPayload);
  });

  test('askEnhancedQuestion hits the correct route', async () => {
    const mockPost = jest.fn().mockResolvedValue({ 
      data: { 
        title: 'Enhanced Test Response',
        blocks: [{ type: 'markdown', content: 'Enhanced test content' }],
        meta: { schema: 'v2', knowledge_used: true }
      } 
    });
    
    const mockApiInstance = {
      get: jest.fn(),
      post: mockPost,
      defaults: { headers: { common: {} } }
    };
    
    mockedAxios.create.mockReturnValue(mockApiInstance);
    
    jest.resetModules();
    const { apiEndpoints: freshEndpoints } = require('../api');
    
    const testPayload = {
      question: 'What are fire safety requirements with knowledge enhancement?',
      session_id: 'test-session',
      tier: 'pro'
    };
    
    await freshEndpoints.askEnhancedQuestion(testPayload);
    
    expect(mockPost).toHaveBeenCalledWith('/chat/ask-enhanced', testPayload);
  });

  test('submitChatFeedback hits the correct route', async () => {
    const mockPost = jest.fn().mockResolvedValue({ 
      data: { success: true, message: 'Feedback submitted successfully' }
    });
    
    const mockApiInstance = {
      get: jest.fn(),
      post: mockPost,
      defaults: { headers: { common: {} } }
    };
    
    mockedAxios.create.mockReturnValue(mockApiInstance);
    
    jest.resetModules();
    const { apiEndpoints: freshEndpoints } = require('../api');
    
    const feedbackPayload = {
      message_id: 'msg-123',
      feedback_type: 'positive',
      comment: 'Very helpful response'
    };
    
    await freshEndpoints.submitChatFeedback(feedbackPayload);
    
    expect(mockPost).toHaveBeenCalledWith('/chat/feedback', feedbackPayload);
  });

  test('all chat endpoints are prefixed with /chat for proper routing', () => {
    // This test ensures all chat endpoints use the correct prefix for Kubernetes ingress
    const chatEndpoints = [
      'askQuestion',
      'askEnhancedQuestion', 
      'submitChatFeedback',
      'submitKnowledgeContribution',
      'getChatHistory',
      'getChatSession'
    ];
    
    // Create a mock instance to capture calls
    const mockGet = jest.fn();
    const mockPost = jest.fn();
    const mockApiInstance = {
      get: mockGet,
      post: mockPost,
      defaults: { headers: { common: {} } }
    };
    
    mockedAxios.create.mockReturnValue(mockApiInstance);
    
    jest.resetModules();
    const { apiEndpoints: freshEndpoints } = require('../api');
    
    // Test each endpoint
    freshEndpoints.askQuestion({ question: 'test' });
    freshEndpoints.askEnhancedQuestion({ question: 'test' });
    freshEndpoints.submitChatFeedback({ message_id: 'test' });
    freshEndpoints.submitKnowledgeContribution({ content: 'test' });
    freshEndpoints.getChatHistory(10);
    freshEndpoints.getChatSession('test-session');
    
    // Verify all calls use /chat prefix
    const allCalls = [...mockPost.mock.calls, ...mockGet.mock.calls];
    allCalls.forEach(call => {
      const route = call[0];
      expect(route).toMatch(/^\/chat/);
    });
  });
});