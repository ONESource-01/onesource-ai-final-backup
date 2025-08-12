import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  MessageSquare, ThumbsUp, ThumbsDown, Search, Calendar, User, 
  Filter, RefreshCw, Download, Eye, Clock
} from 'lucide-react';
import { apiEndpoints } from '../utils/api';

const AdminFeedbackDashboard = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, positive, negative
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // Load feedback data
  const loadFeedback = async (filterType = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const url = filterType === 'all' ? 
        '/admin/feedback?limit=100' : 
        `/admin/feedback?feedback_type=${filterType}&limit=100`;
      
      const response = await fetch(`${apiEndpoints.BASE_URL}${url}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo_token'}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
        setTotalCount(data.total_count || 0);
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadFeedback(filter);
  }, [filter]);

  // Filter feedback based on search query
  const filteredFeedback = feedback.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.comment?.toLowerCase().includes(query) ||
      item.user_email?.toLowerCase().includes(query) ||
      item.feedback_type?.toLowerCase().includes(query)
    );
  });

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Export feedback to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'User Email', 'Comment', 'Message ID'];
    const csvData = filteredFeedback.map(item => [
      formatDate(item.timestamp),
      item.feedback_type,
      item.user_email || 'Unknown',
      (item.comment || '').replace(/"/g, '""'), // Escape quotes
      item.message_id || 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onesource-feedback-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📝 ONESource-ai Feedback Dashboard
          </h1>
          <p className="text-gray-600">
            Review and manage user feedback to improve the AI assistant
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold">{totalCount}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Positive</p>
                  <p className="text-2xl font-bold text-green-600">
                    {feedback.filter(f => f.feedback_type === 'positive').length}
                  </p>
                </div>
                <ThumbsUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Negative</p>
                  <p className="text-2xl font-bold text-red-600">
                    {feedback.filter(f => f.feedback_type === 'negative').length}
                  </p>
                </div>
                <ThumbsDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {feedback.filter(f => {
                      const today = new Date().toDateString();
                      const feedbackDate = new Date(f.timestamp).toDateString();
                      return today === feedbackDate;
                    }).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    All ({totalCount})
                  </Button>
                  <Button
                    variant={filter === 'positive' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('positive')}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Positive
                  </Button>
                  <Button
                    variant={filter === 'negative' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('negative')}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Negative
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search feedback..."
                    className="pl-10 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadFeedback(filter)}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              Error loading feedback: {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading feedback...</p>
            </CardContent>
          </Card>
        )}

        {/* Feedback List */}
        {!loading && (
          <div className="space-y-4">
            {filteredFeedback.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No feedback found</h3>
                  <p className="text-gray-600">
                    {searchQuery ? 
                      'Try adjusting your search query or filter.' :
                      'No feedback has been submitted yet.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFeedback.map((item, index) => (
                <Card key={item.feedback_id || index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {item.feedback_type === 'positive' ? (
                          <ThumbsUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <ThumbsDown className="h-5 w-5 text-red-500" />
                        )}
                        <Badge 
                          variant={item.feedback_type === 'positive' ? 'default' : 'destructive'}
                          className="capitalize"
                        >
                          {item.feedback_type}
                        </Badge>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(item.timestamp)}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {item.user_email || 'Unknown user'}
                        </div>
                      </div>
                    </div>

                    {/* Comment */}
                    {item.comment && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Comment:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg italic">
                          "{item.comment}"
                        </p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-4 border-t">
                      <span>Feedback ID: {item.feedback_id || 'N/A'}</span>
                      <span>Message ID: {item.message_id || 'N/A'}</span>
                      <span>Status: {item.status || 'submitted'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Showing {filteredFeedback.length} of {totalCount} feedback items</p>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackDashboard;