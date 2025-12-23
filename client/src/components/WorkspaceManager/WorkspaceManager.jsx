import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WorkspaceManager.css';

function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/workspaces`);
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      setError('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Workspace name is required');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim()
      };

      if (editingId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/workspaces/${editingId}`,
          payload
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/workspaces`,
          payload
        );
      }
      
      await fetchWorkspaces();
      resetForm();
    } catch (error) {
      console.error('Error saving workspace:', error);
      setError('Failed to save workspace');
    }
  };

  const handleEdit = (workspace) => {
    setEditingId(workspace.id);
    setFormData({
      name: workspace.name,
      description: workspace.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workspace? This will not delete articles in this workspace.')) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/workspaces/${id}`);
      await fetchWorkspaces();
    } catch (error) {
      console.error('Error deleting workspace:', error);
      setError('Failed to delete workspace');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  if (loading) {
    return <div className="workspace-manager">Loading...</div>;
  }

  return (
    <div className="workspace-manager">
      <div className="workspace-header">
        <h2>
          Manage Workspaces
        </h2>
        <button 
          className="btn-add-workspace"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'New Workspace'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="workspace-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="workspace-name">Workspace Name *</label>
            <input
              id="workspace-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Personal, Work, Projects"
              maxLength={100}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="workspace-description">Description</label>
            <textarea
              id="workspace-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description for this workspace"
              rows="3"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save">
              {editingId ? 'Update Workspace' : 'Create Workspace'}
            </button>
            <button type="button" className="btn-cancel" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="workspaces-list">
        {workspaces.length === 0 ? (
          <div className="no-workspaces">
            <span className="empty-icon">📂</span>
            <p>No workspaces yet. Create your first workspace!</p>
          </div>
        ) : (
          workspaces.map((workspace) => (
            <div key={workspace.id} className="workspace-card">
              <div className="workspace-info">
                <h3>{workspace.name}</h3>
                {workspace.description && (
                  <p className="workspace-description">{workspace.description}</p>
                )}
              </div>
              <div className="workspace-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(workspace)}
                  title="Edit workspace"
                >
                  ✏️
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(workspace.id)}
                  title="Delete workspace"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default WorkspaceManager;
