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
import { CheckCircle, ArrowRight, ArrowLeft, Sparkles, Building, Users, Wrench } from 'lucide-react';

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

  // Define industry sectors and disciplines
  const industrySectors = [
    'Residential Construction',
    'Commercial Construction', 
    'Industrial Construction',
    'Infrastructure',
    'Mining',
    'Energy & Utilities',
    'Healthcare',
    'Education',
    'Hospitality',
    'Retail',
    'Transportation',
    'Government & Public',
    'Mixed-Use Development',
    'Renovation & Retrofit',
    'Green Building',
    'Prefabricated Construction',
    'High-Rise Construction'
  ];

  const disciplines = [
    'Structural Engineering',
    'Fire Safety Engineering',
    'Mechanical Engineering',
    'Electrical Engineering', 
    'Hydraulic Engineering',
    'Civil Engineering',
    'Geotechnical Engineering',
    'Environmental Engineering',
    'Building Services',
    'Project Management',
    'Construction Management',
    'Architecture',
    'Building Surveying',
    'Cost Estimation',
    'Quality Assurance',
    'Health & Safety',
    'Building Code Compliance',
    'Materials Engineering',
    'Acoustic Engineering',
    'Sustainability Consulting',
    'Building Information Modeling (BIM)',
    'Facility Management',
    'Urban Planning',
    'Landscape Architecture',
    'Interior Design',
    'Building Automation',
    'Renewable Energy Systems',
    'HVAC Design',
    'Plumbing Design',
    'Lighting Design',
    'Security Systems',
    'Telecommunications',
    'Vertical Transportation',
    'Waterproofing',
    'Insulation & Thermal Performance',
    'Seismic Design',
    'Wind Engineering',
    'Building Physics',
    'Asset Management',
    'Risk Assessment'
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-7 years)' },
    { value: 'senior', label: 'Senior Level (8-15 years)' },
    { value: 'expert', label: 'Expert Level (15+ years)' }
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

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/onesource-icon.svg" alt="ONESource-ai" className="h-12 w-12" />
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

          {/* Step 1: Industry Sectors */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  What industry sectors do you work in?
                </h3>
                <p className="text-gray-600">
                  Select all that apply. This helps us provide more relevant guidance for your projects.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-4 border rounded-lg">
                {industrySectors.map((sector) => (
                  <button
                    key={sector}
                    onClick={() => handleMultiSelect('industry_sectors', sector)}
                    className={`p-3 text-left rounded-lg border-2 transition-all hover:shadow-md ${
                      formData.industry_sectors.includes(sector)
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{sector}</span>
                      {formData.industry_sectors.includes(sector) && (
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {formData.industry_sectors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected sectors:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.industry_sectors.map((sector) => (
                      <Badge key={sector} variant="secondary" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Disciplines */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <Wrench className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  What are your areas of expertise?
                </h3>
                <p className="text-gray-600">
                  Choose the disciplines and specialties most relevant to your work.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-4 border rounded-lg">
                {disciplines.map((discipline) => (
                  <button
                    key={discipline}
                    onClick={() => handleMultiSelect('disciplines', discipline)}
                    className={`p-3 text-left rounded-lg border-2 transition-all hover:shadow-md ${
                      formData.disciplines.includes(discipline)
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{discipline}</span>
                      {formData.disciplines.includes(discipline) && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {formData.disciplines.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected disciplines:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.disciplines.map((discipline) => (
                      <Badge key={discipline} variant="secondary" className="text-xs">
                        {discipline}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Experience & Company */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Tell us about your experience
                </h3>
                <p className="text-gray-600">
                  This helps us calibrate responses to your level of expertise.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Experience Level */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Experience Level</Label>
                  <div className="space-y-3">
                    {experienceLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => handleSingleSelect('experience_level', level.value)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          formData.experience_level === level.value
                            ? 'border-purple-500 bg-purple-50 text-purple-900'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{level.label}</span>
                          {formData.experience_level === level.value && (
                            <CheckCircle className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Company Type */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Company Type</Label>
                  <div className="space-y-3">
                    {companyTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleSingleSelect('company_type', type)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          formData.company_type === type
                            ? 'border-purple-500 bg-purple-50 text-purple-900'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{type}</span>
                          {formData.company_type === type && (
                            <CheckCircle className="h-5 w-5 text-purple-600" />
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
                <p className="text-gray-600">
                  Your AI assistant is now personalized for your expertise and industry focus.
                </p>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 space-y-4">
                <h4 className="font-semibold text-lg text-gray-900 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                  Your Personalized Profile
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Industry Sectors ({formData.industry_sectors.length})</h5>
                    <div className="flex flex-wrap gap-1">
                      {formData.industry_sectors.slice(0, 3).map((sector) => (
                        <Badge key={sector} variant="outline" className="text-xs border-blue-200 text-blue-700">
                          {sector}
                        </Badge>
                      ))}
                      {formData.industry_sectors.length > 3 && (
                        <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                          +{formData.industry_sectors.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Disciplines ({formData.disciplines.length})</h5>
                    <div className="flex flex-wrap gap-1">
                      {formData.disciplines.slice(0, 3).map((discipline) => (
                        <Badge key={discipline} variant="outline" className="text-xs border-green-200 text-green-700">
                          {discipline}
                        </Badge>
                      ))}
                      {formData.disciplines.length > 3 && (
                        <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                          +{formData.disciplines.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Experience Level</h5>
                    <Badge variant="outline" className="border-purple-200 text-purple-700">
                      {experienceLevels.find(level => level.value === formData.experience_level)?.label}
                    </Badge>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Company Type</h5>
                    <Badge variant="outline" className="border-purple-200 text-purple-700">
                      {formData.company_type}
                    </Badge>
                  </div>
                </div>

                <Alert className="border-blue-200 bg-blue-50 mt-4">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Your responses will now be tailored to your expertise level and industry focus. 
                    You can always update these preferences later in your profile settings.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6">
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
                className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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