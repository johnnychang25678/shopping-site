/* eslint-disable no-unused-vars */
// const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert(
      'orderItems',
      Array.from({ length: 10 }).map((item, index) => ({
        id: index + 1,
        OrderId: Math.floor(Math.random() * 2) + 1,
        ProductId: Math.floor(Math.random() * 10) + 1,
        quantity: Math.floor(Math.random() * 10) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      {}
    ),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('orderItems', null, {}),
}
