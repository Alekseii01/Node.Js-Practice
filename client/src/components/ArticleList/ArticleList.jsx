import React, { useEffect, useState, useCallback } from 'react';
import Button from '../ui/Button/Button';
import ApiService from '../../utils/apiService';
import { Link } from 'react-router-dom';
import { FaTrash, FaEdit, FaSearch } from 'react-icons/fa';
import ConfirmationDialog from '../ui/ConfirmationDialog/ConfirmationDialog';
import WorkspaceSelector from '../WorkspaceSelector/WorkspaceSelector';
import SearchInput from '../SearchInput/SearchInput';
import { useAuth } from '../../context/AuthContext.jsx';
import './ArticleList.css';

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { canEditResource, user } = useAuth();

  const fetchArticles = useCallback(async () => {
    try {
      setIsSearching(true);
      let endpoint;
      
      if (searchQuery.trim()) {
        endpoint = `/articles/search?q=${encodeURIComponent(searchQuery.trim())}`;
        if (selectedWorkspace) {
          endpoint += `&workspace_id=${selectedWorkspace}`;
        }
      } else {
        endpoint = selectedWorkspace
          ? `/articles?workspace_id=${selectedWorkspace}`
          : '/articles';
      }
      
      const response = await ApiService.get(endpoint);
      setArticles(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to fetch articles. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  }, [selectedWorkspace, searchQuery]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await ApiService.delete(`/articles/${deleteId}`);
      fetchArticles();
      setShowDialog(false);
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting article:', err);
      setError('Failed to delete article. Please try again.');
      setShowDialog(false);
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDialog(false);
    setDeleteId(null);
  };

  return (
    <div className="container">
      <h2>All Articles</h2>
      <WorkspaceSelector
        selectedWorkspace={selectedWorkspace}
        onWorkspaceChange={setSelectedWorkspace}
      />
      <SearchInput 
        onSearch={handleSearch} 
        placeholder="Search by title or content..."
      />
      {searchQuery && (
        <div className="search-results-info">
          {isSearching ? (
            'Searching...'
          ) : (
            <>
              Found <strong>{articles.length}</strong> {articles.length === 1 ? 'article' : 'articles'} 
              {' '}matching "<strong>{searchQuery}</strong>"
            </>
          )}
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
      {Array.isArray(articles) ? (
        articles.length === 0 && !error ? (
          <div className="no-results">
            <FaSearch className="no-results-icon" />
            <p>{searchQuery ? 'No articles found matching your search.' : 'No articles found. Why not create one?'}</p>
          </div>
        ) : (
          <ul className="article-list">
            {articles.map((article) => (
              <li key={article.id} className="article-item-container">
                <Link className="article-item" to={`/article/${article.id}`}>
                  {article.title}
                </Link>
                <div className="article-actions">
                  {(article.created_by ? canEditResource(article.created_by) : user?.role === 'admin') && (
                    <>
                      <Link to={`/edit/${article.id}`} className="icon-link">
                        <FaEdit className="icon edit-icon" />
                      </Link>
                      <FaTrash
                        className="icon delete-icon"
                        onClick={() => handleDeleteClick(article.id)}
                      />
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : (
        <p className="error-message">Failed to load articles.</p>
      )}
      <Link to="/create">
        <Button>Create New Article</Button>
      </Link>
      {showDialog && (
        <ConfirmationDialog
          message="Are you sure you want to delete this article?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default ArticleList;
