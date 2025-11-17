import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/ui/Button/Button.jsx';
import StatusMessage from '../../components/ui/StatusMessage/StatusMessage.jsx';
import TipTapEditor from '../ui/TipTapEditor/TipTapEditor.jsx';
import AttachmentManager from '../ui/AttachmentManager/AttachmentManager.jsx';
import { validateTitle, validateContent } from '../../utils/validation.js';
import './ArticleEdit.css';

function ArticleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ title: '', content: '' });
  const [originalData, setOriginalData] = useState({ title: '', content: '' });
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingArticle, setLoadingArticle] = useState(true);

  const validators = { title: validateTitle, content: validateContent };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/articles/${id}`);
        const data = { title: response.data.title || '', content: response.data.content || '' };
        setFormData(data);
        setOriginalData(data);
        setAttachments(response.data.attachments || []);
      } catch (err) {
        console.error(`Error fetching article ${id}:`, err);
        setError('Failed to load article for editing.');
      } finally {
        setLoadingArticle(false);
      }
    };
    fetchArticle();
  }, [id]);

  const handleTitleChange = (value) => {
    setFormData(prev => {
      if (prev.title === value) return prev;
      const newData = { ...prev, title: value };
      setErrors(prevErrors => ({ ...prevErrors, title: validators.title(value) }));
      return newData;
    });
  };

  const handleContentChange = (html) => {
    setFormData(prev => {
      if (prev.content === html) return prev;
      const newData = { ...prev, content: html };
      setErrors(prevErrors => ({ ...prevErrors, content: validators.content(html) }));
      return newData;
    });
  };

  const hasChanges = useMemo(() => {
    return (
      formData.title.trim() !== originalData.title.trim() ||
      formData.content.trim() !== originalData.content.trim()
    );
  }, [formData, originalData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const newErrors = {
      title: validators.title(formData.title),
      content: validators.content(formData.content),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/articles/${id}`, formData);
      console.log('Article updated:', response.data);
      setSuccess(true);
      setErrors({});
      setOriginalData(formData);
      setTimeout(() => navigate(`/article/${id}`), 900);
    } catch (err) {
      console.error('Error updating article:', err);
      setError(err.response?.data?.message || 'Failed to update article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingArticle) {
    return (
      <div className="container">
        <p>Loading article...</p>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="container">
        <h2 className="error-message">Error</h2>
        <p className="error-message">{error}</p>
        <Button onClick={() => navigate('/')}>Back to Articles</Button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Edit Article</h2>
      <form className="article-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">
            Title: <span className="required">required</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <p className="field-error">Title is required.</p>}
        </div>

        <div className="form-group">
          <label htmlFor="content">
            Content: <span className="required">required</span>
          </label>
          <div className={errors.content ? 'editor error' : 'editor'}>
            <TipTapEditor
              value={formData.content}
              onChange={handleContentChange}
            />
          </div>
          {errors.content && <p className="field-error">Content is required.</p>}
        </div>

        <AttachmentManager
          articleId={id}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          readOnly={false}
        />

        {error && <StatusMessage status="error" message={error} />}
        {loading && <StatusMessage status="loading" message="Updating article..." />}
        {success && <StatusMessage status="success" message="Article updated successfully!" />}

        <div className="btn-container">
          <Button type="Button" className="btn btn-secondary" onClick={() => navigate(`/article/${id}`)}>
            Back to Article
          </Button>
          <Button type="submit" disabled={!hasChanges || loading}>Update Article</Button>
        </div>
      </form>
    </div>
  );
}

export default ArticleEdit;
