import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiEndpoints, setAuthToken } from '../utils/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import SmartAutoComplete from './SmartAutoComplete';
import { 
  User, 
  Settings, 
  Upload, 
  FileText, 
  Brain, 
  Crown,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Building2,
  Zap,
  BarChart3,
  Shield,
  Bell,
  Palette,
  Target,
  Briefcase,
  GraduationCap,
  ChevronRight,
  Home,
  Building,
  Wrench,
  Info,
  HelpCircle
} from 'lucide-react';

const UserProfile = ({ onClose, onPreferencesUpdate }) => {
  const { user, idToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    industry_sectors: [],
    disciplines: [],
    experience_level: '',
    company_type: '',
    custom_instructions: ''
  });
  const [personalDocuments, setPersonalDocuments] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // V1 Beta Testing - Exact 17 Industry Sectors
  const industrySectors = [
    { name: 'Commercial', description: 'Offices, retail, mixed-use developments' },
    { name: 'Industrial', description: 'Warehouses, manufacturing plants, distribution hubs' },
    { name: 'Mining & Resources', description: 'Mining infrastructure, processing plants, camps' },
    { name: 'Health', description: 'Hospitals, aged care, medical centres, specialist clinics' },
    { name: 'Data Centres', description: 'Hyperscale, enterprise, colocation facilities' },
    { name: 'Residential', description: 'Multi-unit apartments, townhouses, detached housing' },
    { name: 'Hotels & Hospitality', description: 'Hotels, resorts, serviced apartments' },
    { name: 'Education', description: 'Schools, universities, research facilities' },
    { name: 'Transport & Infrastructure', description: 'Airports, rail, ports, roads, bridges' },
    { name: 'Energy & Utilities', description: 'Power generation, renewable energy, water/wastewater plants' },
    { name: 'Government & Civic', description: 'Courthouses, civic centres, defence facilities' },
    { name: 'Retail & Entertainment', description: 'Shopping centres, cinemas, stadiums, cultural venues' },
    { name: 'Agriculture & Food Processing', description: 'Abattoirs, cold storage, food manufacturing plants' },
    { name: 'Sports & Recreation', description: 'Aquatic centres, gyms, sports complexes' },
    { name: 'Mixed-Use Developments', description: 'Integrated residential/commercial/retail hubs' },
    { name: 'Specialist Facilities', description: 'Laboratories, cleanrooms, high-security facilities' },
    { name: 'Others', description: 'Other industry sectors not listed above' }
  ];

  // V1 Beta Testing - Exact 40 Industry Disciplines
  const disciplines = [
    { name: 'Hydraulic Engineering / Plumbing', description: 'Water supply, drainage, and plumbing systems' },
    { name: 'Mechanical Services (HVAC)', description: 'Heating, ventilation, and air conditioning systems' },
    { name: 'Fire Protection (Wet & Dry Systems)', description: 'Sprinkler systems, fire pumps, and suppression systems' },
    { name: 'Fire Engineering (Performance-Based Solutions)', description: 'Fire safety design and performance-based analysis' },
    { name: 'Electrical Engineering', description: 'Power distribution, lighting, and electrical systems' },
    { name: 'Communications & ICT', description: 'Telecommunications, data networks, and IT infrastructure' },
    { name: 'Security Systems', description: 'Access control, CCTV, and integrated security solutions' },
    { name: 'Vertical Transportation (Lifts, Escalators)', description: 'Elevator and escalator design and systems' },
    { name: 'Building Automation / BMS', description: 'Building management and automation systems' },
    { name: 'Acoustic Engineering', description: 'Sound control, noise management, and acoustic design' },
    { name: 'Lighting Design', description: 'Illumination design and lighting systems' },
    { name: 'Structural Engineering', description: 'Building structure design and analysis' },
    { name: 'Civil Engineering', description: 'Site development, utilities, and civil infrastructure' },
    { name: 'Geotechnical Engineering', description: 'Foundation design and soil engineering' },
    { name: 'Seismic Engineering', description: 'Earthquake-resistant design and seismic analysis' },
    { name: 'Architecture', description: 'Building design, space planning, and architectural solutions' },
    { name: 'Interior Design', description: 'Interior space planning and design' },
    { name: 'Landscape Architecture', description: 'Outdoor space design and landscape planning' },
    { name: 'Urban Design & Town Planning', description: 'Urban planning and community development' },
    { name: 'Sustainability / ESD (Environmentally Sustainable Design)', description: 'Environmental design and sustainability consulting' },
    { name: 'Energy Modelling & Efficiency', description: 'Energy performance analysis and efficiency optimization' },
    { name: 'Façade Engineering', description: 'Building envelope and façade design' },
    { name: 'Waterproofing Design', description: 'Water ingress protection and waterproofing systems' },
    { name: 'Roofing Systems', description: 'Roof design and roofing system selection' },
    { name: 'Cladding Systems', description: 'External cladding design and specification' },
    { name: 'Green Building Certification (NABERS, Green Star, WELL)', description: 'Green building rating and certification processes' },
    { name: 'Project Management', description: 'Construction project planning and management' },
    { name: 'Cost Planning / Quantity Surveying', description: 'Cost estimation and quantity surveying' },
    { name: 'Contract Administration', description: 'Contract management and administration' },
    { name: 'Design Management', description: 'Design coordination and management' },
    { name: 'Risk Management', description: 'Project risk assessment and management' },
    { name: 'Heritage Conservation', description: 'Heritage building restoration and conservation' },
    { name: 'Modular & Prefabrication Engineering', description: 'Prefabricated and modular construction systems' },
    { name: 'Industrial Process Engineering', description: 'Industrial facility and process design' },
    { name: 'Hazardous Materials Management (Asbestos, Lead)', description: 'Hazardous material assessment and management' },
    { name: 'Environmental Engineering', description: 'Environmental impact assessment and engineering' },
    { name: 'Traffic & Transport Planning', description: 'Traffic engineering and transport planning' },
    { name: 'Health Planning (Medical Equipment Integration)', description: 'Healthcare facility planning and medical equipment integration' },
    { name: 'Wayfinding & Signage Design', description: 'Navigation systems and signage design' },
    { name: 'Waste Management Planning', description: 'Waste management systems and planning' }
  ];

  const experienceLevels = [
    { 
      value: 'graduate', 
      label: 'Graduate / Beginner (0-2 years)',
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      explanation: 'AI provides detailed explanations, step-by-step guidance, educational context, and mentoring advice. Perfect for learning fundamental concepts and building confidence.',
      examples: [
        'Explains basic concepts like "What is a fire rating?" before discussing specific requirements',
        'Provides step-by-step compliance checklists with explanations for each step',
        'Includes educational context: "This requirement exists because..." with safety rationale',
        'Offers learning resources and suggests professional development pathways'
      ]
    },
    { 
      value: 'intermediate', 
      label: 'Intermediate (3-7 years)',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      explanation: 'AI offers practical solutions with moderate detail, focuses on real-world applications, and provides tips for professional development and efficiency improvements.',
      examples: [
        'Provides practical solutions: "For this scenario, you could use Method A or B, here\'s when to choose each"',
        'Focuses on real-world applications and common challenges you\'ll face',
        'Includes efficiency tips: "Pro tip: This calculation can be simplified by..."',
        'Suggests when to consult specialists and what questions to ask them'
      ]
    },
    { 
      value: 'senior', 
      label: 'Senior (8-15 years)',
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      explanation: 'AI provides advanced technical insights, discusses complex scenarios, offers strategic perspectives, and focuses on leadership and decision-making aspects.',
      examples: [
        'Discusses complex scenarios: "When dealing with conflicting code requirements, consider..."',
        'Offers strategic perspectives on project risks and mitigation strategies',
        'Focuses on leadership aspects: "When presenting this to stakeholders, emphasize..."',
        'Provides advanced technical insights and alternative design approaches'
      ]
    },
    { 
      value: 'expert', 
      label: 'Expert / Principal (15+ years)',
      icon: Brain,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      explanation: 'AI delivers concise, high-level insights, focuses on innovation and cutting-edge practices, discusses industry trends, and provides expert-to-expert technical discourse.',
      examples: [
        'Delivers concise, high-level insights without basic explanations',
        'Discusses cutting-edge practices and emerging industry trends',
        'Provides expert-to-expert technical discourse with advanced terminology',
        'Focuses on innovation opportunities and industry leadership perspectives'
      ]
    }
  ];

  const companyTypes = [
    'Construction Company',
    'Engineering Consultancy',
    'Architecture Firm',
    'Government Agency',
    'Educational Institution',
    'Property Developer',
    'Building Materials Supplier',
    'Independent Contractor',
    'Other'
  ];

  useEffect(() => {
    if (idToken) {
      setAuthToken(idToken);
      loadUserProfile();
      loadSubscriptionStatus();
      loadPersonalDocuments();
    }
  }, [idToken]);

  const loadUserProfile = async () => {
    try {
      const response = await apiEndpoints.getUserProfile();
      const profile = response.data;
      
      setUserPreferences({
        industry_sectors: profile.preferences?.industry_sectors || [],
        disciplines: profile.preferences?.disciplines || [],
        experience_level: profile.preferences?.experience_level || '',
        company_type: profile.preferences?.company_type || '',
        custom_instructions: profile.preferences?.custom_instructions || ''
      });
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      const response = await apiEndpoints.getSubscriptionStatus();
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  };

  const loadPersonalDocuments = async () => {
    try {
      const response = await apiEndpoints.getPersonalDocuments();
      setPersonalDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Failed to load personal documents:', error);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiEndpoints.updateUserPreferences(userPreferences);
      setSuccess('Your preferences have been saved successfully!');
      if (onPreferencesUpdate) {
        onPreferencesUpdate();
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSectorChange = (selectedSectors) => {
    setUserPreferences(prev => ({
      ...prev,
      industry_sectors: selectedSectors.map(sector => sector.name || sector)
    }));
  };

  const handleDisciplineChange = (selectedDisciplines) => {
    setUserPreferences(prev => ({
      ...prev,
      disciplines: selectedDisciplines.map(discipline => discipline.name || discipline)
    }));
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Account Type</Label>
              <div className="flex items-center gap-2">
                {subscriptionStatus?.is_trial ? (
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    Free Trial
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro Plan
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {subscriptionStatus?.trial_info && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Free Trial:</strong> {subscriptionStatus.trial_info.questions_remaining} questions remaining
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Personalization Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Personalization
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userPreferences.industry_sectors.length > 0 || userPreferences.disciplines.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">AI Personalization Active</span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {userPreferences.industry_sectors.length > 0 && (
                  <div>
                    <Label className="text-xs font-medium text-gray-500">Industry Sectors</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userPreferences.industry_sectors.slice(0, 3).map((sector, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-700">
                          {sector}
                        </Badge>
                      ))}
                      {userPreferences.industry_sectors.length > 3 && (
                        <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                          +{userPreferences.industry_sectors.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {userPreferences.disciplines.length > 0 && (
                  <div>
                    <Label className="text-xs font-medium text-gray-500">Industry Disciplines</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userPreferences.disciplines.slice(0, 3).map((discipline, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-green-200 text-green-700">
                          {discipline}
                        </Badge>
                      ))}
                      {userPreferences.disciplines.length > 3 && (
                        <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                          +{userPreferences.disciplines.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">
                Complete your personalization to get tailored AI responses
              </p>
              <Button 
                size="sm" 
                onClick={() => setActiveTab('personalization')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Set Up Personalization
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const PersonalizationTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Personalization Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Industry Sectors - V1 Beta Requirement */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Industry Sectors</h3>
            </div>
            <p className="text-sm text-gray-600">Select ALL industries you work in (17 options available):</p>
            
            <SmartAutoComplete
              options={industrySectors}
              selected={industrySectors.filter(sector => 
                userPreferences.industry_sectors.includes(sector.name)
              )}
              onSelectionChange={handleSectorChange}
              placeholder="Type to search industry sectors (e.g., Commercial, Health, Mining)..."
              label=""
              maxHeight="300px"
            />
          </div>

          {/* Industry Disciplines - V1 Beta Requirement */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Industry Disciplines</h3>
            </div>
            <p className="text-sm text-gray-600">Select your areas of expertise (40 options available):</p>
            
            <SmartAutoComplete
              options={disciplines}
              selected={disciplines.filter(discipline => 
                userPreferences.disciplines.includes(discipline.name)
              )}
              onSelectionChange={handleDisciplineChange}
              placeholder="Type to search disciplines (e.g., Structural, Fire, HVAC, Project Management)..."
              label=""
              maxHeight="400px"
            />
          </div>

          {/* Experience Level */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Experience Level</h3>
              <HelpCircle className="h-4 w-4 text-gray-400" title="Hover over options to see how AI adapts to your experience level" />
            </div>
            <p className="text-sm text-gray-600">Select your experience level to help AI tailor responses to your expertise:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experienceLevels.map((level) => {
                const Icon = level.icon;
                return (
                  <div key={level.value} className="group relative">
                    <button
                      onClick={() => setUserPreferences(prev => ({ ...prev, experience_level: level.value }))}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:shadow-md ${
                        userPreferences.experience_level === level.value
                          ? `${level.borderColor} ${level.bgColor} ${level.color}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${userPreferences.experience_level === level.value ? level.bgColor : 'bg-gray-100'}`}>
                            <Icon className={`h-5 w-5 ${userPreferences.experience_level === level.value ? level.color : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{level.label}</p>
                          </div>
                        </div>
                        {userPreferences.experience_level === level.value && (
                          <CheckCircle className={`h-5 w-5 ${level.color}`} />
                        )}
                      </div>
                    </button>
                    
                    {/* Hover Explanation Tooltip */}
                    <div className="absolute z-20 w-96 p-4 mt-2 text-sm bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 left-0">
                      <div className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900 mb-2">How AI adapts for {level.label.split(' (')[0]}:</p>
                          <p className="text-gray-700 mb-3 text-xs leading-relaxed">{level.explanation}</p>
                          
                          <div className="space-y-1">
                            <p className="font-medium text-gray-800 text-xs">Response Examples:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {level.examples.map((example, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-blue-500 mr-1">•</span>
                                  <span className="leading-tight">{example}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Company Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Company Type</h3>
            <div className="grid grid-cols-3 gap-3">
              {companyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setUserPreferences(prev => ({ ...prev, company_type: type }))}
                  className={`p-3 text-left rounded-lg border-2 transition-all ${
                    userPreferences.company_type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{type}</span>
                    {userPreferences.company_type === type && (
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Custom AI Instructions</h3>
            <Textarea
              placeholder="e.g., Always prioritize Australian standards over New Zealand, focus on cost-effective solutions, include safety considerations..."
              rows={4}
              value={userPreferences.custom_instructions}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, custom_instructions: e.target.value }))}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              These instructions will be included in every AI response to personalize your experience.
            </p>
          </div>

          {/* Success and Error Messages - Positioned above Save button */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={savePreferences} 
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Personalization Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const DocumentsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Personal Knowledge Bank
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">🔒 Private Document Storage</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Upload your personal documents (PDFs, Word, images)</li>
                <li>• AI will reference these in YOUR conversations only</li>
                <li>• Documents remain completely private to your account</li>
                <li>• Perfect for project specs, company standards, personal notes</li>
              </ul>
            </div>

            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {personalDocuments.length === 0 
                  ? "No documents uploaded yet"
                  : `${personalDocuments.length} document(s) in your Knowledge Bank`
                }
              </p>
              <Button 
                onClick={() => window.location.href = '/knowledge'}
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                Manage Documents
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center">
                <img 
                  src="/onesource-primary-logo.svg" 
                  alt="ONESource-ai" 
                  className="h-8 w-auto"
                />
              </div>
            </div>
            
            {/* Back Button - Positioned on RIGHT side */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={onClose || (() => window.location.href = '/chat')}
                variant="outline"
                className="flex items-center gap-2"
              >
                Back to Chat
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Profile</h1>
          <p className="text-gray-600">Manage your account and personalize your AI experience</p>
        </div>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="personalization" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Personalization
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="personalization">
            <PersonalizationTab />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;