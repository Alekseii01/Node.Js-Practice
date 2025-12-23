const express = require('express');
const {
  editComment,
  removeComment
} = require('./controller');

const router = express.Router();

router.put('/:commentId', editComment);
router.delete('/:commentId', removeComment);

module.exports = router;