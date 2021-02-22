const imgur = require('imgur')
const db = require('../models')

const { IMGUR_CLIENT_ID } = process.env.IMGUR_CLIENT_ID

const { Product } = db
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

    return res.redirect('/admin/products')
  },
  getProduct: async (req, res) => {
    const product = await Product.findByPk(req.params.id)
    return res.render('admin/product', { product: product.toJSON() })
  },
}

module.exports = adminController
