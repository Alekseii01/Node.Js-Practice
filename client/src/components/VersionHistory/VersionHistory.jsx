import { useState, useEffect } from 'react';
import axios from 'axios';
import './VersionHistory.css';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

function VersionHistory({ articleId, currentVersion, onSelectVersion, onClose }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/articles/${articleId}/versions`);
        setVersions(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching version history:', err);
        setError('Failed to load version history');
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [articleId]);

  const handleVersionSelect = (versionNumber) => {
    onSelectVersion(versionNumber);
    onClose();
  };

  if (loading) {
    return (
      <div className="version-history-modal">
        <div className="version-history-content">
          <div className="version-history-header">
            <h2>Version History</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="version-loading">Loading versions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="version-history-modal">
        <div className="version-history-content">
          <div className="version-history-header">
            <h2>Version History</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="version-error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="version-history-modal" onClick={onClose}>
      <div className="version-history-content" onClick={(e) => e.stopPropagation()}>
        <div className="version-history-header">
          <h2>Version History</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="version-list">
          {versions.length === 0 ? (
            <div className="no-versions">No version history available</div>
          ) : (
            versions.map((version) => (
              <div 
                key={version.id} 
                className={`version-item ${version.version_number === currentVersion ? 'current' : ''}`}
                onClick={() => handleVersionSelect(version.version_number)}
              >
                <div className="version-header">
                  <span className="version-number">Version {version.version_number}</span>
                  {version.version_number === currentVersion && (
                    <span className="current-badge">Current</span>
                  )}
                </div>
                <div className="version-details">
                  <div className="version-title">{version.title}</div>
                  <div className="version-date">{formatDate(version.created_at)}</div>
                  {version.workspace && (
                    <div className="version-workspace">Workspace: {version.workspace.name}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default VersionHistory;
