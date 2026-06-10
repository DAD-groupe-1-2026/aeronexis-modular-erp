const { consumeEvents, EVENTS } = require('@aeronexis/event-bus')
const { WorkOrder, Lot, Material, ProductBOM } = require('./models')

async function setupConsumers() {
  console.log('[PRODUCTION] Setting up RabbitMQ consumers...')

  await consumeEvents('production_sales_queue', [EVENTS.ORDER_CREATED], async (key, msg) => {
    if (key === EVENTS.ORDER_CREATED) {
      console.log(`[PRODUCTION] Received ${EVENTS.ORDER_CREATED} for order ${msg.data.orderNumber}`)
      try {
        if (msg.data.items && Array.isArray(msg.data.items)) {
          const workOrder = await WorkOrder.create({
            reference: `WO-${msg.data.orderNumber}`,
            clientName: msg.data.clientName || 'Client Inconnu',
            dueDate: msg.data.deliveryDate || new Date(),
            priority: 'normal',
            status: 'planned'
          })
          console.log(`[PRODUCTION] Created WorkOrder ${workOrder.reference} for SalesOrder ${msg.data.orderNumber}`)

          let i = 1;
          for (const item of msg.data.items) {
            // Create a Lot for this item
            const lot = await Lot.create({
              reference: `LOT-${workOrder.reference}-${item.productCode}-${i}`,
              product: item.productCode,
              quantity: item.quantity,
              status: 'planned',
              startDate: new Date(),
              dueDate: workOrder.dueDate,
              machine: 'Ligne Principale',
              workOrderId: workOrder.id
            });

            console.log(`[PRODUCTION] Created Lot ${lot.reference} for WorkOrder ${workOrder.reference}`);

            // Find BOM for this product
            const boms = await ProductBOM.findAll({ where: { productCode: item.productCode } });
            
            if (boms && boms.length > 0) {
              const materialsToCreate = boms.map(bom => ({
                name: bom.materialName,
                reference: bom.materialReference,
                quantity: bom.quantityRequiredPerUnit * item.quantity,
                unit: bom.unit,
                available: 0, // Need to be provisioned
                lotId: lot.id,
                workOrderId: workOrder.id
              }));
              
              await Material.bulkCreate(materialsToCreate);
              console.log(`[PRODUCTION] Created ${materialsToCreate.length} materials for Lot ${lot.reference}`);
            } else {
              console.log(`[PRODUCTION] No BOM found for product ${item.productCode}`);
            }
            
            i++;
          }
        }
      } catch (err) {
        console.error(`[PRODUCTION] Failed to process ORDER_CREATED for ${msg.data.orderNumber}:`, err)
      }
    }
  })
}

module.exports = { setupConsumers }
