import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ArticleList from './components/ArticleList/ArticleList';
import ArticleView from './components/ArticleView/ArticleView';
import ArticleCreate from './components/ArticleCreate/ArticleCreate';
import ArticleEdit from './components/ArticleEdit/ArticleEdit';
import './App.css';

console.log('API URL:', import.meta.env.VITE_API_URL);

function App() {
  return (
    <Router>
      <div className="app">
        <div className="container">
          <header className="header-container">
            <nav className="nav-container">
              <Link to="/" className="nav-title">
                Article App
              </Link>
              <Link to="/create" className="nav-link">
                Create Article
              </Link>
            </nav>
          </header>
          <div className="content-container">
            <Routes>
              <Route path="/" element={<ArticleList />} />
              <Route path="/article/:id" element={<ArticleView />} />
              <Route path="/create" element={<ArticleCreate />} />
              <Route path="/edit/:id" element={<ArticleEdit />} />
              <Route path="*" element={<h2>404: Page Not Found</h2>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
