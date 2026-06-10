const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

// Client : Gestion des clients
const Client = sequelize.define(
  'Client',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    companyName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    contactName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'France',
    },
    category: {
      type: DataTypes.ENUM('standard', 'premium', 'enterprise'),
      defaultValue: 'standard',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active',
    },
  },
  {
    tableName: 'clients',
    timestamps: true,
  }
)

// Product : Catalogue de produits
const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'products',
    timestamps: true,
  }
)

// SalesOrder : Commandes clients
const SalesOrder = sequelize.define(
  'SalesOrder',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'id',
      },
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'in_production', 'ready', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'EUR',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    salesRepresentative: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  },
  {
    tableName: 'sales_orders',
    timestamps: true,
  }
)

// OrderItem : Lignes de commande
const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    salesOrderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sales_orders',
        key: 'id',
      },
    },
    productCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'order_items',
    timestamps: true,
  }
)

// Associations
Client.hasMany(SalesOrder, { foreignKey: 'clientId', as: 'orders' })
SalesOrder.belongsTo(Client, { foreignKey: 'clientId', as: 'client' })

SalesOrder.hasMany(OrderItem, { foreignKey: 'salesOrderId', as: 'items' })
OrderItem.belongsTo(SalesOrder, { foreignKey: 'salesOrderId', as: 'order' })

// Events
const { publishEvent, EVENTS } = require('@aeronexis/event-bus')


module.exports = { Client, Product, SalesOrder, OrderItem }
