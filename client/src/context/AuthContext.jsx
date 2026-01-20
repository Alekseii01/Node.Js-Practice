import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import ApiService from '../utils/apiService.js';
import { useWebSocket } from './WebSocketContext.jsx';
import { USER_ROLES } from '../utils/constants.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const AuthContext = createContext();

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

const getRoleFromToken = (token) => {
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now();
};

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

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const fetchUserProfile = useCallback(async (authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        const tokenRole = getRoleFromToken(storedToken);
        
        if (!tokenRole || isTokenExpired(storedToken)) {
          console.warn('Token invalid or expired, logging out');
          logout();
          setLoading(false);
          return;
        }
        
        setToken(storedToken);
        
        const userData = await fetchUserProfile(storedToken);
        if (userData) {
          if (userData.role !== tokenRole) {
            console.warn('Server role differs from token, logging out');
            logout();
            setLoading(false);
            return;
          }
          setUser(userData);
        } else {
          logout();
        }
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, [logout, fetchUserProfile]);

  const refreshUser = async () => {
    try {
      if (!token) return { success: false, error: 'No token' };
      
      const userData = await fetchUserProfile(token);
      const tokenRole = getRoleFromToken(token);
      
      if (!userData) {
        return { success: false, error: 'Failed to fetch user data' };
      }
      
      if (tokenRole && userData.role !== tokenRole) {
        logout();
        return { success: false, error: 'Role changed. Please log in again.' };
      }
      
      setUser(userData);
      
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
        console.log('Role changed, logging out user to get new token');
        logout();
      }
    };

    const unsubscribe = addListener('user_role_updated', handleUserRoleUpdate);

    return unsubscribe;
  }, [user?.id, addListener, removeListener, logout]);

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
      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const isAdmin = () => {
    if (!isAuthenticated() || !token) return false;
    const tokenRole = getRoleFromToken(token);
    if (!tokenRole) return false;
    return tokenRole === USER_ROLES.ADMIN;
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