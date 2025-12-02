import React, { useState } from 'react';
import './CommentList.css';

function CommentList({ articleId, comments, onAddComment, onDeleteComment, onEditComment }) {
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState(localStorage.getItem('userName') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const finalAuthor = author.trim() || 'Anonymous';
      await onAddComment({ content: newComment, author: finalAuthor });
      setNewComment('');
      if (author.trim()) {
        localStorage.setItem('userName', author.trim());
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setOriginalContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    setOriginalContent('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) return;
    if (editContent.trim() === originalContent.trim()) return;
    
    try {
      await onEditComment(commentId, { content: editContent });
      setEditingId(null);
      setEditContent('');
      setOriginalContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="comment-section">
      <div className="comment-header-bar">
        <h3 className="comment-title">
          <span className="comment-icon">💬</span>
          Comments
        </h3>
      </div>
      
      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-form-header">
          <div 
            className="comment-avatar" 
            style={{ backgroundColor: getAvatarColor(author || 'Anonymous') }}
          >
            {getInitials(author || 'Anonymous')}
          </div>
          <input
            type="text"
            placeholder="Your name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="comment-author-input"
          />
        </div>
        <textarea
          placeholder="Share your thoughts..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="comment-textarea"
          rows="3"
        />
        <div className="comment-form-actions">
          <button 
            type="submit" 
            disabled={isSubmitting || !newComment.trim()}
            className="comment-submit-btn"
          >
            {isSubmitting ? (
              <><span className="btn-spinner"></span> Posting...</>
            ) : (
              <><span className="btn-icon">✓</span> Post Comment</>
            )}
          </button>
        </div>
      </form>

      <div className="comments-list">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-avatar" style={{ backgroundColor: getAvatarColor(comment.author) }}>
                {getInitials(comment.author)}
              </div>
              <div className="comment-body">
                <div className="comment-meta">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-separator">•</span>
                  <span className="comment-date">{formatDate(comment.created_at || comment.createdAt)}</span>
                  {(comment.updated_at || comment.updatedAt) && (comment.updated_at || comment.updatedAt) !== (comment.created_at || comment.createdAt) && (
                    <span className="comment-edited">(edited)</span>
                  )}
                </div>
                {editingId === comment.id ? (
                  <div className="comment-edit-form">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="comment-edit-textarea"
                      rows="3"
                      autoFocus
                    />
                    <div className="comment-edit-actions">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(comment.id)}
                        className="comment-save-btn"
                        disabled={!editContent.trim() || editContent.trim() === originalContent.trim()}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="comment-cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="comment-content">{comment.content}</p>
                    <div className="comment-actions">
                      <button
                        type="button"
                        onClick={() => handleEdit(comment)}
                        className="comment-action-btn"
                      >
                        <span className="action-icon">✏️</span> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteComment(comment.id)}
                        className="comment-action-btn comment-delete"
                      >
                        <span className="action-icon">🗑️</span> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-comments">
            <span className="no-comments-icon">💭</span>
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentList;
