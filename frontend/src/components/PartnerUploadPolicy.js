import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const PartnerUploadPolicy = () => {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/onesource-logo.png" 
              alt="ONESource-ai" 
              className="h-10 w-auto"
            />
            <h1 className="text-3xl font-bold" style={{ color: '#0f2f57' }}>
              Community Knowledge Bank Partner Policy
            </h1>
          </div>
          <p style={{ color: '#4b6b8b' }}>
            Guidelines for construction industry partners contributing to the Community Knowledge Bank
          </p>
          <p className="text-sm mt-2" style={{ color: '#4b6b8b' }}>
            Last updated: January 2025
          </p>
        </div>

        <Card style={{ borderColor: '#c9d6e4' }}>
          <CardContent className="p-8">
            <div className="space-y-8">
              
              {/* Introduction */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  1. Community Knowledge Bank Overview
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    The ONESource-ai Community Knowledge Bank is a shared repository of construction industry expertise, 
                    technical documentation, and professional knowledge contributed by verified partners. This policy governs 
                    partner registration, content contribution, and community benefits.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '2px solid #16a34a' }}>
                      <h3 className="font-semibold mb-2" style={{ color: '#16a34a' }}>
                        🏢 Community Knowledge Bank
                      </h3>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Shared with all ONESource-ai users</li>
                        <li>Partner company attribution in AI responses</li>
                        <li>Marketing and brand visibility benefits</li>
                        <li>Requires ABN and partner registration</li>
                        <li>Professional content standards required</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f9ff', border: '2px solid #0ea5e9' }}>
                      <h3 className="font-semibold mb-2" style={{ color: '#0ea5e9' }}>
                        🔒 Personal Knowledge Bank
                      </h3>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Private to individual user accounts</li>
                        <li>No attribution or company credit</li>
                        <li>Available to any registered user</li>
                        <li>Used only in user's private conversations</li>
                        <li>No review process required</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Partner Registration */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  2. Partner Registration Requirements
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    To contribute to the Community Knowledge Bank, organizations must register as verified partners 
                    with the following requirements:
                  </p>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef3c7', border: '2px solid #f59e0b' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#f59e0b' }}>
                      📋 Registration Requirements
                    </h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li><strong>Valid Australian Business Number (ABN)</strong> - Verified during registration</li>
                      <li><strong>Company Information</strong> - Legal business name and contact details</li>
                      <li><strong>Primary Contact</strong> - Name and email of responsible person</li>
                      <li><strong>Backup Contact</strong> - Secondary email for continuity when staff changes</li>
                      <li><strong>Terms Agreement</strong> - Acceptance of this Partner Policy</li>
                    </ul>
                  </div>

                  <p>
                    <strong>Self-Registration Process:</strong> Partners can register immediately through the 
                    Knowledge Vault interface. No manual approval required - registration is processed automatically 
                    upon ABN validation and terms acceptance.
                  </p>
                </div>
              </section>

              {/* Content Standards */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  3. Content Standards & Responsibilities
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#dc2626' }}>
                      ⚖️ Partner Content Responsibilities
                    </h3>
                    <p className="mb-2">By uploading content to the Community Knowledge Bank, partners confirm and agree that:</p>
                    <ul className="list-disc ml-6 space-y-1">
                      <li><strong>Content Ownership:</strong> You own the content or have explicit rights to share it</li>
                      <li><strong>Accuracy Responsibility:</strong> You are responsible for the relevance and accuracy of all uploaded content</li>
                      <li><strong>Professional Standards:</strong> Content meets professional construction industry standards</li>
                      <li><strong>Copyright Compliance:</strong> Content does not infringe on third-party copyrights</li>
                      <li><strong>Update Obligation:</strong> You will notify us if content becomes outdated or inaccurate</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '2px solid #16a34a' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#16a34a' }}>
                      ✅ Recommended Content Types
                    </h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li>Technical specifications and product data sheets</li>
                      <li>Installation guides and best practice documentation</li>
                      <li>Standards compliance information (AS/NZS references)</li>
                      <li>Training materials and educational content</li>
                      <li>Case studies and application examples</li>
                      <li>Product safety and handling instructions</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Attribution and Usage */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  4. Attribution and Content Usage
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    Partners contributing to the Community Knowledge Bank receive proper attribution and marketing benefits:
                  </p>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f9ff', border: '2px solid #0ea5e9' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#0ea5e9' }}>
                      🎯 Attribution Benefits
                    </h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li><strong>AI Response Attribution:</strong> Your company name appears in AI responses when your content is referenced</li>
                      <li><strong>Example:</strong> "Based on [Your Company Name] technical documentation..."</li>
                      <li><strong>Knowledge Bank Visibility:</strong> Your company is credited in search results and document listings</li>
                      <li><strong>Upload Receipts:</strong> Email confirmations sent to both primary and backup contacts</li>
                      <li><strong>Partner Recognition:</strong> Listed as a Community Knowledge Bank contributor</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef3c7', border: '2px solid #f59e0b' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#f59e0b' }}>
                      📈 Marketing and Business Benefits
                    </h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li>Build brand authority in the AU/NZ construction industry</li>
                      <li>Increase visibility of your products and expertise</li>
                      <li>Support construction professionals with your knowledge</li>
                      <li>Demonstrate commitment to industry advancement</li>
                      <li>Generate leads through expert content positioning</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Content Management */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  5. Content Management and Removal
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '2px solid #6b7280' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#374151' }}>
                      🗑️ Content Removal Process
                    </h3>
                    <p className="mb-2">
                      Partners may request removal of their uploaded content at any time:
                    </p>
                    <ul className="list-disc ml-6 space-y-1">
                      <li><strong>Email Request:</strong> Send removal request to support@onesource-ai.com</li>
                      <li><strong>Include Document ID:</strong> Reference the Document ID from your upload receipt</li>
                      <li><strong>Processing Time:</strong> Removal requests processed within 5 business days</li>
                      <li><strong>Confirmation:</strong> Email confirmation sent when content is removed</li>
                      <li><strong>AI Training Data:</strong> Content may remain in AI training data until next model update</li>
                    </ul>
                  </div>

                  <p>
                    <strong>Content Updates:</strong> To update existing content, upload the new version and request 
                    removal of the outdated content. We recommend clearly labeling updated versions.
                  </p>
                </div>
              </section>

              {/* Legal and Compliance */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  6. Legal Framework and Compliance
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#dc2626' }}>
                      ⚖️ Legal Responsibilities
                    </h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li><strong>Content Liability:</strong> Partners retain full legal responsibility for their uploaded content</li>
                      <li><strong>Copyright Compliance:</strong> Partners warrant they have rights to share all uploaded content</li>
                      <li><strong>Accuracy Claims:</strong> Partners are responsible for the accuracy and currency of their content</li>
                      <li><strong>Third-Party Rights:</strong> Partners ensure content does not infringe third-party intellectual property</li>
                      <li><strong>Regulatory Compliance:</strong> Content must comply with relevant Australian standards and regulations</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '2px solid #16a34a' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#16a34a' }}>
                      🛡️ ONESource-ai Protections
                    </h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li>Partners grant ONESource-ai non-exclusive rights to use, display, and reference uploaded content</li>
                      <li>Content is used solely for enhancing AI responses and knowledge sharing</li>
                      <li>No commercial sale or redistribution of partner content</li>
                      <li>Proper attribution maintained in all content usage</li>
                      <li>Removal requests honored promptly</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Privacy and Data Protection */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  7. Privacy and Data Protection
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    Partner information and uploaded content are protected under our comprehensive privacy framework:
                  </p>
                  
                  <ul className="list-disc ml-6 space-y-1">
                    <li><strong>Partner Data:</strong> Registration information stored securely and used only for attribution and communication</li>
                    <li><strong>Content Security:</strong> Uploaded documents stored with enterprise-grade security measures</li>
                    <li><strong>Email Communications:</strong> Upload receipts and notifications sent only to registered partner contacts</li>
                    <li><strong>Access Controls:</strong> Partner content accessible only through the Community Knowledge Bank system</li>
                    <li><strong>Backup Contacts:</strong> Secondary email addresses used only when primary contact is unavailable</li>
                  </ul>

                  <p className="mt-3">
                    For full privacy details, see our <a href="/privacy" className="text-blue-600 underline">Privacy Policy</a>.
                  </p>
                </div>
              </section>

              {/* Support and Contact */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  8. Support and Contact Information
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f9ff', border: '2px solid #0ea5e9' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#0ea5e9' }}>
                      📞 Partner Support
                    </h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li><strong>Email:</strong> <a href="mailto:support@onesource-ai.com" className="text-blue-600 underline">support@onesource-ai.com</a></li>
                      <li><strong>Partner Registration Issues:</strong> Include your ABN and company name</li>
                      <li><strong>Content Removal Requests:</strong> Include Document ID from upload receipt</li>
                      <li><strong>Technical Support:</strong> Upload issues, file format questions</li>
                      <li><strong>Policy Questions:</strong> Attribution, content standards, legal questions</li>
                    </ul>
                  </div>

                  <p>
                    <strong>Response Time:</strong> Partner support requests are typically responded to within 1 business day. 
                    Content removal requests are processed within 5 business days.
                  </p>
                </div>
              </section>

              {/* Policy Updates */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  9. Policy Updates and Changes
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    This Partner Policy may be updated to reflect changes in our services, legal requirements, 
                    or industry standards. Partners will be notified of significant changes:
                  </p>
                  
                  <ul className="list-disc ml-6 space-y-1">
                    <li><strong>Email Notification:</strong> Major policy changes sent to all registered partner contacts</li>
                    <li><strong>Effective Date:</strong> Changes take effect 30 days after notification</li>
                    <li><strong>Continued Use:</strong> Continued uploading constitutes acceptance of updated policy</li>
                    <li><strong>Opt-Out Option:</strong> Partners may request content removal if they disagree with policy changes</li>
                  </ul>

                  <p className="mt-3">
                    <strong>Current Version:</strong> This policy is effective as of January 2025. Previous versions are 
                    available upon request.
                  </p>
                </div>
              </section>

              {/* Footer */}
              <div className="border-t pt-6 mt-8" style={{ borderColor: '#c9d6e4' }}>
                <div className="text-center space-y-2">
                  <p className="text-sm" style={{ color: '#4b6b8b' }}>
                    ONESource-ai Community Knowledge Bank Partner Policy
                  </p>
                  <p className="text-xs" style={{ color: '#95a6b7' }}>
                    Supporting the AU/NZ construction industry through shared knowledge and expertise
                  </p>
                  <p className="text-xs" style={{ color: '#95a6b7' }}>
                    Questions? Contact us at <a href="mailto:support@onesource-ai.com" className="text-blue-600 underline">support@onesource-ai.com</a>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerUploadPolicy;