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
  Edit3, Save, X, Sparkles, TrendingUp, Star, Settings
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

  useEffect(() => {
    if (idToken) {
      setAuthToken(idToken);
      loadSubscriptionStatus();
      loadChatHistory();
      loadBoosterStatus();
      checkOnboardingStatus();
    }
  }, [idToken]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSubscriptionStatus = async () => {
    try {
      const response = await apiEndpoints.getSubscriptionStatus();
      setSubscriptionStatus(response.data);
      
      // Set trial info based on subscription status
      if (response.data.subscription_tier === 'starter' && !response.data.subscription_active) {
        const remaining = Math.max(0, 3 - (response.data.daily_questions_used || 0));
        setTrialInfo({
          remaining_questions: remaining,
          message: remaining > 0 
            ? `You have ${remaining} free questions remaining today`
            : 'Daily limit reached - 3 questions per day for free users. Try again tomorrow or upgrade!',
          subscription_required: remaining === 0,
          reset_time: remaining === 0 ? 'tomorrow' : null
        });
      }
    } catch (error) {
      console.error('Error loading subscription status:', error);
    }
  };

  const loadBoosterStatus = async () => {
    try {
      // Use ISO date format for reliable comparison
      const today = new Date().toISOString().split('T')[0];
      const lastBoosterDate = localStorage.getItem('lastBoosterDate');
      const used = lastBoosterDate === today;
      
      setBoosterUsage({
        used: used,
        remaining: used ? 0 : 1
      });
    } catch (error) {
      console.error('Error loading booster status:', error);
      // Default to allowing booster if there's an error
      setBoosterUsage({ used: false, remaining: 1 });
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await apiEndpoints.getChatHistory(20);
      setChatHistory(response.data.chat_history);
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Fallback to mock data
      setChatHistory([
        { session_id: 1, title: "Building Height Requirements", timestamp: new Date().toISOString() },
        { session_id: 2, title: "Fire Safety Compliance", timestamp: new Date().toISOString() },
        { session_id: 3, title: "Structural Engineering Query", timestamp: new Date().toISOString() }
      ]);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setShowContributionBox({});
    setContributionText({});
  };

  const handleChatLoad = async (sessionId) => {
    try {
      const response = await apiEndpoints.getChatSession(sessionId);
      setSessionId(sessionId);
      
      const formattedMessages = response.data.messages.map(msg => ({
        id: msg.id || Date.now(),
        type: msg.sender === 'user' ? 'user' : 'ai',
        content: msg.message,
        timestamp: msg.timestamp,
        enhanced: msg.enhanced || false
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat session:', error);
    }
  };

  const getNextTierInfo = (currentTier) => {
    const tierHierarchy = {
      'starter': { next: 'pro', nextName: 'Pro' },
      'pro': { next: 'pro_plus', nextName: 'Pro-Plus' },
      'pro_plus': { next: null, nextName: null }
    };
    
    return tierHierarchy[currentTier] || { next: 'pro', nextName: 'Pro' };
  };

  const handleBoostMessage = async (messageId) => {
    if (boosterUsage.remaining === 0) {
      alert('You\'ve used your daily booster! Come back tomorrow for another preview.');
      return;
    }

    const message = messages.find(m => m.id === messageId);
    if (!message || message.type !== 'ai') return;

    const currentTier = subscriptionStatus?.subscription_tier || 'starter';
    const nextTierInfo = getNextTierInfo(currentTier);
    
    if (!nextTierInfo.next) {
      alert('You\'re already on the highest tier! No upgrades available.');
      return;
    }

    setBoostingMessage(messageId);

    try {
      // Find the corresponding user question for this AI response
      const messageIndex = messages.findIndex(m => m.id === messageId);
      const userMessage = messages.slice(0, messageIndex).reverse().find(m => m.type === 'user');
      
      if (!userMessage) {
        alert('Could not find the original question for this response.');
        setBoostingMessage(null);
        return;
      }

      const response = await apiEndpoints.boostResponse({
        question: userMessage.content,
        current_tier: currentTier,
        target_tier: nextTierInfo.next,
        message_id: messageId
      });

      const data = response.data;

      // Update the message with boosted response
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            content: data.boosted_response,
            boosted: true,
            originalContent: message.content,
            boostTier: nextTierInfo.nextName,
            isBoostPreview: true
          };
        }
        return msg;
      }));

      // Mark booster as used
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('lastBoosterDate', today);
      setBoosterUsage({ used: true, remaining: 0 });

    } catch (error) {
      console.error('Error boosting message:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to boost response';
      alert(`Booster Error: ${errorMessage}`);
    } finally {
      setBoostingMessage(null);
    }
  };

  const handleRestoreOriginal = (messageId) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.boosted && msg.originalContent) {
        return {
          ...msg,
          content: msg.originalContent,
          boosted: false,
          originalContent: undefined,
          boostTier: undefined,
          isBoostPreview: false
        };
      }
      return msg;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || loading) return;

    // Check trial limits
    if (trialInfo?.subscription_required) {
      alert(trialInfo.message);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      enhanced: useKnowledgeEnhanced
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const apiCall = useKnowledgeEnhanced 
        ? apiEndpoints.askEnhancedQuestion({ question: inputMessage, session_id: sessionId })
        : apiEndpoints.askQuestion({ question: inputMessage, session_id: sessionId });

      const response = await apiCall;
      const data = response.data;

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response || data.ai_response,
        timestamp: new Date().toISOString(),
        tokensUsed: data.tokens_used,
        knowledgeEnhanced: useKnowledgeEnhanced,
        knowledgeSources: data.knowledge_sources || 0,
        supplierContentUsed: data.supplier_content_used || false
      };

      setMessages(prev => [...prev, aiMessage]);
      setSessionId(data.session_id);
      
      // Refresh subscription status after question
      loadSubscriptionStatus();
    } catch (error) {
      console.error('Error:', error);
      
      const errorAiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I apologize, but I encountered an error while processing your question. Please try again or contact support if the issue persists.',
        error: true,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced AI Response Renderer with proper formatting
  const renderAiResponse = (content, isBoostPreview = false, boostTier = null) => {
    const formatText = (text) => {
      if (!text) return text;
      
      // Convert markdown-style formatting to HTML
      return text
        // Bold text **text**
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic text *text*
        .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
        // Headers ### text
        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-gray-900 mt-5 mb-3">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h1>')
        // Bullet points with proper indentation
        .replace(/^[•·-]\s*(.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
        // Numbered lists
        .replace(/^\d+\.\s*(.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
        // Checkmarks and emojis
        .replace(/✅/g, '<span class="text-green-600">✅</span>')
        .replace(/❌/g, '<span class="text-red-600">❌</span>')
        .replace(/⚠️/g, '<span class="text-yellow-600">⚠️</span>')
        .replace(/🏗️/g, '<span class="text-blue-600">🏗️</span>')
        .replace(/📋/g, '<span class="text-gray-600">📋</span>')
        .replace(/🔧/g, '<span class="text-orange-600">🔧</span>')
        // Line breaks
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
    };

    const wrapLists = (text) => {
      // Wrap consecutive <li> elements in <ul> tags
      return text.replace(/(<li[^>]*>.*?<\/li>(?:\s*<li[^>]*>.*?<\/li>)*)/gs, '<ul class="list-disc list-inside space-y-1 my-3">$1</ul>');
    };

    if (typeof content === 'string') {
      const formattedContent = wrapLists(formatText(content));
      return (
        <div 
          className={`prose prose-sm max-w-none ${isBoostPreview ? 'border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg' : ''}`}
          style={{ color: '#0f2f57' }}
        >
          {isBoostPreview && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-100 rounded-lg">
              <Sparkles className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-800">
                🚀 This is how your response would look with {boostTier} plan!
              </span>
            </div>
          )}
          <div 
            dangerouslySetInnerHTML={{ __html: formattedContent }}
            className="formatted-response"
          />
        </div>
      );
    }

    if (content.format === 'dual' && content.technical && content.mentoring) {
      return (
        <div className={`space-y-4 ${isBoostPreview ? 'border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg' : ''}`}>
          {isBoostPreview && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-100 rounded-lg">
              <Sparkles className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-800">
                🚀 This is how your response would look with {boostTier} plan!
              </span>
            </div>
          )}
          
          {/* Technical Answer Card */}
          <div className="bg-white border-l-4 border-blue-500 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🛠️</span>
              </div>
              <h4 className="font-bold text-xl text-blue-900">Technical Answer</h4>
            </div>
            <div 
              className="prose prose-base max-w-none leading-relaxed text-gray-800"
              dangerouslySetInnerHTML={{ __html: wrapLists(formatText(content.technical)) }}
            />
          </div>
          
          {/* Mentoring Insight Card */}
          <div className="bg-white border-l-4 border-green-500 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🧠</span>
              </div>
              <h4 className="font-bold text-xl text-green-900">Mentoring Insight</h4>
            </div>
            <div 
              className="prose prose-base max-w-none leading-relaxed text-gray-700"
              dangerouslySetInnerHTML={{ __html: wrapLists(formatText(content.mentoring)) }}
            />
          </div>
        </div>
      );
    }

    const formattedContent = wrapLists(formatText(content.technical || content));
    return (
      <div 
        className={`prose prose-sm max-w-none ${isBoostPreview ? 'border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg' : ''}`}
        style={{ color: '#0f2f57' }}
      >
        {isBoostPreview && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-100 rounded-lg">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-800">
              🚀 This is how your response would look with {boostTier} plan!
            </span>
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
      </div>
    );
  };

  const MessageActions = ({ messageId, content, message }) => {
    const currentTier = subscriptionStatus?.subscription_tier || 'starter';
    const nextTierInfo = getNextTierInfo(currentTier);
    const canBoost = nextTierInfo.next && boosterUsage.remaining > 0 && !message.boosted;
    const isBoosted = message.boosted;
    const isLoading = boostingMessage === messageId;

    return (
      <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleCopyMessage(content)}
          className="h-8 px-2 hover:bg-gray-100"
          title="Copy response"
        >
          <Copy className="h-3 w-3" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setFeedbackModal({ show: true, messageId, type: 'positive' })}
          className="h-8 px-2 hover:bg-green-50"
          title="Good response"
        >
          <ThumbsUp className="h-3 w-3" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setFeedbackModal({ show: true, messageId, type: 'negative' })}
          className="h-8 px-2 hover:bg-red-50"
          title="Poor response"
        >
          <ThumbsDown className="h-3 w-3" />
        </Button>

        {isBoosted ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRestoreOriginal(messageId)}
            className="h-8 px-2 hover:bg-blue-50 text-blue-600"
            title="Restore original response"
          >
            <X className="h-3 w-3 mr-1" />
            <span className="text-xs">Restore Original</span>
          </Button>
        ) : canBoost && (
          <div className="relative group">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleBoostMessage(messageId)}
              disabled={isLoading}
              className="h-8 px-3 hover:bg-yellow-50 text-yellow-700 border border-yellow-300 transition-all duration-200"
              title={`🚀 Preview how this answer would look with ${nextTierInfo.nextName} plan! Get enhanced formatting, detailed analysis, and professional insights. (${boosterUsage.remaining}/1 daily preview remaining)`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>
              ) : (
                <Sparkles className="h-3 w-3 mr-1" />
              )}
              <span className="text-xs font-semibold">Booster ({boosterUsage.remaining}/1)</span>
            </Button>
            
            {/* Enhanced Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
              <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                🚀 Preview {nextTierInfo.nextName} response quality
                <div className="text-xs text-gray-300 mt-1">
                  See enhanced formatting & detailed analysis
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowContributionBox(prev => ({ ...prev, [messageId]: !prev[messageId] }))}
          className="h-8 px-2 hover:bg-blue-50"
          title="Add knowledge"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  const handleCopyMessage = (content) => {
    const textContent = typeof content === 'string' 
      ? content 
      : content.technical && content.mentoring 
        ? `Technical Answer:\n${content.technical}\n\nMentoring Insight:\n${content.mentoring}`
        : content.technical || content;
        
    navigator.clipboard.writeText(textContent);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleContribution = async (messageId) => {
    const contribution = contributionText[messageId]?.trim();
    if (!contribution) return;

    try {
      const response = await apiEndpoints.submitKnowledgeContribution({
        message_id: messageId,
        contribution_text: contribution,
        opt_in_credit: optInCredit
      });

      if (response.status === 200) {
        alert('Thank you! Your contribution has been submitted for review.');
        setShowContributionBox(prev => ({ ...prev, [messageId]: false }));
        setContributionText(prev => ({ ...prev, [messageId]: '' }));
      }
    } catch (error) {
      console.error('Error submitting contribution:', error);
      alert('Failed to submit contribution. Please try again.');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;

    try {
      const response = await apiEndpoints.submitChatFeedback({
        message_id: feedbackModal.messageId,
        feedback_type: feedbackModal.type,
        comment: feedbackText
      });

      if (response.status === 200) {
        alert('Thank you for your feedback!');
        setFeedbackModal({ show: false, messageId: null, type: null });
        setFeedbackText('');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const FeedbackModal = () => (
    feedbackModal.show && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Feedback</h3>
            <p className="text-sm text-gray-600 mb-4">
              Help us improve by sharing your thoughts on this response.
            </p>
            <textarea
              className="w-full p-3 border rounded-lg resize-none"
              rows={4}
              placeholder="What did you think about this response?"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFeedbackModal({ show: false, messageId: null, type: null });
                  setFeedbackText('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleFeedbackSubmit}>
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  );

  const ContributionBox = ({ messageId }) => {
    // Use useRef to maintain cursor position
    const textareaRef = useRef(null);
    
    const handleTextChange = (e) => {
      const cursorPosition = e.target.selectionStart;
      setContributionText(prev => ({ ...prev, [messageId]: e.target.value }));
      
      // Restore cursor position after state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    };

    return (
      <div className="mt-4 p-4 border rounded-lg" style={{ backgroundColor: '#f8fafc', borderColor: '#c9d6e4' }}>
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-semibold text-sm" style={{ color: '#0f2f57' }}>Add Knowledge</h5>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowContributionBox(prev => ({ ...prev, [messageId]: false }))}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs mb-3" style={{ color: '#4b6b8b' }}>
          Add your mentoring insights, best practices, or lessons learned to help other construction professionals.
        </p>
        <textarea
          ref={textareaRef}
          className="w-full p-3 rounded border resize-none"
          style={{ borderColor: '#95a6b7', minHeight: '80px' }}
          placeholder="Share your insights, best practices, or lessons learned..."
          value={contributionText[messageId] || ''}
          onChange={handleTextChange}
        />
        <div className="flex items-center justify-between mt-3">
          <label className="flex items-center text-xs" style={{ color: '#4b6b8b' }}>
            <input
              type="checkbox"
              checked={optInCredit}
              onChange={(e) => setOptInCredit(e.target.checked)}
              className="mr-2"
            />
            Credit me if this contribution is added to the knowledge base
          </label>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowContributionBox(prev => ({ ...prev, [messageId]: false }))}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handleContribution(messageId)}
              style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}
            >
              <Save className="h-3 w-3 mr-1" />
              Submit
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Show UserProfile if requested
  if (showUserProfile) {
    return <UserProfile onBack={() => setShowUserProfile(false)} />;
  }

  return (
    <div className="h-screen flex" style={{ backgroundColor: '#f8fafc' }}>
      {/* CSS for enhanced formatting */}
      <style jsx>{`
        .formatted-response h1, .formatted-response h2, .formatted-response h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .formatted-response ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        .formatted-response li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        .formatted-response p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        .formatted-response strong {
          font-weight: 600;
          color: #1f2937;
        }
        .formatted-response em {
          font-style: italic;
          color: #4b5563;
        }
      `}</style>
      
      {/* Feedback Modal */}
      <FeedbackModal />
      
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col" style={{ borderColor: '#c9d6e4', backgroundColor: '#f8fafc' }}>
        {/* Sidebar Header */}
        <div className="p-4 border-b" style={{ borderColor: '#c9d6e4' }}>
          <Button
            onClick={handleNewChat}
            className="w-full justify-start mb-4"
            style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4" style={{ color: '#95a6b7' }} />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Current Plan Display */}
        <div className="p-4 border-b" style={{ borderColor: '#c9d6e4' }}>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-semibold" style={{ color: '#0f2f57' }}>Your Plan</span>
          </div>
          <div className="flex items-center justify-between">
            <Badge 
              className={`
                ${subscriptionStatus?.subscription_tier === 'starter' ? 'bg-gray-100 text-gray-800' : ''}
                ${subscriptionStatus?.subscription_tier === 'pro' ? 'bg-blue-100 text-blue-800' : ''}
                ${subscriptionStatus?.subscription_tier === 'pro_plus' ? 'bg-purple-100 text-purple-800' : ''}
              `}
            >
              {subscriptionStatus?.subscription_tier === 'starter' && '🆓 Starter'}
              {subscriptionStatus?.subscription_tier === 'pro' && '⭐ Pro'}
              {subscriptionStatus?.subscription_tier === 'pro_plus' && '👑 Pro-Plus'}
              {!subscriptionStatus?.subscription_tier && '🔄 Loading...'}
            </Badge>
            {!boosterUsage.used && (
              <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-300">
                <Sparkles className="h-3 w-3 mr-1" />
                Booster Available
              </Badge>
            )}
          </div>
        </div>
        
        {/* Knowledge Enhancement Toggle */}
        <div className="p-4 border-b" style={{ borderColor: '#c9d6e4' }}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useKnowledgeEnhanced}
              onChange={(e) => setUseKnowledgeEnhanced(e.target.checked)}
              className="rounded"
            />
            <div className="flex items-center gap-1">
              <Search className="h-3 w-3" style={{ color: '#4b6b8b' }} />
              <span className="text-sm" style={{ color: '#4b6b8b' }}>
                Search Knowledge Base
              </span>
            </div>
          </label>
          <p className="text-xs mt-1" style={{ color: '#95a6b7' }}>
            Include relevant documents in responses
          </p>
        </div>
        
        {/* Trial Info */}
        {trialInfo && (
          <div className="p-4 border-b" style={{ borderColor: '#c9d6e4' }}>
            <Alert className={trialInfo.subscription_required ? "border-red-200" : "border-blue-200"}>
              <AlertTriangle className={`h-4 w-4 ${trialInfo.subscription_required ? 'text-red-600' : 'text-blue-600'}`} />
              <AlertDescription className={`text-sm ${trialInfo.subscription_required ? 'text-red-800' : 'text-blue-800'}`}>
                {trialInfo.message}
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-semibold text-sm mb-3" style={{ color: '#4b6b8b' }}>Recent Conversations</h3>
          <div className="space-y-2">
            {chatHistory
              .filter(chat => 
                !searchTerm || 
                (chat.title && chat.title.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .map((chat) => (
              <div
                key={chat.session_id}
                className="p-3 rounded-lg cursor-pointer hover:bg-opacity-50 transition-colors"
                style={{ backgroundColor: '#c9d6e4' }}
                onClick={() => handleChatLoad(chat.session_id)}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#4b6b8b' }} />
                  <div>
                    <p className="font-medium text-sm line-clamp-2" style={{ color: '#0f2f57' }}>
                      {chat.title || 'Untitled Conversation'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#95a6b7' }}>
                      {chat.timestamp ? new Date(chat.timestamp).toLocaleDateString() : 'No date available'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {chatHistory.filter(chat => 
              !searchTerm || 
              (chat.title && chat.title.toLowerCase().includes(searchTerm.toLowerCase()))
            ).length === 0 && searchTerm && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No conversations found for "{searchTerm}"
              </div>
            )}
          </div>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-t" style={{ borderColor: '#c9d6e4' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0f2f57' }}>
              <User className="h-4 w-4" style={{ color: '#f8fafc' }} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm" style={{ color: '#0f2f57' }}>
                {user?.displayName || user?.email || 'User'}
              </p>
              <p className="text-xs" style={{ color: '#95a6b7' }}>
                {user?.email}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowUserProfile(true)}
              className="p-1"
              title="User Profile & Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={logout}
              className="p-1"
              title="Sign out"
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
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#0f2f57' }}>
                <Bot className="h-8 w-8" style={{ color: '#f8fafc' }} />
              </div>
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
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium" style={{ color: '#0f2f57' }}>{message.content}</p>
                              {message.enhanced && (
                                <Badge variant="secondary" className="text-xs">
                                  Knowledge Enhanced
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            {message.knowledgeEnhanced && (
                              <div className="mb-2 flex items-center gap-2">
                                <Badge variant="default" className="text-xs bg-green-600">
                                  Knowledge Enhanced
                                </Badge>
                                {message.knowledgeSources > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {message.knowledgeSources} sources
                                  </Badge>
                                )}
                                {message.supplierContentUsed && (
                                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                    Partner Content
                                  </Badge>
                                )}
                              </div>
                            )}
                            {message.boosted && (
                              <div className="mb-3 flex items-center gap-2">
                                <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                                  <Star className="h-3 w-3 mr-1" />
                                  Boosted to {message.boostTier}
                                </Badge>
                              </div>
                            )}
                            {renderAiResponse(message.content, message.isBoostPreview, message.boostTier)}
                            <MessageActions messageId={message.id} content={message.content} message={message} />
                            {showContributionBox[message.id] && (
                              <ContributionBox messageId={message.id} />
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: '#95a6b7' }}>
                          <Clock className="h-3 w-3" />
                          {new Date(message.timestamp).toLocaleTimeString()}
                          {message.tokensUsed && (
                            <span>• {message.tokensUsed} tokens</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="px-6 py-6 bg-gray-50">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0f2f57' }}>
                        <Bot className="h-4 w-4" style={{ color: '#f8fafc' }} />
                      </div>
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
        <div className="border-t p-4" style={{ borderColor: '#c9d6e4' }}>
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about design codes, compliance requirements, or construction standards..."
                  disabled={loading}
                  className="pr-12 py-3"
                  style={{ borderColor: '#c9d6e4' }}
                />
                <Button 
                  type="submit" 
                  disabled={loading || !inputMessage.trim()}
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <p className="text-xs mt-2 text-center" style={{ color: '#95a6b7' }}>
              ONESource-ai can make mistakes. Check important compliance requirements with official sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;