import React, { useEffect, useState } from 'react';
import Button from '../Button/Button';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ArticleList.css';

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/articles`);
        setArticles(response.data);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to fetch articles. Please try again later.');
      }
    };
    fetchArticles();
  }, []);

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
              <Link className="article-item" to={`/article/${article.id}`} key={article.id}>
                <li>{article.title}</li>
              </Link>
            ))}
          </ul>
        )
      ) : (
        <p className="error-message">Failed to load articles.</p>
      )}
      <Link to="/create">
        <Button>Create New Article</Button>
      </Link>
    </div>
  );
}

export default ArticleList;
