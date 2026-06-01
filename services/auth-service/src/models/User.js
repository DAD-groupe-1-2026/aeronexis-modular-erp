const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')
const bcrypt = require('bcrypt')

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
    
    // --- HOOKS DE SÉCURITÉ ---
    hooks: {
      beforeCreate: async (user) => {
        // Hachage du mot de passe lors de l'inscription
        if (user.passwordHash) {
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        }
      },
      beforeUpdate: async (user) => {
        // Hachage uniquement si l'utilisateur modifie son mot de passe
        if (user.changed('passwordHash')) {
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        }
      }
    }
  }
)

// --- MÉTHODE UTILITAIRE ---
// Permet de comparer un mot de passe en clair avec le hash stocké en base
User.prototype.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
}

module.exports = User