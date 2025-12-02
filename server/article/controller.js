const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs/promises');
const {
  readArticleFile,
  writeArticleFile,
  deleteArticleFile,
  getAllArticleIds,
} = require('./service');
const { broadcastNotification } = require('../websocket/notificationService');

async function getAllArticles(req, res) {
  try {
    const { workspace_id } = req.query;
    const ids = await getAllArticleIds(workspace_id);
    const articlePromises = ids.map(async (id) => {
      const article = await readArticleFile(id);
      if (article) {
        return { 
          id: article.id, 
          title: article.title,
          workspace_id: article.workspace_id 
        };
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
  const { title, content, workspace_id } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required.' });
  }
  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Content is required.' });
  }

  const id = uuidv4();
  const newArticle = { 
    id, 
    title: title.trim(), 
    content: content.trim(),
    attachments: [],
    workspace_id: workspace_id || null
  };

  try {
    await writeArticleFile(id, newArticle);
    
    broadcastNotification('article_created', {
      id: newArticle.id,
      title: newArticle.title,
      workspace_id: newArticle.workspace_id
    });

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
  const { title, content, workspace_id } = req.body;

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
      attachments: existingArticle.attachments || [],
      workspace_id: workspace_id !== undefined ? workspace_id : existingArticle.workspace_id
    };

    await writeArticleFile(id, updatedArticle);
    
    broadcastNotification('article_updated', {
      id: updatedArticle.id,
      title: updatedArticle.title
    });

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

    broadcastNotification('article_deleted', { id });

    res.json({ message: 'Article deleted successfully.' });
  } catch (error) {
    console.error(`Error deleting article ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete article.' });
  }
}

async function uploadAttachment(req, res) {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const article = await readArticleFile(id);
    if (!article) {
      await fs.unlink(req.file.path);
      return res.status(404).json({ message: 'Article not found.' });
    }

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date().toISOString()
    };

    if (!article.attachments) {
      article.attachments = [];
    }
    article.attachments.push(attachment);

    await writeArticleFile(id, article);

    broadcastNotification('attachment_added', {
      articleId: id,
      articleTitle: article.title,
      filename: attachment.originalName
    });

    res.status(201).json({
      message: 'File uploaded successfully.',
      attachment
    });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    res.status(500).json({ message: 'Failed to upload file.' });
  }
}

async function deleteAttachment(req, res) {
  const { id, filename } = req.params;

  try {
    const article = await readArticleFile(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    if (!article.attachments || article.attachments.length === 0) {
      return res.status(404).json({ message: 'No attachments found.' });
    }

    const attachmentIndex = article.attachments.findIndex(
      att => att.filename === filename
    );

    if (attachmentIndex === -1) {
      return res.status(404).json({ message: 'Attachment not found.' });
    }

    const deletedAttachment = article.attachments[attachmentIndex];
    article.attachments.splice(attachmentIndex, 1);

    const filePath = path.join(__dirname, '..', 'uploads', filename);
    await fs.unlink(filePath).catch(err => {
      console.error('Error deleting file:', err);
    });

    await writeArticleFile(id, article);

    broadcastNotification('attachment_removed', {
      articleId: id,
      articleTitle: article.title,
      filename: deletedAttachment.originalName
    });

    res.json({ message: 'Attachment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ message: 'Failed to delete attachment.' });
  }
}

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  uploadAttachment,
  deleteAttachment,
};