import React, { useState, useEffect } from 'react';
import Button from '../ui/Button/Button.jsx';
import { FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TipTapEditor from '../ui/TipTapEditor/TipTapEditor.jsx';
import AttachmentManager from '../ui/AttachmentManager/AttachmentManager.jsx';
import StatusMessage from '../ui/StatusMessage/StatusMessage.jsx';
import { validateTitle, validateContent } from '../../utils/validation.js';
import './ArticleCreate.css';

function ArticleCreate() {
  const [formData, setFormData] = useState({ title: '', content: '', workspace_id: null });
  const [attachments, setAttachments] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/workspaces`);
      setWorkspaces(response.data);
    } catch (err) {
      console.error('Error fetching workspaces:', err);
    }
  };

  const validators = {
    title: validateTitle,
    content: validateContent,
  };

  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const hasError = validators[field] ? validators[field](value) : null;
    setErrors(prev => ({ ...prev, [field]: hasError }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const newErrors = {};
    for (const field in validators) {
      newErrors[field] = validators[field](formData[field]);
    }
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/articles`, formData);
      console.log('Article created:', response.data);
      const articleId = response.data.id;
      setSuccess(true);
      setErrors({});

      if (attachments.length > 0) {
        try {
          for (const file of attachments) {
            const formData = new FormData();
            formData.append('file', file);
            await axios.post(
              `${import.meta.env.VITE_API_URL}/articles/${articleId}/attachments`,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
          }
        } catch (uploadErr) {
          console.error('Error uploading attachments:', uploadErr);
        }
      }

      setTimeout(() => {
        navigate(`/article/${articleId}`);
      }, 1200);
    } catch (err) {
      console.error('Error creating article:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create article. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Create New Article</h2>
      <form className="article-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">
            Title: <span className="required">required</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title')(e.target.value)}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <p className="field-error">Title is required.</p>}
        </div>
        <div className="form-group">
          <label htmlFor="workspace">Workspace:</label>
          <select
            id="workspace"
            className="workspace-select"
            value={formData.workspace_id || ''}
            onChange={(e) => handleChange('workspace_id')(e.target.value || null)}
          >
            <option value="">No Workspace</option>
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="content">
            Content: <span className="required">required</span>
          </label>
          <TipTapEditor
            value={formData.content}
            onChange={handleChange('content')}
            className={errors.content ? 'error' : ''}
          />
          {errors.content && <p className="field-error">Content is required.</p>}
        </div>

        <AttachmentManager
          articleId={null}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          readOnly={false}
          hideUploadButton={true}
        />

        {error && <StatusMessage status="error" message={error} />}
        {loading && <StatusMessage status="loading" message="Creating article..." />}
        {success && <StatusMessage status="success" message="Article created successfully!" />}
        <div className="btn-container">
          <Button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to Articles
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Article'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ArticleCreate;
