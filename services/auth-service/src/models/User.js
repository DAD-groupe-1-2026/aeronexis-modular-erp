const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

const ROLES = ['operator', 'logistics', 'sales', 'director', 'admin']

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...ROLES),
      allowNull: false,
      defaultValue: 'operator',
    },
  },
  {
    tableName: 'users',
    schema: process.env.DB_SCHEMA || 'auth',
  },
)

module.exports = User
