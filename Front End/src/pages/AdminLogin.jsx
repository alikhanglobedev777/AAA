import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container aa-admin-login-v2"><aside className="aa-admin-login-aside"><div className="aa-admin-login-aside-brand"><span>A</span> AAA Services</div><div><span className="aa-admin-login-kicker">AAA ADMINISTRATION</span><h2>Manage everything from one place.</h2><p>A dedicated workspace for directory management, business verification and account administration.</p><div className="aa-admin-login-aside-points"><span>01 &nbsp; Business listings</span><span>02 &nbsp; Verification reviews</span><span>03 &nbsp; User management</span></div></div><span className="aa-admin-login-aside-foot">Authorized administrators only</span></aside>
      <div className="aa-admin-login-form-side"><div className="admin-login-card">
        <div className="admin-login-header">
          <div className="aa-admin-brand" aria-hidden="true">AAA<span>•</span></div>
          <span className="aa-eyebrow">Secure workspace</span>
          <h1 className="admin-login-title">Welcome back</h1>
          <p className="admin-login-subtitle">Sign in to manage your businesses, service providers and requests.</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="admin-error-message" role="alert">
              {error}
            </div>
          )}

          <div className="admin-form-group">
            <label htmlFor="username" className="admin-form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Enter your username"
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password" className="admin-form-label">
              Password
            </label>
            <div className="aa-admin-password-row">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={loading}
            />
            <button type="button" className="aa-show-password" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="admin-login-footer">
          <p className="admin-login-note">Authorized administrators only.</p>
          <Link to="/home" className="aa-admin-back">← Back to AAA Services</Link>

        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminLogin;
