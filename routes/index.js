const express = require('express')
const passport = require('passport')
const auth = require('../middlewares/auth')

const router = express.Router()

const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const userController = require('../controllers/userController')

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
router.get('/cart', cartController.getCart)
router.post('/cart', cartController.postCart)
router.post('/cartItem/:id/add', cartController.addCartItem)
router.post('/cartItem/:id/sub', cartController.subCartItem)
router.delete('/cartItem/:id', cartController.deleteCartItem)

// private routes
router.get('/orders', auth, orderController.getOrders)
router.post('/order', auth, orderController.postOrder)
router.post('/order/:id/cancel', auth, orderController.cancelOrder)
router.get('/order/:id/payment', auth, orderController.getPayment)
router.post('/spgateway/callback', auth, orderController.spgatewayCallback)

module.exports = router
