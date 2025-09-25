import React, { useState, useEffect } from 'react';
import './About.css';

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');
  const [animatedCounters, setAnimatedCounters] = useState({
    users: 0,
    businesses: 0,
    services: 0,
    satisfaction: 0
  });

  useEffect(() => {
    const animateCounters = () => {
      const targets = {
        users: 10000,
        businesses: 500,
        services: 50,
        satisfaction: 98
      };

      const duration = 2000;
      const increment = 50;

      const timer = setInterval(() => {
        setAnimatedCounters(prev => {
          const newCounters = { ...prev };
          let allComplete = true;

          Object.keys(targets).forEach(key => {
            if (newCounters[key] < targets[key]) {
              newCounters[key] = Math.min(newCounters[key] + increment, targets[key]);
              allComplete = false;
            }
          });

          if (allComplete) {
            clearInterval(timer);
          }

          return newCounters;
        });
      }, 50);

      return () => clearInterval(timer);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    });

    const statsSection = document.querySelector('.about-stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => observer.disconnect();
  }, []);

  const tabs = [
    { id: 'mission', label: 'Our Mission', icon: 'target' },
    { id: 'vision', label: 'Our Vision', icon: 'eye' },
    { id: 'values', label: 'Core Values', icon: 'shield' },
    { id: 'services', label: 'What We Offer', icon: 'briefcase' },
    { id: 'team', label: 'Our Team', icon: 'users' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mission':
        return (
          <div className="tab-content">
            <h3>Connecting Communities with Quality Services</h3>
            <p>AAA Services Directory is the premier platform of the Accredited Assistance Association, dedicated to bridging the gap between communities and trusted service providers. We believe that everyone deserves access to reliable, professional services that enhance their quality of life.</p>
            
            <div className="mission-highlights">
              <div className="highlight-item">
                <div className="highlight-icon">
                  <i className="fas fa-home"></i>
                </div>
                <h4>Home Services</h4>
                <p>From plumbing to electrical work, we connect you with certified professionals for all your home maintenance needs.</p>
              </div>
              <div className="highlight-item">
                <div className="highlight-icon">
                  <i className="fas fa-car"></i>
                </div>
                <h4>Automotive</h4>
                <p>Trusted mechanics and auto service providers to keep your vehicle running smoothly and safely.</p>
              </div>
              <div className="highlight-item">
                <div className="highlight-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
                <h4>Professional Services</h4>
                <p>Legal, financial, and consulting services from accredited professionals in your community.</p>
              </div>
            </div>
          </div>
        );
      
      case 'vision':
        return (
          <div className="tab-content">
            <h3>Building Trust Through Accreditation</h3>
            <p>Our vision is to create the most trusted and comprehensive service directory platform, where every business is verified, every review is authentic, and every connection leads to satisfaction.</p>
            
            <div className="vision-goals">
              <div className="goal-item">
                <h4>Digital Transformation</h4>
                <p>Modernizing how communities discover and connect with local service providers through innovative technology.</p>
              </div>
              <div className="goal-item">
                <h4>Quality Assurance</h4>
                <p>Implementing rigorous verification processes to ensure only the best businesses join our platform.</p>
              </div>
              <div className="goal-item">
                <h4>Community Growth</h4>
                <p>Supporting local economies by promoting small businesses and fostering community connections.</p>
              </div>
            </div>
          </div>
        );
      
      case 'values':
        return (
          <div className="tab-content">
            <h3>The Foundation of Our Success</h3>
            <p>Our core values guide every decision we make and every relationship we build within the AAA Services Directory community.</p>
            
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h4>Integrity</h4>
                <p>We maintain the highest ethical standards in all our business practices and partnerships.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <i className="fas fa-handshake"></i>
                </div>
                <h4>Trust</h4>
                <p>Building lasting relationships through transparency, reliability, and consistent quality.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <i className="fas fa-star"></i>
                </div>
                <h4>Excellence</h4>
                <p>Striving for the highest quality in every service, review, and user experience.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <h4>Innovation</h4>
                <p>Continuously improving our platform to better serve our community and partners.</p>
              </div>
            </div>
          </div>
        );
      
      case 'services':
        return (
          <div className="tab-content">
            <h3>Comprehensive Service Solutions</h3>
            <p>AAA Services Directory offers a wide range of services designed to meet the diverse needs of our community members and business partners.</p>
            
            <div className="services-overview">
              <div className="service-category">
                <h4>For Customers</h4>
                <ul>
                  <li>Easy service discovery and comparison</li>
                  <li>Verified business profiles and reviews</li>
                  <li>Secure messaging and booking system</li>
                  <li>24/7 customer support</li>
                </ul>
              </div>
              <div className="service-category">
                <h4>For Businesses</h4>
                <ul>
                  <li>Professional profile management</li>
                  <li>Lead generation and customer acquisition</li>
                  <li>Review and reputation management</li>
                  <li>Analytics and business insights</li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      case 'team':
        return (
          <div className="tab-content">
            <h3>Meet Our Dedicated Team</h3>
            <p>The AAA Services Directory is powered by a passionate team committed to excellence and community service.</p>
            
            <div className="team-members">
              <div className="team-member">
                <div className="member-avatar">
                  <i className="fas fa-user-tie"></i>
                </div>
                <h4>Leadership Team</h4>
                <p>Experienced professionals guiding our strategic vision and ensuring operational excellence.</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">
                  <i className="fas fa-laptop-code"></i>
                </div>
                <h4>Technology Team</h4>
                <p>Innovative developers and engineers building the most advanced service directory platform.</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">
                  <i className="fas fa-search"></i>
                </div>
                <h4>Quality Assurance</h4>
                <p>Dedicated professionals ensuring every business meets our high standards.</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">
                  <i className="fas fa-headset"></i>
                </div>
                <h4>Customer Support</h4>
                <p>Friendly and knowledgeable support specialists ready to help with any questions.</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderIcon = (iconName) => {
    const iconMap = {
      target: <i className="fas fa-bullseye"></i>,
      eye: <i className="fas fa-eye"></i>,
      shield: <i className="fas fa-shield-alt"></i>,
      briefcase: <i className="fas fa-briefcase"></i>,
      users: <i className="fas fa-users"></i>
    };
    return iconMap[iconName] || <i className="fas fa-circle"></i>;
  };

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="hero-banner">
          <div className="banner-content">
            <div className="banner-text">
              <h1>AAA Services Directory</h1>
              <p className="banner-subtitle">Accredited Assistance Association</p>
              <p className="banner-description">
                Connecting communities with trusted, verified service providers through our comprehensive directory platform.
                We're building bridges between quality businesses and satisfied customers.
              </p>
              <div className="banner-actions">
                <button className="banner-btn primary">Explore Services</button>
                <button className="banner-btn secondary">Learn More</button>
              </div>
            </div>
            <div className="banner-visual">
              <div className="banner-card card-1">
                <div className="card-icon">
                  <i className="fas fa-home"></i>
                </div>
                <p>Home Services</p>
              </div>
              <div className="banner-card card-2">
                <div className="card-icon">
                  <i className="fas fa-car"></i>
                </div>
                <p>Automotive</p>
              </div>
              <div className="banner-card card-3">
                <div className="card-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
                <p>Professional</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-stats-section">
        <div className="about-stats-container">
          <div className="about-stat-item">
            <div className="about-stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="about-stat-number">{animatedCounters.users.toLocaleString()}+</div>
            <div className="about-stat-label">Happy Customers</div>
          </div>
          <div className="about-stat-item">
            <div className="about-stat-icon">
              <i className="fas fa-building"></i>
            </div>
            <div className="about-stat-number">{animatedCounters.businesses}+</div>
            <div className="about-stat-label">Verified Businesses</div>
          </div>
          <div className="about-stat-item">
            <div className="about-stat-icon">
              <i className="fas fa-tools"></i>
            </div>
            <div className="about-stat-number">{animatedCounters.services}+</div>
            <div className="about-stat-label">Service Categories</div>
          </div>
          <div className="about-stat-item">
            <div className="about-stat-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="about-stat-number">{animatedCounters.satisfaction}%</div>
            <div className="about-stat-label">Customer Satisfaction</div>
          </div>
        </div>
      </section>

      <section className="about-tabs">
        <div className="tabs-container">
          <div className="tabs-header">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{renderIcon(tab.icon)}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="tab-content-container">
            {renderTabContent()}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of satisfied customers and businesses in our growing community.</p>
          <div className="cta-buttons">
            <button className="cta-button primary">
              <i className="fas fa-search"></i>
              Find Services
            </button>
            <button className="cta-button secondary">
              <i className="fas fa-plus"></i>
              List Your Business
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;