import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
    const { admin, loading } = useAuth();
  
    if (loading) {
      return <div>Loading...</div>; 
    }
  
    return admin ? <Outlet /> : <Navigate to="/login" replace />;
  };

export default PrivateRoute;
