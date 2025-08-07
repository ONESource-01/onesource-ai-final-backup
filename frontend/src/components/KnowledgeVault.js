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
  Image,
  FileType
} from 'lucide-react';

const KnowledgeVault = () => {
  const { user, idToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  
  // Upload states
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    tags: '',
    isSupplierContent: false,
    supplierName: '',
    supplierAbn: ''
  });

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

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (idToken) {
      setAuthToken(idToken);
    }
  }, [idToken]);

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    try {
      setUploading(true);
      setUploadResult(null);

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('tags', uploadForm.tags);
      formData.append('is_supplier_content', uploadForm.isSupplierContent);
      formData.append('supplier_name', uploadForm.supplierName);
      formData.append('supplier_abn', uploadForm.supplierAbn);

      const response = await apiEndpoints.uploadDocument(formData);
      
      setUploadResult({
        success: true,
        message: response.data.message,
        documentId: response.data.document_id,
        summary: response.data.extracted_summary,
        detectedTags: response.data.detected_tags,
        documentType: response.data.document_type,
        supplierMentions: response.data.supplier_mentions
      });

      // Reset form
      setUploadFile(null);
      setUploadForm({
        tags: '',
        isSupplierContent: false,
        supplierName: '',
        supplierAbn: ''
      });

    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadResult({
        success: false,
        message: error.response?.data?.detail || 'Failed to upload document'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateMentorNote = async () => {
    if (!mentorNote.title || !mentorNote.content) return;

    try {
      setCreatingNote(true);
      setNoteResult(null);

      const response = await apiEndpoints.createMentorNote({
        title: mentorNote.title,
        content: mentorNote.content,
        tags: mentorNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        category: mentorNote.category || null,
        attachment_url: mentorNote.attachmentUrl || null
      });

      setNoteResult({
        success: true,
        message: response.data.message,
        noteId: response.data.note_id,
        suggestedTags: response.data.suggested_tags,
        category: response.data.category
      });

      // Reset form
      setMentorNote({
        title: '',
        content: '',
        tags: '',
        category: '',
        attachmentUrl: ''
      });

    } catch (error) {
      console.error('Error creating mentor note:', error);
      setNoteResult({
        success: false,
        message: error.response?.data?.detail || 'Failed to create mentor note'
      });
    } finally {
      setCreatingNote(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setSearchResults(null);

      const response = await apiEndpoints.searchKnowledgeBase(searchQuery, 10, true);
      setSearchResults(response.data);

    } catch (error) {
      console.error('Error searching knowledge base:', error);
      setSearchResults({
        query: searchQuery,
        document_results: [],
        mentor_note_results: [],
        total_results: 0,
        error: error.response?.data?.detail || 'Search failed'
      });
    } finally {
      setSearching(false);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename?.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
      return <Image className="h-4 w-4" />;
    } else if (['pdf'].includes(ext)) {
      return <FileType className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <Card>
          <CardContent className="p-6">
            <p style={{ color: '#4b6b8b' }}>Please sign in to access the Knowledge Vault.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/onesource-logo.png" 
              alt="ONESource-ai" 
              className="h-10 w-auto"
            />
            <h1 className="text-3xl font-bold" style={{ color: '#0f2f57' }}>
              Knowledge Vault
            </h1>
          </div>
          <p style={{ color: '#4b6b8b' }}>
            Upload documents, create mentor notes, and search your construction knowledge base
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3" style={{ backgroundColor: '#c9d6e4' }}>
            <TabsTrigger value="upload" style={{ color: '#4b6b8b' }}>
              Document Upload
            </TabsTrigger>
            <TabsTrigger value="notes" style={{ color: '#4b6b8b' }}>
              Mentor Notes
            </TabsTrigger>
            <TabsTrigger value="search" style={{ color: '#4b6b8b' }}>
              Search Knowledge
            </TabsTrigger>
          </TabsList>

          {/* Document Upload Tab */}
          <TabsContent value="upload">
            <Card style={{ borderColor: '#c9d6e4' }}>
              <CardHeader>
                <CardTitle style={{ color: '#0f2f57' }}>
                  <Upload className="h-5 w-5 inline mr-2" />
                  Upload Construction Documents
                </CardTitle>
                <p style={{ color: '#4b6b8b' }}>
                  Upload PDFs, Word docs, images, or text files to add to your knowledge base
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <Label htmlFor="file-upload" className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                      Select Document
                    </Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: '#c9d6e4' }}>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                        onChange={(e) => setUploadFile(e.target.files[0])}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 mx-auto mb-4" style={{ color: '#4b6b8b' }} />
                        {uploadFile ? (
                          <div className="flex items-center justify-center gap-2">
                            {getFileIcon(uploadFile.name)}
                            <span style={{ color: '#0f2f57' }}>{uploadFile.name}</span>
                          </div>
                        ) : (
                          <div>
                            <p style={{ color: '#4b6b8b' }}>Click to select file or drag and drop</p>
                            <p className="text-sm mt-2" style={{ color: '#95a6b7' }}>
                              Supports PDF, Word, images, and text files
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Upload Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tags" className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                        Tags (comma separated)
                      </Label>
                      <Input
                        id="tags"
                        value={uploadForm.tags}
                        onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                        placeholder="building codes, NCC, fire safety"
                        style={{ borderColor: '#c9d6e4' }}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="supplier-content"
                        checked={uploadForm.isSupplierContent}
                        onChange={(e) => setUploadForm({...uploadForm, isSupplierContent: e.target.checked})}
                      />
                      <Label htmlFor="supplier-content" style={{ color: '#0f2f57' }}>
                        This is supplier content
                      </Label>
                    </div>
                  </div>

                  {uploadForm.isSupplierContent && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #16a34a' }}>
                      <div>
                        <Label htmlFor="supplier-name" className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                          Supplier Name
                        </Label>
                        <Input
                          id="supplier-name"
                          value={uploadForm.supplierName}
                          onChange={(e) => setUploadForm({...uploadForm, supplierName: e.target.value})}
                          placeholder="ABC Construction Supplies"
                          style={{ borderColor: '#c9d6e4' }}
                        />
                      </div>

                      <div>
                        <Label htmlFor="supplier-abn" className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                          Supplier ABN (Optional)
                        </Label>
                        <Input
                          id="supplier-abn"
                          value={uploadForm.supplierAbn}
                          onChange={(e) => setUploadForm({...uploadForm, supplierAbn: e.target.value})}
                          placeholder="12 345 678 901"
                          style={{ borderColor: '#c9d6e4' }}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleFileUpload}
                    disabled={!uploadFile || uploading}
                    className="w-full"
                    style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing Document...
                      </>
                    ) : (
                      'Upload Document'
                    )}
                  </Button>

                  {/* Upload Result */}
                  {uploadResult && (
                    <Alert style={{ 
                      backgroundColor: uploadResult.success ? '#f0fdf4' : '#fef2f2',
                      borderColor: uploadResult.success ? '#16a34a' : '#dc2626'
                    }}>
                      <AlertDescription style={{ color: uploadResult.success ? '#16a34a' : '#dc2626' }}>
                        <div className="flex items-center gap-2">
                          {uploadResult.success ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <span>{uploadResult.message}</span>
                        </div>
                        
                        {uploadResult.success && (
                          <div className="mt-3 space-y-2">
                            {uploadResult.summary && (
                              <div>
                                <strong>AI Summary:</strong>
                                <p className="text-sm mt-1">{uploadResult.summary}</p>
                              </div>
                            )}
                            
                            {uploadResult.detectedTags && uploadResult.detectedTags.length > 0 && (
                              <div>
                                <strong>Detected Tags:</strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {uploadResult.detectedTags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {uploadResult.documentType && (
                              <div>
                                <strong>Document Type:</strong> {uploadResult.documentType}
                              </div>
                            )}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mentor Notes Tab */}
          <TabsContent value="notes">
            <Card style={{ borderColor: '#c9d6e4' }}>
              <CardHeader>
                <CardTitle style={{ color: '#0f2f57' }}>
                  <BookOpen className="h-5 w-5 inline mr-2" />
                  Create Mentor Notes
                </CardTitle>
                <p style={{ color: '#4b6b8b' }}>
                  Share your construction expertise with enhanced wiki-style contributions
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="note-title" className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                      Note Title
                    </Label>
                    <Input
                      id="note-title"
                      value={mentorNote.title}
                      onChange={(e) => setMentorNote({...mentorNote, title: e.target.value})}
                      placeholder="Fire Safety Requirements for Commercial Buildings"
                      style={{ borderColor: '#c9d6e4' }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="note-content" className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                      Note Content
                    </Label>
                    <Textarea
                      id="note-content"
                      value={mentorNote.content}
                      onChange={(e) => setMentorNote({...mentorNote, content: e.target.value})}
                      placeholder="Detailed explanation of fire safety requirements, relevant codes, and best practices..."
                      rows={8}
                      style={{ borderColor: '#c9d6e4' }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="note-tags" className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                        Tags (comma separated)
                      </Label>
                      <Input
                        id="note-tags"
                        value={mentorNote.tags}
                        onChange={(e) => setMentorNote({...mentorNote, tags: e.target.value})}
                        placeholder="fire safety, NCC, commercial"
                        style={{ borderColor: '#c9d6e4' }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="note-category" className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                        Category (Optional)
                      </Label>
                      <Input
                        id="note-category"
                        value={mentorNote.category}
                        onChange={(e) => setMentorNote({...mentorNote, category: e.target.value})}
                        placeholder="Fire Safety"
                        style={{ borderColor: '#c9d6e4' }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="attachment-url" className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                      Attachment URL (Optional)
                    </Label>
                    <Input
                      id="attachment-url"
                      value={mentorNote.attachmentUrl}
                      onChange={(e) => setMentorNote({...mentorNote, attachmentUrl: e.target.value})}
                      placeholder="https://example.com/additional-resource.pdf"
                      style={{ borderColor: '#c9d6e4' }}
                    />
                  </div>

                  <Button
                    onClick={handleCreateMentorNote}
                    disabled={!mentorNote.title || !mentorNote.content || creatingNote}
                    className="w-full"
                    style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}
                  >
                    {creatingNote ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating Note...
                      </>
                    ) : (
                      'Create Mentor Note'
                    )}
                  </Button>

                  {/* Note Creation Result */}
                  {noteResult && (
                    <Alert style={{ 
                      backgroundColor: noteResult.success ? '#f0fdf4' : '#fef2f2',
                      borderColor: noteResult.success ? '#16a34a' : '#dc2626'
                    }}>
                      <AlertDescription style={{ color: noteResult.success ? '#16a34a' : '#dc2626' }}>
                        <div className="flex items-center gap-2">
                          {noteResult.success ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <span>{noteResult.message}</span>
                        </div>
                        
                        {noteResult.success && noteResult.suggestedTags && (
                          <div className="mt-3">
                            <strong>AI Suggested Tags:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {noteResult.suggestedTags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <Card style={{ borderColor: '#c9d6e4' }}>
              <CardHeader>
                <CardTitle style={{ color: '#0f2f57' }}>
                  <Search className="h-5 w-5 inline mr-2" />
                  Search Knowledge Base
                </CardTitle>
                <p style={{ color: '#4b6b8b' }}>
                  Find relevant information from uploaded documents and mentor notes
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for construction standards, codes, materials..."
                      className="flex-1"
                      style={{ borderColor: '#c9d6e4' }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={!searchQuery.trim() || searching}
                      style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}
                    >
                      {searching ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Searching...
                        </>
                      ) : (
                        'Search'
                      )}
                    </Button>
                  </div>

                  {/* Search Results */}
                  {searchResults && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold" style={{ color: '#0f2f57' }}>
                          Search Results
                        </h3>
                        <Badge variant="outline">
                          {searchResults.total_results} results found
                        </Badge>
                      </div>

                      {searchResults.error ? (
                        <Alert style={{ backgroundColor: '#fef2f2', borderColor: '#dc2626' }}>
                          <AlertDescription style={{ color: '#dc2626' }}>
                            {searchResults.error}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-4">
                          {/* Document Results */}
                          {searchResults.document_results && searchResults.document_results.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3" style={{ color: '#0f2f57' }}>
                                Documents ({searchResults.document_results.length})
                              </h4>
                              <div className="space-y-3">
                                {searchResults.document_results.map((result, index) => (
                                  <div key={index} className="p-4 rounded-lg border" style={{ borderColor: '#c9d6e4' }}>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        {getFileIcon(result.document.filename)}
                                        <span className="font-medium" style={{ color: '#0f2f57' }}>
                                          {result.document.filename}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          {(result.similarity_score * 100).toFixed(1)}% match
                                        </Badge>
                                        {result.is_supplier && (
                                          <Badge variant="secondary" className="text-xs">
                                            Supplier
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <p className="text-sm mb-2" style={{ color: '#4b6b8b' }}>
                                      {result.document.extracted_text?.substring(0, 300)}...
                                    </p>
                                    
                                    {result.document.ai_metadata?.tags && (
                                      <div className="flex flex-wrap gap-1">
                                        {result.document.ai_metadata.tags.slice(0, 5).map((tag, tagIndex) => (
                                          <Badge key={tagIndex} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Mentor Note Results */}
                          {searchResults.mentor_note_results && searchResults.mentor_note_results.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3" style={{ color: '#0f2f57' }}>
                                Mentor Notes ({searchResults.mentor_note_results.length})
                              </h4>
                              <div className="space-y-3">
                                {searchResults.mentor_note_results.map((result, index) => (
                                  <div key={index} className="p-4 rounded-lg border" style={{ borderColor: '#c9d6e4' }}>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        <span className="font-medium" style={{ color: '#0f2f57' }}>
                                          {result.note.title}
                                        </span>
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {(result.similarity_score * 100).toFixed(1)}% match
                                      </Badge>
                                    </div>
                                    
                                    <p className="text-sm mb-2" style={{ color: '#4b6b8b' }}>
                                      {result.note.content.substring(0, 300)}...
                                    </p>
                                    
                                    {result.note.tags && (
                                      <div className="flex flex-wrap gap-1">
                                        {result.note.tags.slice(0, 5).map((tag, tagIndex) => (
                                          <Badge key={tagIndex} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {searchResults.total_results === 0 && (
                            <div className="text-center py-8">
                              <Search className="h-12 w-12 mx-auto mb-4" style={{ color: '#c9d6e4' }} />
                              <p style={{ color: '#4b6b8b' }}>
                                No results found for "{searchResults.query}". Try different keywords or upload more documents.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default KnowledgeVault;