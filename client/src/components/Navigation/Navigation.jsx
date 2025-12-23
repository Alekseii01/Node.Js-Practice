import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

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
      </div>
    </nav>
  );
};

export default Navigation;