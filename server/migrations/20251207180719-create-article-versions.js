'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('article_versions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      article_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'articles',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      version_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      attachments: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      workspace_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'workspaces',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('article_versions', ['article_id', 'version_number'], {
      unique: true,
      name: 'article_versions_article_version_unique'
    });

    await queryInterface.addIndex('article_versions', ['article_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('article_versions');
  }
};
