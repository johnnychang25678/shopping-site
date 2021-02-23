/* eslint-disable no-console */
const nodemailer = require('nodemailer')
const db = require('../models')

const { Order, Cart, OrderItem, Product, User } = db

const getTradeInfo = require('../utils/tradeInfo')
const { create_mpg_aes_decrypt } = require('../utils/encryptDecrypt')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'zjps3407@gmail.com',
    pass: process.env.GMAIL_PASSWORD,
  },
})

const orderController = {
  getOrders: async (req, res) => {
    try {
      let orders
      if (req.user.isAdmin) {
        orders = await Order.findAll({
          include: [{ model: Product, as: 'items' }],
        })
      } else {
        orders = await Order.findAll({
          include: [{ model: Product, as: 'items' }],
          where: { UserId: req.user.id },
        })
      }
      const ordersJSON = orders.map((order) => order.toJSON())

      return res.render('orders', {
        orders: ordersJSON,
      })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  postOrder: async (req, res) => {
    try {
      const { userId, email, cartId, name, address, phone, amount } = req.body
      const findCart = Cart.findByPk(cartId, {
        include: [{ model: Product, as: 'items' }],
      })
      // Cart{id:..., items: [...]}
      const createOrder = Order.create({
        UserId: userId,
        name,
        address,
        phone,
        shipping_status: 0,
        payment_status: 0,
        amount,
      })

      const [cart, order] = await Promise.all([findCart, createOrder])

      const createOrderItems = cart.items.map((product) =>
        OrderItem.create({
          OrderId: order.id,
          ProductId: product.id,
          price: product.price,
          quantity: product.CartItem.quantity,
        })
      )

      const mailOptions = {
        from: 'zjps3407@gmail.com',
        to: 'zjps3407+TestShoppingCart@gmail.com', // use email in real project
        subject: `Order id: ${order.id} is created`,
        text: `Order id: ${order.id} is created. You can now go to website and proceed with payment.`,
      }

      const mailSent = await transporter.sendMail(mailOptions)
      await Promise.all([...createOrderItems, mailSent])

      console.log(`Email sent: ${mailSent.response}`) // email sent success message

      return res.redirect('/orders')
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
  getPayment: async (req, res) => {
    try {
      console.log('===== getPayment =====')
      console.log(req.params.id)
      console.log('==========')

      const order = await Order.findByPk(req.params.id)
      const tradeInfo = getTradeInfo(
        order.amount,
        '產品名稱',
        'zjps3407@gmail.com'
      )

      console.log('========= req.body ===========')
      console.log(req.body)

      console.log('========= tradeInfo ===========')
      console.log(tradeInfo)

      const snUpdatedOrder = await order.update({
        ...req.body,
        sn: tradeInfo.MerchantOrderNo,
      })

      return res.render('payment', {
        order: snUpdatedOrder.toJSON(),
        tradeInfo,
      })
    } catch (err) {
      console.log(err)
    }
  },
  spgatewayCallback: async (req, res) => {
    console.log('===== spgatewayCallback =====')
    console.log(req.method)
    console.log(req.query)
    console.log(req.body)
    console.log('==========')

    console.log('===== spgatewayCallback: TradeInfo =====')
    console.log(req.body.TradeInfo)

    // 解密藍新付款成功的notificaiton
    const data = JSON.parse(create_mpg_aes_decrypt(req.body.TradeInfo))

    console.log('===== spgatewayCallback: create_mpg_aes_decrypt、data =====')
    console.log(data)

    const orders = await Order.findAll({
      where: { sn: data.Result.MerchantOrderNo },
    })

    await orders[0].update({
      ...req.body,
      payment_status: 1,
    })

    return res.redirect('/orders')
  },
}

module.exports = orderController
