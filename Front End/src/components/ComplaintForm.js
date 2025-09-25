import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaCheckCircle, FaTimes, FaSpinner, FaRegUser } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import './ComplaintForm.css';

const ComplaintForm = ({ 
  isOpen, 
  onClose, 
  businessId, 
  businessName, 
  serviceType,
  userToken 
}) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  
  console.log('🔍 ComplaintForm: Auth context data:', {
    isAuthenticated,
    user: user ? { id: user.id, email: user.email, name: user.firstName || user.displayName } : null
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceCategory: '',
    severity: 'medium',
    userEmail: user?.email || '',
    contactInfo: {
      phone: '',
      preferredContactMethod: 'email'
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Auto-detect service category when business changes
  useEffect(() => {
    console.log('🔍 ComplaintForm: serviceType received:', serviceType);
    if (serviceType) {
      console.log('🔍 ComplaintForm: Setting service category to:', serviceType);
      setFormData(prev => ({
        ...prev,
        serviceCategory: serviceType
      }));
    }
  }, [serviceType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setMessage('Please log in to file a complaint');
      setMessageType('error');
      return;
    }

    if (!userToken) {
      setMessage('Please log in to file a complaint');
      setMessageType('error');
      return;
    }

    // Validate required fields
    if (!formData.title.trim() || !formData.description.trim() || !formData.serviceCategory) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const complaintData = {
        businessId,
        title: formData.title,
        description: formData.description,
        serviceCategory: formData.serviceCategory,
        severity: formData.severity,
        contactInfo: {
          phone: formData.contactInfo.phone,
          preferredContactMethod: formData.contactInfo.preferredContactMethod
        },
        // Use the email from the form or fallback to user's email
        userEmail: formData.userEmail || user?.email || ''
      };

      console.log('🔍 ComplaintForm: Submitting complaint with data:', complaintData);
      console.log('🔍 ComplaintForm: User email from context:', user?.email);

      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(complaintData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          serviceCategory: serviceType || '',
          severity: 'medium',
          userEmail: user?.email || '',
          contactInfo: {
            phone: '',
            preferredContactMethod: 'email'
          }
        });
        
        // Close form after successful submission
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setMessage(data.message || 'Failed to submit complaint');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage('');
      setMessageType('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="complaint-modal-overlay">
      <div className="complaint-modal">
        <div className="complaint-modal-header">
          <h2>File a Complaint for {businessName}</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <FaTimes />
          </button>
        </div>

        <div className="complaint-modal-content">
          {!isAuthenticated ? (
            <div className="auth-required-message">
              <div className="auth-icon">
                <FaRegUser />
              </div>
              <p>You need to be logged in to file a complaint</p>
              <div className="auth-actions">
                <Link to="/login" className="btn-primary">Log In</Link>
                <Link to="/signup" className="btn-secondary">Sign Up</Link>
              </div>
            </div>
          ) : (
            <>
              {businessName && (
                <div className="business-info">
                  <h3>Complaint against: {businessName}</h3>
                  {serviceType && <p>Service: {serviceType}</p>}
                </div>
              )}
              
              {message && (
                <div className={`message ${messageType}`}>
                  {messageType === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Complaint Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Brief description of the issue"
                    required
                    maxLength={200}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="serviceCategory">Service Category *</label>
                  <select
                    id="serviceCategory"
                    name="serviceCategory"
                    value={formData.serviceCategory}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="painting">Painting</option>
                    <option value="gardening">Gardening</option>
                    <option value="repair">Repair</option>
                    <option value="transport">Transport</option>
                    <option value="security">Security</option>
                    <option value="education">Education</option>
                    <option value="food">Food</option>
                    <option value="beauty">Beauty</option>
                    <option value="health">Health</option>
                    <option value="construction">Construction</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="severity">Severity Level</label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                  >
                    <option value="low">Low - Minor inconvenience</option>
                    <option value="medium">Medium - Moderate issue</option>
                    <option value="high">High - Significant problem</option>
                    <option value="critical">Critical - Urgent safety concern</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Detailed Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Please provide detailed information about the issue, including when it occurred, what happened, and any relevant details..."
                    required
                    rows={6}
                    maxLength={2000}
                  />
                  <small className="char-count">
                    {formData.description.length}/2000 characters
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleInputChange}
                    placeholder="Your phone number for additional contact"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="userEmail">Email Address *</label>
                  <input
                    type="email"
                    id="userEmail"
                    name="userEmail"
                    value={formData.userEmail || user?.email || ''}
                    onChange={handleInputChange}
                    placeholder="Your email address for complaint updates"
                    required
                  />
                  <small>This email will be used to send you updates about your complaint</small>
                </div>

                <div className="form-group">
                  <label htmlFor="preferredContactMethod">Preferred Contact Method</label>
                  <select
                    id="preferredContactMethod"
                    name="contactInfo.preferredContactMethod"
                    value={formData.contactInfo.preferredContactMethod}
                    onChange={handleInputChange}
                  >
                    <option value="email">Email (Default)</option>
                    <option value="phone">Phone</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="spinner" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Complaint'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
