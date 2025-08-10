import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import PageHeader from "./PageHeader";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  HelpCircle,
  Zap,
  Users,
  Calendar,
  Send,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    profession: "",
    subject: "",
    message: "",
    priority: "medium"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactMethods = [
    {
      title: "Email Support",
      description: "Get detailed help from our construction experts",
      icon: Mail,
      contact: "support@onesource-ai.com",
      responseTime: "Within 4 hours",
      color: "#0f2f57",
      recommended: true
    },
    {
      title: "Phone Support", 
      description: "Speak directly with our technical team",
      icon: Phone,
      contact: "+61 2 1234 5678",
      responseTime: "Mon-Fri 9AM-5PM AEDT",
      color: "#16a34a",
      recommended: false
    },
    {
      title: "Live Chat",
      description: "Quick answers to common questions",
      icon: MessageSquare,
      contact: "Available in-app",
      responseTime: "Usually within 15 mins",
      color: "#dc2626",
      recommended: false
    }
  ];

  const supportTypes = [
    {
      title: "Technical Support",
      description: "Issues with AI responses, features, or account access",
      icon: Zap,
      examples: ["AI not responding", "Feature not working", "Login problems"]
    },
    {
      title: "Construction Guidance",
      description: "Questions about building codes, standards, or compliance",
      icon: HelpCircle,
      examples: ["AS/NZS standards", "BCA requirements", "Compliance guidance"]
    },
    {
      title: "Account & Billing",
      description: "Subscription changes, payments, or plan upgrades", 
      icon: Users,
      examples: ["Change subscription", "Billing questions", "Refund requests"]
    },
    {
      title: "Training & Demos",
      description: "Learn how to get the most from ONESource-ai",
      icon: Calendar,
      examples: ["Team training", "Feature demos", "Best practices"]
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#0f2f57' }}>
              Message Sent Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for contacting ONESource-ai. Our construction experts will review your message and respond within 4 hours during business days.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setSubmitted(false)}
                style={{ backgroundColor: '#0f2f57', color: 'white' }}
                className="w-full"
              >
                Send Another Message
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
        title="Contact Our Construction Experts"
        subtitle="Get personalized support for your construction projects, technical questions, or help maximizing ONESource-ai for your team."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Methods */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: '#0f2f57' }}>
            Choose Your Preferred Contact Method
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow ${method.recommended ? 'ring-2' : ''}`}
                style={{ ringColor: method.recommended ? method.color : 'transparent' }}>
                <CardContent className="p-6">
                  {method.recommended && (
                    <Badge className="mb-3" style={{ backgroundColor: method.color, color: 'white' }}>
                      Recommended
                    </Badge>
                  )}
                  <div className="flex items-center mb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                      style={{ backgroundColor: method.color + '20' }}
                    >
                      <method.icon className="w-6 h-6" style={{ color: method.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: '#0f2f57' }}>
                        {method.title}
                      </h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium" style={{ color: method.color }}>{method.contact}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {method.responseTime}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <section>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#0f2f57' }}>
              Send Us a Message
            </h2>
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: '#c9d6e4', focusRingColor: '#0f2f57' }}
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: '#c9d6e4' }}
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                        Company/Organization
                      </label>
                      <input
                        type="text"
                        name="company"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: '#c9d6e4' }}
                        value={formData.company}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                        Profession
                      </label>
                      <select
                        name="profession"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: '#c9d6e4' }}
                        value={formData.profession}
                        onChange={handleInputChange}
                      >
                        <option value="">Select your profession</option>
                        <option value="architect">Architect</option>
                        <option value="structural-engineer">Structural Engineer</option>
                        <option value="civil-engineer">Civil Engineer</option>
                        <option value="mechanical-engineer">Mechanical Engineer</option>
                        <option value="electrical-engineer">Electrical Engineer</option>
                        <option value="building-surveyor">Building Surveyor</option>
                        <option value="construction-manager">Construction Manager</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#c9d6e4' }}
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#c9d6e4' }}
                      value={formData.priority}
                      onChange={handleInputChange}
                    >
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Standard support</option>
                      <option value="high">High - Urgent assistance needed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                      Message *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#c9d6e4' }}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please provide details about your question or the assistance you need..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                    style={{ backgroundColor: '#0f2f57', color: 'white' }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Message...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>

          {/* Support Information */}
          <section>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#0f2f57' }}>
              What Can We Help You With?
            </h2>
            <div className="space-y-6">
              {supportTypes.map((type, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mr-4 flex-shrink-0">
                        <type.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                          {type.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{type.description}</p>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Common topics: </span>
                          <span className="text-gray-600">{type.examples.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Info */}
            <Card className="mt-6" style={{ backgroundColor: '#f1f5f9' }}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  Our Location & Hours
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-3 text-gray-500" />
                    <span>Sydney, Australia (Remote-first team)</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-3 text-gray-500" />
                    <span>Monday - Friday: 9:00 AM - 5:00 PM AEDT</span>
                  </div>
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-3 text-gray-500" />
                    <span>Emergency support available 24/7 for critical issues</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;