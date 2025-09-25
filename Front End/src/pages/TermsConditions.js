import React from 'react';
import './TermsConditions.css';

const TermsConditions = () => {
  return (
    <div className="terms-page">
      <section className="terms-hero">
        <div className="terms-hero-content">
          <h1>Terms & Conditions</h1>
          <p>Please read these terms carefully before using AAA Services Directory</p>
          <div className="last-updated">
            <i className="fas fa-calendar-alt"></i>
            <span>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </section>

      <section className="terms-content">
        <div className="terms-container">
          <div className="terms-navigation">
            <h3>Quick Navigation</h3>
            <ul>
              <li><a href="#acceptance">Acceptance of Terms</a></li>
              <li><a href="#services">Services Description</a></li>
              <li><a href="#user-accounts">User Accounts</a></li>
              <li><a href="#business-listings">Business Listings</a></li>
              <li><a href="#user-conduct">User Conduct</a></li>
              <li><a href="#intellectual-property">Intellectual Property</a></li>
              <li><a href="#privacy">Privacy & Data</a></li>
              <li><a href="#disclaimers">Disclaimers</a></li>
              <li><a href="#limitation-liability">Limitation of Liability</a></li>
              <li><a href="#termination">Termination</a></li>
              <li><a href="#governing-law">Governing Law</a></li>
              <li><a href="#changes">Changes to Terms</a></li>
              <li><a href="#contact">Contact Information</a></li>
            </ul>
          </div>

          <div className="terms-main-content">
            <div id="acceptance" className="terms-section">
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing and using AAA Services Directory ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
              <p>These Terms & Conditions ("Terms") govern your use of our website and services. By using our Platform, you agree to these Terms in full.</p>
            </div>

            <div id="services" className="terms-section">
              <h2>2. Services Description</h2>
              <p>AAA Services Directory is a platform that connects customers with verified service providers. Our services include:</p>
              <ul>
                <li>Business directory listings</li>
                <li>Service provider verification and reviews</li>
                <li>Customer inquiry and booking facilitation</li>
                <li>Communication tools between customers and service providers</li>
                <li>Review and rating systems</li>
              </ul>
              <p>We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.</p>
            </div>

            <div id="user-accounts" className="terms-section">
              <h2>3. User Accounts</h2>
              <p>To access certain features of our Platform, you may be required to create an account. You are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Updating your information as necessary</li>
              </ul>
              <p>You must be at least 18 years old to create an account. You may not create an account on behalf of another person or entity.</p>
            </div>

            <div id="business-listings" className="terms-section">
              <h2>4. Business Listings</h2>
              <p>Service providers who list their businesses on our Platform must:</p>
              <ul>
                <li>Provide accurate and truthful information</li>
                <li>Maintain current business licenses and insurance</li>
                <li>Respond to customer inquiries promptly</li>
                <li>Maintain professional standards of service</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
              <p>We reserve the right to remove or suspend business listings that violate these terms or our community guidelines.</p>
            </div>

            <div id="user-conduct" className="terms-section">
              <h2>5. User Conduct</h2>
              <p>When using our Platform, you agree not to:</p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Post false, misleading, or fraudulent information</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated tools to scrape or collect data</li>
                <li>Interfere with the proper functioning of the Platform</li>
              </ul>
            </div>

            <div id="intellectual-property" className="terms-section">
              <h2>6. Intellectual Property</h2>
              <p>The Platform and its original content, features, and functionality are owned by AAA Services Directory and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
              <p>You may not:</p>
              <ul>
                <li>Copy, modify, or distribute our content without permission</li>
                <li>Use our trademarks or service marks without authorization</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Remove or alter any copyright notices</li>
              </ul>
            </div>

            <div id="privacy" className="terms-section">
              <h2>7. Privacy & Data</h2>
              <p>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>
              <p>By using our Platform, you consent to the collection and use of your information as described in our Privacy Policy.</p>
            </div>

            <div id="disclaimers" className="terms-section">
              <h2>8. Disclaimers</h2>
              <p>THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</p>
              <p>We do not guarantee:</p>
              <ul>
                <li>The accuracy or completeness of business listings</li>
                <li>The quality of services provided by listed businesses</li>
                <li>Uninterrupted or error-free service</li>
                <li>The security of information transmitted through our Platform</li>
              </ul>
            </div>

            <div id="limitation-liability" className="terms-section">
              <h2>9. Limitation of Liability</h2>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, AAA SERVICES DIRECTORY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.</p>
              <p>Our total liability to you for any claims arising from these Terms or your use of the Platform shall not exceed the amount you paid us, if any, in the twelve months preceding the claim.</p>
            </div>

            <div id="termination" className="terms-section">
              <h2>10. Termination</h2>
              <p>We may terminate or suspend your account and access to the Platform at any time, with or without cause, with or without notice.</p>
              <p>You may terminate your account at any time by contacting our support team. Upon termination:</p>
              <ul>
                <li>Your right to use the Platform will cease immediately</li>
                <li>We may delete your account and data</li>
                <li>Provisions of these Terms that should survive termination will remain in effect</li>
              </ul>
            </div>

            <div id="governing-law" className="terms-section">
              <h2>11. Governing Law</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which AAA Services Directory operates, without regard to its conflict of law provisions.</p>
              <p>Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration or in the courts of our jurisdiction.</p>
            </div>

            <div id="changes" className="terms-section">
              <h2>12. Changes to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. We will notify users of any material changes by:</p>
              <ul>
                <li>Posting the updated Terms on our Platform</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying prominent notices on our website</li>
              </ul>
              <p>Your continued use of the Platform after changes become effective constitutes acceptance of the new Terms.</p>
            </div>

            <div id="contact" className="terms-section">
              <h2>13. Contact Information</h2>
              <p>If you have any questions about these Terms & Conditions, please contact us:</p>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <span>Email: legal@aaaservices.com</span>
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
            </div>

            <div className="terms-footer">
              <p><strong>Thank you for using AAA Services Directory!</strong></p>
              <p>By using our Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsConditions;
