import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiEndpoints, setAuthToken } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AlertTriangle, Send, User, Bot, Clock, Crown, Zap, LogOut } from 'lucide-react';

const ChatInterface = () => {
  const { user, idToken, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [trialInfo, setTrialInfo] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
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
        const remaining = Math.max(0, 3 - response.data.trial_questions_used);
        setTrialInfo({
          remaining_questions: remaining,
          message: remaining > 0 
            ? `You have ${remaining} free questions remaining`
            : 'Trial limit reached - upgrade to continue asking questions',
          subscription_required: remaining === 0
        });
      }
    } catch (error) {
      console.error('Error loading subscription status:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await apiEndpoints.askQuestion({
        question: inputMessage,
        session_id: sessionId
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response,
        sessionId: response.data.session_id,
        tokensUsed: response.data.tokens_used,
        timestamp: new Date().toISOString()
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
      return <div className="prose prose-sm max-w-none">{content}</div>;
    }

    if (content.format === 'dual' && content.technical && content.mentoring) {
      return (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🛠️</span>
              <h4 className="font-semibold text-blue-700">Technical Answer</h4>
            </div>
            <div className="prose prose-sm max-w-none bg-blue-50 p-3 rounded-lg">
              {content.technical}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🧐</span>
              <h4 className="font-semibold text-green-700">Mentoring Insight</h4>
            </div>
            <div className="prose prose-sm max-w-none bg-green-50 p-3 rounded-lg">
              {content.mentoring}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none">
        {content.technical || content}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-900">ONESource-ai</h2>
              <p className="text-sm text-gray-600 mt-1">
                Your AI mentor for AU/NZ Construction Industry
              </p>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <>
                  <Badge variant="outline" className="ml-4">
                    {user.email}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      const confirmLogout = window.confirm(
                        '🔒 Are you sure you want to log out?\n\n' +
                        '✅ Your profile and subscription will be saved\n' +
                        '⚠️ Current chat session will be lost\n' +
                        '💡 Tip: Complete any important conversations before logging out'
                      );
                      
                      if (confirmLogout) {
                        await logout();
                        window.location.href = '/';
                      }
                    }}
                    className="text-gray-600 hover:text-red-600"
                    title="Logout - Your data will be preserved"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              )}
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
                      Trial ({Math.max(0, 3 - subscriptionStatus.trial_questions_used)}/3)
                    </>
                  )}
                </Badge>
              )}
            </div>
          </CardTitle>
          
          {/* Trial Warning and Upgrade Prompt */}
          {trialInfo && (
            <Alert className={trialInfo.subscription_required ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span className={trialInfo.subscription_required ? "text-red-700" : "text-blue-700"}>
                  {trialInfo.message}
                </span>
                <div className="flex gap-2 ml-4">
                  <Button 
                    size="sm" 
                    onClick={() => window.location.href = '/pricing'}
                    className={trialInfo.subscription_required ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    {trialInfo.subscription_required ? 'Upgrade Now' : 'View Plans'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Upgrade Banner for Trial Users */}
          {subscriptionStatus && !subscriptionStatus.subscription_active && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">🚀 Unlock Full Construction Expertise</h3>
                  <p className="text-sm opacity-90">
                    Get unlimited questions, priority responses, and advanced features
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => window.location.href = '/pricing'}
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    From $4.90/month
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Welcome to ONESource-ai!</p>
                <p className="text-sm">
                  Ask me anything about AU/NZ construction standards, building codes, 
                  engineering practices, and more.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setInputMessage("What are the minimum ceiling heights for residential buildings in Australia?")}
                  >
                    Building height requirements
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setInputMessage("How do I calculate stormwater drainage for a commercial project?")}
                  >
                    Drainage calculations
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setInputMessage("What fire rating is required for steel structures?")}
                  >
                    Fire safety requirements
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setInputMessage("Explain the difference between NCC and BCA")}
                  >
                    Building codes explained
                  </Button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'ai' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white ml-auto' 
                      : message.error 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-gray-50 border'
                  }`}>
                    {message.type === 'user' ? (
                      <p>{message.content}</p>
                    ) : (
                      renderAiResponse(message.content)
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {new Date(message.timestamp).toLocaleTimeString()}
                    {message.tokensUsed && (
                      <span>• {message.tokensUsed} tokens</span>
                    )}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="bg-gray-50 border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about AU/NZ construction standards, codes, or practices..."
              disabled={loading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={loading || !inputMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-xs text-gray-500 mt-2 text-center">
            👀 Was this answer unclear or incorrect? Please provide feedback.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;