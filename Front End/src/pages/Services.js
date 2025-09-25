import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import './Services.css';

const API_BASE = 'http://localhost:5000/api';

const categoryOptions = [
  'All Categories', 'plumbing', 'electrical', 'cleaning', 'food', 'construction', 'transport', 'security'
];

const toBusinessType = (label) => {
  const k = (label || '').toLowerCase();
  if (k.includes('plumb')) return 'plumbing';
  if (k.includes('electric')) return 'electrical';
  if (k.includes('clean')) return 'cleaning';
  if (k.includes('food')) return 'food';
  if (k.includes('construct')) return 'construction';
  if (k.includes('transport')) return 'transport';
  if (k.includes('security')) return 'security';
  return '';
};

const Services = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const urlService = searchParams.get('service') || '';
  const urlLocation = searchParams.get('location') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlSort = searchParams.get('sort') || '';
  const urlRating = searchParams.get('rating') || '';
  
  const [locationQuery, setLocationQuery] = useState(urlLocation);
  const [searchTerm, setSearchTerm] = useState(urlService);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'All Categories');
  const [sortBy, setSortBy] = useState(urlSort || 'rating'); // rating, name, newest, oldest
  const [filterRating, setFilterRating] = useState(urlRating || 'all'); // all, 4+, 3+, 2+

  const [loading, setLoading] = useState(true); // Start with loading true to show skeleton initially
  const [error, setError] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // Track if we've made a search
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial page load
  const [isSearching, setIsSearching] = useState(false); // Track search operations
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (urlService !== searchTerm) setSearchTerm(urlService);
    if (urlLocation !== locationQuery) setLocationQuery(urlLocation);
    if (urlCategory !== selectedCategory && urlCategory) {
      setSelectedCategory(urlCategory);
    }
    if (urlSort !== sortBy && urlSort) {
      setSortBy(urlSort);
    }
    if (urlRating !== filterRating && urlRating) {
      setFilterRating(urlRating);
    }
  }, [urlService, urlLocation, urlCategory, urlSort, urlRating, searchTerm, locationQuery, selectedCategory, sortBy, filterRating]);

  // Handle initial page load and test API connection
  useEffect(() => {
    // Force clear any errors on component mount
    setError('');
    console.log('🔍 Frontend: Component mounted, error state cleared');
    
    // If we have URL parameters, mark as searched
    if (urlService || urlLocation || urlCategory) {
      setHasSearched(true);
    }
    
    // Test API connection on component mount (but don't fail if it doesn't work)
    const testAPIConnection = async () => {
      try {
        const testRes = await fetch(`${API_BASE}/business?limit=1`, {
          method: 'GET'
        });
        console.log('🔍 Frontend: API connection test - Status:', testRes.status);
        if (testRes.ok) {
          console.log('✅ Frontend: API connection successful');
        } else {
          console.warn('⚠️ Frontend: API connection test failed with status:', testRes.status);
        }
      } catch (error) {
        console.error('❌ Frontend: API connection test failed:', error);
        // Don't set error state, just log it
      }
    };
    
    testAPIConnection();
  }, [urlService, urlLocation, urlCategory]);

  // Add a small delay for initial loading to show skeleton for 1 second
  useEffect(() => {
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  const updateSearchParams = useCallback((service, location, category) => {
    const p = new URLSearchParams();
    if (service) p.set('service', service);
    if (location) p.set('location', location);
    if (category && category !== 'All Categories') p.set('category', category);
    setSearchParams(p);
  }, [setSearchParams]);

  // Update search params when URL changes (e.g., from header search)
  useEffect(() => {
    // If we have service or location from URL but no category, clear the selected category
    if ((urlService || urlLocation) && !urlCategory) {
      setSelectedCategory('All Categories');
    }
  }, [urlService, urlLocation, urlCategory]);

  // Update URL when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'All Categories') {
      updateSearchParams(searchTerm, locationQuery, selectedCategory);
    }
  }, [selectedCategory, searchTerm, locationQuery, updateSearchParams]);

  // Handle search input changes with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Show loading state immediately when user types
    if (value.trim()) {
      setIsSearching(true);
      setLoading(true);
      setError(''); // Clear any previous errors
    }
    
    // Debounce search to avoid excessive API calls
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearching(true);
      setLoading(true);
      updateSearchParams(value, locationQuery, selectedCategory);
    }, 300); // 300ms delay
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Show loading state immediately when user types
    if (value.trim()) {
      setIsSearching(true);
      setLoading(true);
      setError(''); // Clear any previous errors
    }
    
    // Debounce location search
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearching(true);
      setLoading(true);
      updateSearchParams(searchTerm, value, selectedCategory);
    }, 300);
  };

  // Sort and filter businesses with optimized memoization
  const sortedAndFilteredBusinesses = useMemo(() => {
    if (!businesses.length) return [];
    
    let filtered = [...businesses];
    
    console.log('🔍 Filtering businesses:', {
      totalBusinesses: businesses.length,
      filterRating,
      businessesWithRatings: businesses.map(b => ({ name: b.name, rating: b.rating }))
    });
    
    // Filter by rating
    if (filterRating !== 'all') {
      const minRating = parseInt(filterRating);
      console.log('🔍 Applying rating filter:', { minRating, filterRating });
      
      filtered = filtered.filter(business => {
        const businessRating = business.rating || 0;
        const passesFilter = businessRating >= minRating;
        console.log(`🔍 Business "${business.name}": rating ${businessRating}, passes filter: ${passesFilter}`);
        return passesFilter;
      });
      
      console.log('🔍 After rating filter:', { 
        remainingBusinesses: filtered.length,
        filteredBusinesses: filtered.map(b => ({ name: b.name, rating: b.rating }))
      });
    }
    
    // Sort businesses with optimized sorting
    if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }
    
    console.log('🔍 Final filtered and sorted results:', {
      totalResults: filtered.length,
      results: filtered.map(b => ({ name: b.name, rating: b.rating }))
    });
    
    return filtered;
  }, [businesses, sortBy, filterRating]);

  // Fetch businesses with optimized loading
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Only mark as searched if we have actual search parameters
        if (urlService || urlLocation || urlCategory || searchTerm.trim() || locationQuery.trim()) {
          setHasSearched(true);
        }
        
        const params = new URLSearchParams();
        params.set('status', 'active');
        if (searchTerm.trim()) params.set('search', searchTerm.trim());
        if (locationQuery.trim()) params.set('city', locationQuery.trim());
        const bt = toBusinessType(selectedCategory);
        if (bt) params.set('businessType', bt);
        params.set('limit', '50');
        
        console.log('🔍 Frontend: Search params:', {
          service: searchTerm.trim(),
          location: locationQuery.trim(),
          category: selectedCategory,
          businessType: bt
        });
        
        console.log('🔍 Frontend: Fetching from:', `${API_BASE}/business?${params.toString()}`);
        
        console.log('🔍 Frontend: Making fetch request to:', `${API_BASE}/business?${params.toString()}`);
        
        const res = await fetch(`${API_BASE}/business?${params.toString()}`, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        console.log('🔍 Frontend: Response status:', res.status, res.statusText);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('🔍 Frontend: Error response:', errorText);
          throw new Error(`HTTP ${res.status}: ${errorText || 'Failed to load services'}`);
        }
        
        const data = await res.json();
        console.log('🔍 Frontend: API Response:', data);
        
        console.log('🔍 Frontend: Raw businesses from API:', data.businesses);
        
        // Process businesses data immediately for instant text display
        const items = (data.businesses || []).map(b => {
          console.log('🔍 Processing business:', {
            name: b.businessName,
            ratingObject: b.rating,
            ratingAverage: b.rating?.average,
            ratingTotal: b.rating?.totalReviews
          });
          
          return {
          id: b._id,
          name: b.businessName,
          city: b.location?.city,
          address: b.location?.address,
          image: b.images?.logo || b.images?.cover,
          description: b.description,
          rating: b.rating?.average || 0,
          totalReviews: b.rating?.totalReviews || 0,
          type: b.businessType,
            businessType: b.businessType, // Add this field for slug generation
          phone: b.contact?.phone,
          email: b.contact?.email,
          createdAt: b.createdAt
          };
        });
        
        console.log('🔍 Frontend: Processed businesses for display:', items);
        console.log('🔍 Frontend: Number of businesses to display:', items.length);
        
        // Set businesses immediately for instant text display
        setBusinesses(items);
        
        // Keep loading state for a bit to show skeleton
        setTimeout(() => {
          setLoading(false);
          setIsInitialLoad(false);
          setIsSearching(false);
        }, 800); // Show skeleton for 800ms
        
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('🔍 Frontend: Fetch error:', e);
          if (e.name === 'TypeError' && e.message.includes('fetch')) {
            setError('Network error: Unable to connect to server. Please check if the backend is running.');
          } else {
            setError(e.message || 'Failed to load services');
          }
        }
        // Keep loading state for error cases too
        setTimeout(() => {
          setLoading(false);
          setIsInitialLoad(false);
          setIsSearching(false);
        }, 800);
      }
    };
    
    fetchData();
    
    return () => {
      controller.abort();
      // Cleanup search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, locationQuery, selectedCategory, urlService, urlLocation, urlCategory, isInitialLoad]);

  const resultsTitle = useMemo(() => {
    const parts = [];
    if (selectedCategory && selectedCategory !== 'All Categories') parts.push(selectedCategory);
    if (locationQuery.trim()) parts.push(`in ${locationQuery.trim()}`);
    if (searchTerm.trim()) parts.push(`matching "${searchTerm.trim()}"`);
    return parts.length ? parts.join(' ') : 'All Services';
  }, [searchTerm, locationQuery, selectedCategory]);

  // Function to get display name for category
  const getCategoryDisplayName = (category) => {
    const categoryNames = {
      'plumbing': 'Plumbing',
      'electrical': 'Electrical',
      'cleaning': 'Cleaning',
      'food': 'Food',
      'construction': 'Construction',
      'transport': 'Transport',
      'security': 'Security',
      'view-all': 'All'
    };
    return categoryNames[category] || category;
  };

  // Handle category filtering
  const handleCategoryFilter = (category) => {
    // Show loading state immediately when category changes
    setIsSearching(true);
    setLoading(true);
    setError(''); // Clear any previous errors
    
    if (category === 'view-all') {
      setSelectedCategory('All Categories');
      updateSearchParams(searchTerm, locationQuery, '');
    } else {
      setSelectedCategory(category);
      updateSearchParams(searchTerm, locationQuery, category);
    }
  };

  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  return (
    <div className="services-page">

      {error ? (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button 
            onClick={() => {
              console.log('🔍 Frontend: Retry button clicked, current error:', error);
              setError('');
              setLoading(true);
              setIsInitialLoad(true);
            }} 
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              marginTop: '1rem'
            }}
          >
            Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="loading-container">
          <div className="skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-subtitle"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                  <div className="skeleton-rating"></div>
                  <div className="skeleton-buttons">
                    <div className="skeleton-button"></div>
                    <div className="skeleton-button"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
              ) : sortedAndFilteredBusinesses.length === 0 ? (
          <div className="no-results">
          <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#9ca3af' }}></i>
          <h3>No services found</h3>
          <p>Try adjusting your search criteria or browse all categories</p>
            <div className="no-results-suggestions">
              <h4>Suggestions:</h4>
              <ul>
                <li>Check your spelling</li>
                <li>Try more general keywords</li>
                <li>Remove location filters</li>
                <li>Try different service categories</li>
              </ul>
            </div>
          </div>
      ) : (
        <>
          <div className="results-section">
            <div className="results-header">
              <div className="results-info">
                <div className="results-title">
                  {searchTerm ? `Search Results for "${searchTerm}"` : 
                   selectedCategory !== 'All Categories' ? getCategoryDisplayName(selectedCategory) : 'All'} Services
                </div>
                <div className="results-count">
                  {sortedAndFilteredBusinesses.length} service{sortedAndFilteredBusinesses.length !== 1 ? 's' : ''} found
                  {searchTerm && ` for "${searchTerm}"`}
                  {selectedCategory !== 'All Categories' && ` in ${getCategoryDisplayName(selectedCategory)}`}
                  {locationQuery && ` near ${locationQuery}`}
                </div>
                {/* Show location filter indicator */}
                {locationQuery && (
                  <div className="location-filter-indicator">
                    <i className="fas fa-map-marker-alt"></i>
                    Location: {locationQuery}
                    <button 
                      className="clear-location-btn"
                      onClick={() => {
                        setLocationQuery('');
                        updateSearchParams(searchTerm, '', selectedCategory);
                      }}
                      title="Clear location filter"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
                {/* Show search type indicator */}
                {searchTerm && (
                  <div className="search-type-indicator">
                    <i className="fas fa-search"></i>
                    <button 
                      className="clear-search-btn"
                      onClick={() => {
                        setSearchTerm('');
                        setLocationQuery('');
                        setSelectedCategory('All Categories');
                        updateSearchParams('', '', 'All Categories');
                      }}
                      title="Clear search and show all services"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Sort and Filter Controls - Positioned in the red box area */}
              <div className="results-sort-filter-controls">
                {/* Desktop Controls */}
                <div className="desktop-controls">
            <div className="sort-controls">
                    <label htmlFor="resultsSortBy">Sort by:</label>
              <select
                      id="resultsSortBy"
                value={sortBy}
                      onChange={(e) => {
                        const newSortBy = e.target.value;
                        console.log('🔍 Sort by changed:', { oldValue: sortBy, newValue: newSortBy });
                        setSortBy(newSortBy);
                        // Update URL with sort parameter
                        const newSearchParams = new URLSearchParams(searchParams);
                        newSearchParams.set('sort', newSortBy);
                        setSearchParams(newSearchParams);
                      }}
                      className="results-sort-select"
              >
                <option value="rating">Highest Rating</option>
                <option value="name">Alphabetically</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            
            <div className="filter-controls">
                    <label htmlFor="resultsFilterRating">Min Rating:</label>
              <select
                      id="resultsFilterRating"
                value={filterRating}
                      onChange={(e) => {
                        const newFilterRating = e.target.value;
                        console.log('🔍 Filter rating changed:', { oldValue: filterRating, newValue: newFilterRating });
                        setFilterRating(newFilterRating);
                        // Update URL with rating filter parameter
                        const newSearchParams = new URLSearchParams(searchParams);
                        newSearchParams.set('rating', newFilterRating);
                        setSearchParams(newSearchParams);
                      }}
                      className="results-filter-select"
              >
                <option value="all">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
          </div>

                {/* Mobile Filter Toggle Button */}
                <div className="mobile-filter-toggle">
                  <button 
                    className="filter-toggle-btn"
                    onClick={() => setShowFilterSidebar(true)}
                  >
                    <i className="fas fa-filter"></i>
                    <span>Filters</span>
                    <div className="active-filters-badge">
                      {(sortBy !== 'rating' || filterRating !== 'all') ? '2' : '0'}
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Mobile Filter Sidebar */}
              {showFilterSidebar && (
                <div className="filter-sidebar-overlay" onClick={() => setShowFilterSidebar(false)}>
                  <div className="filter-sidebar" onClick={(e) => e.stopPropagation()}>
                    <div className="filter-sidebar-header">
                      <h3>Filters & Sort</h3>
                      <button 
                        className="close-filter-btn"
                        onClick={() => setShowFilterSidebar(false)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    
                    <div className="filter-sidebar-content">
                      <div className="filter-section">
                        <h4>Sort By</h4>
                        <div className="filter-options">
                          <button 
                            className={`filter-option ${sortBy === 'rating' ? 'active' : ''}`}
                            onClick={() => {
                              setSortBy('rating');
                              const newSearchParams = new URLSearchParams(searchParams);
                              newSearchParams.set('sort', 'rating');
                              setSearchParams(newSearchParams);
                            }}
                          >
                            <i className="fas fa-star"></i>
                            <span>Highest Rating</span>
                            {sortBy === 'rating' && <i className="fas fa-check"></i>}
                          </button>
                          
                          <button 
                            className={`filter-option ${sortBy === 'name' ? 'active' : ''}`}
                            onClick={() => {
                              setSortBy('name');
                              const newSearchParams = new URLSearchParams(searchParams);
                              newSearchParams.set('sort', 'name');
                              setSearchParams(newSearchParams);
                            }}
                          >
                            <i className="fas fa-sort-alpha-down"></i>
                            <span>Alphabetically</span>
                            {sortBy === 'name' && <i className="fas fa-check"></i>}
                          </button>
                          
                          <button 
                            className={`filter-option ${sortBy === 'newest' ? 'active' : ''}`}
                            onClick={() => {
                              setSortBy('newest');
                              const newSearchParams = new URLSearchParams(searchParams);
                              newSearchParams.set('sort', 'newest');
                              setSearchParams(newSearchParams);
                            }}
                          >
                            <i className="fas fa-clock"></i>
                            <span>Newest First</span>
                            {sortBy === 'newest' && <i className="fas fa-check"></i>}
                          </button>
                          
                          <button 
                            className={`filter-option ${sortBy === 'oldest' ? 'active' : ''}`}
                            onClick={() => {
                              setSortBy('oldest');
                              const newSearchParams = new URLSearchParams(searchParams);
                              newSearchParams.set('sort', 'oldest');
                              setSearchParams(newSearchParams);
                            }}
                          >
                            <i className="fas fa-clock"></i>
                            <span>Oldest First</span>
                            {sortBy === 'oldest' && <i className="fas fa-check"></i>}
                          </button>
                        </div>
                      </div>
                      
                      <div className="filter-section">
                        <h4>Minimum Rating</h4>
                        <div className="filter-options">
                          <button 
                            className={`filter-option ${filterRating === 'all' ? 'active' : ''}`}
                            onClick={() => {
                              setFilterRating('all');
                              const newSearchParams = new URLSearchParams(searchParams);
                              newSearchParams.set('rating', 'all');
                              setSearchParams(newSearchParams);
                            }}
                          >
                            <i className="fas fa-star"></i>
                            <span>All Ratings</span>
                            {filterRating === 'all' && <i className="fas fa-check"></i>}
                          </button>
                          
                          <button 
                            className={`filter-option ${filterRating === '4' ? 'active' : ''}`}
                            onClick={() => {
                              setFilterRating('4');
                              const newSearchParams = new URLSearchParams(searchParams);
                              newSearchParams.set('rating', '4');
                              setSearchParams(newSearchParams);
                            }}
                          >
                            <i className="fas fa-star"></i>
                            <span>4+ Stars</span>
                            {filterRating === '4' && <i className="fas fa-check"></i>}
                          </button>
                          
                          <button 
                            className={`filter-option ${filterRating === '3' ? 'active' : ''}`}
                            onClick={() => {
                              setFilterRating('3');
                              const newSearchParams = new URLSearchParams(searchParams);
                              newSearchParams.set('rating', '3');
                              setSearchParams(newSearchParams);
                            }}
                          >
                            <i className="fas fa-star"></i>
                            <span>3+ Stars</span>
                            {filterRating === '3' && <i className="fas fa-check"></i>}
                          </button>
                          
                          <button 
                            className={`filter-option ${filterRating === '2' ? 'active' : ''}`}
                            onClick={() => {
                              setFilterRating('2');
                              const newSearchParams = new URLSearchParams(searchParams);
                              newSearchParams.set('rating', '2');
                              setSearchParams(newSearchParams);
                            }}
                          >
                            <i className="fas fa-star"></i>
                            <span>2+ Stars</span>
                            {filterRating === '2' && <i className="fas fa-check"></i>}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="filter-sidebar-footer">
                      <button 
                        className="apply-filters-btn"
                        onClick={() => setShowFilterSidebar(false)}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
            </div>
              )}
            </div>
          </div>
          
          <div className="providers-grid">
            {sortedAndFilteredBusinesses.map((p, index) => (
              <div key={p.id} className="provider-card" onClick={() => {
                  // Generate slug from business name
                  const generateSlug = (title) => {
                    if (!title) return '';
                    return title
                      .toLowerCase()
                      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
                      .replace(/\s+/g, '-') // Replace spaces with hyphens
                      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
                      .trim('-'); // Remove leading/trailing hyphens
                  };
                  
                  // Try multiple possible fields for category
                  let category = p.businessType || 
                                 p.category || 
                                 p.serviceType || 
                                 (p.services && p.services[0] && p.services[0].name) ||
                                 'other';
                  
                  // Clean up the category
                  category = category.toLowerCase().replace(/[^a-z0-9]/g, '');
                  
                  const slug = generateSlug(p.name);
                  navigate(`/business/${category}/${slug}`);
                }}>
                <div className="provider-card-header">
                  <div className="provider-avatar">
                    <div className="avatar-container">
                      {p.image ? (
                        <img 
                          className="provider-image" 
                          src={p.image} 
                          alt={p.name}
                        />
                      ) : null}
                      <span className="avatar-initials" style={{ display: p.image ? 'none' : 'flex' }}>
                        {p.name?.[0]?.toUpperCase() || 'B'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="provider-info">
                    <h3 className="provider-name" title={p.name}>{p.name}</h3>
                    <span className="provider-title">{p.type}</span>
                    <p className="provider-location">
                      <i className="fas fa-map-marker-alt"></i>
                      <span className="location-text">{p.address || p.city}</span>
                    </p>
                    {p.verification?.isVerified && (
                      <div className="verified-badge">
                        <i className="fas fa-check-circle"></i>
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="provider-description">
                  {p.description?.slice(0, 140)}{p.description?.length > 140 ? '...' : ''}
                </div>
                
                <div className="rating-section">
                  <div className="rating-container">
                    <div className="rating-badge">
                      {p.rating ? p.rating.toFixed(1) : 'N/A'}
                    </div>
                    <div>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map(s => (
                          <i key={s} className={`fas fa-star${s <= Math.round(p.rating || 0) ? ' filled' : '-o'}`}></i>
                        ))}
                      </div>
                      <div className="rating-count">
                        {p.totalReviews ? `${p.totalReviews} review${p.totalReviews !== 1 ? 's' : ''}` : 'No reviews yet'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="action-buttons">
                  {p.phone && (
                    <a 
                      className="action-button secondary-button" 
                      href={`tel:${p.phone}`} 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fas fa-phone"></i> Call Now
                    </a>
                  )}
                  <button 
                    className="action-button primary-button" 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      // Generate slug from business name
                      const generateSlug = (title) => {
                        if (!title) return '';
                        return title
                          .toLowerCase()
                          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
                          .replace(/\s+/g, '-') // Replace spaces with hyphens
                          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
                          .trim('-'); // Remove leading/trailing hyphens
                      };
                      
                      // Try multiple possible fields for category
                      let category = p.businessType || 
                                     p.category || 
                                     p.serviceType || 
                                     (p.services && p.services[0] && p.services[0].name) ||
                                     'other';
                      
                      // Clean up the category
                      category = category.toLowerCase().replace(/[^a-z0-9]/g, '');
                      
                      const slug = generateSlug(p.name);
                      navigate(`/business/${category}/${slug}`);
                    }}
                  >
                    <i className="fas fa-user"></i> View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Trust Banner - Moved to bottom after services */}
          <div className="trust-banner">
            <div className="trust-banner-content">
              <div className="trust-banner-left">
                <h2>Trusted by Thousands of Customers</h2>
                <p>Join thousands of satisfied customers who have found reliable, professional services through our platform. We connect you with verified, experienced professionals who deliver quality results.</p>
                <div className="trust-stats">
                  <div className="trust-stat">
                    <div className="stat-number">500+</div>
                    <div className="stat-label">Verified Providers</div>
                  </div>
                  <div className="trust-stat">
                    <div className="stat-number">10K+</div>
                    <div className="stat-label">Happy Customers</div>
                  </div>
                  <div className="trust-stat">
                    <div className="stat-number">4.8★</div>
                    <div className="stat-label">Average Rating</div>
                  </div>
                </div>
              </div>
              <div className="trust-banner-right">
                <div className="trust-features">
                  <div className="trust-feature">
                    <div className="feature-icon-servicesbanner">✓</div>
                    <span>Verified & Background Checked</span>
                  </div>
                  <div className="trust-feature">
                    <div className="feature-icon-servicesbanner">✓</div>
                    <span>Quality Guaranteed</span>
                  </div>
                  <div className="trust-feature">
                    <div className="feature-icon-servicesbanner">✓</div>
                    <span>24/7 Customer Support</span>
                  </div>
                  <div className="trust-feature">
                    <div className="feature-icon-servicesbanner">✓</div>
                    <span>Secure & Reliable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default Services;