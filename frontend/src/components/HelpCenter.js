import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import PageHeader from "./PageHeader";
import { 
  Search, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  Play, 
  ChevronRight, 
  HelpCircle,
  FileText,
  Video,
  Users,
  Wrench,
  Shield,
  Zap
} from "lucide-react";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const helpCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Play,
      color: "#16a34a",
      description: "Learn the basics of ONESource-ai",
      articles: 6
    },
    {
      id: "construction-ai",
      title: "Construction AI Features",
      icon: Wrench,
      color: "#dc2626", 
      description: "Understanding AI responses and features",
      articles: 12
    },
    {
      id: "standards-compliance",
      title: "AU/NZ Standards",
      icon: Shield,
      color: "#0f2f57",
      description: "Building codes and compliance guidance",
      articles: 18
    },
    {
      id: "account-billing",
      title: "Account & Billing",
      icon: Settings,
      color: "#7c2d12",
      description: "Manage your subscription and account",
      articles: 8
    }
  ];

  const popularArticles = [
    {
      title: "How to ask effective construction questions",
      category: "Getting Started",
      readTime: "3 min read",
      icon: MessageSquare,
      helpful: 94
    },
    {
      title: "Understanding dual-layer AI responses", 
      category: "Construction AI Features",
      readTime: "5 min read",
      icon: Zap,
      helpful: 89
    },
    {
      title: "AS/NZS standards referenced by ONESource-ai",
      category: "AU/NZ Standards", 
      readTime: "7 min read",
      icon: FileText,
      helpful: 91
    },
    {
      title: "Managing your daily question limits",
      category: "Account & Billing",
      readTime: "2 min read", 
      icon: Settings,
      helpful: 87
    },
    {
      title: "Using the Knowledge Vault for project research",
      category: "Construction AI Features",
      readTime: "6 min read",
      icon: BookOpen,
      helpful: 92
    }
  ];

  const quickActions = [
    {
      title: "Watch Getting Started Video",
      description: "5-minute overview of ONESource-ai",
      icon: Video,
      action: "Watch Now",
      color: "#dc2626"
    },
    {
      title: "Contact Support Team",
      description: "Get help from our construction experts",
      icon: Users,
      action: "Contact Us",
      color: "#0f2f57"
    },
    {
      title: "Submit Feedback",
      description: "Help us improve ONESource-ai",
      icon: MessageSquare,
      action: "Give Feedback",
      color: "#16a34a"
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <PageHeader 
        title="ONESource-ai Help Center"
        subtitle="Get the most out of your construction AI assistant with guides, tutorials, and expert tips."
      />

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="max-w-2xl mx-auto relative mb-12">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search for help articles, guides, or tutorials..."
            className="w-full pl-12 pr-4 py-4 rounded-lg border-0 text-lg shadow-lg"
            style={{ backgroundColor: '#ffffff', color: '#0f2f57', border: '1px solid #c9d6e4' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8" style={{ color: '#0f2f57' }}>
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                      style={{ backgroundColor: action.color + '20' }}
                    >
                      <action.icon className="w-6 h-6" style={{ color: action.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: '#0f2f57' }}>
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    style={{ backgroundColor: action.color, color: 'white' }}
                    className="w-full"
                  >
                    {action.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Help Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8" style={{ color: '#0f2f57' }}>
            Browse by Category
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {helpCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <category.icon className="w-6 h-6" style={{ color: category.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#0f2f57' }}>
                          {category.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{category.description}</p>
                        <Badge variant="outline" style={{ color: category.color, borderColor: category.color }}>
                          {category.articles} articles
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Popular Articles */}
        <section>
          <h2 className="text-2xl font-bold mb-8" style={{ color: '#0f2f57' }}>
            Popular Articles
          </h2>
          <div className="space-y-4">
            {popularArticles.map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-4">
                        <article.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors" 
                          style={{ color: '#0f2f57' }}>
                          {article.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{article.category}</span>
                          <span>•</span>
                          <span>{article.readTime}</span>
                          <span>•</span>
                          <span>{article.helpful}% found helpful</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="mt-16 text-center">
          <Card style={{ backgroundColor: '#0f2f57', color: 'white' }}>
            <CardContent className="p-8">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 text-white" />
              <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
              <p className="mb-6 text-gray-200">
                Our construction experts are here to help with any questions about building codes, 
                compliance requirements, or using ONESource-ai effectively.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  style={{ backgroundColor: 'white', color: '#0f2f57' }}
                  className="hover:opacity-90"
                >
                  Contact Support Team
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-900"
                >
                  Schedule a Demo Call
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;