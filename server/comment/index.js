const express = require('express');
const {
  addComment,
  getComments
} = require('./controller');

const router = express.Router();

router.post('/:articleId/comments', addComment);
router.get('/:articleId/comments', getComments);

module.exports = router;
