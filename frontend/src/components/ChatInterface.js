import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiEndpoints, setAuthToken } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import UserProfile from './UserProfile';
import OnboardingFlow from './OnboardingFlow';
import { 
  AlertTriangle, Send, User, Bot, Clock, Crown, Zap, LogOut, 
  Copy, ThumbsUp, ThumbsDown, Search, Plus, MessageSquare,
  Edit3, Save, X, Sparkles, TrendingUp, Star, Settings, Database
} from 'lucide-react';

const ChatInterface = () => {
  const { user, idToken, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [trialInfo, setTrialInfo] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContributionBox, setShowContributionBox] = useState({});
  const [contributionText, setContributionText] = useState({});
  const [optInCredit, setOptInCredit] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState({ show: false, messageId: null, type: null });
  const [feedbackText, setFeedbackText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [useKnowledgeEnhanced, setUseKnowledgeEnhanced] = useState(false);
  const [boosterUsage, setBoosterUsage] = useState({ used: false, remaining: 1 });
  const [boostingMessage, setBoostingMessage] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const messagesEndRef = useRef(null);

  // Set page title for this component
  useEffect(() => {
    document.title = 'ONESource-ai | Construction AI Assistant';
    return () => {
      document.title = 'ONESource-ai | AU/NZ Construction Industry AI';
    };
  }, []);

  // Set auth token when idToken changes
  useEffect(() => {
    if (idToken) {
      setAuthToken(idToken);
    }
  }, [idToken]);

  // Initialize session and load data
  useEffect(() => {
    if (user && idToken) {
      checkSubscriptionStatus();
      loadChatHistory();
      checkOnboardingStatus();
      loadUserPreferences();
    }
  }, [user, idToken]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const checkSubscriptionStatus = async () => {
    try {
      const response = await apiEndpoints.getSubscriptionStatus();
      setSubscriptionStatus(response.data);
      setTrialInfo(response.data.trial_info);
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      setSubscriptionStatus({ tier: 'free', is_trial: true });
      setTrialInfo({ questions_remaining: 3, questions_used: 0 });
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await apiEndpoints.getChatHistory();
      setChatHistory(response.data.conversations || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setChatHistory([]);
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const response = await apiEndpoints.getUserProfile();
      setOnboardingCompleted(response.data.onboarding_completed || false);
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      setOnboardingCompleted(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const response = await apiEndpoints.getUserProfile();
      setUserPreferences(response.data.preferences || null);
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      setLoading(true);
      const response = await apiEndpoints.getConversation(conversationId);
      const conversationMessages = response.data.messages || [];
      
      const formattedMessages = conversationMessages.map(msg => ({
        id: Date.now() + Math.random(),
        type: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content,
        timestamp: new Date()
      }));
      
      setMessages(formattedMessages);
      setSessionId(conversationId);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setSessionId(null);
    // Session will be created automatically when sending first message
  };

  const sendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || loading) return;

    console.log("🚀 SEND MESSAGE DEBUG:");
    console.log("Message:", trimmedMessage);
    console.log("Session ID:", sessionId);
    console.log("Use Knowledge Enhanced:", useKnowledgeEnhanced);
    console.log("API Endpoints:", apiEndpoints);

    // Check trial limits
    if (subscriptionStatus?.is_trial && trialInfo?.questions_remaining <= 0) {
      alert('You have used all your free questions. Please upgrade to continue.');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: trimmedMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const requestData = {
        question: trimmedMessage,
        session_id: sessionId,
      };

      console.log("🚀 REQUEST DATA:", requestData);
      console.log("🚀 CALLING API ENDPOINT...");

      const response = useKnowledgeEnhanced 
        ? await apiEndpoints.askEnhancedQuestion(requestData)
        : await apiEndpoints.askQuestion(requestData);

      console.log("🚀 RESPONSE RECEIVED:", response);

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response?.technical || response.data.response || 'No response received',
        timestamp: new Date(),
        sources: response.data.sources || [],
        confidence: response.data.confidence || null,
        mentoring: response.data.response?.mentoring || null,
        format: response.data.response?.format || 'single'
      };

      console.log("🚀 AI MESSAGE CREATED:", aiMessage);

      setMessages(prev => [...prev, aiMessage]);
      
      // Update subscription status after successful query
      if (response.data.subscription_status) {
        setSubscriptionStatus(response.data.subscription_status);
        setTrialInfo(response.data.subscription_status.trial_info);
      }

      // Update session ID if provided
      if (response.data.session_id) {
        setSessionId(response.data.session_id);
      }

      // Update chat history
      loadChatHistory();

    } catch (error) {
      console.error('❌ CHAT ERROR:', error);
      console.error('❌ ERROR DETAILS:', error.response);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I apologize, but I encountered an error while processing your question. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    console.log("🔥 KEY PRESSED:", e.key, "Shift:", e.shiftKey);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log("🔥 ENTER PRESSED - CALLING SEND MESSAGE");
      sendMessage();
    }
  };

  // Format AI response with tight spacing and professional typography (Emergent style)
  const formatAIResponse = (content) => {
    if (!content) return '';
    
    let formatted = content;
    
    // STEP 1: Handle markdown headers FIRST (before line breaks are removed)
    
    // Handle # patterns - Main sections (ENHANCED EMOJI MAPPING)
    formatted = formatted.replace(/^#\s*(\d+\.?\s*)?(.*?)$/gmi, (match, number, title) => {
      const cleanTitle = title.trim();
      const lowerTitle = cleanTitle.toLowerCase();
      
      if (lowerTitle.includes('technical answer') || lowerTitle.includes('technical')) {
        return '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">🔧 <strong>Technical Answer</strong></h3></div>';
      }
      if (lowerTitle.includes('mentoring') || lowerTitle.includes('insight')) {
        return '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">🧠 <strong>Mentoring Insight</strong></h3></div>';
      }
      if (lowerTitle.includes('next steps') || lowerTitle.includes('clarifying')) {
        return '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">📋 <strong>Next Steps</strong></h3></div>';
      }
      if (lowerTitle.includes('code requirements') || lowerTitle.includes('requirements')) {
        return '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">📊 <strong>Code Requirements</strong></h3></div>';
      }
      if (lowerTitle.includes('compliance')) {
        return '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">✅ <strong>Compliance Verification</strong></h3></div>';
      }
      if (lowerTitle.includes('alternative')) {
        return '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">🔄 <strong>Alternative Solutions</strong></h3></div>';
      }
      if (lowerTitle.includes('authority')) {
        return '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">🏛️ <strong>Authority Requirements</strong></h3></div>';
      }
      if (lowerTitle.includes('documentation')) {
        return '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">📄 <strong>Documentation Needed</strong></h3></div>';
      }
      if (lowerTitle.includes('workflow') || lowerTitle.includes('recommendations')) {
        return '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">⚙️ <strong>Workflow Recommendations</strong></h3></div>';
      }
      if (lowerTitle.includes('questions') || lowerTitle.includes('clarify')) {
        return '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">❓ <strong>Clarifying Questions</strong></h3></div>';
      }
      
      // Default
      return '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">📋 <strong>' + cleanTitle + '</strong></h3></div>';
    });
    
    // Handle ## patterns - Sub-sections (ENHANCED EMOJI MAPPING)
    formatted = formatted.replace(/^##\s*(\d+\.?\s*)?(.*?)$/gmi, (match, number, title) => {
      const cleanTitle = title ? title.trim() : '';
      const lowerTitle = cleanTitle.toLowerCase();
      const fullTitle = (number || '') + cleanTitle;
      
      if (lowerTitle.includes('code requirements') || lowerTitle.includes('requirements')) {
        return '<div class="mt-3 mb-1"><h4 class="text-sm font-semibold text-gray-800 flex items-center gap-2">📊 <strong>' + fullTitle + '</strong></h4></div>';
      }
      if (lowerTitle.includes('compliance')) {
        return '<div class="mt-3 mb-1"><h4 class="text-sm font-semibold text-gray-800 flex items-center gap-2">✅ <strong>' + fullTitle + '</strong></h4></div>';
      }
      if (lowerTitle.includes('alternative')) {
        return '<div class="mt-3 mb-1"><h4 class="text-sm font-semibold text-gray-800 flex items-center gap-2">🔄 <strong>' + fullTitle + '</strong></h4></div>';
      }
      if (lowerTitle.includes('authority')) {
        return '<div class="mt-3 mb-1"><h4 class="text-sm font-semibold text-gray-800 flex items-center gap-2">🏛️ <strong>' + fullTitle + '</strong></h4></div>';
      }
      if (lowerTitle.includes('documentation')) {
        return '<div class="mt-3 mb-1"><h4 class="text-sm font-semibold text-gray-800 flex items-center gap-2">📄 <strong>' + fullTitle + '</strong></h4></div>';
      }
      if (lowerTitle.includes('workflow') || lowerTitle.includes('recommendations')) {
        return '<div class="mt-3 mb-1"><h4 class="text-sm font-semibold text-gray-800 flex items-center gap-2">⚙️ <strong>' + fullTitle + '</strong></h4></div>';
      }
      if (lowerTitle.includes('questions') || lowerTitle.includes('clarify')) {
        return '<div class="mt-3 mb-1"><h4 class="text-sm font-semibold text-gray-800 flex items-center gap-2">❓ <strong>' + fullTitle + '</strong></h4></div>';
      }
      
      // Default - handles any ## pattern including numbered ones
      return '<div class="mt-3 mb-1"><h4 class="text-sm font-semibold text-gray-800 flex items-center gap-2">🔹 <strong>' + fullTitle + '</strong></h4></div>';
    });
    
    // Handle ### patterns - Minor sections
    formatted = formatted.replace(/^###\s*(.*?)$/gmi, (match, title) => {
      const cleanTitle = title.trim();
      return '<div class="mt-2 mb-1"><h5 class="text-sm font-medium text-gray-700 flex items-center gap-2">▪️ <strong>' + cleanTitle + '</strong></h5></div>';
    });
    
    // STEP 2: Handle plain **text:** patterns and convert to Enhanced Emoji Mapping
    // This handles cases where the AI sends plain bold headers without emojis
    formatted = formatted.replace(/\*\*Technical Answer:\*\*/gi, '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">🔧 <strong>Technical Answer</strong></h3></div>');
    formatted = formatted.replace(/\*\*Technical Answer\*\*/gi, '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">🔧 <strong>Technical Answer</strong></h3></div>');
    formatted = formatted.replace(/\*\*Mentoring Insight:\*\*/gi, '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">🧠 <strong>Mentoring Insight</strong></h3></div>');
    formatted = formatted.replace(/\*\*Mentoring Insight\*\*/gi, '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">🧠 <strong>Mentoring Insight</strong></h3></div>');
    formatted = formatted.replace(/\*\*Next Steps:\*\*/gi, '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">📋 <strong>Next Steps</strong></h3></div>');
    formatted = formatted.replace(/\*\*Next Steps\*\*/gi, '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">📋 <strong>Next Steps</strong></h3></div>');
    formatted = formatted.replace(/\*\*Code Requirements:\*\*/gi, '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">📊 <strong>Code Requirements</strong></h3></div>');
    formatted = formatted.replace(/\*\*Code Requirements\*\*/gi, '<div class="mt-4 mb-2"><h3 class="text-base font-bold text-gray-900 flex items-center gap-2">📊 <strong>Code Requirements</strong></h3></div>');
    
    // STEP 3: Convert remaining **bold** to proper HTML bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    
    // STEP 3: Handle markdown tables
    formatted = formatted.replace(/(\|.*\|[\r\n]+\|[-\s\|:]+\|[\r\n]+((\|.*\|[\r\n]*)+))/gm, (match) => {
      const lines = match.trim().split('\n');
      const headers = lines[0].split('|').filter(cell => cell.trim()).map(cell => cell.trim());
      const rows = lines.slice(2).map(line => 
        line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
      );
      
      return `
        <div class="my-4 overflow-x-auto">
          <table class="min-w-full border-collapse border border-gray-300 bg-white shadow-sm rounded-lg">
            <thead class="bg-blue-50">
              <tr>
                ${headers.map(header => `<th class="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-900 text-sm">${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr class="hover:bg-gray-50">
                  ${row.map(cell => `<td class="border border-gray-300 px-3 py-2 text-sm text-gray-700">${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    });
    
    // STEP 4: Convert bullet points with ultra-tight spacing
    formatted = formatted.replace(/^\s*[-•]\s*\*\*(.*?)\*\*:\s*(.*?)$/gm, 
      '<div class="flex items-start gap-2 mb-0.5 ml-3"><span class="flex-shrink-0 w-1 h-1 bg-blue-600 rounded-full mt-2"></span><div><strong class="text-gray-900 font-medium">$1:</strong> <span class="text-gray-700">$2</span></div></div>');
    
    formatted = formatted.replace(/^\s*[-•]\s*(.*?)$/gm, 
      '<div class="flex items-start gap-2 mb-0.5 ml-3"><span class="flex-shrink-0 w-1 h-1 bg-blue-500 rounded-full mt-2"></span><span class="text-gray-700">$1</span></div>');
    
    // STEP 5: Add clickable links
    formatted = formatted.replace(/\b(NCC|National Construction Code)\b/g, 
      '<a href="https://ncc.abcb.gov.au/" target="_blank" class="font-medium text-onesource-dark hover:text-onesource-medium underline">$1</a>');
    
    formatted = formatted.replace(/\b(AS \d{4}(?:\.\d+)?)\b/g, 
      '<a href="https://www.standards.org.au/" target="_blank" class="font-medium text-onesource-dark hover:text-onesource-medium underline bg-onesource-pale px-1 rounded">$1</a>');
    
    formatted = formatted.replace(/\b(NZS \d{4}(?:\.\d+)?)\b/g, 
      '<a href="https://www.standards.govt.nz/" target="_blank" class="font-medium text-onesource-dark hover:text-onesource-medium underline bg-onesource-pale px-1 rounded">$1</a>');
    
    // STEP 6: Handle line breaks LAST (after all markdown processing)
    formatted = formatted.replace(/\n\n/g, '<br>');  // Double breaks become single
    formatted = formatted.replace(/\n/g, '');        // Remove single breaks for tight spacing
    
    // STEP 6.5: Final cleanup - catch any remaining markdown headers that slipped through
    formatted = formatted.replace(/^#+\s*(.*?)$/gm, '<div class="mt-2 mb-1"><h5 class="text-sm font-medium text-gray-700 flex items-center gap-2">▪️ <strong>$1</strong></h5></div>');
    
    // STEP 7: Wrap in container with tight spacing
    formatted = `<div style="line-height: 1.3; margin: 0; padding: 0;">${formatted}</div>`;
    
    return formatted;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;

    try {
      console.log('📝 Submitting feedback:', {
        message_id: feedbackModal.messageId,
        feedback_type: feedbackModal.type,
        feedback_text: feedbackText,
        session_id: sessionId
      });

      await apiEndpoints.submitChatFeedback({
        message_id: feedbackModal.messageId,
        feedback_type: feedbackModal.type,
        feedback_text: feedbackText,
        session_id: sessionId
      });
      
      console.log('✅ Feedback submitted successfully');
      setFeedbackModal({ show: false, messageId: null, type: null });
      setFeedbackText('');
      
      // Show success message
      alert('Thank you for your feedback! Your input helps improve ONESource-ai.');
      
    } catch (error) {
      console.error('❌ Failed to submit feedback:', error);
      alert('Sorry, there was an issue submitting your feedback. Please try again.');
    }
  };

  const submitContribution = async (messageId) => {
    const contribution = contributionText[messageId];
    if (!contribution || !contribution.trim()) return;

    try {
      await apiEndpoints.submitContribution({
        message_id: messageId,
        contribution_text: contribution,
        opt_in_credit: optInCredit,
        session_id: sessionId
      });

      setShowContributionBox(prev => ({ ...prev, [messageId]: false }));
      setContributionText(prev => ({ ...prev, [messageId]: '' }));
    } catch (error) {
      console.error('Failed to submit contribution:', error);
    }
  };

  const handleBooster = async (messageId) => {
    console.log("🚀 BOOST DEBUG - Starting with messageId:", messageId);
    console.log("🚀 BOOST DEBUG - Booster usage:", boosterUsage);
    
    if (boosterUsage.remaining <= 0) {
      alert('You have used your daily booster. Try again tomorrow!');
      return;
    }

    setBoostingMessage(messageId);

    try {
      // Find the user question that triggered this AI response
      const messageIndex = messages.findIndex(m => m.id === messageId);
      const userMessage = messageIndex > 0 ? messages[messageIndex - 1] : null;
      
      console.log("🚀 BOOST DEBUG - Message index:", messageIndex);
      console.log("🚀 BOOST DEBUG - User message found:", userMessage);
      
      if (!userMessage || userMessage.type !== 'user') {
        throw new Error('Could not find original user question');
      }

      const requestData = {
        question: userMessage.content,
        current_tier: subscriptionStatus?.subscription_tier || 'starter',
        target_tier: 'pro'
      };
      
      console.log("🚀 BOOST DEBUG - Request data:", requestData);
      console.log("🚀 BOOST DEBUG - Calling boosterChat API...");

      const response = await apiEndpoints.boosterChat(requestData);
      
      console.log("🚀 BOOST DEBUG - Response received:", response);

      const boosterMessage = {
        id: Date.now() + Math.random(),
        type: 'ai',
        content: response.data.boosted_response,
        timestamp: new Date(),
        isBooster: true,
        sources: response.data.sources || []
      };

      console.log("🚀 BOOST DEBUG - Booster message created:", boosterMessage);

      setMessages(prev => [...prev, boosterMessage]);
      setBoosterUsage(prev => ({ 
        used: true,
        remaining: prev.remaining - 1 
      }));

      console.log("🚀 BOOST DEBUG - Success!");

    } catch (error) {
      console.error('🚀 BOOST DEBUG - Error:', error);
      console.error('🚀 BOOST DEBUG - Error response:', error.response);
      alert(`Failed to generate boosted response: ${error.message}`);
    } finally {
      setBoostingMessage(null);
    }
  };

  const renderPersonalizationIndicator = () => {
    if (!userPreferences || (!userPreferences.industry_sectors?.length && !userPreferences.disciplines?.length)) {
      return null;
    }

    return (
      <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-400 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-800">AI Personalized for You</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {userPreferences.industry_sectors?.slice(0, 2).map((sector, index) => (
            <Badge key={index} variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50">
              {sector}
            </Badge>
          ))}
          {userPreferences.disciplines?.slice(0, 2).map((discipline, index) => (
            <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
              {discipline}
            </Badge>
          ))}
          {(userPreferences.industry_sectors?.length > 2 || userPreferences.disciplines?.length > 2) && (
            <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
              +{(userPreferences.industry_sectors?.length || 0) + (userPreferences.disciplines?.length || 0) - 4} more
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const filteredHistory = chatHistory.filter(conversation =>
    conversation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.preview?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showOnboarding) {
    return (
      <OnboardingFlow 
        onComplete={() => {
          setShowOnboarding(false);
          setOnboardingCompleted(true);
          checkOnboardingStatus();
          loadUserPreferences();
        }} 
      />
    );
  }

  if (showUserProfile) {
    return (
      <UserProfile 
        onClose={() => setShowUserProfile(false)}
        onPreferencesUpdate={loadUserPreferences}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img 
                src="/onesource-icon.png" 
                alt="ONESource-ai" 
                className="h-8 w-8"
              />
              <h1 className="font-bold text-lg text-gray-900">ONESource-ai</h1>
            </div>
            <Button
              size="sm"
              onClick={startNewConversation}
              className="bg-onesource-dark hover:bg-onesource-medium text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Personalization Indicator in Sidebar */}
        {renderPersonalizationIndicator()}

        {/* Subscription Status */}
        <div className="p-4 border-b border-gray-200">
          {subscriptionStatus?.is_trial ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Free Trial</span>
              </div>
              <p className="text-xs text-blue-700">
                {trialInfo?.questions_remaining || 0} questions remaining
              </p>
              <Button size="sm" className="mt-2 w-full bg-blue-600 hover:bg-blue-700">
                <a href="/pricing" className="text-white text-xs">Upgrade Now</a>
              </Button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {subscriptionStatus?.tier || 'Starter'} Plan
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs border-green-300 text-green-700 hover:bg-green-100"
                onClick={() => window.location.href = '/pricing'}
              >
                <Crown className="h-3 w-3 mr-1" />
                View Plans & Upgrade
              </Button>
            </div>
          )}

          {/* Booster Status */}
          <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Daily Booster</span>
              </div>
              <Badge variant="outline" className={`text-xs ${
                boosterUsage.remaining > 0 
                  ? 'border-purple-200 text-purple-700 bg-purple-50' 
                  : 'border-gray-200 text-gray-600 bg-gray-50'
              }`}>
                {boosterUsage.remaining}/1
              </Badge>
            </div>
            <p className="text-xs text-purple-700 mt-1">
              {boosterUsage.remaining > 0 
                ? 'Get enhanced responses with sources' 
                : 'Resets tomorrow'
              }
            </p>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Recent Conversations
            </h3>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => loadConversation(conversation.id)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors mb-1 ${
                    sessionId === conversation.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.title || 'New Conversation'}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conversation.preview || 'No messages yet'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conversation.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {/* User Profile Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUserProfile(true)}
            className="w-full justify-start"
          >
            <Settings className="h-4 w-4 mr-2" />
            Profile & Settings
          </Button>

          {/* Knowledge Vault Link */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/knowledge'}
            className="w-full justify-start"
          >
            <Database className="h-4 w-4 mr-2" />
            Knowledge Vault
          </Button>

          {/* Onboarding Button (if not completed) */}
          {!onboardingCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnboarding(true)}
              className="w-full justify-start border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <Star className="h-4 w-4 mr-2" />
              Complete Setup
            </Button>
          )}

          {/* User Info & Logout */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const confirmLogout = window.confirm(
                  'Are you sure you want to sign out? Your conversation history will be saved.'
                );
                
                if (confirmLogout) {
                  await logout();
                }
              }}
              title="Logout - Your data will be preserved"
              className="text-gray-500 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <img 
                src="/onesource-icon.png" 
                alt="ONESource-ai" 
                className="h-16 w-16 mb-4"
              />
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#0f2f57' }}>
                Welcome to ONESource-ai
              </h2>
              <p className="text-sm mb-6" style={{ color: '#4b6b8b' }}>
                Your AI assistant for AU/NZ construction compliance and standards. 
                Ask about building codes, design requirements, or best practices.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setInputMessage("What are the fire safety requirements for high-rise buildings in Australia?")}>
                  <CardContent className="p-0">
                    <p className="text-sm font-medium" style={{ color: '#0f2f57' }}>Fire Safety Standards</p>
                    <p className="text-xs mt-1" style={{ color: '#95a6b7' }}>Requirements for high-rise buildings</p>
                  </CardContent>
                </Card>
                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setInputMessage("What are the structural requirements for earthquake-resistant construction in New Zealand?")}>
                  <CardContent className="p-0">
                    <p className="text-sm font-medium" style={{ color: '#0f2f57' }}>Seismic Design</p>
                    <p className="text-xs mt-1" style={{ color: '#95a6b7' }}>Earthquake-resistant construction</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <div key={message.id} className="group">
                  <div className={`px-6 py-6 ${message.type === 'ai' ? 'bg-gray-50' : 'bg-white'}`}>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        {message.type === 'ai' ? (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0f2f57' }}>
                            <Bot className="h-4 w-4" style={{ color: '#f8fafc' }} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4b6b8b' }}>
                            <User className="h-4 w-4" style={{ color: '#f8fafc' }} />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {message.type === 'user' ? (
                          <div className="prose max-w-none">
                            <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* AI Response Content - ULTRA-TIGHT spacing like Emergent */}
                            <div className="prose max-w-none">
                              <div 
                                className="text-gray-800 text-sm"
                                style={{ 
                                  lineHeight: '1.3',
                                  marginBottom: '0px',
                                  paddingBottom: '0px'
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: formatAIResponse(message.content)
                                }}
                              />
                            </div>

                            {/* Booster Badge */}
                            {message.isBooster && (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                <Zap className="h-3 w-3 mr-1" />
                                Enhanced Response
                              </Badge>
                            )}

                            {/* Sources */}
                            {message.sources && message.sources.length > 0 && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                                <h4 className="text-sm font-medium text-blue-800 mb-2">Sources:</h4>
                                <ul className="text-sm text-blue-700 space-y-1">
                                  {message.sources.slice(0, 3).map((source, index) => (
                                    <li key={index}>• {source}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Message Actions */}
                            <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(message.content)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>

                              {!message.isBooster && boosterUsage.remaining > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleBooster(message.id)}
                                  disabled={boostingMessage === message.id}
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                >
                                  {boostingMessage === message.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                  ) : (
                                    <>
                                      <Zap className="h-4 w-4 mr-1" />
                                      Boost
                                    </>
                                  )}
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFeedbackModal({ 
                                  show: true, 
                                  messageId: message.id, 
                                  type: 'positive' 
                                })}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFeedbackModal({ 
                                  show: true, 
                                  messageId: message.id, 
                                  type: 'negative' 
                                })}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowContributionBox(prev => ({
                                  ...prev,
                                  [message.id]: !prev[message.id]
                                }))}
                                className="text-onesource-dark hover:text-onesource-medium hover:bg-onesource-pale"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Contribution Box */}
                            {showContributionBox[message.id] && (
                              <Card className="mt-3 border border-blue-200">
                                <CardContent className="p-4">
                                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                                    Add your expertise to help improve responses
                                  </h4>
                                  <textarea
                                    className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                                    rows={3}
                                    placeholder="Share additional insights, corrections, or relevant experience..."
                                    value={contributionText[message.id] || ''}
                                    onChange={(e) => setContributionText(prev => ({
                                      ...prev,
                                      [message.id]: e.target.value
                                    }))}
                                  />
                                  <div className="flex items-center justify-between mt-2">
                                    <label className="flex items-center text-xs text-gray-600">
                                      <input
                                        type="checkbox"
                                        checked={optInCredit}
                                        onChange={(e) => setOptInCredit(e.target.checked)}
                                        className="mr-1"
                                      />
                                      Credit me for this contribution
                                    </label>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowContributionBox(prev => ({
                                          ...prev,
                                          [message.id]: false
                                        }))}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => submitContribution(message.id)}
                                        className="bg-onesource-dark hover:bg-onesource-medium text-white"
                                      >
                                        Submit
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading State */}
              {loading && (
                <div className="px-6 py-6 bg-gray-50">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <img 
                        src="/onesource-icon.png" 
                        alt="ONESource-ai" 
                        className="h-8 w-8 animate-pulse"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: '#0f2f57' }}></div>
                      <span className="text-sm" style={{ color: '#4b6b8b' }}>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 bg-white p-6">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            {/* Knowledge Enhanced Toggle */}
            <div className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                id="knowledge-enhanced"
                checked={useKnowledgeEnhanced}
                onChange={(e) => setUseKnowledgeEnhanced(e.target.checked)}
                className="rounded"
              />
              <label 
                htmlFor="knowledge-enhanced" 
                className="text-xs text-gray-600 cursor-pointer hover:text-gray-800"
                title="Use your uploaded documents for enhanced responses"
              >
                📚 Enhanced
              </label>
            </div>

            {/* Message Input */}
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about building codes, standards, or construction best practices..."
                disabled={loading || (subscriptionStatus?.is_trial && trialInfo?.questions_remaining <= 0)}
                className="pr-12 py-3 resize-none"
                style={{ minHeight: '48px' }}
              />
              
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading || (subscriptionStatus?.is_trial && trialInfo?.questions_remaining <= 0)}
                size="sm"
                className="absolute right-2 top-2 bg-onesource-dark hover:bg-onesource-medium text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Trial Warning */}
          {subscriptionStatus?.is_trial && trialInfo?.questions_remaining <= 1 && (
            <Alert className="mt-3 max-w-4xl mx-auto border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                {trialInfo.questions_remaining === 0 
                  ? 'You have used all your free questions. '
                  : `You have ${trialInfo.questions_remaining} free question remaining. `
                }
                <a href="/pricing" className="underline font-medium">Upgrade now</a> to continue getting expert construction guidance.
              </AlertDescription>
            </Alert>
          )}

          {/* Copy Success Notification */}
          {copySuccess && (
            <Alert className="mt-3 max-w-4xl mx-auto border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">
                Response copied to clipboard!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                {feedbackModal.type === 'positive' ? (
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                ) : (
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                )}
                {feedbackModal.type === 'positive' ? 'Positive' : 'Negative'} Feedback
              </div>
            </div>
            <CardContent className="space-y-4">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows={4}
                placeholder={`Tell us what was ${feedbackModal.type === 'positive' ? 'helpful' : 'wrong or unhelpful'} about this response...`}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFeedbackModal({ show: false, messageId: null, type: null });
                    setFeedbackText('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitFeedback}
                  className="bg-onesource-dark hover:bg-onesource-medium text-white"
                >
                  Submit Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;