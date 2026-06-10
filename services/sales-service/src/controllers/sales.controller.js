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

async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return fail(res, 'BAD_REQUEST', 'Invalid status', 400)
    }
    const order = await SalesOrder.findByPk(req.params.id)
    if (!order) return fail(res, 'NOT_FOUND', 'Order not found', 404)
    
    await order.update({ status })
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
    
    const { Op } = require('sequelize')
    
    const totalRevenue = await SalesOrder.sum('totalAmount', {
      where: {
        status: { [Op.ne]: 'cancelled' }
      }
    })

    const allOrders = await SalesOrder.findAll({
      attributes: ['totalAmount', 'orderDate'],
      where: {
        status: { [Op.ne]: 'cancelled' }
      }
    })

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
    const currentMonth = new Date().getMonth()
    const revenueByMonth = []
    
    for (let i = 5; i >= 0; i--) {
      let d = new Date()
      d.setMonth(currentMonth - i)
      const monthIdx = d.getMonth()
      const year = d.getFullYear()
      
      const monthOrders = allOrders.filter(o => {
        const orderDate = new Date(o.orderDate)
        return orderDate.getMonth() === monthIdx && orderDate.getFullYear() === year
      })
      
      const revenue = monthOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
      revenueByMonth.push({
        month: monthNames[monthIdx],
        revenue
      })
    }

    const recentOrders = await SalesOrder.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        { model: Client, as: 'client', attributes: ['clientCode', 'companyName', 'contactName', 'email'] }
      ]
    })

    ok(res, {
      totalOrders,
      totalRevenue: totalRevenue || 0,
      activeClients,
      pendingOrders,
      revenueByMonth,
      recentOrders,
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
  updateOrderStatus,
  getStatistics,
}
