const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  schema: process.env.DB_SCHEMA || 'production',
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
  },
})

module.exports = sequelize
