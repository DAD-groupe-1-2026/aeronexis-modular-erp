const { Client, SalesOrder, OrderItem } = require('../models')

function ok(res, data) {
  return res.json({ status: 'success', data })
}

function fail(res, code, message, status = 500) {
  return res.status(status).json({ status: 'failure', data: null, error: { code, message } })
}

// ===== CLIENTS =====

async function listClients(_req, res) {
  try {
    const clients = await Client.findAll({
      include: [{ model: SalesOrder, as: 'orders' }],
    })
    ok(res, clients)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

async function getClient(req, res) {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [{ model: SalesOrder, as: 'orders' }],
    })
    if (!client) return fail(res, 'NOT_FOUND', 'Client not found', 404)
    ok(res, client)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

async function createClient(req, res) {
  try {
    const client = await Client.create(req.body)
    res.status(201).json({ status: 'success', data: client })
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

async function updateClient(req, res) {
  try {
    const client = await Client.findByPk(req.params.id)
    if (!client) return fail(res, 'NOT_FOUND', 'Client not found', 404)
    await client.update(req.body)
    ok(res, client)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

// ===== SALES ORDERS =====

async function listOrders(_req, res) {
  try {
    const orders = await SalesOrder.findAll({
      include: [
        { model: Client, as: 'client' },
        { model: OrderItem, as: 'items' },
      ],
    })
    ok(res, orders)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

async function getOrder(req, res) {
  try {
    const order = await SalesOrder.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: OrderItem, as: 'items' },
      ],
    })
    if (!order) return fail(res, 'NOT_FOUND', 'Order not found', 404)
    ok(res, order)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

async function createOrder(req, res) {
  try {
    const order = await SalesOrder.create(req.body)
    res.status(201).json({ status: 'success', data: order })
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

async function updateOrder(req, res) {
  try {
    const order = await SalesOrder.findByPk(req.params.id)
    if (!order) return fail(res, 'NOT_FOUND', 'Order not found', 404)
    await order.update(req.body)
    ok(res, order)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

// ===== STATISTICS =====

async function getStatistics(_req, res) {
  try {
    const totalClients = await Client.count()
    const activeClients = await Client.count({ where: { status: 'active' } })
    const totalOrders = await SalesOrder.count()
    const pendingOrders = await SalesOrder.count({ where: { status: 'pending' } })
    const confirmedOrders = await SalesOrder.count({ where: { status: 'confirmed' } })
    const deliveredOrders = await SalesOrder.count({ where: { status: 'delivered' } })
    
    const totalRevenue = await SalesOrder.sum('totalAmount')

    ok(res, {
      clients: {
        total: totalClients,
        active: activeClients,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        delivered: deliveredOrders,
      },
      revenue: {
        total: totalRevenue || 0,
        currency: 'EUR',
      },
    })
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

module.exports = {
  listClients,
  getClient,
  createClient,
  updateClient,
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  getStatistics,
}
