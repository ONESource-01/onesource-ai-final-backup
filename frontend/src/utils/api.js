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
  // Auth and user management
  getUserProfile: () => api.get('/user/profile'),
  completeOnboarding: (data) => api.post('/user/onboarding', data),
  getSubscriptionStatus: () => api.get('/user/subscription'),

  // Chat
  askQuestion: (data) => api.post('/chat/ask', data),
  submitFeedback: (data) => api.post('/chat/feedback', data),
  submitContribution: (data) => api.post('/chat/contribution', data),
  getChatHistory: (limit = 50) => api.get('/chat/history', { params: { limit } }),
  getChatSession: (sessionId) => api.get(`/chat/session/${sessionId}`),

  // Payments
  createCheckoutSession: (data) => api.post('/payment/checkout', data),
  getPaymentStatus: (sessionId) => api.get(`/payment/status/${sessionId}`),
  getPricing: () => api.get('/pricing'),

  // General
  getStatus: () => api.get('/status'),

  // Admin/Developer endpoints
  getAdminFeedback: () => api.get('/admin/feedback'),
  getAdminContributions: (status = 'pending_review') => api.get('/admin/contributions', { params: { status } }),
  reviewContribution: (contributionId, status, reviewNotes) => api.put(`/admin/contributions/${contributionId}`, { status, review_notes: reviewNotes }),
  
  // Developer Access
  grantDeveloperAccess: () => api.post('/admin/developer-access'),
  checkDeveloperStatus: () => api.get('/admin/check-developer-status'),
};

export default api;