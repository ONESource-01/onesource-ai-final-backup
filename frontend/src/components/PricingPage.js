import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiEndpoints } from '../utils/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Check, Zap, Crown, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  const { user, idToken } = useAuth();
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState('');
  const [error, setError] = useState('');

  // Set page title
  useEffect(() => {
    document.title = 'Pricing | ONESource-ai';
  }, []);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      const response = await apiEndpoints.getPricing();
      setPricing(response.data.packages);
    } catch (err) {
      console.error('Error loading pricing:', err);
      setError('Failed to load pricing information');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId) => {
    // Handle free starter plan differently
    if (packageId === 'starter') {
      if (!user) {
        window.location.href = '/auth';
      } else {
        window.location.href = '/chat';
      }
      return;
    }

    if (!user) {
      window.location.href = '/auth';
      return;
    }

    setPurchaseLoading(packageId);
    setError('');

    try {
      // Add timeout to prevent indefinite spinning
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const originUrl = window.location.origin;
      const checkoutPromise = apiEndpoints.createCheckoutSession({
        package_id: packageId,
        origin_url: originUrl
      });

      const response = await Promise.race([checkoutPromise, timeoutPromise]);

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        setError('Failed to create checkout session. Please try again.');
        setPurchaseLoading('');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      
      // Clear loading state on error
      setPurchaseLoading('');
      
      if (err.message === 'Request timeout') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.response?.status === 404) {
        setError('Checkout service unavailable. Please try again later.');
      } else if (err.response?.status === 401) {
        setError('Please sign in to continue with your purchase.');
      } else if (err.response?.status === 400) {
        setError('Invalid package selected. Please try a different plan.');
      } else {
        setError(err.response?.data?.detail || 'Failed to start checkout process. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      </div>
    );
  }

  const pricingPlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      currency: 'AUD',
      period: 'Free Forever',
      description: 'Get Started & Contribute to the Community',
      icon: <Zap className="h-6 w-6" />,
      features: [
        '3 questions per day',
        'Basic AI responses',
        'Document uploads to Knowledge Vault (Partners ONLY)',
        'Basic knowledge vault search',
        'Standard construction guidance',
        'Partner document upload access',
        'Community knowledge contribution'
      ],
      limitations: [
        'No chat history',
        'No enhanced AI intelligence',
        'No mentor note creation'
      ],
      highlighted: false,
      cta: user ? 'Current Plan' : 'Get Started Free',
      disabled: false,
      tooltip: 'Partners can upload content freely. Subscription required for full platform usage.'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 17.9,
      currency: 'AUD',
      period: 'per month',
      description: 'Professional Construction Intelligence',
      icon: <Check className="h-6 w-6" />,
      features: [
        'Unlimited questions',
        'Phase 1: Enhanced Prompting (discipline-specific)',
        'Full chat history & sessions',
        'Mentor note creation & sharing',
        'Document upload & knowledge vault access',
        'Enhanced response format (Technical + Mentoring)',
        'Community support & forums'
      ],
      limitations: [
        'No advanced workflow intelligence',
        'No knowledge-enhanced chat mode',
        'No full 3-phase AI system'
      ],
      highlighted: false, // Removed highlighting from Pro
      cta: 'Start Pro Trial',
      disabled: false,
      promotion: '5 weeks free to new users',
      badge: 'Most Popular'
    },
    {
      id: 'consultant', // Fixed: backend expects 'consultant' not 'pro-plus'
      name: 'Pro-Plus',
      price: 38.9,
      currency: 'AUD',
      period: 'per month',
      description: 'Complete Construction Knowledge Platform',
      icon: <Crown className="h-6 w-6" />,
      features: [
        'Everything in Pro, PLUS:',
        'Full 3-Phase AI Intelligence System',
        'Project workflow guidance & stage recognition',
        'Knowledge-enhanced chat mode',
        'Supplier content integration & attribution',
        'Advanced analytics dashboard',
        'Multi-discipline specialization',
        'Priority support',
        'Admin dashboard access'
      ],
      limitations: [],
      highlighted: false,
      cta: 'Start Pro-Plus Trial',
      disabled: false,
      promotion: '5 weeks free to new users',
      badge: 'Best Value',
      popular: true
    },
    {
      id: 'day_pass',
      name: 'Day Pass',
      price: 28.5,
      currency: 'AUD',
      period: 'per day',
      description: 'Full Platform Access When You Need It',
      icon: <Users className="h-6 w-6" />,
      features: [
        'All Pro-Plus features for 24 hours',
        'Perfect for project deadlines',
        'No long-term commitment',
        'Can be purchased multiple times',
        'Full platform access',
        'Emergency project support'
      ],
      limitations: [],
      highlighted: false,
      cta: 'Buy Day Pass',
      disabled: false,
      urgent: true,
      badge: 'Limited Time'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to="/" className="flex items-center text-onesource-dark hover:text-onesource-medium">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center space-x-3">
              <img src="/onesource-icon.svg" alt="ONESource-ai" className="h-8 w-8" />
              <h1 className="text-2xl font-bold text-onesource-dark">ONESource-ai Pricing</h1>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <Badge variant="outline">{user.email}</Badge>
                <Button asChild variant="outline">
                  <Link to="/chat">Go to Chat</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Choose the Right Plan for You
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get expert construction industry guidance with plans designed for professionals at every level
            </p>
          </div>
          
          {/* Error Alert */}
          {error && (
            <div className="mb-8">
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-700 flex items-center justify-between">
                  <span>{error}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setError('')}
                    className="ml-4 text-red-700 border-red-300 hover:bg-red-100"
                  >
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${
                  plan.highlighted 
                    ? 'ring-2 ring-onesource-dark shadow-xl transform lg:scale-105 lg:z-10' 
                    : ''
                } ${
                  plan.popular 
                    ? 'lg:min-h-[600px]' 
                    : 'lg:min-h-[550px]'
                }`}
              >
                {/* Popular/Promotional Badge */}
                {(plan.badge || plan.highlighted || plan.popular) && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <Badge className={`px-4 py-2 font-bold text-sm ${
                      plan.popular ? 'bg-onesource-dark text-white shadow-lg' :
                      plan.badge === 'Most Popular' || plan.highlighted ? 'bg-blue-500 text-white' :
                      plan.badge === 'Best Value' ? 'bg-green-500 text-white' :
                      plan.badge === 'Limited Time' ? 'bg-orange-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {plan.popular ? 'MOST POPULAR' : plan.badge || 'Most Popular'}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  {/* Promotion Banner */}
                  {plan.promotion && (
                    <div className="mb-4 p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                      <p className="text-sm font-semibold text-green-700">
                        🎉 {plan.promotion}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-full ${plan.highlighted ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <div className={plan.highlighted ? 'text-blue-600' : 'text-gray-600'}>
                        {plan.icon}
                      </div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                  
                  {/* Partner Tooltip */}
                  {plan.tooltip && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                      💡 {plan.tooltip}
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500 ml-1">
                        {plan.currency}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{plan.period}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Features included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-orange-500 mr-2 mt-0.5">•</span>
                            <span className="text-sm text-gray-600">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={plan.disabled || purchaseLoading === plan.id}
                    className={`w-full ${plan.highlighted ? 'bg-onesource-dark hover:bg-onesource-medium text-white' : ''}`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {purchaseLoading === plan.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Processing...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
                  <p className="text-gray-600 text-sm">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">What standards are covered?</h3>
                  <p className="text-gray-600 text-sm">
                    We cover NCC, BCA, AS/NZS standards, and industry-specific regulations for Australia and New Zealand.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                  <p className="text-gray-600 text-sm">
                    Yes! Every new user gets 3 free questions to try our AI mentor before committing to a paid plan.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">How accurate are the responses?</h3>
                  <p className="text-gray-600 text-sm">
                    Our AI is trained on current AU/NZ building standards, but always verify critical information with licensed professionals.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;