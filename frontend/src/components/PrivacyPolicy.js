import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const PrivacyPolicy = () => {
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
              Privacy Policy
            </h1>
          </div>
          <p style={{ color: '#4b6b8b' }}>
            Last updated: January 2025
          </p>
        </div>

        <Card style={{ borderColor: '#c9d6e4' }}>
          <CardContent className="p-8">
            <div className="space-y-8">
              
              {/* Introduction */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  1. Introduction
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    ONESource-ai ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered construction industry consultation platform.
                  </p>
                  <p>
                    This policy applies to all users of our services, including visitors, registered users, and subscribers.
                  </p>
                </div>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  2. Information We Collect
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      2.1 Personal Information
                    </h3>
                    <p>When you register and use our services, we may collect:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>Name and email address (via Firebase Authentication)</li>
                      <li>Professional information (profession, sector, experience level)</li>
                      <li>Company or organization details</li>
                      <li>Contact preferences and communication settings</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      2.2 Usage Data
                    </h3>
                    <p>We automatically collect information about how you use our services:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>Questions asked and AI responses provided</li>
                      <li>Feature usage patterns and interaction data</li>
                      <li>Session duration and frequency of use</li>
                      <li>Device information, IP address, and browser type</li>
                      <li>Error logs and performance metrics</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      2.3 Knowledge Vault Content
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef3cd', border: '1px solid #f59e0b' }}>
                      <p className="font-semibold mb-2">⚠️ Important: Document Upload Privacy</p>
                      <p>When you use our Knowledge Vault features, we collect:</p>
                      <ul className="list-disc ml-6 space-y-1 mt-2">
                        <li>Uploaded documents (PDFs, Word docs, images, text files)</li>
                        <li>Document metadata and extracted text content</li>
                        <li>User-created mentor notes and knowledge contributions</li>
                        <li>Document tags, categories, and search queries</li>
                        <li>Supplier information and attribution data</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      2.4 Payment Information
                    </h3>
                    <p>For subscription payments:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>Payment processing is handled securely by Stripe</li>
                      <li>We store subscription status and payment history</li>
                      <li>We do not store full credit card information</li>
                      <li>Billing addresses and invoice details are retained</li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  3. How We Use Your Information
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      3.1 Service Provision
                    </h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li>Provide AI-powered construction industry consultation</li>
                      <li>Personalize responses based on your professional background</li>
                      <li>Manage user accounts and subscription services</li>
                      <li>Process payments and maintain billing records</li>
                      <li>Provide customer support and respond to inquiries</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      3.2 AI Enhancement & Learning
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <p className="font-semibold mb-2">🤖 AI System Improvement</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Train and improve our AI models using anonymized interaction data</li>
                        <li>Enhance response accuracy and relevance</li>
                        <li>Develop better workflow intelligence and recommendations</li>
                        <li>Improve document processing and knowledge extraction capabilities</li>
                        <li>Create better construction industry-specific responses</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      3.3 Knowledge Base Enhancement
                    </h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li>Process uploaded documents to enhance AI responses for all users</li>
                      <li>Extract metadata and create searchable content indexes</li>
                      <li>Attribute supplier content appropriately in responses</li>
                      <li>Generate embeddings for semantic similarity search</li>
                      <li>Categorize and tag content for improved discoverability</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      3.4 Analytics & Improvements
                    </h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li>Monitor service performance and user satisfaction</li>
                      <li>Analyze usage patterns to improve features</li>
                      <li>Generate insights on construction industry trends</li>
                      <li>Detect and prevent fraudulent or inappropriate use</li>
                      <li>Ensure compliance with professional standards</li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* Information Sharing */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  4. Information Sharing & Disclosure
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      4.1 Third-Party Services
                    </h3>
                    <p>We share information with trusted third-party service providers:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li><strong>Firebase/Google:</strong> Authentication, user management, and cloud infrastructure</li>
                      <li><strong>Stripe:</strong> Payment processing and subscription management</li>
                      <li><strong>OpenAI:</strong> AI model inference and document processing (anonymized data only)</li>
                      <li><strong>MongoDB Atlas:</strong> Database hosting and data storage</li>
                      <li><strong>Emergent:</strong> Platform hosting and development infrastructure</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      4.2 Anonymized Data Sharing
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#eff6ff', border: '1px solid #93c5fd' }}>
                      <p>We may share anonymized, aggregated data for:</p>
                      <ul className="list-disc ml-6 space-y-1 mt-2">
                        <li>Construction industry research and insights</li>
                        <li>AI model training and improvement (OpenAI)</li>
                        <li>Academic research partnerships (with user consent)</li>
                        <li>Industry trend analysis and reporting</li>
                      </ul>
                      <p className="mt-2 font-semibold">
                        Personal identifiers are always removed from shared data.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      4.3 Legal Requirements
                    </h3>
                    <p>We may disclose information when required by law or to:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>Comply with legal processes or government requests</li>
                      <li>Protect our rights, property, or safety</li>
                      <li>Protect users' rights, property, or safety</li>
                      <li>Investigate fraud or security incidents</li>
                      <li>Enforce our Terms of Service</li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  5. Data Security & Protection
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      5.1 Security Measures
                    </h3>
                    <p>We implement industry-standard security measures:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>Encryption in transit (HTTPS/TLS) and at rest</li>
                      <li>Firebase Authentication with secure token management</li>
                      <li>Regular security audits and vulnerability assessments</li>
                      <li>Access controls and authentication for all systems</li>
                      <li>Monitoring and alerting for security incidents</li>
                      <li>Secure cloud infrastructure with major providers</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      5.2 Document Security
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                      <p className="font-semibold mb-2">🔒 Knowledge Vault Security</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Uploaded documents are encrypted and stored securely</li>
                        <li>Access is restricted to authenticated users only</li>
                        <li>Document processing is performed in secure environments</li>
                        <li>AI processing partners receive only necessary, anonymized content</li>
                        <li>User-specific content is never shared with other users</li>
                      </ul>
                      <p className="mt-2 font-semibold text-red-600">
                        ⚠️ However, no system is 100% secure. Please don't upload highly sensitive information.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      5.3 Data Breach Response
                    </h3>
                    <p>In the event of a data breach, we will:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>Immediately investigate and contain the incident</li>
                      <li>Notify affected users within 72 hours</li>
                      <li>Cooperate with relevant authorities as required</li>
                      <li>Implement additional security measures to prevent recurrence</li>
                      <li>Provide regular updates on remediation efforts</li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  6. Data Retention & Deletion
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      6.1 Retention Periods
                    </h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li><strong>Account Information:</strong> Retained while account is active + 2 years after deletion</li>
                      <li><strong>Chat History:</strong> Retained for service improvement (anonymized after 1 year)</li>
                      <li><strong>Uploaded Documents:</strong> Retained while account is active + user-requested deletion</li>
                      <li><strong>Payment Records:</strong> 7 years for tax and legal compliance</li>
                      <li><strong>Usage Analytics:</strong> Anonymized data retained indefinitely for service improvement</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      6.2 Data Deletion Rights
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <p className="font-semibold mb-2">✅ Your Data Rights</p>
                      <p>You have the right to:</p>
                      <ul className="list-disc ml-6 space-y-1 mt-2">
                        <li>Request deletion of your account and personal data</li>
                        <li>Delete specific uploaded documents from Knowledge Vault</li>
                        <li>Export your data in machine-readable format</li>
                        <li>Correct inaccurate personal information</li>
                        <li>Opt out of non-essential data processing</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      6.3 Limitations on Deletion
                    </h3>
                    <p>Some data cannot be deleted due to:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>Legal and regulatory requirements (payment records, tax documentation)</li>
                      <li>Safety and security purposes (fraud prevention, abuse detection)</li>
                      <li>Anonymized data used for AI training (personal identifiers already removed)</li>
                      <li>Backup systems (purged within 90 days of deletion request)</li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* User Rights */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  7. Your Privacy Rights
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      7.1 Access & Control
                    </h3>
                    <p>You can access and control your data through:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>Account settings page for personal information updates</li>
                      <li>Knowledge Vault interface for document management</li>
                      <li>Subscription settings for payment and billing preferences</li>
                      <li>Privacy controls for data sharing preferences</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      7.2 Communication Preferences
                    </h3>
                    <p>You can control communications by:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>Updating email notification preferences</li>
                      <li>Unsubscribing from marketing communications</li>
                      <li>Opting out of non-essential service updates</li>
                      <li>Setting preferences for AI improvement data usage</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      7.3 Data Portability
                    </h3>
                    <p>Upon request, we can provide:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>Complete export of your account data</li>
                      <li>Chat history in structured format</li>
                      <li>Uploaded documents and metadata</li>
                      <li>Account activity and usage statistics</li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* International Transfers */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  8. International Data Transfers
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    Our services use cloud infrastructure that may process data in multiple countries:
                  </p>
                  <ul className="list-disc ml-6 space-y-1 mt-2">
                    <li><strong>Primary Storage:</strong> Australia and New Zealand data centers</li>
                    <li><strong>Firebase/Google:</strong> May process data in Google's global infrastructure</li>
                    <li><strong>OpenAI:</strong> AI processing occurs in OpenAI's secure facilities (anonymized data only)</li>
                    <li><strong>Stripe:</strong> Payment processing may involve international transfers</li>
                  </ul>
                  <p className="mt-3">
                    All international transfers are protected by appropriate safeguards including standard contractual clauses and privacy frameworks.
                  </p>
                </div>
              </section>

              {/* Cookies & Tracking */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  9. Cookies & Tracking Technologies
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      9.1 Essential Cookies
                    </h3>
                    <p>We use essential cookies for:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>User authentication and session management</li>
                      <li>Security and fraud prevention</li>
                      <li>Service functionality and preferences</li>
                      <li>Load balancing and performance optimization</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      9.2 Analytics & Improvement
                    </h3>
                    <p>With your consent, we use analytics tools to:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>Understand usage patterns and popular features</li>
                      <li>Identify technical issues and performance bottlenecks</li>
                      <li>Measure user satisfaction and engagement</li>
                      <li>Guide product development decisions</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      9.3 Cookie Management
                    </h3>
                    <p>
                      You can manage cookies through your browser settings. However, disabling essential cookies may affect service functionality.
                    </p>
                  </div>

                </div>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  10. Children's Privacy
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                    <p className="font-semibold mb-2">🔞 Age Restriction</p>
                    <p>
                      ONESource-ai is intended for professional use by construction industry professionals. Our services are not directed to children under 18, and we do not knowingly collect personal information from children under 18.
                    </p>
                  </div>
                  <p>
                    If you believe a child under 18 has provided personal information to us, please contact us immediately, and we will delete such information.
                  </p>
                </div>
              </section>

              {/* Policy Changes */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  11. Privacy Policy Changes
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    We may update this Privacy Policy to reflect changes in our practices, technology, legal requirements, or other factors. We will:
                  </p>
                  <ul className="list-disc ml-6 space-y-1 mt-2">
                    <li>Notify users of material changes via email or in-app notifications</li>
                    <li>Post the updated policy on our website with the revision date</li>
                    <li>Provide at least 30 days notice for significant changes</li>
                    <li>Obtain consent for changes that expand data collection or sharing</li>
                  </ul>
                  <p className="mt-3">
                    Continued use of our services after policy updates constitutes acceptance of the revised policy.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  12. Contact Us
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    For privacy-related questions, concerns, or requests, please contact us:
                  </p>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <p><strong>Privacy Officer:</strong> support@onesource-ai.com</p>
                    <p><strong>Data Protection:</strong> support@onesource-ai.com</p>
                    <p><strong>General Inquiries:</strong> support@onesource-ai.com</p>
                    <p><strong>Postal Address:</strong></p>
                    <p>ONESource-ai Privacy Team</p>
                    <p>Suite 123, Construction Hub</p>
                    <p>Sydney NSW 2000, Australia</p>
                  </div>
                  <p>
                    We aim to respond to all privacy inquiries within 30 days.
                  </p>
                </div>
              </section>

              {/* Version Information */}
              <section className="border-t pt-6" style={{ borderColor: '#c9d6e4' }}>
                <div className="text-xs space-y-2" style={{ color: '#95a6b7' }}>
                  <p><strong>Privacy Policy Version:</strong> 1.0</p>
                  <p><strong>Last Updated:</strong> January 8, 2025</p>
                  <p><strong>Effective Date:</strong> January 8, 2025</p>
                  <p>
                    This policy supersedes all previous versions. We maintain a record of policy changes for transparency and compliance purposes.
                  </p>
                </div>
              </section>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;