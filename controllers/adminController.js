const imgur = require('imgur')
const db = require('../models')

const { IMGUR_CLIENT_ID } = process.env.IMGUR_CLIENT_ID

const { Product, Order, User } = db
// const PAGE_LIMIT = 3
// const PAGE_OFFSET = 0

const adminController = {
  getProducts: async (req, res) => {
    const products = await Product.findAll({
      raw: true,
      nest: true,
      order: [['id', 'DESC']],
    })

    return res.render('admin/products', { products })
  },
  addProductPage: (req, res) => res.render('admin/addProductPage'),
  addProduct: async (req, res) => {
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
  },
  getProduct: async (req, res) => {
    const product = await Product.findByPk(req.params.id)
    return res.render('admin/product', { product: product.toJSON() })
  },
  editProductPage: async (req, res) => {
    const product = await Product.findByPk(req.params.id)
    return res.render('admin/editProductPage', { product: product.toJSON() })
  },
  editProduct: async (req, res) => {
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
  },
  deleteProduct: async (req, res) => {
    const product = await Product.findByPk(req.params.id)
    await product.destroy()
    return res.redirect('back')
  },
  getOrders: async (req, res) => {
    const orders = await Order.findAll({
      include: [User],
      raw: true,
      nest: true,
    })
    // console.log(orders)
    return res.render('admin/orders', { orders })
  },
  getOrder: async (req, res) => {
    const order = await Order.findByPk(req.params.id, {
      include: [User, { model: Product, as: 'items' }],
    })
    console.log(order.toJSON())
    return res.render('admin/order', { order: order.toJSON() })
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
