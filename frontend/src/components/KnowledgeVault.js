import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Upload, 
  FileText, 
  Users, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Building,
  Plus,
  X,
  Eye,
  Download
} from 'lucide-react';
import { apiEndpoints } from '../utils/api';

const KnowledgeVault = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [personalDocuments, setPersonalDocuments] = useState([]);
  const [communityDocuments, setCommunityDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  
  // Partner registration form
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    company_name: '',
    abn_acn: '',
    contact_person: '',
    email: '',
    phone: '',
    industry_sector: '',
    description: ''
  });
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [partnerResult, setPartnerResult] = useState(null);

  useEffect(() => {
    document.title = 'Knowledge Vault | ONESource-ai';
  }, []);

  // Redirect if not authenticated
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handlePersonalUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('upload_type', 'personal');

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await apiEndpoints.uploadDocuments(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadResult({
        success: true,
        message: `Successfully uploaded ${files.length} document(s) to your Personal Knowledge Bank`
      });

      // Refresh documents list
      loadPersonalDocuments();
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResult({
        success: false,
        message: error.response?.data?.detail || 'Upload failed'
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadResult(null);
      }, 3000);
    }
  };

  const handlePartnerRegistration = async (e) => {
    e.preventDefault();
    setPartnerLoading(true);
    setPartnerResult(null);

    try {
      const response = await apiEndpoints.registerPartner(partnerForm);
      setPartnerResult({
        success: true,
        message: response.data.message
      });
      setShowPartnerForm(false);
      setPartnerForm({
        company_name: '',
        abn_acn: '',
        contact_person: '',
        email: '',
        phone: '',
        industry_sector: '',
        description: ''
      });
    } catch (error) {
      console.error('Partner registration failed:', error);
      setPartnerResult({
        success: false,
        message: error.response?.data?.detail || 'Registration failed'
      });
    } finally {
      setPartnerLoading(false);
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

  const loadCommunityDocuments = async () => {
    try {
      const response = await apiEndpoints.getCommunityDocuments();
      setCommunityDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Failed to load community documents:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadPersonalDocuments();
      loadCommunityDocuments();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <img 
                  src="/onesource-primary-logo.svg" 
                  alt="ONESource-ai" 
                  className="h-24 w-auto mr-3"
                />
              </a>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/chat" className="text-gray-600 hover:text-gray-900">Chat</a>
              <Button asChild>
                <a href="/chat">Go to Chat</a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Vault</h1>
          <p className="text-gray-600">
            Manage your documents and access the community knowledge base for enhanced AI responses
          </p>
        </div>

        {/* Results Display */}
        {(uploadResult || partnerResult) && (
          <div className="mb-6">
            {uploadResult && (
              <Alert className={uploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={uploadResult.success ? 'text-green-700' : 'text-red-700'}>
                  {uploadResult.message}
                </AlertDescription>
              </Alert>
            )}
            {partnerResult && (
              <Alert className={partnerResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={partnerResult.success ? 'text-green-700' : 'text-red-700'}>
                  {partnerResult.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Knowledge Vault Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Personal Knowledge Bank
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Community Knowledge Bank
            </TabsTrigger>
          </TabsList>

          {/* Personal Knowledge Bank */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Your Private Document Collection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Documents uploaded here are private to your account and will be used to enhance AI responses in your conversations. 
                    Supported formats: PDF, DOC, DOCX, TXT.
                  </AlertDescription>
                </Alert>

                {/* Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="personal-upload" className="cursor-pointer">
                      <span className="text-lg font-medium text-gray-700">Upload Documents</span>
                      <p className="text-gray-500">Select PDF, DOC, DOCX, or TXT files</p>
                    </Label>
                    <Input
                      id="personal-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handlePersonalUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <Button 
                      onClick={() => document.getElementById('personal-upload').click()}
                      disabled={isUploading}
                      className="mt-2"
                    >
                      {isUploading ? 'Uploading...' : 'Choose Files'}
                    </Button>
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Upload Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                {/* Personal Documents List */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Your Documents ({personalDocuments.length})</h3>
                  {personalDocuments.length > 0 ? (
                    <div className="space-y-2">
                      {personalDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm font-medium">{doc.name || `Document ${index + 1}`}</span>
                          </div>
                          <Badge variant="outline">Private</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No documents uploaded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Knowledge Bank */}
          <TabsContent value="community" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Verified Partner Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This knowledge base contains verified content from trusted construction industry partners. 
                    All content is reviewed for accuracy and compliance with AU/NZ standards.
                  </AlertDescription>
                </Alert>

                {/* Partner Registration CTA */}
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-700 flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      Become a Verified Partner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700 mb-4">
                      Are you a construction industry professional or supplier? Contribute your expertise 
                      to the community and gain recognition as a verified partner.
                    </p>
                    <Button 
                      onClick={() => setShowPartnerForm(true)}
                      variant="outline"
                      className="border-green-600 text-green-700 hover:bg-green-100"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Apply for Partnership
                    </Button>
                  </CardContent>
                </Card>

                {/* Community Documents */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Community Content ({communityDocuments.length})</h3>
                  {communityDocuments.length > 0 ? (
                    <div className="space-y-2">
                      {communityDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-green-600 mr-2" />
                            <div>
                              <span className="text-sm font-medium block">{doc.name || `Document ${index + 1}`}</span>
                              {doc.partner && (
                                <span className="text-xs text-gray-500">by {doc.partner}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="border-green-200 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No community content available yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Partner Registration Modal */}
        {showPartnerForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Partner Registration
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowPartnerForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePartnerRegistration} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name *</Label>
                      <Input
                        id="company_name"
                        value={partnerForm.company_name}
                        onChange={(e) => setPartnerForm({...partnerForm, company_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="abn_acn">ABN/ACN *</Label>
                      <Input
                        id="abn_acn"
                        value={partnerForm.abn_acn}
                        onChange={(e) => setPartnerForm({...partnerForm, abn_acn: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_person">Contact Person *</Label>
                      <Input
                        id="contact_person"
                        value={partnerForm.contact_person}
                        onChange={(e) => setPartnerForm({...partnerForm, contact_person: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={partnerForm.email}
                        onChange={(e) => setPartnerForm({...partnerForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={partnerForm.phone}
                        onChange={(e) => setPartnerForm({...partnerForm, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry_sector">Industry Sector *</Label>
                      <Input
                        id="industry_sector"
                        value={partnerForm.industry_sector}
                        onChange={(e) => setPartnerForm({...partnerForm, industry_sector: e.target.value})}
                        placeholder="e.g. Structural Engineering, Building Materials"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      value={partnerForm.description}
                      onChange={(e) => setPartnerForm({...partnerForm, description: e.target.value})}
                      placeholder="Brief description of your company and expertise"
                      rows={3}
                    />
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      We'll verify your ABN and review your application. Approved partners can upload 
                      content to the Community Knowledge Bank with proper attribution.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowPartnerForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={partnerLoading}>
                      {partnerLoading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeVault;