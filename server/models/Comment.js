const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Comment content cannot be empty'
      }
    }
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Anonymous',
    validate: {
      notEmpty: {
        msg: 'Author cannot be empty'
      }
    }
  },
  article_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'articles',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'comments',
  timestamps: true,
  underscored: true
});

module.exports = Comment;
