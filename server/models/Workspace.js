const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Workspace = sequelize.define('Workspace', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Workspace name cannot be empty'
      },
      len: {
        args: [1, 100],
        msg: 'Workspace name must be between 1 and 100 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'workspaces',
  timestamps: true,
  underscored: true
});

module.exports = Workspace;
