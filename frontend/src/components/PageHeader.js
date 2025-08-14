import React from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";

const PageHeader = ({ title, subtitle, showAuth = true }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Navigation Header */}
      <header style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #c9d6e4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <img 
                  src="/ONESource_ICON.svg" 
                  alt="ONESource-ai" 
                  className="h-24 w-auto mr-3"
                />
              </a>
            </div>
            {showAuth && (
              <nav className="flex items-center space-x-6">
                <a href="/" className="hover:opacity-75 transition-opacity" style={{ color: '#4b6b8b' }}>Home</a>
                <a href="/pricing" className="hover:opacity-75 transition-opacity" style={{ color: '#4b6b8b' }}>Pricing</a>
                {user && (
                  <a href="/knowledge" className="hover:opacity-75 transition-opacity" style={{ color: '#4b6b8b' }}>Knowledge Vault</a>
                )}
                {user ? (
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" style={{ borderColor: '#95a6b7', color: '#4b6b8b' }}>
                      {user.email}
                    </Badge>
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
            )}
          </div>
        </div>
      </header>

      {/* Page Header */}
      {title && (
        <header style={{ backgroundColor: '#0f2f57' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </header>
      )}
    </>
  );
};

export default PageHeader;