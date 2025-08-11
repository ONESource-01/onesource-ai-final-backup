import React, { useEffect } from "react";
import PageHeader from "./PageHeader";

const PartnerUploadPolicy = () => {
  useEffect(() => {
    document.title = 'Partner Upload Policy | ONESource-ai';
  }, []);

  return (
    <>
      <PageHeader 
        title="Partner Upload Policy" 
        subtitle="Guidelines for verified partners contributing to the Community Knowledge Bank"
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

            <h2 style={{ color: '#0f2f57' }}>1. Partner Verification Requirements</h2>
            <h3 style={{ color: '#0f2f57' }}>Business Registration</h3>
            <p style={{ color: '#4b6b8b' }}>
              All partners must provide a valid Australian Business Number (ABN) or New Zealand 
              Business Number (NZBN) and undergo verification through official business registries.
            </p>
            
            <h3 style={{ color: '#0f2f57' }}>Industry Credentials</h3>
            <p style={{ color: '#4b6b8b' }}>
              Partners should demonstrate relevant industry expertise in construction, building 
              materials, engineering, or related professional services within the AU/NZ market.
            </p>

            <h2 style={{ color: '#0f2f57' }}>2. Content Standards</h2>
            <h3 style={{ color: '#0f2f57' }}>Professional Quality</h3>
            <ul style={{ color: '#4b6b8b' }}>
              <li>Content must be professionally written and technically accurate</li>
              <li>Documentation should be current and reflect latest industry standards</li>
              <li>All technical specifications must comply with AU/NZ building codes</li>
              <li>Product information should include relevant compliance certifications</li>
            </ul>
            
            <h3 style={{ color: '#0f2f57' }}>Prohibited Content</h3>
            <ul style={{ color: '#4b6b8b' }}>
              <li>Outdated or superseded technical specifications</li>
              <li>Misleading or inaccurate product claims</li>
              <li>Content that violates intellectual property rights</li>
              <li>Marketing materials without technical substance</li>
              <li>Personal opinions without professional backing</li>
            </ul>

            <h2 style={{ color: '#0f2f57' }}>3. Review and Approval Process</h2>
            <h3 style={{ color: '#0f2f57' }}>Initial Review</h3>
            <p style={{ color: '#4b6b8b' }}>
              All uploaded content undergoes initial review for:
            </p>
            <ul style={{ color: '#4b6b8b' }}>
              <li>Technical accuracy and relevance</li>
              <li>Compliance with AU/NZ standards</li>
              <li>Professional presentation quality</li>
              <li>Appropriate categorization and tagging</li>
            </ul>
            
            <h3 style={{ color: '#0f2f57' }}>Ongoing Monitoring</h3>
            <p style={{ color: '#4b6b8b' }}>
              Content is subject to periodic review and may be updated or removed if standards change 
              or if technical inaccuracies are identified.
            </p>

            <h2 style={{ color: '#0f2f57' }}>4. Attribution and Recognition</h2>
            <h3 style={{ color: '#0f2f57' }}>Content Attribution</h3>
            <p style={{ color: '#4b6b8b' }}>
              All approved content in the Community Knowledge Bank includes proper attribution to 
              the contributing partner, including company name and verification status.
            </p>
            
            <h3 style={{ color: '#0f2f57' }}>Partner Benefits</h3>
            <ul style={{ color: '#4b6b8b' }}>
              <li>Enhanced visibility within the ONESource-ai platform</li>
              <li>Professional recognition as a verified industry contributor</li>
              <li>Access to usage analytics for contributed content</li>
              <li>Opportunity to establish thought leadership</li>
            </ul>

            <h2 style={{ color: '#0f2f57' }}>5. Intellectual Property Rights</h2>
            <h3 style={{ color: '#0f2f57' }}>Content Ownership</h3>
            <p style={{ color: '#4b6b8b' }}>
              Partners retain ownership of their contributed content. By uploading content, partners 
              grant ONESource-ai a license to use, display, and distribute the content within the platform.
            </p>
            
            <h3 style={{ color: '#0f2f57' }}>Third-Party Rights</h3>
            <p style={{ color: '#4b6b8b' }}>
              Partners must ensure they have necessary rights to share all uploaded content and that 
              it does not infringe on third-party intellectual property.
            </p>

            <h2 style={{ color: '#0f2f57' }}>6. Content Categories</h2>
            <h3 style={{ color: '#0f2f57' }}>Accepted Content Types</h3>
            <ul style={{ color: '#4b6b8b' }}>
              <li><strong>Technical Specifications:</strong> Product datasheets, installation guides, technical manuals</li>
              <li><strong>Compliance Documentation:</strong> Certification reports, compliance statements, test results</li>
              <li><strong>Best Practices:</strong> Industry guidelines, recommended procedures, case studies</li>
              <li><strong>Standards Interpretation:</strong> Guidance on building codes and regulatory requirements</li>
              <li><strong>Product Catalogs:</strong> Comprehensive product information with technical details</li>
            </ul>

            <h2 style={{ color: '#0f2f57' }}>7. Quality Assurance</h2>
            <h3 style={{ color: '#0f2f57' }}>Content Updates</h3>
            <p style={{ color: '#4b6b8b' }}>
              Partners are expected to keep their content current and notify ONESource-ai of any 
              updates to products, standards, or technical specifications.
            </p>
            
            <h3 style={{ color: '#0f2f57' }}>Feedback Integration</h3>
            <p style={{ color: '#4b6b8b' }}>
              We welcome user feedback on partner content and will work with partners to address 
              any technical concerns or improvement suggestions.
            </p>

            <h2 style={{ color: '#0f2f57' }}>8. Partnership Termination</h2>
            <h3 style={{ color: '#0f2f57' }}>Content Removal</h3>
            <p style={{ color: '#4b6b8b' }}>
              Partners may request removal of their content at any time. ONESource-ai reserves the 
              right to remove content that no longer meets quality standards or partnership requirements.
            </p>

            <h2 style={{ color: '#0f2f57' }}>9. Contact Information</h2>
            <p style={{ color: '#4b6b8b' }}>
              Questions about partnership opportunities or content policies? Contact us at{' '}
              <a href="mailto:support@onesource-ai.com" style={{ color: '#0f2f57' }}>
                support@onesource-ai.com
              </a>
            </p>

            <h2 style={{ color: '#0f2f57' }}>10. Policy Updates</h2>
            <p style={{ color: '#4b6b8b' }}>
              This policy may be updated periodically to reflect changes in industry standards, 
              platform capabilities, or regulatory requirements. Partners will be notified of 
              significant changes.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerUploadPolicy;