import React, { useState, useEffect } from 'react';
import { FaSearch, FaEllipsisV, FaPaperPlane, FaTimes, FaUser, FaBuilding, FaEnvelope, FaBell } from 'react-icons/fa';
import ChatWindow from './ChatWindow';
import './BusinessMessagingDashboard.css';

const BusinessMessagingDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Toggle a class on the parent dashboard to control outer header visibility when chat is open
  useEffect(() => {
    const root = document.querySelector('.business-dashboard');
    if (root) {
      if (isChatOpen) {
        root.classList.add('chat-open');
      } else {
        root.classList.remove('chat-open');
      }
    }
  }, [isChatOpen]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messaging/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
  };

  const filteredConversations = conversations.filter(conv => {
    const customerName = `${conv.customer?.firstName || ''} ${conv.customer?.lastName || ''}`.toLowerCase();
    const businessName = conv.businessId?.businessName?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return customerName.includes(searchLower) || businessName.includes(searchLower);
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
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

  if (loading) {
    return (
      <div className="messaging-dashboard">  
        <div className="dashboard-content">
          <div className="conversations-panel">
            <div className="conversations-header">
              <h2>Customer Messages</h2>
              <div className="connection-status">
                <span className="status-dot"></span>
                Connected
              </div>
            </div>
            
            <div className="loading-conversations">
              <div className="loading-spinner"></div>
              <p>Loading conversations...</p>
            </div>
          </div>
          
          <div className="chat-panel">
            <div className="no-chat-selected">
              <div className="no-chat-icon">
                <FaEnvelope />
              </div>
              <h3>Select a conversation</h3>
              <p>Choose a customer conversation from the list to start messaging</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messaging-dashboard">
      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Conversations Panel */}
        {!isMobile || !isChatOpen ? (
        <div className="conversations-panel">
          <div className="conversations-header">
            <h2>Customer Messages</h2>
            <div className="connection-status">
              <span className="status-dot"></span>
              Connected
            </div>
          </div>
          {/* Search input to match customer dashboard */}
          <div className="bm-search-wrap">
            <FaSearch className="bm-search-icon" />
            <input
              type="text"
              className="bm-search-input"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchConversations} className="retry-btn">
                Retry
              </button>
            </div>
          ) : (
            <div className="conversations-list">
              {filteredConversations.length === 0 ? (
                <div className="no-conversations">
                  <div className="no-conversations-icon">
                    <FaEnvelope />
                  </div>
                  <h3>No conversations yet</h3>
                  <p>When customers message you, they'll appear here</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const customer = conversation.customer;
                  const business = conversation.businessId;
                  const unreadCount = conversation.unreadCount?.customer || 0;
                  const isSelected = selectedConversation?._id === conversation._id;
                  
                  return (
                    <div
                      key={conversation._id}
                      className={`conversation-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <div className="conversation-avatar">
                        {customer?.profilePicture ? (
                          <img 
                            src={customer.profilePicture} 
                            alt={`${customer.firstName} ${customer.lastName}`}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {getInitials(customer?.firstName, customer?.lastName)}
                          </div>
                        )}
                        {unreadCount > 0 && (
                          <span className="unread-badge">{unreadCount}</span>
                        )}
                      </div>
                      
                      <div className="conversation-details">
                        <div className="conversation-header">
                          <h4>{customer?.firstName} {customer?.lastName}</h4>
                          <span className="conversation-time">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        
                        <div className="conversation-preview">
                          <p className="last-message">
                            {conversation.lastMessageContent || 'No messages yet'}
                          </p>
                        </div>
                        
                        <div className="conversation-meta">
                          <span className="business-tag">{business?.businessName}</span>
                        </div>
                      </div>
                      
                      <div className="conversation-actions">
                        <button className="action-btn">
                          <FaEllipsisV />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
        ) : null}

        {/* Chat Panel */}
        <div className="chat-panel">
          {isChatOpen && selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              onClose={handleCloseChat}
              isOpen={true}
            />
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">
                <FaEnvelope />
              </div>
              <h3>Select a conversation</h3>
              <p>Choose a customer conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessMessagingDashboard;
