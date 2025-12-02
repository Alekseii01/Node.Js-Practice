const express = require('express');
const cors = require('cors');
const path = require('path');
const articlesRouter = require('./article/index');
const commentsRouter = require('./comment/index');
const workspacesRouter = require('./workspace/index');
const { sequelize } = require('./models/associations');

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  })
);
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/articles', articlesRouter);
app.use('/articles', commentsRouter);
app.use('/comments', commentsRouter);
app.use('/workspaces', workspacesRouter);

sequelize.authenticate()
  .then(() => {
    console.log('PostgreSQL database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = app;