require('dotenv').config()
const sequelize = require('./sequelize')
const User = require('../models/User')
const bcrypt = require('bcrypt')

async function seed() {
  try {
    await sequelize.authenticate()
    console.log('Database connected for seeding.')

    const adminEmail = 'admin@aeronexis.com'
    const existingAdmin = await User.findOne({ where: { email: adminEmail } })

    if (!existingAdmin) {
      await User.create({
        firstName: 'Martin',
        lastName: 'Dupont',
        email: adminEmail,
        passwordHash: process.env.DEFAULT_ADMIN_PWD || 'Admin123!',
        role: 'admin',
        siteName: 'SIÈGE SOCIAL',
      })
      console.log('Admin user seeded.')
    } else {
      await existingAdmin.update({ siteName: 'SIÈGE SOCIAL' })
      console.log('Admin user already exists. siteName updated.')
    }

    const operatorEmail = 'operator@aeronexis.com'
    const existingOperator = await User.findOne({ where: { email: operatorEmail } })

    if (!existingOperator) {
      await User.create({
        firstName: 'Jean',
        lastName: 'Operateur',
        email: operatorEmail,
        passwordHash: process.env.DEFAULT_OPERATOR_PWD || 'Operateur123!',
        role: 'operator',
        siteName: 'ATELIER PRINCIPAL',
      })
      console.log('Operator user seeded.')
    } else {
      await existingOperator.update({ siteName: 'ATELIER PRINCIPAL' })
      console.log('Operator user already exists. siteName updated.')
    }

    const logisticsEmail = 'logistics@aeronexis.com'
    const existingLogistics = await User.findOne({ where: { email: logisticsEmail } })

    if (!existingLogistics) {
      await User.create({
        firstName: 'Sophie',
        lastName: 'Logistique',
        email: logisticsEmail,
        passwordHash: process.env.DEFAULT_LOGISTICS_PWD || 'Logistique123!',
        role: 'logistics',
        siteName: 'SITE ALPHA',
      })
      console.log('Logistics user seeded.')
    } else {
      await existingLogistics.update({ siteName: 'SITE ALPHA' })
      console.log('Logistics user already exists. siteName updated.')
    }

    const salesEmail = 'sales@aeronexis.com'
    const existingSales = await User.findOne({ where: { email: salesEmail } })

    if (!existingSales) {
      await User.create({
        firstName: 'Claire',
        lastName: 'Commerciale',
        email: salesEmail,
        passwordHash: process.env.DEFAULT_SALES_PWD || 'Sales123!',
        role: 'sales',
        siteName: 'BUREAU VENTES',
      })
      console.log('Sales user seeded.')
    } else {
      await existingSales.update({ siteName: 'BUREAU VENTES' })
      console.log('Sales user already exists. siteName updated.')
    }

    console.log('Auth data seeding complete.')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seed()