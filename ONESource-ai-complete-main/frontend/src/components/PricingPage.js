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
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    setPurchaseLoading(packageId);
    setError('');

    try {
      const originUrl = window.location.origin;
      const response = await apiEndpoints.createCheckoutSession({
        package_id: packageId,
        origin_url: originUrl
      });

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.response?.data?.detail || 'Failed to start checkout process');
    } finally {
      setPurchaseLoading('');
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
      period: 'Free Trial',
      description: 'Perfect for trying out ONESource-ai',
      icon: <Zap className="h-6 w-6" />,
      features: [
        '3 free AI queries',
        'Basic technical responses',
        'No downloads',
        'Email support'
      ],
      limitations: [
        'Limited to 3 questions',
        'No advanced features',
        'Must sign up to continue'
      ],
      highlighted: false,
      cta: user ? 'Current Plan' : 'Try Free',
      disabled: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: pricing?.pro?.amount || 4.90,
      currency: 'AUD',
      period: 'per month',
      description: 'For regular construction professionals',
      icon: <Check className="h-6 w-6" />,
      features: [
        'Unlimited AI queries',
        'Dual-layer responses (Technical + Mentoring)',
        'AU/NZ standards coverage',
        'Limited report saving',
        'Email support',
        'Mobile access'
      ],
      limitations: [
        'Limited project storage',
        'Standard response priority'
      ],
      highlighted: true,
      cta: 'Upgrade to Pro',
      disabled: false
    },
    {
      id: 'consultant',
      name: 'Consultant',
      price: pricing?.consultant?.amount || 19.00,
      currency: 'AUD',
      period: 'per month',
      description: 'For heavy users and consultants',
      icon: <Crown className="h-6 w-6" />,
      features: [
        'Everything in Pro',
        'Priority AI response speed',
        'Unlimited report saving & download',
        'Advanced project management',
        'Priority email support',
        'API access (coming soon)',
        'Team collaboration (coming soon)'
      ],
      limitations: [],
      highlighted: false,
      cta: 'Upgrade to Consultant',
      disabled: false
    },
    {
      id: 'day_pass',
      name: 'Day Pass',
      price: pricing?.day_pass?.amount || 9.90,
      currency: 'AUD',
      period: 'one-time',
      description: 'Perfect for urgent project needs',
      icon: <Users className="h-6 w-6" />,
      features: [
        'Unlimited queries for 24 hours',
        'Full Pro features access',
        'No commitment',
        'Instant activation'
      ],
      limitations: [
        'Expires after 24 hours',
        'No report saving'
      ],
      highlighted: false,
      cta: 'Get Day Pass',
      disabled: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-900">ONESource-ai Pricing</h1>
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

          {error && (
            <Alert className="border-red-200 bg-red-50 mb-8 max-w-2xl mx-auto">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.highlighted ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-full ${plan.highlighted ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <div className={plan.highlighted ? 'text-blue-600' : 'text-gray-600'}>
                        {plan.icon}
                      </div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                  
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
                    className={`w-full ${plan.highlighted ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
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