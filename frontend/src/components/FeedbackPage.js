import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import PageHeader from "./PageHeader";
import { 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Lightbulb, 
  Bug, 
  Zap,
  Heart,
  Send,
  CheckCircle,
  TrendingUp,
  Users,
  Target,
  Award
} from "lucide-react";

const FeedbackPage = () => {
  const [feedbackType, setFeedbackType] = useState("");
  const [rating, setRating] = useState(0);
  const [feedbackData, setFeedbackData] = useState({
    category: "",
    title: "",
    description: "",
    email: "",
    anonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const feedbackTypes = [
    {
      id: "positive",
      title: "Share What's Working",
      description: "Tell us about features you love and positive experiences",
      icon: Heart,
      color: "#16a34a",
      placeholder: "What do you love most about ONESource-ai? How has it helped your construction projects?"
    },
    {
      id: "suggestion",
      title: "Suggest Improvements", 
      description: "Share ideas for new features or enhancements",
      icon: Lightbulb,
      color: "#f59e0b",
      placeholder: "What features would make ONESource-ai even better for construction professionals?"
    },
    {
      id: "issue",
      title: "Report an Issue",
      description: "Help us fix bugs or technical problems",
      icon: Bug,
      color: "#dc2626",
      placeholder: "Please describe the issue you encountered and steps to reproduce it"
    },
    {
      id: "general",
      title: "General Feedback",
      description: "Any other thoughts or comments about ONESource-ai",
      icon: MessageSquare,
      color: "#0f2f57",
      placeholder: "Share any other thoughts, questions, or feedback about your experience"
    }
  ];

  const recentFeedback = [
    {
      type: "positive",
      title: "Amazing AI responses for structural engineering!",
      author: "Sarah M., Structural Engineer",
      date: "2 days ago",
      helpful: 12
    },
    {
      type: "suggestion", 
      title: "Would love BIM integration features",
      author: "Anonymous",
      date: "5 days ago",
      helpful: 8
    },
    {
      type: "positive",
      title: "Saved hours on code research",
      author: "Mike T., Architect", 
      date: "1 week ago",
      helpful: 15
    }
  ];

  const impactStats = [
    {
      icon: Users,
      number: "Beta",
      label: "Version in development",
      color: "#0f2f57"
    },
    {
      icon: TrendingUp,
      number: "AI-Powered",
      label: "Construction intelligence", 
      color: "#16a34a"
    },
    {
      icon: Target,
      number: "24/7",
      label: "Always available",
      color: "#f59e0b"
    },
    {
      icon: Award,
      number: "AU/NZ",
      label: "Standards focused",
      color: "#dc2626"
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleInputChange = (e) => {
    setFeedbackData({
      ...feedbackData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#0f2f57' }}>
              Thank You for Your Feedback! 
            </h2>
            <p className="text-gray-600 mb-6">
              Your input helps us build better construction AI tools. We review every submission and 
              use your feedback to prioritize new features and improvements.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => { setSubmitted(false); setFeedbackType(""); setRating(0); setFeedbackData({ category: "", title: "", description: "", email: "", anonymous: false }); }}
                style={{ backgroundColor: '#0f2f57', color: 'white' }}
                className="w-full"
              >
                Submit More Feedback
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <PageHeader 
        title="Help Shape the Future of Construction AI"
        subtitle="Your feedback drives our product development. Share your experiences, suggest improvements, or report issues to help us build better AI tools for construction professionals."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Impact Stats */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: '#0f2f57' }}>
            Your Feedback Makes a Difference
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactStats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: stat.color + '20' }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: '#0f2f57' }}>
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Feedback Form */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#0f2f57' }}>
              Share Your Feedback
            </h2>
            
            {/* Feedback Type Selection */}
            {!feedbackType && (
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {feedbackTypes.map((type) => (
                  <Card 
                    key={type.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-opacity-50"
                    style={{ '--hover-border': type.color }}
                    onClick={() => setFeedbackType(type.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                          style={{ backgroundColor: type.color + '20' }}
                        >
                          <type.icon className="w-5 h-5" style={{ color: type.color }} />
                        </div>
                        <h3 className="font-semibold" style={{ color: '#0f2f57' }}>
                          {type.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Feedback Form */}
            {feedbackType && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                      style={{ backgroundColor: feedbackTypes.find(t => t.id === feedbackType)?.color + '20' }}
                    >
                      {React.createElement(feedbackTypes.find(t => t.id === feedbackType)?.icon, {
                        className: "w-5 h-5",
                        style: { color: feedbackTypes.find(t => t.id === feedbackType)?.color }
                      })}
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: '#0f2f57' }}>
                        {feedbackTypes.find(t => t.id === feedbackType)?.title}
                      </h3>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-sm text-gray-500"
                        onClick={() => setFeedbackType("")}
                      >
                        ← Change feedback type
                      </Button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating for positive feedback */}
                    {feedbackType === "positive" && (
                      <div>
                        <label className="block text-sm font-medium mb-3" style={{ color: '#0f2f57' }}>
                          How would you rate your overall experience?
                        </label>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="text-2xl transition-colors"
                            >
                              <Star 
                                className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                        Category
                      </label>
                      <select
                        name="category"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: '#c9d6e4' }}
                        value={feedbackData.category}
                        onChange={handleInputChange}
                      >
                        <option value="">Select a category</option>
                        <option value="ai-responses">AI Responses & Accuracy</option>
                        <option value="user-interface">User Interface & Experience</option>
                        <option value="features">Features & Functionality</option>
                        <option value="performance">Performance & Speed</option>
                        <option value="knowledge-base">Knowledge Base & Content</option>
                        <option value="billing">Billing & Subscriptions</option>
                        <option value="integration">Integration & API</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: '#c9d6e4' }}
                        value={feedbackData.title}
                        onChange={handleInputChange}
                        placeholder="Brief summary of your feedback"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                        Description
                      </label>
                      <textarea
                        name="description"
                        rows={6}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: '#c9d6e4' }}
                        value={feedbackData.description}
                        onChange={handleInputChange}
                        placeholder={feedbackTypes.find(t => t.id === feedbackType)?.placeholder}
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="anonymous"
                          checked={feedbackData.anonymous}
                          onChange={(e) => setFeedbackData({...feedbackData, anonymous: e.target.checked})}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">
                          Submit feedback anonymously
                        </span>
                      </label>
                    </div>

                    {!feedbackData.anonymous && (
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                          Email (optional)
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                          style={{ borderColor: '#c9d6e4' }}
                          value={feedbackData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com (for follow-up questions)"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                      style={{ backgroundColor: feedbackTypes.find(t => t.id === feedbackType)?.color, color: 'white' }}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting Feedback...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Send className="w-4 h-4 mr-2" />
                          Submit Feedback
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Feedback & Guidelines */}
          <div className="space-y-8">
            {/* Recent Feedback */}
            <section>
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                Recent Community Feedback
              </h3>
              <div className="space-y-4">
                {recentFeedback.map((feedback, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge 
                          variant="outline"
                          style={{ 
                            color: feedbackTypes.find(t => t.id === feedback.type)?.color,
                            borderColor: feedbackTypes.find(t => t.id === feedback.type)?.color 
                          }}
                        >
                          {feedbackTypes.find(t => t.id === feedback.type)?.title}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm mb-2" style={{ color: '#0f2f57' }}>
                        {feedback.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{feedback.author}</span>
                        <div className="flex items-center space-x-2">
                          <span>{feedback.date}</span>
                          <div className="flex items-center">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {feedback.helpful}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Feedback Guidelines */}
            <section>
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                Feedback Guidelines
              </h3>
              <Card style={{ backgroundColor: '#f1f5f9' }}>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Be specific about the issue or suggestion</li>
                    <li>• Include steps to reproduce bugs when possible</li>
                    <li>• Mention your profession for context-specific feedback</li>
                    <li>• Check existing feedback to avoid duplicates</li>
                    <li>• Be constructive and professional in your comments</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Quick Actions */}
            <section>
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                Need Immediate Help?
              </h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/help'}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Browse Help Center
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/contact'}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;