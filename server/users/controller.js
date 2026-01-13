const { User } = require('../models/associations');
const { sendToUser } = require('../websocket/notificationService');

async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']]
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'created_at', 'updated_at']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Valid role (admin or user) is required' });
    }
    
    if (id === req.user.id && role === 'user') {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.update({ role });
    
    console.log(`Sending role update notification to user ${id}: ${role}`);
    sendToUser(id, 'user_role_updated', {
      userId: id,
      newRole: role
    });
    
    const updatedUser = await User.findByPk(id, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'created_at', 'updated_at']
    });
    
    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
}

async function getCurrentUser(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'created_at', 'updated_at']
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  getCurrentUser
};