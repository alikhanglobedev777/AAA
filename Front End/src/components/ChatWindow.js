import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaTimes, FaUser, FaBuilding } from 'react-icons/fa';
import './ChatWindow.css';

const ChatWindow = ({ 
  conversation, 
  business, 
  onClose, 
  isOpen = false 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { sendMessage, startTyping, stopTyping, socket } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Debug: Log component props and state
  useEffect(() => {
    console.log('🔍 ChatWindow component mounted/updated');
    console.log('🔍 Props received:', { conversation, business, isOpen });
    console.log('🔍 Socket from useSocket:', socket);
    console.log('🔍 User from useAuth:', user);
  }, [conversation, business, isOpen, socket, user]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation messages
  useEffect(() => {
    if (conversation?.conversationId && isOpen) {
      loadMessages();
    }
  }, [conversation?.conversationId, isOpen]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    console.log('🔍 Setting up socket event listeners');
    console.log('🔍 Socket object:', socket);
    console.log('🔍 Socket connected:', !!socket);
    console.log('🔍 Socket ID:', socket?.id);
    console.log('🔍 Conversation object:', conversation);
    console.log('🔍 Conversation ID:', conversation?.conversationId);
    console.log('🔍 User object:', user);
    console.log('🔍 User ID:', user?._id);
    
    if (!socket) {
      console.log('❌ Socket is null/undefined, skipping event setup');
      return;
    }
    
    if (!conversation) {
      console.log('❌ Conversation is null/undefined, skipping event setup');
      return;
    }
    
    if (!conversation.conversationId) {
      console.log('❌ Conversation ID is missing, skipping event setup');
      return;
    }

    console.log('✅ All checks passed, setting up socket event listeners');

    // Clean up any existing listeners first
    socket.off('new-message');
    socket.off('user-typing');
    socket.off('user-stopped-typing');
    socket.off('message-read');

    const handleNewMessage = (data) => {
      console.log('🔍 New message received:', data);
      console.log('🔍 Current conversation ID:', conversation.conversationId);
      console.log('🔍 Message conversation ID:', data.conversationId);
      console.log('🔍 Message receiver ID:', data.message.receiver._id);
      console.log('🔍 Current user ID:', user._id);
      
      if (data.conversationId === conversation.conversationId) {
        console.log('✅ Adding message to conversation');
        setMessages(prev => [...prev, data.message]);
        // Mark message as read if we're the receiver
        if (data.message.receiver._id === user._id) {
          console.log('✅ Marking message as read');
          markMessageAsRead(data.message._id);
        }
      } else {
        console.log('❌ Conversation ID mismatch');
      }
    };

    const handleUserTyping = (data) => {
      if (data.conversationId === conversation.conversationId && data.userId !== user._id) {
        setOtherUserTyping(true);
        // Hide typing indicator after 3 seconds
        setTimeout(() => setOtherUserTyping(false), 3000);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.conversationId === conversation.conversationId && data.userId !== user._id) {
        setOtherUserTyping(false);
      }
    };

    const handleMessageRead = (data) => {
      if (data.conversationId === conversation.conversationId) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, isRead: true, readAt: data.readAt }
              : msg
          )
        );
      }
    };

    console.log('🔌 Attaching socket event listeners to socket ID:', socket.id);
    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stopped-typing', handleUserStoppedTyping);
    socket.on('message-read', handleMessageRead);

    return () => {
      console.log('🔌 Cleaning up socket event listeners for socket ID:', socket.id);
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stopped-typing', handleUserStoppedTyping);
      socket.off('message-read', handleMessageRead);
    };
  }, [socket, conversation, user._id]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(
        `http://localhost:5000/api/messaging/conversations/${conversation.conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversation) return;

    // Debug: Log conversation data
    console.log('🔍 Conversation data:', conversation);
    console.log('🔍 User type:', user.userType);
    console.log('🔍 Business owner ID:', conversation.businessOwner?._id);
    console.log('🔍 Customer ID:', conversation.customer?._id);

    // Determine the correct receiver ID based on who is sending the message
    const receiverId = user.userType === 'customer' 
      ? conversation.businessOwner._id 
      : conversation.customer._id;

    console.log('🔍 Sending message to receiver ID:', receiverId);

    const messageData = {
      receiverId: receiverId,
      businessId: conversation.businessId._id,
      content: newMessage.trim(),
      messageType: 'text'
    };

    // Send via socket
    const sent = sendMessage(messageData);
    
    if (sent) {
      // Optimistically add message to UI
      const tempMessage = {
        _id: Date.now().toString(),
        content: newMessage.trim(),
        sender: user,
        receiver: getOtherUser(), // Use the correct receiver based on user type
        businessId: conversation.businessId._id,
        conversationId: conversation.conversationId,
        createdAt: new Date(),
        isRead: false,
        isOptimistic: true
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      stopTyping();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Determine the correct receiver ID for typing indicators
    const receiverId = user.userType === 'customer' 
      ? conversation.businessOwner._id 
      : conversation.customer._id;
    
    // Start typing indicator
    if (!isTyping) {
      setIsTyping(true);
      startTyping({
        receiverId: receiverId,
        businessId: conversation.businessId._id,
        conversationId: conversation.conversationId
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 1 second of no input
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping({
        receiverId: receiverId,
        businessId: conversation.businessId._id,
        conversationId: conversation.conversationId
      });
    }, 1000);
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await fetch('http://localhost:5000/api/messaging/mark-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageId, conversationId: conversation.conversationId })
      });
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getOtherUser = () => {
    if (user.userType === 'customer') {
      return conversation.businessOwner;
    } else {
      return conversation.customer;
    }
  };

  if (!isOpen || !conversation) return null;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          {/* Mobile back to list */}
          <button className="chat-back-btn" onClick={onClose}>←</button>
          <div className="user-avatar">
            {getOtherUser()?.profilePicture ? (
              <img 
                src={getOtherUser().profilePicture} 
                alt={getOtherUser()?.firstName} 
              />
            ) : (
              <div className="avatar-placeholder">
                {user.userType === 'customer' ? <FaBuilding /> : <FaUser />}
              </div>
            )}
          </div>
          <div className="user-details">
            <h4>
              {user.userType === 'customer' 
                ? conversation.businessId.businessName 
                : `${getOtherUser()?.firstName} ${getOtherUser()?.lastName}`
              }
            </h4>
            <span className="user-status">
              {otherUserTyping ? '⌨️ typing...' : 'online'}
            </span>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="loading-messages">
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : error ? (
          <div className="error-messages">
            <p>{error}</p>
            <button onClick={loadMessages}>Retry</button>
          </div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`message ${message.sender._id === user._id ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{message.content}</p>
                <div className="message-meta">
                  <span className="message-time">
                    {formatTime(message.createdAt)}
                  </span>
                  {message.sender._id === user._id && (
                    <span className="message-status">
                      {message.isRead ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type your message..."
            disabled={loading}
            maxLength={1000}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || loading}
            className="send-btn"
          >
            <FaPaperPlane />
          </button>
        </div>
        <div className="typing-indicator">
          {isTyping && <span>⌨️ You are typing...</span>}
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
