import React, { useEffect, useState } from 'react';
import Button from '../ui/Button/Button.jsx';
import axios from 'axios';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaHistory } from 'react-icons/fa';
import ConfirmationDialog from '../ui/ConfirmationDialog/ConfirmationDialog.jsx';
import AttachmentManager from '../ui/AttachmentManager/AttachmentManager.jsx';
import CommentList from '../CommentList/CommentList.jsx';
import VersionHistory from '../VersionHistory/VersionHistory.jsx';
import './ArticleView.css';

function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const versionParam = searchParams.get('version');
  
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isOldVersion, setIsOldVersion] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        let response;
        if (versionParam) {
          response = await axios.get(`${import.meta.env.VITE_API_URL}/articles/${id}/versions/${versionParam}`);
          setIsOldVersion(response.data.isOldVersion || false);
          setCurrentVersion(parseInt(versionParam));
        } else {
          response = await axios.get(`${import.meta.env.VITE_API_URL}/articles/${id}`);
          setIsOldVersion(false);
          setCurrentVersion(null);
        }
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
  }, [id, versionParam]);

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

  const handleViewHistory = () => {
    setShowVersionHistory(true);
  };

  const handleSelectVersion = (versionNumber) => {
    setSearchParams({ version: versionNumber });
  };

  const handleBackToCurrent = () => {
    setSearchParams({});
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
      {isOldVersion && (
        <div className="old-version-banner">
          <div className="banner-content">
            <span>⚠️ You are viewing an old version (v{currentVersion})</span>
            <button className="back-to-current-btn" onClick={handleBackToCurrent}>
              Back to Current Version
            </button>
          </div>
        </div>
      )}
      
      <div className="article-header">
        <h2>{article.title}</h2>
        <div className="article-actions">
          {!isOldVersion && (
            <>
              <Link to={`/edit/${id}`} className="icon-link">
                <FaEdit className="icon edit-icon" />
              </Link>
              <FaTrash
                className="icon delete-icon"
                onClick={handleDeleteClick}
              />
            </>
          )}
          <FaHistory
            className="icon history-icon"
            onClick={handleViewHistory}
            title="View version history"
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

      {!isOldVersion && (
        <CommentList
          articleId={id}
          comments={article.comments || []}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onEditComment={handleEditComment}
        />
      )}

      <Button onClick={() => navigate('/')}>Back to Articles</Button>
      
      {showDialog && (
        <ConfirmationDialog
          message="Are you sure you want to delete this article?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
      
      {showVersionHistory && (
        <VersionHistory
          articleId={id}
          currentVersion={currentVersion}
          onSelectVersion={handleSelectVersion}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </div>
  );
}

export default ArticleView;