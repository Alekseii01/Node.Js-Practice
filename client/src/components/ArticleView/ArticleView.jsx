import React, { useEffect, useState } from 'react';
import Button from '../UI/Button/Button.jsx';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import ConfirmationDialog from '../UI/ConfirmationDialog/ConfirmationDialog.jsx';
import './ArticleView.css';

function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/articles/${id}`);
        setArticle(response.data);
      } catch (err) {
        console.error(`Error fetching article ${id}:`, err);
        if (err.response && err.response.status === 404) {
          setError('Article not found.');
        } else {
          setError('Failed to retrieve article. Please try again later.');
        }
      }
    };
    fetchArticle();
  }, [id]);

  const handleDeleteClick = () => {
    setShowDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/articles/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Error deleting article:', err);
      setError('Failed to delete article. Please try again.');
    }
    setShowDialog(false);
  };

  const handleCancelDelete = () => {
    setShowDialog(false);
  };

  if (error) {
    return (
      <div className="container">
        <h2 className="error-message">Error</h2>
        <p className="error-message">{error}</p>
        <Button onClick={() => navigate('/')}>Back to Articles</Button>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container">
        <p>Loading article...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="article-header">
        <h2>{article.title}</h2>
        <div className="article-actions">
          <Link to={`/edit/${id}`} className="icon-link">
            <FaEdit className="icon edit-icon" />
          </Link>
          <FaTrash
            className="icon delete-icon"
            onClick={handleDeleteClick}
          />
        </div>
      </div>
      <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }}></div>
      <Button onClick={() => navigate('/')}>Back to Articles</Button>
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

export default ArticleView;