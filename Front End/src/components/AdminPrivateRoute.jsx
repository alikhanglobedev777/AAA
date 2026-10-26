import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import Loading from './Loading';

const AdminPrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdmin();

  if (loading) return <Loading />;

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminPrivateRoute;
