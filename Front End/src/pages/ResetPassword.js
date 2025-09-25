import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaLock, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  // Verify token on component mount
  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setTokenLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      await axios.get(`http://localhost:5000/api/auth/verify-reset-token/${token}`);
      setTokenValid(true);
    } catch (error) {
      setError('The password reset link is invalid or has expired.');
      setTokenValid(false);
    } finally {
      setTokenLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        password,
      });
      
      toast.success('Password has been reset successfully!');
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reset password';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleRequestNewLink = () => {
    navigate('/forgot-password');
  };

  if (tokenLoading) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <div className="loading-state">
            <h2>Verifying Reset Link</h2>
            <p>Please wait while we verify your password reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-form">
                  <div className="auth-header">
          <Link 
            to="/login"
            className="back-button"
            style={{ textDecoration: 'none' }}
          >
            <FaArrowLeft />
            Back to Login
          </Link>
          <h2>Invalid Reset Link</h2>
          <p>The password reset link is invalid or has expired.</p>
        </div>
          
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <span>{error || 'This reset link cannot be used.'}</span>
          </div>
          
          <button
            onClick={handleRequestNewLink}
            className="auth-button"
          >
            Request a New Reset Link
          </button>
          
          <div className="auth-footer">
            <Link to="/login" className="auth-link">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-form text-center">
          <div className="success-state">
            <FaCheckCircle className="success-icon" />
            <h2>Password Reset Successful!</h2>
            <p>Your password has been updated successfully. You will be redirected to the login page shortly.</p>
          </div>
          
          <div className="auth-footer">
            <p>Not redirected? <Link to="/login" className="auth-link">Click here to login</Link></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form reset-password-form">
        <div className="auth-header">
          <Link 
            to="/login"
            className="back-button"
            style={{ textDecoration: 'none' }}
          >
            <FaArrowLeft />
            Back to Login
          </Link>
          <h2>Reset Your Password</h2>
          <p>Please enter your new password below.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" />
              New Password
            </label>
            <div className="password-input-container">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="form-input password-input"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <small className="password-hint">Password must be at least 6 characters long</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password">
              <FaLock className="input-icon" />
              Confirm New Password
            </label>
            <div className="password-input-container">
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="form-input password-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <FaExclamationTriangle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          
          <div className="auth-footer">
            <Link to="/login" className="auth-link">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
