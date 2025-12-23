import React from 'react';
import { useAuth } from '../context/AuthContext';
import Login from '../components/Login/Login';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Login />;
  }

  return children;
};

export default ProtectedRoute;