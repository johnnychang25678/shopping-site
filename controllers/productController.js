/* eslint-disable no-console */
const { Op } = require('sequelize')
const db = require('../models')

const { Product, Cart } = db

const pageLimit = 9

const productController = {
  getProducts: async (req, res) => {
    console.log(req.query)
    try {
      let offset = 0
      if (req.query.page) {
        offset = (req.query.page - 1) * pageLimit
      }
      // for search feature
      let whereQuery = {}
      if (!req.query.keyword || req.query.keyword.trim() === '') {
        whereQuery = {}
      } else {
        whereQuery.name = { [Op.substring]: `${req.query.keyword}` } // LIKE %keyword%
      }
      const productFindAll = Product.findAndCountAll({
        where: whereQuery,
        offset,
        limit: pageLimit,
        raw: true,
        nest: true,
      })

      const cartFindbyPk = Cart.findByPk(req.session.cartId, {
        include: [{ model: Product, as: 'items' }],
      })

      // eslint-disable-next-line prefer-const
      let [products, cart] = await Promise.all([productFindAll, cartFindbyPk])

      // show no result page if search no result
      if (!products.rows.length) {
        products = 'no result'
      }

      // pagination
      const currentPage = Number(req.query.page) || 1
      const pageCount = Math.ceil(products.count / pageLimit) // 12/9 = 1.33 = 2
      const totalPages = Array.from({ length: pageCount }).map(
        (_, index) => index + 1
      ) // [_, _] => [1, 2]
      const prev = currentPage - 1 < 1 ? 1 : currentPage - 1
      const next = currentPage + 1 > pageCount ? pageCount : currentPage + 1

      let totalPrice = 0
      if (!cart)
        return res.render('products', {
          products,
          totalPrice,
          currentPage,
          totalPages,
          prev,
          next,
        })

      totalPrice =
        cart.items.length > 0
          ? cart.items
              .map((product) => product.price * product.CartItem.quantity)
              .reduce((a, b) => a + b)
          : 0

      return res.render('products', {
        products,
        cart: cart.toJSON(),
        totalPrice,
        currentPage,
        totalPages,
        prev,
        next,
      })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  getProduct: async (req, res) => {
    const product = await Product.findByPk(req.params.id)
    return res.render('product', { product: product.toJSON() })
  },
  searchProduct: async (req, res) => {
    console.log(req.query)
    return res.redirect('back')
  },
}
module.exports = productController
