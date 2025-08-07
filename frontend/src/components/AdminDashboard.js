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

  useEffect(() => {
    if (idToken) {
      setAuthToken(idToken);
      loadData();
    }
  }, [idToken]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feedbackResponse, contributionsResponse, developerResponse] = await Promise.all([
        apiEndpoints.getAdminFeedback(),
        apiEndpoints.getAdminContributions('all'),
        apiEndpoints.checkDeveloperStatus()
      ]);
      
      setFeedback(feedbackResponse.data.feedback);
      setContributions(contributionsResponse.data.contributions);
      setDeveloperStatus(developerResponse.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
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

        <Tabs defaultValue="feedback" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2" style={{ backgroundColor: '#c9d6e4' }}>
            <TabsTrigger value="feedback" style={{ color: '#4b6b8b' }}>
              User Feedback ({feedback.length})
            </TabsTrigger>
            <TabsTrigger value="contributions" style={{ color: '#4b6b8b' }}>
              Knowledge Contributions ({contributions.length})
            </TabsTrigger>
          </TabsList>

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