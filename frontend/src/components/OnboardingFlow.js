import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiEndpoints } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import SmartAutoComplete from './SmartAutoComplete';
import { 
  CheckCircle, ArrowRight, ArrowLeft, Sparkles, Building, Users, Wrench, 
  Info, HelpCircle, GraduationCap, Award, Star, Crown 
} from 'lucide-react';

const OnboardingFlow = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    industry_sectors: [],
    disciplines: [],
    experience_level: '',
    primary_focus: '',
    company_type: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Updated Industry Sectors from Beta Document
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

  // Updated Industry Disciplines from Beta Document (40 disciplines)
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

  // Enhanced Experience Levels with Detailed Explanations
  const experienceLevels = [
    { 
      value: 'graduate', 
      label: 'Graduate / Beginner (0-2 years)',
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      explanation: 'AI provides detailed explanations, step-by-step guidance, educational context, and mentoring advice. Perfect for learning fundamental concepts and building confidence.'
    },
    { 
      value: 'intermediate', 
      label: 'Intermediate (3-7 years)',
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      explanation: 'AI offers practical solutions with moderate detail, focuses on real-world applications, and provides tips for professional development and efficiency improvements.'
    },
    { 
      value: 'senior', 
      label: 'Senior (8-15 years)',
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      explanation: 'AI provides advanced technical insights, discusses complex scenarios, offers strategic perspectives, and focuses on leadership and decision-making aspects.'
    },
    { 
      value: 'expert', 
      label: 'Expert / Principal (15+ years)',
      icon: Crown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      explanation: 'AI delivers concise, high-level insights, focuses on innovation and cutting-edge practices, discusses industry trends, and provides expert-to-expert technical discourse.'
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
    document.title = 'Welcome Setup | ONESource-ai';
  }, []);

  const handleSectorChange = (selectedSectors) => {
    setFormData(prev => ({
      ...prev,
      industry_sectors: selectedSectors.map(sector => sector.name || sector)
    }));
  };

  const handleDisciplineChange = (selectedDisciplines) => {
    setFormData(prev => ({
      ...prev,
      disciplines: selectedDisciplines.map(discipline => discipline.name || discipline)
    }));
  };

  const handleSingleSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitOnboarding = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiEndpoints.completeOnboarding(formData);
      if (response.data.success) {
        onComplete();
      }
    } catch (error) {
      console.error('Onboarding submission failed:', error);
      setError(error.response?.data?.detail || 'Failed to save your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.industry_sectors.length > 0;
      case 2:
        return formData.disciplines.length > 0;
      case 3:
        return formData.experience_level && formData.company_type;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / 4) * 100;
  };

  const ExperienceLevelCard = ({ level, isSelected, onSelect }) => {
    const Icon = level.icon;
    
    return (
      <div className="group relative">
        <button
          onClick={() => onSelect(level.value)}
          className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:shadow-md ${
            isSelected
              ? `${level.borderColor} ${level.bgColor} ${level.color}`
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${isSelected ? level.bgColor : 'bg-gray-100'}`}>
                <Icon className={`h-5 w-5 ${isSelected ? level.color : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">{level.label}</p>
              </div>
            </div>
            {isSelected && (
              <CheckCircle className={`h-5 w-5 ${level.color}`} />
            )}
          </div>
        </button>
        
        {/* Hover Explanation Tooltip */}
        <div className="absolute z-10 w-80 p-3 mt-2 text-sm bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 mb-1">How AI adapts to your level:</p>
              <p className="text-gray-700">{level.explanation}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/ONESource_ICON.svg" alt="ONESource-ai" className="h-12 w-12" />
            <CardTitle className="text-3xl font-bold text-gray-900">
              Welcome to ONESource-ai
            </CardTitle>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={getProgressPercentage()} className="h-2" />
            <p className="text-sm text-gray-500">
              Step {currentStep} of 4 - Setting up your personalized AI assistant
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Step 1: Industry Sectors with Smart Auto-Complete */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  What industry sectors do you work in?
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Select all that apply. This helps us provide more relevant guidance for your projects. 
                  You can type to search or browse through the options below.
                </p>
              </div>

              <div className="max-w-3xl mx-auto">
                <SmartAutoComplete
                  options={industrySectors}
                  selected={industrySectors.filter(sector => 
                    formData.industry_sectors.includes(sector.name)
                  )}
                  onSelectionChange={handleSectorChange}
                  placeholder="Type to search industry sectors (e.g., Commercial, Health, Mining)..."
                  label="Industry Sectors"
                  maxHeight="300px"
                />
              </div>
            </div>
          )}

          {/* Step 2: Disciplines with Smart Auto-Complete */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <Wrench className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  What are your areas of expertise?
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Choose the disciplines and specialties most relevant to your work. 
                  With 40+ specialties available, use the search to quickly find your areas.
                </p>
              </div>

              <div className="max-w-3xl mx-auto">
                <SmartAutoComplete
                  options={disciplines}
                  selected={disciplines.filter(discipline => 
                    formData.disciplines.includes(discipline.name)
                  )}
                  onSelectionChange={handleDisciplineChange}
                  placeholder="Type to search disciplines (e.g., Structural, Fire, HVAC, Project Management)..."
                  label="Professional Disciplines"
                  maxHeight="400px"
                />
              </div>
            </div>
          )}

          {/* Step 3: Experience & Company with Enhanced Explanations */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Tell us about your experience
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  This helps us calibrate responses to your level of expertise. 
                  Hover over each option to see how AI responses are tailored to your experience.
                </p>
              </div>

              <div className="grid md:grid-cols-1 gap-8 max-w-3xl mx-auto">
                {/* Experience Level with Enhanced Cards */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label className="text-base font-semibold">Experience Level</Label>
                    <HelpCircle className="h-4 w-4 text-gray-400" title="Hover over options to see how AI adapts" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {experienceLevels.map((level) => (
                      <ExperienceLevelCard
                        key={level.value}
                        level={level}
                        isSelected={formData.experience_level === level.value}
                        onSelect={(value) => handleSingleSelect('experience_level', value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Company Type */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Company Type</Label>
                  <div className="grid md:grid-cols-3 gap-3">
                    {companyTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleSingleSelect('company_type', type)}
                        className={`p-3 text-left rounded-lg border-2 transition-all hover:shadow-md ${
                          formData.company_type === type
                            ? 'border-purple-500 bg-purple-50 text-purple-900'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{type}</span>
                          {formData.company_type === type && (
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Summary & Completion */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  You're all set!
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Your AI assistant is now personalized for your expertise and industry focus. 
                  You can always update these preferences later in your profile settings.
                </p>
              </div>

              {/* Enhanced Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 space-y-6 max-w-4xl mx-auto">
                <h4 className="font-semibold text-xl text-gray-900 flex items-center">
                  <Sparkles className="h-6 w-6 mr-2 text-blue-600" />
                  Your Personalized AI Profile
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Industry Sectors ({formData.industry_sectors.length})
                    </h5>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {formData.industry_sectors.slice(0, 6).map((sector) => (
                        <Badge key={sector} variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                          {sector}
                        </Badge>
                      ))}
                      {formData.industry_sectors.length > 6 && (
                        <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                          +{formData.industry_sectors.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700 flex items-center">
                      <Wrench className="h-4 w-4 mr-2" />
                      Disciplines ({formData.disciplines.length})
                    </h5>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {formData.disciplines.slice(0, 6).map((discipline) => (
                        <Badge key={discipline} variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                          {discipline}
                        </Badge>
                      ))}
                      {formData.disciplines.length > 6 && (
                        <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                          +{formData.disciplines.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700 flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Experience Level
                    </h5>
                    <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                      {experienceLevels.find(level => level.value === formData.experience_level)?.label}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Company Type
                    </h5>
                    <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                      {formData.company_type}
                    </Badge>
                  </div>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Smart AI Personalization Active!</strong> Your responses will now be tailored to your 
                    {' '}{experienceLevels.find(level => level.value === formData.experience_level)?.label.toLowerCase()} 
                    {' '}expertise level and focus on your selected industries and disciplines.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    step === currentStep 
                      ? 'bg-blue-600' 
                      : step < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={submitOnboarding}
                disabled={loading}
                className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Start Using ONESource-ai
                    <Sparkles className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;