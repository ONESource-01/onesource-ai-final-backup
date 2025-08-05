import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { setAuthToken, apiEndpoints } from "./utils/api";

// Components
import ChatInterface from "./components/ChatInterface";
import OnboardingFlow from "./components/OnboardingFlow";
import AuthPage from "./components/AuthPage";
import PricingPage from "./components/PricingPage";
import PaymentSuccess from "./components/PaymentSuccess";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Loader2, Bot, Users, Zap, Shield } from "lucide-react";

const AppContent = () => {
  const { user, loading: authLoading, idToken } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (idToken) {
      setAuthToken(idToken);
    }
  }, [idToken]);

  useEffect(() => {
    if (user && idToken) {
      loadUserProfile();
    } else {
      setProfileLoading(false);
    }
  }, [user, idToken]);

  const loadUserProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await apiEndpoints.getUserProfile();
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading ONESource-ai...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      
      {/* Protected Routes */}
      <Route 
        path="/chat" 
        element={
          user ? (
            userProfile?.onboarding_completed ? (
              <ChatInterface />
            ) : (
              <OnboardingFlow onComplete={loadUserProfile} />
            )
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      
      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-blue-900">ONESource-ai</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600">Pricing</a>
              {user ? (
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{user.email}</Badge>
                  <Button asChild>
                    <a href="/chat">Go to Chat</a>
                  </Button>
                </div>
              ) : (
                <Button asChild>
                  <a href="/auth">Sign In</a>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-blue-900 mb-6">
              Your AI Mentor for
              <span className="block text-indigo-600">AU/NZ Construction Industry</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get expert guidance on building codes, engineering standards, and construction practices 
              with dual-layer responses combining technical accuracy and mentoring insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {user ? (
                <Button size="lg" className="text-lg px-8 py-4" asChild>
                  <a href="/chat">Start Asking Questions</a>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="text-lg px-8 py-4" asChild>
                    <a href="/auth">Try 3 Questions Free</a>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4" asChild>
                    <a href="#features">Learn More</a>
                  </Button>
                </>
              )}
            </div>

            <div className="bg-green-100 border border-green-300 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center text-green-800">
                <Shield className="h-5 w-5 mr-2" />
                <span className="font-semibold">Trusted by construction professionals across Australia & New Zealand</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Construction Professionals
            </h2>
            <p className="text-xl text-gray-600">
              Specialized AI trained on AU/NZ building standards and industry practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="h-6 w-6 text-blue-600 mr-2" />
                  Dual-Layer Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get both technical answers with clause references and mentoring insights 
                  from experienced industry professionals.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-2" />
                  AU/NZ Standards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Trained on Australian and New Zealand building codes, NCC, BCA, 
                  and industry-specific standards (AS/NZS).
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  Multi-Discipline Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Supports architects, engineers (structural, civil, mechanical, electrical), 
                  building surveyors, and construction managers.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-6 w-6 text-blue-600 mr-2" />
                  Instant Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get immediate access to construction knowledge without waiting 
                  for consultations or searching through lengthy documents.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="h-6 w-6 text-blue-600 mr-2" />
                  Context-Aware
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Adapts responses based on your profession, sector (residential, commercial, 
                  healthcare) and specific project requirements.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-2" />
                  Compliance Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Emphasis on regulatory compliance, safety standards, and best practices 
                  to keep your projects on track.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Expert Construction Guidance?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start with 3 free questions. No credit card required.
          </p>
          
          {user ? (
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4" asChild>
              <a href="/chat">Start Asking Questions</a>
            </Button>
          ) : (
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4" asChild>
              <a href="/auth">Try Free Now</a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Bot className="h-6 w-6 text-blue-400 mr-2" />
                <span className="text-lg font-bold">ONESource-ai</span>
              </div>
              <p className="text-gray-400">
                Your trusted AI mentor for AU/NZ construction industry expertise.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="/auth" className="hover:text-white">Try Free</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Feedback</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ONESource-ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
