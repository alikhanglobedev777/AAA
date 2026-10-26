import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

export const PrivateRoute = ({ children, requiredUserType }) => {
  const { isAuthenticated, userType, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
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
