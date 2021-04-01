/* eslint-disable no-console */
const imgur = require('imgur')
// const db = require('../models')
const query = require('../db')

const { IMGUR_CLIENT_ID } = process.env.IMGUR_CLIENT_ID
// const { Product, Order, User } = db

const adminController = {
  getProducts: async (req, res) => {
    try {
      const sql = 'SELECT * FROM Products ORDER BY id DESC'
      const products = await query(sql)
      return res.render('admin/products', { products })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  addProductPage: (req, res) => res.render('admin/addProductPage'),
  addProduct: async (req, res) => {
    try {
      const { name, description, price } = req.body

      if (!name || !description || !price || !req.file) {
        req.flash('error_messages', 'All fields are mandatory!')
        return res.redirect('/admin/products/add')
      }

      imgur.setClientId(IMGUR_CLIENT_ID)
      const img = await imgur.uploadFile(req.file.path)

      const sql =
        'INSERT INTO products(name, description, price, image) VALUES(?, ?, ?, ?)'
      await query(sql, [name, description, price, img.data.link])

      req.flash('success_messages', 'Add product success.')
      return res.redirect('/admin/products')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  getProduct: async (req, res) => {
    try {
      const sql = 'SELECT * FROM products WHERE id = ?'
      const product = await query(sql, req.params.id) // returns an array
      return res.render('admin/product', { product: product[0] })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  editProductPage: async (req, res) => {
    try {
      const sql = 'SELECT * FROM products WHERE id = ?'
      const product = await query(sql, req.params.id) // returns an array
      // const product = await Product.findByPk(req.params.id)
      return res.render('admin/editProductPage', { product: product[0] })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  editProduct: async (req, res) => {
    try {
      const { name, description, price } = req.body
      if (!name || !description || !price) {
        req.flash(
          'error_messages',
          'name, description, price fields are mandatory!'
        )
        return res.redirect(`/admin/products/${req.params.id}/edit`)
      }
      // const product = await Product.findByPk(req.params.id)

      if (req.file) {
        imgur.setClientId(IMGUR_CLIENT_ID)
        const img = await imgur.uploadFile(req.file.path)
        const sqlImage =
          'UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?'
        await query(sqlImage, [
          name,
          description,
          price,
          img.data.link,
          req.params.id,
        ])
        req.flash('success_messages', 'Edit product success.')
        return res.redirect('/admin/products')
      }

      const sqlNoImage =
        'UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?'
      await query(sqlNoImage, [name, description, price, req.params.id])

      req.flash('success_messages', 'Edit product success.')
      return res.redirect('/admin/products')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const sql = 'DELETE FROM products WHERE id = ?'
      await query(sql, req.params.id)
      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  getOrders: async (req, res) => {
    try {
      // const orders = await Order.findAll({
      //   include: [User],
      //   raw: true,
      //   nest: true,
      // })

      const sql =
        'SELECT orders.id, orders.amount, orders.payment_status, orders.shipping_status, orders.UserId, users.email FROM orders LEFT JOIN users ON orders.UserId = users.id'
      const orders = await query(sql)

      return res.render('admin/orders', { orders })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  getOrder: async (req, res) => {
    try {
      const sql =
        'SELECT orders.*, users.email, orderItems.quantity, orderItems.price, orderItems.ProductId, products.name AS productName FROM orders JOIN users ON orders.UserId = users.id JOIN OrderItems ON orders.id = orderItems.OrderId JOIN products ON OrderItems.ProductId = products.id where orders.id = ?'
      const orderSql = await query(sql, req.params.id)
      const order = orderSql[0]
      const items = orderSql.map((order) => ({
        id: order.ProductId,
        product: order.productName,
        quantity: order.quantity,
        price: order.price,
      }))
      // console.log(items)
      // console.log(order)

      return res.render('admin/order', { order, items })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  cancelOrder: async (req, res) => {
    try {
      const sql =
        'UPDATE orders SET shipping_status = ?, payment_status = ? WHERE id = ?'
      await query(sql, [-1, -1, req.params.id])
      // const order = await Order.findByPk(req.params.id)
      // await order.update({
      //   ...req.body,
      //   shipping_status: '-1',
      //   payment_status: '-1',
      // })
      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
}

module.exports = adminController
