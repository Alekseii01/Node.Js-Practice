const {
  createComment,
  getCommentsByArticleId,
  updateComment,
  deleteComment
} = require('./service');
const { broadcastNotification } = require('../websocket/notificationService');
const { Article } = require('../models/associations');

async function addComment(req, res) {
  const { articleId } = req.params;
  const { content, author } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Comment content is required.' });
  }

  try {
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    const comment = await createComment(articleId, { content, author });

    broadcastNotification('comment_added', {
      articleId,
      articleTitle: article.title,
      commentId: comment.id,
      author: comment.author
    });

    res.status(201).json({
      message: 'Comment added successfully.',
      comment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to add comment.' });
  }
}

async function getComments(req, res) {
  const { articleId } = req.params;

  try {
    const comments = await getCommentsByArticleId(articleId);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments.' });
  }
}

async function editComment(req, res) {
  const { commentId } = req.params;
  const { content, author } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Comment content is required.' });
  }

  try {
    const comment = await updateComment(commentId, { content, author });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    broadcastNotification('comment_updated', {
      commentId: comment.id,
      author: comment.author
    });

    res.json({
      message: 'Comment updated successfully.',
      comment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Failed to update comment.' });
  }
}

async function removeComment(req, res) {
  const { commentId } = req.params;

  try {
    const deleted = await deleteComment(commentId);
    if (!deleted) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    broadcastNotification('comment_deleted', { commentId });

    res.json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment.' });
  }
}

module.exports = {
  addComment,
  getComments,
  editComment,
  removeComment
};
