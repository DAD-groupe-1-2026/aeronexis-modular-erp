require('dotenv').config()
const sequelize = require('./sequelize')
const { StockItem, Reservation, Shipment } = require('../models')

async function seed() {
  try {
    await sequelize.authenticate()
    console.log('Database connected for seeding.')

    // Stock Items
    await StockItem.bulkCreate([
      {
        materialCode: 'ALU-6061-T6',
        materialName: 'Aluminium 6061-T6',
        category: 'raw_material',
        quantityAvailable: 5000,
        quantityReserved: 1200,
        unit: 'kg',
        reorderLevel: 1000,
        location: 'Entrepôt A - Zone 1',
        supplier: 'AluminiumCorp SA',
      },
      {
        materialCode: 'STEEL-304',
        materialName: 'Acier inoxydable 304',
        category: 'raw_material',
        quantityAvailable: 3500,
        quantityReserved: 800,
        unit: 'kg',
        reorderLevel: 500,
        location: 'Entrepôt A - Zone 2',
        supplier: 'SteelTech Europe',
      },
      {
        materialCode: 'PAINT-BLACK',
        materialName: 'Peinture époxy noire',
        category: 'consumable',
        quantityAvailable: 250,
        quantityReserved: 45,
        unit: 'L',
        reorderLevel: 50,
        location: 'Entrepôt B - Zone 3',
        supplier: 'ColorMaster Ltd',
      },
      {
        materialCode: 'BOX-CARD-L',
        materialName: 'Carton d\'emballage grand format',
        category: 'packaging',
        quantityAvailable: 1500,
        quantityReserved: 300,
        unit: 'unités',
        reorderLevel: 200,
        location: 'Entrepôt C - Zone 1',
        supplier: 'PackWorld Inc',
      },
    ])
    console.log('Stock items seeded.')

    // Reservations
    await Reservation.bulkCreate([
      {
        stockItemId: (await StockItem.findOne({ where: { materialCode: 'ALU-6061-T6' } })).id,
        workOrderId: 'WO-2026-001',
        quantity: 500,
        status: 'confirmed',
        reservedBy: 'operator@aeronexis.com',
      },
      {
        stockItemId: (await StockItem.findOne({ where: { materialCode: 'STEEL-304' } })).id,
        workOrderId: 'WO-2026-002',
        quantity: 300,
        status: 'pending',
        reservedBy: 'operator@aeronexis.com',
      },
      {
        stockItemId: (await StockItem.findOne({ where: { materialCode: 'PAINT-BLACK' } })).id,
        workOrderId: 'WO-2026-001',
        quantity: 25,
        status: 'fulfilled',
        reservedBy: 'admin@aeronexis.com',
      },
    ])
    console.log('Reservations seeded.')

    // Shipments
    await Shipment.bulkCreate([
      {
        trackingNumber: 'TRK-FR-20260601-001',
        orderId: 'SO-2026-1001',
        destination: '123 Rue de la Paix, 75002 Paris, France',
        carrier: 'Chronopost',
        status: 'shipped',
        scheduledDate: new Date('2026-06-03'),
        deliveredDate: null,
        weight: 250.5,
        notes: 'Livraison express - client prioritaire',
      },
      {
        trackingNumber: 'TRK-FR-20260601-002',
        orderId: 'SO-2026-1002',
        destination: '45 Avenue des Champs-Élysées, 75008 Paris, France',
        carrier: 'DHL Express',
        status: 'in_transit',
        scheduledDate: new Date('2026-06-04'),
        deliveredDate: null,
        weight: 180.2,
        notes: 'Fragile - manipuler avec précaution',
      },
      {
        trackingNumber: 'TRK-FR-20260530-001',
        orderId: 'SO-2026-0998',
        destination: '89 Boulevard Saint-Germain, 75006 Paris, France',
        carrier: 'UPS Standard',
        status: 'delivered',
        scheduledDate: new Date('2026-05-31'),
        deliveredDate: new Date('2026-05-31'),
        weight: 95.8,
        notes: 'Livré avec succès',
      },
    ])
    console.log('Shipments seeded.')

    console.log('All mock data seeded successfully.')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seed()
