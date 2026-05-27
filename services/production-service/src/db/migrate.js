require('dotenv').config()
const sequelize = require('./sequelize')
require('../models')

async function migrate() {
  try {
    await sequelize.authenticate()
    console.log('Database connected.')
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${process.env.DB_SCHEMA || 'production'}"`)
    await sequelize.sync({ alter: true })
    console.log('Migration complete.')
    process.exit(0)
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  }
}

migrate()
