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
import AdminDashboard from "./components/AdminDashboard";
import KnowledgeVault from "./components/KnowledgeVault";

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
      <Route path="/admin" element={<AdminDashboard />} />
      
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
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #c9d6e4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img 
                src="/onesource-logo.png" 
                alt="ONESource-ai" 
                className="h-16 w-auto mr-3"
              />
            </div>
            <nav className="flex items-center space-x-6">
              <a href="#features" className="hover:opacity-75 transition-opacity" style={{ color: '#4b6b8b' }}>Features</a>
              <a href="/pricing" className="hover:opacity-75 transition-opacity" style={{ color: '#4b6b8b' }}>Pricing</a>
              {user ? (
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" style={{ borderColor: '#95a6b7', color: '#4b6b8b' }}>{user.email}</Badge>
                  <Button asChild style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }} className="hover:opacity-90">
                    <a href="/chat">Go to Chat</a>
                  </Button>
                </div>
              ) : (
                <Button asChild style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }} className="hover:opacity-90">
                  <a href="/auth">Sign In</a>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(/construction-hero-bg.jpg)',
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}
        />
        {/* Overlay for text readability */}
        <div 
          className="absolute inset-0" 
          style={{ backgroundColor: 'rgba(248, 250, 252, 0.6)' }}
        />
        
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6" style={{ color: '#0f2f57' }}>
              Your Digital Design
              <span className="block" style={{ color: '#4b6b8b' }}>Compliance Partner</span>
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: '#4b6b8b' }}>
              Interpret design codes, apply regulations, and verify compliance with clause aware logic across every stage of construction – from planning to delivery.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {user ? (
                <Button size="lg" className="text-lg px-8 py-4 hover:opacity-90" asChild style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}>
                  <a href="/chat">Start Asking Questions</a>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="text-lg px-8 py-4 hover:opacity-90" asChild style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}>
                    <a href="/auth">Try 3 Questions Free</a>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4 hover:bg-opacity-5" asChild 
                    style={{ borderColor: '#4b6b8b', color: '#4b6b8b', backgroundColor: 'rgba(248, 250, 252, 0.95)', border: '2px solid #4b6b8b' }}>
                    <a href="#features">Learn More</a>
                  </Button>
                </>
              )}
            </div>

            <div className="rounded-lg p-4 max-w-2xl mx-auto" style={{ backgroundColor: 'rgba(201, 214, 228, 0.95)', border: '1px solid #95a6b7' }}>
              <div className="flex items-center justify-center" style={{ color: '#0f2f57' }}>
                <Shield className="h-5 w-5 mr-2" />
                <span className="font-semibold">Trusted by construction professionals across Australia & New Zealand</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20" style={{ backgroundColor: '#c9d6e4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#0f2f57' }}>
              Built for Construction Professionals
            </h2>
            <p className="text-xl" style={{ color: '#4b6b8b' }}>
              Specialized AI trained on AU/NZ building standards and industry practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card style={{ backgroundColor: '#f8fafc', borderColor: '#95a6b7' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: '#0f2f57' }}>
                  <Bot className="h-6 w-6 mr-2" style={{ color: '#4b6b8b' }} />
                  Dual-Layer Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: '#4b6b8b' }}>
                  Get both technical answers with clause references and mentoring insights 
                  from experienced industry professionals.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card style={{ backgroundColor: '#f8fafc', borderColor: '#95a6b7' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: '#0f2f57' }}>
                  <Shield className="h-6 w-6 mr-2" style={{ color: '#4b6b8b' }} />
                  AU/NZ Standards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: '#4b6b8b' }}>
                  Trained on Australian and New Zealand building codes, NCC, BCA, 
                  and industry-specific standards (AS/NZS).
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card style={{ backgroundColor: '#f8fafc', borderColor: '#95a6b7' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: '#0f2f57' }}>
                  <Users className="h-6 w-6 mr-2" style={{ color: '#4b6b8b' }} />
                  Multi-Discipline Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: '#4b6b8b' }}>
                  Supports architects, engineers (structural, civil, mechanical, electrical), 
                  building surveyors, and construction managers.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card style={{ backgroundColor: '#f8fafc', borderColor: '#95a6b7' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: '#0f2f57' }}>
                  <Zap className="h-6 w-6 mr-2" style={{ color: '#4b6b8b' }} />
                  Instant Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: '#4b6b8b' }}>
                  Get immediate access to construction knowledge without waiting 
                  for consultations or searching through lengthy documents.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card style={{ backgroundColor: '#f8fafc', borderColor: '#95a6b7' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: '#0f2f57' }}>
                  <Bot className="h-6 w-6 mr-2" style={{ color: '#4b6b8b' }} />
                  Context-Aware
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: '#4b6b8b' }}>
                  Adapts responses based on your profession, sector (residential, commercial, 
                  healthcare) and specific project requirements.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card style={{ backgroundColor: '#f8fafc', borderColor: '#95a6b7' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: '#0f2f57' }}>
                  <Shield className="h-6 w-6 mr-2" style={{ color: '#4b6b8b' }} />
                  Compliance Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: '#4b6b8b' }}>
                  Emphasis on regulatory compliance, safety standards, and best practices 
                  to keep your projects on track.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: '#0f2f57' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#f8fafc' }}>
            Ready to Get Expert Construction Guidance?
          </h2>
          <p className="text-xl mb-8" style={{ color: '#c9d6e4' }}>
            Start with 3 free questions. No credit card required.
          </p>
          
          {user ? (
            <Button size="lg" className="text-lg px-8 py-4 hover:opacity-90" asChild 
              style={{ backgroundColor: '#f8fafc', color: '#0f2f57' }}>
              <a href="/chat">Start Asking Questions</a>
            </Button>
          ) : (
            <Button size="lg" className="text-lg px-8 py-4 hover:opacity-90" asChild 
              style={{ backgroundColor: '#f8fafc', color: '#0f2f57' }}>
              <a href="/auth">Try Free Now</a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/onesource-logo.png" 
                  alt="ONESource-ai" 
                  className="h-12 w-auto mr-3"
                />
              </div>
              <p style={{ color: '#95a6b7' }}>
                Your trusted AI mentor for AU/NZ construction industry expertise.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2" style={{ color: '#95a6b7' }}>
                <li><a href="#features" className="hover:opacity-75">Features</a></li>
                <li><a href="/pricing" className="hover:opacity-75">Pricing</a></li>
                <li><a href="/auth" className="hover:opacity-75">Try Free</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2" style={{ color: '#95a6b7' }}>
                <li><a href="#" className="hover:opacity-75">Help Center</a></li>
                <li><a href="#" className="hover:opacity-75">Contact</a></li>
                <li><a href="#" className="hover:opacity-75">Feedback</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2" style={{ color: '#95a6b7' }}>
                <li><a href="#" className="hover:opacity-75">Privacy Policy</a></li>
                <li><a href="#" className="hover:opacity-75">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 text-center" style={{ borderTop: '1px solid #4b6b8b', color: '#95a6b7' }}>
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
