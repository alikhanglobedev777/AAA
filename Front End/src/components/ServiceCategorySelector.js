import React, { useState, useEffect, useRef } from 'react';
import './ServiceCategorySelector.css';

const ServiceCategorySelector = ({
  selectedCategory,
  onCategorySelect,
  placeholder = 'Select a service category',
  className = '',
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const API_BASE = 'http://localhost:5000/api';

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`${API_BASE}/service-categories`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else if (Array.isArray(data)) {
          setCategories(data);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        if (err.message.includes('Failed to fetch')) {
          setError('Cannot connect to server. Please check if the backend is running.');
        } else {
          setError(`Failed to load categories: ${err.message}`);
        }
        // Fallback to static categories if API fails
        setCategories(getFallbackCategories());
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fallback categories if API fails
  const getFallbackCategories = () => [
    { id: 1, name: 'Plumbing Services', slug: 'plumbing-services' },
    { id: 2, name: 'Electrical Services', slug: 'electrical-services' },
    { id: 3, name: 'Home Cleaning', slug: 'home-cleaning' },
    { id: 4, name: 'Home Painting', slug: 'home-painting' },
    { id: 5, name: 'Home Repair & Maintenance', slug: 'home-repair-maintenance' },
    { id: 6, name: 'Gardening & Landscaping', slug: 'gardening-landscaping' },
    { id: 7, name: 'Food Catering', slug: 'food-catering' },
    { id: 8, name: 'Food Delivery', slug: 'food-delivery' },
    { id: 9, name: 'Construction Services', slug: 'construction-services' },
    { id: 10, name: 'Transport Services', slug: 'transport-services' },
    { id: 11, name: 'Security Services', slug: 'security-services' },
    { id: 12, name: 'Health & Medical', slug: 'health-medical' },
    { id: 13, name: 'Education & Training', slug: 'education-training' },
    { id: 14, name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
    { id: 15, name: 'IT & Technology', slug: 'it-technology' },
    { id: 16, name: 'Business Services', slug: 'business-services' },
    { id: 17, name: 'Automotive Services', slug: 'automotive-services' },
    { id: 18, name: 'Pet Services', slug: 'pet-services' },
    { id: 19, name: 'Pest Control', slug: 'pest-control' },
    { id: 20, name: 'Other Services', slug: 'other-services' }
  ];

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle category selection
  const handleCategorySelect = (category) => {
    onCategorySelect(category);
    setIsOpen(false);
    setSearchTerm('');
  };



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Get selected category display name
  const getSelectedDisplayName = () => {
    if (!selectedCategory) return '';
    return typeof selectedCategory === 'string' ? selectedCategory : selectedCategory.name;
  };

  return (
    <div className={`service-category-selector ${className}`} ref={dropdownRef}>
      <div className="selector-header">
        <label className="selector-label">
          Service Category {required && <span className="required">*</span>}
        </label>
        
        <div 
          className={`selector-input ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className="selected-value">
            {getSelectedDisplayName() || placeholder}
          </span>
          <i className={`fas fa-chevron-down ${isOpen ? 'up' : ''}`}></i>
        </div>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {/* Search Bar */}
          <div className="search-container">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>

          {/* Categories List */}
          <div className="categories-list">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Loading categories...</span>
              </div>
            ) : error ? (
              <div className="error-state">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <span>No categories found</span>
                {searchTerm && (
                  <p className="no-results-hint">
                    No categories match "{searchTerm}"
                  </p>
                )}
              </div>
            ) : (
              filteredCategories.map(category => (
                <div
                  key={category._id || category.id}
                  className={`category-option ${selectedCategory && 
                    (typeof selectedCategory === 'string' ? 
                      selectedCategory === category.name : 
                      selectedCategory._id === category._id || selectedCategory.id === category.id)
                    ? 'selected' : ''
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="category-info">
                    <i className={`${category.icon || 'fas fa-cog'} category-icon`}></i>
                    <div className="category-details">
                      <span className="category-name">{category.name}</span>
                      {category.description && (
                        <span className="category-description">{category.description}</span>
                      )}
                    </div>
                  </div>
                  {category.businessCount > 0 && (
                    <span className="business-count">{category.businessCount} businesses</span>
                  )}
                </div>
              ))
            )}
          </div>

          
        </div>
      )}
    </div>
  );
};

export default ServiceCategorySelector;
