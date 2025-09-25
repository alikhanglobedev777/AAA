import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBolt, FaBroom, FaPaintBrush, FaSeedling, 
  FaWrench, FaTruck, FaShieldAlt, FaGraduationCap, FaUtensils,
  FaHeart, FaHammer, FaCogs, FaCar, FaPaw, FaBug, FaCog,
  FaBriefcase, FaTools, FaHome, FaBuilding, FaIndustry,
  FaLeaf, FaSnowflake, FaFire, FaWater, FaLightbulb, FaSink
} from 'react-icons/fa';
import { MdCleaningServices, MdLocalShipping, MdSecurity, MdSchool, MdRestaurant, MdHealthAndSafety, MdConstruction, MdBuild, MdDirectionsCar, MdPets, MdPestControl, MdOtherHouses } from 'react-icons/md';
import { GiLaurelCrown, GiCarpentry, GiCementMixer, GiCookingPot, GiDeliveryDrone, GiGymBag, GiMedicalPack, GiOfficeChair, GiPencilRuler, GiSewingMachine, GiSofa, GiTruck } from 'react-icons/gi';
import { BiCar, BiHome, BiBuilding, BiCog, BiWrench, BiPaint, BiClean, BiGarden, BiRepair, BiTransport, BiSecurity, BiEducation, BiFood, BiBeauty, BiHealth, BiConstruction, BiMaintenance } from 'react-icons/bi';
import './ServiceCategories.css';

const ServiceCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Comprehensive list of service categories with icons
  const allCategories = [
    {
      id: 'plumbing',
      name: 'Plumbing Services',
      description: 'Professional plumbing installation, repair, and maintenance services',
      icon: FaSink,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%)',
      businessCount: 0
    },
    {
      id: 'electrical',
      name: 'Electrical Services',
      description: 'Electrical installation, wiring, and electrical system maintenance',
      icon: FaBolt,
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFD54F 100%)',
      businessCount: 0
    },
    {
      id: 'cleaning',
      name: 'Cleaning Services',
      description: 'Professional cleaning for homes, offices, and commercial spaces',
      icon: FaBroom,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'painting',
      name: 'Painting Services',
      description: 'Interior and exterior painting, wall treatments, and finishes',
      icon: FaPaintBrush,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #F1F8E9 0%, #AED581 100%)',
      businessCount: 0
    },
    {
      id: 'gardening',
      name: 'Gardening & Landscaping',
      description: 'Landscape design, garden maintenance, and outdoor beautification',
      icon: FaSeedling,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #F1F8E9 0%, #AED581 100%)',
      businessCount: 0
    },
    {
      id: 'repair',
      name: 'Repair & Maintenance',
      description: 'General repair services for homes and appliances',
      icon: FaWrench,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'transport',
      name: 'Transport Services',
      description: 'Moving, delivery, and transportation solutions',
      icon: FaTruck,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'security',
      name: 'Security Services',
      description: 'Security systems, guards, and safety solutions',
      icon: FaShieldAlt,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'education',
      name: 'Education & Training',
      description: 'Tutoring, courses, and professional development',
      icon: FaGraduationCap,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'food',
      name: 'Food & Catering',
      description: 'Restaurant services, catering, and food delivery',
      icon: FaUtensils,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'beauty',
      name: 'Beauty & Personal Care',
      description: 'Salon services, spa treatments, and personal grooming',
      icon: GiLaurelCrown,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'health',
      name: 'Health & Medical',
      description: 'Healthcare services, fitness training, and wellness',
      icon: FaHeart,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'construction',
      name: 'Construction Services',
      description: 'Building construction, renovation, and project management',
      icon: FaHammer,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'maintenance',
      name: 'Maintenance Services',
      description: 'Preventive maintenance and facility management',
      icon: FaCogs,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'automotive',
      name: 'Automotive Services',
      description: 'Car repair, maintenance, and automotive solutions',
      icon: FaCar,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'pets',
      name: 'Pet Services',
      description: 'Pet grooming, veterinary care, and pet care services',
      icon: FaPaw,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'pest-control',
      name: 'Pest Control',
      description: 'Pest elimination and prevention services',
      icon: FaBug,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'it-technology',
      name: 'IT & Technology',
      description: 'Computer repair, IT support, and technology services',
      icon: FaCog,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'business',
      name: 'Business Services',
      description: 'Consulting, accounting, and professional services',
      icon: FaBriefcase,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    },
    {
      id: 'other',
      name: 'Other Services',
      description: 'Specialized and miscellaneous service categories',
      icon: FaCog,
      color: '#228B22',
      gradient: 'linear-gradient(135deg, #E8F5E8 0%, #81C784 100%)',
      businessCount: 0
    }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch('http://localhost:5000/api/service-categories');
        if (response.ok) {
          const data = await response.json();
          if (data.categories && Array.isArray(data.categories)) {
            // Merge API data with our predefined categories
            const mergedCategories = allCategories.map(cat => {
              const apiCat = data.categories.find(api => 
                api.slug === cat.id || api.name.toLowerCase().includes(cat.id)
              );
              return {
                ...cat,
                businessCount: apiCat?.businessCount || 0,
                description: apiCat?.description || cat.description,
                icon: apiCat?.icon ? getIconFromString(apiCat.icon) : cat.icon
              };
            });
            setCategories(mergedCategories);
          } else {
            setCategories(allCategories);
          }
        } else {
          setCategories(allCategories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories(allCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getIconFromString = (iconString) => {
    // Map icon strings to actual icon components
    const iconMap = {
      'fas fa-sink': FaSink,
      'fas fa-bolt': FaBolt,
      'fas fa-broom': FaBroom,
      'fas fa-paint-brush': FaPaintBrush,
      'fas fa-seedling': FaSeedling,
      'fas fa-wrench': FaWrench,
      'fas fa-truck': FaTruck,
      'fas fa-shield-alt': FaShieldAlt,
      'fas fa-graduation-cap': FaGraduationCap,
      'fas fa-utensils': FaUtensils,
      'fas fa-heart': FaHeart,
      'fas fa-hammer': FaHammer,
      'fas fa-cogs': FaCogs,
      'fas fa-car': FaCar,
      'fas fa-paw': FaPaw,
      'fas fa-bug': FaBug,
      'fas fa-cog': FaCog,
      'fas fa-briefcase': FaBriefcase,
      'fas fa-tools': FaTools,
      'fas fa-home': FaHome,
      'fas fa-building': FaBuilding,
      'fas fa-industry': FaIndustry,
      'fas fa-leaf': FaLeaf,
      'fas fa-snowflake': FaSnowflake,
      'fas fa-fire': FaFire,
      'fas fa-water': FaWater,
      'fas fa-lightbulb': FaLightbulb
    };
    return iconMap[iconString] || FaCog;
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryClick = (category) => {
    navigate(`/services?category=${category.id}`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="service-categories-page">
        <div className="categories-hero">
          <div className="hero-content">
            <h1>Service Categories</h1>
            <p>Loading service categories...</p>
          </div>
        </div>
        <div className="categories-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading service categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-categories-page">
      {/* Hero Section */}
      <div className="categories-hero">
        <div className="hero-content">
          <h1>Service Categories</h1>
          <p>Discover all available service categories and find the perfect service provider for your needs</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="category-search-section">
        <div className="category-search-container">
          <div className="service-categories-search-input-wrapper">
            <input
              type="text"
              placeholder="Search service categories..."
              value={searchTerm}
              onChange={handleSearch}
              className="service-categories-search-input"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="service-categories-clear-search-btn">
                <span>×</span>
              </button>
            )}
          </div>
          <div className="search-info">
            <span>{filteredCategories.length} categories available</span>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="categories-container">
        <div className="categories-grid">
          {filteredCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.id}
                className="category-card"
                onClick={() => handleCategoryClick(category)}
                style={{ background: category.gradient }}
              >
                <div className="category-icon">
                  <IconComponent size={32} color={category.color} />
                </div>
                <div className="category-content">
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-description">{category.description}</p>
                  <div className="category-meta">
                    <span className="business-count">
                      {category.businessCount} businesses
                    </span>
                    <span className="view-services">View Services →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">
              <FaCog />
            </div>
            <h3>No categories found</h3>
            <p>Try adjusting your search terms</p>
            <button onClick={clearSearch} className="service-categories-clear-search-btn">
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Can't find what you're looking for?</h2>
          <p>If you need a specific service that's not listed, contact us and we'll help you find the right provider.</p>
          <div className="cta-buttons">
            <button 
              onClick={() => navigate('/contact')}
              className="cta-btn primary"
            >
              Contact Us
            </button>
            <button 
              onClick={() => navigate('/service-provider-signup')}
              className="cta-btn secondary"
            >
              Register Your Business
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCategories;
