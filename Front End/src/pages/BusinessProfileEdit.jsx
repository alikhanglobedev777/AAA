import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaCamera, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import './BusinessProfileEdit.css';

const BusinessProfileEdit = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    businessName: '',
    categoryName: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    yearsOfExperience: '',
    profilePicture: null,
    previewImage: ''
  });
  
  const [categories, setCategories] = useState([
    'Plumbing', 'Electrical', 'Cleaning', 'Moving', 'Painting', 
    'Handyman', 'Landscaping', 'Pest Control', 'Other'
  ]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load business data
  useEffect(() => {
    const loadBusinessProfile = () => {
      try {
        const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
        const business = providers.find(p => p.id === businessId);
        
        if (!business) {
          setError('Business not found');
          setLoading(false);
          return;
        }
        
        // Check if current user is the owner
        if (business.userId !== user?.id) {
          setError('You are not authorized to edit this profile');
          setLoading(false);
          return;
        }
        
        setFormData({
          businessName: business.businessName || '',
          categoryName: business.categoryName || '',
          description: business.description || '',
          phone: business.phone || '',
          email: business.email || '',
          address: business.address || '',
          city: business.city || '',
          yearsOfExperience: business.yearsOfExperience || '',
          profilePicture: null,
          previewImage: business.profilePicture || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading business profile:', err);
        setError('Failed to load business profile');
        setLoading(false);
      }
    };
    
    loadBusinessProfile();
  }, [businessId, user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePicture: file,
          previewImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      profilePicture: null,
      previewImage: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // Basic validation
      if (!formData.businessName.trim()) {
        setError('Business name is required');
        return;
      }
      
      if (!formData.categoryName) {
        setError('Please select a category');
        return;
      }
      
      // Update business in localStorage
      const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const updatedProviders = providers.map(provider => {
        if (provider.id === businessId && provider.userId === user?.id) {
          return {
            ...provider,
            businessName: formData.businessName,
            categoryName: formData.categoryName,
            description: formData.description,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            yearsOfExperience: formData.yearsOfExperience,
            profilePicture: formData.previewImage || provider.profilePicture,
            updatedAt: new Date().toISOString()
          };
        }
        return provider;
      });
      
      localStorage.setItem('serviceProviders', JSON.stringify(updatedProviders));
      setSuccess('Profile updated successfully!');
      
      // Redirect back to profile after a short delay
      setTimeout(() => {
        navigate(`/business-profile/${businessId}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error updating business profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>{error}</h2>
        <button 
          className="btn-primary" 
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="business-profile-edit">
      <div className="edit-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft /> Back to Profile
        </button>
        <h1>Edit Business Profile</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-section">
          <h2>Business Information</h2>
          
          <div className="form-group">
            <label htmlFor="businessName">Business Name *</label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Enter business name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="categoryName">Category *</label>
            <select
              id="categoryName"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="yearsOfExperience">Years of Experience</label>
            <input
              type="number"
              id="yearsOfExperience"
              name="yearsOfExperience"
              min="0"
              max="50"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              placeholder="e.g., 5"
            />
          </div>
          
          <div className="form-group">
            <label>Business Logo/Image</label>
            <div className="image-upload-container">
              <div className="image-preview">
                {formData.previewImage ? (
                  <>
                    <img 
                      src={formData.previewImage} 
                      alt="Business preview" 
                      className="preview-image"
                    />
                    <button 
                      type="button" 
                      className="remove-image"
                      onClick={removeImage}
                    >
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <div className="upload-placeholder">
                    <FaCamera className="camera-icon" />
                    <span>Upload Image</span>
                  </div>
                )}
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
              </div>
              <p className="image-hint">Recommended size: 500x500px, Max size: 2MB</p>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Business Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your business..."
              rows="4"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Contact Information</h2>
          
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
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
              placeholder="+1 (123) 456-7890"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Street Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Business St"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
            />
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
          >
            <FaSave /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessProfileEdit;
