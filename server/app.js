const express = require('express');
const cors = require('cors');
const path = require('path');
const articlesRouter = require('./article/index');
const sequelize = require('./models/index');

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

sequelize.authenticate()
  .then(() => {
    console.log('PostgreSQL database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = app;