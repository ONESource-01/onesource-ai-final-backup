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
  Home
} from 'lucide-react';

const UserProfile = ({ onBack }) => {
  const { user, idToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    industries: [],
    role: '',
    experience_level: '',
    response_style: 'balanced',
    ai_focus_areas: [],
    custom_instructions: ''
  });
  const [personalDocuments, setPersonalDocuments] = useState([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Industry options with icons and colors
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

  useEffect(() => {
    if (user && idToken) {
      setAuthToken(idToken);
      loadUserData();
    }
  }, [user, idToken]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load subscription status
      const subResponse = await apiEndpoints.getSubscriptionStatus();
      setSubscriptionStatus(subResponse.data);
      
      // Load user preferences (check if exists)
      try {
        const prefResponse = await fetch(`${apiEndpoints.BASE_URL}/user/preferences`, {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        if (prefResponse.ok) {
          const prefData = await prefResponse.json();
          setUserPreferences(prefData);
          setOnboardingCompleted(true);
        }
      } catch (error) {
        console.log('No existing preferences found');
      }

      // Load personal documents
      try {
        const docsResponse = await fetch(`${apiEndpoints.BASE_URL}/knowledge/personal-documents`, {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          setPersonalDocuments(docsData.documents || []);
        }
      } catch (error) {
        console.log('No personal documents found');
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIndustryToggle = (industryId) => {
    setUserPreferences(prev => ({
      ...prev,
      industries: prev.industries.includes(industryId)
        ? prev.industries.filter(id => id !== industryId)
        : [...prev.industries, industryId]
    }));
  };

  const savePreferences = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${apiEndpoints.BASE_URL}/user/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(userPreferences)
      });

      if (response.ok) {
        setOnboardingCompleted(true);
        alert('Preferences saved successfully!');
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (file) => {
    if (!file) return;

    try {
      setUploadingDocument(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tags', 'personal');

      const response = await fetch(`${apiEndpoints.BASE_URL}/knowledge/upload-personal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        alert('Document uploaded successfully!');
        loadUserData(); // Refresh document list
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploadingDocument(false);
    }
  };

  const getIndustryDisplay = () => {
    if (userPreferences.industries.length === 0) return 'No industries selected';
    
    return userPreferences.industries
      .map(id => industryOptions.find(opt => opt.id === id))
      .filter(Boolean)
      .map(industry => `${industry.icon} ${industry.name}`)
      .join(', ');
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Account Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Name</Label>
              <p className="text-lg font-semibold">{user?.displayName || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Email</Label>
              <p className="text-lg">{user?.email}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Crown className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Current Plan</p>
              <Badge className={`
                ${subscriptionStatus?.subscription_tier === 'starter' ? 'bg-gray-100 text-gray-800' : ''}
                ${subscriptionStatus?.subscription_tier === 'pro' ? 'bg-blue-100 text-blue-800' : ''}
                ${subscriptionStatus?.subscription_tier === 'pro_plus' ? 'bg-purple-100 text-purple-800' : ''}
              `}>
                {subscriptionStatus?.subscription_tier === 'starter' && '🆓 Starter'}
                {subscriptionStatus?.subscription_tier === 'pro' && '⭐ Pro'}
                {subscriptionStatus?.subscription_tier === 'pro_plus' && '👑 Pro-Plus'}
                {!subscriptionStatus?.subscription_tier && '🔄 Loading...'}
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600">Questions This Month</p>
              <p className="text-2xl font-bold text-green-700">
                {subscriptionStatus?.monthly_questions_used || 0}
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-gray-600">Personal Documents</p>
              <p className="text-2xl font-bold text-purple-700">{personalDocuments.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Personalization Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Personalization
          </CardTitle>
        </CardHeader>
        <CardContent>
          {onboardingCompleted ? (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">🎯 Your AI Focus Areas:</h4>
                <p className="text-gray-700">{getIndustryDisplay()}</p>
                {userPreferences.role && (
                  <p className="text-sm text-gray-600 mt-2">
                    <Briefcase className="inline h-4 w-4 mr-1" />
                    {userPreferences.role}
                  </p>
                )}
              </div>
              
              {userPreferences.custom_instructions && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">🤖 Custom AI Instructions:</h4>
                  <p className="text-gray-700 italic">"{userPreferences.custom_instructions}"</p>
                </div>
              )}
              
              <Button 
                onClick={() => setActiveTab('personalization')}
                variant="outline" 
                className="w-full"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit AI Personalization
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Personalize Your AI Experience</h3>
              <p className="text-gray-500 mb-4">
                Tell us about your industry focus and role to get more relevant responses
              </p>
              <Button onClick={() => setActiveTab('personalization')}>
                <Settings className="h-4 w-4 mr-2" />
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
          <CardTitle>Industry & Role Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Industry Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Select ALL industries you work in:
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {industryOptions.map((industry) => (
                <div
                  key={industry.id}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    userPreferences.industries.includes(industry.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleIndustryToggle(industry.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{industry.icon}</span>
                    <div>
                      <p className="font-medium">{industry.name}</p>
                      {userPreferences.industries.includes(industry.id) && (
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-1" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Your Role:</Label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={userPreferences.role}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="">Select your role...</option>
              {roleOptions.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Experience Level:</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'beginner', label: 'Beginner', icon: '🌱' },
                { value: 'intermediate', label: 'Intermediate', icon: '📈' },
                { value: 'expert', label: 'Expert', icon: '🏆' }
              ].map(level => (
                <div
                  key={level.value}
                  className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                    userPreferences.experience_level === level.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setUserPreferences(prev => ({ ...prev, experience_level: level.value }))}
                >
                  <span className="text-2xl block mb-1">{level.icon}</span>
                  <p className="font-medium">{level.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Custom AI Instructions:</Label>
            <Textarea
              placeholder="e.g., Always prioritize Australian standards over New Zealand, focus on cost-effective solutions, include safety considerations..."
              rows={4}
              value={userPreferences.custom_instructions}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, custom_instructions: e.target.value }))}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-2">
              These instructions will be included in every AI response to personalize your experience.
            </p>
          </div>

          <Button 
            onClick={savePreferences} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Personalization
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

            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">Upload Personal Documents</p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop files here, or click to browse
              </p>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
                onChange={(e) => handleDocumentUpload(e.target.files[0])}
                className="hidden"
                id="document-upload"
              />
              <label htmlFor="document-upload">
                <Button as="span" disabled={uploadingDocument}>
                  {uploadingDocument ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </>
                  )}
                </Button>
              </label>
            </div>

            {/* Documents List */}
            {personalDocuments.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Your Documents ({personalDocuments.length})</h4>
                <div className="space-y-2">
                  {personalDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{doc.filename}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded {new Date(doc.upload_timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Private</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading && !subscriptionStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src="/onesource-primary-logo.svg" 
                  alt="ONESource-ai" 
                  className="h-15 w-auto"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
                  <p className="text-gray-600">Manage your account and personalize your AI experience</p>
                </div>
              </div>
              <Button variant="outline" onClick={onBack}>
                <Home className="h-4 w-4 mr-2" />
                Back to Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="personalization" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Personalization
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Personal Documents
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