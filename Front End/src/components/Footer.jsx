import React from 'react';
import './Footer.css';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaYoutube,
  FaShieldAlt,
  FaUserCheck,
  FaHandshake,
  FaStar,
  FaHeart
} from 'react-icons/fa';

const Footer = () => {
  const location = useLocation();

  const footerLinkClassName = (to) => {
    const [targetPath, targetSearch = ''] = to.split('?');
    const targetCategory = new URLSearchParams(targetSearch).get('category');
    const currentCategory = new URLSearchParams(location.search).get('category');
    const pathMatches = targetPath === '/'
      ? location.pathname === '/' || location.pathname === '/home'
      : location.pathname === targetPath;
    const queryMatches = targetCategory ? targetCategory === currentCategory : !currentCategory;

    return pathMatches && queryMatches ? 'active' : undefined;
  };

  const FooterLink = ({ to, children }) => (
    <Link to={to} className={footerLinkClassName(to)}>{children}</Link>
  );

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-content">
          {/* Company Information */}
          <div className="footer-section company-info">
            <div className="footer-logo">
              <div className="logo-icon">
                <FaStar />
              </div>
              <div className="logo-text">
                <h3>AAA Services</h3>
                <span>Pakistan's Premier Service Directory</span>
              </div>
            </div>
            <p className="company-description">
              Connecting trusted service providers with customers across Pakistan. 
              Quality, reliability, and satisfaction guaranteed.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link twitter">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                <FaLinkedin />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link youtube">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><FooterLink to="/">Home</FooterLink></li>
              <li><FooterLink to="/services">Services</FooterLink></li>
              <li><FooterLink to="/about">About Us</FooterLink></li>
              <li><FooterLink to="/contact">Contact</FooterLink></li>
              <li><FooterLink to="/reviews">Customer Reviews</FooterLink></li>
              <li><FooterLink to="/complaint">File a Complaint</FooterLink></li>
            </ul>
          </div>

          {/* Service Categories */}
          <div className="footer-section">
            <h4>Service Categories</h4>
            <ul className="footer-links">
              <li><FooterLink to="/service-categories">All Service Categories</FooterLink></li>
              <li><FooterLink to="/services?category=plumbing">Plumbing Services</FooterLink></li>
              <li><FooterLink to="/services?category=electrical">Electrical Services</FooterLink></li>
              <li><FooterLink to="/services?category=cleaning">Cleaning Services</FooterLink></li>
              <li><FooterLink to="/services?category=repair">Home Repairs</FooterLink></li>
              <li><FooterLink to="/services?category=transport">Transportation</FooterLink></li>
            </ul>
          </div>

          {/* For Service Providers */}
          <div className="footer-section">
            <h4>For Service Providers</h4>
            <ul className="footer-links">
              <li><FooterLink to="/service-provider-signup">Join as Provider</FooterLink></li>
              <li><FooterLink to="/business/login">Provider Login</FooterLink></li>
              <li><FooterLink to="/business/dashboard">Provider Dashboard</FooterLink></li>
              <li><FooterLink to="/business/profile">Manage Profile</FooterLink></li>
              <li><FooterLink to="/business/inbox">Inbox & Inquiries</FooterLink></li>
              <li><FooterLink to="/pricing">Pricing Plans</FooterLink></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="footer-section">
            <h4>Support & Legal</h4>
            <ul className="footer-links">
              <li><FooterLink to="/help-center">Help Center</FooterLink></li>
              <li><FooterLink to="/faq">FAQ</FooterLink></li>
              <li><FooterLink to="/privacy-policy">Privacy Policy</FooterLink></li>
              <li><FooterLink to="/terms-conditions">Terms & Conditions</FooterLink></li>
              <li><FooterLink to="/refund">Refund Policy</FooterLink></li>
              <li><FooterLink to="/safety">Safety Guidelines</FooterLink></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="footer-section contact-info">
            <h4>Contact Us</h4>
            <div className="contact-details">
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <div>
                  <span className="contact-label">Address</span>
                  <span className="contact-value">Township, Lahore, Pakistan</span>
                </div>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <div>
                  <span className="contact-label">Phone</span>
                  <span className="contact-value">+92 308 6613608</span>
                </div>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <div>
                  <span className="contact-label">Email</span>
                  <span className="contact-value">info@aaaservices.pk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="newsletter-content">
          <div className="newsletter-text">
            <h4>Stay Updated</h4>
            <p>Subscribe to our newsletter for latest updates, offers, and service provider recommendations.</p>
          </div>
          <form className="newsletter-form">
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required 
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn">
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="footer-trust">
        <div className="trust-content">
          <div className="trust-item">
            <FaShieldAlt className="trust-icon" />
            <span>100% Verified Providers</span>
          </div>
          <div className="trust-item">
            <FaUserCheck className="trust-icon" />
            <span>Background Checked</span>
          </div>
          <div className="trust-item">
            <FaHandshake className="trust-icon" />
            <span>Trusted by 10K+ Customers</span>
          </div>
          <div className="trust-item">
            <FaStar className="trust-icon" />
            <span>4.8/5 Average Rating</span>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="footer-bottom-left">
            <p>&copy; {new Date().getFullYear()} AAA Services Directory. All rights reserved.</p>
            <p>Made with <FaHeart className="heart-icon" /> in Pakistan</p>
          </div>
          <div className="footer-bottom-right">
            <div className="footer-bottom-links">
              <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
              <span className="separator">|</span>
              <FooterLink to="/terms-conditions">Terms & Conditions</FooterLink>
              <span className="separator">|</span>
              <FooterLink to="/sitemap">Sitemap</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
