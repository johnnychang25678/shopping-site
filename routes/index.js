const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController');
const userController = require('../controllers/userController');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// register
router.get('/register', userController.registerPage) 
router.post('/register', userController.register)

router.get('/login', userController.login)



router.get('/products', productController.getProducts)
router.get('/cart', cartController.getCart)
router.post('/cart', cartController.postCart)
router.post('/cartItem/:id/add', cartController.addCartItem)
router.post('/cartItem/:id/sub', cartController.subCartItem)
router.delete('/cartItem/:id', cartController.deleteCartItem)
router.get('/orders', orderController.getOrders)
router.post('/order', orderController.postOrder)
router.post('/order/:id/cancel', orderController.cancelOrder)

router.get('/order/:id/payment', orderController.getPayment)
router.post('/spgateway/callback', orderController.spgatewayCallback)

module.exports = router;
