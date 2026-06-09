const { Router } = require('express')
const { authenticate } = require('../middlewares/authenticate')
const { list, getOne, create, update, updateLot, requestMaterials } = require('../controllers/workOrders.controller')
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
router.post('/lots/:id/request-materials', requestMaterials)

// Incidents
router.get('/incidents', incidentsCtrl.list)
router.get('/incidents/:id', incidentsCtrl.getOne)
router.post('/incidents', incidentsCtrl.create)
router.patch('/incidents/:id/resolve', incidentsCtrl.resolve)

module.exports = router
