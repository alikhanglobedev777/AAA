import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaComments } from 'react-icons/fa';
import './MessageBusinessButton.css';

const MessageBusinessButton = ({ business, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleMessageClick = async () => {
    if (!isAuthenticated) {
      setError('Please log in to message this business');
      return;
    }

    if (user.userType === 'business') {
      setError('Business accounts cannot message other businesses');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/messaging/conversations/${business.id || business._id}/start`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await response.json();
      console.log('✅ Conversation created:', data);
      
      // Navigate to customer dashboard with messages tab open
      navigate('/customer-dashboard', { 
        state: { 
          activeTab: 'messages',
          conversationId: data.conversation.conversationId 
        } 
      });

    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If className includes 'cta-button', render as CTA button
  if (className && className.includes('cta-button')) {
    return (
      <button
        className={className}
        onClick={handleMessageClick}
        disabled={isLoading}
      >
        <div className="cta-icon">
          <FaComments />
        </div>
        <div className="cta-content">
          <span className="cta-title">
            {isLoading ? 'Starting...' : 'Message Us'}
          </span>
          <span className="cta-subtitle">Start a conversation</span>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </button>
    );
  }

  // Default button styling
  return (
    <div className={`message-business-button-container ${className}`}>
      <button
        className="message-business-btn"
        onClick={handleMessageClick}
        disabled={isLoading}
      >
        <FaComments className="message-icon" />
        {isLoading ? 'Starting...' : 'Message Business'}
      </button>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default MessageBusinessButton;
