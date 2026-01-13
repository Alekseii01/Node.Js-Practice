const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  getCurrentUser
} = require('./controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authenticateToken, getCurrentUser);

router.get('/', authenticateToken, requireAdmin, getAllUsers);
router.get('/:id', authenticateToken, requireAdmin, getUserById);
router.put('/:id/role', authenticateToken, requireAdmin, updateUserRole);

module.exports = router;