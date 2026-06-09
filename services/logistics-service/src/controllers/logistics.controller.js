const { StockItem, Reservation, Shipment } = require('../models')

function ok(res, data) {
  return res.json({ status: 'success', data })
}

function fail(res, code, message, status = 500) {
  return res.status(status).json({ status: 'failure', data: null, error: { code, message } })
}

// ===== STOCK ITEMS =====

async function listStock(_req, res) {
  try {
    const items = await StockItem.findAll({
      include: [{ model: Reservation, as: 'reservations' }],
    })
    ok(res, items)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

async function getStockItem(req, res) {
  try {
    const item = await StockItem.findByPk(req.params.id, {
      include: [{ model: Reservation, as: 'reservations' }],
    })
    if (!item) return fail(res, 'NOT_FOUND', 'Stock item not found', 404)
    ok(res, item)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

async function createStockItem(req, res) {
  try {
    const item = await StockItem.create(req.body)
    res.status(201).json({ status: 'success', data: item })
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

async function updateStockItem(req, res) {
  try {
    const item = await StockItem.findByPk(req.params.id)
    if (!item) return fail(res, 'NOT_FOUND', 'Stock item not found', 404)
    await item.update(req.body)
    ok(res, item)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

// ===== RESERVATIONS =====

async function listReservations(_req, res) {
  try {
    const reservations = await Reservation.findAll({
      include: [{ model: StockItem, as: 'stockItem' }],
    })
    ok(res, reservations)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

async function createReservation(req, res) {
  try {
    const reservation = await Reservation.create(req.body)
    res.status(201).json({ status: 'success', data: reservation })
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

async function updateReservation(req, res) {
  try {
    const reservation = await Reservation.findByPk(req.params.id, {
      include: [{ model: StockItem, as: 'stockItem' }]
    })
    if (!reservation) return fail(res, 'NOT_FOUND', 'Reservation not found', 404)
    
    const oldStatus = reservation.status
    await reservation.update(req.body)
    
    // Si la réservation passe de "pending" (ou autre) à "confirmed"
    if (oldStatus !== 'confirmed' && reservation.status === 'confirmed') {
      const stockItem = reservation.stockItem
      if (stockItem) {
        // on réserve officiellement (si ce n'était pas déjà fait) et on peut déduire de l'available
        // Mais dans notre logique ERP, 'pending' ne touchait pas aux qtés. 'confirmed' signifie que c'est réservé
        // Donc on décrémente quantityAvailable et on incrémente quantityReserved
        await stockItem.update({
          quantityAvailable: stockItem.quantityAvailable - reservation.quantity,
          quantityReserved: stockItem.quantityReserved + reservation.quantity
        })
        
        // Publier l'événement pour la production
        const { publishEvent, EVENTS } = require('@aeronexis/event-bus')
        await publishEvent(EVENTS.RESERVATION_UPDATED, 'logistics-service', {
          reservationId: reservation.id,
          workOrderId: reservation.workOrderId,
          materialCode: stockItem.materialCode,
          quantity: reservation.quantity,
          status: reservation.status
        })
      }
    }
    
    // Si la réservation est annulée
    if (oldStatus === 'confirmed' && reservation.status === 'cancelled') {
      const stockItem = reservation.stockItem
      if (stockItem) {
        // On restitue le stock disponible et on réduit le réservé
        await stockItem.update({
          quantityAvailable: stockItem.quantityAvailable + reservation.quantity,
          quantityReserved: stockItem.quantityReserved - reservation.quantity
        })
        
        // Publier l'événement
        const { publishEvent, EVENTS } = require('@aeronexis/event-bus')
        await publishEvent(EVENTS.RESERVATION_UPDATED, 'logistics-service', {
          reservationId: reservation.id,
          workOrderId: reservation.workOrderId,
          materialCode: stockItem.materialCode,
          quantity: reservation.quantity,
          status: reservation.status
        })
      }
    } else if (oldStatus === 'pending' && reservation.status === 'cancelled') {
      // Annulation d'une attente, on ne touche pas au stock
      const stockItem = reservation.stockItem
      if (stockItem) {
        const { publishEvent, EVENTS } = require('@aeronexis/event-bus')
        await publishEvent(EVENTS.RESERVATION_UPDATED, 'logistics-service', {
          reservationId: reservation.id,
          workOrderId: reservation.workOrderId,
          materialCode: stockItem.materialCode,
          quantity: reservation.quantity,
          status: reservation.status
        })
      }
    }
    
    ok(res, reservation)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

// ===== SHIPMENTS =====

async function listShipments(_req, res) {
  try {
    const shipments = await Shipment.findAll()
    ok(res, shipments)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

async function getShipment(req, res) {
  try {
    const shipment = await Shipment.findByPk(req.params.id)
    if (!shipment) return fail(res, 'NOT_FOUND', 'Shipment not found', 404)
    ok(res, shipment)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

async function createShipment(req, res) {
  try {
    const shipment = await Shipment.create(req.body)
    res.status(201).json({ status: 'success', data: shipment })
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

async function updateShipment(req, res) {
  try {
    const shipment = await Shipment.findByPk(req.params.id)
    if (!shipment) return fail(res, 'NOT_FOUND', 'Shipment not found', 404)
    await shipment.update(req.body)
    ok(res, shipment)
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message)
  }
}

module.exports = {
  listStock,
  getStockItem,
  createStockItem,
  updateStockItem,
  listReservations,
  createReservation,
  updateReservation,
  listShipments,
  getShipment,
  createShipment,
  updateShipment,
}
