import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './AdminPasswordSetup.css';

const AdminPasswordSetup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [adminInfo, setAdminInfo] = useState(null);
  const [isValidating, setIsValidating] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setMessage({ type: 'error', text: 'No setup token provided' });
      setIsValidating(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/admin-users/validate-token/${token}`);
      const data = await response.json();

      if (response.ok) {
        setAdminInfo(data.adminUser);
        setMessage({ type: 'success', text: 'Token validated successfully' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Invalid or expired token' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const validateForm = () => {
    if (!formData.password) {
      setMessage({ type: 'error', text: 'Password is required' });
      return false;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:5000/api/admin/admin-users/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password set successfully! You can now log in to the admin panel.' });
        
        // Redirect to admin login after 3 seconds
        setTimeout(() => {
          navigate('/admin');
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to set password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="admin-password-setup">
        <div className="setup-container">
          <div className="setup-header">
            <div className="setup-icon">
              <FaLock />
            </div>
            <h1>Validating Setup Token</h1>
            <p>Please wait while we validate your setup token...</p>
          </div>
          <div className="setup-loading">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!adminInfo) {
    return (
      <div className="admin-password-setup">
        <div className="setup-container">
          <div className="setup-header">
            <div className="setup-icon error">
              <FaExclamationTriangle />
            </div>
            <h1>Setup Failed</h1>
            <p>{message.text}</p>
          </div>
          <div className="setup-actions">
            <button 
              onClick={() => navigate('/admin')}
              className="setup-btn primary"
            >
              Go to Admin Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-password-setup">
      <div className="setup-container">
        <div className="setup-header">
          <div className="setup-icon">
            <FaLock />
          </div>
          <h1>Set Your Admin Password</h1>
          <p>Welcome, {adminInfo.fullName}! Please set a secure password for your admin account.</p>
        </div>

        {message.text && (
          <div className={`setup-message ${message.type}`}>
            {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <small className="form-help">Password must be at least 6 characters long</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className="setup-btn primary"
            >
              {isSubmitting ? 'Setting Password...' : 'Set Password'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="setup-btn secondary"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="setup-footer">
          <p>This setup link will expire in 24 hours for security reasons.</p>
          <p>If you have any issues, please contact the system administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPasswordSetup;
