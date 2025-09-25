import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaUser, FaBuilding } from 'react-icons/fa';
import './Login.css';

function ClientLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        if (result.userType === 'business') {
          setError('You have a business account. Please login through the business login portal.');
        } else {
          setError(result.message || 'Invalid email or password');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your AAA Services account</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
            {error.includes('business account') && (
              <div className="redirect-action">
                <Link to="/business/login" className="redirect-btn">
                  Go to Business Login
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your email address"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your password"
              minLength="6"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" name="remember" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <div className="login-footer">
          <p className="signup-link">
            Don't have an account? <Link to="/signup" className="signup-link-text">Sign Up</Link>
          </p>
          
          <div className="switch-login-options">
            <Link to="/business/login" className="switch-login-btn business">
              <FaBuilding className="switch-icon" />
              Login as Business
            </Link>
            <Link to="/service-provider-signup" className="switch-login-btn provider">
              <FaUser className="switch-icon" />
              Become a Service Provider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientLogin;