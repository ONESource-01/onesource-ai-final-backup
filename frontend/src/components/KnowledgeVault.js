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
import { 
  Upload, 
  FileText, 
  Search, 
  BookOpen, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  File,
  Building2,
  User,
  Globe,
  Lock,
  Mail,
  Shield
} from 'lucide-react';

const KnowledgeVault = () => {
  const { user, idToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('community-upload');
  
  // Partner status
  const [partnerStatus, setPartnerStatus] = useState(null);
  const [checkingPartnerStatus, setCheckingPartnerStatus] = useState(true);
  
  // Partner registration states
  const [showRegistration, setShowRegistration] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    company_name: '',
    abn: '',
    primary_contact_name: '',
    primary_email: user?.email || '',
    backup_email: '',
    agreed_to_terms: false
  });
  
  // Upload states
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadTags, setUploadTags] = useState('');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Mentor note states
  const [mentorNote, setMentorNote] = useState({
    title: '',
    content: '',
    tags: '',
    category: '',
    attachmentUrl: ''
  });
  const [creatingNote, setCreatingNote] = useState(false);
  const [noteResult, setNoteResult] = useState(null);

  useEffect(() => {
    if (user && idToken) {
      setAuthToken(idToken);
      checkPartnerStatus();
    }
  }, [user, idToken]);

  const checkPartnerStatus = async () => {
    try {
      setCheckingPartnerStatus(true);
      const response = await fetch(`${apiEndpoints.BASE_URL}/partners/check-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setPartnerStatus(data);
      
      // Auto-fill registration form
      if (!data.is_partner && user?.email) {
        setRegistrationForm(prev => ({
          ...prev,
          primary_email: user.email,
          primary_contact_name: user.displayName || ''
        }));
      }
    } catch (error) {
      console.error('Error checking partner status:', error);
    } finally {
      setCheckingPartnerStatus(false);
    }
  };

  const handlePartnerRegistration = async (e) => {
    e.preventDefault();
    if (!registrationForm.agreed_to_terms) {
      alert('Please agree to the Terms and Conditions');
      return;
    }

    try {
      setRegistering(true);
      const response = await fetch(`${apiEndpoints.BASE_URL}/partners/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationForm)
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Registration successful! Check your email for confirmation.');
        setShowRegistration(false);
        checkPartnerStatus(); // Refresh partner status
      } else {
        alert(`Registration failed: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const handleCommunityUpload = async () => {
    if (!uploadFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('tags', uploadTags);

      const response = await fetch(`${apiEndpoints.BASE_URL}/knowledge/upload-community`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setUploadResult({
          success: true,
          message: data.message,
          details: data
        });
        setUploadFile(null);
        setUploadTags('');
      } else {
        setUploadResult({
          success: false,
          message: data.detail || 'Upload failed'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePersonalUpload = async () => {
    if (!uploadFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('tags', uploadTags);

      const response = await fetch(`${apiEndpoints.BASE_URL}/knowledge/upload-personal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setUploadResult({
          success: true,
          message: data.message,
          details: data
        });
        setUploadFile(null);
        setUploadTags('');
      } else {
        setUploadResult({
          success: false,
          message: data.detail || 'Upload failed'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    try {
      setSearching(true);
      const response = await fetch(
        `${apiEndpoints.BASE_URL}/knowledge/search?query=${encodeURIComponent(searchQuery)}&limit=10`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateMentorNote = async () => {
    if (!mentorNote.title || !mentorNote.content) {
      alert('Please fill in title and content');
      return;
    }

    try {
      setCreatingNote(true);
      const response = await fetch(`${apiEndpoints.BASE_URL}/knowledge/mentor-note`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: mentorNote.title,
          content: mentorNote.content,
          tags: mentorNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          category: mentorNote.category,
          attachment_url: mentorNote.attachmentUrl
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setNoteResult({
          success: true,
          message: data.message,
          details: data
        });
        setMentorNote({
          title: '',
          content: '',
          tags: '',
          category: '',
          attachmentUrl: ''
        });
      } else {
        setNoteResult({
          success: false,
          message: data.detail || 'Failed to create mentor note'
        });
      }
    } catch (error) {
      console.error('Mentor note error:', error);
      setNoteResult({
        success: false,
        message: 'Failed to create mentor note. Please try again.'
      });
    } finally {
      setCreatingNote(false);
    }
  };

  if (checkingPartnerStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your access level...</p>
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
            <div className="flex items-center space-x-4">
              <img 
                src="/onesource-logo.png" 
                alt="ONESource-ai" 
                className="h-10 w-10"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Knowledge Vault</h1>
                <p className="text-gray-600">Upload documents, create mentor notes, and search your construction knowledge base</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Partner Status Banner */}
        {partnerStatus && (
          <div className="mb-6">
            {partnerStatus.is_partner ? (
              <Alert className="border-green-200 bg-green-50">
                <Building2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Partner Access:</strong> {partnerStatus.partner_info.company_name} 
                  ({partnerStatus.partner_info.upload_count} uploads to Community Knowledge Bank)
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-blue-200 bg-blue-50">
                <User className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Standard User:</strong> You can upload to your Personal Knowledge Bank. 
                  <Button 
                    variant="link" 
                    className="p-0 ml-2 text-blue-600 underline"
                    onClick={() => setShowRegistration(true)}
                  >
                    Become a Partner
                  </Button>
                  to contribute to Community Knowledge Bank.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Partner Registration Modal */}
        {showRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Become a Community Knowledge Bank Partner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePartnerRegistration} className="space-y-4">
                  <div>
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={registrationForm.company_name}
                      onChange={(e) => setRegistrationForm(prev => ({...prev, company_name: e.target.value}))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="abn">Australian Business Number (ABN) *</Label>
                    <Input
                      id="abn"
                      value={registrationForm.abn}
                      onChange={(e) => setRegistrationForm(prev => ({...prev, abn: e.target.value}))}
                      placeholder="12 345 678 901"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="primary_contact_name">Primary Contact Name *</Label>
                    <Input
                      id="primary_contact_name"
                      value={registrationForm.primary_contact_name}
                      onChange={(e) => setRegistrationForm(prev => ({...prev, primary_contact_name: e.target.value}))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="primary_email">Primary Email *</Label>
                    <Input
                      id="primary_email"
                      type="email"
                      value={registrationForm.primary_email}
                      onChange={(e) => setRegistrationForm(prev => ({...prev, primary_email: e.target.value}))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="backup_email">Backup Email *</Label>
                    <Input
                      id="backup_email"
                      type="email"
                      value={registrationForm.backup_email}
                      onChange={(e) => setRegistrationForm(prev => ({...prev, backup_email: e.target.value}))}
                      placeholder="For when the primary contact leaves"
                      required
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Partner Terms & Conditions</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>• Your company will be credited when AI references your uploaded content</p>
                      <p>• You are responsible for the relevance and accuracy of uploaded content</p>
                      <p>• You confirm that you own or have rights to the content you upload</p>
                      <p>• Uploaded content will be used to enhance ONESource-ai responses for all users</p>
                      <p>• You will receive email receipts for all uploads</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="agreed_to_terms"
                      checked={registrationForm.agreed_to_terms}
                      onChange={(e) => setRegistrationForm(prev => ({...prev, agreed_to_terms: e.target.checked}))}
                      required
                    />
                    <Label htmlFor="agreed_to_terms" className="text-sm">
                      I agree to the Terms and Conditions above *
                    </Label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowRegistration(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={registering || !registrationForm.agreed_to_terms}
                    >
                      {registering ? 'Registering...' : 'Register as Partner'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="community-upload" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Community Upload
            </TabsTrigger>
            <TabsTrigger value="personal-upload" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Personal Upload
            </TabsTrigger>
            <TabsTrigger value="mentor-notes" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Mentor Notes
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Knowledge
            </TabsTrigger>
          </TabsList>

          {/* Community Knowledge Bank Upload */}
          <TabsContent value="community-upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Upload to Community Knowledge Bank
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Share technical documentation, installation guides, and product specifications with the construction community
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {!partnerStatus?.is_partner ? (
                  <Alert className="border-amber-200 bg-amber-50">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>Partner Access Required:</strong> Only registered partners can upload to the Community Knowledge Bank.
                      <Button 
                        variant="link" 
                        className="p-0 ml-2 text-amber-600 underline"
                        onClick={() => setShowRegistration(true)}
                      >
                        Register as Partner
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="community-file">Select Document</Label>
                      <input
                        id="community-file"
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files[0])}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        accept=".pdf,.docx,.doc,.txt"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Supports PDF, Word, images, and text files
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="community-tags">Tags (comma separated)</Label>
                      <Input
                        id="community-tags"
                        value={uploadTags}
                        onChange={(e) => setUploadTags(e.target.value)}
                        placeholder="building codes, NCC, fire safety"
                      />
                    </div>

                    <Button 
                      onClick={handleCommunityUpload}
                      disabled={uploading || !uploadFile}
                      className="w-full"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload to Community Knowledge Bank
                        </>
                      )}
                    </Button>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">✅ Benefits of Community Upload:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Your company gets credited in AI responses</li>
                        <li>• Helps build your brand authority in construction</li>
                        <li>• Email receipt sent to you and backup contact</li>
                        <li>• Available to all ONESource-ai users</li>
                      </ul>
                    </div>
                  </>
                )}

                {uploadResult && (
                  <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    {uploadResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={uploadResult.success ? "text-green-800" : "text-red-800"}>
                      {uploadResult.message}
                      {uploadResult.details?.email_receipt_sent && (
                        <div className="mt-2 text-sm">
                          📧 Upload receipt sent to your email
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Knowledge Bank Upload */}
          <TabsContent value="personal-upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-600" />
                  Upload to Personal Knowledge Bank
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Upload documents for your private use. Only you can access these documents in your AI conversations.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="personal-file">Select Document</Label>
                  <input
                    id="personal-file"
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    accept=".pdf,.docx,.doc,.txt"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supports PDF, Word, images, and text files
                  </p>
                </div>

                <div>
                  <Label htmlFor="personal-tags">Tags (comma separated)</Label>
                  <Input
                    id="personal-tags"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="project notes, specifications, references"
                  />
                </div>

                <Button 
                  onClick={handlePersonalUpload}
                  disabled={uploading || !uploadFile}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload to Personal Knowledge Bank
                    </>
                  )}
                </Button>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">🔒 Personal Knowledge Bank:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Completely private to your account</li>
                    <li>• AI can reference your documents in your conversations</li>
                    <li>• No attribution or company credit needed</li>
                    <li>• Perfect for project-specific documents</li>
                  </ul>
                </div>

                {uploadResult && (
                  <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    {uploadResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={uploadResult.success ? "text-green-800" : "text-red-800"}>
                      {uploadResult.message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mentor Notes */}
          <TabsContent value="mentor-notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  Create Mentor Notes
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Share your construction expertise and insights with the community
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="note-title">Title</Label>
                  <Input
                    id="note-title"
                    value={mentorNote.title}
                    onChange={(e) => setMentorNote(prev => ({...prev, title: e.target.value}))}
                    placeholder="e.g., Best practices for concrete pour in cold weather"
                  />
                </div>

                <div>
                  <Label htmlFor="note-content">Content</Label>
                  <Textarea
                    id="note-content"
                    value={mentorNote.content}
                    onChange={(e) => setMentorNote(prev => ({...prev, content: e.target.value}))}
                    placeholder="Share your insights, tips, and professional experience..."
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="note-tags">Tags</Label>
                    <Input
                      id="note-tags"
                      value={mentorNote.tags}
                      onChange={(e) => setMentorNote(prev => ({...prev, tags: e.target.value}))}
                      placeholder="concrete, cold weather, best practices"
                    />
                  </div>

                  <div>
                    <Label htmlFor="note-category">Category</Label>
                    <Input
                      id="note-category"
                      value={mentorNote.category}
                      onChange={(e) => setMentorNote(prev => ({...prev, category: e.target.value}))}
                      placeholder="e.g., Structural, HVAC, Electrical"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleCreateMentorNote}
                  disabled={creatingNote || !mentorNote.title || !mentorNote.content}
                  className="w-full"
                >
                  {creatingNote ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Mentor Note
                    </>
                  )}
                </Button>

                {noteResult && (
                  <Alert className={noteResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    {noteResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={noteResult.success ? "text-green-800" : "text-red-800"}>
                      {noteResult.message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Knowledge */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-indigo-600" />
                  Search Knowledge Banks
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Search across Community Knowledge Bank, your Personal Knowledge Bank, and mentor notes
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for construction knowledge..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={searching}>
                    {searching ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {searchResults && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Found {searchResults.total_results} results for "{searchResults.query}"
                    </div>

                    {/* Community Results */}
                    {searchResults.community_results?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Community Knowledge Bank ({searchResults.community_results.length})
                        </h3>
                        <div className="space-y-2">
                          {searchResults.community_results.map((result, index) => (
                            <div key={index} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-blue-900">{result.document.filename}</h4>
                                <Badge variant="outline" className="text-blue-700 border-blue-300">
                                  {result.company_attribution}
                                </Badge>
                              </div>
                              <p className="text-sm text-blue-800 mb-2">
                                {result.document.ai_metadata?.summary || 'No summary available'}
                              </p>
                              <div className="flex justify-between items-center text-xs text-blue-600">
                                <span>Relevance: {Math.round(result.similarity_score * 100)}%</span>
                                <span>Tags: {result.document.tags?.join(', ') || 'No tags'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Personal Results */}
                    {searchResults.personal_results?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Personal Knowledge Bank ({searchResults.personal_results.length})
                        </h3>
                        <div className="space-y-2">
                          {searchResults.personal_results.map((result, index) => (
                            <div key={index} className="border border-green-200 rounded-lg p-3 bg-green-50">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-green-900">{result.document.filename}</h4>
                                <Badge variant="outline" className="text-green-700 border-green-300">
                                  Private
                                </Badge>
                              </div>
                              <p className="text-sm text-green-800 mb-2">
                                {result.document.ai_metadata?.summary || 'No summary available'}
                              </p>
                              <div className="flex justify-between items-center text-xs text-green-600">
                                <span>Relevance: {Math.round(result.similarity_score * 100)}%</span>
                                <span>Tags: {result.document.tags?.join(', ') || 'No tags'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mentor Notes Results */}
                    {searchResults.mentor_note_results?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Mentor Notes ({searchResults.mentor_note_results.length})
                        </h3>
                        <div className="space-y-2">
                          {searchResults.mentor_note_results.map((result, index) => (
                            <div key={index} className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                              <h4 className="font-medium text-purple-900 mb-2">{result.note.title}</h4>
                              <p className="text-sm text-purple-800 mb-2">
                                {result.note.content.substring(0, 200)}...
                              </p>
                              <div className="flex justify-between items-center text-xs text-purple-600">
                                <span>Category: {result.note.category || 'General'}</span>
                                <span>Relevance: {Math.round(result.similarity_score * 100)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.total_results === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No results found. Try different keywords or upload more documents.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default KnowledgeVault;