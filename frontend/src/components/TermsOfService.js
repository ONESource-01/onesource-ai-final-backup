import React, { useEffect } from "react";
import PageHeader from "./PageHeader";

const TermsOfService = () => {
  useEffect(() => {
    document.title = 'Terms of Service | ONESource-ai';
  }, []);

  return (
    <>
      <PageHeader 
        title="Terms of Service" 
        subtitle="Your agreement for using ONESource-ai's construction industry expertise platform"
      />
      
      <div className="max-w-4xl mx-auto p-8" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
        <div className="bg-white rounded-lg shadow-sm p-8" style={{ borderColor: '#c9d6e4', border: '1px solid' }}>
          <div className="flex items-center mb-8">
            <img 
              src="/onesource-primary-logo.svg" 
              alt="ONESource-ai" 
              className="h-24 w-auto mr-4"
            />
          </div>
          
          <div className="prose max-w-none">
            <p className="text-lg mb-6" style={{ color: '#4b6b8b' }}>
              <strong>Last Updated:</strong> December 2024
            </p>

            <h2 style={{ color: '#0f2f57' }}>1. Agreement to Terms</h2>
            <p style={{ color: '#4b6b8b' }}>
              By accessing or using ONESource-ai, you agree to be bound by these Terms of Service. 
              These terms apply to your use of our AI-powered construction industry expertise platform.
            </p>

            <h2 style={{ color: '#0f2f57' }}>2. Service Description</h2>
            <p style={{ color: '#4b6b8b' }}>
              ONESource-ai provides AI-powered construction industry guidance, specializing in AU/NZ 
              building standards, codes, and best practices across multiple disciplines including 
              structural, fire safety, mechanical, and hydraulic systems.
            </p>

            <h2 style={{ color: '#0f2f57' }}>3. User Responsibilities</h2>
            <ul style={{ color: '#4b6b8b' }}>
              <li>Use the service for professional construction-related purposes only</li>
              <li>Verify all AI-generated advice with licensed professionals</li>
              <li>Comply with all applicable local building codes and regulations</li>
              <li>Do not share your account credentials</li>
              <li>Report any technical issues or concerns promptly</li>
            </ul>

            <h2 style={{ color: '#0f2f57' }}>4. Professional Disclaimer</h2>
            <p style={{ color: '#4b6b8b' }}>
              ONESource-ai provides educational and guidance information only. Our AI responses are 
              for informational purposes and should not replace professional engineering, architectural, 
              or construction advice. Always consult licensed professionals for critical decisions.
            </p>

            <h2 style={{ color: '#0f2f57' }}>5. Knowledge Vault and Content</h2>
            <p style={{ color: '#4b6b8b' }}>
              Users may upload documents to their Personal Knowledge Bank for enhanced AI responses. 
              You retain ownership of your content and are responsible for ensuring you have rights 
              to upload materials. ONESource-ai may use uploaded content to improve service quality.
            </p>

            <h2 style={{ color: '#0f2f57' }}>6. Partner Content</h2>
            <p style={{ color: '#4b6b8b' }}>
              Our Community Knowledge Bank includes verified partner content. Partners must provide 
              valid ABN verification and agree to our Partner Upload Policy. Partner content is 
              attributed and subject to regular review.
            </p>

            <h2 style={{ color: '#0f2f57' }}>7. Payment and Subscription</h2>
            <p style={{ color: '#4b6b8b' }}>
              Service fees are processed through Stripe. Subscription terms are clearly outlined 
              during signup. Free trial usage is limited to 3 questions. Refunds are handled 
              according to our refund policy.
            </p>

            <h2 style={{ color: '#0f2f57' }}>8. Privacy and Data</h2>
            <p style={{ color: '#4b6b8b' }}>
              Your privacy is important to us. Please review our Privacy Policy for details on 
              how we collect, use, and protect your personal information and conversation data.
            </p>

            <h2 style={{ color: '#0f2f57' }}>9. Limitation of Liability</h2>
            <p style={{ color: '#4b6b8b' }}>
              ONESource-ai and its operators are not liable for any construction decisions, 
              project outcomes, or professional consequences resulting from use of our service. 
              Your use is at your own risk and professional judgment.
            </p>

            <h2 style={{ color: '#0f2f57' }}>10. Termination</h2>
            <p style={{ color: '#4b6b8b' }}>
              We may terminate or suspend access for violations of these terms, illegal activity, 
              or misuse of the service. You may cancel your subscription at any time through 
              your account settings.
            </p>

            <h2 style={{ color: '#0f2f57' }}>11. Changes to Terms</h2>
            <p style={{ color: '#4b6b8b' }}>
              We may update these terms periodically. Continued use after changes constitutes 
              acceptance of new terms. We will notify users of significant changes via email.
            </p>

            <h2 style={{ color: '#0f2f57' }}>12. Contact Information</h2>
            <p style={{ color: '#4b6b8b' }}>
              Questions about these Terms of Service? Contact us at{' '}
              <a href="mailto:support@onesource-ai.com" style={{ color: '#0f2f57' }}>
                support@onesource-ai.com
              </a>
            </p>

            <h2 style={{ color: '#0f2f57' }}>13. Governing Law</h2>
            <p style={{ color: '#4b6b8b' }}>
              These terms are governed by Australian law. Any disputes will be resolved in 
              accordance with Australian legal procedures.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;