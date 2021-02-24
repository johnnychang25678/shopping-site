/* eslint-disable no-unused-vars */
const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert(
      'Carts',
      Array.from({ length: 3 }).map((item, index) => ({
        id: index + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      {}
    ),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('Carts', null, {}),
}
