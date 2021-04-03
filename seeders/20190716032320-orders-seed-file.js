/* eslint-disable no-unused-vars */
const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert(
      'orders',
      [
        {
          id: 1,
          name: 'Johnny',
          phone: faker.phone.phoneNumber(),
          address: faker.address.streetAddress(),
          amount: faker.random.number(),
          sn: faker.random.number(),
          shipping_status: Math.floor(Math.random() * 1),
          payment_status: Math.floor(Math.random() * 1),
          UserId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Jason',
          phone: faker.phone.phoneNumber(),
          address: faker.address.streetAddress(),
          amount: faker.random.number(),
          sn: faker.random.number(),
          shipping_status: Math.floor(Math.random() * 1),
          payment_status: Math.floor(Math.random() * 1),
          UserId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    ),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('orders', null, {}),
}
