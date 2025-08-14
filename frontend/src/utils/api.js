import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// API endpoints
export const apiEndpoints = {
  // Base URL for manual fetch calls
  BASE_URL: process.env.REACT_APP_BACKEND_URL,
  
  // Auth and user management
  getUserProfile: () => api.get('/user/profile'),
  updateUserPreferences: (data) => api.post('/user/preferences', data),
  completeOnboarding: (data) => api.post('/user/onboarding', data),
  getSubscriptionStatus: () => api.get('/user/subscription'),

  // Chat
  askQuestion: (data) => api.post('/chat/ask', data),
  askEnhancedQuestion: (data) => api.post('/chat/ask-enhanced', data),
  // REMOVED: booster functionality per BUILD MASTER DIRECTIVE - V2 schema provides complete responses
  submitChatFeedback: (data) => api.post('/chat/feedback', data),
  submitKnowledgeContribution: (data) => api.post('/chat/contribution', data),
  getChatHistory: (limit = 50) => api.get('/chat/history', { params: { limit } }),
  getChatSession: (sessionId) => api.get(`/chat/session/${sessionId}`),

  // Payments
  createCheckoutSession: (data) => api.post('/payment/checkout', data),
  getPaymentStatus: (sessionId) => api.get(`/payment/status/${sessionId}`),
  getPricing: () => api.get('/pricing'),

  // Knowledge Bank
  uploadDocuments: async (formData) => {
    const files = formData.getAll('files');
    const uploadType = formData.get('upload_type') || 'personal';
    
    if (files.length === 0) {
      throw new Error('No files selected');
    }
    
    const results = [];
    const errors = [];
    
    // Upload files one by one since backend accepts single file uploads
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const singleFileFormData = new FormData();
      singleFileFormData.append('file', file);
      singleFileFormData.append('tags', ''); // Default empty tags
      
      try {
        let response;
        if (uploadType === 'personal') {
          response = await api.post('/knowledge/upload-personal', singleFileFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else if (uploadType === 'community') {
          response = await api.post('/knowledge/upload-community', singleFileFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          // Fallback to legacy endpoint
          response = await api.post('/knowledge/upload-document', singleFileFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
        
        results.push({
          filename: file.name,
          success: true,
          document_id: response.data.document_id,
          message: response.data.message
        });
        
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        errors.push({
          filename: file.name,
          success: false,
          error: error.response?.data?.detail || error.message || 'Upload failed'
        });
      }
    }
    
    // Return combined results
    if (errors.length === 0) {
      return {
        data: {
          message: `Successfully uploaded ${results.length} file(s)`,
          results: results,
          success_count: results.length,
          error_count: 0
        }
      };
    } else if (results.length === 0) {
      // All failed
      throw new Error(`Upload failed: ${errors.map(e => `${e.filename}: ${e.error}`).join(', ')}`);
    } else {
      // Partial success
      return {
        data: {
          message: `Uploaded ${results.length} file(s), ${errors.length} failed`,
          results: results,
          errors: errors,
          success_count: results.length,
          error_count: errors.length
        }
      };
    }
  },

  // Admin/Developer endpoints
  getAdminFeedback: () => api.get('/admin/feedback'),
  getAdminContributions: (status = 'pending_review') => api.get('/admin/contributions', { params: { status } }),
  reviewContribution: (contributionId, status, reviewNotes) => api.put(`/admin/contributions/${contributionId}`, { status, review_notes: reviewNotes }),
  
  // Developer Access
  grantDeveloperAccess: () => api.post('/admin/developer-access'),
  checkDeveloperStatus: () => api.get('/admin/check-developer-status'),
  
  // Voucher System
  createVoucher: (data) => api.post('/admin/create-voucher', data),
  redeemVoucher: (data) => api.post('/voucher/redeem', data),
  listVouchers: () => api.get('/admin/vouchers'),
  getUserVoucherStatus: () => api.get('/user/voucher-status'),

  // Knowledge Vault System
  uploadDocument: (formData) => api.post('/knowledge/upload-document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  createMentorNote: (data) => api.post('/knowledge/mentor-note', data),
  searchKnowledgeBase: (query, limit = 10, includeMentorNotes = true) => 
    api.get('/knowledge/search', { params: { query, limit, include_mentor_notes: includeMentorNotes } }),
  
  // Partner management endpoints
  getPartnerApplications: () => api.get('/admin/partners'),
  reviewPartnerApplication: (data) => api.post('/admin/partners/review', data),
  
  // Knowledge endpoints
  getPersonalDocuments: () => api.get('/knowledge/personal-documents'),
  getCommunityDocuments: () => api.get('/knowledge/community-documents'),
  searchKnowledge: (query) => api.post('/knowledge/search', { query }),

  // General
  getStatus: () => api.get('/status'),
};

export default api;