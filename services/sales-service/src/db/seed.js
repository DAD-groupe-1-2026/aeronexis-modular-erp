require('dotenv').config()
const sequelize = require('./sequelize')
const { Client, SalesOrder, OrderItem } = require('../models')

async function seed() {
  try {
    await sequelize.authenticate()
    console.log('Database connected for seeding.')

    // Clients
    await Client.bulkCreate([
      {
        clientCode: 'CLI-FR-001',
        companyName: 'AeroTech Industries',
        contactName: 'Jean Dubois',
        email: 'j.dubois@aerotech.fr',
        phone: '+33 1 42 12 34 56',
        address: '15 Avenue Montaigne, 75008 Paris, France',
        country: 'France',
        category: 'enterprise',
        status: 'active',
      },
      {
        clientCode: 'CLI-FR-002',
        companyName: 'MecaPro SARL',
        contactName: 'Marie Martin',
        email: 'm.martin@mecapro.fr',
        phone: '+33 4 78 45 67 89',
        address: '89 Rue de la République, 69002 Lyon, France',
        country: 'France',
        category: 'premium',
        status: 'active',
      },
      {
        clientCode: 'CLI-DE-001',
        companyName: 'German Engineering GmbH',
        contactName: 'Hans Schmidt',
        email: 'h.schmidt@germaneng.de',
        phone: '+49 30 987 654 32',
        address: 'Hauptstrasse 42, 10115 Berlin, Germany',
        country: 'Germany',
        category: 'standard',
        status: 'active',
      },
    ])
    console.log('Clients seeded.')

    // Sales Orders
    const client1 = await Client.findOne({ where: { clientCode: 'CLI-FR-001' } })
    const client2 = await Client.findOne({ where: { clientCode: 'CLI-FR-002' } })
    const client3 = await Client.findOne({ where: { clientCode: 'CLI-DE-001' } })

    await SalesOrder.bulkCreate([
      {
        orderNumber: 'SO-2026-1001',
        clientId: client1.id,
        orderDate: new Date('2026-05-15'),
        deliveryDate: new Date('2026-06-15'),
        status: 'in_production',
        totalAmount: 125000.00,
        currency: 'EUR',
        notes: 'Commande prioritaire - livraison express',
        salesRepresentative: 'sales@aeronexis.com',
      },
      {
        orderNumber: 'SO-2026-1002',
        clientId: client2.id,
        orderDate: new Date('2026-05-20'),
        deliveryDate: new Date('2026-07-01'),
        status: 'confirmed',
        totalAmount: 75000.00,
        currency: 'EUR',
        notes: 'Commande standard',
        salesRepresentative: 'sales@aeronexis.com',
      },
      {
        orderNumber: 'SO-2026-1003',
        clientId: client3.id,
        orderDate: new Date('2026-05-25'),
        deliveryDate: new Date('2026-06-30'),
        status: 'pending',
        totalAmount: 95000.00,
        currency: 'EUR',
        notes: 'En attente de confirmation du client',
        salesRepresentative: 'sales@aeronexis.com',
      },
    ])
    console.log('Sales orders seeded.')

    // Order Items
    const order1 = await SalesOrder.findOne({ where: { orderNumber: 'SO-2026-1001' } })
    const order2 = await SalesOrder.findOne({ where: { orderNumber: 'SO-2026-1002' } })
    const order3 = await SalesOrder.findOne({ where: { orderNumber: 'SO-2026-1003' } })

    await OrderItem.bulkCreate([
      {
        salesOrderId: order1.id,
        productCode: 'WING-ALU-001',
        productName: 'Aile en aluminium 6061-T6',
        quantity: 500,
        unitPrice: 250.00,
        discount: 0,
        totalPrice: 125000.00,
      },
      {
        salesOrderId: order2.id,
        productCode: 'BODY-STEEL-002',
        productName: 'Fuselage en acier inoxydable',
        quantity: 150,
        unitPrice: 500.00,
        discount: 0,
        totalPrice: 75000.00,
      },
      {
        salesOrderId: order3.id,
        productCode: 'ENGINE-TIT-003',
        productName: 'Composant moteur en titane',
        quantity: 100,
        unitPrice: 950.00,
        discount: 0,
        totalPrice: 95000.00,
      },
    ])
    console.log('Order items seeded.')

    console.log('All mock data seeded successfully.')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seed()
