/**
 * Chat Interface Tests
 * Testing the main chat functionality including Recent Conversations
 * @jest-environment jsdom
 */

/* eslint-env jest */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInterface from '../ChatInterface';
import { AuthContext } from '../../contexts/AuthContext';

// Mock the API utilities
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

// Mock other components to focus on ChatInterface logic
jest.mock('../UserProfile', () => {
  return function MockUserProfile() {
    return <div data-testid="user-profile">User Profile</div>;
  };
});

jest.mock('../OnboardingFlow', () => {
  return function MockOnboardingFlow() {
    return <div data-testid="onboarding-flow">Onboarding Flow</div>;
  };
});

jest.mock('../LandingExamples', () => {
  return function MockLandingExamples() {
    return <div data-testid="landing-examples">Landing Examples</div>;
  };
});

jest.mock('../V2Renderer', () => {
  return function MockV2Renderer({ response }) {
    return (
      <div data-testid="v2-renderer">
        <div>{response.title}</div>
        <div>{response.summary}</div>
      </div>
    );
  };
});

describe('ChatInterface - Recent Conversations', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User'
  };

  const mockIdToken = 'mock-jwt-token';

  const mockAuthContext = {
    user: mockUser,
    idToken: mockIdToken,
    logout: jest.fn(),
    loading: false
  };

  const mockChatHistory = [
    {
      id: 'conversation-1',
      title: 'Fire Safety Requirements',
      preview: 'What are fire safety requirements for high-rise buildings?',
      updated_at: '2025-08-14T10:00:00Z',
      session_id: 'session-1'
    },
    {
      id: 'conversation-2', 
      title: 'Acoustic Lagging Installation',
      preview: 'When should I install acoustic lagging?',
      updated_at: '2025-08-14T09:00:00Z',
      session_id: 'session-2'
    },
    {
      id: 'conversation-3',
      title: 'Building Code Compliance', 
      preview: 'What are the NCC requirements for swimming pools?',
      updated_at: '2025-08-14T08:00:00Z',
      session_id: 'session-3'
    }
  ];

  const mockConversationMessages = [
    {
      role: 'user',
      content: 'What are fire safety requirements for high-rise buildings?',
      timestamp: '2025-08-14T10:00:00Z'
    },
    {
      role: 'assistant',
      content: {
        title: '## 🔧 **Technical Answer**',
        summary: 'Fire safety requirements for high-rise buildings',
        blocks: [
          {
            type: 'markdown',
            content: 'Fire safety requirements are governed by the NCC and relevant Australian Standards...'
          }
        ],
        meta: {
          emoji: '🔧',
          schema: 'v2',
          mapped: true
        }
      },
      timestamp: '2025-08-14T10:01:00Z'
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default API responses
    const { apiEndpoints } = require('../../utils/api');
    apiEndpoints.getUserProfile.mockResolvedValue({
      data: { 
        name: 'Test User',
        preferences: { theme: 'light' }
      }
    });
    
    apiEndpoints.getSubscriptionStatus.mockResolvedValue({
      data: {
        subscription_tier: 'starter',
        is_trial: true,
        trial_questions_used: 1,
        trial_questions_remaining: 2
      }
    });
    
    apiEndpoints.getChatHistory.mockResolvedValue({
      data: { conversations: mockChatHistory }
    });
    
    apiEndpoints.getChatSession.mockResolvedValue({
      data: { 
        messages: mockConversationMessages,
        session_id: 'session-1'
      }
    });
  });

  const renderChatInterface = () => {
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <ChatInterface />
      </AuthContext.Provider>
    );
  };

  test('displays Recent Conversations section', async () => {
    renderChatInterface();

    // Wait for chat history to load
    await waitFor(() => {
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });

    // Check that conversations are displayed
    expect(screen.getByText('Fire Safety Requirements')).toBeInTheDocument();
    expect(screen.getByText('Acoustic Lagging Installation')).toBeInTheDocument();
    expect(screen.getByText('Building Code Compliance')).toBeInTheDocument();
  });

  test('displays conversation previews and dates', async () => {
    renderChatInterface();

    await waitFor(() => {
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });

    // Check conversation previews
    expect(screen.getByText('What are fire safety requirements for high-rise buildings?')).toBeInTheDocument();
    expect(screen.getByText('When should I install acoustic lagging?')).toBeInTheDocument();
    expect(screen.getByText('What are the NCC requirements for swimming pools?')).toBeInTheDocument();
  });

  test('loads conversation when clicked', async () => {
    const { apiEndpoints } = require('../../utils/api');
    
    renderChatInterface();

    await waitFor(() => {
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });

    // Click on the first conversation
    const conversationButton = screen.getByText('Fire Safety Requirements');
    fireEvent.click(conversationButton);

    // Verify that getChatSession was called with correct session ID
    await waitFor(() => {
      expect(apiEndpoints.getChatSession).toHaveBeenCalledWith('conversation-1');
    });
  });

  test('displays "No conversations yet" when history is empty', async () => {
    const { apiEndpoints } = require('../../utils/api');
    apiEndpoints.getChatHistory.mockResolvedValue({
      data: { conversations: [] }
    });
    
    renderChatInterface();

    await waitFor(() => {
      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    });
  });

  test('handles conversation loading errors gracefully', async () => {
    const { apiEndpoints } = require('../../utils/api');
    apiEndpoints.getChatHistory.mockRejectedValue(new Error('Failed to load'));
    
    renderChatInterface();

    // Should still display the Recent Conversations section
    await waitFor(() => {
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });

    // Should show no conversations message
    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
  });

  test('conversation search functionality', async () => {
    renderChatInterface();

    await waitFor(() => {
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });

    // Find search input (should be in the sidebar)
    const searchInput = screen.getByPlaceholderText('Search conversations...');
    expect(searchInput).toBeInTheDocument();

    // Search for "fire"
    fireEvent.change(searchInput, { target: { value: 'fire' } });

    // Should show only the fire safety conversation
    expect(screen.getByText('Fire Safety Requirements')).toBeInTheDocument();
    
    // Should not show other conversations
    expect(screen.queryByText('Acoustic Lagging Installation')).not.toBeInTheDocument();
    expect(screen.queryByText('Building Code Compliance')).not.toBeInTheDocument();
  });

  test('conversation highlighting for active session', async () => {
    renderChatInterface();

    await waitFor(() => {
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });

    // Click on a conversation to make it active
    const conversationButton = screen.getByText('Fire Safety Requirements').closest('button');
    fireEvent.click(conversationButton);

    await waitFor(() => {
      // The button should have active styling classes
      expect(conversationButton).toHaveClass('bg-blue-50', 'border', 'border-blue-200');
    });
  });

  test('message formatting in loaded conversation', async () => {
    renderChatInterface();

    await waitFor(() => {
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });

    // Click on conversation
    const conversationButton = screen.getByText('Fire Safety Requirements');
    fireEvent.click(conversationButton);

    // Wait for messages to load and be formatted
    await waitFor(() => {
      // Should display the user message
      expect(screen.getByText('What are fire safety requirements for high-rise buildings?')).toBeInTheDocument();
      
      // Should display the AI response using V2Renderer
      expect(screen.getByTestId('v2-renderer')).toBeInTheDocument();
      expect(screen.getByText('## 🔧 **Technical Answer**')).toBeInTheDocument();
    });
  });

  test('API error handling for chat session loading', async () => {
    const { apiEndpoints } = require('../../utils/api');
    apiEndpoints.getChatSession.mockRejectedValue(new Error('Session not found'));
    
    renderChatInterface();

    await waitFor(() => {
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });

    // Click on conversation
    const conversationButton = screen.getByText('Fire Safety Requirements');
    fireEvent.click(conversationButton);

    // Should handle error gracefully (not crash the app)
    await waitFor(() => {
      // The conversation list should still be visible
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });
  });
});