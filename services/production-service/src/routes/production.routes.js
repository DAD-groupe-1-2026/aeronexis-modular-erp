const { Router } = require('express')
const { authenticate } = require('../middlewares/authenticate')
const { list, getOne, create, update, updateLot } = require('../controllers/workOrders.controller')
const incidentsCtrl = require('../controllers/incidents.controller')

const router = Router()

router.use(authenticate)

// WorkOrders
router.get('/orders', list)
router.get('/orders/:id', getOne)
router.post('/orders', create)
router.patch('/orders/:id', update)

// Lots
router.patch('/lots/:id', updateLot)

// Incidents
router.get('/incidents', incidentsCtrl.list)
router.post('/incidents', incidentsCtrl.create)
router.patch('/incidents/:id/resolve', incidentsCtrl.resolve)

module.exports = router
