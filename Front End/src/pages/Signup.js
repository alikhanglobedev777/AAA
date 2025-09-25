import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaPhone, FaGlobe } from 'react-icons/fa';
import './Signup.css';

function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    area: '',
    country: 'Pakistan',
    postalCode: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = (currentStep) => {
    setError('');
    
    switch (currentStep) {
      case 1:
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError('Please fill in your first and last name');
          return false;
        }
        break;
      case 2:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setError('Please fill in all fields');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        break;
      case 3:
        if (!formData.phone.trim() || !formData.address.trim() || !formData.city.trim()) {
          setError('Please fill in phone number, address, and city');
          return false;
        }
        if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
          setError('Please enter a valid phone number');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateStep(step)) {
      return;
    }

    try {
      const locationData = {
        address: formData.address.trim(),
        city: formData.city.trim(),
        area: formData.area.trim(),
        country: formData.country.trim()
      };

      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone.trim(),
        location: locationData
      });

      if (result && result.success) {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        const errorMessage = result?.message || 'Registration failed';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError('An error occurred during registration. Please try again.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step">
            <h3 className="step-title">Personal Information</h3>
            
            {/* First Name and Last Name - Two columns when space allows */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaUser className="input-icon" />
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <FaUser className="input-icon" />
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="form-step">
            <h3 className="step-title">Account Details</h3>
            
            {/* Email - Full Width */}
            <div className="form-group">
              <label>
                <FaEnvelope className="input-icon" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
              />
            </div>
            
            {/* Password and Confirm Password - Two columns when space allows */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaLock className="input-icon" />
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label>
                  <FaLock className="input-icon" />
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  minLength="6"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-step">
            <h3 className="step-title">Contact & Location</h3>
            
            {/* Phone Number - Full Width */}
            <div className="form-group">
              <label>
                <FaPhone className="input-icon" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>
            
            {/* Address - Full Width */}
            <div className="form-group">
              <label>
                <FaMapMarkerAlt className="input-icon" />
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your street address"
                required
              />
            </div>
            
            {/* City and Area - Two columns when space allows */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="input-icon" />
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="input-icon" />
                  Area/Neighborhood
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="Enter your area"
                />
              </div>
            </div>
            
            {/* Country and Postal Code - Two columns when space allows */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaGlobe className="input-icon" />
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="input-icon" />
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2>Create Your Account</h2>
          <p>Join thousands of customers using AAA Services</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Personal Info</span>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Account</span>
          </div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Contact</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
          {renderStep()}

          <div className="form-navigation">
            {step > 1 && (
              <button 
                type="button" 
                onClick={prevStep} 
                className="nav-button secondary"
              >
                ← Previous
              </button>
            )}
            {step < 3 ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="nav-button primary"
              >
                Next →
              </button>
            ) : (
              <button type="submit" className="submit-button">
                Create Account
              </button>
            )}
          </div>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account? <a href="/login" className="login-link">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;