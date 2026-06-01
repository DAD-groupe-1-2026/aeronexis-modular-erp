const { Router } = require('express')
const { authenticate } = require('../middlewares/authenticate')
const ctrl = require('../controllers/sales.controller')

const router = Router()

router.use(authenticate)

// Clients
router.get('/clients', ctrl.listClients)
router.get('/clients/:id', ctrl.getClient)
router.post('/clients', ctrl.createClient)
router.patch('/clients/:id', ctrl.updateClient)

// Sales Orders
router.get('/orders', ctrl.listOrders)
router.get('/orders/:id', ctrl.getOrder)
router.post('/orders', ctrl.createOrder)
router.patch('/orders/:id', ctrl.updateOrder)

// Statistics
router.get('/statistics', ctrl.getStatistics)

module.exports = router
