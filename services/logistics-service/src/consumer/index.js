const { consumeEvents, EVENTS } = require('@aeronexis/event-bus')
const { Reservation, StockItem } = require('../models')

async function setupConsumers() {
  await consumeEvents(
    'logistics_queue',
    [EVENTS.MATERIAL_REQUESTED, EVENTS.LOT_COMPLETED],
    async (routingKey, payload) => {
      try {
        if (routingKey === EVENTS.MATERIAL_REQUESTED) {
          console.log('[LOGISTICS CONSUMER] Received MATERIAL_REQUESTED:', payload)
          
          // Trouver l'item de stock correspondant
          let stockItem = await StockItem.findOne({ where: { materialCode: payload.data.materialCode } })
          if (!stockItem) {
            console.warn(`[LOGISTICS CONSUMER] StockItem not found for code ${payload.data.materialCode}. Auto-creating it.`)
            stockItem = await StockItem.create({
              materialCode: payload.data.materialCode,
              materialName: payload.data.materialCode,
              category: 'component',
              quantityAvailable: 1000, // On met un stock fictif pour les tests
              quantityReserved: 0,
              unit: 'pcs',
              reorderLevel: 10,
              location: 'Entrepôt Auto - Zone X',
              supplier: 'Auto-created',
            })
          }
          
          // Créer une réservation "pending"
          await Reservation.create({
            stockItemId: stockItem.id,
            workOrderId: payload.data.workOrderId,
            quantity: payload.data.quantity,
            status: 'pending',
            reservedBy: payload.data.requestedBy || 'production-system',
          })
          
          console.log(`[LOGISTICS CONSUMER] Reservation created for ${payload.data.materialCode}`)
        }
        else if (routingKey === EVENTS.LOT_COMPLETED) {
          console.log('[LOGISTICS CONSUMER] Received LOT_COMPLETED:', payload)
          
          // 1. Détruire la matière première réservée
          if (payload.data.consumedMaterials && payload.data.consumedMaterials.length > 0) {
            for (const mat of payload.data.consumedMaterials) {
              const stockItem = await StockItem.findOne({ where: { materialCode: mat.materialCode } })
              if (stockItem) {
                // Déduire uniquement du stock réservé (l'available a déjà été déduit à la réservation)
                await stockItem.update({
                  quantityReserved: stockItem.quantityReserved - mat.quantity
                })
                
                // Mettre à jour la réservation
                const res = await Reservation.findOne({
                  where: { stockItemId: stockItem.id, workOrderId: payload.data.workOrderId }
                })
                if (res) {
                  await res.update({ status: 'fulfilled' })
                }
              }
            }
          }
          
          // 2. Ajouter le produit fini en stock
          let productItem = await StockItem.findOne({ where: { materialName: payload.data.product } })
          if (!productItem) {
            productItem = await StockItem.create({
              materialCode: `PF-${payload.data.reference}`,
              materialName: payload.data.product,
              category: 'component',
              quantityAvailable: payload.data.quantity,
              quantityReserved: 0,
              unit: 'pcs',
              reorderLevel: 0,
              location: 'Entrepôt PF - Zone 1',
              supplier: 'Interne',
            })
          } else {
            await productItem.update({
              quantityAvailable: productItem.quantityAvailable + payload.data.quantity
            })
          }
          console.log(`[LOGISTICS CONSUMER] Finished product ${payload.data.product} added to stock.`)
        }
      } catch (err) {
        console.error('[LOGISTICS CONSUMER] Error processing event:', err)
      }
    }
  )
}

module.exports = { setupConsumers }
