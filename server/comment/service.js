const { Comment } = require('../models/associations');

async function createComment(articleId, commentData) {
  try {
    const comment = await Comment.create({
      content: commentData.content,
      author: commentData.author || 'Anonymous',
      article_id: articleId
    });
    return comment.toJSON();
  } catch (error) {
    throw error;
  }
}

async function getCommentsByArticleId(articleId) {
  try {
    const comments = await Comment.findAll({
      where: { article_id: articleId },
      order: [['created_at', 'DESC']],
      raw: true
    });
    return comments;
  } catch (error) {
    throw error;
  }
}

async function updateComment(commentId, commentData) {
  try {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return null;
    }
    
    await comment.update({
      content: commentData.content,
      author: commentData.author
    });
    
    return comment.toJSON();
  } catch (error) {
    throw error;
  }
}

async function deleteComment(commentId) {
  try {
    const deleted = await Comment.destroy({
      where: { id: commentId }
    });
    return deleted > 0;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createComment,
  getCommentsByArticleId,
  updateComment,
  deleteComment
};
