const { Article, Comment } = require('../models/associations');

async function ensureDataDirectory() {
  console.log('Using PostgreSQL database for article storage.');
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
    const [article, created] = await Article.upsert({
      id,
      title: articleData.title,
      content: articleData.content,
      attachments: articleData.attachments || [],
      workspace_id: articleData.workspace_id || null
    }, {
      returning: true
    });
    return article;
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

module.exports = {
  ensureDataDirectory,
  readArticleFile,
  writeArticleFile,
  deleteArticleFile,
  getAllArticleIds,
};