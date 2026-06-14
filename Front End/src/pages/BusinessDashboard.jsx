import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaChartLine, 
  FaUsers, 
  FaStar, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaCog, 
  FaSignOutAlt, 
  FaEnvelope, 
  FaBell, 
  FaDollarSign,
  FaInbox,
  FaTimes,
  FaBars,
  FaClock,
  FaGlobe,
  FaMapMarkerAlt,
  FaPhone,
  FaEdit,
  FaSave,
  FaTrash,
  FaPlus,
  FaEye,
  FaEyeSlash,
  FaComments
} from 'react-icons/fa';
import { FaCloudUploadAlt, FaImage } from 'react-icons/fa';
import { BsGraphUp } from 'react-icons/bs';
import { MdOutlineRateReview, MdBusiness } from 'react-icons/md';
import BusinessMessagingDashboard from '../components/BusinessMessagingDashboard';
import './BusinessDashboard.css';

const BusinessDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);
  const [autoCollapseSidebar] = useState(true); // hover-to-expand behavior
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.classList.toggle('sidebar-visible', !isMobileMenuOpen);
  };
  
  // Close mobile menu when a nav item is clicked
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'inbox') {
      navigate('/business/inbox');
    } else {
      navigate('/business/dashboard');
    }
    if (window.innerWidth < 992) {
      setIsMobileMenuOpen(false);
      document.body.classList.remove('sidebar-visible');
    }
  };

  const [stats, setStats] = useState({
    totalBookings: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    newMessages: 0,
    upcomingAppointments: [],
    totalServices: 0,
    serviceArea: 'Not Set',
    verificationStatus: 'Pending'
  });

  // My Business management state
  const [myBusiness, setMyBusiness] = useState(null);
  const [bizLoading, setBizLoading] = useState(false);
  const [bizSaving, setBizSaving] = useState(false);
  const [bizError, setBizError] = useState('');
  const [bizSuccess, setBizSuccess] = useState('');
  const [reviews, setReviews] = useState({ items: [], loading: false, error: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreviews, setImagePreviews] = useState({ logo: '', cover: '', gallery: [] });
  const [showBusinessHours, setShowBusinessHours] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const formRef = useRef(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyUploading, setVerifyUploading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [docInputs, setDocInputs] = useState({ license: null, governmentId: null, supporting: [] });

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      reject(new Error(`File size too large. Maximum allowed size is 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`));
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      // Compress the image if it's larger than 1MB
      if (file.size > 1024 * 1024) { // 1MB
        compressImage(reader.result, file.type, 0.7, 800).then(resolve).catch(reject);
      } else {
        resolve(reader.result);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Image compression function
  const compressImage = (dataUrl, fileType, quality = 0.7, maxWidth = 800) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        try {
          const compressedDataUrl = canvas.toDataURL(fileType, quality);
          resolve(compressedDataUrl);
        } catch (error) {
          reject(new Error('Failed to compress image'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  };

  // Load unread messages count (no sample stats)
  useEffect(() => {
    const updateUnread = () => {
      try {
        const inquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
        const unread = inquiries.filter(inquiry => !inquiry.isRead).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error loading unread messages:', error);
      }
    };

    updateUnread();
    window.addEventListener('storage', updateUnread);
    return () => window.removeEventListener('storage', updateUnread);
  }, []);

  // Update stats when business data changes
  useEffect(() => {
    if (myBusiness) {
      setStats(prev => ({
        ...prev,
        totalServices: myBusiness.services?.length || 0,
        serviceArea: myBusiness.location?.city || 'Not Set',
        averageRating: myBusiness.rating?.average || 0,
        verificationStatus: myBusiness.verification?.isVerified ? 'Verified' : 'Pending'
      }));

      // Calculate profile completion
      const fields = [
        myBusiness.businessName,
        myBusiness.businessType,
        myBusiness.description,
        myBusiness.contact?.phone,
        myBusiness.contact?.email,
        myBusiness.location?.address,
        myBusiness.location?.city,
        myBusiness.images?.logo,
        myBusiness.images?.cover,
      ];
      const completed = fields.filter(Boolean).length;
      const pct = Math.round((completed / fields.length) * 100);
      setProfileCompletion(pct);
    }
  }, [myBusiness]);

  // Load "My Business" when tab becomes active
  useEffect(() => {
    const fetchMyBusiness = async () => {
      try {
        setBizLoading(true);
        setBizError('');
        setBizSuccess('');
        const res = await fetch('http://localhost:5000/api/business/owner/my-business', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load business');
        setMyBusiness(data.business);
      } catch (err) {
        setMyBusiness(null);
        setBizError(err.message || 'Failed to load business');
      } finally {
        setBizLoading(false);
      }
    };

    // Load business data immediately when component mounts, not just when tab is active
    fetchMyBusiness();
  }, []); // Remove activeTab dependency so it loads once on mount

  // Load reviews once the business is available
  useEffect(() => {
    const loadReviews = async () => {
      if (!myBusiness?._id) return;
      try {
        setReviews(prev => ({ ...prev, loading: true, error: '' }));
        const res = await fetch(`http://localhost:5000/api/reviews/business/${myBusiness._id}?limit=10`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load reviews');
        setReviews({ items: data.reviews || [], loading: false, error: '' });
        // Update stats rating dynamically from business
        setStats(s => ({
          ...s,
          averageRating: myBusiness?.rating?.average || 0
        }));
      } catch (err) {
        setReviews({ items: [], loading: false, error: err.message || 'Failed to load reviews' });
      }
    };
    
    // Load reviews immediately when business data is available
    loadReviews();
  }, [myBusiness]); // This will trigger whenever myBusiness changes

  const handleLogout = () => {
    logout();
    navigate('/business/login');
  };

  const computeStatusBadge = (business) => {
    if (!business) return { label: 'Unverified', cls: 'status-unverified', icon: '❌' };
    if (business.verification?.isVerified) return { label: 'Verified', cls: 'status-verified', icon: '✅' };
    if (business.status === 'pending' && (business.verification?.documents || []).length > 0) return { label: 'Pending Review', cls: 'status-pending', icon: '⏳' };
    return { label: 'Unverified', cls: 'status-unverified', icon: '❌' };
  };

  // Compress image before converting to data URL for verification docs
  const compressImageForVerification = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const toDataUrlForVerification = async (file) => {
    // If it's an image, compress it first
    if (file.type.startsWith('image/')) {
      const compressedBlob = await compressImageForVerification(file);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
      });
    }
    
    // For non-images, convert directly
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const submitVerification = async (e) => {
    e.preventDefault();
    if (!myBusiness?._id) return;
    try {
      setVerifyUploading(true);
      setVerifyMsg('');
      setVerifyError('');

      const payload = { supporting: [] };
      if (docInputs.license instanceof File) payload.license = await toDataUrlForVerification(docInputs.license);
      if (docInputs.governmentId instanceof File) payload.governmentId = await toDataUrlForVerification(docInputs.governmentId);
      if (Array.isArray(docInputs.supporting)) {
        for (const f of docInputs.supporting) {
          if (f instanceof File) payload.supporting.push(await toDataUrlForVerification(f));
        }
      }

      console.log('Submitting verification docs to:', `http://localhost:5000/api/business/verification-docs`);
      console.log('Payload:', { businessId: myBusiness._id, ...payload });
      
      // Add cache-busting parameter to prevent browser caching issues
      const res = await fetch(`http://localhost:5000/api/business/verification-docs?t=${Date.now()}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ businessId: myBusiness._id, ...payload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      
      console.log('✅ Document upload successful:', data);
      console.log('🔍 Updated business data:', data.business);
      
      setMyBusiness(data.business);
      setVerifyMsg('Thank you! Your documents have been submitted and are under review. Our team will review within 2 business days.');
      setVerifyOpen(false);
    } catch (err) {
      setVerifyError(err.message || 'Failed to upload');
    } finally {
      setVerifyUploading(false);
    }
  };

  // Function to generate slug from business title
  const generateSlug = (title) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim('-'); // Remove leading/trailing hyphens
  };

  // Function to generate business profile URL
  const getBusinessProfileUrl = (business) => {
    if (!business) return '';
    
    // Try multiple possible fields for category
    let category = business.businessType || 
                   business.category || 
                   business.serviceType || 
                   (business.services && business.services[0] && business.services[0].name) ||
                   'other';
    
    // Clean up the category
    category = category.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const slug = generateSlug(business.businessName);
    return `/business/${category}/${slug}`;
  };

  const toTitleCase = (str) => {
    if (!str) return '';
    return String(str).replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
  };

  const StatCard = ({ icon, title, value, change, color = 'primary' }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {change && <span className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
        </span>}
      </div>
    </div>
  );

  const BusinessHoursEditor = ({ business, onChange }) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
      <div className="business-hours-editor">
        <h4>Business Hours</h4>
        <div className="hours-grid">
          {days.map((day, index) => (
            <div key={day} className="day-row">
              <div className="day-label">{dayNames[index]}</div>
              <div className="day-controls">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={!business.businessHours?.[day]?.closed}
                    onChange={(e) => {
                      const newHours = { ...business.businessHours };
                      if (!newHours[day]) newHours[day] = {};
                      newHours[day].closed = !e.target.checked;
                      if (newHours[day].closed) {
                        newHours[day].open = '09:00';
                        newHours[day].close = '17:00';
                      }
                      onChange({ ...business, businessHours: newHours });
                    }}
                  />
                  <span className="checkmark"></span>
                  Open
                </label>
                {!business.businessHours?.[day]?.closed && (
                  <>
                    <input
                      type="time"
                      value={business.businessHours?.[day]?.open || '09:00'}
                      onChange={(e) => {
                        const newHours = { ...business.businessHours };
                        if (!newHours[day]) newHours[day] = {};
                        newHours[day].open = e.target.value;
                        onChange({ ...business, businessHours: newHours });
                      }}
                      className="time-input"
                    />
                    <span className="time-separator">to</span>
                    <input
                      type="time"
                      value={business.businessHours?.[day]?.close || '17:00'}
                      onChange={(e) => {
                        const newHours = { ...business.businessHours };
                        if (!newHours[day]) newHours[day] = {};
                        newHours[day].close = e.target.value;
                        onChange({ ...business, businessHours: newHours });
                      }}
                      className="time-input"
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ImageUploader = ({ label, currentImage, onImageChange, type = 'single', multiple = false }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);
    // Ensure currentImage is always an array for gallery or string for single images
    const safeCurrentImage = multiple 
      ? (Array.isArray(currentImage) ? currentImage : [])
      : (currentImage || '');
    
    // Additional safety check for gallery
    const safeGallery = multiple && Array.isArray(safeCurrentImage) ? safeCurrentImage : [];
    
    const handleFiles = async (files) => {
      try {
        setImageProcessing(true);
        setBizError('');
        if (multiple) {
          const fileArr = Array.from(files || []);
          const urls = [];
          if (fileArr.length + (Array.isArray(safeGallery) ? safeGallery.length : 0) > 5) {
            setBizError('Maximum 5 images allowed for gallery.');
            setImageProcessing(false);
            return;
          }
          for (const f of fileArr) {
            const dataUrl = await readFileAsDataUrl(f);
            urls.push(dataUrl);
          }
          const existingGallery = Array.isArray(safeGallery) ? safeGallery : [];
          onImageChange([...existingGallery, ...urls]);
        } else {
          const f = files?.[0];
          if (f) {
            const dataUrl = await readFileAsDataUrl(f);
            onImageChange(dataUrl);
          }
        }
      } catch (err) {
        setBizError(err.message || 'Failed to read file(s)');
      } finally {
        setImageProcessing(false);
        setIsDragging(false);
      }
    };

    return (
      <div className={`image-uploader ${isDragging ? 'drag-active' : ''}`}>
        <label className="uploader-label">{label}</label>
        <div 
          className="uploader-content drop-zone"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        >
          {safeCurrentImage && (multiple ? safeGallery.length > 0 : safeCurrentImage) && (
            <div className="image-preview-container">
              {multiple ? (
                <div className="gallery-preview">
                  {safeGallery.map((src, index) => (
                    <div key={index} className="gallery-item">
                      <img 
                        className="image-preview" 
                        src={src} 
                        alt={`${label} ${index + 1}`} 
                      />
                      {isEditing && (
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => {
                            const newGallery = safeGallery.filter((_, i) => i !== index);
                            onImageChange(newGallery);
                          }}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && multiple && (
                    <button type="button" className="add-more-tile" onClick={() => inputRef.current?.click()}>
                      <FaPlus /> Add More
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <img 
                    className={`image-preview ${type === 'cover' ? 'wide' : ''}`} 
                    src={safeCurrentImage} 
                    alt={label} 
                  />
                  {isEditing && (
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => onImageChange('')}
                    >
                      <FaTimes />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
          {(!multiple && !safeCurrentImage) || (multiple && safeGallery.length === 0) ? (
            <div className="upload-placeholder" onClick={() => isEditing && inputRef.current?.click()}>
              <FaCloudUploadAlt className="upload-icon" />
              <div className="upload-text">Drag & drop or click to upload</div>
              <div className="upload-sub">JPG, PNG up to 5MB</div>
            </div>
          ) : null}
          {isEditing && (
            <div className="upload-input">
              <input
                type="file"
                accept="image/*"
                multiple={multiple}
                ref={inputRef}
                onChange={async (e) => {
                  await handleFiles(e.target.files);
                }}
              />
              <div className="upload-hint">
                {imageProcessing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4361ee' }}>
                    <div className="spinner-small"></div>
                    Processing image...
                  </div>
                ) : (
                  <>
                    {multiple ? 'Select multiple images (max 5, each under 5MB)' : 'Select image (max 5MB)'}
                    <br />
                    <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                      Large images will be automatically compressed
                    </small>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', icon: <FaChartLine />, label: 'Dashboard' },
    { id: 'myBusiness', icon: <MdBusiness />, label: 'My Business' },
    { id: 'messages', icon: <FaComments />, label: 'Messages', badge: unreadCount },
    { id: 'reviews', icon: <FaStar />, label: 'Reviews' },
  ];
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const sidebar = document.querySelector('.dashboard-sidebar');
      const menuButton = document.querySelector('.mobile-menu-button');
      
      if (isMobileMenuOpen && sidebar && !sidebar.contains(e.target) && !menuButton.contains(e.target)) {
        setIsMobileMenuOpen(false);
        document.body.classList.remove('sidebar-visible');
      }
    };
    
    // Add event listener for outside clicks
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className={`business-dashboard ${isMobileMenuOpen ? 'sidebar-visible' : ''} ${autoCollapseSidebar ? 'sidebar-collapsed' : ''} ${activeTab === 'messages' ? 'messages-view' : ''}`}>
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-button"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>
      
      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'mobile-visible' : ''}`}>
        <button
          className="mobile-close-sidebar"
          onClick={toggleMobileMenu}
          aria-label="Close menu"
        >
          ×
        </button>
        <div className="sidebar-header">
          <h2>{myBusiness?.businessName || 'AAA Service Directory'}</h2>
          <p className="welcome-message">
            {myBusiness
              ? `${toTitleCase(myBusiness.businessType || myBusiness.category || 'Business')}${myBusiness.location?.city ? ' · ' + myBusiness.location.city : ''}`
              : `Welcome, ${user?.name?.split(' ')[0] || 'Business'}!`}
          </p>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" /> Logout
          </button>
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'B'}
            </div>
            <div className="user-details">
              <span className="user-name">{myBusiness?.businessName || user?.name || 'Business Owner'}</span>
              <span className="user-email">{user?.email || ''}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Mobile header: back to home + hamburger */}
        <div className="mobile-topbar-only">
          <button className="mobile-back-home" onClick={() => navigate('/')}>← Back</button>
          <button className="mobile-hamburger-btn" onClick={toggleMobileMenu} aria-label="Toggle sidebar">☰</button>
        </div>
        {activeTab !== 'messages' && (
        <header className="dashboard-header">
          <div className="header-left">
            <h1>{activeTab === 'myBusiness' ? 'My Business' : (navItems.find(item => item.id === activeTab)?.label || 'Dashboard')}</h1>
            {activeTab === 'myBusiness' && (
              <p className="header-subtitle">Manage your business profile</p>
            )}
          </div>
          <div className="header-actions">
            {myBusiness?._id && (
              <a
                className="btn-view-profile"
                href={getBusinessProfileUrl(myBusiness)}
                target="_blank"
                rel="noopener noreferrer"
                title="View Public Profile"
              >
                <FaEye /> View Public Profile
              </a>
            )}
            {activeTab === 'myBusiness' && (
              <button
                className="btn-primary"
                type="button"
                onClick={() => {
                  if (isEditing) {
                    try {
                      if (formRef.current) {
                        if (typeof formRef.current.requestSubmit === 'function') {
                          formRef.current.requestSubmit();
                        } else {
                          formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                        }
                      }
                    } catch (e) {
                      // Fallback: do nothing, bottom save still works
                    }
                  } else {
                    setIsEditing(true);
                    // Bring form into view for quick edits
                    setTimeout(() => formRef.current && formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
                  }
                }}
              >
                {isEditing ? <><FaSave /> Save Changes</> : <><FaEdit /> Edit Listing</>}
              </button>
            )}
            <button 
              className="icon-button"
              onClick={() => setActiveTab('inbox')}
              data-badge={unreadCount > 0 ? unreadCount : null}
            >
              <FaEnvelope />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            <button className="icon-button">
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
          </div>
        </header>
        )}

        {activeTab === 'myBusiness' && (
          <div className="profile-progress-card">
            <div className="progress-top">
              <span className="progress-title">Profile completion</span>
              <span className="progress-value">{profileCompletion}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${profileCompletion}%` }} />
            </div>
            <div className="progress-subtext">Complete your profile to increase trust and visibility</div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            <div className="dashboard-stats">
              {bizLoading ? (
                // Show loading state for metrics
                <>
                  <div className="stat-card stat-card-loading">
                    <div className="stat-icon"><div className="spinner-small"></div></div>
                    <div className="stat-info">
                      <h3>Loading...</h3>
                      <p className="stat-value">Please wait</p>
                    </div>
                  </div>
                  <div className="stat-card stat-card-loading">
                    <div className="stat-icon"><div className="spinner-small"></div></div>
                    <div className="stat-info">
                      <h3>Loading...</h3>
                      <p className="stat-value">Please wait</p>
                    </div>
                  </div>
                  <div className="stat-card stat-card-loading">
                    <div className="stat-icon"><div className="spinner-small"></div></div>
                    <div className="stat-info">
                      <h3>Loading...</h3>
                      <p className="stat-value">Please wait</p>
                    </div>
                  </div>
                  <div className="stat-card stat-card-loading">
                    <div className="stat-icon"><div className="spinner-small"></div></div>
                    <div className="stat-info">
                      <h3>Loading...</h3>
                      <p className="stat-value">Please wait</p>
                    </div>
                  </div>
                </>
              ) : (
                // Show actual metrics when data is loaded
                <>
                  <StatCard 
                    icon={<FaClipboardList />} 
                    title="Total Services" 
                    value={stats.totalServices || 0}
                    color="info"
                  />
                  <StatCard 
                    icon={<FaMapMarkerAlt />} 
                    title="Service Area" 
                    value={stats.serviceArea || 'Not Set'}
                    color="success"
                  />
                  <StatCard 
                    icon={<FaStar />} 
                    title="Avg. Rating" 
                    value={`${(stats.averageRating || 0).toFixed(1)}/5.0`}
                    color="warning"
                  />
                  <StatCard 
                    icon={<FaUsers />} 
                    title="Verification" 
                    value={stats.verificationStatus || 'Pending'}
                    color={stats.verificationStatus === 'Verified' ? 'success' : 'warning'}
                  />
                </>
              )}
            </div>

            <div className="dashboard-content">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3><FaStar /> Recent Customer Reviews</h3>
                  <span className="review-count">{reviews.items.length} reviews</span>
                </div>
                {reviews.loading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading reviews...</p>
                  </div>
                ) : reviews.items.length === 0 ? (
                  <div className="empty-state">
                    <FaStar className="empty-icon" />
                    <p>No reviews yet.</p>
                    <small>Reviews from your customers will appear here</small>
                  </div>
                ) : (
                  <div className="reviews-grid">
                    {reviews.items.map((review) => (
                      <div key={review._id} className="review-card">
                        <div className="review-header">
                          <div className="reviewer-avatar">{review.reviewer?.firstName?.[0] || 'U'}</div>
                          <div className="reviewer-info">
                            <div className="reviewer-name">{review.reviewer?.firstName} {review.reviewer?.lastName}</div>
                            <div className="review-rating">
                              {[...Array(5)].map((_, i) => (
                                <FaStar 
                                  key={i} 
                                  className={i < review.rating ? 'star-filled' : 'star-empty'} 
                                />
                              ))}
                            </div>
                          </div>
                          <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                        {review.title && <h4 className="review-title">{review.title}</h4>}
                        <p className="review-comment">{review.comment}</p>
                        {review.serviceType && (
                          <div className="review-service">
                            <span className="service-tag">{review.serviceType}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'myBusiness' && (
          <div className="business-management">
            <div className="dashboard-card">
              <div className="card-header">
                <h3><MdBusiness /> Business Profile Management</h3>
                <div className="header-actions">
                  {isEditing && (
                    <button 
                      className="btn-secondary" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
              {myBusiness && (
                <div className="status-row">
                  {(() => { const s = computeStatusBadge(myBusiness); return (
                    <span className={`status-badge ${s.cls}`}>{s.icon} {s.label}</span>
                  ); })()}
                </div>
              )}

              {!myBusiness?.verification?.isVerified && (
                <div className="verify-card">
                  <div className="verify-header">
                    <h4>Verify Your Business</h4>
                    {!verifyOpen && (
                      <button className="btn-primary" onClick={() => setVerifyOpen(true)}>
                        Upload Documents
                      </button>
                    )}
                  </div>
                  {console.log('🔍 Business verification state:', {
                    isVerified: myBusiness?.verification?.isVerified,
                    hasDocuments: myBusiness?.verification?.documents?.length > 0,
                    status: myBusiness?.status,
                    businessId: myBusiness?._id
                  })}
                  {!verifyOpen && (
                    <p className="verify-help">
                      {myBusiness?.verification?.documents && myBusiness.verification.documents.length > 0
                        ? 'Thank you! Your documents have been submitted and are under review. Our team will review within 2 business days.'
                        : 'Your business is listed as Unverified. Please upload documents to get verified.'}
                    </p>
                  )}
                  {verifyOpen && (
                    <form className="verify-form" onSubmit={submitVerification}>
                      {verifyError && <div className="error-message">{verifyError}</div>}
                      {verifyMsg && <div className="success-message">{verifyMsg}</div>}
                      <div className="verify-grid">
                        <label className="verify-input">
                          <span>Business License</span>
                          <input type="file" accept="image/*,application/pdf" onChange={(e)=>setDocInputs(v=>({...v,license:e.target.files?.[0]||null}))} />
                        </label>
                        <label className="verify-input">
                          <span>Government ID</span>
                          <input type="file" accept="image/*,application/pdf" onChange={(e)=>setDocInputs(v=>({...v,governmentId:e.target.files?.[0]||null}))} />
                        </label>
                        <label className="verify-input">
                          <span>Supporting Documents (optional)</span>
                          <input type="file" accept="image/*,application/pdf" multiple onChange={(e)=>setDocInputs(v=>({...v,supporting:Array.from(e.target.files||[])}))} />
                        </label>
                      </div>
                      <div className="verify-actions">
                        <button className="btn-primary" type="submit" disabled={verifyUploading}>
                          {verifyUploading ? 'Submitting...' : 'Submit for Review'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={()=>setVerifyOpen(false)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              )}
              
              {bizError && <div className="error-message">{bizError}</div>}
              {bizSuccess && <div className="success-message">{bizSuccess}</div>}
              
              {bizLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading business information...</p>
                </div>
              ) : myBusiness ? (
                <form
                  ref={formRef}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    let payload; // Declare payload outside try block
                    try {
                      setBizSaving(true);
                      setBizError('');
                      setBizSuccess('');
                      
                      // Build safe, merged gallery (existing + new previews), max 5, no empties/dupes
                      const previewGallery = Array.isArray(imagePreviews.gallery) ? imagePreviews.gallery : [];
                      const existingGallery = Array.isArray(myBusiness.images?.gallery) ? myBusiness.images.gallery : [];
                      const mergedGallery = (() => {
                        const combined = [...existingGallery, ...previewGallery]
                          .filter(Boolean)
                          .map(s => (typeof s === 'string' ? s.trim() : s))
                          .filter(Boolean);
                        const unique = Array.from(new Map(combined.map(u => [u, u])).values());
                        return unique.slice(0, 5);
                      })();

                      payload = {
                        businessName: myBusiness.businessName?.trim(),
                        businessType: myBusiness.businessType,
                        description: myBusiness.description?.trim(),
                        contact: {
                          phone: myBusiness.contact?.phone?.trim(),
                          email: myBusiness.contact?.email?.trim(),
                          website: myBusiness.contact?.website?.trim() || undefined,
                        },
                        location: {
                          address: myBusiness.location?.address?.trim(),
                          city: myBusiness.location?.city?.trim(),
                          area: myBusiness.location?.area?.trim() || undefined,
                        },
                        businessHours: myBusiness.businessHours,
                        images: {
                          logo: imagePreviews.logo || myBusiness.images?.logo || undefined,
                          cover: imagePreviews.cover || myBusiness.images?.cover || undefined,
                          gallery: mergedGallery
                        }
                      };
                      
                      const res = await fetch(`http://localhost:5000/api/business/${myBusiness._id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(payload)
                      });
                      
                      const data = await res.json();
                      if (!res.ok) throw new Error((data && (data.errors?.[0] || data.message)) || 'Update failed');
                      
                      setMyBusiness(data.business);
                      setBizSuccess('Business updated successfully!');
                      setIsEditing(false);
                      setImagePreviews({ logo: '', cover: '', gallery: [] });
                    } catch (err) {
                      console.error('Business update error:', err);
                      console.error('Error details:', {
                        message: err.message,
                        stack: err.stack,
                        payload: payload
                      });
                      setBizError(err.message || 'Update failed');
                    } finally {
                      setBizSaving(false);
                    }
                  }}
                  className="business-form"
                >
                  {/* Brand & Media Section */}
                  <div className="form-section media-section">
                    <div className="section-header">
                      <h4><FaCog /> Brand & Media</h4>
                      <span className="section-description">Upload your business logo, cover image, and gallery photos to create a professional appearance</span>
                    </div>
                    <div className="media-grid">
                      <ImageUploader
                        label="Business Logo"
                        currentImage={imagePreviews.logo || myBusiness.images?.logo}
                        onImageChange={(url) => setImagePreviews(prev => ({ ...prev, logo: url }))}
                        type="logo"
                      />
                      <ImageUploader
                        label="Cover Image"
                        currentImage={imagePreviews.cover || myBusiness.images?.cover}
                        onImageChange={(url) => setImagePreviews(prev => ({ ...prev, cover: url }))}
                        type="cover"
                      />
                      <ImageUploader
                        label="Gallery Images"
                        currentImage={Array.isArray(imagePreviews.gallery) ? imagePreviews.gallery : (myBusiness.images?.gallery || [])}
                        onImageChange={(urls) => setImagePreviews(prev => ({ ...prev, gallery: urls || [] }))}
                        type="gallery"
                        multiple={true}
                      />
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="form-section">
                    <div className="section-header">
                      <h4><MdBusiness /> Basic Information</h4>
                      <span className="section-description">Core details about your business that customers will see</span>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Business Name *</label>
                        <input
                          type="text"
                          value={myBusiness.businessName || ''}
                          onChange={(e) => setMyBusiness({ ...myBusiness, businessName: e.target.value })}
                          disabled={!isEditing}
                          required
                          placeholder="Enter your business name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Business Type *</label>
                        <select
                          value={myBusiness.businessType || 'other'}
                          onChange={(e) => setMyBusiness({ ...myBusiness, businessType: e.target.value })}
                          disabled={!isEditing}
                          required
                        >
                          {['plumbing','electrical','cleaning','painting','gardening','repair','transport','security','education','food','beauty','health','construction','maintenance','other'].map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group full-width">
                        <label>Description *</label>
                        <textarea
                          rows={4}
                          value={myBusiness.description || ''}
                          onChange={(e) => setMyBusiness({ ...myBusiness, description: e.target.value })}
                          disabled={!isEditing}
                          required
                          placeholder="Describe your business, services, and what makes you unique. This helps customers understand what you offer..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="form-section">
                    <div className="section-header">
                      <h4><FaPhone /> Contact Information</h4>
                      <span className="section-description">How customers can reach you for inquiries and bookings</span>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          value={myBusiness.contact?.phone || ''}
                          onChange={(e) => setMyBusiness({ ...myBusiness, contact: { ...myBusiness.contact, phone: e.target.value } })}
                          disabled={!isEditing}
                          required
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={myBusiness.contact?.email || ''}
                          onChange={(e) => setMyBusiness({ ...myBusiness, contact: { ...myBusiness.contact, email: e.target.value } })}
                          disabled={!isEditing}
                          required
                          placeholder="business@example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label>Website</label>
                        <input
                          type="url"
                          value={myBusiness.contact?.website || ''}
                          onChange={(e) => setMyBusiness({ ...myBusiness, contact: { ...myBusiness.contact, website: e.target.value } })}
                          disabled={!isEditing}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="form-section">
                    <div className="section-header">
                      <h4><FaMapMarkerAlt /> Location</h4>
                      <span className="section-description">Where your business operates and serves customers</span>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label>Address *</label>
                        <input
                          type="text"
                          value={myBusiness.location?.address || ''}
                          onChange={(e) => setMyBusiness({ ...myBusiness, location: { ...myBusiness.location, address: e.target.value } })}
                          disabled={!isEditing}
                          required
                          placeholder="123 Business Street, Suite 100"
                        />
                      </div>
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          value={myBusiness.location?.city || ''}
                          onChange={(e) => setMyBusiness({ ...myBusiness, location: { ...myBusiness.location, city: e.target.value } })}
                          disabled={!isEditing}
                          required
                          placeholder="New York"
                        />
                      </div>
                      <div className="form-group">
                        <label>Area</label>
                        <input
                          type="text"
                          value={myBusiness.location?.area || ''}
                          onChange={(e) => setMyBusiness({ ...myBusiness, location: { ...myBusiness.location, area: e.target.value } })}
                          disabled={!isEditing}
                          placeholder="Manhattan"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="form-section">
                    <div className="section-header">
                      <h4><FaClock /> Business Hours</h4>
                      <button
                        type="button"
                        className="btn-toggle"
                        onClick={() => setShowBusinessHours(!showBusinessHours)}
                      >
                        {showBusinessHours ? <FaEyeSlash /> : <FaEye />}
                        {showBusinessHours ? 'Hide' : 'Show'} Hours
                      </button>
                    </div>
                    <span className="section-description">Set your operating hours so customers know when you're available</span>
                    {showBusinessHours && (
                      <BusinessHoursEditor
                        business={myBusiness}
                        onChange={setMyBusiness}
                      />
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="form-actions">
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={bizSaving || imageProcessing}
                      >
                        {bizSaving ? (
                          <>
                            <div className="spinner-small"></div>
                            Saving...
                          </>
                        ) : imageProcessing ? (
                          <>
                            <div className="spinner-small"></div>
                            Processing Images...
                          </>
                        ) : (
                          <>
                            <FaSave />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={async () => {
                          if (!window.confirm('Are you sure you want to deactivate your business? This action can be reversed later.')) return;
                          try {
                            setBizSaving(true);
                            setBizError('');
                            const res = await fetch(`http://localhost:5000/api/business/${myBusiness._id}`, {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.message || 'Delete failed');
                            setBizSuccess('Business deactivated successfully.');
                            setMyBusiness(null);
                          } catch (err) {
                            setBizError(err.message || 'Delete failed');
                          } finally {
                            setBizSaving(false);
                          }
                        }}
                      >
                        <FaTrash /> Deactivate Business
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                <div className="empty-state">
                  <MdBusiness className="empty-icon" />
                  <p>No business found for this account.</p>
                  <small>If you recently registered, please refresh this page or contact support.</small>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="dashboard-card messages-card">
            <BusinessMessagingDashboard />
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="dashboard-card">
            <div className="card-header">
              <h3><FaStar /> Customer Reviews</h3>
              <div className="reviews-summary">
                <span className="rating-display">
                  {myBusiness?.rating?.average ? myBusiness.rating.average.toFixed(1) : '0.0'}
                </span>
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={i < (myBusiness?.rating?.average || 0) ? 'star-filled' : 'star-empty'} 
                    />
                  ))}
                </div>
                <span className="total-reviews">
                  {myBusiness?.rating?.totalReviews || 0} reviews
                </span>
              </div>
            </div>
            
            {reviews.loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading reviews...</p>
              </div>
            ) : reviews.items.length === 0 ? (
              <div className="empty-state">
                <FaStar className="empty-icon" />
                <p>No reviews yet.</p>
                <small>Reviews from your customers will appear here</small>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.items.map((review) => (
                  <div key={review._id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">{review.reviewer?.firstName?.[0] || 'U'}</div>
                        <div>
                          <div className="reviewer-name">{review.reviewer?.firstName} {review.reviewer?.lastName}</div>
                          <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < review.rating ? 'star-filled' : 'star-empty'} 
                          />
                        ))}
                      </div>
                    </div>
                    {review.title && <h4 className="review-title">{review.title}</h4>}
                    <p className="review-comment">{review.comment}</p>
                    {review.serviceType && (
                      <div className="review-service">
                        <span className="service-tag">{review.serviceType}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default BusinessDashboard;
