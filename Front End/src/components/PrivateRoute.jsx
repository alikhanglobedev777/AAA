import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrivateRoute = ({ children, requiredUserType }) => {
  const { isAuthenticated, userType, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!isAuthenticated) {
    // Redirect to the appropriate login page based on required user type
    const loginPath = requiredUserType === 'business' ? '/business/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    // User is authenticated but doesn't have the required role
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};
