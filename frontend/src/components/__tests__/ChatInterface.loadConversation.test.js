/**
 * ChatInterface LoadConversation Tests
 * Focused tests for conversation loading functionality
 * @jest-environment jsdom
 */

/* eslint-env jest */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInterface from '../ChatInterface';

// Mock useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { uid: 'test-user', email: 'test@example.com' },
    idToken: 'mock-token',
    logout: jest.fn(),
    loading: false
  }))
}));

// Mock API endpoints
jest.mock('../../utils/api', () => ({
  apiEndpoints: {
    getUserProfile: jest.fn(),
    getSubscriptionStatus: jest.fn(),
    getChatHistory: jest.fn(),
    getChatSession: jest.fn(),
    askQuestion: jest.fn(),
    askEnhancedQuestion: jest.fn(),
  },
  setAuthToken: jest.fn(),
}));

// Mock other components
jest.mock('../UserProfile', () => () => <div data-testid="user-profile">User Profile</div>);
jest.mock('../OnboardingFlow', () => () => <div data-testid="onboarding">Onboarding</div>);
jest.mock('../LandingExamples', () => () => <div data-testid="examples">Examples</div>);
jest.mock('../V2Renderer', () => ({ response }) => (
  <div data-testid="v2-renderer">
    <div data-testid="response-title">{response.title}</div>
    <div data-testid="response-summary">{response.summary}</div>
    {response.blocks?.map((block, i) => (
      <div key={i} data-testid={`block-${block.type}`}>{block.content}</div>
    ))}
  </div>
));

describe('ChatInterface - LoadConversation', () => {
  let mockApiEndpoints;

  beforeEach(() => {
    // Get fresh mock references
    mockApiEndpoints = require('../../utils/api').apiEndpoints;
    jest.clearAllMocks();
    
    // Setup default API responses
    mockApiEndpoints.getUserProfile.mockResolvedValue({
      data: { name: 'Test User', preferences: {} }
    });
    
    mockApiEndpoints.getSubscriptionStatus.mockResolvedValue({
      data: {
        subscription_tier: 'starter',
        is_trial: true,
        trial_questions_used: 1,
        trial_questions_remaining: 2
      }
    });
    
    mockApiEndpoints.getChatHistory.mockResolvedValue({
      data: { 
        chat_history: [
          {
            session_id: 'test-session-123',
            title: 'Fire Safety Requirements',
            timestamp: '2025-08-14T10:00:00Z',
            messages: [
              { question: 'What are fire safety requirements?', timestamp: '2025-08-14T10:00:00Z' }
            ]
          }
        ]
      }
    });
  });

  test('loads messages using getChatSession and renders V2 responses', async () => {
    // Mock successful conversation loading
    mockApiEndpoints.getChatSession.mockResolvedValue({
      data: { 
        messages: [
          { 
            role: 'user', 
            content: 'What are fire safety requirements for high-rise buildings?',
            timestamp: '2025-08-14T10:00:00Z'
          },
          { 
            role: 'assistant', 
            content: {
              title: '## 🔧 **Technical Answer**',
              summary: 'Fire safety requirements for high-rise buildings in Australia',
              blocks: [
                {
                  type: 'markdown',
                  content: '# Technical Answer\n\nFire safety requirements are governed by the National Construction Code (NCC)...'
                }
              ],
              meta: { 
                schema: 'v2', 
                session_id: 'test-session-123',
                emoji: '🔧'
              }
            },
            timestamp: '2025-08-14T10:01:00Z'
          }
        ],
        session_id: 'test-session-123'
      }
    });

    render(<ChatInterface />);

    // Wait for chat history to load
    await waitFor(() => {
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });

    // Click on conversation to load it
    const conversationButton = screen.getByText('Fire Safety Requirements');
    fireEvent.click(conversationButton);

    // Verify getChatSession was called with correct session ID
    await waitFor(() => {
      expect(mockApiEndpoints.getChatSession).toHaveBeenCalledWith('test-session-123');
    });

    // Verify messages are rendered
    await waitFor(() => {
      expect(screen.getByText('What are fire safety requirements for high-rise buildings?')).toBeInTheDocument();
      expect(screen.getByTestId('v2-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('response-title')).toHaveTextContent('## 🔧 **Technical Answer**');
    });
  });

  test('handles conversation loading errors gracefully', async () => {
    // Mock failed conversation loading
    mockApiEndpoints.getChatSession.mockRejectedValue(new Error('Session not found'));

    render(<ChatInterface />);

    // Wait for chat history to load
    await waitFor(() => {
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });

    // Click on conversation
    const conversationButton = screen.getByText('Fire Safety Requirements');
    fireEvent.click(conversationButton);

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText('Could not load conversation. Please try again.')).toBeInTheDocument();
    });

    // Verify the app doesn't crash
    expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
  });

  test('handles malformed conversation data defensively', async () => {
    // Mock malformed response
    mockApiEndpoints.getChatSession.mockResolvedValue({
      data: { 
        messages: null, // Invalid - should be array
        session_id: 'test-session-123'
      }
    });

    render(<ChatInterface />);

    await waitFor(() => {
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });

    // Click on conversation
    const conversationButton = screen.getByText('Fire Safety Requirements');
    fireEvent.click(conversationButton);

    // Should handle gracefully without crashing
    await waitFor(() => {
      expect(mockApiEndpoints.getChatSession).toHaveBeenCalled();
    });

    // App should still be functional
    expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
  });

  test('formats conversation messages correctly', async () => {
    const mockMessages = [
      { 
        role: 'user', 
        content: 'Original user question',
        timestamp: '2025-08-14T10:00:00Z'
      },
      { 
        role: 'assistant', 
        content: {
          title: 'AI Response Title',
          summary: 'AI response summary',
          blocks: [
            { type: 'markdown', content: 'Technical content' },
            { type: 'list', content: '• Point 1\n• Point 2' }
          ],
          meta: { schema: 'v2', session_id: 'test' }
        },
        timestamp: '2025-08-14T10:01:00Z'
      }
    ];

    mockApiEndpoints.getChatSession.mockResolvedValue({
      data: { messages: mockMessages, session_id: 'test' }
    });

    render(<ChatInterface />);

    await waitFor(() => {
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });

    const conversationButton = screen.getByText('Fire Safety Requirements');
    fireEvent.click(conversationButton);

    // Verify both user and AI messages are displayed
    await waitFor(() => {
      expect(screen.getByText('Original user question')).toBeInTheDocument();
      expect(screen.getByTestId('v2-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('block-markdown')).toHaveTextContent('Technical content');
      expect(screen.getByTestId('block-list')).toHaveTextContent('• Point 1');
    });
  });

  test('sets session ID correctly when loading conversation', async () => {
    mockApiEndpoints.getChatSession.mockResolvedValue({
      data: { 
        messages: [
          { role: 'user', content: 'Test message', timestamp: '2025-08-14T10:00:00Z' }
        ],
        session_id: 'specific-session-id'
      }
    });

    render(<ChatInterface />);

    await waitFor(() => {
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });

    const conversationButton = screen.getByText('Fire Safety Requirements');
    fireEvent.click(conversationButton);

    await waitFor(() => {
      expect(mockApiEndpoints.getChatSession).toHaveBeenCalledWith('test-session-123');
    });

    // Verify the conversation appears as active in the sidebar
    await waitFor(() => {
      const activeConversation = conversationButton.closest('button');
      expect(activeConversation).toHaveClass('bg-blue-50');
    });
  });
});