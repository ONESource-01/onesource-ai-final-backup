import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiEndpoints, setAuthToken } from '../utils/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ThumbsUp, ThumbsDown, MessageSquare, User, Calendar, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { user, idToken } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingContribution, setReviewingContribution] = useState(null);
  const [developerStatus, setDeveloperStatus] = useState(null);
  const [grantingAccess, setGrantingAccess] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [voucherStatus, setVoucherStatus] = useState(null);
  const [creatingVoucher, setCreatingVoucher] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    voucher_code: '',
    plan_type: 'pro',
    duration_days: 30,
    max_uses: 1,
    description: ''
  });

  useEffect(() => {
    if (idToken) {
      setAuthToken(idToken);
      loadData();
    }
  }, [idToken]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feedbackResponse, contributionsResponse, developerResponse, vouchersResponse, voucherStatusResponse] = await Promise.all([
        apiEndpoints.getAdminFeedback(),
        apiEndpoints.getAdminContributions('all'),
        apiEndpoints.checkDeveloperStatus(),
        apiEndpoints.listVouchers(),
        apiEndpoints.getUserVoucherStatus()
      ]);
      
      setFeedback(feedbackResponse.data.feedback);
      setContributions(contributionsResponse.data.contributions);
      setDeveloperStatus(developerResponse.data);
      setVouchers(vouchersResponse.data.vouchers);
      setVoucherStatus(voucherStatusResponse.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVoucher = async () => {
    try {
      setCreatingVoucher(true);
      await apiEndpoints.createVoucher(newVoucher);
      
      // Reset form
      setNewVoucher({
        voucher_code: '',
        plan_type: 'pro',
        duration_days: 30,
        max_uses: 1,
        description: ''
      });
      
      // Reload vouchers
      const vouchersResponse = await apiEndpoints.listVouchers();
      setVouchers(vouchersResponse.data.vouchers);
      
      alert('Voucher created successfully!');
    } catch (error) {
      console.error('Error creating voucher:', error);
      alert('Error creating voucher. Please try again.');
    } finally {
      setCreatingVoucher(false);
    }
  };

  const handleGrantDeveloperAccess = async () => {
    try {
      setGrantingAccess(true);
      const response = await apiEndpoints.grantDeveloperAccess();
      setDeveloperStatus({
        has_developer_access: true,
        access_type: 'developer',
        granted_at: new Date().toISOString()
      });
      alert(response.data.message);
    } catch (error) {
      console.error('Error granting developer access:', error);
      alert('Error granting developer access. Please try again.');
    } finally {
      setGrantingAccess(false);
    }
  };

  const handleReviewContribution = async (contributionId, status, reviewNotes = '') => {
    try {
      await apiEndpoints.reviewContribution(contributionId, status, reviewNotes);
      setReviewingContribution(null);
      // Reload contributions
      const contributionsResponse = await apiEndpoints.getAdminContributions('all');
      setContributions(contributionsResponse.data.contributions);
    } catch (error) {
      console.error('Error reviewing contribution:', error);
      alert('Error reviewing contribution. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <Card>
          <CardContent className="p-6">
            <p style={{ color: '#4b6b8b' }}>Please sign in to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f2f57' }}></div>
          <p style={{ color: '#4b6b8b' }}>Loading admin dashboard...</p>
        </div>
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
              Developer Dashboard
            </h1>
          </div>
          <p style={{ color: '#4b6b8b' }}>
            Review user feedback and knowledge contributions
          </p>
        </div>

        <Tabs defaultValue="developer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4" style={{ backgroundColor: '#c9d6e4' }}>
            <TabsTrigger value="developer" style={{ color: '#4b6b8b' }}>
              Developer Access
            </TabsTrigger>
            <TabsTrigger value="vouchers" style={{ color: '#4b6b8b' }}>
              Voucher System
            </TabsTrigger>
            <TabsTrigger value="feedback" style={{ color: '#4b6b8b' }}>
              User Feedback ({feedback.length})
            </TabsTrigger>
            <TabsTrigger value="contributions" style={{ color: '#4b6b8b' }}>
              Knowledge Contributions ({contributions.length})
            </TabsTrigger>
          </TabsList>

          {/* Developer Access Tab */}
          <TabsContent value="developer">
            <Card style={{ borderColor: '#c9d6e4' }}>
              <CardHeader>
                <CardTitle style={{ color: '#0f2f57' }}>
                  Developer Access Management
                </CardTitle>
                <p style={{ color: '#4b6b8b' }}>
                  Grant yourself unlimited consultant-level access for development and testing
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {developerStatus?.has_developer_access ? (
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '2px solid #16a34a' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-green-800">Developer Access Active</h3>
                          <p className="text-sm text-green-600">
                            You have unlimited consultant-level access
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-green-700">
                        <p><strong>Access Type:</strong> Developer Consultant</p>
                        <p><strong>Granted:</strong> {new Date(developerStatus.granted_at).toLocaleString()}</p>
                      </div>
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-2">Features Unlocked:</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Unlimited AI queries</li>
                          <li>• Priority response speed</li>
                          <li>• Admin dashboard access</li>
                          <li>• Knowledge vault management</li>
                          <li>• All advanced features</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '2px solid #c9d6e4' }}>
                      <h3 className="font-semibold mb-3" style={{ color: '#0f2f57' }}>
                        Grant Developer Access
                      </h3>
                      <p className="text-sm mb-4" style={{ color: '#4b6b8b' }}>
                        This will grant you unlimited consultant-level access for development and testing purposes. 
                        This bypasses all subscription limits and provides full access to all features.
                      </p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#4b6b8b' }}>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Unlimited AI questions</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#4b6b8b' }}>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>All consultant features</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#4b6b8b' }}>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Admin dashboard access</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#4b6b8b' }}>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Knowledge vault management</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleGrantDeveloperAccess}
                        disabled={grantingAccess}
                        className="w-full"
                        style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}
                      >
                        {grantingAccess ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Granting Access...
                          </>
                        ) : (
                          'Grant Developer Access'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voucher System Tab */}
          <TabsContent value="vouchers">
            <div className="space-y-6">
              {/* Current User Voucher Status */}
              <Card style={{ borderColor: '#c9d6e4' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#0f2f57' }}>
                    Your Voucher Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {voucherStatus?.has_active_voucher ? (
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '2px solid #16a34a' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-green-800">Active Voucher</h3>
                          <p className="text-sm text-green-600">
                            Code: {voucherStatus.voucher_code} | Plan: {voucherStatus.plan_type}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-green-700">
                        <p><strong>Expires:</strong> {new Date(voucherStatus.expires_at).toLocaleDateString()}</p>
                        <p><strong>Days Remaining:</strong> {voucherStatus.days_remaining}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '2px solid #c9d6e4' }}>
                      <p style={{ color: '#4b6b8b' }}>No active voucher</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Create New Voucher */}
              <Card style={{ borderColor: '#c9d6e4' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#0f2f57' }}>
                    Create New Voucher
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                        Voucher Code
                      </label>
                      <input
                        type="text"
                        value={newVoucher.voucher_code}
                        onChange={(e) => setNewVoucher({...newVoucher, voucher_code: e.target.value})}
                        placeholder="SUMMER2024"
                        className="w-full p-2 border rounded-md"
                        style={{ borderColor: '#c9d6e4' }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                        Plan Type
                      </label>
                      <select
                        value={newVoucher.plan_type}
                        onChange={(e) => setNewVoucher({...newVoucher, plan_type: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        style={{ borderColor: '#c9d6e4' }}
                      >
                        <option value="pro">Pro Plan</option>
                        <option value="consultant">Consultant Plan</option>
                        <option value="day_pass">Day Pass</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                        Duration (Days)
                      </label>
                      <input
                        type="number"
                        value={newVoucher.duration_days}
                        onChange={(e) => setNewVoucher({...newVoucher, duration_days: parseInt(e.target.value)})}
                        min="1"
                        max="365"
                        className="w-full p-2 border rounded-md"
                        style={{ borderColor: '#c9d6e4' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                        Max Uses
                      </label>
                      <input
                        type="number"
                        value={newVoucher.max_uses}
                        onChange={(e) => setNewVoucher({...newVoucher, max_uses: parseInt(e.target.value)})}
                        min="1"
                        max="1000"
                        className="w-full p-2 border rounded-md"
                        style={{ borderColor: '#c9d6e4' }}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#0f2f57' }}>
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newVoucher.description}
                      onChange={(e) => setNewVoucher({...newVoucher, description: e.target.value})}
                      placeholder="Summer promotion voucher"
                      className="w-full p-2 border rounded-md"
                      style={{ borderColor: '#c9d6e4' }}
                    />
                  </div>

                  <Button
                    onClick={handleCreateVoucher}
                    disabled={creatingVoucher || !newVoucher.voucher_code}
                    style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}
                  >
                    {creatingVoucher ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Voucher'
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Vouchers List */}
              <Card style={{ borderColor: '#c9d6e4' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#0f2f57' }}>
                    Existing Vouchers ({vouchers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vouchers.length > 0 ? (
                    <div className="space-y-4">
                      {vouchers.map((voucher) => (
                        <div key={voucher.voucher_id} className="p-4 rounded-lg border" style={{ borderColor: '#c9d6e4' }}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" style={{ color: '#0f2f57' }}>
                                {voucher.voucher_code}
                              </Badge>
                              <Badge variant="secondary">
                                {voucher.plan_type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm" style={{ color: '#4b6b8b' }}>
                              <span>{voucher.current_uses}/{voucher.max_uses} used</span>
                              <Badge variant={voucher.status === 'active' ? 'default' : 'secondary'}>
                                {voucher.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm" style={{ color: '#4b6b8b' }}>
                            <div>
                              <strong>Duration:</strong> {voucher.duration_days} days
                            </div>
                            <div>
                              <strong>Redemptions:</strong> {voucher.redemption_count}
                            </div>
                            <div>
                              <strong>Created:</strong> {new Date(voucher.created_at).toLocaleDateString()}
                            </div>
                            <div>
                              <strong>Max Uses:</strong> {voucher.max_uses}
                            </div>
                          </div>
                          
                          {voucher.description && (
                            <p className="mt-2 text-sm" style={{ color: '#4b6b8b' }}>
                              <strong>Description:</strong> {voucher.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p style={{ color: '#4b6b8b' }}>No vouchers created yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {feedback.map((item) => (
                <Card key={item.feedback_id} style={{ borderColor: '#c9d6e4' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.feedback_type === 'positive' ? (
                          <ThumbsUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <ThumbsDown className="h-5 w-5 text-red-600" />
                        )}
                        <span style={{ color: '#0f2f57' }}>
                          {item.feedback_type === 'positive' ? 'Positive' : 'Negative'} Feedback
                        </span>
                      </div>
                      <Badge variant="outline" style={{ color: '#95a6b7' }}>
                        {new Date(item.timestamp).toLocaleDateString()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm" style={{ color: '#4b6b8b' }}>
                        <User className="h-4 w-4" />
                        <span>{item.user_email}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm" style={{ color: '#4b6b8b' }}>
                        <MessageSquare className="h-4 w-4" />
                        <span>Message ID: {item.message_id}</span>
                      </div>

                      {item.comment && (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '1px solid #c9d6e4' }}>
                          <p className="text-sm" style={{ color: '#0f2f57' }}>
                            "{item.comment}"
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {feedback.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" style={{ color: '#c9d6e4' }} />
                  <p style={{ color: '#4b6b8b' }}>No feedback submitted yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Contributions Tab */}
          <TabsContent value="contributions">
            <div className="space-y-6">
              {contributions.map((item) => (
                <Card key={item.contribution_id} style={{ borderColor: '#c9d6e4' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" style={{ color: '#4b6b8b' }} />
                        <span style={{ color: '#0f2f57' }}>Knowledge Contribution</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={item.status === 'approved' ? 'default' : item.status === 'rejected' ? 'destructive' : 'secondary'}
                          style={{ 
                            backgroundColor: item.status === 'approved' ? '#16a34a' : 
                                           item.status === 'rejected' ? '#dc2626' : '#95a6b7',
                            color: '#f8fafc'
                          }}
                        >
                          {item.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" style={{ color: '#95a6b7' }}>
                          {new Date(item.timestamp).toLocaleDateString()}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" style={{ color: '#4b6b8b' }}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{item.user_name} ({item.user_email})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>Message: {item.message_id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{item.opt_in_credit ? '✅ Wants Credit' : '❌ No Credit'}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '2px solid #c9d6e4' }}>
                        <h4 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                          User Contribution:
                        </h4>
                        <p className="text-sm" style={{ color: '#4b6b8b' }}>
                          {item.contribution}
                        </p>
                      </div>

                      {item.review_notes && (
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#c9d6e4', border: '1px solid #95a6b7' }}>
                          <h4 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                            Review Notes:
                          </h4>
                          <p className="text-sm" style={{ color: '#4b6b8b' }}>
                            {item.review_notes}
                          </p>
                          <p className="text-xs mt-2" style={{ color: '#95a6b7' }}>
                            Reviewed by: {item.reviewed_by} on {new Date(item.reviewed_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {item.status === 'pending_review' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReviewContribution(item.contribution_id, 'approved')}
                            style={{ backgroundColor: '#16a34a', color: '#f8fafc' }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReviewContribution(item.contribution_id, 'rejected', 'Declined by reviewer')}
                            style={{ borderColor: '#dc2626', color: '#dc2626' }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {contributions.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" style={{ color: '#c9d6e4' }} />
                  <p style={{ color: '#4b6b8b' }}>No contributions submitted yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card style={{ borderColor: '#c9d6e4' }}>
            <CardContent className="p-4 text-center">
              <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold" style={{ color: '#0f2f57' }}>
                {feedback.filter(f => f.feedback_type === 'positive').length}
              </p>
              <p className="text-sm" style={{ color: '#4b6b8b' }}>Positive Feedback</p>
            </CardContent>
          </Card>
          
          <Card style={{ borderColor: '#c9d6e4' }}>
            <CardContent className="p-4 text-center">
              <ThumbsDown className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold" style={{ color: '#0f2f57' }}>
                {feedback.filter(f => f.feedback_type === 'negative').length}
              </p>
              <p className="text-sm" style={{ color: '#4b6b8b' }}>Negative Feedback</p>
            </CardContent>
          </Card>
          
          <Card style={{ borderColor: '#c9d6e4' }}>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2" style={{ color: '#f59e0b' }} />
              <p className="text-2xl font-bold" style={{ color: '#0f2f57' }}>
                {contributions.filter(c => c.status === 'pending_review').length}
              </p>
              <p className="text-sm" style={{ color: '#4b6b8b' }}>Pending Review</p>
            </CardContent>
          </Card>
          
          <Card style={{ borderColor: '#c9d6e4' }}>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold" style={{ color: '#0f2f57' }}>
                {contributions.filter(c => c.status === 'approved').length}
              </p>
              <p className="text-sm" style={{ color: '#4b6b8b' }}>Approved</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;