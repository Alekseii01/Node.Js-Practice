const jwt = require('jsonwebtoken');
const { User } = require('../models/associations');
const { USER_ROLES } = require('../constants');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (decoded.role !== user.role) {
      return res.status(401).json({ 
        message: 'Token role mismatch. Please log in again.',
        code: 'ROLE_MISMATCH'
      });
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== USER_ROLES.ADMIN) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

const requireResourceAccess = (resourceUserIdField = 'created_by') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role === USER_ROLES.ADMIN) {
      return next();
    }
    
    if (req.resource) {
      const resourceUserId = req.resource[resourceUserIdField];
      if (!resourceUserId || parseInt(resourceUserId) === parseInt(req.user.id)) {
        return next();
      }
    }
    
    return res.status(403).json({ message: 'Access denied. You can only edit your own resources.' });
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireResourceAccess
};