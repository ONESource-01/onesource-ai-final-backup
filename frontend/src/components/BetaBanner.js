import React, { useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { X, Shield, Lock, TestTube } from "lucide-react";

const BetaBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  
  const environment = process.env.REACT_APP_ENVIRONMENT || "PRODUCTION";
  const appVersion = process.env.REACT_APP_VERSION || "1.0";
  
  // Only show banner in BETA environment
  if (environment !== "BETA") {
    return null;
  }
  
  if (!isVisible) return null;

  return (
    <>
      {/* Beta Environment Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-4 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <TestTube className="w-4 h-4" />
            <span className="font-semibold">BETA TESTING ENVIRONMENT</span>
            <Badge className="bg-white/20 text-white border-white/30">
              v{appVersion}
            </Badge>
            <span className="hidden md:inline">
              • Private Access Only • Confidential Content
            </span>
          </div>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="hover:bg-white/10 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Access Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#0f2f57' }}>
                Beta Testing Environment
              </h2>
              
              <div className="text-left space-y-3 mb-6 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <Lock className="w-4 h-4 mt-0.5 text-orange-600 flex-shrink-0" />
                  <p><strong>Restricted Access:</strong> This environment is for authorized beta testers only</p>
                </div>
                <div className="flex items-start space-x-2">
                  <TestTube className="w-4 h-4 mt-0.5 text-orange-600 flex-shrink-0" />
                  <p><strong>Testing Purpose:</strong> Features may be unstable and data may be reset</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 mt-0.5 text-orange-600 flex-shrink-0" />
                  <p><strong>Confidential:</strong> All content and functionality is proprietary and confidential</p>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-3 mb-6">
                <p className="text-xs text-orange-800">
                  <strong>Notice:</strong> By using this beta environment, you agree to keep all 
                  information confidential and provide constructive feedback to help improve ONESource-ai.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowDisclaimer(false)}
                  className="flex-1"
                  style={{ backgroundColor: '#0f2f57', color: 'white' }}
                >
                  I Understand - Continue Testing
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BetaBanner;