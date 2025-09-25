import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaArrowLeft, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import './ReviewPage.css';

const ReviewPage = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBusinessList, setShowBusinessList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  
  const serviceCategories = {
    'plumbing': 'Plumbing Services',
    'electrical': 'Electrical Work',
    'cleaning': 'Home Cleaning',
    'painting': 'Home Painting',
    'gardening': 'Gardening & Lawn',
    'repair': 'Home Repair',
    'transport': 'Transport Services',
    'security': 'Security Services',
    'education': 'Online Courses',
    'food': 'Food Catering',
    'beauty': 'Beauty Services',
    'health': 'Health Services',
    'construction': 'Construction',
    'maintenance': 'Maintenance',
    'other': 'Other Services'
  };
  
  const ratingMessages = {
    1: 'Not good',
    2: 'Could\'ve been better',
    3: 'OK',
    4: 'Good',
    5: 'Great!'
  };
  
  // Load businesses from API
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/business?status=active&limit=100');
        
        if (response.ok) {
          const data = await response.json();
          setBusinesses(data.businesses || []);
        } else {
          console.error('Failed to fetch businesses:', response.status);
          setError('Failed to load businesses. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Failed to load businesses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, []);
  
  // Filter businesses based on category and search
  useEffect(() => {
    if (selectedCategory && businesses.length > 0) {
      let filtered = businesses.filter(business => 
        business.businessType === selectedCategory
      );
      
      if (searchQuery.trim()) {
        filtered = filtered.filter(business =>
          business.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          business.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setFilteredBusinesses(filtered);
    }
  }, [selectedCategory, searchQuery, businesses]);
  
  const handleCategorySelect = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setSelectedBusiness(null);
    setShowCategoryDropdown(false);
    setShowBusinessList(true);
    setSearchQuery('');
  };
  
  const handleBusinessSelect = (business) => {
    setSelectedBusiness(business);
    setShowBusinessList(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!isAuthenticated) {
      setError('Please log in to submit a review.');
      return;
    }

    if (!reviewTitle.trim()) {
      setError('Please enter a review title.');
      return;
    }

    if (review.length < 10) {
      setError('Review must be at least 10 characters long.');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }

    if (!selectedBusiness) {
      setError('Please select a business.');
      return;
    }

    setIsSubmitting(true);

    const reviewData = {
      businessId: selectedBusiness._id || selectedBusiness.id,
      rating: rating,
      title: reviewTitle.trim(),
      comment: review.trim(),
      serviceType: selectedCategory,
      serviceQuality: rating,
      communication: rating,
      valueForMoney: rating,
      punctuality: rating,
      professionalism: rating
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Review submitted successfully!');
        
        // Reset form
        setRating(0);
        setReviewTitle('');
        setReview('');
        setSelectedBusiness(null);
        setSelectedCategory('');
        
        // Redirect after success
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        if (response.status === 401) {
          setError('Please log in to submit a review.');
        } else if (response.status === 400) {
          setError(data.message || 'Invalid review data.');
        } else {
          setError(data.message || 'Failed to submit review. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="review-page">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        
        <div className="review-container">
          <h1>Authentication Required</h1>
          <p className="subtitle">You need to be logged in to write a review</p>
          
          <div className="auth-required-actions">
            <button 
              className="btn-primary" 
              onClick={() => navigate('/login')}
            >
              Log In
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="review-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>
      
      <div className="review-container">
        <h1>Rate & Review</h1>
        <p className="subtitle">Share your experience with our service providers</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label>Select Service Category</label>
            <div className="dropdown">
              <div 
                className="dropdown-toggle form-control" 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                {selectedCategory ? serviceCategories[selectedCategory] : 'Select a category'}
                <span className="dropdown-arrow">▼</span>
              </div>
              {showCategoryDropdown && (
                <div className="dropdown-menu">
                  {Object.entries(serviceCategories).map(([key, name]) => (
                    <div 
                      key={key} 
                      className="dropdown-item"
                      onClick={() => handleCategorySelect(key)}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedCategory && (
            <div className="form-group">
              <label>Search & Select Business</label>
              <div className="business-search">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search businesses by name..."
                    className="form-control"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowBusinessList(true)}
                  />
                </div>
                
                {showBusinessList && (
                  <div className="business-list">
                    {filteredBusinesses.length > 0 ? (
                      filteredBusinesses.map((business) => (
                        <div 
                          key={business._id || business.id} 
                          className="business-item"
                          onClick={() => handleBusinessSelect(business)}
                        >
                          <div className="business-image">
                            {business.images?.logo ? (
                              <img 
                                src={business.images.logo} 
                                alt={business.businessName} 
                              />
                            ) : (
                              <div className="business-placeholder">
                                {business.businessName?.charAt(0) || 'B'}
                              </div>
                            )}
                          </div>
                          <div className="business-info">
                            <div className="business-name">{business.businessName}</div>
                            <div className="business-location">
                              <FaMapMarkerAlt />
                              <span>{business.location?.city || business.city || 'Location not specified'}</span>
                            </div>
                            {business.rating?.average && (
                              <div className="business-rating">
                                <FaStar color="#f9b90b" />
                                <span>{business.rating.average.toFixed(1)} ({business.rating.totalReviews || 0} reviews)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-results">
                        {searchQuery.trim() ? 'No businesses found matching your search' : 'No businesses in this category'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {selectedBusiness && (
                <div className="selected-business">
                  <div className="selected-business-content">
                    <div className="business-image">
                      {selectedBusiness.images?.logo ? (
                        <img 
                          src={selectedBusiness.images.logo} 
                          alt={selectedBusiness.businessName}
                        />
                      ) : (
                        <div className="business-placeholder">
                          {selectedBusiness.businessName?.charAt(0) || 'B'}
                        </div>
                      )}
                    </div>
                    <div className="business-info">
                      <h4>{selectedBusiness.businessName}</h4>
                      <div className="business-location">
                        <FaMapMarkerAlt />
                        <span>{selectedBusiness.location?.city || selectedBusiness.city || 'Location not specified'}</span>
                      </div>
                      {selectedBusiness.rating?.average && (
                        <div className="business-rating">
                          <FaStar color="#f9b90b" />
                          <span>{selectedBusiness.rating.average.toFixed(1)} ({selectedBusiness.rating.totalReviews || 0} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="change-business"
                    onClick={() => setShowBusinessList(true)}
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="reviewTitle">Review Title</label>
            <input
              type="text"
              id="reviewTitle"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="form-control"
              placeholder="Give your review a title"
              maxLength="100"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Your Rating</label>
            <div className="rating">
              <p className="rating-message">
                {rating > 0 ? ratingMessages[rating] : 'Rate this business'}
              </p>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentRating = hover || rating;
                  let starColor = '#e4e5e9'; 
                  
                  if (star <= currentRating) {
                    if (currentRating <= 2) {
                      starColor = '#ff4444'; 
                    } else if (currentRating === 3) {
                      starColor = '#f4ec07'; 
                    } else {
                      starColor = '#f9b90b'; 
                    }
                  }
                  
                  return (
                    <FaStar
                      key={star}
                      className="star"
                      color={starColor}
                      size={32}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(star)}
                      style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="review">Your Review (min. 10 characters)</label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="form-control"
              rows="6"
              minLength="10"
              required
              placeholder="Share your experience with this business. Be specific about what you liked or didn't like."
            />
            <div className="character-count">{review.length}/10 characters minimum</div>
          </div>
          
          <button type="submit" className="submit-button" disabled={isSubmitting || isLoading}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewPage;
