const nodemailer = require('nodemailer')
const db = require('../models')
const Order = db.Order
const Cart = db.Cart
const OrderItem = db.OrderItem
const Product = db.Product

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'zjps3407@gmail.com',
    pass: process.env.GMAIL_PASSWORD
  },
});

const orderController = {
  getOrders: async (req, res) => {
    try {
      const orders = await Order.findAll({
        include: 'items'
      })

      const ordersJSON = orders.map(order => order.toJSON())

      return res.render('orders', { orders: ordersJSON, })
    } catch (err) {
      console.log(err)
    }
  },
  postOrder: async (req, res) => {
    try {
      const { cartId, name, address, phone, shipping_status, payment_status, amount } = req.body
      const findCart = Cart.findByPk(cartId, { include: [{ model: Product, as: 'items' }] })
      // Cart{id:..., items: [...]}
      const createOrder = Order.create({
        name,
        address,
        phone,
        shipping_status,
        payment_status,
        amount
      })

      const [cart, order] = await Promise.all([findCart, createOrder])

      const createOrderItems = cart.items.map(product => {
        return OrderItem.create({
          OrderId: order.id,
          ProductId: product.id,
          price: product.price,
          quantity: product.CartItem.quantity
        })
      })

      const mailOptions = {
        from: 'zjps3407@gmail.com',
        to: 'zjps3407+AC@gmail.com',
        subject: `${order.id} 訂單成立`,
        text: `${order.id} 訂單成立`,
      }

      const mailSent = await transporter.sendMail(mailOptions)
      await Promise.all([...createOrderItems, mailSent])

      console.log('Email sent: ' + mailSent.response) // email sent success message

      return res.redirect('/orders')
    } catch (err) {
      console.log(err)
    }

  },
  cancelOrder: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id)
      await order.update({
        ...req.body,
        shipping_status: '-1',
        payment_status: '-1'
      })
      return res.redirect('back')
    } catch (err) {
      console.log(err)
    }

  },
}

module.exports = orderController