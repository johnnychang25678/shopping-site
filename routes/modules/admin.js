const express = require('express')

const router = express.Router()
const multer = require('multer')

const adminController = require('../../controllers/adminController')

const upload = multer({ dest: 'temp/' })

router.get('/', (req, res) => res.redirect('/admin/products'))
// view all products
router.get('/products', adminController.getProducts)
// edit product page & add product page
router.get('/products/:id/edit', adminController.editProductPage)
router.get('/products/add', adminController.addProductPage)

// view single product, the /:id route has to be last to prevent incorrect routing
router.get('/products/:id', adminController.getProduct)

// add & edit & delete product
router.post('/products', upload.single('image'), adminController.addProduct)
router.put('/products/:id', upload.single('image'), adminController.editProduct)
router.delete('/products/:id', adminController.deleteProduct)

// view all orders
router.get('/orders', adminController.getOrders)
// view single order
router.get('/orders/:id', adminController.getOrder)
// cancel order
router.post('/order/:id/cancel', adminController.cancelOrder)

module.exports = router
