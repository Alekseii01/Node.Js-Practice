const express = require('express');
const cors = require('cors');
const path = require('path');
const articlesRouter = require('./article/index');
const commentsRouter = require('./comment/index');
const directCommentsRouter = require('./comment/directRouter');
const workspacesRouter = require('./workspace/index');
const authRouter = require('./auth/index');
const { authenticateToken } = require('./middleware/auth');
const { sequelize } = require('./models/associations');

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', authRouter);
app.use('/articles', authenticateToken, articlesRouter);
app.use('/articles', authenticateToken, commentsRouter);
app.use('/comments', authenticateToken, directCommentsRouter);
app.use('/workspaces', authenticateToken, workspacesRouter);

sequelize.authenticate()
  .then(() => {
    console.log('PostgreSQL database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = app;