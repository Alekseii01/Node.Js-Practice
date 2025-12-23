const { Article, Comment, ArticleVersion } = require('../models/associations');

async function ensureDataDirectory() {
  console.log('Using PostgreSQL database for article storage.');
}

async function createArticleVersion(articleId, articleData) {
  try {
    const maxVersion = await ArticleVersion.max('version_number', {
      where: { article_id: articleId }
    });
    
    const versionNumber = (maxVersion || 0) + 1;
    
    const version = await ArticleVersion.create({
      article_id: articleId,
      version_number: versionNumber,
      title: articleData.title,
      content: articleData.content,
      attachments: articleData.attachments || [],
      workspace_id: articleData.workspace_id || null
    });
    
    return version.toJSON();
  } catch (error) {
    throw error;
  }
}

async function readArticleFile(id) {
  try {
    const article = await Article.findByPk(id, {
      include: [{
        model: Comment,
        as: 'comments',
        attributes: ['id', 'content', 'author', 'created_at', 'updated_at'],
        order: [['created_at', 'DESC']]
      }]
    });
    if (!article) {
      return null;
    }
    return article.toJSON();
  } catch (error) {
    throw error;
  }
}

async function writeArticleFile(id, articleData) {
  try {
    const article = await Article.findByPk(id);
    
    if (article) {
      await createArticleVersion(id, {
        title: article.title,
        content: article.content,
        attachments: article.attachments,
        workspace_id: article.workspace_id
      });
      
      await article.update({
        title: articleData.title,
        content: articleData.content,
        attachments: articleData.attachments || [],
        workspace_id: articleData.workspace_id || null
      });
      
      return article;
    } else {
      const newArticle = await Article.create({
        id,
        title: articleData.title,
        content: articleData.content,
        attachments: articleData.attachments || [],
        workspace_id: articleData.workspace_id || null
      });
      
      return newArticle;
    }
  } catch (error) {
    throw error;
  }
}

async function deleteArticleFile(id) {
  try {
    const deleted = await Article.destroy({
      where: { id }
    });
    return deleted > 0;
  } catch (error) {
    throw error;
  }
}

async function getAllArticleIds(workspaceId = null) {
  try {
    const where = workspaceId ? { workspace_id: workspaceId } : {};
    const articles = await Article.findAll({
      where,
      attributes: ['id'],
      raw: true
    });
    return articles.map(article => article.id);
  } catch (error) {
    throw error;
  }
}

async function getArticleVersions(articleId) {
  try {
    const versions = await ArticleVersion.findAll({
      where: { article_id: articleId },
      order: [['version_number', 'DESC']],
      attributes: ['id', 'version_number', 'title', 'attachments', 'created_at', 'updated_at']
    });
    return versions.map(v => v.toJSON());
  } catch (error) {
    throw error;
  }
}

async function getArticleVersion(articleId, versionNumber) {
  try {
    const version = await ArticleVersion.findOne({
      where: { 
        article_id: articleId,
        version_number: versionNumber
      }
    });
    return version ? version.toJSON() : null;
  } catch (error) {
    throw error;
  }
}

async function isAttachmentReferencedByVersions(articleId, filename) {
  try {
    const versions = await ArticleVersion.findAll({
      where: { article_id: articleId },
      attributes: ['attachments']
    });
    
    return versions.some(version => 
      version.attachments && 
      Array.isArray(version.attachments) &&
      version.attachments.some(att => att.filename === filename)
    );
  } catch (error) {
    throw error;
  }
}

module.exports = {
  ensureDataDirectory,
  readArticleFile,
  writeArticleFile,
  deleteArticleFile,
  getAllArticleIds,
  createArticleVersion,
  getArticleVersions,
  getArticleVersion,
  isAttachmentReferencedByVersions
};