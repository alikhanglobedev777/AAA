import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaStar, FaBuilding, FaRegUser } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import StandaloneComplaintForm from '../components/StandaloneComplaintForm';
import './ComplaintPage.css';

const ComplaintPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Business search and selection states
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBusinessList, setShowBusinessList] = useState(false);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  
  // Get user token from localStorage
  const userToken = localStorage.getItem('token');

  // Service categories for filtering
  const serviceCategories = {
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    cleaning: 'Cleaning',
    painting: 'Painting',
    gardening: 'Gardening',
    repair: 'Repair',
    transport: 'Transport',
    security: 'Security',
    education: 'Education',
    food: 'Food',
    beauty: 'Beauty',
    health: 'Health',
    construction: 'Construction',
    maintenance: 'Maintenance',
    other: 'Other'
  };

  // Fetch businesses from API
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setIsLoadingBusinesses(true);
        const response = await fetch('http://localhost:5000/api/business?status=active&limit=100');
        if (response.ok) {
          const data = await response.json();
          setBusinesses(data.businesses || []);
          setFilteredBusinesses(data.businesses || []);
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setIsLoadingBusinesses(false);
      }
    };

    fetchBusinesses();
  }, []);

  // Filter businesses based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = businesses.filter(business =>
        business.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBusinesses(filtered);
    } else {
      setFilteredBusinesses(businesses);
    }
  }, [searchQuery, businesses]);

  const handleBusinessSelect = (business) => {
    setSelectedBusiness(business);
    setShowBusinessList(false);
    setSearchQuery(business.businessName);
  };

  const handleSearchFocus = () => {
    setShowBusinessList(true);
  };

  const handleSearchBlur = () => {
    // Delay hiding the list to allow clicking on items
    setTimeout(() => setShowBusinessList(false), 200);
  };

  const handleClose = () => {
    navigate('/home');
  };

  const handleSuccess = (message) => {
    setIsSubmitted(true);
    // You can add toast notification here if needed
  };

  if (isSubmitted) {
    return (
      <div className="complaint-success">
        <h2>Complaint Submitted Successfully!</h2>
        <p>Thank you for your feedback. We take all complaints seriously and will review your submission shortly.</p>
        <p>Your complaint reference number is: <strong>CP-{Date.now().toString().slice(-6)}</strong></p>
        <div className="success-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
          <button 
            className="btn-secondary"
            onClick={() => {
              setIsSubmitted(false);
              window.scrollTo(0, 0);
            }}
          >
            Submit Another Complaint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="complaint-page">
      <div className="complaint-container">
        <button 
          className="back-button"
          onClick={handleClose}
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>File a Complaint</h1>
        <p className="page-description">
          We're sorry to hear you're having issues. Please search for and select the service provider 
          you want to file a complaint against, then fill out the form below. Our team will review 
          your complaint and take appropriate action.
        </p>

        {/* Business Search Section */}
        <div className="business-search-section">
          <h3>Select Service Provider</h3>
          <div className="business-search">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for a business by name, description, or location..."
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
            </div>
            
            {showBusinessList && (
              <div className="business-list">
                {isLoadingBusinesses ? (
                  <div className="loading-businesses">
                    <div className="spinner"></div>
                    <span>Loading businesses...</span>
                  </div>
                ) : filteredBusinesses.length > 0 ? (
                  filteredBusinesses.slice(0, 10).map((business) => (
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
                            <FaBuilding />
                          </div>
                        )}
                      </div>
                      <div className="business-info">
                        <div className="business-name">{business.businessName}</div>
                        <div className="business-location">
                          <FaMapMarkerAlt />
                          <span>{business.location?.city || business.city || 'Location not specified'}</span>
                        </div>
                        <div className="business-type">
                          <span className="category-badge">
                            {serviceCategories[business.businessType] || business.businessType}
                          </span>
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
                    {searchQuery.trim() ? 'No businesses found matching your search' : 'No businesses available'}
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
                      <FaBuilding />
                    </div>
                  )}
                </div>
                <div className="business-info">
                  <h4>{selectedBusiness.businessName}</h4>
                  <div className="business-location">
                    <FaMapMarkerAlt />
                    <span>{selectedBusiness.location?.city || selectedBusiness.city || 'Location not specified'}</span>
                  </div>
                  <div className="business-type">
                    <span className="category-badge">
                      {serviceCategories[selectedBusiness.businessType] || selectedBusiness.businessType}
                    </span>
                  </div>
                  {selectedBusiness.rating?.average && (
                    <div className="business-rating">
                      <FaStar color="#f9b90b" />
                      <span>{selectedBusiness.rating.average.toFixed(1)} ({selectedBusiness.rating.totalReviews || 0} reviews)</span>
                    </div>
                  )}
                </div>
                <button 
                  className="change-business-btn"
                  onClick={() => {
                    setSelectedBusiness(null);
                    setSearchQuery('');
                    setShowBusinessList(true);
                  }}
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Show complaint form or authentication prompt */}
        {selectedBusiness ? (
          !isAuthenticated ? (
            <div className="auth-required-message">
              <div className="auth-icon">
                <FaRegUser />
              </div>
              <p>You need to be logged in to file a complaint</p>
              <div className="auth-actions">
                <Link to="/login" className="btn-primary">Log In</Link>
                <Link to="/signup" className="btn-secondary">Sign Up</Link>
              </div>
            </div>
          ) : (
            <>
              {console.log('🔍 ComplaintPage: Business data for complaint:', {
                id: selectedBusiness?.id || selectedBusiness?._id,
                businessName: selectedBusiness?.businessName,
                businessType: selectedBusiness?.businessType
              })}
              <StandaloneComplaintForm 
                businessId={selectedBusiness._id || selectedBusiness.id}
                businessName={selectedBusiness.businessName}
                serviceType={selectedBusiness.businessType}
                userToken={userToken}
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            </>
          )
        ) : (
          <div className="no-business-selected">
            <div className="no-business-content">
              <FaBuilding className="no-business-icon" />
              <h4>Please Select a Service Provider</h4>
              <p>Search for and select the business you want to file a complaint against to continue.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintPage;
