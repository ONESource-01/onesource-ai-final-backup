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
              Partner & Supplier Upload Policy
            </h1>
          </div>
          <p style={{ color: '#4b6b8b' }}>
            Guidelines for construction industry partners and suppliers contributing content to ONESource-ai
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
                  1. Introduction & Purpose
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    This Partner & Supplier Upload Policy governs the contribution of content by construction industry partners, suppliers, manufacturers, and service providers to the ONESource-ai knowledge base. This policy ensures proper attribution, copyright compliance, and quality standards for all partner-contributed content.
                  </p>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '2px solid #16a34a' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#16a34a' }}>
                      🤝 Partnership Benefits
                    </h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li>Increase visibility of your products and services</li>
                      <li>Provide technical support to construction professionals</li>
                      <li>Build industry authority through knowledge sharing</li>
                      <li>Receive proper attribution for all contributed content</li>
                      <li>Support the advancement of construction industry standards</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Eligible Partners */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  2. Eligible Partners & Suppliers
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      2.1 Qualifying Organizations
                    </h3>
                    <p>Eligible partners include (but are not limited to):</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li><strong>Building Material Suppliers:</strong> Including but not limited to concrete, steel, timber, insulation, cladding, adhesives, sealants, membranes, and all other construction materials</li>
                      <li><strong>Equipment Manufacturers:</strong> Including but not limited to HVAC systems, pumps, valves, plumbing fixtures, electrical equipment, fire safety equipment, lighting, security systems, access control, and all other construction-related equipment</li>
                      <li><strong>Service Providers:</strong> Including but not limited to testing services, consultancies, specialized contractors, inspection services, certification bodies, and technical advisory services</li>
                      <li><strong>Technology Companies:</strong> Including but not limited to construction software, IoT devices, monitoring systems, BIM solutions, project management tools, and digital construction technologies</li>
                      <li><strong>Industry Organizations:</strong> Including but not limited to peak bodies, trade associations, research institutions, training organizations, and professional societies</li>
                      <li><strong>Professional Services:</strong> Including but not limited to engineering firms, architectural practices, certifying bodies, quantity surveyors, project managers, and specialist consultants</li>
                    </ul>
                    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <p className="text-sm font-medium" style={{ color: '#16a34a' }}>
                        📝 Note: These categories are illustrative examples only. All legitimate construction industry participants are welcome to apply for partnership, regardless of whether their specific products or services are explicitly listed above.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      2.2 Partner Requirements
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#eff6ff', border: '1px solid #93c5fd' }}>
                      <p>To participate as a content partner, organizations must:</p>
                      <ul className="list-disc ml-6 space-y-1 mt-2">
                        <li>Be actively engaged in the AU/NZ construction industry</li>
                        <li>Hold appropriate business registrations and insurance</li>
                        <li>Maintain current industry certifications and accreditations</li>
                        <li>Agree to content quality and accuracy standards</li>
                        <li>Provide accurate company information and ABN/NZBN</li>
                        <li>Designate authorized representatives for content uploads</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </section>

              {/* Acceptable Content Types */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  3. Acceptable Content Types & Standards
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      3.1 Technical Documentation
                    </h3>
                    <p>Partners may contribute:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li><strong>Product Specifications:</strong> Detailed technical specifications, performance data, compliance information</li>
                      <li><strong>Installation Guides:</strong> Step-by-step installation procedures, best practices, troubleshooting</li>
                      <li><strong>Design Guidelines:</strong> Design considerations, sizing calculations, application recommendations</li>
                      <li><strong>Testing Reports:</strong> Independent testing results, certification documents, performance validation</li>
                      <li><strong>Maintenance Instructions:</strong> Ongoing maintenance requirements, service schedules, replacement procedures</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      3.2 Educational Content
                    </h3>
                    <p>High-value educational materials including:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li><strong>Technical Papers:</strong> Research findings, case studies, industry analysis</li>
                      <li><strong>Best Practice Guides:</strong> Industry best practices, lessons learned, implementation strategies</li>
                      <li><strong>Training Materials:</strong> Professional development resources, technical training content</li>
                      <li><strong>Standards Interpretation:</strong> Guidance on implementing Australian Standards (without reproducing copyrighted content)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      3.3 Quality Standards
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef3cd', border: '1px solid #f59e0b' }}>
                      <p className="font-semibold mb-2">📋 Content Quality Requirements:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><strong>Accuracy:</strong> All technical information must be current and accurate</li>
                        <li><strong>Relevance:</strong> Content must be specifically relevant to AU/NZ construction industry</li>
                        <li><strong>Completeness:</strong> Sufficient detail to be useful for professional decision-making</li>
                        <li><strong>Clarity:</strong> Written in clear, professional language appropriate for industry professionals</li>
                        <li><strong>Currency:</strong> Information must be up-to-date with current standards and regulations</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </section>

              {/* Copyright & IP Requirements */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  4. Copyright & Intellectual Property Requirements
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      4.1 Partner Content Ownership
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <p className="font-semibold mb-2">✅ Your Content Rights:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><strong>Ownership Retained:</strong> Partners retain full ownership of all contributed content</li>
                        <li><strong>Proper Attribution:</strong> All content will be clearly attributed to the contributing partner</li>
                        <li><strong>Usage License:</strong> Partners grant ONESource-ai a license to display and distribute content within the platform</li>
                        <li><strong>Withdrawal Rights:</strong> Partners may request removal of their content with reasonable notice</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      4.2 Standards Australia Compliance
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626' }}>
                      <h3 className="font-semibold mb-2" style={{ color: '#dc2626' }}>
                        ⚠️ CRITICAL: Australian Standards Copyright
                      </h3>
                      <div className="space-y-2">
                        <p>
                          <strong>All partners must comply with Standards Australia copyright requirements:</strong>
                        </p>
                        <ul className="list-disc ml-6 space-y-1">
                          <li><strong>Reference Only:</strong> Reference standards by number and title only (e.g., "AS 1170.2 - Wind actions")</li>
                          <li><strong>No Reproduction:</strong> Never reproduce copyrighted tables, figures, calculations, or detailed specifications</li>
                          <li><strong>Purchase Requirement:</strong> Encourage users to purchase official standards from Standards Australia</li>
                          <li><strong>Interpretation Disclaimers:</strong> Clarify that content is interpretation/guidance, not official standards</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      4.3 Third-Party Content
                    </h3>
                    <p>Partners must ensure:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>All contributed content is original or properly licensed</li>
                      <li>No third-party copyrighted material is included without permission</li>
                      <li>All necessary permissions and releases have been obtained</li>
                      <li>Content does not infringe on patents, trademarks, or trade secrets</li>
                      <li>Appropriate disclaimers are included where required</li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* Upload Process & Requirements */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  5. Upload Process & Technical Requirements
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      5.1 Account Setup
                    </h3>
                    <p>Partner account setup requires:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>Complete company registration details and ABN/NZBN</li>
                      <li>Designated authorized representatives for content management</li>
                      <li>Current insurance certificates and relevant accreditations</li>
                      <li>Agreement to partner terms and content quality standards</li>
                      <li>Contact information for technical queries and updates</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      5.2 Content Upload Requirements
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#eff6ff', border: '1px solid #93c5fd' }}>
                      <p className="font-semibold mb-2">📁 Technical Upload Specifications:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><strong>File Formats:</strong> PDF, Word documents (.docx), images (PNG, JPG), text files</li>
                        <li><strong>File Size:</strong> Maximum 50MB per file for optimal processing</li>
                        <li><strong>Document Quality:</strong> High resolution, clearly readable text, professional formatting</li>
                        <li><strong>Metadata:</strong> Descriptive titles, relevant tags, accurate categorization</li>
                        <li><strong>Version Control:</strong> Clear version information and update dates</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      5.3 Content Tagging & Classification
                    </h3>
                    <p>All uploaded content must include:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li><strong>Product Categories:</strong> Clear product or service categorization</li>
                      <li><strong>Technical Tags:</strong> Relevant technical keywords and applications</li>
                      <li><strong>Industry Sectors:</strong> Applicable sectors (residential, commercial, industrial)</li>
                      <li><strong>Compliance Information:</strong> Relevant standards and regulatory requirements</li>
                      <li><strong>Geographic Scope:</strong> Australia, New Zealand, or both markets</li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* Content Attribution & Display */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  6. Content Attribution & Display
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      6.1 Attribution Standards
                    </h3>
                    <p>All partner content will be attributed with:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li><strong>Company Name:</strong> Full company name and branding</li>
                      <li><strong>Contact Information:</strong> Relevant contact details for further inquiry</li>
                      <li><strong>Content Type:</strong> Clear identification of content type and purpose</li>
                      <li><strong>Date Information:</strong> Upload date and last update information</li>
                      <li><strong>Compliance Disclaimers:</strong> Appropriate professional and legal disclaimers</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      6.2 AI Response Integration
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <p className="font-semibold mb-2">🤖 AI-Powered Attribution:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Partner content is integrated into AI responses with clear source attribution</li>
                        <li>Supplier-specific information is highlighted in AI responses</li>
                        <li>Users receive direct links to partner contact information</li>
                        <li>Partner content is prioritized for relevant technical queries</li>
                        <li>Analytics provided on content usage and user engagement</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      6.3 Quality Assurance & Reviews
                    </h3>
                    <p>Content undergoes:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li><strong>Technical Review:</strong> Verification of technical accuracy and completeness</li>
                      <li><strong>Compliance Check:</strong> Confirmation of copyright and IP compliance</li>
                      <li><strong>Standards Verification:</strong> Verification of Australian Standards references</li>
                      <li><strong>Professional Review:</strong> Assessment by qualified construction professionals</li>
                      <li><strong>Regular Updates:</strong> Periodic review for currency and accuracy</li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* Partner Responsibilities */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  7. Partner Responsibilities & Obligations
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      7.1 Content Accuracy & Updates
                    </h3>
                    <p>Partners are responsible for:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li><strong>Accuracy Warranty:</strong> Ensuring all technical information is accurate and current</li>
                      <li><strong>Regular Updates:</strong> Updating content when products, standards, or regulations change</li>
                      <li><strong>Error Correction:</strong> Promptly correcting any identified errors or inaccuracies</li>
                      <li><strong>Withdrawal Notice:</strong> Providing reasonable notice for content withdrawal or updates</li>
                      <li><strong>Version Management:</strong> Managing document versions and change control</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      7.2 Professional Standards
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                      <p className="font-semibold mb-2">🏗️ Professional Compliance:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><strong>Professional Standards:</strong> All content must meet professional industry standards</li>
                        <li><strong>Regulatory Compliance:</strong> Content must comply with all relevant Australian and New Zealand regulations</li>
                        <li><strong>Safety Requirements:</strong> Safety considerations must be prominently featured where applicable</li>
                        <li><strong>Environmental Standards:</strong> Environmental impacts and compliance must be addressed</li>
                        <li><strong>Accessibility:</strong> Content should consider accessibility and inclusion requirements</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      7.3 Communication & Support
                    </h3>
                    <p>Partners must provide:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li><strong>Technical Support:</strong> Reasonable technical support for content-related inquiries</li>
                      <li><strong>Contact Availability:</strong> Accessible contact information for professional inquiries</li>
                      <li><strong>Response Timeliness:</strong> Reasonable response times for technical questions</li>
                      <li><strong>Update Communications:</strong> Proactive communication about significant product or service changes</li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* Prohibited Content */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  8. Prohibited Content & Activities
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      8.1 Prohibited Content Types
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626' }}>
                      <p className="font-semibold mb-2" style={{ color: '#dc2626' }}>❌ Strictly Prohibited:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><strong>Copyrighted Material:</strong> Any content that infringes third-party copyrights</li>
                        <li><strong>Standards Reproduction:</strong> Direct reproduction of Australian Standards copyrighted content</li>
                        <li><strong>Misleading Information:</strong> Inaccurate, misleading, or deceptive technical information</li>
                        <li><strong>Non-Compliant Products:</strong> Products or services that don't meet Australian/NZ standards</li>
                        <li><strong>Competitive Disparagement:</strong> Unfair comparison or negative commentary about competitors</li>
                        <li><strong>Spam or Marketing:</strong> Pure promotional content without technical value</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      8.2 Quality Violations
                    </h3>
                    <p>Content will be rejected or removed for:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li><strong>Technical Inaccuracy:</strong> Factually incorrect or outdated technical information</li>
                      <li><strong>Poor Quality:</strong> Poorly written, unclear, or unprofessional content</li>
                      <li><strong>Incomplete Information:</strong> Insufficient detail for professional use</li>
                      <li><strong>Format Issues:</strong> Poor formatting, illegible text, or technical problems</li>
                      <li><strong>Irrelevant Content:</strong> Content not relevant to AU/NZ construction industry</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      8.3 Enforcement Actions
                    </h3>
                    <p>Violations may result in:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li>Content removal and notification</li>
                      <li>Requirement for content revision and resubmission</li>
                      <li>Temporary suspension of upload privileges</li>
                      <li>Permanent termination of partner status</li>
                      <li>Legal action for serious copyright or compliance violations</li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* Partner Benefits & Analytics */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  9. Partner Benefits & Analytics
                </h2>
                <div className="space-y-4 text-sm" style={{ color: '#4b6b8b' }}>
                  
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      9.1 Marketing Benefits
                    </h3>
                    <p>Partners receive:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li><strong>Brand Visibility:</strong> Logo and company information prominently displayed</li>
                      <li><strong>Content Attribution:</strong> Clear attribution in all AI responses using partner content</li>
                      <li><strong>Direct Contact Links:</strong> Direct links to partner contact information</li>
                      <li><strong>Industry Authority:</strong> Recognition as a technical knowledge leader</li>
                      <li><strong>SEO Benefits:</strong> Improved search visibility through content association</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      9.2 Usage Analytics
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <p className="font-semibold mb-2">📊 Partner Analytics Dashboard:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><strong>Content Views:</strong> Number of times content appears in AI responses</li>
                        <li><strong>User Engagement:</strong> User interaction with partner-attributed content</li>
                        <li><strong>Geographic Distribution:</strong> Regional distribution of content usage</li>
                        <li><strong>Professional Sectors:</strong> Which industry sectors are accessing partner content</li>
                        <li><strong>Trending Topics:</strong> Most popular partner content topics and themes</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#0f2f57' }}>
                      9.3 Partnership Development
                    </h3>
                    <p>Ongoing partnership support includes:</p>
                    <ul className="list-disc ml-6 space-y-1 mt-2">
                      <li><strong>Performance Reviews:</strong> Regular assessment of content performance and impact</li>
                      <li><strong>Content Strategy:</strong> Guidance on content development and optimization</li>
                      <li><strong>Industry Trends:</strong> Insights into construction industry knowledge needs</li>
                      <li><strong>Technical Support:</strong> Platform technical support and training</li>
                      <li><strong>Partnership Growth:</strong> Opportunities for expanded collaboration</li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* Contact & Support */}
              <section>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0f2f57' }}>
                  10. Contact & Partnership Support
                </h2>
                <div className="space-y-3 text-sm" style={{ color: '#4b6b8b' }}>
                  <p>
                    For partnership inquiries, content support, or policy questions:
                  </p>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <p><strong>Partnership Team:</strong> partnerships@onesource-ai.com</p>
                    <p><strong>Content Support:</strong> content@onesource-ai.com</p>
                    <p><strong>Technical Support:</strong> partners-tech@onesource-ai.com</p>
                    <p><strong>Legal & Compliance:</strong> legal@onesource-ai.com</p>
                    <p><strong>Phone:</strong> +61 2 1234 5678</p>
                    <p><strong>Address:</strong></p>
                    <p>ONESource-ai Partnership Team</p>
                    <p>Suite 123, Construction Hub</p>
                    <p>Sydney NSW 2000, Australia</p>
                  </div>
                  <p>
                    We aim to respond to all partnership inquiries within 48 hours.
                  </p>
                </div>
              </section>

              {/* Version Information */}
              <section className="border-t pt-6" style={{ borderColor: '#c9d6e4' }}>
                <div className="text-xs space-y-2" style={{ color: '#95a6b7' }}>
                  <p><strong>Partner Upload Policy Version:</strong> 1.0</p>
                  <p><strong>Last Updated:</strong> January 8, 2025</p>
                  <p><strong>Effective Date:</strong> January 8, 2025</p>
                  <p>
                    This policy is subject to updates based on regulatory changes, industry developments, and partnership program evolution. Partners will be notified of significant changes with reasonable advance notice.
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

export default PartnerUploadPolicy;