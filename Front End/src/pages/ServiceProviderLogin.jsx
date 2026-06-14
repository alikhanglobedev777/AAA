import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBuilding, FaUser } from 'react-icons/fa';
import './Login.css';

const ServiceProviderLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginStep, setLoginStep] = useState('idle'); // idle, authenticating, success, error
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && userType === 'business') {
      // Only redirect if we're not already on the dashboard
      if (window.location.pathname !== '/business-dashboard') {
        navigate('/business-dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, userType, navigate]);

  // Prevent redirect to non-existent routes
  useEffect(() => {
    // If somehow we end up on /business/login, redirect to service-provider/login
    if (window.location.pathname === '/business/login') {
      navigate('/service-provider/login', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    
    // Reset login step when user starts typing
    if (loginStep !== 'idle') {
      setLoginStep('idle');
    }
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setLoginStep('authenticating');
    setError('');
    
    try {
      // Use the business-specific login endpoint with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('http://localhost:5000/api/auth/business/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        // Business login successful
        setLoginStep('success');
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Navigate immediately after successful login
        console.log('Login successful, navigating to dashboard...');
        
        // Force redirect to dashboard
        setTimeout(() => {
          window.location.href = '/business-dashboard';
        }, 100);
      } else {
        // Login failed
        setLoginStep('error');
        
        if (data.userType === 'customer') {
          setError('You have a customer account. Please login through the customer login portal.');
        } else {
          setError(data.error || 'Business login failed. Please check your credentials and try again.');
        }
      }
    } catch (error) {
      console.error('Business login error:', error);
      setLoginStep('error');
      
      if (error.name === 'AbortError') {
        setError('Login request timed out. Please check your connection and try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };



  const getButtonContent = () => {
    switch (loginStep) {
      case 'authenticating':
        return (
          <>
            <div className="loading-spinner"></div>
            <span>Signing In...</span>
          </>
        );
      case 'success':
        return (
          <>
            <span className="success-icon">✓</span>
            <span>Welcome Back!</span>
          </>
        );
      case 'error':
        return 'Try Again';
      default:
        return 'Login to Business Account';
    }
  };

  const getButtonClass = () => {
    const baseClass = 'login-button';
    switch (loginStep) {
      case 'authenticating':
        return `${baseClass} authenticating`;
      case 'success':
        return `${baseClass} success`;
      case 'error':
        return `${baseClass} error`;
      default:
        return baseClass;
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Business Login</h2>
          <p>Welcome back! Access your business dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className={`error-message ${loginStep === 'error' ? 'shake' : ''}`}>
              {error}
              {error.includes('customer account') && (
                <div className="redirect-action">
                  <Link to="/login" className="redirect-btn">
                    Go to Customer Login
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your business email"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your password"
                minLength="6"
                autoComplete="current-password"
                disabled={isLoading}
              />
                              <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span className="checkmark"></span>
              Remember me
            </label>
            <Link to="/business/forgot-password" className="forgot-password-link">Forgot Password?</Link>
          </div>

          <button 
            type="submit" 
            className={getButtonClass()}
            disabled={isLoading}
          >
            {getButtonContent()}
          </button>



          <div className="login-footer">
            <div className="signup-link">
              <span>Don't have a business account? </span>
              <Link to="/service-provider-signup" className="signup-link-text">Register Your Business</Link>
            </div>

            <div className="switch-login-options">
              <Link to="/login" className="switch-login-btn business">
                <FaUser className="switch-icon" />
                Login as Client
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceProviderLogin;
