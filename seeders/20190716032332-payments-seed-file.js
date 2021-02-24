/* eslint-disable no-unused-vars */
const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert(
      'Payments',
      Array.from({ length: 5 }).map((item, index) => ({
        amount: faker.random.number(),
        sn: faker.random.number().toString(),
        payment_method: Math.floor(Math.random() * 3) + 1,
        paid_at: new Date(),
        params: null,
        OrderId: Math.floor(Math.random() * 2) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      {}
    ),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('Payments', null, {}),
}
