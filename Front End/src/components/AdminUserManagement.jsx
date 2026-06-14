import React, { useState, useEffect } from 'react';
import './AdminUserManagement.css';

const AdminUserManagement = ({
  adminUsers,
  totalPages,
  currentPage,
  setCurrentPage,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  dataLoading,
  onAddAdminUser,
  onUpdateAdminUser,
  onDeleteAdminUser
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'admin'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Full access to most features' },
    { value: 'super_admin', label: 'Super Admin', description: 'Complete system access including admin management' }
  ];

  useEffect(() => {
    if (modalType === 'edit' && selectedAdmin) {
      setFormData({
        username: selectedAdmin.username || '',
        email: selectedAdmin.email || '',
        fullName: selectedAdmin.fullName || '',
        role: selectedAdmin.role || 'admin'
      });
    }
  }, [modalType, selectedAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let result;
      if (modalType === 'add') {
        result = await onAddAdminUser(formData);
      } else if (modalType === 'edit') {
        result = await onUpdateAdminUser(selectedAdmin._id, formData);
      }

      if (result.success) {
        setShowModal(false);
        resetForm();
        if (modalType === 'add') {
          alert('Admin user added successfully! They will receive an email to set their password.');
        } else {
          alert('Admin user updated successfully!');
        }
      } else {
        setError(result.message || 'Operation failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;

    const result = await onDeleteAdminUser(selectedAdmin._id);
    if (result.success) {
      setShowModal(false);
      setSelectedAdmin(null);
      alert('Admin user deleted successfully!');
    } else {
      setError(result.message || 'Failed to delete admin user');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      fullName: '',
      role: 'admin'
    });
    setSelectedAdmin(null);
    setError('');
  };

  const openModal = (type, admin = null) => {
    setModalType(type);
    setSelectedAdmin(admin);
    setShowModal(true);
    if (type === 'add') {
      resetForm();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { class: 'role-admin', icon: '🔑' },
      super_admin: { class: 'role-superadmin', icon: '👑' }
    };

    const config = roleConfig[role] || roleConfig.admin;
    return (
      <span className={`role-badge ${config.class}`}>
        {config.icon} {role === 'super_admin' ? 'Super Admin' : 'Admin'}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'status-active', icon: '✅' },
      pending: { class: 'status-pending', icon: '⏳' },
      suspended: { class: 'status-suspended', icon: '🚫' },
      inactive: { class: 'status-inactive', icon: '❌' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (dataLoading && (!adminUsers || adminUsers.length === 0)) {
    return (
      <div className="admin-user-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading admin users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-management">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <svg className="header-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <h2>Admin User Management</h2>
            <span className="admin-count">
              {adminUsers?.length || 0} admin users
            </span>
          </div>
          <button onClick={() => openModal('add')} className="add-admin-btn">
            <svg className="add-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add Admin User
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{adminUsers?.length || 0}</h3>
            <p className="stat-label">Total Admins</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{adminUsers?.filter(a => a.status === 'active').length || 0}</h3>
            <p className="stat-label">Active</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{adminUsers?.filter(a => a.status === 'pending').length || 0}</h3>
            <p className="stat-label">Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{adminUsers?.filter(a => a.role === 'super_admin').length || 0}</h3>
            <p className="stat-label">Super Admins</p>
          </div>
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
            placeholder="Search admin users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label className="filter-label">Role</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          
          <div className="filter-group">
            <button
              onClick={() => {
                setStatusFilter('all');
                setSearchTerm('');
              }}
              className="filter-reset-btn"
              title="Reset all filters"
            >
              <svg className="reset-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Admin User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers && adminUsers.length > 0 ? (
                adminUsers.map((admin) => (
                  <tr key={admin._id} className={`admin-row ${admin.status}`}>
                    <td className="admin-info-cell">
                      <div className="admin-info">
                        <div className="admin-name">{admin.fullName}</div>
                        <div className="admin-username">@{admin.username}</div>
                        <div className="admin-email">{admin.email}</div>
                      </div>
                    </td>
                    <td className="role-cell">
                      {getRoleBadge(admin.role)}
                    </td>
                    <td className="status-cell">
                      {getStatusBadge(admin.status)}
                    </td>
                    <td className="last-login-cell">
                      {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          onClick={() => openModal('view', admin)}
                          className="action-btn view-btn"
                          title="View Details"
                        >
                          <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => openModal('edit', admin)}
                          className="action-btn edit-btn"
                          title="Edit Admin User"
                        >
                          <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => openModal('delete', admin)}
                          className="action-btn delete-btn"
                          title="Delete Admin User"
                        >
                          <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <div className="empty-content">
                      <svg className="empty-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <h3>No admin users found</h3>
                      <p>Try adjusting your filters or add a new admin user</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <svg className="modal-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <h3>
                  {modalType === 'add' && 'Add New Admin User'}
                  {modalType === 'edit' && 'Edit Admin User'}
                  {modalType === 'view' && 'Admin User Details'}
                  {modalType === 'delete' && 'Delete Admin User'}
                </h3>
              </div>
              <button onClick={closeModal} className="modal-close">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="modal-content">
              {modalType === 'delete' ? (
                <div className="delete-confirmation">
                  <div className="warning-message">
                    <svg className="warning-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                    <p>Are you sure you want to delete <strong>{selectedAdmin?.fullName}</strong>?</p>
                    <p>This action cannot be undone and will remove all their access to the system.</p>
                  </div>
                </div>
              ) : modalType === 'view' ? (
                <div className="admin-details">
                  <div className="detail-section">
                    <h5 className="section-title">Personal Information</h5>
                    <div className="detail-item">
                      <span className="detail-label">Full Name</span>
                      <span className="detail-value">{selectedAdmin?.fullName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Username</span>
                      <span className="detail-value">@{selectedAdmin?.username}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{selectedAdmin?.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Role</span>
                      <span className="detail-value">{getRoleBadge(selectedAdmin?.role)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status</span>
                      <span className="detail-value">{getStatusBadge(selectedAdmin?.status)}</span>
                    </div>
                  </div>

                  {selectedAdmin?.lastLogin && (
                    <div className="detail-section">
                      <h5 className="section-title">Activity</h5>
                      <div className="detail-item">
                        <span className="detail-label">Last Login</span>
                        <span className="detail-value">{new Date(selectedAdmin.lastLogin).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="admin-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="form-input"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Username *</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="form-input"
                        placeholder="Enter username"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="form-input"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="form-select"
                      required
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label} - {role.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}
                </form>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={closeModal} className="modal-btn cancel-btn">
                Cancel
              </button>
              
              {modalType === 'add' && (
                <button type="submit" onClick={handleSubmit} disabled={submitting} className="modal-btn save-btn">
                  {submitting ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Add Admin User
                    </>
                  )}
                </button>
              )}
              
              {modalType === 'edit' && (
                <button type="submit" onClick={handleSubmit} disabled={submitting} className="modal-btn save-btn">
                  {submitting ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Update Admin User
                    </>
                  )}
                </button>
              )}
              
              {modalType === 'delete' && (
                <button onClick={handleDelete} className="modal-btn delete-btn">
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                  Delete Admin User
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
