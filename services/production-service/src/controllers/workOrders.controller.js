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

module.exports = { list, getOne, create, update }
