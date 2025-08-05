import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiEndpoints } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle } from 'lucide-react';

const PROFESSIONS = [
  'Architect',
  'Structural Engineer',
  'Civil Engineer',
  'Mechanical Engineer',
  'Electrical Engineer',
  'Hydraulic Engineer', 
  'Fire Safety Engineer',
  'Building Surveyor',
  'Construction Manager',
  'Project Manager',
  'Quantity Surveyor',
  'Building Designer',
  'Draftsperson',
  'Other'
];

const SECTORS = [
  'Residential',
  'Commercial',
  'Industrial',
  'Healthcare',
  'Education',
  'Retail',
  'Hospitality',
  'Infrastructure',
  'Data Centers',
  'Mixed Use',
  'Other'
];

const USE_CASES = [
  'Design compliance checking',
  'Code interpretation',
  'Technical problem solving',
  'Learning and education',
  'Project planning',
  'Quality assurance',
  'Client consultation',
  'Other'
];

const OnboardingFlow = ({ onComplete }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    profession: '',
    sector: '',
    use_case: '',
    marketing_consent: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiEndpoints.completeOnboarding(formData);
      onComplete?.();
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err.response?.data?.detail || 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-900 mb-2">
            Welcome to ONESource-ai
          </CardTitle>
          <p className="text-gray-600">
            Tell us a bit about yourself to get personalized construction industry insights
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Profession */}
            <div className="space-y-2">
              <Label htmlFor="profession">Profession *</Label>
              <Select 
                value={formData.profession} 
                onValueChange={(value) => handleInputChange('profession', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your profession" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONS.map((profession) => (
                    <SelectItem key={profession} value={profession}>
                      {profession}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sector */}
            <div className="space-y-2">
              <Label htmlFor="sector">Primary Sector *</Label>
              <Select 
                value={formData.sector} 
                onValueChange={(value) => handleInputChange('sector', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Use Case */}
            <div className="space-y-2">
              <Label htmlFor="use_case">Primary Use Case *</Label>
              <Select 
                value={formData.use_case} 
                onValueChange={(value) => handleInputChange('use_case', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="How will you primarily use ONESource-ai?" />
                </SelectTrigger>
                <SelectContent>
                  {USE_CASES.map((useCase) => (
                    <SelectItem key={useCase} value={useCase}>
                      {useCase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Marketing Consent */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="marketing"
                checked={formData.marketing_consent}
                onCheckedChange={(checked) => handleInputChange('marketing_consent', checked)}
              />
              <Label htmlFor="marketing" className="text-sm">
                I'd like to receive updates about new features and construction industry insights
              </Label>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">What's Next?</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Get 3 free expert construction questions</li>
                    <li>• Receive dual-layer responses (Technical + Mentoring)</li>
                    <li>• Access AU/NZ specific building standards</li>
                    <li>• Upgrade anytime for unlimited access</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !formData.name || !formData.profession || !formData.sector || !formData.use_case}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Setting up your account...
                </>
              ) : (
                'Complete Setup & Start Asking Questions'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;