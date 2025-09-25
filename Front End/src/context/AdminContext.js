import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin token exists in localStorage
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (adminToken && adminData) {
      try {
        const parsedAdmin = JSON.parse(adminData);
        setAdmin(parsedAdmin);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store admin data and token
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminData', JSON.stringify(data.admin));
      
      setAdmin(data.admin);
      setIsAuthenticated(true);
      
      return { success: true, data };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (adminToken) {
        await fetch('http://localhost:5000/api/admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all authentication data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  const getAuthHeaders = () => {
    const adminToken = localStorage.getItem('adminToken');
    
    return {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    };
  };

  const updateAdminProfile = (updatedProfile) => {
    setAdmin(prev => ({ ...prev, ...updatedProfile }));
    // Also update localStorage
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      try {
        const parsedAdmin = JSON.parse(adminData);
        const updatedAdmin = { ...parsedAdmin, ...updatedProfile };
        localStorage.setItem('adminData', JSON.stringify(updatedAdmin));
      } catch (error) {
        console.error('Error updating admin data in localStorage:', error);
      }
    }
  };

  const value = {
    admin,
    setAdmin,
    isAuthenticated,
    loading,
    login,
    logout,
    getAuthHeaders,
    updateAdminProfile,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
