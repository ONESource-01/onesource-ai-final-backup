import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Settings, 
  TrendingUp, 
  Mail,
  Check,
  X,
  Upload,
  Download,
  Eye,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { apiEndpoints } from '../utils/api';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    total_conversations: 0,
    total_messages: 0,
    documents_uploaded: 0,
    partner_registrations: 0
  });
  const [reportResult, setReportResult] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  
  // Partner management state
  const [partners, setPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnerActionLoading, setPartnerActionLoading] = useState(null);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        setAdminLoading(false);
        return;
      }

      try {
        const response = await apiEndpoints.checkAdminStatus();
        setIsAdmin(response.data.is_admin);
      } catch (error) {
        console.error('Admin check failed:', error);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  // Load dashboard stats
  const loadStats = async () => {
    if (!isAdmin) return;
    
    try {
      const response = await apiEndpoints.getAdminStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportResult('');
    
    try {
      const response = await apiEndpoints.generateWeeklyReport();
      setReportResult(response.data.message || 'Weekly report generated successfully');
    } catch (error) {
      console.error('Report generation failed:', error);
      setReportResult('Failed to generate report: ' + (error.response?.data?.detail || error.message));
    } finally {
      setReportLoading(false);
    }
  };

  // Partner management functions
  const fetchPartners = async () => {
    setPartnersLoading(true);
    try {
      const response = await apiEndpoints.getPartnerApplications();
      setPartners(response.data.partners || []);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setPartnersLoading(false);
    }
  };

  const handlePartnerAction = async (partnerId, action, reason = '') => {
    setPartnerActionLoading(partnerId);
    try {
      await apiEndpoints.reviewPartnerApplication({
        partner_id: partnerId,
        action: action, // 'approve' or 'reject'
        admin_notes: reason
      });
      
      // Refresh partners list
      await fetchPartners();
      await loadStats(); // Refresh stats
    } catch (error) {
      console.error('Partner action failed:', error);
      alert('Failed to ' + action + ' partner: ' + (error.response?.data?.detail || error.message));
    } finally {
      setPartnerActionLoading(null);
    }
  };

  // Fetch partners when component mounts
  useEffect(() => {
    if (isAdmin) {
      fetchPartners();
    }
  }, [isAdmin]);

  // Loading state
  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <X className="h-6 w-6 mr-2" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You don't have administrator privileges to access this dashboard.
            </p>
            <Button asChild>
              <a href="/">Return to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <img 
                  src="/onesource-primary-logo.png" 
                  alt="ONESource-ai" 
                  className="h-24 w-auto mr-3"
                />
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-200 text-green-700">
                Admin: {user.email}
              </Badge>
              <Button asChild variant="outline">
                <a href="/chat">Go to Chat</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor platform performance and manage system operations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_users} active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_conversations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_messages} total messages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.documents_uploaded}</div>
              <p className="text-xs text-muted-foreground">
                {stats.partner_registrations} partner registrations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Weekly Business Intelligence Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Generate a comprehensive weekly report with user activity, conversation insights, 
                  and platform performance metrics.
                </p>
                
                <Button 
                  onClick={handleGenerateReport}
                  disabled={reportLoading}
                  className="flex items-center"
                >
                  {reportLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Generate Weekly Report
                    </>
                  )}
                </Button>

                {reportResult && (
                  <Alert className={reportResult.includes('Failed') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                    <AlertDescription className={reportResult.includes('Failed') ? 'text-red-700' : 'text-green-700'}>
                      {reportResult}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Partner Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partnersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-onesource-dark mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading partner applications...</p>
                  </div>
                ) : partners.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No partner applications found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {partners.map((partner) => (
                      <div key={partner.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-lg">{partner.company_name}</h4>
                            <p className="text-sm text-gray-600">
                              <strong>Contact:</strong> {partner.contact_person} ({partner.email})
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Industry:</strong> {partner.industry_sector}
                            </p>
                            {partner.phone && (
                              <p className="text-sm text-gray-600">
                                <strong>Phone:</strong> {partner.phone}
                              </p>
                            )}
                          </div>
                          <Badge 
                            variant={
                              partner.status === 'approved' ? 'default' : 
                              partner.status === 'rejected' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {partner.status || 'pending'}
                          </Badge>
                        </div>

                        {/* Business ID Information */}
                        <div className="bg-gray-50 rounded p-3 space-y-2">
                          <h5 className="font-medium text-sm">Business Registration</h5>
                          {partner.manual_review_required ? (
                            <div className="flex items-center gap-2 text-amber-600">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm">Manual review required - No business registration provided</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-sm">
                                <strong>Country:</strong> {partner.country || 'AU'}
                              </p>
                              <p className="text-sm">
                                <strong>Type:</strong> {partner.business_id_scheme || 'ABN/ACN'}
                              </p>
                              <p className="text-sm">
                                <strong>Number:</strong> {partner.business_id_number || partner.abn_acn}
                              </p>
                              {partner.business_id_valid && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Check className="h-3 w-3" />
                                  <span className="text-xs">Format validated</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {partner.description && (
                          <div>
                            <h5 className="font-medium text-sm mb-1">Company Description</h5>
                            <p className="text-sm text-gray-700">{partner.description}</p>
                          </div>
                        )}

                        {partner.admin_notes && (
                          <div className="bg-blue-50 rounded p-3">
                            <h5 className="font-medium text-sm mb-1">Admin Notes</h5>
                            <p className="text-sm text-blue-700">{partner.admin_notes}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-xs text-gray-500">
                            Applied: {new Date(partner.created_at).toLocaleDateString()}
                          </div>
                          
                          {partner.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const reason = prompt('Add approval notes (optional):');
                                  if (reason !== null) {
                                    handlePartnerAction(partner.id, 'approve', reason);
                                  }
                                }}
                                disabled={partnerActionLoading === partner.id}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                {partnerActionLoading === partner.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                                ) : (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const reason = prompt('Rejection reason (required):');
                                  if (reason && reason.trim()) {
                                    handlePartnerAction(partner.id, 'reject', reason);
                                  } else if (reason === '') {
                                    alert('Please provide a reason for rejection.');
                                  }
                                }}
                                disabled={partnerActionLoading === partner.id}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                {partnerActionLoading === partner.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                                ) : (
                                  <>
                                    <X className="h-3 w-3 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  User management features will be available in a future update. Currently showing basic statistics above.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Content moderation and knowledge base management tools will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  System configuration and maintenance tools will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;