const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const ArticleVersion = sequelize.define('ArticleVersion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  article_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'articles',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  version_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Title cannot be empty'
      },
      len: {
        args: [1, 255],
        msg: 'Title must be between 1 and 255 characters'
      }
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: [],
    get() {
      const value = this.getDataValue('attachments');
      return Array.isArray(value) ? value : [];
    }
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
  tableName: 'article_versions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['article_id', 'version_number']
    },
    {
      fields: ['article_id']
    }
  ]
});

module.exports = ArticleVersion;
