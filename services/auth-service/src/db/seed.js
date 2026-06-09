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
        passwordHash: 'Admin123!',
        role: 'admin',
        siteName: 'SIÈGE SOCIAL',
      })
      console.log('Admin user seeded (admin@aeronexis.com / Admin123!).')
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
        passwordHash: 'Operateur123!',
        role: 'operator',
        siteName: 'ATELIER PRINCIPAL',
      })
      console.log('Operator user seeded (operator@aeronexis.com / Operateur123!).')
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
        passwordHash: 'Logistique123!',
        role: 'logistics',
        siteName: 'SITE ALPHA',
      })
      console.log('Logistics user seeded (logistics@aeronexis.com / Logistique123!).')
    } else {
      await existingLogistics.update({ siteName: 'SITE ALPHA' })
      console.log('Logistics user already exists. siteName updated.')
    }

    console.log('Auth data seeding complete.')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seed()