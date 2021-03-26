const express = require('express')
const { authenticatedAdmin, authenticatedUser } = require('../middlewares/auth')

const router = express.Router()

const publicRoute = require('./modules/public')
const adminRoute = require('./modules/admin')
const ordersRoute = require('./modules/orders')

router.use('/', publicRoute)
router.use('/admin', authenticatedAdmin, adminRoute)
router.use('/orders', authenticatedUser, ordersRoute)

module.exports = router
