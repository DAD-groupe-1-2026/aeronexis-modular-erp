const { Router } = require('express')
const { authenticate } = require('../middlewares/authenticate')
const ctrl = require('../controllers/logistics.controller')

const router = Router()

router.use(authenticate)

// Stock Items
router.get('/stock', ctrl.listStock)
router.get('/stock/:id', ctrl.getStockItem)
router.post('/stock', ctrl.createStockItem)
router.patch('/stock/:id', ctrl.updateStockItem)

// Reservations
router.get('/reservations', ctrl.listReservations)
router.post('/reservations', ctrl.createReservation)
router.patch('/reservations/:id', ctrl.updateReservation)
router.post('/reservations/:id/message', ctrl.sendReservationMessage)

// Shipments
router.get('/shipments', ctrl.listShipments)
router.get('/shipments/:id', ctrl.getShipment)
router.post('/shipments', ctrl.createShipment)
router.patch('/shipments/:id', ctrl.updateShipment)

module.exports = router
