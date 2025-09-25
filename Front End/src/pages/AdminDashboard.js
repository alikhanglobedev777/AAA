import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import AdminComplaintsDashboard from '../components/AdminComplaintsDashboard';
import AdminUsersDashboard from '../components/AdminUsersDashboard';
import AdminServiceProvidersDashboard from '../components/AdminServiceProvidersDashboard';
import AdminUserManagement from '../components/AdminUserManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { admin, updateAdminProfile, logout, getAuthHeaders } = useAdmin();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [serviceProviders, setServiceProviders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Business verification state
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  
  // Settings state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    profilePicture: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const navigate = useNavigate();
  
  // Check for admin authentication only
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (admin) {
      setIsAdmin(true);
      // Fetch dashboard stats for admin
      fetchDashboardStats();
      
      // Check for hash in URL to restore active tab
      const hash = window.location.hash.replace('#', '');
      if (hash && ['overview', 'service-providers', 'business-verification', 'reviews', 'complaints', 'users', 'settings', 'user-management'].includes(hash)) {
        setActiveTab(hash);
      }
    } else {
      // No authentication found, redirect to login
      navigate('/admin');
    }
  }, [admin, navigate]);

  useEffect(() => {
    if (activeTab === 'service-providers') {
      console.log('🔍 AdminDashboard: Service providers tab activated');
      fetchServiceProviders();
    } else if (activeTab === 'reviews') {
      console.log('🔍 AdminDashboard: Reviews tab activated');
      fetchReviews();
    } else if (activeTab === 'complaints') {
      console.log('🔍 AdminDashboard: Complaints tab activated, fetching complaints...');
      fetchComplaints();
    } else if (activeTab === 'users') {
      console.log('🔍 AdminDashboard: Users tab activated');
      fetchUsers();
    } else if (activeTab === 'user-management') {
      console.log('🔍 AdminDashboard: User Management tab activated');
      fetchAdminUsers();
    } else if (activeTab === 'business-verification') {
      console.log('🔍 AdminDashboard: Business Verification tab activated');
      fetchPendingBusinesses();
    }
  }, [activeTab, currentPage, searchTerm, statusFilter, userTypeFilter]);

  // Debug current page changes
  useEffect(() => {
    console.log('🔍 AdminDashboard: Current page changed to:', currentPage);
  }, [currentPage]);

  // Reset page when changing tabs
  useEffect(() => {
    console.log('🔍 AdminDashboard: Active tab changed to:', activeTab);
    setCurrentPage(1);
    
    // All tabs are accessible to admin users
  }, [activeTab]);

  // Debug status filter changes
  useEffect(() => {
    console.log('🔍 AdminDashboard: Status filter changed to:', statusFilter);
  }, [statusFilter]);

  // Debug search term changes
  useEffect(() => {
    console.log('🔍 AdminDashboard: Search term changed to:', searchTerm);
  }, [searchTerm]);

  // Debug complaints state changes
  useEffect(() => {
    console.log('🔍 AdminDashboard: Complaints state changed:', {
      complaints: complaints.length,
      totalPages,
      currentPage,
      statusFilter,
      searchTerm
    });
  }, [complaints, totalPages, currentPage, statusFilter, searchTerm]);

  // Debug service providers state changes
  useEffect(() => {
    console.log('🔍 AdminDashboard: Service providers state changed:', {
      serviceProviders: serviceProviders.length,
      totalPages,
      currentPage,
      statusFilter,
      searchTerm
    });
  }, [serviceProviders, totalPages, currentPage, statusFilter, searchTerm]);

  // Debug data loading state changes
  useEffect(() => {
    console.log('🔍 AdminDashboard: Data loading state changed:', dataLoading);
  }, [dataLoading]);

  // Debug loading state changes
  useEffect(() => {
    console.log('🔍 AdminDashboard: Loading state changed:', loading);
  }, [loading]);

  // Debug admin state changes
  useEffect(() => {
    console.log('🔍 AdminDashboard: Admin state changed:', {
      admin: admin ? { id: admin._id, email: admin.email, role: admin.role } : null
    });
  }, [admin]);
  
  // Update profile form when admin data changes
  useEffect(() => {
    if (admin) {
      setProfileForm({
        fullName: admin.fullName || '',
        email: admin.email || '',
        phone: admin.phone || '',
        profilePicture: admin.profilePicture || ''
      });
    }
  }, [admin]);

  // Debug stats state changes
  useEffect(() => {
    console.log('🔍 AdminDashboard: Stats state changed:', stats);
  }, [stats]);

  const fetchDashboardStats = async () => {
    try {
      console.log('🔍 AdminDashboard: Fetching dashboard stats...');
      const response = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      console.log('🔍 AdminDashboard: Dashboard stats response:', data);
      setStats(data);
    } catch (error) {
      console.error('❌ AdminDashboard: Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceProviders = async () => {
    try {
      console.log('🔍 AdminDashboard: Fetching service providers...');
      setDataLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        status: statusFilter,
        search: searchTerm
      });
      
      console.log('🔍 AdminDashboard: Service providers request params:', params.toString());
      console.log('🔍 AdminDashboard: Auth headers:', getAuthHeaders());
      
      const response = await fetch(`http://localhost:5000/api/admin/service-providers?${params}`, {
        headers: getAuthHeaders()
      });
      
      console.log('🔍 AdminDashboard: Service providers response status:', response.status);
      console.log('🔍 AdminDashboard: Service providers response ok:', response.ok);
      
      const data = await response.json();
      console.log('🔍 AdminDashboard: Service providers response data:', data);
      
      setServiceProviders(data.businesses || []);
      setTotalPages(data.totalPages || 1);
      
      console.log('🔍 AdminDashboard: Set service providers:', data.businesses?.length || 0);
      console.log('🔍 AdminDashboard: Set total pages:', data.totalPages || 1);
    } catch (error) {
      console.error('❌ AdminDashboard: Error fetching service providers:', error);
      setServiceProviders([]);
    } finally {
      setDataLoading(false);
      console.log('🔍 AdminDashboard: Set dataLoading to false');
    }
  };

  const fetchReviews = async () => {
    try {
      console.log('🔍 AdminDashboard: Fetching reviews...');
      setDataLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        status: statusFilter,
        search: searchTerm
      });
      
      console.log('🔍 AdminDashboard: Reviews request params:', params.toString());
      
      const response = await fetch(`http://localhost:5000/api/admin/reviews?${params}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      console.log('🔍 AdminDashboard: Reviews response:', data);
      setReviews(data.reviews || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('❌ AdminDashboard: Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      console.log('🔍 AdminDashboard: Fetching complaints...');
      setDataLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        status: statusFilter
      });
      
      console.log('🔍 AdminDashboard: Request params:', params.toString());
      console.log('🔍 AdminDashboard: Auth headers:', getAuthHeaders());
      
      const response = await fetch(`http://localhost:5000/api/admin/complaints?${params}`, {
        headers: getAuthHeaders()
      });
      
      console.log('🔍 AdminDashboard: Response status:', response.status);
      console.log('🔍 AdminDashboard: Response ok:', response.ok);
      
      const data = await response.json();
      console.log('🔍 AdminDashboard: Response data:', data);
      
      if (data.success) {
        setComplaints(data.complaints || []);
        setTotalPages(data.pagination?.totalPages || 1);
        
        console.log('🔍 AdminDashboard: Set complaints:', data.complaints?.length || 0);
        console.log('🔍 AdminDashboard: Set total pages:', data.pagination?.totalPages || 1);
      } else {
        console.error('❌ AdminDashboard: API returned error:', data.message);
        setComplaints([]);
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Error fetching complaints:', error);
      setComplaints([]);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('🔍 AdminDashboard: Fetching users...');
      setDataLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        userType: userTypeFilter,
        status: statusFilter,
        search: searchTerm
      });
      
      console.log('🔍 AdminDashboard: Users request params:', params.toString());
      
      const response = await fetch(`http://localhost:5000/api/admin/users?${params}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      console.log('🔍 AdminDashboard: Users response:', data);
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('❌ AdminDashboard: Error fetching users:', error);
      setUsers([]);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      console.log('🔍 AdminDashboard: Fetching admin users...');
      setDataLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        role: statusFilter,
        search: searchTerm
      });
      
      console.log('🔍 AdminDashboard: Admin users request params:', params.toString());
      
      const response = await fetch(`http://localhost:5000/api/admin/admin-users?${params}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      console.log('🔍 AdminDashboard: Admin users response:', data);
      setAdminUsers(data.adminUsers || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('❌ AdminDashboard: Error fetching admin users:', error);
      setAdminUsers([]);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchPendingBusinesses = async () => {
    try {
      console.log('🔍 AdminDashboard: Fetching pending businesses...');
      const authHeaders = getAuthHeaders();
      console.log('🔍 AdminDashboard: Auth headers:', JSON.stringify(authHeaders, null, 2));
      console.log('🔍 AdminDashboard: Admin token exists:', !!localStorage.getItem('adminToken'));
      console.log('🔍 AdminDashboard: Admin token:', localStorage.getItem('adminToken'));
      setVerificationLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/business/verification/pending`, {
        headers: authHeaders
      });
      
      console.log('🔍 AdminDashboard: Response status:', response.status);
      console.log('🔍 AdminDashboard: Response ok:', response.ok);
      
      const data = await response.json();
      console.log('🔍 AdminDashboard: Pending businesses response:', data);
      
      console.log('🔍 AdminDashboard: Businesses with documents:', data.pending?.length || 0);
      console.log('🔍 AdminDashboard: Businesses without documents:', data.withoutDocs?.length || 0);
      
      setPendingBusinesses(data.pending || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('❌ AdminDashboard: Error fetching pending businesses:', error);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerificationDecision = async (businessId, decision, note = '') => {
    try {
      console.log('🔍 AdminDashboard: Handling verification decision:', { businessId, decision, note });
      
      const response = await fetch(`http://localhost:5000/api/business/${businessId}/verification/decision`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ decision, note })
      });
      
      if (response.ok) {
        console.log('🔍 AdminDashboard: Verification decision successful');
        fetchPendingBusinesses();
        fetchDashboardStats();
      } else {
        const data = await response.json();
        alert(`Failed to update verification: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Error handling verification decision:', error);
      alert(`Error updating verification: ${error.message}`);
    }
  };

  const updateBusinessStatus = async (businessId, newStatus, reason = '') => {
    // Prompt for reason if suspending or rejecting
    if ((newStatus === 'suspended' || newStatus === 'rejected') && !reason) {
      const userReason = prompt(`Please provide a reason for ${newStatus} this business:`);
      if (!userReason) return; // User cancelled
      reason = userReason;
    }
    
    console.log('🔍 AdminDashboard: Starting updateBusinessStatus:', { businessId, newStatus, reason });
    
    try {
      const headers = getAuthHeaders();
      console.log('🔍 AdminDashboard: Auth headers:', headers);
      
      const requestBody = { status: newStatus, reason };
      console.log('🔍 AdminDashboard: Request body:', requestBody);
      
      const response = await fetch(`http://localhost:5000/api/admin/service-providers/${businessId}/status`, {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('🔍 AdminDashboard: Response status:', response.status);
      console.log('🔍 AdminDashboard: Response ok:', response.ok);
      
      if (response.ok) {
        console.log('🔍 AdminDashboard: Status update successful, refreshing data...');
        fetchServiceProviders();
        fetchDashboardStats();
      } else {
        console.log('🔍 AdminDashboard: Response not ok, trying to parse error...');
        let errorMessage = 'Unknown error';
        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
          console.log('🔍 AdminDashboard: Error response data:', data);
        } catch (parseError) {
          console.error('❌ AdminDashboard: Error parsing response:', parseError);
        }
        alert(`Failed to update status: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Network error in updateBusinessStatus:', error);
      alert(`Network error: ${error.message}`);
    }
  };

  const deleteBusiness = async (businessId) => {
    if (!window.confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      return;
    }
    
    console.log('🔍 AdminDashboard: Deleting business:', businessId);
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/service-providers/${businessId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      console.log('🔍 AdminDashboard: Delete response status:', response.status);
      
      if (response.ok) {
        console.log('🔍 AdminDashboard: Business deleted successfully, refreshing data...');
        fetchServiceProviders();
        fetchDashboardStats();
      } else {
        const data = await response.json();
        console.error('❌ AdminDashboard: Failed to delete business:', data.message);
        alert(`Failed to delete business: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Error deleting business:', error);
      alert(`Error deleting business: ${error.message}`);
    }
  };

  const addAdminUser = async (adminData) => {
    try {
      console.log('🔍 AdminDashboard: Adding admin user:', adminData);
      
      const response = await fetch(`http://localhost:5000/api/admin/admin-users`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      });
      
      if (response.ok) {
        console.log('🔍 AdminDashboard: Admin user added successfully');
        fetchAdminUsers();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to add admin user' };
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Error adding admin user:', error);
      return { success: false, message: `Network error: ${error.message}` };
    }
  };

  const updateAdminUser = async (adminId, updateData) => {
    try {
      console.log('🔍 AdminDashboard: Updating admin user:', { adminId, updateData });
      
      const response = await fetch(`http://localhost:5000/api/admin/admin-users/${adminId}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        console.log('🔍 AdminDashboard: Admin user updated successfully');
        fetchAdminUsers();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to update admin user' };
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Error updating admin user:', error);
      return { success: false, message: `Network error: ${error.message}` };
    }
  };

  const deleteAdminUser = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin user? This action cannot be undone.')) {
      return { success: false, message: 'Operation cancelled' };
    }
    
    try {
      console.log('🔍 AdminDashboard: Deleting admin user:', adminId);
      
      const response = await fetch(`http://localhost:5000/api/admin/admin-users/${adminId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        console.log('🔍 AdminDashboard: Admin user deleted successfully');
        fetchAdminUsers();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to delete admin user' };
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Error deleting admin user:', error);
      return { success: false, message: `Network error: ${error.message}` };
    }
  };

  const updateReviewStatus = async (reviewId, newStatus, reason = '') => {
    try {
      console.log('🔍 AdminDashboard: Updating review status:', { reviewId, newStatus, reason });
      
      const response = await fetch(`http://localhost:5000/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus, reason })
      });
      
      const data = await response.json();
      console.log('🔍 AdminDashboard: Review status update response:', data);
      
      if (response.ok) {
        console.log('🔍 AdminDashboard: Review status updated successfully');
        await fetchReviews();
        await fetchDashboardStats();
      } else {
        console.error('❌ AdminDashboard: Failed to update review status:', data.message);
        alert(`Failed to update review status: ${data.message}`);
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Error updating review status:', error);
      alert(`Error updating review status: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const handleRefresh = async () => {
    console.log('🔍 AdminDashboard: Refresh button clicked, active tab:', activeTab);
    if (activeTab === 'overview') {
      await fetchDashboardStats();
    } else if (activeTab === 'service-providers') {
      await fetchServiceProviders();
    } else if (activeTab === 'reviews') {
      await fetchReviews();
    } else if (activeTab === 'complaints') {
      console.log('🔍 AdminDashboard: Refreshing complaints...');
      await fetchComplaints();
    } else if (activeTab === 'users') {
      console.log('🔍 AdminDashboard: Refreshing users...');
      await fetchUsers();
    } else if (activeTab === 'user-management') {
      console.log('🔍 AdminDashboard: Refreshing admin users...');
      await fetchAdminUsers();
    }
  };

  const updateUser = async (userId, updateData) => {
    try {
      console.log('🔍 AdminDashboard: Updating user:', userId, updateData);
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        console.log('🔍 AdminDashboard: User updated successfully');
        await fetchUsers();
        await fetchDashboardStats();
        alert('User updated successfully');
      } else {
        const data = await response.json();
        console.error('❌ AdminDashboard: Failed to update user:', data.message);
        alert(`Failed to update user: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Error updating user:', error);
      alert(`Error updating user: ${error.message}`);
    }
  };

  const deleteUser = async (userId) => {
    try {
      console.log('🔍 AdminDashboard: Deleting user:', userId);
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        console.log('🔍 AdminDashboard: User deleted successfully');
        await fetchUsers();
        await fetchDashboardStats();
        alert('User deleted successfully');
      } else {
        const data = await response.json();
        console.error('❌ AdminDashboard: Failed to delete user:', data.message);
        alert(`Failed to delete user: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Error deleting user:', error);
      alert(`Error deleting user: ${error.message}`);
    }
  };

  const renderOverview = () => (
    <div className="admin-overview">
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">🏢</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.totalBusinesses || 0}</h3>
            <p className="admin-stat-label">Total Service Providers</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon">⏳</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.pendingBusinesses || 0}</h3>
            <p className="admin-stat-label">Pending Approvals</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.activeBusinesses || 0}</h3>
            <p className="admin-stat-label">Active Providers</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon">⭐</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.totalReviews || 0}</h3>
            <p className="admin-stat-label">Total Reviews</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.totalUsers || 0}</h3>
            <p className="admin-stat-label">Total Users</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👤</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.customerUsers || 0}</h3>
            <p className="admin-stat-label">Customers</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon">🏢</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.businessUsers || 0}</h3>
            <p className="admin-stat-label">Service Providers</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.verifiedUsers || 0}</h3>
            <p className="admin-stat-label">Verified Users</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon">🚨</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.totalComplaints || 0}</h3>
            <p className="admin-stat-label">Complaints</p>
          </div>
        </div>
      </div>
    </div>
  );



  const renderReviews = () => (
    <div className="admin-content-section">
      {/* Reviews Header */}
      <div className="admin-section-header">
        <div className="admin-section-title">
          <h2>Reviews Management</h2>
          <p>Manage and moderate user reviews across all businesses</p>
        </div>
        <div className="admin-section-stats">
          <div className="admin-stat-item">
            <span className="admin-stat-number">{reviews.length}</span>
            <span className="admin-stat-label">Total Reviews</span>
          </div>
          <div className="admin-stat-item">
            <span className="admin-stat-number">
              {reviews.filter(r => r.status === 'active').length}
            </span>
            <span className="admin-stat-label">Active</span>
          </div>
          <div className="admin-stat-item">
            <span className="admin-stat-number">
              {reviews.filter(r => r.status === 'hidden').length}
            </span>
            <span className="admin-stat-label">Hidden</span>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="admin-filters">
        <div className="admin-search-container">
          <div className="admin-search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search reviews by reviewer, business, or comment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>
        <div className="admin-filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="flagged">Flagged</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>
      
      {/* Enhanced Table Container */}
      <div className="admin-table-container">
        {dataLoading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading reviews...</p>
            <small>Please wait while we fetch the latest review data</small>
          </div>
        ) : (
          <table className="admin-table">
            <thead className='admin-reviews-table-header'>
              <tr>
                <th className="admin-th-reviewer">Reviewer</th>
                <th className="admin-th-business">Business</th>
                <th className="admin-th-rating">Rating</th>
                <th className="admin-th-comment">Comment</th>
                <th className="admin-th-status">Status</th>
                <th className="admin-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-no-data">
                    <div className="admin-empty-state">
                      <div className="admin-empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14,2 14,8 20,8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10,9 9,9 8,9"></polyline>
                        </svg>
                      </div>
                      <h3>No reviews found</h3>
                      <p>There are no reviews matching your current filters</p>
                      <small>Try adjusting your search terms or status filter</small>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="admin-review-row">
                    <td className="admin-reviewer-cell">
                      <div className="admin-reviewer-info">
                        <div className="admin-reviewer-avatar">
                          {review.reviewer?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div className="admin-reviewer-details">
                          <span className="admin-reviewer-name">
                            {review.reviewer?.firstName} {review.reviewer?.lastName}
                          </span>
                          <small className="admin-reviewer-email">
                            {review.reviewer?.email || 'No email'}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="admin-business-cell">
                      <div className="admin-business-info">
                        <span className="admin-business-name">
                          {review.business?.businessName || 'Unknown Business'}
                        </span>
                        <small className="admin-business-category">
                          {review.business?.businessType || 'No category'}
                        </small>
                      </div>
                    </td>
                    <td className="admin-rating-cell">
                      <div className="admin-rating-display">
                        <div className="admin-rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={`admin-star ${i < review.rating ? 'filled' : 'empty'}`}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                              </svg>
                            </span>
                          ))}
                        </div>
                        <span className="admin-rating-number">{review.rating}/5</span>
                      </div>
                    </td>
                    <td className="admin-comment-cell">
                      <div className="admin-review-comment">
                        <p className="admin-comment-text">{review.comment}</p>
                        {review.comment && review.comment.length > 100 && (
                          <button 
                            className="admin-comment-expand"
                            onClick={() => {
                              // Toggle comment expansion
                              const commentElement = document.querySelector(`[data-review-id="${review._id}"]`);
                              if (commentElement) {
                                commentElement.classList.toggle('expanded');
                              }
                            }}
                          >
                            Show more
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="admin-status-cell">
                      <span className={`admin-status admin-status-${review.status}`}>
                        {review.status === 'active' && 'Active'}
                        {review.status === 'hidden' && 'Hidden'}
                        {review.status === 'flagged' && 'Flagged'}
                        {review.status === 'deleted' && 'Deleted'}
                        {review.status === 'pending' && 'Pending'}
                      </span>
                    </td>
                    <td className="admin-actions">
                      <div className="admin-action-icons">
                        <div
                          onClick={() => updateReviewStatus(review._id, 'active')}
                          className={`admin-action-icon admin-action-approve ${review.status === 'active' ? 'disabled' : ''}`}
                          title="Approve this review"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12"></polyline>
                          </svg>
                        </div>
                        <div
                          onClick={() => updateReviewStatus(review._id, 'hidden')}
                          className={`admin-action-icon admin-action-suspend ${review.status === 'hidden' ? 'disabled' : ''}`}
                          title="Hide this review"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        </div>
                        <div
                          onClick={() => updateReviewStatus(review._id, 'deleted')}
                          className={`admin-action-icon admin-action-delete ${review.status === 'deleted' ? 'disabled' : ''}`}
                          title="Delete this review permanently"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="admin-pagination-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            Previous
          </button>
          <div className="admin-pagination-info">
            <span className="admin-page-current">Page {currentPage}</span>
            <span className="admin-page-separator">of</span>
            <span className="admin-page-total">{totalPages}</span>
          </div>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="admin-pagination-btn"
          >
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  const renderComplaints = () => {
    console.log('🔍 AdminDashboard: Rendering complaints with data:', {
      complaints: complaints.length,
      totalPages,
      currentPage,
      statusFilter,
      searchTerm,
      dataLoading
    });
    
    return (
      <AdminComplaintsDashboard
        complaints={complaints}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dataLoading={dataLoading}
        updateReviewStatus={updateReviewStatus}
        deleteBusiness={deleteBusiness}
        updateBusinessStatus={updateBusinessStatus}

      />
    );
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSettingsMessage('');
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/profile', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });
      
      if (response.ok) {
        const updatedAdmin = await response.json();
        updateAdminProfile(updatedAdmin);
        setSettingsMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        const error = await response.json();
        setSettingsMessage(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSettingsMessage('Network error while updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const renderBusinessVerification = () => {
    return (
      <div className="admin-content-section">
        <div className="section-header">
          <h2>Business Verification</h2>
          <p>Review and approve pending business verification requests</p>
        </div>
        
        {verificationLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading pending verifications...</p>
          </div>
        ) : pendingBusinesses.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"></path>
              <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
              <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
            </svg>
            <h3>No Pending Verifications</h3>
            <p>All businesses have been reviewed and processed.</p>
          </div>
        ) : (
          <div className="verification-list">
            {pendingBusinesses.map((business) => (
              <div key={business._id} className="verification-item">
                <div className="business-info">
                  <h3>{business.businessName}</h3>
                  <p className="business-type">{business.businessType}</p>
                  <p className="business-location">{business.location?.city}, {business.location?.area}</p>
                  <p className="business-owner">Owner: {business.owner?.firstName} {business.owner?.lastName}</p>
                  <p className="business-email">Email: {business.owner?.email}</p>
                  <p className="business-phone">Phone: {business.contact?.phone}</p>
                </div>
                
                <div className="verification-documents">
                  <h4>Verification Documents</h4>
                  {business.verification?.documents && business.verification.documents.length > 0 ? (
                    <div className="documents-grid">
                      {business.verification.documents.map((doc, index) => (
                        <div key={index} className="document-item">
                          <div className="document-preview">
                            <img 
                              src={doc} 
                              alt={`Document ${index + 1}`}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="document-fallback">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14,2 14,8 20,8"></polyline>
                              </svg>
                              <span>Document {index + 1}</span>
                            </div>
                          </div>
                          <a href={doc} target="_blank" rel="noopener noreferrer" className="view-document">
                            View Full Size
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-documents">No verification documents uploaded</p>
                  )}
                </div>
                
                <div className="verification-actions">
                  <button
                    onClick={() => {
                      const note = prompt('Add a note for approval (optional):');
                      handleVerificationDecision(business._id, 'approve', note);
                    }}
                    className="btn btn-success"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"></path>
                      <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
                      <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
                    </svg>
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const note = prompt('Please provide a reason for rejection:');
                      if (note) {
                        handleVerificationDecision(business._id, 'reject', note);
                      }
                    }}
                    className="btn btn-danger"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => {

    const handleProfileUpdate = async (e) => {
      e.preventDefault();
      setIsSaving(true);
      setSettingsMessage('');

      try {
        const response = await fetch(`http://localhost:5000/api/admin/profile`, {
          method: 'PATCH',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profileForm)
        });

        const data = await response.json();

        if (data.success) {
          setSettingsMessage('Profile updated successfully!');
          setIsEditing(false);
          // Update local admin state
          updateAdminProfile(profileForm);
        } else {
          setSettingsMessage(data.message || 'Failed to update profile');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        setSettingsMessage('An error occurred while updating profile');
      } finally {
        setIsSaving(false);
      }
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfileForm(prev => ({
            ...prev,
            profilePicture: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="admin-settings">

        <div className="settings-content">
                      <div className="profile-section">
              <div className="profile-header">
                <div className="profile-avatar">
                  {admin?.profilePicture ? (
                    <img 
                      src={admin.profilePicture} 
                      alt="Profile" 
                      className="admin-profile-picture"
                      onError={(e) => {
                        console.log('❌ Image failed to load:', e.target.src);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                      onLoad={(e) => {
                        console.log('✅ Image loaded successfully:', e.target.src);
                        e.target.nextSibling.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="admin-profile-placeholder" style={{ display: admin?.profilePicture ? 'none' : 'flex' }}>
                    {admin?.fullName?.charAt(0) || 'A'}
                  </div>
                  {isEditing && (
                    <div className="avatar-upload">
                      <input
                        type="file"
                        id="profile-picture"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input"
                      />
                      <label htmlFor="profile-picture" className="upload-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7,10 12,15 17,10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Change Photo
                      </label>
                    </div>
                  )}
                </div>
                <div className="profile-info">
                  <div className="profile-info-header">
                    <h3>{admin?.fullName || 'Admin User'}</h3>
                    <button 
                      className="edit-profile-btn"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                  </div>
                  <p className="admin-profile-role">{admin?.role || 'Admin'}</p>
                  <p className="admin-profile-email">{admin?.email || 'admin@example.com'}</p>
                </div>
              </div>
            </div>

          <form onSubmit={handleProfileUpdate} className="profile-form">
            <div className="form-section">
              <h4>Personal Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={!isEditing}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Account Security</h4>
              <div className="security-info">
                <div className="security-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
                    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
                  </svg>
                  <span>Last login: {admin?.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}</span>
                </div>
                <div className="security-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
                    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
                  </svg>
                  <span>Account status: {admin?.status || 'Active'}</span>
                </div>
              </div>
            </div>

            {settingsMessage && (
              <div className={`message ${settingsMessage.includes('successfully') ? 'success' : 'error'}`}>
                {settingsMessage}
              </div>
            )}

            <div className="form-actions">
              {isEditing && (
                <>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn btn-primary"
                  >
                    {isSaving ? (
                      <>
                        <div className="spinner"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                          <polyline points="17,21 17,13 7,13 7,21"></polyline>
                          <polyline points="7,3 7,8 15,8"></polyline>
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileForm({
                        fullName: admin?.fullName || '',
                        email: admin?.email || '',
                        phone: admin?.phone || '',
                        profilePicture: admin?.profilePicture || ''
                      });
                      setSettingsMessage('');
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="sidebar-user-info">
          <div className="user-avatar">
            {admin?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="user-details">
            <span className="user-name">{admin?.fullName}</span>
            <span className="user-role">{admin?.role}</span>
          </div>
        </div>
        
                <nav className="dasbhoard-sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('overview');
              setSidebarOpen(false);
              window.location.hash = '#overview';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Overview</span>
          </button>
          
          <button
            className={`sidebar-nav-item ${activeTab === 'service-providers' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('service-providers');
              setSidebarOpen(false);
              window.location.hash = '#service-providers';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7L10 17l-5-5"></path>
            </svg>
            <span>Service Providers</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'business-verification' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('business-verification');
              setSidebarOpen(false);
              window.location.hash = '#business-verification';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"></path>
              <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
              <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
            </svg>
            <span>Business Verification</span>
          </button>
      
          
          <button
            className={`sidebar-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('reviews');
              setSidebarOpen(false);
              window.location.hash = '#reviews';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            <span>Reviews</span>
          </button>
          
          <button
            className={`sidebar-nav-item ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('complaints');
              setSidebarOpen(false);
              window.location.hash = '#complaints';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Complaints</span>
          </button>
          
          <button
            className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('users');
              setSidebarOpen(false);
              window.location.hash = '#users';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>All Users</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('settings');
              setSidebarOpen(false);
              window.location.hash = '#settings';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Settings</span>
          </button>
          <button
            className={`sidebar-nav-item ${activeTab === 'user-management' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('user-management');
              setSidebarOpen(false);
              window.location.hash = '#user-management';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>User Management</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleRefresh} className="sidebar-refresh-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23,4 23,10 17,10"></polyline>
              <polyline points="1,20 1,14 7,14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            <span>Refresh</span>
          </button>
          
          <button onClick={handleLogout} className="sidebar-logout-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16,17 21,12 16,7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main-content">
        {/* Top Header */}
        <div className="admin-top-header">
          <div className="header-left">
            <button 
              className="hamburger-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1 className="page-title">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'service-providers' && 'Service Providers'}
              {activeTab === 'business-verification' && 'Business Verification'}
              {activeTab === 'user-management' && 'User Management'}
              {activeTab === 'reviews' && 'Reviews Management'}
              {activeTab === 'complaints' && 'Complaints'}
              {activeTab === 'users' && 'Users'}
              {activeTab === 'settings' && 'Profile Settings'}
            </h1>
          </div>
          

        </div>



        <div className="admin-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'service-providers' && (
            <AdminServiceProvidersDashboard
              serviceProviders={serviceProviders}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              dataLoading={dataLoading}
              updateBusinessStatus={updateBusinessStatus}
              deleteBusiness={deleteBusiness}
            />
          )}
          {activeTab === 'business-verification' && renderBusinessVerification()}
          {activeTab === 'user-management' && (
            <AdminUserManagement
              adminUsers={adminUsers}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              dataLoading={dataLoading}
              onAddAdminUser={addAdminUser}
              onUpdateAdminUser={updateAdminUser}
              onDeleteAdminUser={deleteAdminUser}
            />
          )}
          {activeTab === 'reviews' && renderReviews()}
          {activeTab === 'complaints' && renderComplaints()}
          {activeTab === 'users' && (
            <AdminUsersDashboard
              users={users}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              userTypeFilter={userTypeFilter}
              setUserTypeFilter={setUserTypeFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              dataLoading={dataLoading}
              onRefresh={fetchUsers}
              onUpdateUser={updateUser}
              onDeleteUser={deleteUser}
            />
          )}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
