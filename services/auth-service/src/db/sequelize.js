const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  schema: process.env.DB_SCHEMA || 'auth',
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
  },
})

module.exports = sequelize
