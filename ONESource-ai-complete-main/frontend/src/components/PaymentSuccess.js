import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiEndpoints } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [status, setStatus] = useState('checking'); // checking, success, error
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    } else {
      setStatus('error');
      setError('No payment session found');
    }
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    let attempts = 0;
    const maxAttempts = 5;
    const pollInterval = 2000; // 2 seconds

    const poll = async () => {
      try {
        const response = await apiEndpoints.getPaymentStatus(sessionId);
        const data = response.data;

        if (data.payment_status === 'paid') {
          setPaymentDetails(data);
          setStatus('success');
          return;
        } else if (data.status === 'expired') {
          setStatus('error');
          setError('Payment session expired. Please try again.');
          return;
        }

        // If payment is still pending and we haven't exceeded max attempts
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          setStatus('error');
          setError('Payment status check timed out. Please check your email for confirmation or contact support.');
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        setStatus('error');
        setError(err.response?.data?.detail || 'Failed to verify payment status');
      }
    };

    poll();
  };

  const getPackageDisplayName = (packageId) => {
    const packageNames = {
      'pro': 'Pro Plan',
      'consultant': 'Consultant Plan',
      'day_pass': 'Day Pass'
    };
    return packageNames[packageId] || packageId;
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency?.toUpperCase() || 'AUD'
    }).format(amount / 100); // Stripe amounts are in cents
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600 text-center">
              Please wait while we confirm your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">Payment Issue</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full">
                <Link to="/pricing">Try Again</Link>
              </Button>
              
              <Button asChild className="w-full">
                <Link to="/chat">Continue to Chat</Link>
              </Button>
            </div>
            
            <p className="text-sm text-gray-600">
              If you continue to experience issues, please contact our support team.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
          <p className="text-gray-600">
            Welcome to your new ONESource-ai plan
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {paymentDetails && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Payment Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">
                    {getPackageDisplayName(paymentDetails.metadata?.package_id)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    {formatAmount(paymentDetails.amount_total, paymentDetails.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Paid</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your account has been upgraded automatically</li>
              <li>• Start asking unlimited construction questions</li>
              <li>• Access dual-layer responses (Technical + Mentoring)</li>
              <li>• Enjoy priority support and advanced features</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/chat">
                Start Using ONESource-ai
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              A confirmation email has been sent to your registered email address.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;