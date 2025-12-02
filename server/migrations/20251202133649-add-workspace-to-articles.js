'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('articles', 'workspace_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'workspaces',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('articles', 'workspace_id');
  }
};
