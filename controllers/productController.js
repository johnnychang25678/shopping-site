/* eslint-disable no-console */
const query = require('../db')

const pageLimit = 9

const productController = {
  getProducts: async (req, res) => {
    try {
      const countTotalProducts = query('SELECT COUNT(*) FROM products')
      const { keyword, page } = req.query
      let offset = 0
      if (page) {
        offset = (page - 1) * pageLimit
      }
      let sql
      if (!keyword || keyword.trim === '') {
        sql = 'SELECT * FROM products LIMIT ?, ?'
      } else {
        sql = `SELECT * FROM products WHERE name LIKE '%${keyword}%' LIMIT ?, ?`
      }

      const findProducts = query(sql, [offset, pageLimit])

      const cartSql =
        'SELECT cartItems.id AS cartItemId, cartItems.CartId, cartItems.quantity, products.* FROM cartItems JOIN products ON cartItems.ProductId = products.id WHERE cartItems.CartId = ?'
      const findCart = query(cartSql, [req.session.cartId])

      // eslint-disable-next-line prefer-const
      let [totalProducts, products, cart] = await Promise.all([
        countTotalProducts,
        findProducts,
        findCart,
      ])

      // show no result page if search no result
      if (!products.length) {
        products = 'no result'
      }

      // pagination
      let productCount
      if (!keyword || keyword.trim === '') {
        productCount = Object.values(totalProducts[0])[0]
      } else {
        productCount = products.length
      }

      const currentPage = Number(page) || 1
      const pageCount = Math.ceil(productCount / pageLimit) // 12/9 = 1.33 = 2
      const totalPages = Array.from({ length: pageCount }).map(
        (_, index) => index + 1
      ) // [_, _] => [1, 2]
      const prev = currentPage - 1 < 1 ? 1 : currentPage - 1
      const next = currentPage + 1 > pageCount ? pageCount : currentPage + 1

      let totalPrice = 0
      if (!cart) {
        return res.render('products', {
          products,
          totalPrice,
          currentPage,
          totalPages,
          prev,
          next,
        })
      }
      totalPrice =
        cart.length > 0
          ? cart
              .map((product) => product.price * product.quantity)
              .reduce((a, b) => a + b)
          : 0

      return res.render('products', {
        products,
        cart,
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
    try {
      const sql = 'SELECT * FROM products WHERE id = ?'
      const product = await query(sql, [req.params.id])
      return res.render('product', { product: product[0] })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
}
module.exports = productController
