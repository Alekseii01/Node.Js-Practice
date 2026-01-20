const jwt = require('jsonwebtoken');
const { User } = require('../models/associations');
const { MIN_PASSWORD_LENGTH, DEFAULT_USER_ROLE } = require('../constants');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

async function register(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: DEFAULT_USER_ROLE
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validationErrors 
      });
    }

    if (error.name === 'SequelizeValidationError' || 
        (error.errors && error.errors.some(e => e.validatorKey === 'isEmail'))) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getProfile(req, res) {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  register,
  login,
  getProfile
};