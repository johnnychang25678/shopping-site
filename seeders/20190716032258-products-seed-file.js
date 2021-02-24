/* eslint-disable no-unused-vars */
const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert(
      'Products',
      Array.from({ length: 50 }).map((item, index) => ({
        id: index + 1,
        name: faker.commerce.productName(),
        description: `${faker.commerce.product()}/${faker.commerce.productName()}`,
        price: faker.commerce.price(),
        image: `https://loremflickr.com/320/240/furniture/?lock=${
          Math.random() * 100
        }`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      {}
    ),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('Products', null, {}),
}
