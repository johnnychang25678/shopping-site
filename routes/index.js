const express = require('express')
const passport = require('passport')
const multer = require('multer')
const { authenticatedAdmin, authenticatedUser } = require('../middlewares/auth')

const upload = multer({ dest: 'temp/' })
const router = express.Router()

const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const userController = require('../controllers/userController')

const admin = require('./modules/admin')
const orders = require('./modules/orders')

// home page redirect to products
router.get('/', (req, res) => res.redirect('/products'))

// register
router.get('/register', userController.registerPage)
router.post('/register', userController.register)

router.get('/login', userController.loginPage)
router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  userController.login
)
router.get('/logout', userController.logout)

// public routes
router.get('/products', productController.getProducts)
router.get('/products/:id', productController.getProduct)
router.get('/cart', cartController.getCart)
router.post('/cart', cartController.postCart) // add to cart
router.post('/cartItem/:id/add', cartController.addCartItem) // +1 existed product in cart
router.post('/cartItem/:id/sub', cartController.subCartItem) // -1 existed product in cart
router.delete('/cartItem/:id', cartController.deleteCartItem)

// private routes for user
// router.get('/orders', authenticatedUser, orderController.getOrders)
// router.post('/orders', authenticatedUser, orderController.postOrder)
// router.post(
//   '/orders/:id/cancel',
//   authenticatedUser,
//   orderController.cancelOrder
// )
// router.get('/orders/:id/payment', authenticatedUser, orderController.getPayment)
// router.post(
//   '/orders/spgateway/callback',
//   authenticatedUser,
//   orderController.spgatewayCallback
// )

router.use('/admin', authenticatedAdmin, admin)
router.use('/orders', authenticatedUser, orders)
// @todo:
// 1. add a cancellation route for admin (done)
// 2. add admin edit product feature (done)
// 3. complete single order view for admin (done)
// 4. add admin delete product feature (done)
// 5. add pagination for products (done)
// 6. add search function for products (done)
// 7. refactor

module.exports = router
