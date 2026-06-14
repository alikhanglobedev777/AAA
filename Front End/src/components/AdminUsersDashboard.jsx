import React, { useState, useEffect } from 'react';
import './AdminUsersDashboard.css';

const AdminUsersDashboard = ({ 
  users, 
  totalPages, 
  currentPage, 
  setCurrentPage, 
  userTypeFilter, 
  setUserTypeFilter, 
  statusFilter, 
  setStatusFilter, 
  searchTerm, 
  setSearchTerm, 
  dataLoading,
  onRefresh,
  onUpdateUser,
  onDeleteUser
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      isActive: user.isActive !== undefined ? user.isActive : true,
      emailVerified: user.emailVerified !== undefined ? user.emailVerified : false,
      userType: user.userType || 'customer'
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    
    try {
      await onUpdateUser(selectedUser._id, editForm);
      setShowEditModal(false);
      setSelectedUser(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone and will send a notification email to the user.')) {
      try {
        await onDeleteUser(userId);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (user) => {
    if (!user.isActive) {
      return (
        <div className="status-badge status-inactive">
          <svg className="status-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>Inactive</span>
        </div>
      );
    }
    if (user.emailVerified) {
      return (
        <div className="status-badge status-verified">
          <svg className="status-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <span>Verified</span>
        </div>
      );
    }
    return (
      <div className="status-badge status-unverified">
        <svg className="status-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span>Unverified</span>
      </div>
    );
  };

  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 'customer':
        return 'Customer';
      case 'business':
        return 'Service Provider';
      case 'admin':
        return 'Administrator';
      default:
        return userType;
    }
  };

  const getUserTypeIcon = (userType) => {
    switch (userType) {
      case 'customer':
        return (
          <svg className="user-type-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        );
      case 'business':
        return (
          <svg className="user-type-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/>
          </svg>
        );
      case 'admin':
        return (
          <svg className="user-type-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-users-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <svg className="header-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <h2>User Management</h2>
            <span className="user-count">{users.length} users found</span>
          </div>
          <button onClick={onRefresh} className="refresh-button">
            <svg className="refresh-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-container">
          <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Search users by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label className="filter-label">User Type</label>
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="customer">Customers</option>
              <option value="business">Service Providers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-container">
        {dataLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Verification</th>
                  <th>Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <div className="empty-content">
                        <svg className="empty-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <h3>No users found</h3>
                        <p>Try adjusting your filters or search terms</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="user-row">
                      <td className="user-info">
                        <div className="user-avatar">
                          {user.profilePicture ? (
                            <img 
                              src={user.profilePicture} 
                              alt={`${user.firstName} ${user.lastName}`}
                              className="avatar-image"
                            />
                          ) : (
                            <div className="avatar-placeholder">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="user-username">
                            @{user.username || 'no-username'}
                          </div>
                          <div className="user-email">
                            <svg className="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="user-phone">
                              <svg className="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                              </svg>
                              {user.phone}
                            </div>
                          )}
                          {user.location?.city && (
                            <div className="user-location">
                              <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                              </svg>
                              {user.location.city}
                              {user.location.area && `, ${user.location.area}`}
                            </div>
                          )}
                        </div>
                      </td>
                      

                      
                      <td className="user-type">
                        <div className={`type-badge type-${user.userType}`}>
                          {getUserTypeIcon(user.userType)}
                          <span>{getUserTypeLabel(user.userType)}</span>
                        </div>
                      </td>
                      
                      <td className="user-status">
                        {getStatusBadge(user)}
                      </td>
                      
                      <td className="verification-status">
                        <div className={`verification-badge ${user.emailVerified ? 'verified' : 'unverified'}`}>
                          <svg className="verification-icon" viewBox="0 0 24 24" fill="currentColor">
                            {user.emailVerified ? (
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            ) : (
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            )}
                          </svg>
                          <span>{user.emailVerified ? 'Verified' : 'Unverified'}</span>
                        </div>
                      </td>
                      
                      <td className="activity-info">
                        <div className="activity-item">
                          <div className="activity-label">Joined</div>
                          <div className="activity-date">{formatDate(user.createdAt)}</div>
                        </div>
                        <div className="activity-item">
                          <div className="activity-label">Last Login</div>
                          <div className="activity-date">{formatDate(user.lastLogin)}</div>
                        </div>
                      </td>
                      
                      <td className="actions">
                        <div className="action-buttons">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="action-btn view-btn"
                            title="View Details"
                          >
                            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="action-btn edit-btn"
                            title="Edit User"
                          >
                            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="action-btn delete-btn"
                            title="Delete User"
                            disabled={user.userType === 'admin'}
                          >
                            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="pagination-btn prev-btn"
          >
            <svg className="pagination-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
            Previous
          </button>
          
          <div className="pagination-info">
            <span className="current-page">{currentPage}</span>
            <span className="separator">of</span>
            <span className="total-pages">{totalPages}</span>
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn next-btn"
          >
            Next
            <svg className="pagination-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <svg className="modal-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <h3>User Details</h3>
              </div>
              <button 
                onClick={() => setShowUserModal(false)}
                className="modal-close"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="user-profile-header">
                <div className="profile-avatar">
                  {selectedUser.profilePicture ? (
                    <img 
                      src={selectedUser.profilePicture} 
                      alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                      className="profile-image"
                    />
                  ) : (
                    <div className="profile-placeholder">
                      {selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="profile-info">
                  <h4 className="profile-name">{selectedUser.firstName} {selectedUser.lastName}</h4>
                  <p className="profile-email">{selectedUser.email}</p>
                  <div className="profile-badges">
                    <div className={`profile-badge type-${selectedUser.userType}`}>
                      {getUserTypeIcon(selectedUser.userType)}
                      {getUserTypeLabel(selectedUser.userType)}
                    </div>
                    {getStatusBadge(selectedUser)}
                  </div>
                </div>
              </div>
              
              <div className="user-details-grid">
                <div className="detail-section">
                  <h5 className="section-title">Personal Information</h5>
                  <div className="detail-item">
                    <span className="detail-label">Username</span>
                    <span className="detail-value">@{selectedUser.username || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{selectedUser.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Status</span>
                    <span className="detail-value">{selectedUser.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email Verified</span>
                    <span className="detail-value">{selectedUser.emailVerified ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h5 className="section-title">Location</h5>
                  {selectedUser.location ? (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">City</span>
                        <span className="detail-value">{selectedUser.location.city || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Area</span>
                        <span className="detail-value">{selectedUser.location.area || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Address</span>
                        <span className="detail-value">{selectedUser.location.address || 'N/A'}</span>
                      </div>
                    </>
                  ) : (
                    <div className="detail-item">
                      <span className="detail-label">Location</span>
                      <span className="detail-value">Not specified</span>
                    </div>
                  )}
                </div>
                
                <div className="detail-section">
                  <h5 className="section-title">Activity</h5>
                  <div className="detail-item">
                    <span className="detail-label">Joined Date</span>
                    <span className="detail-value">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Login</span>
                    <span className="detail-value">{formatDate(selectedUser.lastLogin)}</span>
                  </div>
                  {selectedUser.tags && selectedUser.tags.length > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Tags</span>
                      <div className="tags-container">
                        {selectedUser.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => handleEditUser(selectedUser)}
                className="modal-btn edit-btn"
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Edit User
              </button>
              <button
                onClick={() => setShowUserModal(false)}
                className="modal-btn cancel-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <svg className="modal-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                <h3>Edit User</h3>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="modal-close"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="userType" className="form-label">User Type</label>
                  <select
                    id="userType"
                    value={editForm.userType}
                    onChange={(e) => setEditForm({...editForm, userType: e.target.value})}
                    className="form-select"
                  >
                    <option value="customer">Customer</option>
                    <option value="business">Service Provider</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                      className="checkbox"
                    />
                    <span className="checkmark"></span>
                    Account Active
                  </label>
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editForm.emailVerified}
                      onChange={(e) => setEditForm({...editForm, emailVerified: e.target.checked})}
                      className="checkbox"
                    />
                    <span className="checkmark"></span>
                    Email Verified
                  </label>
                </div>
              </div>
            </form>
            
            <div className="modal-footer">
              <button
                type="submit"
                onClick={handleEditSubmit}
                disabled={editLoading}
                className="modal-btn save-btn"
              >
                {editLoading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="modal-btn cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersDashboard;
