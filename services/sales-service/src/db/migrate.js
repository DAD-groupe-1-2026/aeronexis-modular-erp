require('dotenv').config()
const sequelize = require('./sequelize')
const { Client, SalesOrder, OrderItem } = require('../models')

async function migrate() {
  try {
    await sequelize.authenticate()
    console.log('Database connected.')

    // Créer le schéma s'il n'existe pas
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.DB_SCHEMA || 'sales'}`)
    console.log(`Schema '${process.env.DB_SCHEMA || 'sales'}' ready.`)

    // Synchroniser les modèles avec la base de données
    await sequelize.sync({ alter: true })
    console.log('Tables synchronized.')

    console.log('Migration completed successfully.')
    process.exit(0)
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  }
}

migrate()
