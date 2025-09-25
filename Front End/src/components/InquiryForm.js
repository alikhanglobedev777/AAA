import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './InquiryForm.css';

const InquiryForm = ({ serviceProviderId, serviceId, serviceName, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: currentUser.phoneNumber || ''
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Please enter your message');
      return false;
    }
    return true;
  };

  const sendEmailNotification = async (inquiryData) => {
    try {
      const response = await fetch('http://localhost:5000/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: serviceProviderId,
          customerName: inquiryData.userName,
          customerEmail: inquiryData.userEmail,
          customerPhone: inquiryData.userPhone,
          message: inquiryData.message,
          serviceType: serviceName
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send inquiry');
      }

      console.log('Email notification sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const newInquiry = {
        id: Date.now().toString(),
        serviceProviderId,
        serviceId,
        serviceName,
        userId: currentUser?.uid || 'guest_' + Date.now(),
        userName: formData.name.trim(),
        userEmail: formData.email.trim(),
        userPhone: formData.phone.trim() || 'Not provided',
        message: formData.message.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        isRead: false,
        isGuest: !currentUser
      };

      // Save to localStorage
      const existingInquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
      localStorage.setItem('inquiries', JSON.stringify([...existingInquiries, newInquiry]));
      
      // Send email notification (simulated)
      await sendEmailNotification(newInquiry);
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError('Failed to send inquiry. Please try again.');
      console.error('Error submitting inquiry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="inquiry-form-container">
      <div>
        <button 
          className="close-button" 
          onClick={onClose}
          aria-label="Close inquiry form"
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '2rem',
            color: '#228B22',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s ease'
          }}
        >
          &times;
        </button>
        
        <h2>Send Inquiry</h2>
        <p className="inquiry-form-subtitle">Ask a question about {serviceName || 'this service'}</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="inquiry-form">
          <div className="form-group">
            <label htmlFor="name">Your Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number (optional)"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Your Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              required
              placeholder={`I'm interested in ${serviceName || 'this service'}. Please provide more details.`}
            />
          </div>
          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !formData.message.trim() || !formData.name.trim() || !formData.email.trim()}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Sending...' : 'Send Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InquiryForm;
