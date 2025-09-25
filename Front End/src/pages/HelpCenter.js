import React, { useState } from 'react';
import './HelpCenter.css';

const HelpCenter = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/help-center/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          category: 'general'
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const helpCategories = [
    {
      id: 'general',
      title: 'General Support',
      icon: 'fa-question-circle',
      description: 'General questions about our platform and services'
    },
    {
      id: 'technical',
      title: 'Technical Issues',
      icon: 'fa-cog',
      description: 'Website, app, or technical problems'
    },
    {
      id: 'account',
      title: 'Account Issues',
      icon: 'fa-user',
      description: 'Login, password, and account management'
    },
    {
      id: 'service',
      title: 'Service Issues',
      icon: 'fa-tools',
      description: 'Problems with service providers or bookings'
    },
    {
      id: 'business',
      title: 'Business Support',
      icon: 'fa-building',
      description: 'Help for service providers and businesses'
    }
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking the "Forgot Password" link on the login page. We\'ll send you an email with a secure link to create a new password.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and digital wallets including Visa, MasterCard, American Express, PayPal, and Apple Pay.'
    },
    {
      question: 'How do I cancel a service appointment?',
      answer: 'You can cancel appointments through your dashboard or by contacting our support team. Most providers allow cancellations up to 24 hours before the appointment.'
    },
    {
      question: 'How do I report a problem with a service?',
      answer: 'If you experience issues with a service, please contact our support team within 48 hours. We\'ll work with the service provider to resolve the issue.'
    },
    {
      question: 'How do I become a service provider?',
      answer: 'To become a service provider, click "List Your Business" and complete the registration process. We\'ll review your application within 2-3 business days.'
    }
  ];

  return (
    <div className="help-center-page">
      <section className="help-hero">
        <div className="help-hero-content">
          <h1>Help Center</h1>
          <p>We're here to help you get the most out of AAA Services Directory</p>
        </div>
      </section>

      <section className="help-content">
        <div className="help-container">
          <div className="help-grid">
            <div className="help-categories-section">
              <h2>How can we help you?</h2>
              <p>Choose a category below to find the right support option</p>
              
              <div className="help-categories">
                {helpCategories.map(category => (
                  <div key={category.id} className="help-category-card">
                    <div className="category-icon">
                      <i className={`fas ${category.icon}`}></i>
                    </div>
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="contact-form-section">
              <div className="contact-form-container">
                <h2>Contact Our Support Team</h2>
                <p>Can't find what you're looking for? Send us a message and we'll get back to you within a few hours.</p>
                
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="category">Category *</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        {helpCategories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="subject">Subject *</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Brief description of your issue"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      placeholder="Please describe your issue or question in detail..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send Message
                      </>
                    )}
                  </button>

                  {submitStatus === 'success' && (
                    <div className="success-message">
                      <i className="fas fa-check-circle"></i>
                      <p>Thank you! Your message has been sent successfully. We'll get back to you within a few hours.</p>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      <p>Sorry, there was an error sending your message. Please try again or contact us directly.</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions</p>
            
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-info-section">
            <h2>Other Ways to Reach Us</h2>
            <div className="contact-methods">
              <div className="contact-method">
                <div className="method-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <div className="method-content">
                  <h3>Phone Support</h3>
                  <p>1-800-AAA-HELP</p>
                  <span>Available 24/7</span>
                </div>
              </div>
              
              <div className="contact-method">
                <div className="method-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="method-content">
                  <h3>Email Support</h3>
                  <p>support@aaaservices.com</p>
                  <span>Response within 2 hours</span>
                </div>
              </div>
              
              <div className="contact-method">
                <div className="method-icon">
                  <i className="fas fa-comments"></i>
                </div>
                <div className="method-content">
                  <h3>Live Chat</h3>
                  <p>Available on website</p>
                  <span>Instant support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
