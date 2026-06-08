const { Incident, Lot } = require('../models')

function ok(res, data) {
  return res.json({ status: 'success', data })
}

function fail(res, code, message, status = 500) {
  return res.status(status).json({ status: 'failure', data: null, error: { code, message } })
}

function withLotReference(incident) {
  if (!incident) return incident
  const plain = incident.toJSON ? incident.toJSON() : incident
  return {
    ...plain,
    lotReference: plain.lotReference ?? plain.lot?.reference ?? null,
  }
}

// GET /api/production/incidents
async function list(_req, res) {
  try {
    const incidents = await Incident.findAll({
      include: [{ model: Lot, as: 'lot', attributes: ['id', 'reference'] }],
      order: [['reportedAt', 'DESC']],
    })
    ok(res, incidents.map(withLotReference))
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

// GET /api/production/incidents/:id
async function getOne(req, res) {
  try {
    const incident = await Incident.findByPk(req.params.id, {
      include: [{ model: Lot, as: 'lot', attributes: ['id', 'reference'] }],
    })
    if (!incident) return fail(res, 'NOT_FOUND', 'Incident introuvable', 404)
    ok(res, withLotReference(incident))
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

// POST /api/production/incidents
async function create(req, res) {
  try {
    const incident = await Incident.create({
      ...req.body,
      reportedBy: req.user?.userId || 'unknown',
    })
    res.status(201).json({ status: 'success', data: incident })
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

// PATCH /api/production/incidents/:id/resolve
async function resolve(req, res) {
  try {
    const incident = await Incident.findByPk(req.params.id)
    if (!incident) return fail(res, 'NOT_FOUND', 'Incident introuvable', 404)
    await incident.update({ resolved: true })
    ok(res, incident)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

module.exports = { list, getOne, create, resolve }
