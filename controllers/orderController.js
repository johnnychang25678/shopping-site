const db = require('../models')
const Order = db.Order
const Cart = db.Cart
const OrderItem = db.OrderItem
const Product = db.Product

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

      await Promise.all(createOrderItems)

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