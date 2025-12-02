const express = require('express');
const {
  addComment,
  getComments,
  editComment,
  removeComment
} = require('./controller');

const router = express.Router();

router.post('/:articleId/comments', addComment);
router.get('/:articleId/comments', getComments);
router.put('/:commentId', editComment);
router.delete('/:commentId', removeComment);

module.exports = router;
