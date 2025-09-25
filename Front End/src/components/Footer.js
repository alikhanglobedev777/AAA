import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
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
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/reviews">Customer Reviews</Link></li>
              <li><Link to="/complaint">File a Complaint</Link></li>
            </ul>
          </div>

          {/* Service Categories */}
          <div className="footer-section">
            <h4>Service Categories</h4>
            <ul className="footer-links">
              <li><Link to="/service-categories">All Service Categories</Link></li>
              <li><Link to="/services?category=plumbing">Plumbing Services</Link></li>
              <li><Link to="/services?category=electrical">Electrical Services</Link></li>
              <li><Link to="/services?category=cleaning">Cleaning Services</Link></li>
              <li><Link to="/services?category=repair">Home Repairs</Link></li>
              <li><Link to="/services?category=transport">Transportation</Link></li>
            </ul>
          </div>

          {/* For Service Providers */}
          <div className="footer-section">
            <h4>For Service Providers</h4>
            <ul className="footer-links">
              <li><Link to="/service-provider-signup">Join as Provider</Link></li>
              <li><Link to="/business/login">Provider Login</Link></li>
              <li><Link to="/business/dashboard">Provider Dashboard</Link></li>
              <li><Link to="/business/profile">Manage Profile</Link></li>
              <li><Link to="/business/inbox">Inbox & Inquiries</Link></li>
              <li><Link to="/pricing">Pricing Plans</Link></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="footer-section">
            <h4>Support & Legal</h4>
            <ul className="footer-links">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/refund">Refund Policy</Link></li>
              <li><Link to="/safety">Safety Guidelines</Link></li>
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
              <Link to="/privacy">Privacy Policy</Link>
              <span className="separator">|</span>
              <Link to="/terms">Terms & Conditions</Link>
              <span className="separator">|</span>
              <Link to="/sitemap">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;