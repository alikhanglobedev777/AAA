import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './Auth.css';

function ForgotPassword({ userType = 'customer' }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [resetUrl, setResetUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');
    setResetUrl('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { 
        email, 
        userType 
      });
      
      if (response.data.message) {
        setMessage(response.data.message);
        setMessageType('success');
        
        // Show reset URL in development mode
        if (response.data.resetUrl) {
          setResetUrl(response.data.resetUrl);
        }
        
        // Show note if available
        if (response.data.note) {
          setMessage(prev => prev + ' ' + response.data.note);
        }
        
        toast.success('Password reset link sent!');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to send reset link';
      setMessage(errorMsg);
      setMessageType('error');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Try to navigate, and if it fails, use window.location as fallback
    try {
      navigate('/login');
    } catch (error) {
      window.location.href = '/login';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form forgot-password-form">
        <div className="auth-header">
          <Link 
            to={userType === 'business' ? '/business/login' : '/login'}
            className="back-button"
            style={{ textDecoration: 'none' }}
          >
            <FaArrowLeft />
            Back to {userType === 'business' ? 'Business Login' : 'Login'}
          </Link>
          <h2>{userType === 'business' ? 'Business Forgot Password' : 'Forgot Password'}</h2>
          <p>
            {userType === 'business' 
              ? 'Enter your business email address and we\'ll send you a link to reset your password.'
              : 'Enter your email address and we\'ll send you a link to reset your password.'
            }
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" />
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {message && (
            <div className={`message ${messageType}`}>
              {messageType === 'success' && <FaCheckCircle className="message-icon" />}
              {messageType === 'error' && <FaExclamationTriangle className="message-icon" />}
              <span>{message}</span>
            </div>
          )}

          {resetUrl && (
            <div className="reset-url-info">
              <p><strong>Development Mode:</strong> Click the link below to reset your password:</p>
              <a 
                href={resetUrl} 
                className="reset-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Reset Password
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="auth-footer">
            <p>Remember your password?</p>
            <Link to={userType === 'business' ? '/business/login' : '/login'} className="auth-link">
              Back to {userType === 'business' ? 'Business Login' : 'Login'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
