const Article = require('../models/Article');

async function ensureDataDirectory() {
  console.log('Using PostgreSQL database for article storage.');
}

async function readArticleFile(id) {
  try {
    const article = await Article.findByPk(id);
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
      attachments: articleData.attachments || []
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

async function getAllArticleIds() {
  try {
    const articles = await Article.findAll({
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