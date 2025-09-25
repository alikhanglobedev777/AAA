import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa';
import BusinessAvatar from '../components/BusinessAvatar';
import './Profile.css';

function Profile() {
  const { user, updateProfile, updateProfilePicture, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  
  // Debug logging
  useEffect(() => {
    console.log('Profile component - User state:', user);
    console.log('Profile component - Token in localStorage:', localStorage.getItem('token'));
    console.log('Profile component - User type:', typeof user);
    console.log('Profile component - User keys:', user ? Object.keys(user) : 'No user object');
  }, [user]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    area: '',
    country: 'Pakistan',
    postalCode: ''
  });
  
  // Initialize form data when user data is available
  useEffect(() => {
    if (user && user.firstName) {
      console.log('Profile component - Setting form data with user:', user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
          email: user.email || '',
        phone: user.phone || '',
        address: user.location?.address || '',
        city: user.location?.city || '',
        area: user.location?.area || '',
        country: user.location?.country || 'Pakistan',
        postalCode: user.location?.postalCode || ''
      });
      
      // Set preview image if user has a profile picture
      if (user.profilePicture) {
        setPreviewImage(user.profilePicture);
      }
    }
  }, [user]);





  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile picture selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(file);
        setPreviewImage(reader.result);
        setMessage({ type: '', text: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected profile picture
  const removeImage = () => {
    setProfilePicture(null);
    setPreviewImage(user.profilePicture || '');
    setMessage({ type: '', text: '' });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage({ type: '', text: '' });
    // Initialize preview image with current profile picture
    setPreviewImage(user.profilePicture || '');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original user data
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.location?.address || '',
      city: user.location?.city || '',
      area: user.location?.area || '',
      country: user.location?.country || 'Pakistan',
      postalCode: user.location?.postalCode || ''
    });
    // Reset profile picture state
    setProfilePicture(null);
    setPreviewImage(user.profilePicture || '');
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // If there's a new profile picture, upload it first
      if (profilePicture) {
        const pictureResult = await updateProfilePicture(previewImage);
        if (!pictureResult.success) {
          setMessage({ type: 'error', text: pictureResult.message || 'Failed to update profile picture' });
          setIsLoading(false);
          return;
        }
      }

      const profileData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        location: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          area: formData.area.trim(),
          country: formData.country.trim(),
          postalCode: formData.postalCode.trim()
        }
      };

      const result = await updateProfile(profileData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        // Reset profile picture state
        setProfilePicture(null);
        setPreviewImage('');
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };



  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-loading">
            <h2>Loading Profile...</h2>
            <p>Please wait while we load your profile information.</p>
            <div className="loading-spinner"></div>
            <p className="debug-info">
              Debug: User object is {user === null ? 'null' : 'undefined'}<br/>
              Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}<br/>
              <button onClick={() => window.location.reload()}>Reload Page</button>
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback display if user object is incomplete
  if (!user.firstName || !user.email) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-loading">
            <h2>Profile Data Incomplete</h2>
            <p>Some profile information is missing. Please try logging in again.</p>
            <div className="debug-info">
              <p><strong>User object received:</strong></p>
              <pre>{JSON.stringify(user, null, 2)}</pre>
              <p><strong>User type:</strong> {typeof user}</p>
              <p><strong>User keys:</strong> {user ? Object.keys(user).join(', ') : 'No user object'}</p>
              <button onClick={() => navigate('/login')}>Go to Login</button>
              <button onClick={() => window.location.reload()}>Reload Page</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <BusinessAvatar
            businessName={`${user.firstName} ${user.lastName}`}
            imageUrl={previewImage || user.profilePicture}
            size="large"
            className="avatar-img"
          />
          {isEditing && (
            <div className="avatar-edit-container">
              <button 
                type="button" 
                className="avatar-edit-btn"
                onClick={() => document.getElementById('profilePictureInput').click()}
              >
                <FaCamera />
              </button>
              <input
                type="file"
                id="profilePictureInput"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          )}
          
          {/* Show image preview and remove button when editing and image is selected */}
          {isEditing && profilePicture && (
            <div className="avatar-preview-overlay">
              <button 
                type="button" 
                className="avatar-remove-btn"
                onClick={removeImage}
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <h2>{user.firstName} {user.lastName}</h2>
          <p className="user-email">{user.email}</p>
          <p className="user-type">Customer Account</p>
          
          {/* Show image hint when editing and image is selected */}
          {isEditing && profilePicture && (
            <div className="image-upload-hint">
              <p>New profile picture selected. Click "Save Changes" to update.</p>
              <p className="image-hint-small">Max size: 5MB, Recommended: 500x500px</p>
            </div>
          )}
        </div>
        <div className="profile-actions">
            {!isEditing ? (
              <button onClick={handleEdit} className="edit-btn">
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button onClick={handleSave} className="save-btn" disabled={isLoading}>
                  <FaSave /> {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={handleCancel} className="cancel-btn">
                  <FaTimes /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-content">
          <div className="profile-section">
            <h3>Personal Information</h3>
            
            {/* First Name and Last Name - Two columns when space allows */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaUser className="input-icon" />
                  First Name
                </label>
            <input 
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'readonly' : ''}
                />
              </div>
              <div className="form-group">
                <label>
                  <FaUser className="input-icon" />
                  Last Name
          </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'readonly' : ''}
                />
              </div>
            </div>
            
            {/* User Type Tags */}
            {user && user.tags && user.tags.length > 0 && (
              <div className="user-type-section">
                <h4>Account Type</h4>
                <div className="user-type-tags">
                  {user.tags.map((tag, index) => (
                    <span key={index} className={`user-type-tag ${tag.toLowerCase().replace(' ', '-')}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
        
          <div className="profile-section">
            <h3>Contact Information</h3>
            <div className="form-group">
              <label>
                <FaEnvelope className="input-icon" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="readonly"
              />
              <small>Email cannot be changed</small>
            </div>
            <div className="form-group">
              <label>
                <FaPhone className="input-icon" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? 'readonly' : ''}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          
          <div className="profile-section">
            <h3>Location Information</h3>
          
            {/* Address - Full Width */}
            <div className="form-group">
              <label>
                <FaMapMarkerAlt className="input-icon" />
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? 'readonly' : ''}
                placeholder="Enter your street address"
              />
            </div>
            
            {/* City and Area - Two columns when space allows */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="input-icon" />
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'readonly' : ''}
                  placeholder="Enter your city"
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
                  disabled={!isEditing}
                  className={!isEditing ? 'readonly' : ''}
                  placeholder="Enter your area"
                />
              </div>
            </div>
            
            {/* Country and Postal Code - Two columns when space allows */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="input-icon" />
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'readonly' : ''}
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
                  disabled={!isEditing}
                  className={!isEditing ? 'readonly' : ''}
                  placeholder="Enter postal code"
                />
              </div>
            </div>
        </div>
        


        <div className="profile-section">
            <h3>Account Actions</h3>
            <div className="account-actions">
              <button onClick={handleLogout} className="logout-btn">
                Sign Out
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}



export default Profile;
