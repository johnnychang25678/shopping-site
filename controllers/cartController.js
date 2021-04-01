/* eslint-disable no-console */
const query = require('../db')

const cartController = {
  getCart: async (req, res) => {
    try {
      let totalPrice = 0
      // const cart = await Cart.findByPk(req.session.cartId, {
      //   include: [{ model: Product, as: 'items' }],
      // })
      const sql =
        'SELECT cartItems.id AS cartItemId, cartItems.CartId, cartItems.quantity, products.* FROM cartItems JOIN products ON cartItems.ProductId = products.id WHERE CartItems.CartId = ?'
      const cart = await query(sql, [req.session.cartId])

      if (!cart.length) return res.render('cart', { totalPrice })

      totalPrice =
        cart.length > 0
          ? cart
              .map((item) => item.price * item.quantity)
              .reduce((a, b) => a + b)
          : 0
      return res.render('cart', {
        cart,
        totalPrice,
      })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  // 放產品入購物車，使用者body會帶有產品id
  postCart: async (req, res) => {
    try {
      if (!req.session.cartId) {
        const insertCart = 'INSERT INTO carts VALUES(default, default, default)'
        await query(insertCart)
        const cartId = await query('SELECT LAST_INSERT_ID()')
        // add session
        req.session.cartId = Object.values(cartId[0])[0]
      }

      const itemSql =
        'SELECT * FROM cartItems WHERE CartId = ? AND ProductID = ?'
      const item = await query(itemSql, [
        req.session.cartId,
        req.body.productId,
      ])
      if (!item.length) {
        console.log(req.body.productId)
        const insertItem =
          'INSERT INTO cartItems(CartId, ProductId, quantity) VALUES(?, ?, ?)'
        await query(insertItem, [req.session.cartId, req.body.productId, 1])
      } else {
        const addItem =
          'UPDATE cartItems SET quantity = quantity + 1 WHERE CartId = ? AND ProductId = ?'
        await query(addItem, [req.session.cartId, req.body.productId])
      }

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
      const sql = 'UPDATE cartItems SET quantity = quantity + 1 WHERE id = ?'
      await query(sql, [req.params.id])
      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  subCartItem: async (req, res) => {
    try {
      const sqlQuantity = 'SELECT quantity FROM cartItems WHERE id = ?'
      const result = await query(sqlQuantity, [req.params.id])
      const currentQuantity = result[0].quantity
      if (currentQuantity - 1 < 1) {
        const sql = 'UPDATE cartItems SET quantity = ? WHERE id = ?'
        await query(sql, [1, req.params.id])
      } else {
        const sql = 'UPDATE cartItems SET quantity = quantity - 1 WHERE id = ?'
        await query(sql, [req.params.id])
      }
      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  deleteCartItem: async (req, res) => {
    try {
      const sql = 'DELETE FROM cartItems WHERE id = ?'
      await query(sql, [req.params.id])
      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
}

module.exports = cartController
