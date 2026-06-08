const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

// StockItem : Gestion des stocks de matières premières
const StockItem = sequelize.define(
  'StockItem',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    materialCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    materialName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('raw_material', 'component', 'consumable', 'packaging'),
      defaultValue: 'raw_material',
    },
    quantityAvailable: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    quantityReserved: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'kg',
    },
    reorderLevel: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 100,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    supplier: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  },
  {
    tableName: 'stock_items',
    timestamps: true,
  }
)

// Reservation : Réservations de stock pour les ordres de fabrication
const Reservation = sequelize.define(
  'Reservation',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    stockItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'stock_items',
        key: 'id',
      },
    },
    workOrderId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'fulfilled', 'cancelled'),
      defaultValue: 'pending',
    },
    reservedBy: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: 'reservations',
    timestamps: true,
  }
)

// Shipment : Expéditions de produits finis
const Shipment = sequelize.define(
  'Shipment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trackingNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    orderId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    destination: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    carrier: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('preparing', 'shipped', 'in_transit', 'delivered', 'returned'),
      defaultValue: 'preparing',
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deliveredDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'shipments',
    timestamps: true,
  }
)

// Associations
StockItem.hasMany(Reservation, { foreignKey: 'stockItemId', as: 'reservations' })
Reservation.belongsTo(StockItem, { foreignKey: 'stockItemId', as: 'stockItem' })

module.exports = { StockItem, Reservation, Shipment }
