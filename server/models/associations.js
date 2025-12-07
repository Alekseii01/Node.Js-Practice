const sequelize = require('./index');
const Article = require('./Article');
const Comment = require('./Comment');
const Workspace = require('./Workspace');

Article.hasMany(Comment, {
  foreignKey: 'article_id',
  as: 'comments',
  onDelete: 'CASCADE'
});

Comment.belongsTo(Article, {
  foreignKey: 'article_id',
  as: 'article'
});

Workspace.hasMany(Article, {
  foreignKey: 'workspace_id',
  as: 'articles',
  onDelete: 'SET NULL'
});

Article.belongsTo(Workspace, {
  foreignKey: 'workspace_id',
  as: 'workspace'
});

module.exports = {
  sequelize,
  Article,
  Comment,
  Workspace
};
