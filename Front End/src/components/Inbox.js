import React, { useState, useEffect } from 'react';
import { FaSearch, FaEnvelope, FaEnvelopeOpen, FaTrash, FaReply, FaCheck, FaTimes } from 'react-icons/fa';
import './Inbox.css';

const Inbox = () => {
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Load inquiries from localStorage
  useEffect(() => {
    const loadInquiries = () => {
      try {
        const savedInquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
        setInquiries(savedInquiries);
      } catch (error) {
        console.error('Error loading inquiries:', error);
      }
    };

    loadInquiries();
    // Set up storage event listener to sync across tabs
    window.addEventListener('storage', loadInquiries);
    return () => window.removeEventListener('storage', loadInquiries);
  }, []);

  const filteredInquiries = inquiries.filter(inquiry => 
    inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInquiryClick = (inquiry) => {
    // Mark as read
    if (!inquiry.isRead) {
      const updatedInquiries = inquiries.map(i => 
        i.id === inquiry.id ? { ...i, isRead: true } : i
      );
      setInquiries(updatedInquiries);
      localStorage.setItem('inquiries', JSON.stringify(updatedInquiries));
    }
    setSelectedInquiry(inquiry);
    setIsReplying(false);
    setReplyContent('');
  };

  const handleReply = () => {
    if (!replyContent.trim() || !selectedInquiry) return;

    const updatedInquiries = inquiries.map(inquiry => {
      if (inquiry.id === selectedInquiry.id) {
        return {
          ...inquiry,
          status: 'replied',
          reply: {
            content: replyContent,
            timestamp: new Date().toISOString(),
          },
          isRead: true
        };
      }
      return inquiry;
    });

    setInquiries(updatedInquiries);
    localStorage.setItem('inquiries', JSON.stringify(updatedInquiries));
    setSelectedInquiry({
      ...selectedInquiry,
      status: 'replied',
      reply: {
        content: replyContent,
        timestamp: new Date().toISOString(),
      },
      isRead: true
    });
    
    setIsReplying(false);
    setReplyContent('');
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const updatedInquiries = inquiries.filter(inquiry => inquiry.id !== id);
    setInquiries(updatedInquiries);
    localStorage.setItem('inquiries', JSON.stringify(updatedInquiries));
    
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry(null);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="inbox-container">
      <div className="inbox-sidebar">
        <div className="inbox-header">
          <h2>Inquiries</h2>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="inquiry-list">
          {filteredInquiries.length === 0 ? (
            <div className="empty-state">
              <FaEnvelopeOpen size={48} className="empty-icon" />
              <p>No inquiries found</p>
            </div>
          ) : (
            filteredInquiries.map((inquiry) => (
              <div 
                key={inquiry.id}
                className={`inquiry-item ${selectedInquiry?.id === inquiry.id ? 'active' : ''} ${!inquiry.isRead ? 'unread' : ''}`}
                onClick={() => handleInquiryClick(inquiry)}
              >
                <div className="inquiry-preview">
                  <div className="inquiry-header">
                    <h4>{inquiry.userName || 'Anonymous User'}</h4>
                    <span className="inquiry-date">
                      {formatDate(inquiry.createdAt).split(',')[0]}
                    </span>
                  </div>
                  <p className="inquiry-service">{inquiry.serviceName || 'Service'}</p>
                  <p className="inquiry-message">
                    {inquiry.message.length > 80 
                      ? `${inquiry.message.substring(0, 80)}...` 
                      : inquiry.message}
                  </p>
                </div>
                <div className="inquiry-actions">
                  <button 
                    className="icon-button delete-button"
                    onClick={(e) => handleDelete(inquiry.id, e)}
                    aria-label="Delete inquiry"
                  >
                    <FaTrash />
                  </button>
                  {inquiry.status === 'replied' && (
                    <span className="status-badge replied">
                      <FaCheck /> Replied
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="inbox-detail">
        {selectedInquiry ? (
          <>
            <div className="inquiry-detail">
              <div className="detail-header">
                <div>
                  <h2>{selectedInquiry.serviceName || 'Service Inquiry'}</h2>
                  <p className="inquiry-meta">
                    From: {selectedInquiry.userName || 'Anonymous User'}
                    {selectedInquiry.userEmail && ` (${selectedInquiry.userEmail})`}
                  </p>
                  <p className="inquiry-date">
                    {formatDate(selectedInquiry.createdAt)}
                  </p>
                </div>
                <div className="detail-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      setIsReplying(!isReplying);
                      setReplyContent('');
                    }}
                    disabled={selectedInquiry.status === 'replied'}
                  >
                    <FaReply /> {selectedInquiry.status === 'replied' ? 'Replied' : 'Reply'}
                  </button>
                  <button 
                    className="btn btn-text"
                    onClick={() => handleDelete(selectedInquiry.id, { stopPropagation: () => {} })}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="inquiry-content">
                <h4>Message:</h4>
                <p>{selectedInquiry.message}</p>
              </div>

              {selectedInquiry.status === 'replied' && selectedInquiry.reply && (
                <div className="inquiry-reply">
                  <div className="reply-header">
                    <h4>Your Reply</h4>
                    <span className="reply-date">
                      {formatDate(selectedInquiry.reply.timestamp)}
                    </span>
                  </div>
                  <p>{selectedInquiry.reply.content}</p>
                </div>
              )}
            </div>

            {isReplying && (
              <div className="reply-form">
                <h4>Send Reply</h4>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Type your reply here..."
                  rows="4"
                />
                <div className="form-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={() => setIsReplying(false)}
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleReply}
                    disabled={!replyContent.trim()}
                  >
                    <FaReply /> Send Reply
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state empty-detail">
            <FaEnvelope size={64} className="empty-icon" />
            <h3>Select an inquiry to view details</h3>
            <p>Choose an inquiry from the list to read and respond to messages.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
