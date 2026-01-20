import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-links">
        <Link 
          to="/" 
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
        >
          Articles
        </Link>
        <Link 
          to="/create" 
          className={`nav-link ${isActive('/create') ? 'active' : ''}`}
        >
          Create Article
        </Link>
        <Link 
          to="/workspaces" 
          className={`nav-link ${isActive('/workspaces') ? 'active' : ''}`}
        >
          Workspaces
        </Link>
        {isAdmin() && (
          <Link 
            to="/users" 
            className={`nav-link ${isActive('/users') ? 'active' : ''}`}
          >
            User Management
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;