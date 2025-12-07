import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useWebSocket } from '../../context/WebSocketContext';
import './WorkspaceSelector.css';

function WorkspaceSelector({ selectedWorkspace, onWorkspaceChange }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (lastMessage) {
      const { type } = lastMessage;
      if (type === 'workspace_added' || type === 'workspace_updated' || type === 'workspace_deleted') {
        fetchWorkspaces();
      }
    }
  }, [lastMessage]);

  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/workspaces`);
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="workspace-selector">Loading workspaces...</div>;
  }

  return (
    <div className="workspace-selector">
      <label htmlFor="workspace-select">Workspace:</label>
      <select
        id="workspace-select"
        value={selectedWorkspace || ''}
        onChange={(e) => onWorkspaceChange(e.target.value || null)}
        className="workspace-dropdown"
      >
        <option value="">All Workspaces</option>
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default WorkspaceSelector;
