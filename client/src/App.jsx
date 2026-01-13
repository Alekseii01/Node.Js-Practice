import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ArticleList from './components/ArticleList/ArticleList';
import ArticleView from './components/ArticleView/ArticleView';
import ArticleCreate from './components/ArticleCreate/ArticleCreate';
import ArticleEdit from './components/ArticleEdit/ArticleEdit';
import WorkspaceManager from './components/WorkspaceManager/WorkspaceManager';
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import NotificationDisplay from './components/ui/NotificationDisplay/NotificationDisplay';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <ProtectedRoute>
            <WebSocketProvider>
              <Header />
              <Navigation />
              <div className="container">
                <NotificationDisplay />
                <div className="content-container">
                  <Routes>
                    <Route path="/" element={<ArticleList />} />
                    <Route path="/article/:id" element={<ArticleView />} />
                    <Route path="/create" element={<ArticleCreate />} />
                    <Route path="/edit/:id" element={<ArticleEdit />} />
                    <Route path="/workspaces" element={<WorkspaceManager />} />
                    <Route path="*" element={<h2>404: Page Not Found</h2>} />
                  </Routes>
                </div>
              </div>
            </WebSocketProvider>
          </ProtectedRoute>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
