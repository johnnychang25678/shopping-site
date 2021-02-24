/* eslint-disable no-console */
const imgur = require('imgur')
const db = require('../models')

const { IMGUR_CLIENT_ID } = process.env.IMGUR_CLIENT_ID
const { Product, Order, User } = db

const adminController = {
  getProducts: async (req, res) => {
    try {
      const products = await Product.findAll({
        raw: true,
        nest: true,
        order: [['id', 'DESC']],
      })

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
      await Product.create({
        name,
        description,
        price,
        image: img.data.link,
      })
      req.flash('success_messages', 'Add product success.')
      return res.redirect('/admin/products')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  getProduct: async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id)
      return res.render('admin/product', { product: product.toJSON() })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  editProductPage: async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id)
      return res.render('admin/editProductPage', { product: product.toJSON() })
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
      const product = await Product.findByPk(req.params.id)
      if (req.file) {
        imgur.setClientId(IMGUR_CLIENT_ID)
        const img = await imgur.uploadFile(req.file.path)
        await product.update({
          name,
          description,
          price,
          image: img.data.link,
        })
        req.flash('success_messages', 'Edit product success.')
        return res.redirect('/admin/products')
      }
      await product.update({
        name,
        description,
        price,
      })
      req.flash('success_messages', 'Edit product success.')
      return res.redirect('/admin/products')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id)
      await product.destroy()
      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  getOrders: async (req, res) => {
    try {
      const orders = await Order.findAll({
        include: [User],
        raw: true,
        nest: true,
      })

      return res.render('admin/orders', { orders })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  getOrder: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [User, { model: Product, as: 'items' }],
      })

      return res.render('admin/order', { order: order.toJSON() })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  cancelOrder: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id)
      await order.update({
        ...req.body,
        shipping_status: '-1',
        payment_status: '-1',
      })
      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
}

module.exports = adminController
