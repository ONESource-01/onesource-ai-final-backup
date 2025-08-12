import React, { useEffect, useState } from "react";
import PageHeader from "./PageHeader";
import ContactForm from "./ContactForm";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { 
  Mail, MessageSquare, User, HelpCircle, Phone, MapPin, Clock,
  ArrowRight, ExternalLink
} from 'lucide-react';

const ContactPage = () => {
  const [selectedContactType, setSelectedContactType] = useState(null);

  useEffect(() => {
    document.title = 'Contact Us | ONESource-ai';
  }, []);

  const contactOptions = [
    {
      id: 'support',
      title: 'Technical Support',
      icon: HelpCircle,
      description: 'Get help with technical issues, account problems, or general questions',
      color: 'blue'
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      icon: MessageSquare,
      description: 'Share your thoughts, suggestions, or report issues to help us improve',
      color: 'green'
    },
    {
      id: 'accounts',
      title: 'Account Issues',
      icon: User,
      description: 'Report problems with billing, subscriptions, or login issues',
      color: 'orange'
    },
    {
      id: 'knowledge',
      title: 'Knowledge Bank Ideas',
      icon: Mail,
      description: 'Suggest new sources, content, or improvements for our knowledge banks',
      color: 'purple'
    }
  ];

  if (selectedContactType) {
    return (
      <>
        <PageHeader 
          title="Contact ONESource-ai" 
          subtitle="We're here to help with any questions or issues you may have"
        />
        
        <div className="max-w-7xl mx-auto p-6" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
          {/* Back Button */}
          <div className="mb-6">
            <Button
              onClick={() => setSelectedContactType(null)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Contact Options
            </Button>
          </div>

          {/* Contact Form */}
          <div className="flex justify-center">
            <ContactForm 
              type={selectedContactType}
              onClose={() => setSelectedContactType(null)}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader 
        title="Contact ONESource-ai" 
        subtitle="We're here to help with any questions or issues you may have"
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
          
          {/* Contact Options */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#0f2f57' }}>
              How can we help you?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {contactOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Card 
                    key={option.id}
                    className={`hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-${option.color}-200`}
                    onClick={() => setSelectedContactType(option.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${option.color}-100`}>
                          <IconComponent className={`h-5 w-5 text-${option.color}-600`} />
                        </div>
                        <span style={{ color: '#0f2f57' }}>{option.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{option.description}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={`w-full hover:bg-${option.color}-50 hover:border-${option.color}-300`}
                      >
                        Get Started
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#0f2f57' }}>
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:support@onesource-ai.com'}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Direct Email
                  <ExternalLink className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/help'}
                  className="flex items-center gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  Help Center
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/knowledge'}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Knowledge Vault
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Information Sidebar */}
          <div className="space-y-6">
            
            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#0f2f57' }}>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <a 
                      href="mailto:support@onesource-ai.com" 
                      className="text-onesource-dark hover:underline text-sm"
                    >
                      support@onesource-ai.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Business Hours</p>
                    <p className="text-sm text-gray-600">
                      Monday - Friday<br />
                      9:00 AM - 5:00 PM AEST
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">
                      Australia & New Zealand<br />
                      Serving the construction industry
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Times */}
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#0f2f57' }}>Response Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">General Support</span>
                  <span className="text-sm font-medium text-green-600">24 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Issues</span>
                  <span className="text-sm font-medium text-blue-600">12 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Urgent Issues</span>
                  <span className="text-sm font-medium text-red-600">4 hours</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Response times are during business hours. 
                    Urgent issues are prioritized.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Self-Service Options */}
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#0f2f57' }}>Self-Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Get instant help with common questions and issues:
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/help'}
                    className="w-full justify-start text-left"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help Center & FAQ
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/knowledge'}
                    className="w-full justify-start text-left"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Knowledge Vault Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;