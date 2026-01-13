const express = require('express');
const {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  uploadAttachment,
  deleteAttachment,
  getArticleVersionsHistory,
  getArticleByVersion
} = require('./controller');
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.get('/:id/versions', getArticleVersionsHistory);
router.get('/:id/versions/:versionNumber', getArticleByVersion);
router.post('/', authenticateToken, createArticle);
router.put('/:id', authenticateToken, updateArticle);
router.delete('/:id', authenticateToken, deleteArticle);

router.post('/:id/attachments', authenticateToken, upload.single('file'), uploadAttachment);
router.delete('/:id/attachments/:filename', authenticateToken, deleteAttachment);

module.exports = router;