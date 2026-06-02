const { Incident } = require('../models')

function ok(res, data) {
  return res.json({ status: 'success', data })
}

function fail(res, code, message, status = 500) {
  return res.status(status).json({ status: 'failure', data: null, error: { code, message } })
}

// GET /api/production/incidents
async function list(_req, res) {
  try {
    const incidents = await Incident.findAll({ order: [['reportedAt', 'DESC']] })
    ok(res, incidents)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

// GET /api/production/incidents/:id
async function getOne(req, res) {
  try {
    const incident = await Incident.findByPk(req.params.id)
    if (!incident) return fail(res, 'NOT_FOUND', 'Incident introuvable', 404)
    ok(res, incident)
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
