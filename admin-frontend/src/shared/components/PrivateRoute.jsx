import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlobalLoader from './ui/GlobalLoader';

const PrivateRoute = () => {
    const { admin, loading } = useAuth();
  
    if (loading) {
      return <GlobalLoader />; 
    }
  
    return admin ? <Outlet /> : <Navigate to="/login" replace />;
  };

export default PrivateRoute;
