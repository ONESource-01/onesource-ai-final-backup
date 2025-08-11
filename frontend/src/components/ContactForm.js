import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Mail, MessageSquare, User, HelpCircle, Send, CheckCircle,
  AlertTriangle, Phone, Clock
} from 'lucide-react';

const ContactForm = ({ type = 'support', onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const contactTypes = {
    support: {
      title: 'Contact Support',
      icon: HelpCircle,
      color: 'blue',
      emailSubject: 'Support%20Request',
      description: 'Get help with technical issues, account problems, or general questions about ONESource-ai.'
    },
    feedback: {
      title: 'Send Feedback',
      icon: MessageSquare,
      color: 'green',
      emailSubject: 'Feedback',
      description: 'Share your thoughts, suggestions, or report issues to help us improve ONESource-ai.'
    },
    accounts: {
      title: 'Account Issues',
      icon: User,
      color: 'orange',
      emailSubject: 'Account%20Issue',
      description: 'Report problems with your account, billing, subscriptions, or login issues.'
    },
    knowledge: {
      title: 'Knowledge Bank Ideas',
      icon: Mail,
      color: 'purple',
      emailSubject: 'Knowledge%20Bank%20Ideas',
      description: 'Suggest new sources, content, or improvements for our knowledge banks.'
    }
  };

  const currentType = contactTypes[type] || contactTypes.support;
  const IconComponent = currentType.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create the email body
      const emailBody = `
Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}
Priority: ${formData.priority}

Message:
${formData.message}

---
Sent from ONESource-ai Contact Form
      `.trim();

      // Create mailto link with proper encoding
      const mailtoLink = `mailto:support@onesource-ai.com?subject=${currentType.emailSubject}%20-%20${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Show success message after a short delay
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Contact form error:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (success) {
    return (
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Email Client Opened
          </h3>
          <p className="text-gray-600 mb-4">
            Your email client should now be open with a pre-filled message. 
            Please send the email to complete your request.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
            <Button 
              variant="outline"
              onClick={() => setSuccess(false)}
              className="w-full"
            >
              Back to Form
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl w-full">
      <CardHeader>
        <CardTitle className={`flex items-center text-${currentType.color}-800`}>
          <IconComponent className={`h-5 w-5 mr-2 text-${currentType.color}-600`} />
          {currentType.title}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          {currentType.description}
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* Subject and Priority */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Brief description of your request"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Please provide detailed information about your request..."
              rows={6}
              required
            />
          </div>

          {/* Response Time Info */}
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Response Time:</strong> We typically respond within 24 hours during business days (Mon-Fri, 9 AM - 5 PM AEST).
              For urgent issues, please include "URGENT" in your subject line.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            {onClose && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
            )}
            
            {/* Direct Email Link */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.location.href = `mailto:support@onesource-ai.com?subject=${currentType.emailSubject}`;
              }}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Quick Email
            </Button>
            
            {/* Submit Form */}
            <Button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Opening...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Alternative Contact Methods */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Alternative Contact Methods</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Direct Email: </span>
              <a 
                href="mailto:support@onesource-ai.com" 
                className="text-blue-600 hover:underline"
              >
                support@onesource-ai.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Business Hours: Monday - Friday, 9:00 AM - 5:00 PM AEST</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactForm;