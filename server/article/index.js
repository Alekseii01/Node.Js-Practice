const express = require('express');
const {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  uploadAttachment,
  deleteAttachment,
} = require('./controller');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.post('/', createArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

router.post('/:id/attachments', upload.single('file'), uploadAttachment);
router.delete('/:id/attachments/:filename', deleteAttachment);

module.exports = router;