import React, { useEffect } from "react";
import PageHeader from "./PageHeader";

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | ONESource-ai';
  }, []);

  return (
    <>
      <PageHeader 
        title="Privacy Policy" 
        subtitle="How we protect and handle your data on ONESource-ai"
      />
      
      <div className="max-w-4xl mx-auto p-8" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
        <div className="bg-white rounded-lg shadow-sm p-8" style={{ borderColor: '#c9d6e4', border: '1px solid' }}>
          <div className="flex items-center mb-8">
            <img 
              src="/ONESource_ICON.svg" 
              alt="ONESource-ai" 
              className="h-24 w-auto mr-4"
            />
          </div>
          
          <div className="prose max-w-none">
            <p className="text-lg mb-6" style={{ color: '#4b6b8b' }}>
              <strong>Last Updated:</strong> December 2024
            </p>

            <h2 style={{ color: '#0f2f57' }}>1. Information We Collect</h2>
            <h3 style={{ color: '#0f2f57' }}>Account Information</h3>
            <p style={{ color: '#4b6b8b' }}>
              We collect your email address, password, and profile information when you create an account. 
              For Google sign-in users, we receive basic profile information from Google.
            </p>
            
            <h3 style={{ color: '#0f2f57' }}>Usage Data</h3>
            <p style={{ color: '#4b6b8b' }}>
              We collect information about how you use ONESource-ai, including your questions, 
              AI responses, conversation history, and feature usage patterns.
            </p>
            
            <h3 style={{ color: '#0f2f57' }}>Documents and Content</h3>
            <p style={{ color: '#4b6b8b' }}>
              Documents you upload to your Personal Knowledge Bank are stored securely and used 
              to enhance your AI interactions. Partner content uploaded to the Community Knowledge 
              Bank is subject to review and attribution.
            </p>

            <h2 style={{ color: '#0f2f57' }}>2. How We Use Your Information</h2>
            <ul style={{ color: '#4b6b8b' }}>
              <li>Provide personalized AI construction guidance</li>
              <li>Improve our AI models and service quality</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send service updates and support communications</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Ensure compliance with building codes and standards</li>
            </ul>

            <h2 style={{ color: '#0f2f57' }}>3. Information Sharing</h2>
            <p style={{ color: '#4b6b8b' }}>
              We do not sell your personal information. We may share data in these limited circumstances:
            </p>
            <ul style={{ color: '#4b6b8b' }}>
              <li><strong>Service Providers:</strong> Trusted partners like Stripe (payments), Firebase (authentication), and OpenAI (AI processing)</li>
              <li><strong>Partner Content:</strong> Community Knowledge Bank content includes proper attribution to verified partners</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In the event of a merger or acquisition</li>
            </ul>

            <h2 style={{ color: '#0f2f57' }}>4. Data Security</h2>
            <p style={{ color: '#4b6b8b' }}>
              We implement industry-standard security measures including encryption in transit and at rest, 
              secure authentication, regular security audits, and access controls. However, no system is 
              completely secure, and we cannot guarantee absolute security.
            </p>

            <h2 style={{ color: '#0f2f57' }}>5. Data Retention</h2>
            <p style={{ color: '#4b6b8b' }}>
              We retain your account information and conversation history while your account is active. 
              Personal Knowledge Bank documents are retained as long as you choose to keep them. 
              You can delete content at any time through your account settings.
            </p>

            <h2 style={{ color: '#0f2f57' }}>6. Your Rights and Choices</h2>
            <ul style={{ color: '#4b6b8b' }}>
              <li><strong>Access:</strong> View your personal information in your account settings</li>
              <li><strong>Update:</strong> Modify your profile and preferences at any time</li>
              <li><strong>Delete:</strong> Remove documents, conversations, or close your account</li>
              <li><strong>Export:</strong> Download your conversation history and uploaded documents</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>

            <h2 style={{ color: '#0f2f57' }}>7. Cookies and Tracking</h2>
            <p style={{ color: '#4b6b8b' }}>
              We use essential cookies for authentication and service functionality. Analytics cookies 
              help us understand usage patterns. You can control cookie settings through your browser.
            </p>

            <h2 style={{ color: '#0f2f57' }}>8. Third-Party Integrations</h2>
            <p style={{ color: '#4b6b8b' }}>
              ONESource-ai integrates with third-party services:
            </p>
            <ul style={{ color: '#4b6b8b' }}>
              <li><strong>Firebase:</strong> Authentication and user management (Google Privacy Policy applies)</li>
              <li><strong>Stripe:</strong> Payment processing (Stripe Privacy Policy applies)</li>
              <li><strong>OpenAI:</strong> AI response generation (OpenAI Privacy Policy applies)</li>
            </ul>

            <h2 style={{ color: '#0f2f57' }}>9. International Data Transfers</h2>
            <p style={{ color: '#4b6b8b' }}>
              Your data may be processed in countries outside Australia, including the United States 
              where our cloud services operate. We ensure appropriate safeguards are in place.
            </p>

            <h2 style={{ color: '#0f2f57' }}>10. Children's Privacy</h2>
            <p style={{ color: '#4b6b8b' }}>
              ONESource-ai is designed for construction professionals and is not intended for use by 
              individuals under 16. We do not knowingly collect information from children.
            </p>

            <h2 style={{ color: '#0f2f57' }}>11. Changes to Privacy Policy</h2>
            <p style={{ color: '#4b6b8b' }}>
              We may update this Privacy Policy periodically. We will notify you of significant changes 
              via email or service notification. Continued use constitutes acceptance of updated terms.
            </p>

            <h2 style={{ color: '#0f2f57' }}>12. Contact Information</h2>
            <p style={{ color: '#4b6b8b' }}>
              Questions about this Privacy Policy or your data? Contact us at{' '}
              <a href="mailto:support@onesource-ai.com" style={{ color: '#0f2f57' }}>
                support@onesource-ai.com
              </a>
            </p>

            <h2 style={{ color: '#0f2f57' }}>13. Australian Privacy Act</h2>
            <p style={{ color: '#4b6b8b' }}>
              This Privacy Policy complies with the Australian Privacy Act 1988. You have rights under 
              Australian privacy law, including the right to complain to the Office of the Australian 
              Information Commissioner (OAIC).
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;