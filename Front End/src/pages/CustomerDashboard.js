import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaComments, FaUser, FaHome, FaStar, FaSignOutAlt, FaSearch, FaBars, FaArrowLeft, FaTimes, FaEdit, FaSave, FaTrash } from 'react-icons/fa';
import ChatWindow from '../components/ChatWindow';
import BusinessAvatar from '../components/BusinessAvatar';
import Profile from './Profile';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get initial active tab from navigation state or default to dashboard
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || 'dashboard'
  );
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullScreenChat, setIsFullScreenChat] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [recentReview, setRecentReview] = useState(null);
  
  // Get conversation ID from navigation state if available
  const initialConversationId = location.state?.conversationId;

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation =>
    conversation.businessId?.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigation items
  const navItems = [
    { id: 'dashboard', icon: <FaHome />, label: 'Dashboard' },
    { id: 'messages', icon: <FaComments />, label: 'Messages', badge: totalUnread },
    { id: 'profile', icon: <FaUser />, label: 'Profile' },
    { id: 'reviews', icon: <FaStar />, label: 'My Reviews' },
  ];

  // Handle go back functionality
  const handleGoBack = () => {
    if (isFullScreenChat) {
      setIsFullScreenChat(false);
      setSelectedConversation(null);
    } else if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/home');
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle conversation selection for mobile
  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setIsFullScreenChat(true);
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchConversations();
      fetchUnreadCount();
    }
    if (activeTab === 'reviews') {
      fetchUserReviews();
    }
  }, [activeTab]);

  // Fetch user reviews when component mounts
  useEffect(() => {
    if (user) {
      fetchUserReviews();
    }
  }, [user]);
  
  // Auto-select conversation if one was just created
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv.conversationId === initialConversationId);
      if (conversation) {
        console.log('🔍 Auto-selecting conversation:', conversation);
        setSelectedConversation(conversation);
        setIsChatOpen(true);
      }
    }
  }, [conversations, initialConversationId]);
  
  // Debug: Log selected conversation
  useEffect(() => {
    if (selectedConversation) {
      console.log('🔍 Selected conversation:', selectedConversation);
      console.log('🔍 Business ID:', selectedConversation.businessId);
      console.log('🔍 Conversation ID:', selectedConversation.conversationId);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching conversations with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('http://localhost:5000/api/messaging/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      console.log('📨 Conversations data:', data);
      console.log('📨 First conversation structure:', data.conversations?.[0]);
      if (data.conversations?.[0]) {
        console.log('📨 Customer field:', data.conversations[0].customer);
        console.log('📨 Business Owner field:', data.conversations[0].businessOwner);
        console.log('📨 Business ID field:', data.conversations[0].businessId);
      }
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messaging/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTotalUnread(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!user._id) {
        console.error('User ID not found');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/reviews?reviewer=${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const userReviews = (data.reviews || []).filter(review => {
          const reviewerId = review.reviewer?._id || review.reviewer;
          return reviewerId === user._id;
        });
        
        setReviews(userReviews);
        
        // Set the most recent review for dashboard display
        if (userReviews.length > 0) {
          const sortedReviews = userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentReview(sortedReviews[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="customer-dashboard">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-sidebar-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture.startsWith('data:') ? user.profilePicture : `http://localhost:5000/${user.profilePicture}`}
                  alt="Profile"
                  onError={(e) => {
                    console.log('CustomerDashboard: Profile picture failed to load, showing placeholder');
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="avatar-placeholder" style={{ display: user.profilePicture ? 'none' : 'flex' }}>
                {getInitials(user.firstName, user.lastName)}
              </div>
            </div>
            <div className="user-details">
              <h3>{user.firstName} {user.lastName}</h3>
              <p>{user.email}</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button className="mobile-close-btn" onClick={closeMobileMenu}>
          <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              data-tab={item.id}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Mobile Header - Only show in conversations view */}
        {!isFullScreenChat && (
          <div className="mobile-header">
            <button className="go-back-btn" onClick={handleGoBack}>
              <FaArrowLeft />
              <span>Go Back</span>
            </button>
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <i class="fa-solid fa-bars"></i>
            </button>
          </div>
        )}

        {/* Chat Header - Only show in full screen chat */}
        {isFullScreenChat && (
          <div className="chat-header-mobile">
            <button className="back-to-conversations" onClick={handleGoBack}>
            <i className="fa-solid fa-arrow-left-long"></i>
            </button>
            <div className="chat-header-info">
              <div className="chat-header-avatar">
                {selectedConversation?.businessId?.images?.logo ? (
                  <img src={selectedConversation.businessId.images.logo} alt="Business" />
                ) : (
                  <div className="chat-header-avatar-placeholder">
                    {selectedConversation?.businessId?.businessName?.charAt(0) || 'B'}
                  </div>
                )}
              </div>
              <div className="chat-header-details">
                <h3>{selectedConversation?.businessId?.businessName || 'Business'}</h3>
                <span className="chat-header-status">online</span>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-content">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-overview">
              <div className="welcome-card">
                <h2>Welcome back, {user.firstName}! 👋</h2>
                <p>Manage your conversations, reviews, and profile from here.</p>
              </div>
              
                             <div className="stats-grid">
                 <div className="stat-card-customer-dashboard">
                   <div className="stat-icon-customer-dashboard">💬</div>
                   <div className="stat-content-customer-dashboard">
                     <h3>{conversations.length}</h3>
                     <p>Active Conversations</p>
                   </div>
                 </div>
                 
                 <div className="stat-card-customer-dashboard">
                   <div className="stat-icon-customer-dashboard">⭐</div>
                   <div className="stat-content-customer-dashboard">
                     <h3>{reviews.length}</h3>
                     <p>Reviews Written</p>
                   </div>
                 </div>
               </div>

               {/* Recent Review Section */}
               {recentReview && (
                 <div className="recent-review-card">
                   <h3>Your Most Recent Review</h3>
                   <div className="review-preview">
                     <div className="review-header">
                       <h4>{recentReview.business?.businessName || 'Business'}</h4>
                       <div className="review-rating">
                         {[...Array(5)].map((_, i) => (
                           <FaStar
                             key={i}
                             className={`star ${i < recentReview.rating ? 'filled' : ''}`}
                           />
                         ))}
                       </div>
                     </div>
                     {recentReview.title && <p className="review-title">{recentReview.title}</p>}
                     <p className="review-comment">{recentReview.comment}</p>
                     <p className="review-date">
                       {new Date(recentReview.createdAt).toLocaleDateString()}
                     </p>
                   </div>
                 </div>
               )}
            </div>
          )}

          {/* Messages Tab - WhatsApp-like Layout */}
          {activeTab === 'messages' && (
            <>
              {/* Desktop Layout - WhatsApp Style */}
              <div className="desktop-messages-layout">
                {/* Conversations Panel */}
                <div className="conversations-panel">
                  <div className="conversations-header">
                    <h2>Messages</h2>
                    <p>Chat with businesses about their services</p>
                  </div>
                  
                  {/* Search Field */}
                  <div className="search-container">
                    <div className="search-input-wrapper">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                      />
                    </div>
                  </div>
                  
                  {/* Conversations List */}
                  <div className="conversations-list-container">
                    {loading ? (
                      <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading conversations...</p>
                      </div>
                    ) : error ? (
                      <div className="error-state">
                        <p>{error}</p>
                        <button onClick={fetchConversations}>Try Again</button>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <h3>{searchQuery ? 'No conversations found' : 'No conversations yet'}</h3>
                        <p>{searchQuery ? 'Try adjusting your search terms' : 'Start chatting with businesses by clicking "Message Us" on their profiles!'}</p>
                      </div>
                    ) : (
                      <div className="conversations-list">
                        {filteredConversations.map((conversation) => (
                          <div
                            key={conversation.conversationId}
                            className={`conversation-item ${selectedConversation?.conversationId === conversation.conversationId ? 'selected' : ''}`}
                            onClick={() => setSelectedConversation(conversation)}
                          >
                            <div className="conversation-avatar">
                              {conversation.businessId?.images?.logo ? (
                                <img src={conversation.businessId.images.logo} alt="Business" />
                              ) : (
                                <div className="business-avatar-placeholder">
                                  {conversation.businessId?.businessName?.charAt(0) || 'B'}
                                </div>
                              )}
                            </div>
                            
                            <div className="conversation-content">
                              <div className="conversation-header">
                                <h4>{conversation.businessId?.businessName || 'Business'}</h4>
                                <span className="conversation-time">
                                  {formatTime(conversation.lastMessageTime)}
                                </span>
                              </div>
                              
                              <p className="conversation-preview">
                                {conversation.lastMessageContent || 'No messages yet'}
                              </p>
                              
                              {conversation.unreadCount?.customer > 0 && (
                                <span className="unread-badge">
                                  {conversation.unreadCount.customer}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Panel */}
                <div className="chat-panel">
                  {selectedConversation ? (
                    <ChatWindow
                      conversation={selectedConversation}
                      business={selectedConversation.businessId}
                      isOpen={true}
                      onClose={() => setSelectedConversation(null)}
                    />
                  ) : (
                    <div className="no-chat-selected">
                      <div className="no-chat-icon">💬</div>
                      <h3>Select a conversation</h3>
                      <p>Choose a business from the list to start chatting</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Layout - Keep existing mobile behavior */}
              <div className="mobile-messages-layout">
                {!isFullScreenChat ? (
                  /* Conversations List View */
                  <div className="mobile-conversations-view">
                    <div className="conversations-header">
                      <h2>Messages</h2>
                      <p>Chat with businesses about their services</p>
                    </div>
                    
                    {/* Search Field */}
                    <div className="search-container">
                      <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                          type="text"
                          placeholder="Search conversations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="search-input"
                        />
                      </div>
                    </div>
                    
                    {/* Conversations List */}
                    <div className="conversations-list-container">
                      {loading ? (
                        <div className="loading-state">
                          <div className="spinner"></div>
                          <p>Loading conversations...</p>
                        </div>
                      ) : error ? (
                        <div className="error-state">
                          <p>{error}</p>
                          <button onClick={fetchConversations}>Try Again</button>
                        </div>
                      ) : filteredConversations.length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-icon">💬</div>
                          <h3>{searchQuery ? 'No conversations found' : 'No conversations yet'}</h3>
                          <p>{searchQuery ? 'Try adjusting your search terms' : 'Start chatting with businesses by clicking "Message Us" on their profiles!'}</p>
                        </div>
                      ) : (
                        <div className="conversations-list">
                          {filteredConversations.map((conversation) => (
                            <div
                              key={conversation.conversationId}
                              className="conversation-item"
                              onClick={() => handleConversationSelect(conversation)}
                            >
                              <div className="conversation-avatar">
                                {conversation.businessId?.images?.logo ? (
                                  <img src={conversation.businessId.images.logo} alt="Business" />
                                ) : (
                                  <div className="business-avatar-placeholder">
                                    {conversation.businessId?.businessName?.charAt(0) || 'B'}
                                  </div>
                                )}
                              </div>
                              
                              <div className="conversation-content">
                                <div className="conversation-header">
                                  <h4>{conversation.businessId?.businessName || 'Business'}</h4>
                                  <span className="conversation-time">
                                    {formatTime(conversation.lastMessageTime)}
                                  </span>
                                </div>
                                
                                <p className="conversation-preview">
                                  {conversation.lastMessageContent || 'No messages yet'}
                                </p>
                                
                                {conversation.unreadCount?.customer > 0 && (
                                  <span className="unread-badge">
                                    {conversation.unreadCount.customer}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Full Screen Chat View */
                  <div className="full-screen-chat">
                    <ChatWindow
                      conversation={selectedConversation}
                      business={selectedConversation.businessId}
                      isOpen={true}
                      onClose={() => setIsFullScreenChat(false)}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <Profile />
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <CustomerReviews />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



// Customer Reviews Component
const CustomerReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      fetchUserReviews();
    }
  }, [user]);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!user._id) {
        setError('User ID not found');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/reviews?reviewer=${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const userReviews = (data.reviews || []).filter(review => {
          const reviewerId = review.reviewer?._id || review.reviewer;
          return reviewerId === user._id;
        });
        
        setReviews(userReviews);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('An error occurred while fetching reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
  };

  const handleCancelEditReview = () => {
    setEditingReview(null);
  };

  const handleSaveReview = async (reviewId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Review updated successfully!' });
        setEditingReview(null);
        fetchUserReviews();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to update review' });
      }
    } catch (error) {
      console.error('Review update error:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating review' });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Review deleted successfully!' });
          fetchUserReviews();
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } else {
          const errorData = await response.json();
          setMessage({ type: 'error', text: errorData.message || 'Failed to delete review' });
        }
      } catch (error) {
        console.error('Review deletion error:', error);
        setMessage({ type: 'error', text: 'An error occurred while deleting review' });
      }
    }
  };

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="spinner"></div>
        <p>Loading your reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-error">
        <p>{error}</p>
        <button onClick={fetchUserReviews}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="customer-reviews">
      <div className="reviews-header">
        <h2>My Reviews</h2>
        <p>Manage and edit your reviews for businesses</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <div className="no-reviews-icon">⭐</div>
          <h3>No Reviews Yet</h3>
          <p>You haven't written any reviews yet. Start reviewing businesses you've used!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              {editingReview && editingReview._id === review._id ? (
                <ReviewEditForm
                  review={review}
                  onSave={handleSaveReview}
                  onCancel={handleCancelEditReview}
                />
              ) : (
                <div className="review-content">
                  <div className="review-header">
                    <div className="review-business">
                      <h4>{review.business?.businessName || 'Business'}</h4>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`star ${i < review.rating ? 'filled' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="review-actions">
                      <button 
                        onClick={() => handleEditReview(review)}
                        className="review-edit-btn"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteReview(review._id)}
                        className="review-delete-btn"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                  <div className="review-details">
                    {review.title && <p className="review-title">{review.title}</p>}
                    <p className="review-comment">{review.comment}</p>
                    <p className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Review Edit Form Component
const ReviewEditForm = ({ review, onSave, onCancel }) => {
  const [editData, setEditData] = useState({
    rating: review.rating,
    title: review.title || '',
    comment: review.comment
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(review._id, editData);
  };

  return (
    <form onSubmit={handleSubmit} className="review-edit-form">
      <div>
        <label>Rating</label>
        <select
          name="rating"
          value={editData.rating}
          onChange={handleChange}
          required
        >
          <option value="1">1 Star</option>
          <option value="2">2 Stars</option>
          <option value="3">3 Stars</option>
          <option value="4">4 Stars</option>
          <option value="5">5 Stars</option>
        </select>
      </div>
      
      <div>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={editData.title}
          onChange={handleChange}
          placeholder="Review title"
          maxLength="100"
        />
      </div>
      
      <div>
        <label>Comment</label>
        <textarea
          name="comment"
          value={editData.comment}
          onChange={handleChange}
          placeholder="Your review comment"
          rows="4"
          required
          maxLength="1000"
        />
      </div>
      
      <div className="review-edit-actions">
        <button type="submit" className="save-review-btn">
          <FaSave /> Save Review
        </button>
        <button type="button" onClick={onCancel} className="cancel-review-btn">
          <FaTimes /> Cancel
        </button>
      </div>
    </form>
  );
};

export default CustomerDashboard;
