const express = require('express')
const { authenticatedAdmin, authenticatedUser } = require('../middlewares/auth')

const router = express.Router()

const publicRoute = require('./modules/public')
const adminRoute = require('./modules/admin')
const ordersRoute = require('./modules/orders')

router.use('/', publicRoute)
router.use('/admin', authenticatedAdmin, adminRoute)
router.use('/orders', authenticatedUser, ordersRoute)

// @todo:
// 1. add a cancellation route for admin (done)
// 2. add admin edit product feature (done)
// 3. complete single order view for admin (done)
// 4. add admin delete product feature (done)
// 5. add pagination for products (done)
// 6. add search function for products (done)
// 7. refactor (done)

module.exports = router
