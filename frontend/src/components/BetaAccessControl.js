import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, Lock, Mail, AlertTriangle, Users } from 'lucide-react';
import { useBetaAuth } from '../contexts/BetaAuthContext';
import { useAuth } from '../contexts/AuthContext';

const BetaAccessControl = ({ children }) => {
  // PRODUCTION MODE: Skip all beta access controls
  const environment = process.env.REACT_APP_ENVIRONMENT || "PRODUCTION";
  
  if (environment === "PRODUCTION") {
    // In production, allow all users through - no beta restrictions
    return <>{children}</>;
  }

  // BETA MODE ONLY - rest of the component for beta testing
  const { user } = useAuth();
  const { hasAccess, loading, userRole } = useBetaAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying beta access...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#0f2f57' }}>
              Beta Access Required
            </h2>
            
            <p className="text-gray-600 mb-6">
              This is a private beta testing environment for ONESource-ai. 
              Please sign in with your authorized beta testing account.
            </p>
            
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="w-full mb-4"
              style={{ backgroundColor: '#0f2f57', color: 'white' }}
            >
              Sign In to Beta Environment
            </Button>
            
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-xs text-orange-800">
                <strong>Need beta access?</strong> Contact the development team 
                at <a href="mailto:support@onesource-ai.com" className="underline">support@onesource-ai.com</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access denied (beta mode only)
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-center text-gray-600">Beta access denied. Contact support@onesource-ai.com</p>
      </div>
    );
  }

  // Access granted - render the app
  return <>{children}</>;
};

// Role-based component wrapper
export const AdminOnly = ({ children, fallback = null }) => {
  const { canAccess } = useBetaAuth();
  
  if (!canAccess('admin')) {
    return fallback || (
      <Alert className="border-orange-200 bg-orange-50">
        <Lock className="w-4 h-4" />
        <AlertDescription className="text-orange-800">
          This feature requires administrator access.
        </AlertDescription>
      </Alert>
    );
  }
  
  return <>{children}</>;
};

// Beta tester component wrapper  
export const BetaFeature = ({ children, fallback = null }) => {
  const { hasAccess } = useBetaAuth();
  
  if (!hasAccess) {
    return fallback || (
      <Alert className="border-red-200 bg-red-50">
        <Users className="w-4 h-4" />
        <AlertDescription className="text-red-800">
          This feature is only available to beta testers.
        </AlertDescription>
      </Alert>
    );
  }
  
  return <>{children}</>;
};

export default BetaAccessControl;