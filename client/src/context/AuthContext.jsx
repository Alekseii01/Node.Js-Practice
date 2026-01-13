import React, { createContext, useState, useContext, useEffect } from 'react';
import ApiService from '../utils/apiService.js';
import { useWebSocket } from './WebSocketContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addListener, removeListener } = useWebSocket();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const refreshUser = async () => {
    try {
      if (!token) return { success: false, error: 'No token' };
      
      const data = await ApiService.getCurrentUser();
      
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (!user || !addListener || !removeListener) return;

    const handleUserRoleUpdate = (notification) => {
      console.log('Received role update notification:', notification);
      console.log('Current user id:', user.id, 'Notification userId:', notification.data?.userId);
      if (notification.data && String(notification.data.userId) === String(user.id)) {
        console.log('Updating user role from', user.role, 'to', notification.data.newRole);
        setUser(prev => {
          const updatedUser = { ...prev, role: notification.data.newRole };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
    };

    const unsubscribe = addListener('user_role_updated', handleUserRoleUpdate);

    return unsubscribe;
  }, [user?.id, addListener, removeListener]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const isAdmin = () => {
    return isAuthenticated() && user?.role === 'admin';
  };

  const canEditResource = (resourceUserId) => {
    if (!isAuthenticated()) return false;
    
    const isAdminUser = isAdmin();
    
    if (isAdminUser) return true;
    
    if (!resourceUserId) return false;
    
    const isOwner = String(user?.id) === String(resourceUserId);
    
    return isOwner;
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated,
    isAdmin,
    canEditResource,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};