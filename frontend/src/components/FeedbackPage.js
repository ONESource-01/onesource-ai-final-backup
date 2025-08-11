import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "./PageHeader";
import ContactForm from "./ContactForm";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  MessageSquare, ThumbsUp, ThumbsDown, Lightbulb, Bug, 
  ArrowRight, Star, Zap, Users, Target, TrendingUp
} from 'lucide-react';

const FeedbackPage = () => {
  const { user } = useAuth();
  const [selectedFeedbackType, setSelectedFeedbackType] = useState(null);

  useEffect(() => {
    document.title = 'Send Feedback | ONESource-ai';
  }, []);

  const feedbackTypes = [
    {
      id: 'general',
      title: 'General Feedback',
      icon: MessageSquare,
      description: 'Share your overall experience, thoughts, or suggestions about ONESource-ai',
      color: 'blue',
      examples: ['User interface improvements', 'Feature requests', 'Overall experience']
    },
    {
      id: 'bug',
      title: 'Report a Bug',
      icon: Bug,
      description: 'Report technical issues, errors, or unexpected behavior',
      color: 'red',
      examples: ['Login problems', 'Chat interface errors', 'Document upload issues']
    },
    {
      id: 'feature',
      title: 'Feature Request',
      icon: Lightbulb,
      description: 'Suggest new features or improvements to existing functionality',
      color: 'yellow',
      examples: ['New AI capabilities', 'Integration requests', 'Workflow improvements']
    },
    {
      id: 'content',
      title: 'Content Feedback',
      icon: Target,
      description: 'Feedback about AI responses, knowledge accuracy, or content quality',
      color: 'green',
      examples: ['AI response accuracy', 'Missing knowledge areas', 'Content suggestions']
    }
  ];

  const recentImprovements = [
    {
      title: 'Smart Auto-Complete Onboarding',
      description: 'Enhanced user setup with intelligent search and selection',
      badge: 'New'
    },
    {
      title: 'Updated Logo and Branding',
      description: 'Professional visual identity across the platform',
      badge: 'Updated'
    },
    {
      title: 'Comprehensive Help Center',
      description: 'Expanded FAQ and system information',
      badge: 'Enhanced'
    },
    {
      title: 'Knowledge Vault Search',
      description: 'Improved search functionality for documents',
      badge: 'Fixed'
    }
  ];

  if (selectedFeedbackType) {
    return (
      <>
        <PageHeader 
          title="Send Feedback" 
          subtitle="Help us improve ONESource-ai with your valuable feedback"
        />
        
        <div className="max-w-7xl mx-auto p-6" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
          {/* Back Button */}
          <div className="mb-6">
            <Button
              onClick={() => setSelectedFeedbackType(null)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Feedback Options
            </Button>
          </div>

          {/* Feedback Form */}
          <div className="flex justify-center">
            <ContactForm 
              type="feedback"
              onClose={() => setSelectedFeedbackType(null)}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader 
        title="Send Feedback" 
        subtitle="Help us improve ONESource-ai with your valuable feedback"
      />
      
      <div className="max-w-7xl mx-auto p-6" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
        
        {/* Back to Chat Button */}
        <div className="mb-6">
          <Button
            onClick={() => window.location.href = '/chat'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Chat
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Feedback Types */}
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#0f2f57' }}>
                What type of feedback would you like to share?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {feedbackTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Card 
                      key={type.id}
                      className={`hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-${type.color}-200`}
                      onClick={() => setSelectedFeedbackType(type.id)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${type.color}-100`}>
                            <IconComponent className={`h-5 w-5 text-${type.color}-600`} />
                          </div>
                          <span style={{ color: '#0f2f57' }}>{type.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{type.description}</p>
                        
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 mb-2">Examples:</p>
                          <div className="flex flex-wrap gap-1">
                            {type.examples.map((example, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className={`text-xs border-${type.color}-200 text-${type.color}-700`}
                              >
                                {example}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={`w-full hover:bg-${type.color}-50 hover:border-${type.color}-300`}
                        >
                          Start Feedback
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Quick Feedback Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#0f2f57' }}>
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:support@onesource-ai.com?subject=Feedback%20-%20General'}
                  className="flex items-center gap-2 hover:bg-blue-50"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Send Quick Feedback
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:support@onesource-ai.com?subject=Feedback%20-%20Bug%20Report'}
                  className="flex items-center gap-2 hover:bg-red-50"
                >
                  <Bug className="h-4 w-4" />
                  Report Issue
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:support@onesource-ai.com?subject=Feedback%20-%20Feature%20Request'}
                  className="flex items-center gap-2 hover:bg-yellow-50"
                >
                  <Lightbulb className="h-4 w-4" />
                  Suggest Feature
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Recent Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#0f2f57' }}>
                  <TrendingUp className="h-5 w-5" />
                  Recent Improvements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentImprovements.map((improvement, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-gray-900">
                          {improvement.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {improvement.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {improvement.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feedback Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#0f2f57' }}>
                  <Users className="h-5 w-5" />
                  Your Voice Matters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-700">User feedback directly shapes our roadmap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-700">Bug reports help us fix issues quickly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Feature requests guide our development</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#0f2f57' }}>Response Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <strong>Response Time:</strong> We review all feedback within 48 hours
                  </p>
                  <p className="text-gray-600">
                    <strong>Bug Reports:</strong> Priority response within 24 hours
                  </p>
                  <p className="text-gray-600">
                    <strong>Follow-up:</strong> We may contact you for clarification
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackPage;