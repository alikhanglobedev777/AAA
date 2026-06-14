import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import './AdminServiceProvidersDashboard.css';

const AdminServiceProvidersDashboard = ({ 
  serviceProviders: propServiceProviders, 
  totalPages: propTotalPages, 
  currentPage: propCurrentPage, 
  setCurrentPage: propSetCurrentPage,
  statusFilter: propStatusFilter,
  setStatusFilter: propSetStatusFilter,
  searchTerm: propSearchTerm,
  setSearchTerm: propSetSearchTerm,
  dataLoading: propDataLoading,
  updateBusinessStatus,
  deleteBusiness
}) => {
  const { getAuthHeaders } = useAdmin();
  const [serviceProviders, setServiceProviders] = useState(propServiceProviders || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'status', 'delete'
  const [filters, setFilters] = useState({
    status: propStatusFilter || 'all',
    businessType: '',
    location: ''
  });
  const [searchTerm, setSearchTermState] = useState(propSearchTerm || '');
  const [sortBy, setSortBy] = useState('businessName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pagination, setPagination] = useState({
    currentPage: propCurrentPage || 1,
    totalPages: propTotalPages || 1,
    totalProviders: 0
  });

  // Form states
  const [statusForm, setStatusForm] = useState({ status: '', reason: '' });
  const [deleteForm, setDeleteForm] = useState({ reason: '' });
  const [verificationForm, setVerificationForm] = useState({ isVerified: false, note: '' });
  const [submitting, setSubmitting] = useState(false);

  // Update local state when props change
  useEffect(() => {
    console.log('🔍 AdminServiceProvidersDashboard: Props changed:', {
      propServiceProviders: propServiceProviders?.length || 0,
      propTotalPages,
      propCurrentPage,
      propStatusFilter,
      propSearchTerm,
      propDataLoading
    });
    
    if (propServiceProviders) {
      setServiceProviders(propServiceProviders);
    }
    if (propTotalPages) {
      setPagination(prev => ({ ...prev, totalPages: propTotalPages }));
    }
    if (propCurrentPage) {
      setPagination(prev => ({ ...prev, currentPage: propCurrentPage }));
    }
    if (propStatusFilter) {
      setFilters(prev => ({ ...prev, status: propStatusFilter }));
    }
    if (propSearchTerm) {
      setSearchTermState(propSearchTerm);
    }
  }, [propServiceProviders, propTotalPages, propCurrentPage, propStatusFilter, propSearchTerm, propDataLoading]);

  const handleStatusUpdate = async () => {
    try {
      setSubmitting(true);
      await updateBusinessStatus(selectedProvider._id, statusForm.status);
      
      // Update local state
      setServiceProviders(prev => prev.map(provider => 
        provider._id === selectedProvider._id 
          ? { ...provider, status: statusForm.status, statusReason: statusForm.reason }
          : provider
      ));

      setShowModal(false);
      setStatusForm({ status: '', reason: '' });
      setSelectedProvider(null);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await deleteBusiness(selectedProvider._id);
      
      // Remove from local state
      setServiceProviders(prev => prev.filter(provider => provider._id !== selectedProvider._id));

      setShowModal(false);
      setDeleteForm({ reason: '' });
      setSelectedProvider(null);
    } catch (error) {
      console.error('Error deleting provider:', error);
      setError('Failed to delete provider');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerificationUpdate = async () => {
    try {
      setSubmitting(true);
      
      const response = await fetch(`http://localhost:5000/api/business/${selectedProvider._id}/verification/decision`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          decision: verificationForm.isVerified ? 'approve' : 'reject',
          note: verificationForm.note
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update verification status');
      }

      // Update local state
      setServiceProviders(prev => prev.map(provider => 
        provider._id === selectedProvider._id 
          ? { 
              ...provider, 
              verification: { 
                ...provider.verification, 
                isVerified: verificationForm.isVerified 
              } 
            }
          : provider
      ));

      setShowModal(false);
      setVerificationForm({ isVerified: false, note: '' });
      setSelectedProvider(null);
    } catch (error) {
      console.error('Error updating verification:', error);
      setError('Failed to update verification status');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (type, provider) => {
    setModalType(type);
    setSelectedProvider(provider);
    setShowModal(true);
    
    // Reset forms
    if (type === 'status') {
      setStatusForm({ status: provider.status, reason: provider.statusReason || '' });
    } else if (type === 'delete') {
      setDeleteForm({ reason: '' });
    } else if (type === 'verification') {
      setVerificationForm({ 
        isVerified: !provider.verification?.isVerified, 
        note: '' 
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProvider(null);
    setStatusForm({ status: '', reason: '' });
    setDeleteForm({ reason: '' });
    setVerificationForm({ isVerified: false, note: '' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return (
        <svg className="status-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      );
      case 'pending': return (
        <svg className="status-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      );
      case 'suspended': return (
        <svg className="status-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
      case 'rejected': return (
        <svg className="status-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      );
      case 'inactive': return (
        <svg className="status-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
      default: return (
        <svg className="status-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'active';
      case 'pending': return 'pending';
      case 'suspended': return 'suspended';
      case 'rejected': return 'rejected';
      case 'inactive': return 'inactive';
      default: return 'pending';
    }
  };

  const getBusinessTypeIcon = (businessType) => {
    switch (businessType) {
      case 'plumbing': return (
        <svg className="business-type-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
      case 'electrical': return (
        <svg className="business-type-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
        </svg>
      );
      case 'food': return (
        <svg className="business-type-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
        </svg>
      );
      case 'cleaning': return (
        <svg className="business-type-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.36 2.72l1.42 1.42-5.46 5.46 1.42 1.42 5.46-5.46 1.42 1.42L18.36 2.72c-.55-.55-1.47-.55-2.02 0zM12 1c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
        </svg>
      );
      case 'health': return (
        <svg className="business-type-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
        </svg>
      );
      default: return (
        <svg className="business-type-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    if (propSetCurrentPage) {
      propSetCurrentPage(page);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return (
      <svg className="sort-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 10l5 5 5-5z"/>
      </svg>
    );
    return sortOrder === 'asc' ? (
      <svg className="sort-icon sort-up" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 14l5-5 5 5z"/>
      </svg>
    ) : (
      <svg className="sort-icon sort-down" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 10l5 5 5-5z"/>
      </svg>
    );
  };

  console.log('🔍 AdminServiceProvidersDashboard: Loading check - propDataLoading:', propDataLoading);
  
  // Only show loading if we're actually loading and have no data
  if (propDataLoading && (!propServiceProviders || propServiceProviders.length === 0)) {
    return (
      <div className="admin-service-providers-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading service providers...</p>
        </div>
      </div>
    );
  }
  
  // Always render the component, even if there's no data

  // Apply filters to the data
  const getFilteredProviders = () => {
    let filtered = propServiceProviders && propServiceProviders.length > 0 ? propServiceProviders : serviceProviders;
    
    // Apply business type filter
    if (filters.businessType) {
      filtered = filtered.filter(provider => provider.businessType === filters.businessType);
    }
    
    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(provider => 
        provider.location?.city === filters.location || 
        provider.location?.area === filters.location
      );
    }
    
    return filtered;
  };

  // Determine which providers to display
  const providersToDisplay = getFilteredProviders();
  
  // Debug logging
  console.log('🔍 AdminServiceProvidersDashboard: Debug info:', {
    propServiceProviders: propServiceProviders?.length || 0,
    serviceProviders: serviceProviders?.length || 0,
    providersToDisplay: providersToDisplay?.length || 0,
    propDataLoading,
    loading
  });

  return (
    <div className="admin-service-providers-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <svg className="header-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <h2>Service Providers Management</h2>
                         <span className="provider-count">
               {providersToDisplay.length} providers found
               {(filters.businessType || filters.location) && (
                 <span className="filter-indicator">
                   (filtered from {propServiceProviders?.length || serviceProviders?.length || 0})
                 </span>
               )}
             </span>
          </div>
          <button onClick={() => window.location.reload()} className="refresh-button">
            <svg className="refresh-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{providersToDisplay.length}</h3>
            <p className="stat-label">Total Providers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{providersToDisplay.filter(p => p.status === 'active').length}</h3>
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
            <h3 className="stat-number">{providersToDisplay.filter(p => p.status === 'pending').length}</h3>
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
            <h3 className="stat-number">{providersToDisplay.filter(p => p.status === 'suspended').length}</h3>
            <p className="stat-label">Suspended</p>
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
            placeholder="Search service providers..."
            value={searchTerm}
            onChange={(e) => {
              const newSearchTerm = e.target.value;
              setSearchTermState(newSearchTerm);
              if (propSetSearchTerm) {
                propSetSearchTerm(newSearchTerm);
              }
            }}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => {
                const newStatus = e.target.value;
                setFilters(prev => ({ ...prev, status: newStatus }));
                if (propSetStatusFilter) {
                  propSetStatusFilter(newStatus);
                }
              }}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Business Type</label>
            <select
              value={filters.businessType}
              onChange={(e) => setFilters(prev => ({ ...prev, businessType: e.target.value }))}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="cleaning">Cleaning</option>
              <option value="food">Food</option>
              <option value="health">Health</option>
              <option value="transport">Transport</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Location</label>
            <select
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="filter-select"
            >
              <option value="">All Locations</option>
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Faisalabad">Faisalabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
            </select>
          </div>
          
          <div className="filter-group">
            <button
              onClick={() => setFilters({ status: 'all', businessType: '', location: '' })}
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

      {/* Service Providers Table */}
      <div className="table-container">
        {propDataLoading && (!propServiceProviders || propServiceProviders.length === 0) ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading service providers...</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="service-providers-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('businessName')} className="sortable">
                    Business Name {getSortIcon('businessName')}
                  </th>
                  <th onClick={() => handleSort('owner')} className="sortable">
                    Owner {getSortIcon('owner')}
                  </th>
                  <th onClick={() => handleSort('businessType')} className="sortable">
                    Type {getSortIcon('businessType')}
                  </th>
                  <th onClick={() => handleSort('location')} className="sortable">
                    Location {getSortIcon('location')}
                  </th>
                  <th onClick={() => handleSort('status')} className="sortable">
                    Status {getSortIcon('status')}
                  </th>
                                     <th onClick={() => handleSort('emailVerified')} className="sortable">
                     Email Verified {getSortIcon('emailVerified')}
                   </th>
                   <th onClick={() => handleSort('businessVerified')} className="sortable">
                     Business Verified {getSortIcon('businessVerified')}
                   </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!propDataLoading && providersToDisplay.length === 0) ? (
                  <tr>
                                         <td colSpan="8" className="empty-state">
                      <div className="empty-content">
                        <svg className="empty-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <h3>No service providers found</h3>
                        <p>Try adjusting your filters or search terms</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  providersToDisplay.map((provider) => (
                    <tr key={provider._id} className={`provider-row ${getStatusClass(provider.status)}`}>
                      <td className="business-name-cell">
                        <div className="business-info">
                          <div className="business-name">{provider.businessName}</div>
                          <div className="business-id">ID: {provider._id}</div>
                        </div>
                      </td>
                      <td className="owner-cell">
                        <div className="owner-info">
                          <div className="owner-name">{provider.owner?.firstName} {provider.owner?.lastName}</div>
                          <div className="owner-email">{provider.owner?.email}</div>
                          {provider.owner?.phone && (
                            <div className="owner-phone">{provider.owner.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="type-cell">
                        <div className="type-info">
                          {getBusinessTypeIcon(provider.businessType)}
                          <span className="type-text">{provider.businessType}</span>
                        </div>
                      </td>
                      <td className="location-cell">
                        <div className="location-info">
                          <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          <span>{provider.location?.city || 'N/A'}</span>
                          {provider.location?.area && (
                            <span className="area">{provider.location.area}</span>
                          )}
                        </div>
                      </td>
                      <td className="status-cell">
                        <div className="status-info">
                          {getStatusIcon(provider.status)}
                          <span className={`status-badge ${getStatusClass(provider.status)}`}>
                            {provider.status}
                          </span>
                          {provider.statusReason && (
                            <div className="status-reason">{provider.statusReason}</div>
                          )}
                        </div>
                      </td>
                                             <td className="verification-cell">
                         <div className="verification-info">
                           <span className={`verification-badge ${provider.owner?.emailVerified ? 'verified' : 'unverified'}`}>
                             {provider.owner?.emailVerified ? (
                               <>
                                 <svg className="verification-icon" viewBox="0 0 24 24" fill="currentColor">
                                   <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                 </svg>
                                 Email Verified
                               </>
                             ) : (
                               <>
                                 <svg className="verification-icon" viewBox="0 0 24 24" fill="currentColor">
                                   <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                 </svg>
                                 Email Unverified
                               </>
                             )}
                           </span>
                         </div>
                       </td>
                       <td className="verification-cell">
                         <div className="verification-info">
                           <span className={`verification-badge ${provider.verification?.isVerified ? 'verified' : 'unverified'}`}>
                             {provider.verification?.isVerified ? (
                               <>
                                 <svg className="verification-icon" viewBox="0 0 24 24" fill="currentColor">
                                   <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                 </svg>
                                 Business Verified
                               </>
                             ) : (
                               <>
                                 <svg className="verification-icon" viewBox="0 0 24 24" fill="currentColor">
                                   <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                 </svg>
                                 Business Unverified
                               </>
                             )}
                           </span>
                         </div>
                       </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button
                            onClick={() => openModal('view', provider)}
                            className="action-btn view-btn"
                            title="View Details"
                          >
                            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => openModal('verification', provider)}
                            className="action-btn verification-btn"
                            title={provider.verification?.isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
                          >
                            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => openModal('status', provider)}
                            className="action-btn edit-btn"
                            title="Update Status"
                          >
                            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => openModal('delete', provider)}
                            className="action-btn delete-btn"
                            title="Delete Provider"
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
      {(pagination.totalPages > 1 || propTotalPages > 1) && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(Math.max(1, (propCurrentPage || pagination.currentPage) - 1))}
            disabled={(propCurrentPage || pagination.currentPage) === 1}
            className="pagination-btn prev-btn"
          >
            <svg className="pagination-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
            Previous
          </button>
          
          <div className="pagination-info">
            <span className="current-page">{propCurrentPage || pagination.currentPage}</span>
            <span className="separator">of</span>
            <span className="total-pages">{propTotalPages || pagination.totalPages}</span>
          </div>
          
          <button
            onClick={() => handlePageChange(Math.min((propTotalPages || pagination.totalPages), (propCurrentPage || pagination.currentPage) + 1))}
            disabled={(propCurrentPage || pagination.currentPage) === (propTotalPages || pagination.totalPages)}
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
      {showModal && selectedProvider && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <svg className="modal-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <h3>
                  {modalType === 'view' && 'Provider Details'}
                  {modalType === 'status' && 'Update Status'}
                  {modalType === 'delete' && 'Delete Provider'}
                  {modalType === 'verification' && 'Update Verification'}
                </h3>
              </div>
              <button onClick={closeModal} className="modal-close">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="modal-content">
                             {/* View Modal */}
               {modalType === 'view' && (
                 <div className="provider-details">
                   <div className="detail-section">
                     <h5 className="section-title">Business Information</h5>
                     <div className="detail-item">
                       <span className="detail-label">Business Name</span>
                       <span className="detail-value">{selectedProvider.businessName}</span>
                     </div>
                     <div className="detail-item">
                       <span className="detail-label">Business ID</span>
                       <span className="detail-value">{selectedProvider._id}</span>
                     </div>
                     <div className="detail-item">
                       <span className="detail-label">Business Type</span>
                       <span className="detail-value">{selectedProvider.businessType}</span>
                     </div>
                     <div className="detail-item">
                       <span className="detail-label">Status</span>
                       <span className="detail-value">
                         <span className={`status-badge ${getStatusClass(selectedProvider.status)}`}>
                           {selectedProvider.status}
                         </span>
                       </span>
                     </div>
                     {selectedProvider.statusReason && (
                       <div className="detail-item">
                         <span className="detail-label">Status Reason</span>
                         <span className="detail-value">{selectedProvider.statusReason}</span>
                       </div>
                     )}
                     <div className="detail-item">
                       <span className="detail-label">Created</span>
                       <span className="detail-value">{new Date(selectedProvider.createdAt).toLocaleString()}</span>
                     </div>
                     {selectedProvider.updatedAt && (
                       <div className="detail-item">
                         <span className="detail-label">Last Updated</span>
                         <span className="detail-value">{new Date(selectedProvider.updatedAt).toLocaleString()}</span>
                       </div>
                     )}
                   </div>

                   <div className="detail-section">
                     <h5 className="section-title">Owner Information</h5>
                     <div className="detail-item">
                       <span className="detail-label">Full Name</span>
                       <span className="detail-value">{selectedProvider.owner?.firstName} {selectedProvider.owner?.lastName}</span>
                     </div>
                     <div className="detail-item">
                       <span className="detail-label">Email</span>
                       <span className="detail-value">{selectedProvider.owner?.email}</span>
                     </div>
                     {selectedProvider.owner?.phone && (
                       <div className="detail-item">
                         <span className="detail-label">Phone</span>
                         <span className="detail-value">{selectedProvider.owner.phone}</span>
                       </div>
                     )}
                                            <div className="detail-item">
                         <span className="detail-label">Email Verified</span>
                         <span className="detail-value">
                           <span className={`verification-badge ${selectedProvider.owner?.emailVerified ? 'verified' : 'unverified'}`}>
                             {selectedProvider.owner?.emailVerified ? '✓ Email Verified' : '✗ Email Unverified'}
                           </span>
                         </span>
                       </div>
                       <div className="detail-item">
                         <span className="detail-label">Business Verified</span>
                         <span className="detail-value">
                           <span className={`verification-badge ${selectedProvider.verification?.isVerified ? 'verified' : 'unverified'}`}>
                             {selectedProvider.verification?.isVerified ? '✓ Business Verified' : '✗ Business Unverified'}
                           </span>
                         </span>
                       </div>
                     {selectedProvider.owner?._id && (
                       <div className="detail-item">
                         <span className="detail-label">Owner ID</span>
                         <span className="detail-value">{selectedProvider.owner._id}</span>
                       </div>
                     )}
                   </div>

                   <div className="detail-section">
                     <h5 className="section-title">Location Information</h5>
                     <div className="detail-item">
                       <span className="detail-label">City</span>
                       <span className="detail-value">{selectedProvider.location?.city || 'N/A'}</span>
                     </div>
                     {selectedProvider.location?.area && (
                       <div className="detail-item">
                         <span className="detail-label">Area</span>
                         <span className="detail-value">{selectedProvider.location.area}</span>
                       </div>
                     )}
                     {selectedProvider.location?.address && (
                       <div className="detail-item">
                         <span className="detail-label">Address</span>
                         <span className="detail-value">{selectedProvider.location.address}</span>
                       </div>
                     )}
                     {selectedProvider.location?.coordinates && (
                       <div className="detail-item">
                         <span className="detail-label">Coordinates</span>
                         <span className="detail-value">
                           {selectedProvider.location.coordinates.lat}, {selectedProvider.location.coordinates.lng}
                         </span>
                       </div>
                     )}
                   </div>

                   {selectedProvider.description && (
                     <div className="detail-section">
                       <h5 className="section-title">Business Description</h5>
                       <div className="detail-item">
                         <span className="detail-label">Description</span>
                         <span className="detail-value">{selectedProvider.description}</span>
                       </div>
                     </div>
                   )}

                   {selectedProvider.services && selectedProvider.services.length > 0 && (
                     <div className="detail-section">
                       <h5 className="section-title">Services Offered</h5>
                       <div className="detail-item">
                         <span className="detail-label">Services</span>
                         <span className="detail-value">
                           {selectedProvider.services.join(', ')}
                         </span>
                       </div>
                     </div>
                   )}

                   {selectedProvider.contact && (
                     <div className="detail-section">
                       <h5 className="section-title">Contact Information</h5>
                       {selectedProvider.contact.phone && (
                         <div className="detail-item">
                           <span className="detail-label">Business Phone</span>
                           <span className="detail-value">{selectedProvider.contact.phone}</span>
                         </div>
                       )}
                       {selectedProvider.contact.email && (
                         <div className="detail-item">
                           <span className="detail-label">Business Email</span>
                           <span className="detail-value">{selectedProvider.contact.email}</span>
                         </div>
                       )}
                       {selectedProvider.contact.website && (
                         <div className="detail-item">
                           <span className="detail-label">Website</span>
                           <span className="detail-value">
                             <a href={selectedProvider.contact.website} target="_blank" rel="noopener noreferrer">
                               {selectedProvider.contact.website}
                             </a>
                           </span>
                         </div>
                       )}
                     </div>
                   )}
                 </div>
               )}

              {/* Status Update Modal */}
              {modalType === 'status' && (
                <div className="status-form">
                  <div className="form-group">
                    <label className="form-label">New Status</label>
                    <select
                      value={statusForm.status}
                      onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                      className="form-select"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                      <option value="rejected">Rejected</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reason (Optional)</label>
                    <textarea
                      value={statusForm.reason}
                      onChange={(e) => setStatusForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Add a reason for this status change..."
                      rows="3"
                      className="form-textarea"
                    />
                  </div>
                </div>
              )}

              {/* Delete Modal */}
              {modalType === 'delete' && (
                <div className="delete-form">
                  <div className="form-group">
                    <label className="form-label">Reason for Deletion</label>
                    <textarea
                      value={deleteForm.reason}
                      onChange={(e) => setDeleteForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Please provide a reason for deleting this service provider..."
                      rows="4"
                      className="form-textarea"
                      required
                    />
                  </div>
                  <div className="warning-message">
                    <svg className="warning-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                    <p>This action cannot be undone. The service provider will be permanently removed from the system.</p>
                  </div>
                </div>
              )}

              {/* Verification Modal */}
              {modalType === 'verification' && (
                <div className="verification-form">
                  <div className="form-group">
                    <label className="form-label">Verification Status</label>
                    <div className="verification-toggle">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={verificationForm.isVerified}
                          onChange={(e) => setVerificationForm(prev => ({ ...prev, isVerified: e.target.checked }))}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-text">
                          {verificationForm.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Note (Optional)</label>
                    <textarea
                      value={verificationForm.note}
                      onChange={(e) => setVerificationForm(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Add a note about this verification decision..."
                      rows="3"
                      className="form-textarea"
                    />
                  </div>
                  <div className="verification-info">
                    <p>
                      <strong>Current Status:</strong> {selectedProvider.verification?.isVerified ? 'Verified' : 'Unverified'}
                    </p>
                    <p>
                      <strong>Business:</strong> {selectedProvider.businessName}
                    </p>
                    <p>
                      <strong>Owner:</strong> {selectedProvider.owner?.firstName} {selectedProvider.owner?.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={closeModal} className="modal-btn cancel-btn">
                Cancel
              </button>
              {modalType === 'status' && (
                <button onClick={handleStatusUpdate} disabled={submitting} className="modal-btn save-btn">
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
                      Update Status
                    </>
                  )}
                </button>
              )}
              {modalType === 'delete' && (
                <button onClick={handleDelete} disabled={submitting} className="modal-btn delete-btn">
                  {submitting ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                      Delete Provider
                    </>
                  )}
                </button>
              )}
              {modalType === 'verification' && (
                <button onClick={handleVerificationUpdate} disabled={submitting} className="modal-btn save-btn">
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
                      Update Verification
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>&times;</button>
        </div>
      )}
    </div>
  );
};

export default AdminServiceProvidersDashboard;
