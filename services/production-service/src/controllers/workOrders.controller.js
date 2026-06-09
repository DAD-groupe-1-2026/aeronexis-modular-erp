const { WorkOrder, Lot, Material, Incident } = require('../models')

function ok(res, data) {
  return res.json({ status: 'success', data })
}

function fail(res, code, message, status = 500) {
  return res.status(status).json({ status: 'failure', data: null, error: { code, message } })
}

// GET /api/production/orders
async function list(_req, res) {
  try {
    const orders = await WorkOrder.findAll({ include: [{ model: Lot, as: 'lots' }] })
    ok(res, orders)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

// GET /api/production/orders/:id
async function getOne(req, res) {
  try {
    const order = await WorkOrder.findByPk(req.params.id, {
      include: [
        {
          model: Lot,
          as: 'lots',
          include: [
            { model: Material, as: 'materials' },
            { model: Incident, as: 'incidents' },
          ],
        },
      ],
    })
    if (!order) return fail(res, 'NOT_FOUND', 'Ordre introuvable', 404)
    ok(res, order)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

// POST /api/production/orders
async function create(req, res) {
  try {
    const order = await WorkOrder.create(req.body)
    res.status(201).json({ status: 'success', data: order })
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

// PATCH /api/production/orders/:id
async function update(req, res) {
  try {
    const order = await WorkOrder.findByPk(req.params.id)
    if (!order) return fail(res, 'NOT_FOUND', 'Ordre introuvable', 404)
    await order.update(req.body)
    ok(res, order)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

// PATCH /api/production/lots/:id
async function updateLot(req, res) {
  try {
    const lot = await Lot.findByPk(req.params.id)
    if (!lot) return fail(res, 'NOT_FOUND', 'Lot introuvable', 404)
    
    // On met à jour uniquement le status et completionPercent
    const { status, completionPercent } = req.body
    const updateData = {}
    if (status !== undefined) updateData.status = status
    if (completionPercent !== undefined) updateData.completionPercent = completionPercent

    await lot.update(updateData)
    ok(res, lot)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

// POST /api/production/lots/:id/request-materials
async function requestMaterials(req, res) {
  try {
    const lot = await Lot.findByPk(req.params.id, {
      include: [
        { model: Material, as: 'materials' },
        { model: WorkOrder, as: 'workOrder' }
      ]
    })
    
    if (!lot) return fail(res, 'NOT_FOUND', 'Lot introuvable', 404)
    
    // Pour chaque matière du lot, on publie l'événement de demande
    const { publishEvent, EVENTS } = require('@aeronexis/event-bus')
    
    for (const mat of lot.materials) {
      if (mat.available < mat.quantity) {
        await publishEvent(EVENTS.MATERIAL_REQUESTED, 'production-service', {
          lotId: lot.id,
          workOrderId: lot.workOrderId,
          materialCode: mat.reference,
          quantity: mat.quantity - mat.available,
          requestedBy: req.user ? (req.user.firstName ? `${req.user.firstName} ${req.user.lastName}` : req.user.email) : 'system',
          siteName: req.user ? req.user.siteName : 'Site Inconnu'
        })
      }
    }
    
    ok(res, { message: 'Demande envoyée à la logistique' })
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

module.exports = { list, getOne, create, update, updateLot, requestMaterials }
