const {
  getAllWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
} = require('./service');
const { broadcastNotification } = require('../websocket/notificationService');

async function getWorkspaces(req, res) {
  try {
    const workspaces = await getAllWorkspaces();
    res.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ message: 'Failed to fetch workspaces.' });
  }
}

async function getWorkspace(req, res) {
  const { id } = req.params;

  try {
    const workspace = await getWorkspaceById(id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }
    res.json(workspace);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ message: 'Failed to fetch workspace.' });
  }
}

async function addWorkspace(req, res) {
  const { name, description } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Workspace name is required.' });
  }

  try {
    const workspace = await createWorkspace({ name, description });

    broadcastNotification('workspace_created', {
      id: workspace.id,
      name: workspace.name
    });

    res.status(201).json({
      message: 'Workspace created successfully.',
      workspace
    });
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ message: 'Failed to create workspace.' });
  }
}

async function editWorkspace(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Workspace name is required.' });
  }

  try {
    const workspace = await updateWorkspace(id, { name, description });
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }

    broadcastNotification('workspace_updated', {
      id: workspace.id,
      name: workspace.name
    });

    res.json({
      message: 'Workspace updated successfully.',
      workspace
    });
  } catch (error) {
    console.error('Error updating workspace:', error);
    res.status(500).json({ message: 'Failed to update workspace.' });
  }
}

async function removeWorkspace(req, res) {
  const { id } = req.params;

  try {
    const deleted = await deleteWorkspace(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }

    broadcastNotification('workspace_deleted', { id });

    res.json({ message: 'Workspace deleted successfully.' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    res.status(500).json({ message: 'Failed to delete workspace.' });
  }
}

module.exports = {
  getWorkspaces,
  getWorkspace,
  addWorkspace,
  editWorkspace,
  removeWorkspace
};
