const { v4: uuidv4 } = require('uuid');
const {
  readArticleFile,
  writeArticleFile,
  deleteArticleFile,
  getAllArticleIds,
} = require('./service');

async function getAllArticles(req, res) {
  try {
    const ids = await getAllArticleIds();
    const articlePromises = ids.map(async (id) => {
      const article = await readArticleFile(id);
      if (article) {
        return { id: article.id, title: article.title };
      }
      return null;
    });

    const articles = (await Promise.all(articlePromises)).filter(Boolean);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Failed to fetch articles.' });
  }
}

async function getArticleById(req, res) {
  const { id } = req.params;
  try {
    const article = await readArticleFile(id);
    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ message: 'Article not found.' });
    }
  } catch (error) {
    console.error(`Error fetching article ${id}:`, error);
    res.status(500).json({ message: 'Failed to retrieve article.' });
  }
}

async function createArticle(req, res) {
  const { title, content } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required.' });
  }
  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Content is required.' });
  }

  const id = uuidv4();
  const newArticle = { id, title: title.trim(), content: content.trim() };

  try {
    await writeArticleFile(id, newArticle);
    res
      .status(201)
      .json({
        id: newArticle.id,
        title: newArticle.title,
        message: 'Article created successfully.',
      });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Failed to create article.' });
  }
}

async function updateArticle(req, res) {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required.' });
  }
  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Content is required.' });
  }

  try {
    const existingArticle = await readArticleFile(id);
    if (!existingArticle) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    const updatedArticle = {
      id,
      title: title.trim(),
      content: content.trim(),
    };

    await writeArticleFile(id, updatedArticle);
    res.json({
      id: updatedArticle.id,
      title: updatedArticle.title,
      message: 'Article updated successfully.',
    });
  } catch (error) {
    console.error(`Error updating article ${id}:`, error);
    res.status(500).json({ message: 'Failed to update article.' });
  }
}

async function deleteArticle(req, res) {
  const { id } = req.params;

  try {
    const deleted = await deleteArticleFile(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    res.json({ message: 'Article deleted successfully.' });
  } catch (error) {
    console.error(`Error deleting article ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete article.' });
  }
}

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};