import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Building2,
  Briefcase,
  GraduationCap,
  Target,
  Sparkles
} from 'lucide-react';

const OnboardingFlow = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    industries: [],
    role: '',
    experience_level: '',
    response_style: 'balanced',
    custom_instructions: ''
  });

  const steps = [
    { id: 'industries', title: 'Industry Focus', icon: Building2 },
    { id: 'role', title: 'Your Role', icon: Briefcase },
    { id: 'experience', title: 'Experience Level', icon: GraduationCap },
    { id: 'preferences', title: 'AI Preferences', icon: Target }
  ];

  const industryOptions = [
    { id: 'commercial', name: 'Commercial Construction', icon: '🏢', color: 'blue' },
    { id: 'residential', name: 'Residential Building', icon: '🏠', color: 'green' },
    { id: 'fire_safety', name: 'Fire Safety Systems', icon: '🔥', color: 'red' },
    { id: 'structural', name: 'Structural Engineering', icon: '🏗️', color: 'gray' },
    { id: 'electrical', name: 'Electrical Systems', icon: '⚡', color: 'yellow' },
    { id: 'hvac', name: 'HVAC Design', icon: '🌡️', color: 'indigo' },
    { id: 'compliance', name: 'Building Compliance', icon: '📋', color: 'purple' },
    { id: 'project_mgmt', name: 'Project Management', icon: '📊', color: 'pink' }
  ];

  const roleOptions = [
    'Project Manager',
    'Structural Engineer', 
    'Fire Safety Engineer',
    'Electrical Engineer',
    'Building Designer',
    'Compliance Officer',
    'Construction Manager',
    'Building Inspector',
    'Architect',
    'Other'
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', desc: 'New to the industry', icon: '🌱' },
    { value: 'intermediate', label: 'Intermediate', desc: '2-10 years experience', icon: '📈' },
    { value: 'expert', label: 'Expert', desc: '10+ years experience', icon: '🏆' }
  ];

  const responseStyles = [
    { value: 'technical', label: 'Technical Focus', desc: 'Detailed technical information', icon: '⚙️' },
    { value: 'balanced', label: 'Balanced', desc: 'Mix of technical and practical', icon: '⚖️' },
    { value: 'practical', label: 'Practical Focus', desc: 'Real-world applications', icon: '🔧' }
  ];

  const handleIndustryToggle = (industryId) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.includes(industryId)
        ? prev.industries.filter(id => id !== industryId)
        : [...prev.industries, industryId]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.industries.length > 0;
      case 1: return formData.role.length > 0;
      case 2: return formData.experience_level.length > 0;
      case 3: return formData.response_style.length > 0;
      default: return true;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Industries
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What industries do you work in?</h2>
              <p className="text-gray-600">Select all that apply - this helps personalize your AI responses</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {industryOptions.map((industry) => (
                <div
                  key={industry.id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                    formData.industries.includes(industry.id)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleIndustryToggle(industry.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{industry.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{industry.name}</p>
                      {formData.industries.includes(industry.id) && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-600">Selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {formData.industries.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  ✅ Great! Selected {formData.industries.length} {formData.industries.length === 1 ? 'industry' : 'industries'}
                </p>
              </div>
            )}
          </div>
        );

      case 1: // Role
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your role?</h2>
              <p className="text-gray-600">This helps us understand your perspective and responsibilities</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roleOptions.map((role) => (
                <div
                  key={role}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.role === role
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, role }))}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{role}</span>
                    {formData.role === role && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2: // Experience
        return (
          <div className="space-y-6">
            <div className="text-center">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your experience level?</h2>
              <p className="text-gray-600">This helps us adjust the complexity of our responses</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {experienceLevels.map((level) => (
                <div
                  key={level.value}
                  className={`p-6 border-2 rounded-xl cursor-pointer text-center transition-all transform hover:scale-105 ${
                    formData.experience_level === level.value
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, experience_level: level.value }))}
                >
                  <span className="text-4xl block mb-3">{level.icon}</span>
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{level.label}</h3>
                  <p className="text-sm text-gray-600">{level.desc}</p>
                  {formData.experience_level === level.value && (
                    <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mt-3" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 3: // Preferences
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-16 w-16 mx-auto mb-4 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How should AI respond to you?</h2>
              <p className="text-gray-600">Choose your preferred response style</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {responseStyles.map((style) => (
                <div
                  key={style.value}
                  className={`p-6 border-2 rounded-xl cursor-pointer text-center transition-all transform hover:scale-105 ${
                    formData.response_style === style.value
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, response_style: style.value }))}
                >
                  <span className="text-4xl block mb-3">{style.icon}</span>
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{style.label}</h3>
                  <p className="text-sm text-gray-600">{style.desc}</p>
                  {formData.response_style === style.value && (
                    <CheckCircle className="h-6 w-6 text-orange-600 mx-auto mt-3" />
                  )}
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">🤖 Optional: Custom AI Instructions</h3>
              <textarea
                className="w-full p-3 border border-blue-200 rounded-lg resize-none"
                rows={3}
                placeholder="e.g., Always prioritize Australian standards over New Zealand, focus on cost-effective solutions, include safety considerations..."
                value={formData.custom_instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, custom_instructions: e.target.value }))}
              />
              <p className="text-sm text-blue-600 mt-2">
                These instructions will personalize every AI response specifically for you.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/onesource-logo.png" alt="ONESource-ai" className="h-12 w-12" />
            <CardTitle className="text-3xl font-bold text-gray-900">
              Welcome to ONESource-ai
            </CardTitle>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-center gap-4 mt-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    index < currentStep ? 'bg-green-500 border-green-500 text-white' :
                    index === currentStep ? 'bg-blue-500 border-blue-500 text-white' :
                    'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${
                    index <= currentStep ? 'text-gray-800 font-medium' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div>
              <Button
                variant="ghost"
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip for now
              </Button>
            </div>
            
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Complete Setup
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;