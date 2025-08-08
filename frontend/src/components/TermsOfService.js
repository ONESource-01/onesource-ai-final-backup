import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const TermsOfService = () => {
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
              Terms of Service
            </h1>
          </div>
          <p style={{ color: '#4b6b8b' }}>
            Last updated: January 2025
          </p>
        </div>

        <Card style={{ borderColor: '#c9d6e4' }}>
          <CardContent className="p-8">
            <div className="space-y-8">
              
              {/* Acceptance of Terms */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  1. Acceptance of Terms
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    By accessing and using ONESource-ai ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. These Terms of Service govern your use of our AI-powered construction industry consultation platform.
                  </p>
                  <p>
                    If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>
              </section>

              {/* Service Description */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  2. Service Description
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    ONESource-ai provides AI-powered construction industry consultation services specifically for the Australian and New Zealand markets. Our services include:
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Technical construction questions and answers</li>
                    <li>Building code and standards guidance</li>
                    <li>Knowledge vault document management</li>
                    <li>Construction workflow recommendations</li>
                    <li>Professional mentoring insights</li>
                  </ul>
                </div>
              </section>

              {/* Standards Australia Compliance */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  3. Standards Australia Compliance & Copyright
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef3cd', border: '2px solid #f59e0b' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#d97706' }}>
                      ⚠️ IMPORTANT: Australian Standards Copyright Notice
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <strong>Standards Australia Limited holds copyright over all Australian Standards (AS) and Australian/New Zealand Standards (AS/NZS).</strong> ONESource-ai strictly complies with copyright requirements:
                      </p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><strong>Reference Only:</strong> We reference standards by number and title only (e.g., "AS 1170.2 - Wind actions")</li>
                        <li><strong>No Reproduction:</strong> We never reproduce copyrighted tables, figures, calculations, or detailed technical specifications</li>
                        <li><strong>Professional Advice:</strong> All responses emphasize the need to purchase official standards from Standards Australia</li>
                        <li><strong>No Substitute:</strong> Our service is not a substitute for official standards documentation</li>
                      </ul>
                    </div>
                  </div>
                  <p>
                    <strong>User Responsibilities:</strong>
                  </p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Users must purchase official standards from Standards Australia for detailed technical specifications</li>
                    <li>Users acknowledge that AI responses are guidance only and not official interpretations</li>
                    <li>Users must not request or expect reproduction of copyrighted content</li>
                    <li>Users understand that professional engineering advice is required for complex projects</li>
                  </ul>
                </div>
              </section>

              {/* Professional Advice Disclaimer */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  4. Professional Advice Disclaimer
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#dc2626' }}>
                      🚨 CRITICAL: Professional Engineering Required
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <strong>ONESource-ai provides general guidance only and is NOT a substitute for professional engineering services.</strong>
                      </p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><strong>Structural Work:</strong> All structural engineering requires certified professional engineer review</li>
                        <li><strong>Fire Safety:</strong> Fire safety systems must be designed by qualified fire safety engineers</li>
                        <li><strong>Building Compliance:</strong> Building certifier approval required for regulatory compliance</li>
                        <li><strong>Complex Systems:</strong> Mechanical, electrical, and hydraulic systems require licensed professionals</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Knowledge Vault & Document Upload Terms */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  5. Knowledge Vault & Document Upload Terms
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    <strong>Document Ownership & Licensing:</strong>
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>You retain all ownership rights to documents you upload</li>
                    <li>You grant ONESource-ai a license to process and analyze uploaded content for AI enhancement</li>
                    <li>You warrant that you have the right to upload and share all uploaded content</li>
                    <li>You are responsible for ensuring uploaded content doesn't violate third-party copyrights</li>
                  </ul>
                  
                  <p className="mt-4">
                    <strong>Supplier Content & Attribution:</strong>
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Supplier-provided content will be attributed appropriately in AI responses</li>
                    <li>Supplier content remains the intellectual property of the respective supplier</li>
                    <li>Commercial use of supplier content requires direct supplier authorization</li>
                  </ul>
                  
                  <p className="mt-4">
                    <strong>Content Processing:</strong>
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Documents are processed using AI for metadata extraction and search indexing</li>
                    <li>Text extraction and analysis improve system responses for all users</li>
                    <li>Personal and commercially sensitive information should not be uploaded</li>
                    <li>We implement reasonable security measures but cannot guarantee absolute security</li>
                  </ul>
                </div>
              </section>

              {/* Subscription & Payment Terms */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  6. Subscription & Payment Terms
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    <strong>Subscription Tiers:</strong>
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Starter (Free):</strong> 3 questions per day with basic features</li>
                    <li><strong>Pro:</strong> Unlimited questions with advanced features</li>
                    <li><strong>Consultant:</strong> Full platform access including knowledge vault management</li>
                    <li><strong>Developer Access:</strong> Unlimited access for platform developers and testing</li>
                  </ul>
                  
                  <p className="mt-4">
                    <strong>Payment & Billing:</strong>
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Subscriptions are billed monthly in advance</li>
                    <li>All prices are in Australian Dollars (AUD) including GST where applicable</li>
                    <li>Payment processing is handled securely through Stripe</li>
                    <li>Refunds may be considered on a case-by-case basis within 7 days of purchase</li>
                  </ul>
                  
                  <p className="mt-4">
                    <strong>Voucher System:</strong>
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Vouchers provide temporary access to premium features</li>
                    <li>Each voucher can only be redeemed once per user</li>
                    <li>Voucher access expires after the specified duration</li>
                    <li>Vouchers cannot be transferred, sold, or exchanged for cash</li>
                  </ul>
                </div>
              </section>

              {/* User Responsibilities */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  7. User Responsibilities
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    Users are responsible for:
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Providing accurate information when creating accounts</li>
                    <li>Maintaining the security of their account credentials</li>
                    <li>Using the service only for legitimate construction industry purposes</li>
                    <li>Not attempting to reverse engineer or exploit the AI system</li>
                    <li>Respecting intellectual property rights of all content</li>
                    <li>Not uploading malicious, illegal, or harmful content</li>
                    <li>Seeking professional advice for critical construction decisions</li>
                  </ul>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  8. Limitation of Liability
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                    <p>
                      <strong>ONESource-ai, its officers, directors, employees, and agents shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from:</strong>
                    </p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>Use or inability to use the service</li>
                      <li>Reliance on AI-generated responses</li>
                      <li>Construction decisions based on platform guidance</li>
                      <li>Technical failures or service interruptions</li>
                      <li>Data loss or security breaches</li>
                      <li>Third-party content or supplier information</li>
                    </ul>
                  </div>
                  <p>
                    Your sole remedy for dissatisfaction with the service is to stop using it. Our total liability shall not exceed the amount paid for the service in the 12 months preceding the claim.
                  </p>
                </div>
              </section>

              {/* Service Modifications */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  9. Service Modifications & Termination
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    ONESource-ai reserves the right to:
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Modify, suspend, or discontinue the service at any time</li>
                    <li>Update these terms with reasonable notice</li>
                    <li>Terminate accounts for violation of terms</li>
                    <li>Change pricing with 30 days notice</li>
                    <li>Implement new features and requirements</li>
                  </ul>
                </div>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  10. Governing Law & Disputes
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    These terms are governed by the laws of Australia. Any disputes shall be resolved through:
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>First, good faith negotiation between the parties</li>
                    <li>If unresolved, binding arbitration under Australian Commercial Arbitration Rules</li>
                    <li>Exclusive jurisdiction in Australian courts for any legal proceedings</li>
                  </ul>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  11. Contact Information
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    For questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <p><strong>Email:</strong> support@onesource-ai.com</p>
                    <p><strong>Address:</strong> ONESource-ai Legal Department</p>
                    <p>Suite 123, Construction Hub</p>
                    <p>Sydney NSW 2000, Australia</p>
                  </div>
                </div>
              </section>

              {/* Version & Updates */}
              <section className="border-t pt-6" style={{ borderColor: '#c9d6e4' }}>
                <div className="text-xs space-y-2" style={{ color: '#95a6b7' }}>
                  <p><strong>Terms Version:</strong> 1.0</p>
                  <p><strong>Last Updated:</strong> January 8, 2025</p>
                  <p><strong>Effective Date:</strong> January 8, 2025</p>
                  <p>
                    These terms supersede all previous versions. Continued use of the service after updates constitutes acceptance of revised terms.
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

export default TermsOfService;