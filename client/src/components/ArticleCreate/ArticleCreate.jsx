import React, { useState } from 'react';
import Button from '../UI/Button/Button.jsx';
import StatusMessage from '../ui/StatusMessage/StatusMessage.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import { validateTitle, validateContent } from '../../utils/validation.js';
import 'react-quill/dist/quill.snow.css';
import './ArticleCreate.css';

function ArticleCreate() {
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validators = {
    title: validateTitle,
    content: validateContent,
  };

  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const hasError = validators[field](value);
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
      setSuccess(true);
      setErrors({});
      setTimeout(() => {
        navigate(`/article/${response.data.id}`);
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
          <label htmlFor="content">
            Content: <span className="required">required</span>
          </label>
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={handleChange('content')}
            placeholder="Write your article here..."
            className={errors.content ? 'error' : ''}
          />
          {errors.content && <p className="field-error">Content is required.</p>}
        </div>
        {error && <StatusMessage status="error" message={error} />}
        {loading && <StatusMessage status="loading" message="Creating article..." />}
        {success && <StatusMessage status="success" message="Article created successfully!" />}
        <div className="btn-container">
          <Button type="Button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to Articles
          </Button>
          <Button type="submit">Create Article</Button>
        </div>
      </form>
    </div>
  );
}

export default ArticleCreate;
