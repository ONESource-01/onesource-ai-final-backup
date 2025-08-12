import React, { useState, useEffect, useMemo } from "react";
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
    document.title = 'Help Centre | ONESource-ai';
  }, []);

  // Preloaded questions about ONESource-ai fundamentals
  const preloadedQuestions = [
    {
      id: 1,
      question: "What is ONESource-ai's 3-Phase AI Intelligence system?",
      category: "ai-intelligence",
      answer: `ONESource-ai's revolutionary 3-Phase AI Intelligence system provides progressively sophisticated construction expertise based on your subscription level:

🧠 **Phase 1: Enhanced Prompting** (Starter Plan)
• Construction-specific prompt templates for different disciplines
• Industry-focused language and terminology
• Mandatory compliance references to AS/NZS, NCC, and BCA standards
• Professional response structure with Technical Answers and Mentoring Insights

⚙️ **Phase 2: Workflow Intelligence** (Pro Plan) 
• Intelligent project stage detection (Concept, Design, Approval, Construction, etc.)
• Tailored next steps and consultant recommendations based on detected project phase
• Critical considerations and oversight areas specific to your project stage
• Smart workflow templates and implementation guidance

🎯 **Phase 3: Specialized Training** (Pro+ Plan)
• Deep discipline-specific knowledge libraries (Structural, Fire Safety, Sustainability, etc.)
• Comprehensive standards databases mapped to each specialization
• Advanced calculation methodologies and professional templates
• Multi-discipline coordination guidance and specialized workflows

Each phase builds upon the previous, delivering increasingly sophisticated construction intelligence as you progress through subscription tiers.`
    },
    {
      id: 2,
      question: "How does Phase 1: Enhanced Prompting work?",
      category: "ai-intelligence", 
      answer: `**Phase 1: Enhanced Prompting** transforms generic AI responses into construction-specific expertise:

🏗️ **Discipline-Specific Templates:**
• Structural Engineering: AS 1170 focus with structural design loads
• Building Codes: NCC/BCA compliance with specific clause references
• Fire Safety: AS 1851, AS 3786 integration with system requirements
• Sustainability: Green Star and NABERS framework alignment
• MEP Systems: AS/NZS standards for mechanical, electrical, plumbing

📋 **Professional Response Structure:**
• 🛠️ Technical Answer: Detailed standards, calculations, compliance paths
• 🧐 Mentoring Insight: Practical guidance and industry best practices
• 📋 Next Steps: Clear actionable recommendations

✅ **Compliance Focus:**
• Mandatory AS/NZS standard references with current editions
• NCC and BCA section citations where applicable
• State-specific regulatory variations noted
• Professional certification requirements highlighted

**Available to:** All users (Starter Plan and above)
**Benefit:** Eliminates generic AI responses, ensures construction industry relevance`
    },
    {
      id: 3,
      question: "What advantages does Phase 2: Workflow Intelligence provide?",
      category: "ai-intelligence",
      answer: `**Phase 2: Workflow Intelligence** intelligently detects your project stage and provides targeted guidance:

🎯 **Smart Stage Detection:**
• **Concept Planning:** Site analysis, preliminary budgets, council pre-application
• **Design Development:** Architectural drawings, structural engineering, services design
• **Regulatory Approval:** Building consent applications, engineering certificates
• **Procurement:** Tender documentation, contractor selection, contract negotiation
• **Construction:** Site inspections, quality control, progress management
• **Completion:** Final inspections, defects rectification, handover processes

⚙️ **Intelligent Recommendations:**
• Stage-specific next steps tailored to your project phase
• Key consultant recommendations (Architect, Engineer, Certifier, etc.)
• Critical considerations and common oversight areas
• Typical timeline expectations and milestone planning

🧠 **Professional Guidance:**
• Industry best practices for each project stage
• Risk mitigation strategies specific to your phase
• Coordination requirements between disciplines
• Authority liaison and approval processes

**Available to:** Pro Plan subscribers and above
**Benefit:** Eliminates guesswork, provides expert project management guidance at every stage`
    },
    {
      id: 4,
      question: "How does Phase 3: Specialized Training enhance my expertise?",
      category: "ai-intelligence",
      answer: `**Phase 3: Specialized Training** delivers deep, discipline-specific construction expertise:

🏗️ **Comprehensive Knowledge Libraries:**
• **Structural:** Complete AS 1170 series, AS 3600 concrete, AS 4100 steel design
• **Fire Safety:** AS 1851 maintenance, AS 3786 detection, egress calculations
• **Sustainability:** Green Star criteria, NABERS protocols, energy modeling
• **Building Codes:** Full NCC interpretation, alternative solutions, DTS compliance
• **MEP Systems:** AS/NZS hydraulic, electrical, mechanical integration

📊 **Advanced Capabilities:**
• Complex calculation methodologies with step-by-step guidance
• Cross-standard compliance checking and conflict resolution
• Multi-discipline coordination protocols and interface management
• Performance-based solution development and documentation

🎯 **Professional Templates:**
• Design calculation templates for common scenarios  
• Compliance checklists and verification procedures
• Professional certification pathways and requirements
• Quality assurance protocols and testing procedures

⚡ **Specialized Features:**
• Advanced comparison tables across jurisdictions
• Historical standard changes and transition guidance
• Industry-specific workflows and best practice protocols
• Professional development recommendations and certifications

**Available to:** Pro+ Plan subscribers
**Benefit:** Access to specialist-level expertise across all major construction disciplines`
    },
    {
      id: 5,
      question: "How do System Prompts and Mentoring Responses work behind the scenes?",
      category: "ai-intelligence",
      answer: `ONESource-ai uses sophisticated system prompts and intelligent mentoring to deliver personalized construction expertise:

## **🧠 System Prompts - The AI's Expert Identity**

**What They Do:**
System prompts are detailed instructions that transform generic AI into specialized construction experts. Think of them as "expert personalities" that the AI adopts based on your question.

**How They Work:**
1. **Question Analysis:** System detects discipline (structural, fire safety, etc.) and sector (commercial, residential, etc.) from your question content
2. **Expert Selection:** Chooses appropriate expert prompt from 40+ construction disciplines
3. **Context Application:** AI responds as that specific type of expert with relevant standards, terminology, and approach

**Example in Action:**
- **Fire Safety Question:** AI becomes fire safety engineer, references AS 1851, AS 3786, NCC Volume One
- **Structural Question:** AI becomes structural engineer, uses AS 1170, AS 3600, AS 4100 standards
- **Cost Question:** AI becomes quantity surveyor, applies cost estimation principles and market analysis

## **🎯 Intelligent Mentoring Cross-Reference System**

**The Smart Translation:**
When you ask about disciplines outside your expertise, ONESource-ai provides expert technical answers BUT personalizes the mentoring insights back to your actual professional background.

**How Cross-Referencing Works:**
1. **Your Profile:** System reads your selected disciplines and industry sectors from user profile
2. **Question Detection:** Identifies what discipline/sector the question is about
3. **Expert Technical Answer:** Provides full expert-level answer for the asked discipline
4. **Personalized Mentoring:** Translates guidance back to YOUR expertise areas

**Real Example:**
- **Your Profile:** Structural Engineer + Commercial Buildings
- **Question Asked:** "Fire safety requirements for hospitals"
- **Technical Answer:** Complete fire safety expert guidance for healthcare facilities
- **Mentoring Insight:** *"As a structural engineer working primarily in commercial buildings, here's how these healthcare fire safety requirements will impact your structural design considerations when working on hospital projects..."*

## **🔄 Multiple Expertise Handling**

**Smart Display for Multiple Specializations:**
- **Single expertise:** "As a structural engineer working in commercial sector..."
- **Multiple expertise:** "As a structural/hydraulic/civil engineer working in commercial/healthcare sectors..."

## **⚙️ Behind the Scenes Process**

**Step-by-Step System Operation:**
1. **Content Analysis:** Keyword detection identifies required expertise (40+ disciplines, 17 sectors)
2. **User Profile Check:** Reads your selected professional areas
3. **Prompt Assembly:** Combines expert system prompt + user context + subscription tier features
4. **Response Generation:** AI responds as expert in asked discipline
5. **Mentoring Translation:** Personalizes guidance back to your actual expertise
6. **Tier Gating:** Delivers Phase 1/2/3 intelligence based on subscription level

**This intelligent system ensures you get expert-level answers for any construction topic while receiving mentoring guidance tailored specifically to your professional background.**`
    },
    {
      id: 6,
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
      answer: `ONESource-ai considers **all relevant AU/NZ standards that are available to the AI agent across all disciplines and sectors of the construction industry**.

**Comprehensive Standards Coverage:**
ONESource-ai has access to and considers the full spectrum of Australian and New Zealand construction standards, codes, and regulations that are publicly available and relevant to your specific query, including:

**All Construction Disciplines:**
• Architecture and building design standards
• Structural engineering (concrete, steel, timber, masonry)
• Fire safety and protection systems
• HVAC, mechanical, and hydraulic services
• Electrical engineering and systems
• Civil engineering and infrastructure
• Geotechnical and foundation standards
• Environmental and sustainability requirements
• Accessibility and universal design codes

**All Construction Sectors:**
• Residential construction (single dwelling to high-rise)
• Commercial and office buildings
• Industrial and manufacturing facilities
• Healthcare and aged care facilities
• Educational institutions
• Retail and hospitality venues
• Infrastructure and civil works
• Specialized facilities (data centers, laboratories, etc.)

**Dynamic Standards Integration:**
Rather than being limited to a fixed list, ONESource-ai intelligently identifies and applies the most current and relevant AU/NZ standards based on your specific question, project type, and context. This includes Australian Standards (AS/NZS), National Construction Code (NCC), New Zealand Building Code (NZBC), and industry-specific codes and guidelines.

**Key Advantage:**
Our AI doesn't just reference standards - it understands how they interconnect across disciplines and applies the most relevant combination for your specific construction challenge, ensuring comprehensive compliance guidance across the entire AU/NZ construction industry.`
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
    },
    {
      id: 8,
      question: "How does the Community Knowledge Bank work?",
      category: "community",
      answer: `The Community Knowledge Bank is a shared resource where construction industry partners contribute verified technical content:

**Partner Contributions:**
• **Verified Organizations**: Only approved industry partners can contribute content
• **Quality Assurance**: All partner content undergoes technical review
• **Proper Attribution**: Every response clearly identifies the contributing organization
• **Current Information**: Partners keep their content updated with latest practices

**Content Types:**
• Technical specifications and standards interpretations
• Best practice guides and methodologies  
• Product technical data and installation guides
• Compliance checklists and verification procedures
• Regional variations and local authority requirements

**User Benefits:**
• **Enhanced Responses**: AI draws from both general knowledge and partner-specific expertise
• **Industry Insights**: Access to real-world applications and case studies
• **Trusted Sources**: Content comes from established construction professionals
• **Attribution Transparency**: Always know the source of specialized information

**Content Management:**
• Partners control their own content updates
• Users can provide feedback on partner content quality
• Regular auditing ensures accuracy and relevance
• Integration with personal knowledge for comprehensive guidance

**Privacy & Control:**
• Community content is searchable by all users
• Personal Knowledge Bank remains completely private
• Clear distinction between community and personal content sources
• User choice in how much to rely on community vs personal content`
    },
    {
      id: 9,
      question: "How does AI personalization work with my industry experience?",
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
    { id: 'ai-intelligence', name: '3-Phase AI Intelligence', icon: Brain },
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

  const filteredArticles = useMemo(() => {
    console.log('Filtering articles with searchQuery:', searchQuery, 'selectedCategory:', selectedCategory);
    
    const filtered = popularArticles.filter(article => {
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      
      // Search in multiple fields including content/answer
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || // Show all when search is empty
                           article.title?.toLowerCase().includes(searchLower) ||
                           article.question?.toLowerCase().includes(searchLower) ||
                           article.excerpt?.toLowerCase().includes(searchLower) ||
                           article.answer?.toLowerCase().includes(searchLower) ||
                           article.content?.toLowerCase().includes(searchLower);
      
      const result = matchesCategory && matchesSearch;
      
      // Debug logging for articles containing "standards"
      if (searchQuery.toLowerCase() === 'standards') {
        console.log(`Article ${article.id}: "${article.question || article.title}"`, {
          matchesCategory,
          matchesSearch,
          result,
          hasTitle: !!article.title?.toLowerCase().includes('standards'),
          hasQuestion: !!article.question?.toLowerCase().includes('standards'),
          hasAnswer: !!article.answer?.toLowerCase().includes('standards'),
          hasContent: !!article.content?.toLowerCase().includes('standards'),
          hasExcerpt: !!article.excerpt?.toLowerCase().includes('standards')
        });
      }
      
      return result;
    });
    
    console.log(`Filtered ${filtered.length} articles from ${popularArticles.length} total`);
    return filtered;
  }, [searchQuery, selectedCategory, popularArticles]);

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
        title="Help Centre" 
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
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search help articles, FAQ, and system information..."
                  value={searchQuery}
                  onChange={(e) => {
                    console.log('Search input changed:', e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-transparent pl-10 pr-4 py-3 text-lg shadow-sm transition-colors placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setShowBotResponse(null); // Clear AI response when switching categories
                  }}
                  className={`flex items-center gap-2 ${
                    selectedCategory === category.id 
                      ? 'bg-onesource-medium text-white hover:bg-onesource-dark' 
                      : 'bg-onesource-light text-white hover:bg-onesource-medium border-onesource-light'
                  }`}
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
              <Card className="border-2 border-onesource-pale bg-onesource-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-onesource-dark">
                    <img src="/onesource-icon.png" alt="ONESource-ai" className="h-5 w-5" />
                    ONESource-ai Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {botLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-onesource-dark"></div>
                      <span className="text-onesource-medium">Thinking...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="font-medium text-onesource-dark">{showBotResponse.question}</p>
                      <div className="prose prose-sm max-w-none text-gray-700">
                        {showBotResponse.answer.split('\n').map((paragraph, index) => (
                          <div key={index} className="mb-2">
                            {paragraph.startsWith('**') && paragraph.endsWith(':**') ? (
                              <h4 className="font-semibold text-onesource-dark mb-1">{paragraph.slice(2, -2)}</h4>
                            ) : paragraph.startsWith('•') ? (
                              <div className="ml-4 mb-1">{paragraph}</div>
                            ) : paragraph.trim() ? (
                              <p dangerouslySetInnerHTML={{
                                __html: paragraph
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              }} />
                            ) : null}
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
                    <Button onClick={handleSuggestSource} className="bg-onesource-dark hover:bg-onesource-medium text-white">
                      Suggest Knowledge Source
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div key={selectedCategory} className="space-y-4">
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
                              className="text-onesource-dark hover:text-onesource-medium"
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