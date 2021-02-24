const express = require('express')
const passport = require('passport')

const router = express.Router()

const productController = require('../../controllers/productController')
const cartController = require('../../controllers/cartController')
const userController = require('../../controllers/userController')

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

module.exports = router
