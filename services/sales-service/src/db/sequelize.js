const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  schema: process.env.DB_SCHEMA || 'sales',
})

module.exports = sequelize
