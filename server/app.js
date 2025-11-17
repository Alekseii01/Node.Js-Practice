const express = require('express');
const cors = require('cors');
const path = require('path');
const articlesRouter = require('./article/index');
const { ensureDataDirectory } = require('./article/service');

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

ensureDataDirectory();

module.exports = app;