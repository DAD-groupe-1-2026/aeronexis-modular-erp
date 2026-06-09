const { consumeEvents, EVENTS } = require('@aeronexis/event-bus')
const { Lot, Material } = require('../models')

async function setupConsumers() {
  await consumeEvents(
    'production_queue',
    [EVENTS.RESERVATION_UPDATED],
    async (routingKey, payload) => {
      try {
        if (routingKey === EVENTS.RESERVATION_UPDATED) {
          console.log('[PRODUCTION CONSUMER] Received RESERVATION_UPDATED:', payload)
          
          if (payload.status === 'fulfilled') {
            // Find all lots for this workOrderId
            const lots = await Lot.findAll({
              where: { workOrderId: payload.workOrderId },
              include: [{ model: Material, as: 'materials' }]
            })
            
            // Increment the material availability
            for (const lot of lots) {
              for (const mat of lot.materials) {
                if (mat.reference === payload.materialCode) {
                  // For simplicity, we add the fulfilled quantity to the first matching material
                  // or spread it if there are multiple. Here we just add it to the first one found.
                  await mat.update({
                    available: mat.available + payload.quantity
                  })
                  console.log(`[PRODUCTION CONSUMER] Material ${mat.reference} availability increased by ${payload.quantity}`)
                  return // Stop after first match for simplicity
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('[PRODUCTION CONSUMER] Error processing event:', err)
      }
    }
  )
}

module.exports = { setupConsumers }
