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
  getArticleByVersion,
  search,
  exportArticleAsPDF
} = require('./controller');
const { readArticleFile } = require('./service');
const upload = require('../middleware/upload');
const { authenticateToken, requireResourceAccess } = require('../middleware/auth');

const router = express.Router();

const loadArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await readArticleFile(id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }
    
    req.resource = article;
    next();
  } catch (error) {
    console.error('Error loading article:', error);
    res.status(500).json({ message: 'Failed to load article.' });
  }
};

router.get('/search', search);
router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.get('/:id/versions', getArticleVersionsHistory);
router.get('/:id/versions/:versionNumber', getArticleByVersion);
router.get('/:id/export/pdf', exportArticleAsPDF);
router.post('/', authenticateToken, createArticle);
router.put('/:id', authenticateToken, loadArticle, requireResourceAccess('created_by'), updateArticle);
router.delete('/:id', authenticateToken, loadArticle, requireResourceAccess('created_by'), deleteArticle);

router.post('/:id/attachments', authenticateToken, loadArticle, requireResourceAccess('created_by'), upload.single('file'), uploadAttachment);
router.delete('/:id/attachments/:filename', authenticateToken, loadArticle, requireResourceAccess('created_by'), deleteAttachment);

module.exports = router;