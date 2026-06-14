import React, { useState, useEffect, useContext } from 'react';
import { FaEye, FaEdit, FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle, FaSpinner, FaFilter, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useAdmin } from '../context/AdminContext';
import './AdminComplaintsDashboard.css';

const AdminComplaintsDashboard = ({ 
  complaints: propComplaints, 
  totalPages: propTotalPages, 
  currentPage: propCurrentPage, 
  setCurrentPage: propSetCurrentPage,
  statusFilter: propStatusFilter,
  setStatusFilter: propSetStatusFilter,
  searchTerm: propSearchTerm,
  setSearchTerm: propSetSearchTerm,
  dataLoading: propDataLoading,
  updateReviewStatus,
  deleteBusiness,
  updateBusinessStatus
}) => {
  const { getAuthHeaders } = useAdmin();
  const [complaints, setComplaints] = useState(propComplaints || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'status', 'resolve', 'note'
  const [filters, setFilters] = useState({
    status: propStatusFilter || '',
    priority: '',
    severity: '',
    serviceCategory: ''
  });
  const [searchTerm, setSearchTermState] = useState(propSearchTerm || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({
    currentPage: propCurrentPage || 1,
    totalPages: propTotalPages || 1,
    totalComplaints: 0
  });

  // Form states
  const [statusForm, setStatusForm] = useState({ status: '', note: '' });
  const [resolveForm, setResolveForm] = useState({ actionTaken: '', resolutionNote: '' });
  const [noteForm, setNoteForm] = useState({ note: '' });
  const [submitting, setSubmitting] = useState(false);

  // Update local state when props change
  useEffect(() => {
    console.log('🔍 AdminComplaintsDashboard: Props changed:', {
      propComplaints: propComplaints?.length || 0,
      propTotalPages,
      propCurrentPage,
      propStatusFilter,
      propSearchTerm,
      propDataLoading
    });
    
    if (propComplaints) {
      setComplaints(propComplaints);
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
  }, [propComplaints, propTotalPages, propCurrentPage, propStatusFilter, propSearchTerm]);

  useEffect(() => {
    // Always fetch complaints if none are provided from props
    if (!propComplaints || propComplaints.length === 0) {
      console.log('🔍 AdminComplaintsDashboard: No complaints from props, fetching independently...');
      fetchComplaints();
    } else {
      console.log('🔍 AdminComplaintsDashboard: Using complaints from props:', propComplaints.length);
      setLoading(false);
    }
  }, [propComplaints]);

  // Separate effect for filters and pagination changes
  useEffect(() => {
    if (propComplaints && propComplaints.length > 0) {
      // If we have props, don't fetch independently
      return;
    }
    
    // Only fetch if we're managing our own data
    if (filters.status || filters.priority || filters.severity || filters.serviceCategory || searchTerm || sortBy || sortOrder || pagination.currentPage !== 1) {
      console.log('🔍 AdminComplaintsDashboard: Filters/pagination changed, fetching complaints...');
      fetchComplaints();
    }
  }, [filters, searchTerm, sortBy, sortOrder, pagination.currentPage]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: 20,
        ...filters,
        sortBy,
        sortOrder
      });

      // Use the admin complaints API endpoint with admin headers
      const response = await fetch(`http://localhost:5000/api/admin/complaints?${queryParams}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }

      const data = await response.json();
      console.log('🔍 AdminComplaintsDashboard: Fetched complaints data:', data);
      setComplaints(data.complaints || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.pagination?.totalPages || 1,
        totalComplaints: data.pagination?.totalComplaints || 0
      }));
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`http://localhost:5000/api/admin/complaints/${selectedComplaint._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(statusForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setComplaints(prev => prev.map(c => 
        c._id === selectedComplaint._id 
          ? { ...c, status: statusForm.status }
          : c
      ));

      setShowModal(false);
      setStatusForm({ status: '', note: '' });
      setSelectedComplaint(null);
      fetchComplaints(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`http://localhost:5000/api/admin/complaints/${selectedComplaint._id}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(resolveForm)
      });

      if (!response.ok) {
        throw new Error('Failed to resolve complaint');
      }

      // Update local state
      setComplaints(prev => prev.map(c => 
        c._id === selectedComplaint._id 
          ? { ...c, status: 'resolved', resolution: resolveForm }
          : c
      ));

      setShowModal(false);
      setResolveForm({ actionTaken: '', resolutionNote: '' });
      setSelectedComplaint(null);
      fetchComplaints(); // Refresh the list
    } catch (error) {
      console.error('Error resolving complaint:', error);
      setError('Failed to resolve complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`http://localhost:5000/api/admin/complaints/${selectedComplaint._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(noteForm)
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      setShowModal(false);
      setNoteForm({ note: '' });
      setSelectedComplaint(null);
      fetchComplaints(); // Refresh the list
    } catch (error) {
      console.error('Error adding note:', error);
      setError('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (type, complaint) => {
    setModalType(type);
    setSelectedComplaint(complaint);
    setShowModal(true);
    
    // Reset forms
    if (type === 'status') {
      setStatusForm({ status: complaint.status, note: '' });
    } else if (type === 'resolve') {
      setResolveForm({ actionTaken: '', resolutionNote: '' });
    } else if (type === 'note') {
      setNoteForm({ note: '' });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
    setStatusForm({ status: '', note: '' });
    setResolveForm({ actionTaken: '', resolutionNote: '' });
    setNoteForm({ note: '' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock className="status-icon pending" />;
      case 'under_review': return <FaEye className="status-icon reviewing" />;
      case 'investigating': return <FaExclamationTriangle className="status-icon investigating" />;
      case 'resolved': return <FaCheckCircle className="status-icon resolved" />;
      case 'closed': return <FaCheckCircle className="status-icon closed" />;
      case 'rejected': return <FaTimesCircle className="status-icon rejected" />;
      default: return <FaClock className="status-icon pending" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'under_review': return 'reviewing';
      case 'investigating': return 'investigating';
      case 'resolved': return 'resolved';
      case 'closed': return 'closed';
      case 'rejected': return 'rejected';
      default: return 'pending';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'urgent';
      case 'high': return 'high';
      case 'normal': return 'normal';
      case 'low': return 'low';
      default: return 'normal';
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    // Also update parent component if available
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
    if (sortBy !== field) return <FaSort />;
    return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  if (loading || propDataLoading) {
    console.log('🔍 AdminComplaintsDashboard: Loading state - loading:', loading, 'propDataLoading:', propDataLoading);
    return (
      <div className="admin-complaints-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading complaints...</p>
        </div>
      </div>
    );
  }

  console.log('🔍 AdminComplaintsDashboard: Rendering with data:', {
    complaints: complaints.length,
    propComplaints: propComplaints?.length || 0,
    totalComplaints: pagination.totalComplaints,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    filters,
    searchTerm
  });

  // Determine which complaints to display
  const complaintsToDisplay = propComplaints && propComplaints.length > 0 ? propComplaints : complaints;
  console.log('🔍 AdminComplaintsDashboard: Complaints to display:', complaintsToDisplay.length);

  return (
    <div className="admin-complaints-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <svg className="header-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <h2>Complaints Management</h2>
            <span className="complaint-count">{pagination.totalComplaints || complaintsToDisplay.length} complaints found</span>
          </div>
          <button onClick={fetchComplaints} className="refresh-button">
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
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{pagination.totalComplaints || complaintsToDisplay.length}</h3>
            <p className="stat-label">Total Complaints</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{complaintsToDisplay.filter(c => c.status === 'pending').length}</h3>
            <p className="stat-label">Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{complaintsToDisplay.filter(c => c.status === 'under_review').length}</h3>
            <p className="stat-label">Under Review</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{complaintsToDisplay.filter(c => c.status === 'resolved').length}</h3>
            <p className="stat-label">Resolved</p>
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
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => {
              const newSearchTerm = e.target.value;
              setSearchTermState(newSearchTerm);
              // Also update parent component if available
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
                // Also update parent component if available
                if (propSetStatusFilter) {
                  propSetStatusFilter(newStatus);
                }
              }}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="filter-select"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="filter-select"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              value={filters.serviceCategory}
              onChange={(e) => setFilters(prev => ({ ...prev, serviceCategory: e.target.value }))}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="cleaning">Cleaning</option>
              <option value="painting">Painting</option>
              <option value="gardening">Gardening</option>
              <option value="repair">Repair</option>
              <option value="transport">Transport</option>
              <option value="security">Security</option>
              <option value="education">Education</option>
              <option value="food">Food</option>
              <option value="beauty">Beauty</option>
              <option value="health">Health</option>
              <option value="construction">Construction</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading complaints...</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('createdAt')} className="sortable">
                    Date {getSortIcon('createdAt')}
                  </th>
                  <th onClick={() => handleSort('title')} className="sortable">
                    Issue {getSortIcon('title')}
                  </th>
                  <th onClick={() => handleSort('serviceCategory')} className="sortable">
                    Category {getSortIcon('serviceCategory')}
                  </th>
                  <th>Complainant</th>
                  <th>Business</th>
                  <th onClick={() => handleSort('severity')} className="sortable">
                    Severity {getSortIcon('severity')}
                  </th>
                  <th onClick={() => handleSort('priority')} className="sortable">
                    Priority {getSortIcon('priority')}
                  </th>
                  <th onClick={() => handleSort('status')} className="sortable">
                    Status {getSortIcon('status')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaintsToDisplay.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-state">
                      <div className="empty-content">
                        <svg className="empty-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <h3>No complaints found</h3>
                        <p>Try adjusting your filters or search terms</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  complaintsToDisplay.map((complaint) => (
                    <tr key={complaint._id} className={`complaint-row ${getStatusClass(complaint.status)}`}>
                      <td className="date-cell">
                        <div className="date-info">
                          <div className="date-main">{new Date(complaint.createdAt).toLocaleDateString()}</div>
                          <div className="date-time">{new Date(complaint.createdAt).toLocaleTimeString()}</div>
                        </div>
                      </td>
                      <td className="issue-cell">
                        <div className="issue-info">
                          <div className="issue-title">{complaint.title}</div>
                          <div className="issue-description">{complaint.description.substring(0, 100)}...</div>
                        </div>
                      </td>
                      <td className="category-cell">
                        <span className={`category-badge ${complaint.serviceCategory}`}>
                          {complaint.serviceCategory}
                        </span>
                      </td>
                      <td className="complainant-cell">
                        <div className="complainant-info">
                          <div className="complainant-name">{complaint.userId?.firstName} {complaint.userId?.lastName}</div>
                          <div className="complainant-email">{complaint.userEmail}</div>
                          {complaint.userId?.phone && (
                            <div className="complainant-phone">{complaint.userId.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="business-cell">
                        <div className="business-info">
                          <div className="business-name">{complaint.businessId?.businessName}</div>
                          <div className="business-type">{complaint.businessId?.businessType}</div>
                          {complaint.businessId?.location?.city && (
                            <div className="business-location">{complaint.businessId.location.city}</div>
                          )}
                        </div>
                      </td>
                      <td className="severity-cell">
                        <span className={`severity-badge ${getSeverityClass(complaint.severity)}`}>
                          {complaint.severity}
                        </span>
                      </td>
                      <td className="priority-cell">
                        <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="status-cell">
                        <div className="status-info">
                          {getStatusIcon(complaint.status)}
                          <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                            {complaint.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button
                            onClick={() => openModal('view', complaint)}
                            className="action-btn view-btn"
                            title="View Details"
                          >
                            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => openModal('status', complaint)}
                            className="action-btn edit-btn"
                            title="Update Status"
                          >
                            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                          {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                            <button
                              onClick={() => openModal('resolve', complaint)}
                              className="action-btn resolve-btn"
                              title="Resolve Complaint"
                            >
                              <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => openModal('note', complaint)}
                            className="action-btn note-btn"
                            title="Add Note"
                          >
                            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
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
      {showModal && selectedComplaint && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <svg className="modal-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <h3>
                  {modalType === 'view' && 'Complaint Details'}
                  {modalType === 'status' && 'Update Status'}
                  {modalType === 'resolve' && 'Resolve Complaint'}
                  {modalType === 'note' && 'Add Admin Note'}
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
                <div className="complaint-details">
                  <div className="detail-section">
                    <h5 className="section-title">Complaint Information</h5>
                    <div className="detail-item">
                      <span className="detail-label">Title</span>
                      <span className="detail-value">{selectedComplaint.title}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Description</span>
                      <span className="detail-value">{selectedComplaint.description}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Category</span>
                      <span className="detail-value">{selectedComplaint.serviceCategory}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Severity</span>
                      <span className="detail-value">{selectedComplaint.severity}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status</span>
                      <span className="detail-value">{selectedComplaint.status}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Priority</span>
                      <span className="detail-value">{selectedComplaint.priority}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Created</span>
                      <span className="detail-value">{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h5 className="section-title">Complainant Information</h5>
                    <div className="detail-item">
                      <span className="detail-label">Name</span>
                      <span className="detail-value">{selectedComplaint.userId?.firstName} {selectedComplaint.userId?.lastName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{selectedComplaint.userEmail}</span>
                    </div>
                    {selectedComplaint.userId?.phone && (
                      <div className="detail-item">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">{selectedComplaint.userId.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <h5 className="section-title">Business Information</h5>
                    <div className="detail-item">
                      <span className="detail-label">Name</span>
                      <span className="detail-value">{selectedComplaint.businessId?.businessName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Type</span>
                      <span className="detail-value">{selectedComplaint.businessId?.businessType}</span>
                    </div>
                    {selectedComplaint.businessId?.location?.city && (
                      <div className="detail-item">
                        <span className="detail-label">Location</span>
                        <span className="detail-value">{selectedComplaint.businessId.location.city}</span>
                      </div>
                    )}
                  </div>

                  {selectedComplaint.adminNotes && selectedComplaint.adminNotes.length > 0 && (
                    <div className="detail-section">
                      <h5 className="section-title">Admin Notes</h5>
                      {selectedComplaint.adminNotes.map((note, index) => (
                        <div key={index} className="admin-note">
                          <div className="note-header">
                            <strong>{note.adminId?.firstName} {note.adminId?.lastName}</strong>
                            <span className="note-timestamp">{new Date(note.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="note-content">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedComplaint.resolution && (
                    <div className="detail-section">
                      <h5 className="section-title">Resolution</h5>
                      <div className="detail-item">
                        <span className="detail-label">Action Taken</span>
                        <span className="detail-value">{selectedComplaint.resolution.actionTaken}</span>
                      </div>
                      {selectedComplaint.resolution.description && (
                        <div className="detail-item">
                          <span className="detail-label">Notes</span>
                          <span className="detail-value">{selectedComplaint.resolution.description}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="detail-label">Resolved</span>
                        <span className="detail-value">{new Date(selectedComplaint.resolution.resolvedAt).toLocaleString()}</span>
                      </div>
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
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Admin Note</label>
                    <textarea
                      value={statusForm.note}
                      onChange={(e) => setStatusForm(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Add a note about this status change..."
                      rows="3"
                      className="form-textarea"
                    />
                  </div>
                </div>
              )}

              {/* Resolve Modal */}
              {modalType === 'resolve' && (
                <div className="resolve-form">
                  <div className="form-group">
                    <label className="form-label">Action Taken</label>
                    <textarea
                      value={resolveForm.actionTaken}
                      onChange={(e) => setResolveForm(prev => ({ ...prev, actionTaken: e.target.value }))}
                      placeholder="Describe what action was taken to resolve this complaint..."
                      rows="3"
                      required
                      className="form-textarea"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Resolution Notes</label>
                    <textarea
                      value={resolveForm.resolutionNote}
                      onChange={(e) => setResolveForm(prev => ({ ...prev, resolutionNote: e.target.value }))}
                      placeholder="Additional notes about the resolution..."
                      rows="3"
                      className="form-textarea"
                    />
                  </div>
                </div>
              )}

              {/* Add Note Modal */}
              {modalType === 'note' && (
                <div className="note-form">
                  <div className="form-group">
                    <label className="form-label">Admin Note</label>
                    <textarea
                      value={noteForm.note}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Add an internal note about this complaint..."
                      rows="4"
                      required
                      className="form-textarea"
                    />
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
              {modalType === 'resolve' && (
                <button onClick={handleResolve} disabled={submitting} className="modal-btn save-btn">
                  {submitting ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Resolving...
                    </>
                  ) : (
                    <>
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Resolve Complaint
                    </>
                  )}
                </button>
              )}
              {modalType === 'note' && (
                <button onClick={handleAddNote} disabled={submitting} className="modal-btn save-btn">
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
                      Add Note
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

export default AdminComplaintsDashboard;
