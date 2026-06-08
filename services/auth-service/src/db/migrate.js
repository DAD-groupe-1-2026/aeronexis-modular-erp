require('dotenv').config()
const sequelize = require('./sequelize')
const User = require('../models/User')

async function migrate() {
  try {
    await sequelize.authenticate()
    console.log('Database connected.')

    // Crée le schéma SQL si inexistant
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${process.env.DB_SCHEMA || 'auth'}"`)

    // Synchronise les modèles (crée les tables si elles n'existent pas)
    await sequelize.sync({ alter: true })
    console.log('Migration complete.')
    process.exit(0)
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  }
}

migrate()
