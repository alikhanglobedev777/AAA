import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ServiceCategorySelector from '../components/ServiceCategorySelector';
import './Signup.css';

// Service categories are now fetched from the API via ServiceCategorySelector component

// Map UI categories to backend enum business types
const mapCategoryToBusinessType = (categoryName) => {
  const key = (categoryName || '').toLowerCase();
  if (key.includes('plumb')) return 'plumbing';
  if (key.includes('electric')) return 'electrical';
  if (key.includes('paint')) return 'painting';
  if (key.includes('clean')) return 'cleaning';
  if (key.includes('garden') || key.includes('lawn')) return 'gardening';
  if (key.includes('repair')) return 'repair';
  if (key.includes('transport') || key.includes('moving')) return 'transport';
  if (key.includes('security') || key.includes('lock')) return 'security';
  if (key.includes('education') || key.includes('tutor')) return 'education';
  if (key.includes('food') || key.includes('cater')) return 'food';
  if (key.includes('beauty')) return 'beauty';
  if (key.includes('health') || key.includes('training')) return 'health';
  if (key.includes('construct')) return 'construction';
  if (key.includes('maint')) return 'maintenance';
  return 'other';
};

const ServiceProviderSignup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // User details
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: '',
    
    // Business details
    businessName: '',
    serviceCategory: '',
    yearsOfExperience: '',
    description: '',
    address: '',
    city: '',
    website: '',
    
    // Business hours
    businessHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: false }
    },
    
    // Additional services
    additionalServices: [],
    
    // Images
    profilePicture: null,
    coverPhoto: null,
    galleryImages: [],
    imagePreview: '',
    coverPreview: '',
    galleryPreviews: []
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleImageChange = (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Clear any previous errors
      setError('');

      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select a valid image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      
      // Store a reference to setFormData that will be available in the callback
      const updateFormData = setFormData;
      
      reader.onload = (event) => {
        try {
          updateFormData(prev => ({
            ...prev,
            profilePicture: file,
            imagePreview: event.target.result
          }));
        } catch (err) {
          console.error('Error updating form data:', err);
          setError('Failed to process the image');
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read the image file');
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error in handleImageChange:', err);
      setError('An error occurred while processing the image');
    }
  };

  const handleCoverPhotoChange = (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Clear any previous errors
      setError('');

      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select a valid image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Cover photo size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          setFormData(prev => ({
            ...prev,
            coverPhoto: file,
            coverPreview: event.target.result
          }));
        } catch (err) {
          console.error('Error updating form data:', err);
          setError('Failed to process the cover photo');
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read the cover photo file');
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error in handleCoverPhotoChange:', err);
      setError('An error occurred while processing the cover photo');
    }
  };

  const handleGalleryImageChange = (e) => {
    try {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      // Clear any previous errors
      setError('');

      // Validate number of images
      if (formData.galleryImages.length + files.length > 5) {
        setError('You can only upload up to 5 gallery images');
        return;
      }

      // Validate each file
      for (const file of files) {
        if (!file.type.match('image.*')) {
          setError('Please select valid image files (JPEG, PNG, etc.)');
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError('Each image size should be less than 5MB');
          return;
        }
      }

      // Process each file
      const newGalleryImages = [...formData.galleryImages];
      const newGalleryPreviews = [...formData.galleryPreviews];

      files.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            newGalleryImages.push(file);
            newGalleryPreviews.push(event.target.result);
            
            // Update state after all files are processed
            if (newGalleryImages.length === formData.galleryImages.length + files.length) {
              setFormData(prev => ({
                ...prev,
                galleryImages: newGalleryImages,
                galleryPreviews: newGalleryPreviews
              }));
            }
          } catch (err) {
            console.error('Error updating gallery data:', err);
            setError('Failed to process gallery images');
          }
        };
        
        reader.onerror = () => {
          setError('Failed to read gallery image files');
        };
        
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.error('Error in handleGalleryImageChange:', err);
      setError('An error occurred while processing gallery images');
    }
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
      galleryPreviews: prev.galleryPreviews.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      handleImageChange(e);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleAdditionalServiceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const addAdditionalService = () => {
    setFormData(prev => ({
      ...prev,
      additionalServices: [
        ...prev.additionalServices,
        {
          serviceTitle: '',
          serviceDescription: '',
          pricing: {
            type: 'fixed',
            amount: '',
            currency: 'PKR',
            unit: 'per service'
          }
        }
      ]
    }));
  };

  const removeAdditionalService = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.filter((_, i) => i !== index)
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      // User details validation
      if (!formData.name.trim()) {
        setError('Full name is required');
        return false;
      }
      if (!formData.email.trim()) {
        setError('Email is required');
        return false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!formData.phone.trim()) {
        setError('Phone number is required');
        return false;
      }
      if (!formData.password) {
        setError('Password is required');
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
      // City is collected and validated in Step 2
      return true;
      
    } else if (step === 2) {
      // Business details validation
      if (!formData.businessName.trim()) {
        setError('Business name is required');
        return false;
      }
      if (!formData.serviceCategory) {
        setError('Please select a service category');
        return false;
      }
      if (!formData.address.trim()) {
        setError('Business address is required');
        return false;
      }
      if (!formData.city.trim()) {
        setError('City is required');
        return false;
      }
      // Optional: description minimum for better profiles
      if (formData.description && formData.description.trim().length > 0 && formData.description.trim().length < 20) {
        setError('Description must be at least 20 characters long');
        return false;
      }
      return true;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setIsSubmitting(true);
    setError('');

    try {
      // Split full name into first/last
      const trimmedName = formData.name.trim();
      const firstSpace = trimmedName.indexOf(' ');
      const firstName = firstSpace === -1 ? trimmedName : trimmedName.slice(0, firstSpace);
      const lastName = firstSpace === -1 ? 'Provider' : trimmedName.slice(firstSpace + 1) || 'Provider';

      const selectedCategory = formData.serviceCategory;
      const businessType = selectedCategory ? mapCategoryToBusinessType(selectedCategory.name) : 'other';

      // Convert images to base64 strings for backend storage
      const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          if (!file) {
            resolve(null);
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      // Convert all images to base64
      const [profilePictureBase64, coverPhotoBase64] = await Promise.all([
        convertImageToBase64(formData.profilePicture),
        convertImageToBase64(formData.coverPhoto)
      ]);

      // Convert gallery images to base64
      const galleryBase64 = await Promise.all(
        formData.galleryImages.map(file => convertImageToBase64(file))
      );

      // Build payload that backend expects
      const payload = {
        firstName,
        lastName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone.trim(),
        location: {
          city: (formData.city || '').trim(),
          area: (formData.location || '').trim() || undefined,
          address: (formData.address || '').trim() || undefined
        },
        businessName: formData.businessName.trim(),
        businessType,
        description: (formData.description && formData.description.trim().length >= 20)
          ? formData.description.trim()
          : `Professional ${selectedCategory?.name || 'service'} provider in ${formData.city}`,
        businessContact: {
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          website: formData.website.trim() || undefined
        },
        businessLocation: {
          address: formData.address.trim(),
          city: formData.city.trim()
        },
        businessHours: formData.businessHours,
        services: [
          {
            name: selectedCategory?.name || 'Service',
            description: `Quality ${selectedCategory?.name || 'service'} for homes and businesses`,
            priceType: 'negotiable',
            currency: 'PKR'
          }
        ],
        images: {
          logo: profilePictureBase64,
          cover: coverPhotoBase64,
          gallery: galleryBase64.filter(img => img !== null)
        }
      };

      const response = await fetch('http://localhost:5000/api/auth/business/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data && (data.errors || data.error)) {
          const msg = Array.isArray(data.errors) ? data.errors.join('\n') : (data.error || data.message);
          throw new Error(msg || 'Registration failed');
        }
        throw new Error('Registration failed');
      }

      // Persist success message and redirect to a friendly success screen
      const successMsg = data.message || 'Thank you for registering your business with us! Please check your email to verify your account before you can login.';
      sessionStorage.setItem('sp_signup_success', successMsg);
      navigate('/signup/success');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2>Become a Service Provider</h2>
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}
          <div className="progress-bar">
            {[1, 2, 3].map((stepNum) => (
              <div 
                key={stepNum} 
                className={`progress-step ${step === stepNum ? 'active' : ''}`}
              >
                <div className="step-number">{stepNum}</div>
                <div className="step-label">
                  {stepNum === 1 ? 'Personal Info' : stepNum === 2 ? 'Business Info' : 'Review'}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="signup-form">
          {step === 1 && (
            <div className="form-step">
              <h2 className="step-title">Personal Information</h2>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Your location (e.g., City, Country)"
                />
              </div>
              <div className="form-group">
                <label>Create Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min 6 characters)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <div className="form-navigation">
                <button type="button" className="nav-button primary" onClick={nextStep}>
                  Next: Business Details
                </button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="form-step">
              <h2 className="step-title">Business Information</h2>
              <div className="form-group">
                <label>Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Your business name"
                  required
                />
              </div>
              <div className="form-group">
                <ServiceCategorySelector
                  selectedCategory={formData.serviceCategory}
                  onCategorySelect={(category) => setFormData(prev => ({ ...prev, serviceCategory: category }))}
                  placeholder="Select a service category"
                  required={true}
                />
              </div>
              <div className="form-group">
                <label>Business Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                  required
                />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Website (Optional)</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourbusiness.com"
                />
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  placeholder="Years of experience"
                  min="0"
                  max="50"
                />
              </div>
              <div className="form-group">
                <label>Business Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your business"
                  rows="4"
                ></textarea>
              </div>

              {/* Business Hours Section */}
              <div className="form-group">
                <label>Business Hours</label>
                <div className="business-hours-container">
                  {Object.entries(formData.businessHours).map(([day, hours]) => (
                    <div key={day} className="day-row">
                      <div className="day-label">
                        <input
                          type="checkbox"
                          checked={!hours.closed}
                          onChange={(e) => handleBusinessHoursChange(day, 'closed', !e.target.checked)}
                          className="day-checkbox"
                        />
                        <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                      </div>
                      {!hours.closed && (
                        <div className="time-inputs">
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                            className="time-input"
                          />
                          <span className="time-separator">to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                            className="time-input"
                          />
                        </div>
                      )}
                      {hours.closed && (
                        <span className="closed-label">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Services Section */}
              <div className="form-group">
                <label>Additional Services (Optional)</label>
                <p className="field-description">Add specific services you offer with pricing details</p>
                
                {formData.additionalServices.map((service, index) => (
                  <div key={index} className="additional-service-card">
                    <div className="service-header">
                      <h4>Service {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeAdditionalService(index)}
                        className="remove-service-btn"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    
                    <div className="service-fields">
                      <input
                        type="text"
                        placeholder="Service Title (e.g., Solar Installation)"
                        value={service.serviceTitle}
                        onChange={(e) => handleAdditionalServiceChange(index, 'serviceTitle', e.target.value)}
                        className="service-input"
                      />
                      
                      <textarea
                        placeholder="Service Description"
                        value={service.serviceDescription}
                        onChange={(e) => handleAdditionalServiceChange(index, 'serviceDescription', e.target.value)}
                        className="service-textarea"
                        rows="3"
                      />
                      
                      <div className="pricing-section">
                        <select
                          value={service.pricing.type}
                          onChange={(e) => handleAdditionalServiceChange(index, 'pricing', {
                            ...service.pricing,
                            type: e.target.value
                          })}
                          className="pricing-type-select"
                        >
                          <option value="fixed">Fixed Price</option>
                          <option value="hourly">Hourly Rate</option>
                          <option value="negotiable">Negotiable</option>
                        </select>
                        
                        {(service.pricing.type === 'fixed' || service.pricing.type === 'hourly') && (
                          <div className="price-input-group">
                            <input
                              type="number"
                              placeholder="Amount"
                              value={service.pricing.amount}
                              onChange={(e) => handleAdditionalServiceChange(index, 'pricing', {
                                ...service.pricing,
                                amount: e.target.value
                              })}
                              className="price-input"
                              min="0"
                            />
                            <span className="currency-label">PKR</span>
                            {service.pricing.type === 'hourly' && (
                              <select
                                value={service.pricing.unit}
                                onChange={(e) => handleAdditionalServiceChange(index, 'pricing', {
                                  ...service.pricing,
                                  unit: e.target.value
                                })}
                                className="unit-select"
                              >
                                <option value="per hour">per hour</option>
                                <option value="per day">per day</option>
                                <option value="per month">per month</option>
                              </select>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addAdditionalService}
                  className="add-service-btn"
                >
                  <i className="fas fa-plus"></i> Add Another Service
                </button>
              </div>
              <div className="form-group">
                <label>Profile Picture *</label>
                <div className="image-upload">
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                    required
                  />
                  <label htmlFor="profilePicture" className="file-label">
                    {formData.imagePreview ? (
                      <img src={formData.imagePreview} alt="Preview" className="image-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <i className="fas fa-camera"></i>
                        <span>Upload Profile Picture</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Cover Photo (Optional)</label>
                <div className="image-upload">
                  <input
                    type="file"
                    id="coverPhoto"
                    name="coverPhoto"
                    accept="image/*"
                    onChange={handleCoverPhotoChange}
                    className="file-input"
                  />
                  <label htmlFor="coverPhoto" className="file-label">
                    {formData.coverPreview ? (
                      <img src={formData.coverPreview} alt="Cover Preview" className="image-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <i className="fas fa-image"></i>
                        <span>Upload Cover Photo</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Gallery Images (Optional - Up to 5)</label>
                <div className="gallery-upload">
                  <input
                    type="file"
                    id="galleryImages"
                    name="galleryImages"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImageChange}
                    className="file-input"
                  />
                  <label htmlFor="galleryImages" className="file-label">
                    <div className="upload-placeholder">
                      <i className="fas fa-images"></i>
                      <span>Upload Gallery Images</span>
                      <small>Select up to 5 images</small>
                    </div>
                  </label>
                  
                  {formData.galleryPreviews.length > 0 && (
                    <div className="gallery-previews">
                      {formData.galleryPreviews.map((preview, index) => (
                        <div key={index} className="gallery-preview-item">
                          <img src={preview} alt={`Gallery ${index + 1}`} />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="remove-gallery-image"
                            aria-label="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-navigation">
                <button type="button" className="nav-button secondary" onClick={prevStep}>
                  Back
                </button>
                <button type="button" className="nav-button primary" onClick={nextStep}>
                  Next: Review & Submit
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="form-step">
              <h2 className="step-title">Review Your Information</h2>
              <div className="review-section">
                <h3>Personal Information</h3>
                <div className="review-item">
                  <span className="review-label">Name:</span>
                  <span className="review-value">{formData.name}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Email:</span>
                  <span className="review-value">{formData.email}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Phone:</span>
                  <span className="review-value">{formData.phone}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Location:</span>
                  <span className="review-value">{formData.location || 'Not specified'}</span>
                </div>
                
                <h3>Business Information</h3>
                <div className="review-item">
                  <span className="review-label">Business Name:</span>
                  <span className="review-value">{formData.businessName}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Service Category:</span>
                  <span className="review-value">
                    {formData.serviceCategory?.name || 'Not specified'}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Address:</span>
                  <span className="review-value">{formData.address}, {formData.city}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Website:</span>
                  <span className="review-value">{formData.website || 'Not specified'}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Years of Experience:</span>
                  <span className="review-value">{formData.yearsOfExperience || '0'}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Description:</span>
                  <span className="review-value">{formData.description || 'No description provided'}</span>
                </div>
                
                <h3>Images</h3>
                <div className="review-item">
                  <span className="review-label">Profile Picture:</span>
                  <span className="review-value">
                    {formData.profilePicture ? '✓ Uploaded' : 'Not uploaded'}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Cover Photo:</span>
                  <span className="review-value">
                    {formData.coverPhoto ? '✓ Uploaded' : 'Not uploaded'}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Gallery Images:</span>
                  <span className="review-value">
                    {formData.galleryImages.length > 0 
                      ? `✓ ${formData.galleryImages.length} image(s) uploaded` 
                      : 'No gallery images uploaded'}
                  </span>
                </div>
                
                <h3>Business Hours</h3>
                {Object.entries(formData.businessHours).map(([day, hours]) => (
                  <div key={day} className="review-item">
                    <span className="review-label">{day.charAt(0).toUpperCase() + day.slice(1)}:</span>
                    <span className="review-value">
                      {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                ))}
                
                {formData.additionalServices.length > 0 && (
                  <>
                    <h3>Additional Services</h3>
                    {formData.additionalServices.map((service, index) => (
                      <div key={index} className="review-service-item">
                        <div className="review-item">
                          <span className="review-label">Service {index + 1}:</span>
                          <span className="review-value">{service.serviceTitle}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-label">Description:</span>
                          <span className="review-value">{service.serviceDescription}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-label">Pricing:</span>
                          <span className="review-value">
                            {service.pricing.type === 'negotiable' ? 'Negotiable' : 
                             `${service.pricing.amount} PKR ${service.pricing.type === 'hourly' ? service.pricing.unit : ''}`
                            }
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              
              <div className="form-navigation">
                <button type="button" className="nav-button secondary" onClick={prevStep}>
                  Back
                </button>
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          )}
        </form>
        <div className="signup-footer">
          <p>
            Already have a business account? <a className="login-link" href="/service-provider-login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderSignup;
