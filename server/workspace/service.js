const { Workspace } = require('../models/associations');

async function getAllWorkspaces() {
  try {
    const workspaces = await Workspace.findAll({
      order: [['created_at', 'ASC']],
      raw: true
    });
    return workspaces;
  } catch (error) {
    throw error;
  }
}

async function getWorkspaceById(id) {
  try {
    const workspace = await Workspace.findByPk(id);
    return workspace ? workspace.toJSON() : null;
  } catch (error) {
    throw error;
  }
}

async function createWorkspace(workspaceData) {
  try {
    const workspace = await Workspace.create({
      name: workspaceData.name,
      description: workspaceData.description
    });
    return workspace.toJSON();
  } catch (error) {
    throw error;
  }
}

async function updateWorkspace(id, workspaceData) {
  try {
    const workspace = await Workspace.findByPk(id);
    if (!workspace) {
      return null;
    }
    
    await workspace.update({
      name: workspaceData.name,
      description: workspaceData.description
    });
    
    return workspace.toJSON();
  } catch (error) {
    throw error;
  }
}

async function deleteWorkspace(id) {
  try {
    const deleted = await Workspace.destroy({
      where: { id }
    });
    return deleted > 0;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
};
