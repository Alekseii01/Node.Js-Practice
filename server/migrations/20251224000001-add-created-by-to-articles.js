module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('articles');
    
    if (!tableInfo.created_by) {
      await queryInterface.addColumn('articles', 'created_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('articles');
    
    if (tableInfo.created_by) {
      await queryInterface.removeColumn('articles', 'created_by');
    }
  }
};