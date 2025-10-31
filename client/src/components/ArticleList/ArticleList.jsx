import React, { useEffect, useState } from 'react';
import Button from '../UI/Button/Button';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import ConfirmationDialog from '../UI/ConfirmationDialog/ConfirmationDialog';
import './ArticleList.css';

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/articles`);
      setArticles(response.data);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to fetch articles. Please try again later.');
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/articles/${deleteId}`);
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
      {error && <p className="error-message">{error}</p>}
      {Array.isArray(articles) ? (
        articles.length === 0 && !error ? (
          <p>No articles found. Why not create one?</p>
        ) : (
          <ul className="article-list">
            {articles.map((article) => (
              <li key={article.id} className="article-item-container">
                <Link className="article-item" to={`/article/${article.id}`}>
                  {article.title}
                </Link>
                <div className="article-actions">
                  <Link to={`/edit/${article.id}`} className="icon-link">
                    <FaEdit className="icon edit-icon" />
                  </Link>
                  <FaTrash
                    className="icon delete-icon"
                    onClick={() => handleDeleteClick(article.id)}
                  />
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
