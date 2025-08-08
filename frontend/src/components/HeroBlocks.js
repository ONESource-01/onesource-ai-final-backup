import React, { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Shield, Bot, Zap, ArrowRight, CheckCircle, Star } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Hero Block Variations Component
const HeroBlocks = ({ variant = "default" }) => {
  const { user } = useAuth();
  
  const HeroVariant1 = () => (
    // Modern Tech-focused Hero
    <section className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1508361727343-ca787442dcd7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjB0ZWNobm9sb2d5fGVufDB8fHx8MTc1NDYyNTIwN3ww&ixlib=rb-4.1.0&q=85)',
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <Badge className="w-fit" style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}>
              🚀 Powered by Advanced AI
            </Badge>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight" style={{ color: '#0f2f57' }}>
                Smart Construction
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Compliance Assistant
                </span>
              </h1>
              
              <p className="text-xl leading-relaxed" style={{ color: '#4b6b8b' }}>
                Revolutionize your workflow with AI that understands AU/NZ building standards. 
                Get instant expert guidance from planning to project delivery.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300" 
                  asChild style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}>
                  <a href="/chat" className="flex items-center">
                    Start Building Smarter <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300" 
                    asChild style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}>
                    <a href="/auth" className="flex items-center">
                      Try 3 Questions Free <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-gray-50" 
                    asChild style={{ borderColor: '#4b6b8b', color: '#4b6b8b' }}>
                    <a href="#features">View Demo</a>
                  </Button>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-r from-blue-400 to-indigo-500" />
                  ))}
                </div>
                <span className="ml-3 font-medium" style={{ color: '#4b6b8b' }}>
                  Trusted by 500+ professionals
                </span>
              </div>
              
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="ml-2 font-medium" style={{ color: '#4b6b8b' }}>4.9/5</span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.pexels.com/photos/33339851/pexels-photo-33339851.jpeg" 
                alt="Construction Professional"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="font-semibold text-gray-900">AS/NZS Compliant Response</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    "Your proposed beam design meets AS 1720.1 requirements..."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  
  const HeroVariant2 = () => (
    // Professional Focus Hero
    <section className="py-20 lg:py-28 relative">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1738817628102-0b420c17dac3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzU0NjI1MjAxfDA&ixlib=rb-4.1.0&q=85)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 to-slate-800/90" />
      
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
    // Split Layout Hero (Current + Enhanced)
    <section className="py-20 relative overflow-hidden min-h-screen flex items-center">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(/construction_hero_bg.jpeg)',
          backgroundPosition: 'center center',
          backgroundSize: 'cover'
        }}
      />
      <div 
        className="absolute inset-0" 
        style={{ backgroundColor: 'rgba(15, 47, 87, 0.85)' }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white">
                Expert Construction
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">
                  AI at Your Fingertips
                </span>
              </h1>
              
              <p className="text-xl text-gray-200 leading-relaxed">
                Navigate building codes, ensure compliance, and accelerate your projects with 
                AI specifically trained on Australian and New Zealand construction standards.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
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
            
            <div className="flex flex-col sm:flex-row gap-4">
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
            
            <div className="flex flex-wrap gap-6 items-center text-sm text-gray-300">
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
          
          {/* Right Column - Interactive Demo Preview */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-500 ml-auto">ONESource-ai</span>
              </div>
              
              <div className="space-y-4 h-96 overflow-hidden">
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <span className="font-medium text-gray-900">You:</span>
                  <p className="text-gray-700 mt-1">
                    "What beam size do I need for a 6m span in residential construction according to AS 1720?"
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <span className="font-medium text-blue-900 flex items-center">
                    <Bot className="w-4 h-4 mr-1" />
                    ONESource-ai:
                  </span>
                  <div className="text-blue-800 mt-1">
                    <p className="font-semibold">Technical Answer:</p>
                    <p className="text-xs mb-2">For a 6m span, AS 1720.1 requires minimum 240x45mm F8 pine beam for residential loads...</p>
                    
                    <p className="font-semibold">Mentoring Insight:</p>
                    <p className="text-xs">Consider load distribution and consult structural engineer for final verification.</p>
                  </div>
                </div>
                
                <div className="flex space-x-2 text-xs">
                  <button className="px-3 py-1 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                    👍 Helpful
                  </button>
                  <button className="px-3 py-1 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                    📋 Copy
                  </button>
                  <button className="px-3 py-1 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                    📚 Add to Knowledge
                  </button>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 text-center font-medium">
                  ✨ Live example of dual-layer AI responses
                </p>
              </div>
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