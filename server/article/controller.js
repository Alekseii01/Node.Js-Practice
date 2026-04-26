const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs/promises');
const PDFDocument = require('pdfkit');
const {
  readArticleFile,
  writeArticleFile,
  deleteArticleFile,
  getAllArticleIds,
  getArticleVersions,
  getArticleVersion,
  isAttachmentReferencedByVersions,
  searchArticles
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
          workspace_id: article.workspace_id,
          created_by: article.created_by
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
    workspace_id: workspace_id || null,
    created_by: req.user.id
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
    const existingArticle = req.resource;

    const updatedArticle = {
      id,
      title: title.trim(),
      content: content.trim(),
      attachments: existingArticle.attachments || [],
      workspace_id: workspace_id !== undefined ? workspace_id : existingArticle.workspace_id,
      created_by: existingArticle.created_by || req.user.id
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
    const article = req.resource;

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
    const article = req.resource;

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

    const isFileStillReferenced = await isAttachmentReferencedByVersions(id, filename);

    if (!isFileStillReferenced) {
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      await fs.unlink(filePath).catch(err => {
        console.error('Error deleting file:', err);
      });
    }

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

async function getArticleVersionsHistory(req, res) {
  const { id } = req.params;
  
  try {
    const article = await readArticleFile(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }
    
    const versions = await getArticleVersions(id);
    res.json(versions);
  } catch (error) {
    console.error(`Error fetching versions for article ${id}:`, error);
    res.status(500).json({ message: 'Failed to retrieve article versions.' });
  }
}

async function getArticleByVersion(req, res) {
  const { id, versionNumber } = req.params;
  
  try {
    const version = await getArticleVersion(id, parseInt(versionNumber));
    if (version) {
      res.json({
        ...version,
        isOldVersion: true
      });
    } else {
      res.status(404).json({ message: 'Version not found.' });
    }
  } catch (error) {
    console.error(`Error fetching version ${versionNumber} for article ${id}:`, error);
    res.status(500).json({ message: 'Failed to retrieve article version.' });
  }
}

async function search(req, res) {
  try {
    const { q, workspace_id } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query is required.' });
    }
    
    const articles = await searchArticles(q.trim(), workspace_id || null);
    res.json(articles);
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ message: 'Failed to search articles.' });
  }
}

async function exportArticleAsPDF(req, res) {
  const { id } = req.params;
  try {
    const article = await readArticleFile(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`);
    
    doc.pipe(res);
    
    doc.fontSize(24).text(article.title, { align: 'center' });
    doc.moveDown();
    
    // doc.fontSize(12).text(`Created: ${new Date(article.createdAt).toLocaleDateString()}`, { align: 'left' });
    if (article.author) {
      const authorName = [article.author.firstName, article.author.lastName].filter(Boolean).join(' ') || article.author.email;
      doc.text(`Author: ${authorName}`, { align: 'left' });
    }
    doc.moveDown();
    
    const plainContent = article.content.replace(/<[^>]*>/g, '');
    doc.fontSize(14).text(plainContent, { align: 'left' });
    
    doc.end();
  } catch (error) {
    console.error(`Error exporting article ${id} as PDF:`, error);
    res.status(500).json({ message: 'Failed to export article as PDF.' });
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
  getArticleVersionsHistory,
  getArticleByVersion,
  search,
  exportArticleAsPDF
};