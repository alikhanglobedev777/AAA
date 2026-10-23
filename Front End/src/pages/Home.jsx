import React, { useMemo, useState } from 'react';
import './Home.css';
import ServicesSection from '../components/ServicesSection';
import { Link, useNavigate } from 'react-router-dom';
import { useBusinesses } from '../hooks/useApiQueries';
import { 
  FaSearch, 
  FaStar, 
  FaUsers, 
  FaShieldAlt, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaCheckCircle,
  FaHandshake,
  FaAward,
  FaClock,
  FaHeart,
  FaQuoteLeft,
  FaArrowRight,
  FaPlay
} from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  const {
    data: featuredData,
    isLoading: loading,
    error: featuredError,
  } = useBusinesses({ status: 'active', limit: 10 });
  const error = featuredError ? 'Failed to load featured services' : '';
  const featuredServices = useMemo(() => {
    const activeBusinesses = featuredData?.businesses || [];
    if (!activeBusinesses.length) return [];

    return activeBusinesses.slice(0, 3).map(business => ({
      ...business,
      rating: business.tags?.includes('AAA_DEMO_SEED_V2') ? null : business.rating ?? null,
      totalReviews: business.tags?.includes('AAA_DEMO_SEED_V2') ? 0 : business.totalReviews || 0,
      name: business.businessName || business.name || 'Unnamed Business',
      type: business.businessType || business.type || 'Other',
      description: business.description || 'Professional service provider',
      address: business.location?.city || business.address || 'Location not specified',
      phone: business.contact?.phone || business.phone || null,
      id: business._id || business.id
    }));
  }, [featuredData, featuredError]);

  const listingCount = featuredData?.pagination?.totalBusinesses;
  const stats = [
    { number: listingCount?.toLocaleString() || 'Browse', label: 'Active listings', icon: FaUsers },
    { number: '15', label: 'Service categories', icon: FaSearch },
    { number: 'Across PK', label: 'Locations to explore', icon: FaMapMarkerAlt },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="home-hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <FaStar className="badge-icon" />
              <span>Your local service directory</span>
            </div>
            <h1 className="home-hero-title">
              Find the right service
              <span className="hero-highlight"> near you</span>
            </h1>
            <p className="hero-subtitle">
              Explore local businesses, compare services and choose who to contact.
              Check each listing’s verification status before booking.
            </p>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="home-stat-item">
                  <stat.icon className="home-stat-icon" />
                  <div className="home-stat-content">
                    <span className="home-stat-number">{stat.number}</span>
                    <span className="home-stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="hero-actions">
              <Link to="/services" className="hero-btn primary">
                <FaSearch className="btn-icon" />
                Find Services
              </Link>
              <Link to="/service-provider-signup" className="hero-btn secondary">
                Join as Provider
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-container">
              <div className="floating-card card-1">
                <FaStar className="card-icon" />
                <span>Explore services</span>
              </div>
              <div className="floating-card card-2">
                <FaUsers className="card-icon" />
                <span>Connect locally</span>
              </div>
              <div className="hero-main-image">
                {!showVideo ? (
                  <button type="button" className="image-placeholder" onClick={() => setShowVideo(true)} aria-label="Play introduction video">
                    <FaPlay className="play-icon" />
                    <span className="play-text">See how AAA works</span>
                  </button>
                ) : (
                  <div className="video-container">
                    <button 
                      className="video-close-btn" 
                      onClick={() => setShowVideo(false)}
                      title="Close video" aria-label="Close introduction video"
                    >
                      ×
                    </button>

                    <iframe
                      className="hero-video-player"
                      src="https://www.youtube.com/embed/V-Ea-vxGnuw?autoplay=1&mute=0&loop=1&playlist=V-Ea-vxGnuw&controls=1&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&fs=1"
                      title="AAA Service Directory Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose AAA Services?</h2>
            <p>A simple way to discover and compare services in your area</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <h3>Know the verification status</h3>
              <p>See which businesses are verified and which listings still require independent checks.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaClock />
              </div>
              <h3>Explore at your pace</h3>
              <p>Compare services, locations and descriptions before contacting a business.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaHandshake />
              </div>
              <h3>One place for local services</h3>
              <p>Find different service categories and businesses from a single directory.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* Featured Services Section */}
      <section className="featured-providers-section">
        <div className="container">
          <div className="section-header">
            <h2>Explore businesses</h2>
            <p>Recent active directory listings. Always review verification status before booking.</p>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading featured services...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
            </div>
          ) : featuredServices.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-star" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
              <h3>No listings available yet</h3>
              <p>Try again later or explore the service categories.</p>
            </div>
          ) : (
            <div className="providers-grid">
              {featuredServices.map(service => (
                <div key={service._id || service.id} className="provider-card" role="group" onClick={() => {
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
                  let category = service.businessType || 
                                 service.category || 
                                 service.serviceType || 
                                 (service.services && service.services[0] && service.services[0].name) ||
                                 'other';
                  
                  // Clean up the category
                  category = category.toLowerCase().replace(/[^a-z0-9]/g, '');
                  
                  const slug = generateSlug(service.businessName);
                  navigate(`/business/${category}/${slug}`);
                }}>
                  <div className="provider-card-header">
                    <div className="provider-avatar">
                      <div className="avatar-container">
                        {service.image ? (
                          <img 
                            className="provider-image" 
                            src={service.image} 
                            alt={service.name} 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'; 
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }} 
                          />
                        ) : null}
                        <span className="avatar-initials" style={{ display: service.image ? 'none' : 'flex' }}>
                          {service.name?.[0]?.toUpperCase() || 'B'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="provider-info">
                      <h3 className="provider-name" title={service.name}>{service.name}</h3>
                     
                      <p className="provider-location">
                        <i className="fas fa-map-marker-alt"></i>
                        <span className="location-text">{service.address || service.city || service.location}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="provider-description">
                    {service.description?.slice(0, 140)}{service.description?.length > 140 ? '...' : ''}
                  </div>
                  
                  <div className="rating-section">
                    <div className="rating-container">
                      <div className="rating-badge">
                        {service.totalReviews > 0 && typeof service.rating === 'number' ? service.rating.toFixed(1) : '—'}
                      </div>
                      <div>
                        <div className="rating-stars">
                          {service.totalReviews > 0 && [1, 2, 3, 4, 5].map(s => (
                            <i key={s} className={`fas fa-star${s <= Math.round(service.rating || 0) ? ' filled' : '-o'}`}></i>
                          ))}
                        </div>
                        <div className="rating-count">
                          {service.totalReviews ? `${service.totalReviews} review${service.totalReviews !== 1 ? 's' : ''}` : 'No reviews yet'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="action-buttons">
                    {service.phone && !service.tags?.includes('AAA_DEMO_SEED_V2') && (
                      <a 
                        className="action-button secondary-button" 
                        href={`tel:${service.phone}`} 
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
                        let category = service.businessType || 
                                       service.category || 
                                       service.serviceType || 
                                       (service.services && service.services[0] && service.services[0].name) ||
                                       'other';
                        
                        // Clean up the category
                        category = category.toLowerCase().replace(/[^a-z0-9]/g, '');
                        
                        const slug = generateSlug(service.businessName);
                        navigate(`/business/${category}/${slug}`);
                      }}
                    >
                      <i className="fas fa-user"></i> View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="section-footer">
            <Link to="/services" className="view-all-btn">
              View All Services <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Helpful guidance rather than fabricated customer testimonials. */}
      <section className="aa-how-section" aria-labelledby="aa-how-title">
        <div className="container">
          <div className="section-header">
            <span className="aa-eyebrow">Getting started</span>
            <h2 id="aa-how-title">A better way to find local help</h2>
            <p>Three steps from exploring to connecting.</p>
          </div>
          <div className="aa-how-grid">
            <article className="aa-how-card"><span className="aa-step">01</span><h3>Search a category</h3><p>Choose a service and filter by city to narrow the options.</p></article>
            <article className="aa-how-card"><span className="aa-step">02</span><h3>Review the details</h3><p>Read the business description and check its verification status.</p></article>
            <article className="aa-how-card"><span className="aa-step">03</span><h3>Get in touch</h3><p>Contact a provider directly when you’re ready to discuss your needs.</p></article>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Find Your Perfect Service Provider?</h2>
            <p>Explore local options and find a provider who fits your needs.</p>
            <div className="cta-buttons">
              <Link to="/services" className="cta-btn primary">
                <FaSearch className="btn-icon" />
                Start Searching
              </Link>
              <Link to="/service-provider-signup" className="cta-btn secondary">
                <FaHeart className="btn-icon" />
                Become a Provider
              </Link>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;
