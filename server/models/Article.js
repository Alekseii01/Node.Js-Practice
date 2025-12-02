const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Title cannot be empty'
      },
      len: {
        args: [1, 200],
        msg: 'Title must be between 1 and 200 characters'
      }
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Content cannot be empty'
      }
    }
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false
  },
  workspace_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'workspaces',
      key: 'id'
    },
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'articles',
  timestamps: true,
  underscored: true
});

module.exports = Article;
