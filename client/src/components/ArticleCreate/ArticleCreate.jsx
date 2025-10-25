import React, { useState } from 'react';
import Button from '../Button/Button.jsx';
import { FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import { validateTitle, validateContent } from '../../utils/validation.js';
import 'react-quill/dist/quill.snow.css';
import './ArticleCreate.css';

function ArticleCreate() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({ title: false, content: false });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const hasTitleError = validateTitle(title);
    const hasContentError = validateContent(content);
    setErrors({ title: hasTitleError, content: hasContentError });

    if (hasTitleError || hasContentError) {
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/articles`, {
        title,
        content,
      });
      console.log('Article created:', response.data);
      setSuccess(true);
      setTitle('');
      setContent('');
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            value={content}
            onChange={setContent}
            placeholder="Write your article here..."
            className={errors.content ? 'error' : ''}
          />
          {errors.content && <p className="field-error">Content is required.</p>}
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && (
          <div className="success-message success-anim">
            <FaCheckCircle className="checkmark" />
            Article created successfully!
          </div>
        )}
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
