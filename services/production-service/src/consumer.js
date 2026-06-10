const { consumeEvents, EVENTS } = require('@aeronexis/event-bus')
const { WorkOrder } = require('./models')

async function setupConsumers() {
  console.log('[PRODUCTION] Setting up RabbitMQ consumers...')

  await consumeEvents('production_sales_queue', [EVENTS.ORDER_CREATED], async (key, msg) => {
    if (key === EVENTS.ORDER_CREATED) {
      console.log(`[PRODUCTION] Received ${EVENTS.ORDER_CREATED} for order ${msg.data.orderNumber}`)
      try {
        const workOrder = await WorkOrder.create({
          reference: `WO-${msg.data.orderNumber}`,
          clientName: msg.data.clientName || 'Client Inconnu',
          dueDate: msg.data.deliveryDate || new Date(),
          priority: 'normal',
          status: 'planned'
        })
        console.log(`[PRODUCTION] Created WorkOrder ${workOrder.reference} for SalesOrder ${msg.data.orderNumber}`)
      } catch (err) {
        console.error(`[PRODUCTION] Failed to create WorkOrder for SalesOrder ${msg.data.orderNumber}:`, err)
      }
    }
  })
}

module.exports = { setupConsumers }
