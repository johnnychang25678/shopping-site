/* eslint-disable camelcase */
/* eslint-disable no-console */
const nodemailer = require('nodemailer')

const query = require('../db')

const getTradeInfo = require('../utils/tradeInfo')
const { create_mpg_aes_decrypt } = require('../utils/encryptDecrypt')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
})

const orderController = {
  getOrders: async (req, res) => {
    try {
      const orderDataSql = 'SELECT * FROM orders WHERE UserId = ?'
      const orderDataSqlResult = await query(orderDataSql, [req.user.id])

      const orderItemsSql =
        'SELECT orderItems.OrderId, orderItems.quantity, orderItems.ProductId, products.price, products.name AS productName FROM orders JOIN orderItems ON orders.id = orderItems.OrderId JOIN products ON orderItems.ProductId = products.id WHERE orders.UserId = ?'
      const orderItemsSqlResult = await query(orderItemsSql, [req.user.id])

      const orders = orderDataSqlResult.map((order, i) => ({
        ...orderDataSqlResult[i],
        items: orderItemsSqlResult.filter(
          (item) => item.OrderId === orderDataSqlResult[i].id
        ),
      }))

      return res.render('orders', {
        orders,
      })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  postOrder: async (req, res) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const { userId, email, cartId, name, address, phone, amount } = req.body

      const cartItemsSql =
        'SELECT * FROM cartItems JOIN products ON cartItems.ProductId = products.id WHERE cartItems.CartId = ?'
      const cartItemsPromise = query(cartItemsSql, [cartId])

      // create order
      const createOrderSql =
        'INSERT INTO orders(UserId, name, address, phone, shipping_status, payment_status, amount) VALUES(?, ?, ?, ?, ?, ?, ?)'

      const orderPromise = query(createOrderSql, [
        userId,
        name,
        address,
        phone,
        0,
        0,
        amount,
      ])

      const [cartItems, order] = await Promise.all([
        cartItemsPromise,
        orderPromise,
      ])

      // craete orderItem
      const createOrderItems = cartItems.map((item) => {
        const createOrderItemSql =
          'INSERT INTO orderItems(OrderId, ProductId, quantity) VALUES(?, ?, ?)'
        return query(createOrderItemSql, [
          order.insertId,
          item.ProductId,
          item.quantity,
        ])
      })

      const mailOptions = {
        from: process.env.MY_EMAIL,
        to: process.env.EMAIL_TO, // use customer email in real project
        subject: `Order id: ${order.insertId} is created`,
        text: `Order id: ${order.insertId} is created. You can now go to website and proceed with payment.`,
      }
      const mailSent = transporter.sendMail(mailOptions)

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
      const sql =
        'UPDATE orders SET shipping_status = -1, payment_status = -1 WHERE orders.id = ?'
      await query(sql, [req.params.id])
      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  getPayment: async (req, res) => {
    try {
      const orderSql =
        'SELECT orders.id, orders.amount FROM orders WHERE id = ?'
      const order = await query(orderSql, req.params.id)

      const tradeInfo = getTradeInfo(
        order[0].amount,
        '產品名稱',
        process.env.MY_EMAIL
      )

      const updateOrderSql = 'UPDATE orders SET sn = ? WHERE id = ?'
      await query(updateOrderSql, [tradeInfo.MerchantOrderNo, req.params.id])

      return res.render('payment', {
        order: order[0],
        tradeInfo,
      })
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  spgatewayCallback: async (req, res) => {
    try {
      // 解密藍新付款成功的notificaiton
      const data = JSON.parse(create_mpg_aes_decrypt(req.body.TradeInfo))
      const orderSql = 'UPDATE orders SET payment_status = 1 WHERE sn = ?'
      await query(orderSql, data.Result.MerchantOrderNo)

      return res.redirect('/orders')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
}

module.exports = orderController
