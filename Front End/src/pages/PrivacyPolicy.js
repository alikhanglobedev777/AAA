import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-page">
      <section className="privacy-hero">
        <div className="privacy-hero-content">
          <h1>Privacy Policy</h1>
          <p>How we collect, use, and protect your personal information</p>
          <div className="last-updated">
            <i className="fas fa-calendar-alt"></i>
            <span>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </section>

      <section className="privacy-content">
        <div className="privacy-container">
          <div className="privacy-navigation">
            <h3>Quick Navigation</h3>
            <ul>
              <li><a href="#introduction">Introduction</a></li>
              <li><a href="#information-collection">Information We Collect</a></li>
              <li><a href="#how-we-use">How We Use Information</a></li>
              <li><a href="#information-sharing">Information Sharing</a></li>
              <li><a href="#data-security">Data Security</a></li>
              <li><a href="#cookies-tracking">Cookies & Tracking</a></li>
              <li><a href="#third-party-services">Third-Party Services</a></li>
              <li><a href="#data-retention">Data Retention</a></li>
              <li><a href="#your-rights">Your Rights</a></li>
              <li><a href="#children-privacy">Children's Privacy</a></li>
              <li><a href="#international-transfers">International Transfers</a></li>
              <li><a href="#changes-updates">Changes & Updates</a></li>
              <li><a href="#contact-us">Contact Us</a></li>
            </ul>
          </div>

          <div className="privacy-main-content">
            <div id="introduction" className="privacy-section">
              <h2>1. Introduction</h2>
              <p>AAA Services Directory ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.</p>
              <p>By using AAA Services Directory, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our services.</p>
              <p>This policy applies to information we collect on our website, mobile applications, and through other means such as email, phone, or in-person interactions.</p>
            </div>

            <div id="information-collection" className="privacy-section">
              <h2>2. Information We Collect</h2>
              <h3>Personal Information</h3>
              <p>We may collect the following types of personal information:</p>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, phone number, and password when you create an account</li>
                <li><strong>Profile Information:</strong> Business details, service categories, location, and contact information</li>
                <li><strong>Communication Data:</strong> Messages, inquiries, and feedback you send through our platform</li>
                <li><strong>Usage Information:</strong> How you interact with our website and services</li>
              </ul>
              
              <h3>Automatically Collected Information</h3>
              <p>We automatically collect certain information when you visit our platform:</p>
              <ul>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent on pages, and navigation patterns</li>
                <li><strong>Location Data:</strong> General location information based on your IP address</li>
                <li><strong>Cookies:</strong> Small data files stored on your device to enhance your experience</li>
              </ul>
            </div>

            <div id="how-we-use" className="privacy-section">
              <h2>3. How We Use Information</h2>
              <p>We use the collected information for the following purposes:</p>
              <ul>
                <li><strong>Service Provision:</strong> To provide, maintain, and improve our services</li>
                <li><strong>User Management:</strong> To create and manage user accounts and profiles</li>
                <li><strong>Communication:</strong> To respond to inquiries, send notifications, and provide customer support</li>
                <li><strong>Business Operations:</strong> To process business listings, verify service providers, and manage reviews</li>
                <li><strong>Security:</strong> To protect against fraud, abuse, and unauthorized access</li>
                <li><strong>Analytics:</strong> To analyze usage patterns and improve user experience</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </div>

            <div id="information-sharing" className="privacy-section">
              <h2>4. Information Sharing</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. However, we may share information in the following circumstances:</p>
              
              <h3>With Your Consent</h3>
              <p>We may share your information when you explicitly consent to such sharing.</p>
              
              <h3>Service Providers</h3>
              <p>We may share information with trusted third-party service providers who assist us in operating our platform, such as:</p>
              <ul>
                <li>Email service providers</li>
                <li>Cloud hosting services</li>
                <li>Analytics and monitoring tools</li>
                <li>Customer support platforms</li>
              </ul>
              
              <h3>Legal Requirements</h3>
              <p>We may disclose information when required by law, court order, or government request.</p>
              
              <h3>Business Transfers</h3>
              <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</p>
            </div>

            <div id="data-security" className="privacy-section">
              <h2>5. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
              <p>Our security measures include:</p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
              <p>However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your information.</p>
            </div>

            <div id="cookies-tracking" className="privacy-section">
              <h2>6. Cookies & Tracking Technologies</h2>
              <p>We use cookies and similar tracking technologies to enhance your experience on our platform.</p>
              
              <h3>Types of Cookies We Use</h3>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our platform</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Used for targeted advertising and analytics</li>
              </ul>
              
              <h3>Managing Cookies</h3>
              <p>You can control and manage cookies through your browser settings. However, disabling certain cookies may affect platform functionality.</p>
            </div>

            <div id="third-party-services" className="privacy-section">
              <h2>7. Third-Party Services</h2>
              <p>Our platform may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these external services.</p>
              <p>When you use third-party services through our platform, their privacy policies will govern how they handle your information.</p>
              <p>We recommend reviewing the privacy policies of any third-party services you use.</p>
            </div>

            <div id="data-retention" className="privacy-section">
              <h2>8. Data Retention</h2>
              <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law.</p>
              <p>We may retain certain information for:</p>
              <ul>
                <li>Account management and service provision</li>
                <li>Legal compliance and record-keeping</li>
                <li>Dispute resolution and enforcement</li>
                <li>Analytics and service improvement</li>
              </ul>
              <p>When we no longer need your information, we will securely delete or anonymize it.</p>
            </div>

            <div id="your-rights" className="privacy-section">
              <h2>9. Your Rights</h2>
              <p>Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul>
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
              </ul>
              <p>To exercise these rights, please contact us using the information provided below.</p>
            </div>

            <div id="children-privacy" className="privacy-section">
              <h2>10. Children's Privacy</h2>
              <p>Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
              <p>If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. We will take steps to remove such information from our records.</p>
            </div>

            <div id="international-transfers" className="privacy-section">
              <h2>11. International Data Transfers</h2>
              <p>Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws.</p>
              <p>When we transfer data internationally, we implement appropriate safeguards such as:</p>
              <ul>
                <li>Standard contractual clauses</li>
                <li>Adequacy decisions</li>
                <li>Other appropriate safeguards</li>
              </ul>
            </div>

            <div id="changes-updates" className="privacy-section">
              <h2>12. Changes to This Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws.</p>
              <p>We will notify you of any material changes by:</p>
              <ul>
                <li>Posting the updated policy on our platform</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying prominent notices on our website</li>
              </ul>
              <p>Your continued use of our services after changes become effective constitutes acceptance of the updated policy.</p>
            </div>

            <div id="contact-us" className="privacy-section">
              <h2>13. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <span>Email: privacy@aaaservices.com</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <span>Phone: 1-800-AAA-HELP</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Address: [Your Business Address]</span>
                </div>
              </div>
              <p>We will respond to your inquiry within a reasonable timeframe.</p>
            </div>

            <div className="privacy-footer">
              <p><strong>Thank you for trusting AAA Services Directory with your information!</strong></p>
              <p>We are committed to protecting your privacy and will continue to improve our data protection practices.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
