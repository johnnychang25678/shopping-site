/* eslint-disable no-console */
const query = require('../db')

const cartController = {
  getCart: async (req, res) => {
    try {
      let totalPrice = 0
      const sql =
        'SELECT cartItems.id AS cartItemId, cartItems.CartId, cartItems.quantity, products.* FROM carts JOIN cartItems ON carts.id = cartItems.CartId JOIN products ON cartItems.ProductId = products.id WHERE cartItems.CartId = ?'

      const cart = await query(sql, [req.session.cartId])
      console.log('------ cart:', cart)
      if (!cart.length) return res.render('cart', { totalPrice })

      totalPrice =
        cart.length > 0
          ? cart
              .map((item) => item.price * item.quantity)
              .reduce((a, b) => a + b)
          : 0
      return res.render('cart', {
        cart,
        cartId: cart[0].CartId,
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
        const insertCartSql =
          'INSERT INTO carts(createdAt, updatedAt) VALUES(default, default)'
        const insertCart = await query(insertCartSql)

        // add session
        req.session.cartId = insertCart.insertId
      }

      const itemSql =
        'SELECT * FROM cartItems WHERE CartId = ? AND ProductID = ?'
      const item = await query(itemSql, [
        req.session.cartId,
        req.body.productId,
      ])
      if (!item.length) {
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
