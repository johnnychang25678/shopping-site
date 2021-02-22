/* eslint-disable no-console */
const db = require('../models')

const { Cart } = db
const { Product } = db
const { CartItem } = db
const PAGE_LIMIT = 10
const PAGE_OFFSET = 0

const cartController = {
  getCart: async (req, res) => {
    try {
      let totalPrice = 0
      const cart = await Cart.findByPk(req.session.cartId, {
        include: [{ model: Product, as: 'items' }],
      })
      if (!cart) return res.render('cart', { totalPrice })

      totalPrice =
        cart.items.length > 0
          ? cart.items
              .map((d) => d.price * d.CartItem.quantity)
              .reduce((a, b) => a + b)
          : 0
      return res.render('cart', {
        cart: cart.toJSON(),
        totalPrice,
      })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  // 放產品入購物車，使用者body會帶有產品id
  postCart: async (req, res) => {
    // console.log(req.session.cartId)
    try {
      const cart = await Cart.findOrCreate({
        where: {
          id: req.session.cartId || 0, // find id === 0, if not found, create
        },
      })

      const cartItem = await CartItem.findOrCreate({
        where: {
          CartId: cart[0].dataValues.id,
          ProductId: req.body.productId,
        },
      })

      await cartItem[0].update({
        quantity: (cartItem[0].dataValues.quantity || 0) + 1,
      })

      req.session.cartId = cart[0].dataValues.id
      // save cartId to req.session
      return req.session.save((err) => {
        if (err) throw err
        return res.redirect('back')
      })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  addCartItem: async (req, res) => {
    try {
      const cartItem = await CartItem.findByPk(req.params.id)
      await cartItem.update({
        quantity: cartItem.quantity + 1,
      })
      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  subCartItem: async (req, res) => {
    try {
      const cartItem = await CartItem.findByPk(req.params.id)
      await cartItem.update({
        quantity: cartItem.quantity - 1 >= 1 ? cartItem.quantity - 1 : 1,
      })
      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  deleteCartItem: async (req, res) => {
    try {
      const cartItem = await CartItem.findByPk(req.params.id)
      await cartItem.destroy()
      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
}

module.exports = cartController
