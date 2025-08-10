import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiEndpoints, setAuthToken } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  AlertTriangle, Send, User, Bot, Clock, Crown, Zap, LogOut, 
  Copy, ThumbsUp, ThumbsDown, Search, Plus, MessageSquare,
  Edit3, Save, X
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

  const handleCopyMessage = (messageContent) => {
    let textToCopy = '';
    if (typeof messageContent === 'string') {
      textToCopy = messageContent;
    } else if (messageContent.technical && messageContent.mentoring) {
      textToCopy = `Technical Answer:\n${messageContent.technical}\n\nMentoring Insight:\n${messageContent.mentoring}`;
    } else {
      textToCopy = messageContent.technical || messageContent;
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleFeedback = async (messageId, feedback) => {
    setFeedbackModal({ show: true, messageId, type: feedback });
  };

  const submitFeedback = async () => {
    try {
      const feedbackData = {
        message_id: feedbackModal.messageId,
        feedback_type: feedbackModal.type,
        comment: feedbackText.trim()
      };
      
      await apiEndpoints.submitFeedback(feedbackData);
      
      // Close modal and reset
      setFeedbackModal({ show: false, messageId: null, type: null });
      setFeedbackText('');
      
      // Show success message
      alert('Thank you for your feedback! This helps us improve our responses.');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    }
  };

  const handleContribution = async (messageId) => {
    const contribution = contributionText[messageId];
    if (!contribution || !contribution.trim()) return;

    try {
      const contributionData = {
        message_id: messageId,
        contribution: contribution.trim(),
        opt_in_credit: optInCredit
      };

      await apiEndpoints.submitContribution(contributionData);
      
      // Hide contribution box and clear text
      setShowContributionBox(prev => ({ ...prev, [messageId]: false }));
      setContributionText(prev => ({ ...prev, [messageId]: '' }));
      
      // Show success message
      alert('Thank you for your contribution! It will be reviewed and may be added to our knowledge base.');
    } catch (error) {
      console.error('Error submitting contribution:', error);
      alert('Error submitting contribution. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

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
      const response = useKnowledgeEnhanced 
        ? await apiEndpoints.askEnhancedQuestion({
            question: inputMessage,
            session_id: sessionId
          })
        : await apiEndpoints.askQuestion({
            question: inputMessage,
            session_id: sessionId
          });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response,
        sessionId: response.data.session_id,
        tokensUsed: response.data.tokens_used,
        timestamp: new Date().toISOString(),
        enhanced: useKnowledgeEnhanced,
        knowledgeEnhanced: response.data.knowledge_enhanced || false,
        supplierContentUsed: response.data.supplier_content_used || false,
        knowledgeSources: response.data.knowledge_sources || 0
      };

      setMessages(prev => [...prev, aiMessage]);
      setSessionId(response.data.session_id);
      
      if (response.data.trial_info) {
        setTrialInfo(response.data.trial_info);
      }
      
      // Refresh subscription status after each question
      loadSubscriptionStatus();

    } catch (error) {
      console.error('Error asking question:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.response?.status === 402) {
        // Trial limit exceeded
        const errorData = error.response.data.detail;
        errorMessage = typeof errorData === 'string' ? errorData : errorData.message;
        setTrialInfo({
          subscription_required: true,
          message: errorMessage
        });
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.detail || 'Invalid question. Please ask about AU/NZ construction industry topics.';
      }

      const errorAiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: { technical: errorMessage, mentoring: '', format: 'single' },
        error: true,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderAiResponse = (content) => {
    if (typeof content === 'string') {
      return <div className="prose prose-sm max-w-none" style={{ color: '#0f2f57' }}>{content}</div>;
    }

    if (content.format === 'dual' && content.technical && content.mentoring) {
      return (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🛠️</span>
              <h4 className="font-semibold" style={{ color: '#0f2f57' }}>Technical Answer</h4>
            </div>
            <div className="prose prose-sm max-w-none p-3 rounded-lg" style={{ backgroundColor: '#c9d6e4', color: '#0f2f57' }}>
              {content.technical}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🧐</span>
              <h4 className="font-semibold" style={{ color: '#4b6b8b' }}>Mentoring Insight</h4>
            </div>
            <div className="prose prose-sm max-w-none p-3 rounded-lg" style={{ backgroundColor: '#c9d6e4', color: '#4b6b8b' }}>
              {content.mentoring}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none" style={{ color: '#0f2f57' }}>
        {content.technical || content}
      </div>
    );
  };

  const MessageActions = ({ messageId, content }) => (
    <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleCopyMessage(content)}
        className="h-8 px-2 hover:bg-gray-100"
        title="Copy response"
      >
        <Copy className="h-3 w-3" />
        {copySuccess && <span className="ml-1 text-xs text-green-600">Copied!</span>}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleFeedback(messageId, 'positive')}
        className="h-8 px-2 hover:bg-gray-100"
        title="Good response"
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleFeedback(messageId, 'negative')}
        className="h-8 px-2 hover:bg-gray-100"
        title="Poor response"
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowContributionBox(prev => ({ ...prev, [messageId]: !prev[messageId] }))}
        className="h-8 px-2 hover:bg-gray-100"
        style={{ color: '#4b6b8b' }}
        title="Add your knowledge"
      >
        <Edit3 className="h-3 w-3" />
        <span className="ml-1 text-xs">Add Knowledge</span>
      </Button>
    </div>
  );

  const FeedbackModal = () => {
    if (!feedbackModal.show) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4" style={{ backgroundColor: '#f8fafc' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg" style={{ color: '#0f2f57' }}>
              {feedbackModal.type === 'positive' ? '👍 Great Response!' : '👎 Response Feedback'}
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setFeedbackModal({ show: false, messageId: null, type: null })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm mb-4" style={{ color: '#4b6b8b' }}>
            {feedbackModal.type === 'positive' 
              ? 'Tell us what made this response helpful:'
              : 'Help us improve by sharing what was wrong or missing:'
            }
          </p>
          
          <textarea
            className="w-full p-3 rounded border resize-none"
            style={{ borderColor: '#95a6b7', minHeight: '100px' }}
            placeholder={feedbackModal.type === 'positive' 
              ? 'What was particularly helpful about this response?'
              : 'What was incorrect, missing, or could be improved?'
            }
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
          
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFeedbackModal({ show: false, messageId: null, type: null })}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={submitFeedback}
              style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const ContributionBox = ({ messageId }) => (
    <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '2px solid #c9d6e4' }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm" style={{ color: '#0f2f57' }}>
          💡 Share Your Knowledge
        </h4>
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
        className="w-full p-3 rounded border resize-none"
        style={{ borderColor: '#95a6b7', minHeight: '80px' }}
        placeholder="Share your insights, best practices, or lessons learned..."
        value={contributionText[messageId] || ''}
        onChange={(e) => setContributionText(prev => ({ ...prev, [messageId]: e.target.value }))}
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

  return (
    <div className="h-screen flex" style={{ backgroundColor: '#f8fafc' }}>
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
        
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-semibold text-sm mb-3" style={{ color: '#4b6b8b' }}>Recent Conversations</h3>
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.session_id}
                className="p-3 rounded-lg cursor-pointer hover:bg-opacity-50 transition-colors"
                style={{ backgroundColor: '#c9d6e4' }}
                onClick={() => {
                  // TODO: Load specific chat session
                  console.log('Loading chat session:', chat.session_id);
                }}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#4b6b8b' }} />
                  <div>
                    <p className="font-medium text-sm line-clamp-2" style={{ color: '#0f2f57' }}>
                      {chat.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#95a6b7' }}>
                      {new Date(chat.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Knowledge Vault Section */}
        <div className="p-4 border-t" style={{ borderColor: '#c9d6e4' }}>
          <h3 className="font-semibold text-sm mb-3" style={{ color: '#4b6b8b' }}>Knowledge Vault</h3>
          
          {/* Knowledge Enhanced Toggle */}
          <div className="flex items-center justify-between mb-3 p-2 rounded-lg" style={{ backgroundColor: useKnowledgeEnhanced ? '#f0fdf4' : '#f8fafc', border: '1px solid #c9d6e4' }}>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="knowledge-enhanced"
                checked={useKnowledgeEnhanced}
                onChange={(e) => setUseKnowledgeEnhanced(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="knowledge-enhanced" className="text-sm font-medium cursor-pointer" style={{ color: '#0f2f57' }}>
                Knowledge Enhanced
              </label>
            </div>
            {useKnowledgeEnhanced && (
              <Badge variant="default" className="text-xs bg-green-600">
                ON
              </Badge>
            )}
          </div>
          
          <p className="text-xs mb-3" style={{ color: '#95a6b7' }}>
            {useKnowledgeEnhanced 
              ? "Using your uploaded documents and mentor notes for enhanced responses" 
              : "Standard AI responses only"
            }
          </p>
          
          {/* Knowledge Vault Link */}
          <Button
            onClick={() => window.open('/knowledge', '_blank')}
            variant="outline"
            size="sm"
            className="w-full justify-start"
            style={{ borderColor: '#c9d6e4' }}
          >
            <Search className="h-4 w-4 mr-2" />
            Manage Knowledge Vault
          </Button>
        </div>
        
        {/* User Info */}
        <div className="p-4 border-t" style={{ borderColor: '#c9d6e4' }}>
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" style={{ borderColor: '#95a6b7', color: '#4b6b8b' }}>
                  {user.email}
                </Badge>
                {subscriptionStatus && (
                  <Badge 
                    variant={subscriptionStatus.subscription_active ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {subscriptionStatus.subscription_active ? (
                      <>
                        <Crown className="h-3 w-3" />
                        {subscriptionStatus.subscription_tier.charAt(0).toUpperCase() + subscriptionStatus.subscription_tier.slice(1)}
                      </>
                    ) : (
                      <>
                        <Zap className="h-3 w-3" />
                        Daily ({Math.max(0, 3 - (subscriptionStatus.daily_questions_used || 0))}/3)
                      </>
                    )}
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={logout}
                className="h-8"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#c9d6e4' }}>
          <div className="flex items-center">
            <img 
              src="/onesource-logo.png" 
              alt="ONESource-ai" 
              className="h-8 w-auto mr-3"
            />
            <div>
              <h1 className="text-lg font-semibold" style={{ color: '#0f2f57' }}>Construction Compliance Chat</h1>
              <p className="text-sm" style={{ color: '#95a6b7' }}>AI-powered design compliance assistance</p>
            </div>
          </div>
        </header>

        {/* Trial Warning */}
        {trialInfo && (
          <Alert className={`mx-6 mt-4 ${trialInfo.subscription_required ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className={trialInfo.subscription_required ? "text-red-700" : "text-blue-700"}>
                {trialInfo.message}
              </span>
              <Button 
                size="sm" 
                onClick={() => window.location.href = '/pricing'}
                className={trialInfo.subscription_required ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {trialInfo.subscription_required ? 'Upgrade Now' : 'View Plans'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-2xl mx-auto p-8">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                  <img 
                    src="/onesource-logo.png" 
                    alt="ONESource-ai" 
                    className="h-20 w-auto"
                  />
                </div>
                
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#0f2f57' }}>
                  Welcome to ONESource-ai
                </h2>
                <p className="text-lg mb-6" style={{ color: '#4b6b8b' }}>
                  Your Digital Design Compliance Partner for AU/NZ Construction
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="text-left p-4 h-auto"
                    onClick={() => setInputMessage("What are the minimum ceiling heights for residential buildings in Australia?")}
                    style={{ borderColor: '#c9d6e4' }}
                  >
                    <div>
                      <div className="font-medium" style={{ color: '#0f2f57' }}>Building Height Requirements</div>
                      <div className="text-sm mt-1" style={{ color: '#95a6b7' }}>Minimum ceiling heights for residential</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-left p-4 h-auto"
                    onClick={() => setInputMessage("How do I calculate stormwater drainage for a commercial project?")}
                    style={{ borderColor: '#c9d6e4' }}
                  >
                    <div>
                      <div className="font-medium" style={{ color: '#0f2f57' }}>Drainage Calculations</div>
                      <div className="text-sm mt-1" style={{ color: '#95a6b7' }}>Stormwater for commercial projects</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-left p-4 h-auto"
                    onClick={() => setInputMessage("What fire rating is required for steel structures?")}
                    style={{ borderColor: '#c9d6e4' }}
                  >
                    <div>
                      <div className="font-medium" style={{ color: '#0f2f57' }}>Fire Safety Requirements</div>
                      <div className="text-sm mt-1" style={{ color: '#95a6b7' }}>Fire ratings for steel structures</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-left p-4 h-auto"
                    onClick={() => setInputMessage("Explain the difference between NCC and BCA")}
                    style={{ borderColor: '#c9d6e4' }}
                  >
                    <div>
                      <div className="font-medium" style={{ color: '#0f2f57' }}>Building Codes</div>
                      <div className="text-sm mt-1" style={{ color: '#95a6b7' }}>NCC vs BCA differences</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
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
                              <p style={{ color: '#0f2f57' }}>{message.content}</p>
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
                                    Supplier Content
                                  </Badge>
                                )}
                              </div>
                            )}
                            {renderAiResponse(message.content)}
                            <MessageActions messageId={message.id} content={message.content} />
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