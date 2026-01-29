import React, { useState, useCallback } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import './SearchInput.css';

function SearchInput({ onSearch, placeholder = 'Search articles...' }) {
  const [query, setQuery] = useState('');
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const handleSearch = useCallback((searchQuery) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    setDebounceTimeout(timeout);
  }, [onSearch, debounceTimeout]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    onSearch(query);
  };

  return (
    <form className="search-input-container" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          aria-label="Search articles"
        />
        {query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>
    </form>
  );
}

export default SearchInput;
