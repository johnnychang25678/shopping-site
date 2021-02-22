module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CartItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      CartId: {
        type: Sequelize.INTEGER,
      },
      ProductId: {
        type: Sequelize.INTEGER,
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CartItems')
  },
}
