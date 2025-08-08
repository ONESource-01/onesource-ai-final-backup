import React, { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Shield, Bot, Zap, ArrowRight, CheckCircle, Star } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Hero Block Variations Component
const HeroBlocks = ({ variant = "default" }) => {
  const { user } = useAuth();
  
  const HeroVariant1 = () => (
    // Original Design with New Background Image
    <section className="py-20 relative overflow-hidden">
      {/* Background Image - Full Width */}
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
  );
  
  const HeroVariant2 = () => (
    // Professional Focus Hero with Original Design
    <section className="py-20 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(/construction-hero-bg.jpg)',
          backgroundPosition: 'center center',
          backgroundSize: 'cover'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 to-slate-800/80" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-8">
          <Badge className="mx-auto w-fit" style={{ backgroundColor: 'rgba(248, 250, 252, 0.2)', color: '#f8fafc', border: '1px solid rgba(248, 250, 252, 0.3)' }}>
            ⚡ Instant Expert Knowledge
          </Badge>
          
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-white max-w-4xl mx-auto">
            Your Digital 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Construction Mentor
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Get expert guidance on AU/NZ building codes, compliance requirements, and industry best practices. 
            Powered by AI trained specifically for construction professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {user ? (
              <Button size="lg" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" 
                asChild style={{ backgroundColor: '#f8fafc', color: '#0f2f57' }}>
                <a href="/chat" className="flex items-center">
                  Access Your AI Mentor <Bot className="ml-3 h-6 w-6" />
                </a>
              </Button>
            ) : (
              <>
                <Button size="lg" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" 
                  asChild style={{ backgroundColor: '#f8fafc', color: '#0f2f57' }}>
                  <a href="/auth" className="flex items-center">
                    Start Free Trial <Bot className="ml-3 h-6 w-6" />
                  </a>
                </Button>
                <p className="text-gray-300 font-medium">
                  No credit card • 3 free questions • Instant access
                </p>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mx-auto flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">AU/NZ Standards</h3>
              <p className="text-gray-300 text-sm">BCA, NCC, AS/NZS compliance</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mx-auto flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Instant Answers</h3>
              <p className="text-gray-300 text-sm">Get expert guidance in seconds</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mx-auto flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Dual-Layer AI</h3>
              <p className="text-gray-300 text-sm">Technical + mentoring insights</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  
  const HeroVariant3 = () => (
    // Interactive Layout with Original Background
    <section className="py-20 relative overflow-hidden min-h-screen flex items-center">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(/construction-hero-bg.jpg)',
          backgroundPosition: 'center center',
          backgroundSize: 'cover'
        }}
      />
      <div 
        className="absolute inset-0" 
        style={{ backgroundColor: 'rgba(15, 47, 87, 0.85)' }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center space-y-8">
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white max-w-4xl mx-auto">
            Expert Construction
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">
              AI at Your Fingertips
            </span>
          </h1>
          
          <p className="text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto">
            Navigate building codes, ensure compliance, and accelerate your projects with 
            AI specifically trained on Australian and New Zealand construction standards.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-2xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Trusted by Industry Leaders</h3>
                <p className="text-gray-300 text-sm">
                  Join 500+ architects, engineers, and construction professionals using ONESource-ai daily
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300" 
                asChild style={{ backgroundColor: '#f8fafc', color: '#0f2f57' }}>
                <a href="/chat" className="flex items-center">
                  Launch AI Assistant <ArrowRight className="ml-3 h-5 w-5" />
                </a>
              </Button>
            ) : (
              <>
                <Button size="lg" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300" 
                  asChild style={{ backgroundColor: '#f8fafc', color: '#0f2f57' }}>
                  <a href="/auth" className="flex items-center">
                    Try 3 Questions Free <ArrowRight className="ml-3 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-white/30 text-white hover:bg-white/10" asChild>
                  <a href="/pricing">View Pricing</a>
                </Button>
              </>
            )}
          </div>
          
          <div className="flex flex-wrap gap-6 items-center justify-center text-sm text-gray-300">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Instant setup
            </div>
            <div className="flex items-center">
              <Bot className="w-4 h-4 mr-2" />
              Available 24/7
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Render based on variant
  switch (variant) {
    case "modern":
      return <HeroVariant1 />;
    case "professional":
      return <HeroVariant2 />;
    case "interactive":
      return <HeroVariant3 />;
    default:
      return <HeroVariant1 />;
  }
};

// Hero Block Selector Component for Admin/Demo purposes
export const HeroBlockSelector = ({ onVariantChange, currentVariant = "modern" }) => {
  const variants = [
    { key: "modern", name: "Modern Tech", description: "Clean, modern design with tech focus" },
    { key: "professional", name: "Professional Dark", description: "Dark, professional construction theme" },
    { key: "interactive", name: "Interactive Demo", description: "Split layout with live demo preview" }
  ];

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-xl border p-4 max-w-xs">
      <h3 className="font-semibold mb-3 text-sm text-gray-900">Hero Block Variants</h3>
      <div className="space-y-2">
        {variants.map((variant) => (
          <button
            key={variant.key}
            onClick={() => onVariantChange(variant.key)}
            className={`w-full text-left p-2 rounded text-xs transition-colors ${
              currentVariant === variant.key
                ? 'bg-blue-100 text-blue-900 border-blue-200'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="font-medium">{variant.name}</div>
            <div className="text-gray-500 mt-1">{variant.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroBlocks;