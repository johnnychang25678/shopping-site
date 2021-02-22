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
const adminController = require('../controllers/adminController')

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

// private routes for user
router.get('/orders', authenticatedUser, orderController.getOrders)
router.post('/order', authenticatedUser, orderController.postOrder)
router.post('/order/:id/cancel', authenticatedUser, orderController.cancelOrder)
router.get('/order/:id/payment', authenticatedUser, orderController.getPayment)
router.post(
  '/spgateway/callback',
  authenticatedUser,
  orderController.spgatewayCallback
)

// private routes for admin
router.get('/admin/products', authenticatedAdmin, adminController.getProducts)
router.get(
  '/admin/products/add',
  authenticatedAdmin,
  adminController.addProductPage
)
router.post(
  '/admin/products',
  authenticatedAdmin,
  upload.single('image'),
  adminController.addProduct
)
module.exports = router
