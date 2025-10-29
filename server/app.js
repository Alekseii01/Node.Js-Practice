const express = require('express');
const cors = require('cors');
const path = require('path');
const articlesRouter = require('./article/index');
const { ensureDataDirectory } = require('./article/service');

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  })
);
app.use(express.json());

// Routes
app.use('/articles', articlesRouter);

// Ensure data directory exists
ensureDataDirectory();

module.exports = app;