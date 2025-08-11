import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "./PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Search, MessageSquare, Mail, Phone, FileText, Video, 
  HelpCircle, Book, Shield, Users, Copyright, Database,
  ExternalLink, ArrowRight, Bot, Lightbulb, MessageCircle,
  Brain, CheckCircle
} from "lucide-react";

const HelpCenter = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showBotResponse, setShowBotResponse] = useState(null);
  const [botLoading, setBotLoading] = useState(false);

  useEffect(() => {
    document.title = 'Help Center | ONESource-ai';
  }, []);

  // Preloaded questions about ONESource-ai fundamentals
  const preloadedQuestions = [
    {
      id: 1,
      question: "How does ONESource-ai handle my privacy when I load documents?",
      category: "privacy",
      answer: `ONESource-ai takes your document privacy seriously:

**Personal Knowledge Bank:**
• Your uploaded documents are stored in your private Personal Knowledge Bank
• Only you can access your uploaded documents
• Documents are used exclusively to enhance YOUR AI responses
• We use enterprise-grade encryption for all document storage
• Documents are never shared with other users or partners

**Data Processing:**
• Documents are processed to create searchable indexes
• Original documents remain unchanged and secure
• Processing happens in secure, isolated environments
• You maintain full ownership and control of your content

**Retention & Deletion:**
• You can delete documents at any time through your profile
• Deleted documents are immediately removed from our systems
• No permanent copies are retained after deletion

**Compliance:**
• We comply with Australian Privacy Act 1988
• GDPR compliant for international users
• Regular security audits and penetration testing
• SOC 2 Type II compliance for data handling`
    },
    {
      id: 2,
      question: "How does ONESource-ai show me partner information through the Community Knowledge Bank?",
      category: "community",
      answer: `The Community Knowledge Bank provides verified partner content with full transparency:

**Partner Verification Process:**
• All partners must provide valid ABN/ACN registration
• Technical content is reviewed by our expert team
• Only verified industry professionals can contribute
• Content must comply with AU/NZ building standards

**Content Attribution:**
• Every piece of partner content shows clear attribution
• Partner company name and verification status displayed
• You can see exactly which partner provided the information
• Contact details available for verified partners

**Content Quality:**
• All partner content undergoes technical review
• Content must include proper references to standards
• Regular updates ensure information remains current
• User feedback helps maintain content quality

**How It Works:**
• When AI references partner content, it shows the source
• Partner materials are clearly marked with verification badges
• You can filter responses to include/exclude partner content
• Full transparency about which sources inform your answers`
    },
    {
      id: 3,
      question: "How does ONESource-ai handle copyright materials?",
      category: "copyright",
      answer: `ONESource-ai maintains strict copyright compliance:

**User Uploads (Personal Knowledge Bank):**
• You must have rights to upload any documents
• Upload constitutes confirmation you own or have permission to use content
• We don't claim ownership of your uploaded materials
• Your content remains your intellectual property

**Partner Content (Community Knowledge Bank):**
• Partners confirm they have rights to share their content
• All partner agreements include IP indemnification clauses
• Partners retain ownership of their contributed materials
• Proper attribution maintained for all partner content

**AI Training & Responses:**
• We don't train our AI models on copyrighted content without permission
• Responses reference publicly available standards and codes
• Fair use principles applied for educational and guidance purposes
• Original source attribution provided where applicable

**Compliance Measures:**
• DMCA takedown procedures in place
• Regular IP compliance audits
• Legal review of all content partnerships
• Clear terms of use for all users and partners

**If You Suspect Infringement:**
• Contact support@onesource-ai.com immediately
• Include details of alleged infringement
• We investigate and respond within 48 hours
• Proper remediation taken when required`
    },
    {
      id: 4,
      question: "What construction standards does ONESource-ai cover?",
      category: "standards",
      answer: `ONESource-ai covers comprehensive AU/NZ construction standards:

**Australian Standards:**
• National Construction Code (NCC) 2025 updates
• AS 1851-2012 (Fire protection systems) - latest 2025 amendments
• AS 1668.2:2024 (Mechanical ventilation in buildings)
• AS 3600 (Concrete structures)
• AS 4100 (Steel structures)
• AS 1530 (Fire tests on building materials)

**New Zealand Standards:**
• New Zealand Building Code (NZBC)
• NZS 3604:2011 (Light timber frame building)
• Building Product Specifications for overseas products
• NZS 4203 (Wind loads)
• NZS 1170 (Structural design actions)

**Specialized Coverage:**
• Fire safety standards (wet & dry systems)
• HVAC and mechanical services standards
• Electrical engineering requirements
• Structural and seismic design codes
• Environmental and sustainability standards (NABERS, Green Star)

**Regular Updates:**
• Standards are updated as new versions are released
• Alert system for major code changes
• Historical version access for reference
• Cross-referencing between related standards`
    },
    {
      id: 5,
      question: "How accurate are ONESource-ai responses?",
      category: "accuracy",
      answer: `ONESource-ai maintains high accuracy through multiple quality measures:

**AI Training & Validation:**
• Trained on verified AU/NZ construction standards
• Regular model updates with latest code changes
• Validation against official technical documents
• Continuous learning from user feedback

**Expert Review Process:**
• Technical content reviewed by qualified engineers
• Partner content verified by industry professionals
• Regular accuracy audits of AI responses
• Correction system for identified errors

**Source Attribution:**
• Every response includes relevant standard references
• Clear indication when information comes from partner content
• Links to official documentation where available
• Distinction between general guidance and specific requirements

**Limitation Acknowledgment:**
• AI provides guidance, not professional engineering advice
• Complex projects require qualified professional consultation
• Responses should be verified against current standards
• Regional variations may require local expert confirmation

**Quality Assurance:**
• Feedback system for users to report inaccuracies
• Regular updates based on user corrections
• Professional review of flagged responses
• Continuous improvement based on user interactions`
    },
    {
      id: 6,
      question: "Can I use ONESource-ai for regulatory submissions?",
      category: "regulatory",
      answer: `ONESource-ai is a guidance tool, not a substitute for professional services:

**Appropriate Use:**
• Research and preliminary guidance
• Understanding code requirements
• Preparing for professional consultations
• Educational and learning purposes
• Design concept development

**Professional Requirements:**
• Building consent applications require registered professionals
• Structural designs need qualified engineers
• Fire engineering requires certified specialists
• Local authority submissions need licensed practitioners

**How ONESource-ai Helps:**
• Provides foundation knowledge for discussions with professionals
• Helps identify relevant standards and codes
• Assists in understanding compliance pathways
• Supports professional development and learning

**Best Practice Approach:**
1. Use ONESource-ai for initial research and understanding
2. Identify relevant standards and requirements
3. Consult with qualified professionals for specific applications
4. Verify all guidance against current official standards
5. Obtain professional certification for regulatory submissions

**Professional Network:**
• We can connect you with verified industry partners
• Partner directory includes qualified professionals
• Professional development resources available
• Continuing education opportunities promoted`
    },
    {
      id: 7,
      question: "How does ONESource-ai adapt responses based on my experience level?",
      category: "personalization",
      answer: `ONESource-ai personalizes every response based on your selected experience level to provide the most appropriate guidance:

**Graduate / Beginner (0-2 years):**
• AI provides detailed explanations, step-by-step guidance, educational context, and mentoring advice
• Perfect for learning fundamental concepts and building confidence

**Response Examples:**
• Explains basic concepts like "What is a fire rating?" before discussing specific requirements
• Provides step-by-step compliance checklists with explanations for each step
• Includes educational context: "This requirement exists because..." with safety rationale
• Offers learning resources and suggests professional development pathways

**Intermediate (3-7 years):**
• AI offers practical solutions with moderate detail, focuses on real-world applications
• Provides tips for professional development and efficiency improvements

**Response Examples:**
• Provides practical solutions: "For this scenario, you could use Method A or B, here's when to choose each"
• Focuses on real-world applications and common challenges you'll face
• Includes efficiency tips: "Pro tip: This calculation can be simplified by..."
• Suggests when to consult specialists and what questions to ask them

**Senior (8-15 years):**
• AI provides advanced technical insights, discusses complex scenarios
• Offers strategic perspectives and focuses on leadership and decision-making aspects

**Response Examples:**
• Discusses complex scenarios: "When dealing with conflicting code requirements, consider..."
• Offers strategic perspectives on project risks and mitigation strategies
• Focuses on leadership aspects: "When presenting this to stakeholders, emphasize..."
• Provides advanced technical insights and alternative design approaches

**Expert / Principal (15+ years):**
• AI delivers concise, high-level insights, focuses on innovation and cutting-edge practices
• Discusses industry trends and provides expert-to-expert technical discourse

**Response Examples:**
• Delivers concise, high-level insights without basic explanations
• Discusses cutting-edge practices and emerging industry trends
• Provides expert-to-expert technical discourse with advanced terminology
• Focuses on innovation opportunities and industry leadership perspectives

**Why This Matters:**
Selecting the correct experience level ensures you receive responses that match your expertise, learning style, and professional needs. This personalization makes ONESource-ai more effective and relevant to your specific career stage.`
    }
  ];

  // FAQ Articles based on web crawl data
  const faqArticles = [
    {
      id: 101,
      title: "Understanding NCC 2025 Energy Efficiency Updates",
      category: "standards",
      excerpt: "New thermal performance and insulation requirements for Australian construction",
      content: `The National Construction Code (NCC) 2025 introduces stricter energy efficiency standards for new constructions and major renovations. Key changes include:

**Enhanced Thermal Performance:**
• Improved R-value requirements for wall and roof insulation
• Stricter glazing performance standards
• Enhanced air sealing requirements

**HVAC System Updates:**
• Higher efficiency ratings for heating and cooling systems
• Mandatory commissioning for commercial HVAC installations
• Smart controls integration requirements

**Compliance Pathways:**
• Simplified verification methods
• New modelling software acceptance criteria
• Alternative solution pathway clarifications`
    },
    {
      id: 102,
      title: "AS 1851-2012 Fire System Maintenance Changes",
      category: "fire-safety",
      excerpt: "February 2025 amendments to fire protection system maintenance requirements",
      content: `The updated AS 1851-2012 standard, effective February 13, 2025, introduces significant changes:

**Enhanced Record Keeping:**
• Detailed digital records mandatory
• Cloud-based system integration
• Real-time compliance tracking

**Inspection Frequency Updates:**
• Monthly visual inspections for critical systems
• Quarterly functional testing requirements
• Annual comprehensive assessments

**Penalty Framework:**
• Building owner liability clearly defined
• Professional indemnity requirements
• Compliance certification processes`
    },
    {
      id: 103,
      title: "New Zealand Building Code Streamlining",
      category: "standards",
      excerpt: "Simplified process for using overseas building products in NZ construction",
      content: `The NZ Government's Building Product Specifications document makes it easier to use international products:

**Acceptable Solutions:**
• Pre-approved overseas product categories
• Verification method simplification
• Reduced compliance documentation

**International Standards Recognition:**
• European CE marking acceptance
• North American standards equivalency
• Australian standard cross-recognition

**Implementation Process:**
• Building consent pathway clarification
• Professional responsibility frameworks
• Quality assurance requirements`
    },
    {
      id: 104,
      title: "HVAC Fire Safety Requirements 2025",
      category: "mechanical",
      excerpt: "Updated fire safety standards for mechanical ventilation systems",
      content: `New HVAC fire safety requirements emphasize comprehensive system protection:

**Ventilation Standards:**
• AS 1668.2:2024 compliance mandatory
• Enhanced smoke control provisions
• Emergency ventilation protocols

**Fire Resistance Ratings:**
• Ductwork fire resistance requirements
• Penetration sealing standards
• Service shaft protection measures

**Maintenance & Testing:**
• Regular fire damper testing
• Smoke evacuation system verification
• Professional certification requirements`
    }
  ];

  // Popular articles combining both categories
  const popularArticles = [...preloadedQuestions, ...faqArticles];

  const categories = [
    { id: 'all', name: 'All Topics', icon: Book },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'community', name: 'Community Knowledge', icon: Users },
    { id: 'copyright', name: 'Copyright & IP', icon: Copyright },
    { id: 'standards', name: 'Building Standards', icon: FileText },
    { id: 'fire-safety', name: 'Fire Safety', icon: Lightbulb },
    { id: 'mechanical', name: 'Mechanical Services', icon: MessageCircle },
    { id: 'personalization', name: 'AI Personalization', icon: Brain },
    { id: 'accuracy', name: 'Accuracy & Quality', icon: CheckCircle },
    { id: 'regulatory', name: 'Regulatory Use', icon: HelpCircle }
  ];

  const handleBotQuestion = async (question) => {
    setBotLoading(true);
    setShowBotResponse({
      question: question.question,
      answer: question.answer,
      category: question.category
    });
    
    // Simulate AI processing time
    setTimeout(() => {
      setBotLoading(false);
    }, 1500);
  };

  const filteredArticles = popularArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSupport = (type) => {
    const emails = {
      support: 'support@onesource-ai.com?subject=Support%20Request',
      feedback: 'support@onesource-ai.com?subject=Feedback',
      accounts: 'support@onesource-ai.com?subject=Account%20Issue'
    };
    window.location.href = `mailto:${emails[type]}`;
  };

  const handleSuggestSource = () => {
    window.location.href = 'mailto:support@onesource-ai.com?subject=Knowledge%20Bank%20Ideas%20-%20Source%20Suggestion';
  };

  return (
    <>
      <PageHeader 
        title="Help Center" 
        subtitle="Get help, find answers, and learn about ONESource-ai's construction industry expertise platform"
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

        {/* Search Bar */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search help articles, FAQ, and system information..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Bot Response Area */}
            {showBotResponse && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Bot className="h-5 w-5" />
                    ONESource-ai Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {botLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-blue-700">Thinking...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="font-medium text-blue-800">{showBotResponse.question}</p>
                      <div className="prose prose-sm max-w-none text-gray-700">
                        {showBotResponse.answer.split('\n').map((paragraph, index) => (
                          <div key={index} className="mb-2">
                            {paragraph.startsWith('**') && paragraph.endsWith(':**') ? (
                              <h4 className="font-semibold text-blue-800 mb-1">{paragraph.slice(2, -2)}</h4>
                            ) : paragraph.startsWith('•') ? (
                              <div className="ml-4 mb-1">{paragraph}</div>
                            ) : paragraph.trim() && (
                              <p>{paragraph}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Popular Articles & FAQ */}
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#0f2f57' }}>
                Popular Articles & FAQ
              </h2>
              
              {filteredArticles.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      ONESource-ai is continuing to build their knowledge banks.
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Would you like to suggest a source or topic to add to our knowledge base?
                    </p>
                    <Button onClick={handleSuggestSource} className="bg-blue-600 hover:bg-blue-700">
                      Suggest Knowledge Source
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {article.question ? (
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                              ) : (
                                <FileText className="h-4 w-4 text-green-600" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                {categories.find(c => c.id === article.category)?.name || article.category}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold mb-2" style={{ color: '#0f2f57' }}>
                              {article.question || article.title}
                            </h3>
                            {article.excerpt && (
                              <p className="text-gray-600 text-sm mb-3">{article.excerpt}</p>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => article.question ? handleBotQuestion(article) : null}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {article.question ? 'Ask AI Assistant' : 'Read Article'}
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: '#0f2f57' }}>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                
                {/* Contact Options */}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleContactSupport('support')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleContactSupport('feedback')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Feedback
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleContactSupport('accounts')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Account Issues
                </Button>
                
                {/* Knowledge Vault Link */}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/knowledge'}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Knowledge Vault
                </Button>
                
                {/* Video Tutorials - Coming Soon */}
                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full justify-start opacity-60"
                    disabled
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Video Tutorials
                  </Button>
                  <Badge className="absolute -top-2 -right-2 text-xs bg-orange-100 text-orange-800 border-orange-200">
                    Soon
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: '#0f2f57' }}>Need More Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-1 text-blue-600" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <a 
                        href="mailto:support@onesource-ai.com" 
                        className="text-blue-600 hover:underline"
                      >
                        support@onesource-ai.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Response time: Within 24 hours during business days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: '#0f2f57' }}>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>AI Assistant: Operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Knowledge Banks: Operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Document Upload: Operational</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpCenter;