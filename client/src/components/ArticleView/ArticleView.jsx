import React, { useEffect, useState } from 'react';
import Button from '../Button/Button.jsx';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ArticleView.css';

function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);

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
      <h2>{article.title}</h2>
      <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }}></div>
      <Button onClick={() => navigate('/')}>Back to Articles</Button>
    </div>
  );
}

export default ArticleView;
