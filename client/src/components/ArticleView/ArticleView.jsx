import React, { useEffect, useState } from 'react';
import Button from '../ui/Button/Button.jsx';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import ConfirmationDialog from '../ui/ConfirmationDialog/ConfirmationDialog.jsx';
import AttachmentManager from '../ui/AttachmentManager/AttachmentManager.jsx';
import CommentList from '../CommentList/CommentList.jsx';
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

  const handleAttachmentsChange = (newAttachments) => {
    setArticle(prev => ({ ...prev, attachments: newAttachments }));
  };

  const handleAddComment = async (commentData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/articles/${id}/comments`,
        commentData
      );
      setArticle(prev => ({
        ...prev,
        comments: [response.data.comment, ...(prev.comments || [])]
      }));
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/comments/${commentId}`);
      setArticle(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c.id !== commentId)
      }));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleEditComment = async (commentId, commentData) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/comments/${commentId}`,
        commentData
      );
      setArticle(prev => ({
        ...prev,
        comments: prev.comments.map(c => 
          c.id === commentId ? response.data.comment : c
        )
      }));
    } catch (err) {
      console.error('Error editing comment:', err);
      throw err;
    }
  };

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

      <AttachmentManager
        articleId={id}
        attachments={article.attachments || []}
        onAttachmentsChange={handleAttachmentsChange}
        readOnly={true}
      />

      <CommentList
        articleId={id}
        comments={article.comments || []}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onEditComment={handleEditComment}
      />

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