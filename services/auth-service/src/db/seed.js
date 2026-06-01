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
      })
      console.log('Admin user seeded (admin@aeronexis.com / Admin123!).')
    } else {
      console.log('Admin user already exists.')
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
      })
      console.log('Operator user seeded (operator@aeronexis.com / Operateur123!).')
    } else {
      console.log('Operator user already exists.')
    }

    console.log('Auth data seeding complete.')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seed()