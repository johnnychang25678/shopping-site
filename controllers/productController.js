/* eslint-disable no-console */
const db = require('../models')

const { Product } = db
const { Cart } = db
const PAGE_LIMIT = 3
const PAGE_OFFSET = 0

const productController = {
  getProducts: async (req, res) => {
    try {
      // 產品
      const products = await Product.findAndCountAll({
        offset: PAGE_OFFSET,
        limit: PAGE_LIMIT,
        raw: true,
        nest: true,
      })
      // 購物車
      const cart = await Cart.findByPk(req.session.cartId, {
        include: [{ model: Product, as: 'items' }],
      })
      let totalPrice = 0
      if (!cart)
        return res.render('products', {
          products,
          totalPrice,
        })
      totalPrice =
        cart.items.length > 0
          ? cart.items
              .map((d) => d.price * d.CartItem.quantity)
              .reduce((a, b) => a + b)
          : 0

      return res.render('products', {
        products,
        cart: cart.toJSON(),
        totalPrice,
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
}
module.exports = productController
