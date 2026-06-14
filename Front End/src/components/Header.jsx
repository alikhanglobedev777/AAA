import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt, FaSearch, FaMapMarkerAlt, FaHome, FaStar, FaInbox, FaWrench, FaBolt, FaBroom, FaUtensils, FaHammer, FaTruck, FaShieldAlt, FaPaintRoller, FaLeaf, FaTools, FaHeartbeat, FaBook } from 'react-icons/fa';
import BusinessDropdown from './BusinessDropdown';
import BusinessAvatar from './BusinessAvatar';
import { queryKeys, useBusinesses } from '../hooks/useApiQueries';
import { fetchJson, toQueryString } from '../lib/api';
import './Header.css';
import './BusinessDropdown.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  // City suggestions state (frontend-only)
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [filteredCitySuggestions, setFilteredCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const citiesFetchedRef = useRef(false);
  // Service suggestions (popular categories)
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [filteredServiceSuggestions, setFilteredServiceSuggestions] = useState([]);
  const serviceSuggestions = [
    { key: 'plumbing', label: 'Plumbing', icon: FaWrench, aliases: ['plumber', 'pipes', 'leak'] },
    { key: 'electrical', label: 'Electrical', icon: FaBolt, aliases: ['electrician', 'wiring', 'switch'] },
    { key: 'cleaning', label: 'Cleaning', icon: FaBroom, aliases: ['maids', 'janitor', 'housekeeping'] },
    { key: 'food', label: 'Food', icon: FaUtensils, aliases: ['catering', 'chef', 'meal'] },
    { key: 'construction', label: 'Construction', icon: FaHammer, aliases: ['builder', 'contractor', 'renovation'] },
    { key: 'transport', label: 'Transport', icon: FaTruck, aliases: ['moving', 'pickup', 'delivery'] },
    { key: 'security', label: 'Security', icon: FaShieldAlt, aliases: ['guard', 'cctv', 'lock'] },
    { key: 'painting', label: 'Painting', icon: FaPaintRoller, aliases: ['painter', 'paint'] },
    { key: 'gardening', label: 'Gardening', icon: FaLeaf, aliases: ['lawn', 'plants'] },
    { key: 'maintenance', label: 'Maintenance', icon: FaTools, aliases: ['repair', 'fix'] },
    { key: 'health', label: 'Health', icon: FaHeartbeat, aliases: ['trainer', 'fitness'] },
    { key: 'education', label: 'Education', icon: FaBook, aliases: ['tutor', 'lesson', 'training'] },
  ];
  const mobileNavRef = useRef(null);
  const profileRef = useRef(null);
  const overlayRef = useRef(null);
  const desktopServiceWrapperRef = useRef(null);
  const desktopLocationWrapperRef = useRef(null);
  const mobileServiceWrapperRef = useRef(null);
  const mobileLocationWrapperRef = useRef(null);
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const isBusiness = user?.userType === 'business';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const citiesQuery = useBusinesses(
    { status: 'active', limit: 500 },
    { enabled: false }
  );

  const prefetchCategory = useCallback((businessType = '') => {
    const params = { status: 'active', businessType, limit: 50 };
    const queryString = toQueryString(params);

    queryClient.prefetchQuery({
      queryKey: queryKeys.businesses(params),
      queryFn: ({ signal }) => fetchJson(`/business?${queryString}`, { signal }),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);
  
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when route changes
  const location_route = useLocation();
  const currentCategory = new URLSearchParams(location_route.search).get('category');

  const isPathActive = useCallback((path, exact = false) => {
    const currentPath = location_route.pathname;

    if (path === '/') {
      return currentPath === '/' || currentPath === '/home';
    }

    return exact ? currentPath === path : currentPath === path || currentPath.startsWith(`${path}/`);
  }, [location_route.pathname]);

  const isCategoryActive = useCallback((category) => {
    if (location_route.pathname !== '/services') return false;
    return category === 'view-all' ? !currentCategory || currentCategory === 'view-all' : currentCategory === category;
  }, [currentCategory, location_route.pathname]);

  const navClassName = useCallback((path, baseClass = 'nav-link', exact = false) => (
    `${baseClass}${isPathActive(path, exact) ? ' active' : ''}`
  ), [isPathActive]);

  const categoryClassName = useCallback((category) => (
    `category-link${isCategoryActive(category) ? ' active' : ''}`
  ), [isCategoryActive]);

  useEffect(() => {
    closeMobileMenu();
  }, [location_route, closeMobileMenu]);

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    const success = logout();
    setShowProfileDropdown(false);
    closeMobileMenu();
    
    if (success) {
      navigate('/', { replace: true });
    }
  };

  // ===== Service suggestions logic =====
  const openServiceSuggestions = useCallback(() => {
    setShowServiceSuggestions(true);
    // Show all popular categories initially
    setFilteredServiceSuggestions(serviceSuggestions);
  }, [serviceSuggestions]);

  const handleServiceInputChange = useCallback((e) => {
    const value = e.target.value;
    setServiceName(value);
    setSelectedCategory('');
    setShowServiceSuggestions(true);
    const v = value.trim().toLowerCase();
    if (!v) {
      setFilteredServiceSuggestions(serviceSuggestions);
    } else {
      const filtered = serviceSuggestions.filter(s => {
        const hay = [s.label, ...(s.aliases || []), s.key].join(' ').toLowerCase();
        return hay.includes(v);
      });
      setFilteredServiceSuggestions(filtered);
    }
  }, [serviceSuggestions]);

  const handleSelectServiceCategory = useCallback((item) => {
    setServiceName(item.label);
    setSelectedCategory(item.key);
    setShowServiceSuggestions(false);
  }, []);

  const fetchCitiesOnce = useCallback(async () => {
    if (citiesFetchedRef.current) return;
    try {
      setLoadingCities(true);
      const data = citiesQuery.data || (await citiesQuery.refetch()).data;
      const businesses = Array.isArray(data?.businesses) ? data.businesses : [];
      const seen = new Map();
      for (const b of businesses) {
        const c = b?.location?.city;
        if (c && typeof c === 'string') {
          const key = c.trim().toLowerCase();
          if (key && !seen.has(key)) seen.set(key, c.trim());
        }
      }
      const cities = Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
      setCitySuggestions(cities);
      setFilteredCitySuggestions(cities.slice(0, 10));
      citiesFetchedRef.current = true;
    } catch (e) {
      // Silently fail; UI will just not show suggestions
    } finally {
      setLoadingCities(false);
    }
  }, [citiesQuery]);

  const handleLocationFocus = useCallback(async () => {
    setShowCitySuggestions(true);
    await fetchCitiesOnce();
    // On focus, show top suggestions if no input
    if (!location.trim() && citySuggestions.length > 0) {
      setFilteredCitySuggestions(citySuggestions.slice(0, 10));
    }
  }, [fetchCitiesOnce, location, citySuggestions]);

  const handleLocationInputChange = useCallback((e) => {
    const value = e.target.value;
    setLocation(value);
    setShowCitySuggestions(true);
    if (!value.trim()) {
      setFilteredCitySuggestions(citySuggestions.slice(0, 10));
    } else {
      const v = value.toLowerCase();
      const filtered = citySuggestions.filter(c => c.toLowerCase().includes(v)).slice(0, 10);
      setFilteredCitySuggestions(filtered);
    }
  }, [citySuggestions]);

  const handleSelectCity = useCallback((city) => {
    setLocation(city);
    setShowCitySuggestions(false);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (serviceName.trim() || location.trim() || selectedCategory) {
      const searchParams = new URLSearchParams();
      if (selectedCategory) {
        searchParams.append('category', selectedCategory);
      } else if (serviceName.trim()) {
        searchParams.append('service', serviceName.trim());
      }
      if (location.trim()) searchParams.append('location', location.trim());
      
      // Clear any existing category filter when searching globally
      // This ensures search works across all categories
      navigate(`/services?${searchParams.toString()}`);
      
      // Don't clear the search inputs - let user keep their search terms
      // They can manually clear them if they want to
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target) && !event.target.closest('.hamburger-btn')) {
        closeMobileMenu();
      }
      // Close city suggestions if clicking outside both wrappers
      const inDesktop = desktopLocationWrapperRef.current && desktopLocationWrapperRef.current.contains(event.target);
      const inMobile = mobileLocationWrapperRef.current && mobileLocationWrapperRef.current.contains(event.target);
      if (!inDesktop && !inMobile) {
        setShowCitySuggestions(false);
      }
      // Close service suggestions if clicking outside both wrappers
      const inDeskSvc = desktopServiceWrapperRef.current && desktopServiceWrapperRef.current.contains(event.target);
      const inMobSvc = mobileServiceWrapperRef.current && mobileServiceWrapperRef.current.contains(event.target);
      if (!inDeskSvc && !inMobSvc) {
        setShowServiceSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMobileMenu]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target)) {
        closeMobileMenu();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <header className="header">
      {/* Main Header */}
      <div className="main-header">
        <div className="header-container">
          {/* Logo on the left */}
          <div className="logo-container">
            <Link to="/" className="logo-link" onClick={closeMobileMenu}>
              <img 
                src="/favicon_transbg.png" 
                alt="AAA Logo" 
                className="logo-img" 
                loading="eager"
              />
            </Link>
          </div>

          {/* Search Bar in center */}
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-inputs">
                <div className="search-input-wrapper" ref={desktopServiceWrapperRef}>
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={serviceName}
                    onFocus={openServiceSuggestions}
                    onChange={handleServiceInputChange}
                    className="search-input"
                  />
                  {showServiceSuggestions && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        maxHeight: '320px',
                        overflowY: 'auto'
                      }}
                    >
                      {filteredServiceSuggestions.length > 0 ? (
                        filteredServiceSuggestions.map((item, idx) => {
                          const Icon = item.icon || FaTools;
                          return (
                            <div
                              key={`${item.key}-${idx}`}
                              onMouseDown={(e) => { e.preventDefault(); handleSelectServiceCategory(item); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 14px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f0f0f0'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <Icon style={{ color: '#006400' }} />
                              <span style={{ color: '#333', fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ padding: 12, color: '#666', fontSize: 14, fontStyle: 'italic' }}>No suggestions</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="search-input-wrapper" ref={desktopLocationWrapperRef}>
                  <FaMapMarkerAlt className="search-icon" />
                  <input
                    type="text"
                    placeholder="Enter your location"
                    value={location}
                    onFocus={handleLocationFocus}
                    onChange={handleLocationInputChange}
                    className="search-input"
                  />
                  {showCitySuggestions && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}
                    >
                      {loadingCities ? (
                        <div style={{ padding: 12, color: '#666', fontSize: 14 }}>Loading cities...</div>
                      ) : (filteredCitySuggestions.length > 0 ? (
                        filteredCitySuggestions.map((c, idx) => (
                          <div
                            key={`${c}-${idx}`}
                            onMouseDown={(e) => { e.preventDefault(); handleSelectCity(c); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 14px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <FaMapMarkerAlt style={{ color: '#006400' }} />
                            <span style={{ color: '#333', fontSize: 14, fontWeight: 500 }}>{c}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: 12, color: '#666', fontSize: 14, fontStyle: 'italic' }}>No cities available</div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button type="submit" className="search-button">
                  <FaSearch className="search-btn-icon" />
                </button>
              </div>
            </form>
          </div>

          {/* Right side - user actions */}
          <div className="header-right">
            <div className="desktop-actions">
              <BusinessDropdown 
                isAuthenticated={isAuthenticated} 
                user={user} 
                onLogout={handleLogout}
                isMobile={false}
              />
              <Link to="/reviews" className={navClassName('/reviews', 'action-link', true)}>Write a Review</Link>
              <Link to="/complaint" className={navClassName('/complaint', 'action-link', true)}>File a Complaint</Link>
            </div>
            
            {isAuthenticated ? (
              <div className="profile-container" ref={profileRef}>
                <button 
                  className="profile-btn" 
                  onClick={toggleProfileDropdown}
                  aria-expanded={showProfileDropdown}
                  aria-label="Profile menu"
                >
                  <BusinessAvatar
                    businessName={user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
                    imageUrl={user?.profilePicture}
                    size="small"
                    className="profile-pic"
                  />
                  <span className="profile-name">
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Profile'}
                  </span>
                </button>
                
                {showProfileDropdown && (
                  <div className="dropdown-menu">
                    <Link 
                      to={isBusiness ? "/business/dashboard" : "/customer-dashboard"} 
                      className={navClassName(isBusiness ? "/business/dashboard" : "/customer-dashboard", 'dropdown-item')} 
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <FaHome /> Dashboard
                    </Link>
                    <Link 
                      to={isBusiness ? "/business/profile" : "/profile"} 
                      className={navClassName(isBusiness ? "/business/profile" : "/profile", 'dropdown-item')} 
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <FaUserCircle /> View Profile
                    </Link>
                    <Link 
                      to={isBusiness ? "/business/inbox" : "/customer-dashboard?tab=reviews"} 
                      className="dropdown-item" 
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <FaStar /> {isBusiness ? "Inbox" : "My Reviews"}
                    </Link>
                    {!isBusiness && (
                      <Link 
                        to="/customer-dashboard?tab=messages" 
                        className="dropdown-item" 
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaInbox /> Inbox
                      </Link>
                    )}
                    <button 
                      className="dropdown-item logout-item" 
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className={navClassName('/login', 'login-btn', true)}>Log In</Link>
                <Link to="/signup" className={navClassName('/signup', 'signup-btn', true)}>Sign Up</Link>
              </div>
            )}
            
            <div className="hamburger-menu">
              <button
                className={`hamburger-btn ${isMobileMenuOpen ? 'active' : ''}` }
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile navigation"
              >
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="category-nav">
        <div className="category-container">
          <div className="category-links">
            <Link to="/services?category=plumbing" className={categoryClassName('plumbing')} onMouseEnter={() => prefetchCategory('plumbing')} onFocus={() => prefetchCategory('plumbing')}>Plumbing</Link>
            <Link to="/services?category=electrical" className={categoryClassName('electrical')} onMouseEnter={() => prefetchCategory('electrical')} onFocus={() => prefetchCategory('electrical')}>Electrical</Link>
            <Link to="/services?category=cleaning" className={categoryClassName('cleaning')} onMouseEnter={() => prefetchCategory('cleaning')} onFocus={() => prefetchCategory('cleaning')}>Cleaning</Link>
            <Link to="/services?category=food" className={categoryClassName('food')} onMouseEnter={() => prefetchCategory('food')} onFocus={() => prefetchCategory('food')}>Food</Link>
            <Link to="/services?category=construction" className={categoryClassName('construction')} onMouseEnter={() => prefetchCategory('construction')} onFocus={() => prefetchCategory('construction')}>Construction</Link>
            <Link to="/services?category=transport" className={categoryClassName('transport')} onMouseEnter={() => prefetchCategory('transport')} onFocus={() => prefetchCategory('transport')}>Transport</Link>
            <Link to="/services?category=security" className={categoryClassName('security')} onMouseEnter={() => prefetchCategory('security')} onFocus={() => prefetchCategory('security')}>Security</Link>
            <Link to="/services" className={categoryClassName('view-all')} onMouseEnter={() => prefetchCategory()} onFocus={() => prefetchCategory()}>View All</Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`} ref={mobileNavRef}>
        <div className="mobile-menu">
          <div className="mobile-nav-header">
            <div className="logo-container">
              <Link to="/" className="logo-link" onClick={closeMobileMenu}>
                <img src="/favicon_transbg.png" alt="AAA Logo" className="logo-img" />
              </Link>
            </div>
            <button className="close-btn" onClick={closeMobileMenu}>
              ×
            </button>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="mobile-search-section">
            <form onSubmit={handleSearch} className="mobile-search-form">
              <div className="mobile-search-inputs">
                <div className="mobile-search-input-wrapper" ref={mobileServiceWrapperRef}>
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={serviceName}
                    onFocus={openServiceSuggestions}
                    onChange={handleServiceInputChange}
                    className="mobile-search-input"
                  />
                  {showServiceSuggestions && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        maxHeight: '320px',
                        overflowY: 'auto'
                      }}
                    >
                      {filteredServiceSuggestions.length > 0 ? (
                        filteredServiceSuggestions.map((item, idx) => {
                          const Icon = item.icon || FaTools;
                          return (
                            <div
                              key={`${item.key}-m-${idx}`}
                              onMouseDown={(e) => { e.preventDefault(); handleSelectServiceCategory(item); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 14px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f0f0f0'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <Icon style={{ color: '#006400' }} />
                              <span style={{ color: '#333', fontSize: 16, fontWeight: 500 }}>{item.label}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ padding: 12, color: '#666', fontSize: 14, fontStyle: 'italic' }}>No suggestions</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mobile-search-input-wrapper" ref={mobileLocationWrapperRef}>
                  <FaMapMarkerAlt className="search-icon" />
                  <input
                    type="text"
                    placeholder="Enter your location"
                    value={location}
                    onFocus={handleLocationFocus}
                    onChange={handleLocationInputChange}
                    className="mobile-search-input"
                  />
                  {showCitySuggestions && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}
                    >
                      {loadingCities ? (
                        <div style={{ padding: 12, color: '#666', fontSize: 14 }}>Loading cities...</div>
                      ) : (filteredCitySuggestions.length > 0 ? (
                        filteredCitySuggestions.map((c, idx) => (
                          <div
                            key={`${c}-m-${idx}`}
                            onMouseDown={(e) => { e.preventDefault(); handleSelectCity(c); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 14px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <FaMapMarkerAlt style={{ color: '#006400' }} />
                            <span style={{ color: '#333', fontSize: 16, fontWeight: 500 }}>{c}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: 12, color: '#666', fontSize: 14, fontStyle: 'italic' }}>No cities available</div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button type="submit" className="mobile-search-button">
                  <FaSearch className="search-btn-icon" />
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>
          
          <div className="mobile-nav-links">
            <Link to="/" className={navClassName('/')} onClick={closeMobileMenu}>Home</Link>
            <Link to="/services?category=plumbing" className={`nav-link${isCategoryActive('plumbing') ? ' active' : ''}`} onPointerDown={() => prefetchCategory('plumbing')} onClick={closeMobileMenu}>Plumbing</Link>
            <Link to="/services?category=electrical" className={`nav-link${isCategoryActive('electrical') ? ' active' : ''}`} onPointerDown={() => prefetchCategory('electrical')} onClick={closeMobileMenu}>Electrical</Link>
            <Link to="/services?category=cleaning" className={`nav-link${isCategoryActive('cleaning') ? ' active' : ''}`} onPointerDown={() => prefetchCategory('cleaning')} onClick={closeMobileMenu}>Cleaning</Link>
            <Link to="/services?category=food" className={`nav-link${isCategoryActive('food') ? ' active' : ''}`} onPointerDown={() => prefetchCategory('food')} onClick={closeMobileMenu}>Food</Link>
            <Link to="/services?category=construction" className={`nav-link${isCategoryActive('construction') ? ' active' : ''}`} onPointerDown={() => prefetchCategory('construction')} onClick={closeMobileMenu}>Construction</Link>
            <Link to="/services?category=transport" className={`nav-link${isCategoryActive('transport') ? ' active' : ''}`} onPointerDown={() => prefetchCategory('transport')} onClick={closeMobileMenu}>Transport</Link>
            <Link to="/services?category=security" className={`nav-link${isCategoryActive('security') ? ' active' : ''}`} onPointerDown={() => prefetchCategory('security')} onClick={closeMobileMenu}>Security</Link>
            <Link to="/services" className={`nav-link${isCategoryActive('view-all') ? ' active' : ''}`} onPointerDown={() => prefetchCategory()} onClick={closeMobileMenu}>View All</Link>
            <Link to="/service-categories" className={navClassName('/service-categories', 'nav-link', true)} onClick={closeMobileMenu}>Service Categories</Link>
            
            {isAuthenticated && isBusiness && (
              <Link to="/business/dashboard" className={navClassName('/business/dashboard')} onClick={closeMobileMenu}>Dashboard</Link>
            )}
            
            <Link to="/about" className={navClassName('/about', 'nav-link', true)} onClick={closeMobileMenu}>About Us</Link>
            <Link to="/contact" className={navClassName('/contact', 'nav-link', true)} onClick={closeMobileMenu}>Contact</Link>
            <Link to="/reviews" className={navClassName('/reviews', 'nav-link', true)} onClick={closeMobileMenu}>Write a Review</Link>
            <Link to="/complaint" className={navClassName('/complaint', 'nav-link', true)} onClick={closeMobileMenu}>File a Complaint</Link>
            
            <BusinessDropdown 
              isAuthenticated={isAuthenticated} 
              user={user} 
              onLogout={handleLogout}
              isMobile={true}
              closeMobileMenu={closeMobileMenu}
            />
            
            {isAuthenticated ? (
              <div className="profile-mobile-options">
                <div className="mobile-user-info">
                  <BusinessAvatar
                    businessName={user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
                    imageUrl={user?.profilePicture}
                    size="small"
                    className="mobile-profile-pic"
                  />
                  <span className="mobile-user-name">
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Profile'}
                  </span>
                </div>
                <Link to={isBusiness ? "/business/dashboard" : "/customer-dashboard"} className={navClassName(isBusiness ? "/business/dashboard" : "/customer-dashboard")} onClick={closeMobileMenu}>
                  <FaHome className="mobile-nav-icon" /> Dashboard
                </Link>
                <Link to={isBusiness ? "/business/profile" : "/profile"} className={navClassName(isBusiness ? "/business/profile" : "/profile")} onClick={closeMobileMenu}>
                  <FaUserCircle className="mobile-nav-icon" /> View Profile
                </Link>
                <Link to={isBusiness ? "/business/inbox" : "/customer-dashboard?tab=reviews"} className="nav-link" onClick={closeMobileMenu}>
                  <FaStar className="mobile-nav-icon" /> {isBusiness ? "Inbox" : "My Reviews"}
                </Link>
                {!isBusiness && (
                  <Link to="/customer-dashboard?tab=messages" className="nav-link" onClick={closeMobileMenu}>
                    <FaInbox className="mobile-nav-icon" /> Inbox
                  </Link>
                )}
                <button onClick={handleLogout} className="nav-link logout-item">
                  <FaSignOutAlt className="mobile-nav-icon" /> Logout
                </button>
              </div>
            ) : (
              <div className="mobile-auth-buttons">
                <Link to="/login" className={navClassName('/login', 'nav-link', true)} onClick={closeMobileMenu}>Log In</Link>
                <Link to="/signup" className={navClassName('/signup', 'nav-link', true)} onClick={closeMobileMenu}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        ref={overlayRef}
        className={`mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />
    </header>
  );
};

export default Header;
