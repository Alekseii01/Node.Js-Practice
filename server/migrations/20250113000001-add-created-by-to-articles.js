module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('articles', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('articles', 'created_by');
  }
};