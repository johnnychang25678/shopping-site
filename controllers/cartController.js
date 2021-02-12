const db = require('../models')
const Cart = db.Cart
const CartItem = db.CartItem
const PAGE_LIMIT = 10;
const PAGE_OFFSET = 0;

let cartController = {
  getCart: (req, res) => {
    console.log(req.session)
    return Cart.findByPk(req.session.cartId, { include: 'items' })
      .then(cart => {
        if (!cart) {
          return res.render('cart')
        }
        const totalPrice = cart.items.length > 0 ? cart.items.map(d => d.price * d.CartItem.quantity).reduce((a, b) => a + b) : 0
        return res.render('cart', {
          cart: cart.toJSON(),
          totalPrice
        })
      })
      .catch(err => console.log(err.message))
  },
  // 放產品入購物車，使用者body會帶有產品id
  postCart: async (req, res) => {
    try {
      const cart = await Cart.findOrCreate({
        where: {
          id: req.session.cartId || 0
        },
      })

      const cartItem = await CartItem.findOrCreate({
        where: {
          CartId: cart[0].dataValues.id,
          ProductId: req.body.productId
        }
      })

      await cartItem[0].update({
        quantity: (cartItem[0].dataValues.quantity || 0) + 1
      })

      req.session.cartId = cart[0].dataValues.id
      req.session.save((err) => {
        if (err) throw err
        res.redirect('back')
      })
    } catch (err) {
      console.log(err)
    }

  },
  addCartItem: (req, res) => {
    CartItem.findByPk(req.params.id).then(cartItem => {
      cartItem.update({
        quantity: cartItem.quantity + 1,
      })
        .then((cartItem) => {
          return res.redirect('back')
        })
    })
  },
  subCartItem: (req, res) => {
    CartItem.findByPk(req.params.id).then(cartItem => {
      cartItem.update({
        quantity: cartItem.quantity - 1 >= 1 ? cartItem.quantity - 1 : 1,
      })
        .then((cartItem) => {
          return res.redirect('back')
        })
    })
  },
  deleteCartItem: (req, res) => {
    CartItem.findByPk(req.params.id).then(cartItem => {
      cartItem.destroy()
        .then((cartItem) => {
          return res.redirect('back')
        })
    })
  }
}

module.exports = cartController