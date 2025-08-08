import React, { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Shield, Bot, Zap, ArrowRight, CheckCircle, Star } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Hero Block Variations Component
const HeroBlocks = ({ variant = "default" }) => {
  const { user } = useAuth();
  
  const HeroVariant1 = () => (
    // 1. 3-Phase AI Intelligence
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
          <Badge className="w-fit mx-auto mb-6" style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}>
            🧠 3-Phase AI Intelligence
          </Badge>
          
          <h1 className="text-5xl font-bold mb-6" style={{ color: '#0f2f57' }}>
            Advanced Construction
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>
          <p className="text-xl mb-8 max-w-4xl mx-auto" style={{ color: '#4b6b8b' }}>
            Experience the only AI system designed specifically for AU/NZ construction professionals. Our 3-Phase Intelligence combines enhanced prompting, workflow intelligence, and specialized training to deliver expert-level responses with discipline-specific knowledge and project stage guidance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <Button size="lg" className="text-lg px-8 py-4 hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300" asChild style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}>
                <a href="/chat" className="flex items-center">
                  Experience AI Intelligence <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            ) : (
              <>
                <Button size="lg" className="text-lg px-8 py-4 hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300" asChild style={{ backgroundColor: '#0f2f57', color: '#f8fafc' }}>
                  <a href="/auth" className="flex items-center">
                    Try 3 Questions Free <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 hover:bg-opacity-5 border-2" asChild 
                  style={{ borderColor: '#4b6b8b', color: '#4b6b8b', backgroundColor: 'rgba(248, 250, 252, 0.95)' }}>
                  <a href="#features">Learn More</a>
                </Button>
              </>
            )}
          </div>

          {/* Trust Indicator with Construction Graphics */}
          <div className="rounded-lg p-4 max-w-2xl mx-auto" style={{ backgroundColor: 'rgba(201, 214, 228, 0.95)', border: '1px solid #95a6b7' }}>
            <div className="flex items-center justify-center" style={{ color: '#0f2f57' }}>
              <div className="flex items-center justify-center w-6 h-6 rounded-full mr-3" 
                style={{ backgroundColor: '#16a34a' }}>
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Built for construction professionals across Australia & New Zealand</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  
  const HeroVariant2 = () => (
    // 2. Knowledge Vault & Document Intelligence
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
            📚 Knowledge Vault & Document Intelligence
          </Badge>
          
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white max-w-4xl mx-auto">
            Intelligent Document
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Management & Search
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Upload your construction documents, specifications, and technical materials to create your personalized knowledge vault. Our AI processes PDFs, Word docs, and images to provide instant access to your project information with intelligent search and context-aware responses.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {user ? (
              <Button size="lg" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" 
                asChild style={{ backgroundColor: '#f8fafc', color: '#0f2f57' }}>
                <a href="/knowledge" className="flex items-center">
                  Access Knowledge Vault <BookOpen className="ml-3 h-6 w-6" />
                </a>
              </Button>
            ) : (
              <>
                <Button size="lg" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" 
                  asChild style={{ backgroundColor: '#f8fafc', color: '#0f2f57' }}>
                  <a href="/auth" className="flex items-center">
                    Start Free Trial <BookOpen className="ml-3 h-6 w-6" />
                  </a>
                </Button>
                <p className="text-gray-300 font-medium">
                  Upload documents • Intelligent search • Context-aware responses
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
  
  const HeroVariant3 = () => (
    // 3. Enhanced Construction Chat Experience
    <section className="py-20 relative overflow-hidden">
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
          <Badge className="mx-auto w-fit" style={{ backgroundColor: 'rgba(248, 250, 252, 0.2)', color: '#f8fafc', border: '1px solid rgba(248, 250, 252, 0.3)' }}>
            🚀 Enhanced Construction Chat Experience
          </Badge>
          
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white max-w-4xl mx-auto">
            ChatGPT-Style Interface
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">
              for Construction Pros
            </span>
          </h1>
          
          <p className="text-xl text-gray-200 leading-relaxed max-w-4xl mx-auto">
            Enjoy an intuitive chat experience enhanced with construction industry knowledge. Toggle between standard and knowledge-enhanced modes, access your conversation history, and get responses that combine technical accuracy with practical mentoring insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300" 
                asChild style={{ backgroundColor: '#f8fafc', color: '#0f2f57' }}>
                <a href="/chat" className="flex items-center">
                  Start Chatting Now <MessageSquare className="ml-3 h-5 w-5" />
                </a>
              </Button>
            ) : (
              <>
                <Button size="lg" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300" 
                  asChild style={{ backgroundColor: '#f8fafc', color: '#0f2f57' }}>
                  <a href="/auth" className="flex items-center">
                    Try 3 Questions Free <MessageSquare className="ml-3 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-white/30 text-white hover:bg-white/10" asChild>
                  <a href="/pricing">View Pricing</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  const HeroVariant4 = () => (
    // 4. Smart Workflow & Project Guidance
    <section className="py-20 relative overflow-hidden">
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
        style={{ backgroundColor: 'rgba(248, 250, 252, 0.7)' }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <Badge className="w-fit mx-auto mb-6" style={{ backgroundColor: '#16a34a', color: '#f8fafc' }}>
            ⚙️ Smart Workflow & Project Guidance
          </Badge>
          
          <h1 className="text-5xl font-bold mb-6" style={{ color: '#0f2f57' }}>
            Intelligent Project
            <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Stage Recognition
            </span>
          </h1>
          <p className="text-xl mb-8 max-w-4xl mx-auto" style={{ color: '#4b6b8b' }}>
            Our AI automatically detects your project stage—from concept planning to completion—and provides tailored workflow recommendations, key consultant suggestions, and critical considerations specific to your current phase of construction.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <Button size="lg" className="text-lg px-8 py-4 hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300" asChild style={{ backgroundColor: '#16a34a', color: '#f8fafc' }}>
                <a href="/chat" className="flex items-center">
                  Get Project Guidance <Settings className="ml-2 h-5 w-5" />
                </a>
              </Button>
            ) : (
              <>
                <Button size="lg" className="text-lg px-8 py-4 hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300" asChild style={{ backgroundColor: '#16a34a', color: '#f8fafc' }}>
                  <a href="/auth" className="flex items-center">
                    Try Smart Workflow <Settings className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 hover:bg-opacity-5 border-2" asChild 
                  style={{ borderColor: '#16a34a', color: '#16a34a', backgroundColor: 'rgba(248, 250, 252, 0.95)' }}>
                  <a href="#features">Learn More</a>
                </Button>
              </>
            )}
          </div>

          <div className="rounded-lg p-4 max-w-2xl mx-auto" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #16a34a' }}>
            <div className="flex items-center justify-center" style={{ color: '#16a34a' }}>
              <div className="flex items-center justify-center w-6 h-6 rounded-full mr-3" 
                style={{ backgroundColor: '#16a34a' }}>
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Automatic project stage detection with tailored recommendations</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const HeroVariant5 = () => (
    // 5. Industry Partner Integration
    <section className="py-20 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(/construction-hero-bg.jpg)',
          backgroundPosition: 'center center',
          backgroundSize: 'cover'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/85 to-indigo-900/80" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-8">
          <Badge className="mx-auto w-fit" style={{ backgroundColor: 'rgba(248, 250, 252, 0.2)', color: '#f8fafc', border: '1px solid rgba(248, 250, 252, 0.3)' }}>
            🤝 Industry Partner Integration
          </Badge>
          
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white max-w-4xl mx-auto">
            Verified Supplier &
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
              Partner Content
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Access content from verified construction industry suppliers and partners with proper attribution. Get technical specifications, installation guides, and product information directly integrated into AI responses, connecting you with trusted industry partners.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {user ? (
              <Button size="lg" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" 
                asChild style={{ backgroundColor: '#f8fafc', color: '#7c3aed' }}>
                <a href="/knowledge" className="flex items-center">
                  Explore Partners <Users className="ml-3 h-6 w-6" />
                </a>
              </Button>
            ) : (
              <>
                <Button size="lg" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" 
                  asChild style={{ backgroundColor: '#f8fafc', color: '#7c3aed' }}>
                  <a href="/auth" className="flex items-center">
                    Access Partner Content <Users className="ml-3 h-6 w-6" />
                  </a>
                </Button>
                <p className="text-gray-300 font-medium">
                  Verified suppliers • Technical specifications • Trusted partnerships
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  const HeroVariant6 = () => (
    // 6. Multi-Discipline Construction Expertise
    <section className="py-20 relative overflow-hidden">
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
        style={{ backgroundColor: 'rgba(15, 47, 87, 0.9)' }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center space-y-8">
          <Badge className="mx-auto w-fit" style={{ backgroundColor: 'rgba(248, 250, 252, 0.2)', color: '#f8fafc', border: '1px solid rgba(248, 250, 252, 0.3)' }}>
            💡 Multi-Discipline Construction Expertise
          </Badge>
          
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white max-w-5xl mx-auto">
            Structural, Fire Safety, Mechanical &
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-300">
              Hydraulic Intelligence
            </span>
          </h1>
          
          <p className="text-xl text-gray-200 leading-relaxed max-w-4xl mx-auto">
            Get specialized responses across all major construction disciplines. Our AI recognizes whether you're asking about structural engineering, fire safety, HVAC systems, or hydraulic design and provides discipline-specific expertise with professional-grade recommendations.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Shield className="w-8 h-8 mx-auto mb-2 text-white" />
              <span className="text-sm text-white">Structural</span>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Zap className="w-8 h-8 mx-auto mb-2 text-white" />
              <span className="text-sm text-white">Fire Safety</span>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Settings className="w-8 h-8 mx-auto mb-2 text-white" />
              <span className="text-sm text-white">Mechanical</span>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Bot className="w-8 h-8 mx-auto mb-2 text-white" />
              <span className="text-sm text-white">Hydraulic</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300" 
                asChild style={{ backgroundColor: '#f8fafc', color: '#0f2f57' }}>
                <a href="/chat" className="flex items-center">
                  Get Expert Advice <ArrowRight className="ml-3 h-5 w-5" />
                </a>
              </Button>
            ) : (
              <>
                <Button size="lg" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300" 
                  asChild style={{ backgroundColor: '#f8fafc', color: '#0f2f57' }}>
                  <a href="/auth" className="flex items-center">
                    Try Multi-Discipline AI <ArrowRight className="ml-3 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-white/30 text-white hover:bg-white/10" asChild>
                  <a href="/pricing">View All Features</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  // Render based on variant
  switch (variant) {
    case "ai-intelligence":
      return <HeroVariant1 />;
    case "knowledge-vault":
      return <HeroVariant2 />;
    case "chat-experience":
      return <HeroVariant3 />;
    case "workflow-guidance":
      return <HeroVariant4 />;
    case "partner-integration":
      return <HeroVariant5 />;
    case "multi-discipline":
      return <HeroVariant6 />;
    default:
      return <HeroVariant1 />;
  }
};

// Hero Block Selector Component for Admin/Demo purposes
export const HeroBlockSelector = ({ onVariantChange, currentVariant = "ai-intelligence" }) => {
  const variants = [
    { key: "ai-intelligence", name: "3-Phase AI Intelligence", description: "Advanced construction AI with 3-phase intelligence system" },
    { key: "knowledge-vault", name: "Knowledge Vault", description: "Intelligent document management and search capabilities" },
    { key: "chat-experience", name: "Chat Experience", description: "ChatGPT-style interface for construction professionals" },
    { key: "workflow-guidance", name: "Workflow Guidance", description: "Smart project stage recognition and recommendations" },
    { key: "partner-integration", name: "Partner Integration", description: "Verified supplier and partner content access" },
    { key: "multi-discipline", name: "Multi-Discipline", description: "Structural, fire safety, mechanical & hydraulic expertise" }
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