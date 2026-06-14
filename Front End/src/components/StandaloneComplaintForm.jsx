import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaCheckCircle, FaSpinner, FaRegUser } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import './ComplaintForm.css';

const StandaloneComplaintForm = ({ 
  businessId, 
  businessName, 
  serviceType,
  userToken,
  onSuccess,
  onCancel
}) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  
  console.log('🔍 StandaloneComplaintForm: Auth context data:', {
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
    console.log('🔍 StandaloneComplaintForm: serviceType received:', serviceType);
    if (serviceType) {
      console.log('🔍 StandaloneComplaintForm: Setting service category to:', serviceType);
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

      console.log('🔍 Submitting complaint with data:', complaintData);

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
        setMessage(data.message || 'Complaint submitted successfully!');
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
        
        // Call onSuccess callback
        if (onSuccess) {
          onSuccess(data.message || 'Complaint submitted successfully!');
        }
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="complaint-form-container">
      <h2>Submit Your Complaint</h2>
      
      {/* Business Info */}
      {businessName && (
        <div className="business-info">
          <h3>Complaint against: {businessName}</h3>
          {serviceType && <p>Service Type: {serviceType}</p>}
        </div>
      )}

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
          {/* Message Display */}
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
                maxLength={200}
                required
              />
              <div className="char-count">{formData.title.length}/200</div>
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
                <option value="">Select a service category</option>
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
                <option value="critical">Critical - Urgent issue</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Detailed Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please provide a detailed description of the issue, including what happened, when it occurred, and any other relevant details."
                maxLength={2000}
                required
              />
              <div className="char-count">{formData.description.length}/2000</div>
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
              <label htmlFor="phone">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleInputChange}
                placeholder="Your phone number for follow-up"
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredContactMethod">Preferred Contact Method</label>
              <select
                id="preferredContactMethod"
                name="contactInfo.preferredContactMethod"
                value={formData.contactInfo.preferredContactMethod}
                onChange={handleInputChange}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
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
  );
};

export default StandaloneComplaintForm;
