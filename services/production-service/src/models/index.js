const sequelize = require('../db/sequelize')
const { DataTypes } = require('sequelize')

const SCHEMA = process.env.DB_SCHEMA || 'production'

// ─── WorkOrder ───────────────────────────────────────────────────────────────
const WorkOrder = sequelize.define(
  'WorkOrder',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    reference: { type: DataTypes.STRING, allowNull: false, unique: true },
    clientName: { type: DataTypes.STRING, allowNull: false },
    priority: { type: DataTypes.ENUM('normal', 'urgent'), defaultValue: 'normal' },
    status: { type: DataTypes.ENUM('planned', 'in_progress', 'done'), defaultValue: 'planned' },
    dueDate: { type: DataTypes.DATE, allowNull: false },
  },
  { tableName: 'work_orders', schema: SCHEMA },
)

// ─── Lot ─────────────────────────────────────────────────────────────────────
const Lot = sequelize.define(
  'Lot',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    reference: { type: DataTypes.STRING, allowNull: false, unique: true },
    product: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('planned', 'in_progress', 'done'), defaultValue: 'planned' },
    startDate: { type: DataTypes.DATE, allowNull: false },
    dueDate: { type: DataTypes.DATE, allowNull: false },
    machine: { type: DataTypes.STRING, allowNull: false },
    completionPercent: { type: DataTypes.FLOAT, defaultValue: 0 },
  },
  { tableName: 'lots', schema: SCHEMA },
)

// ─── Material ─────────────────────────────────────────────────────────────────
const Material = sequelize.define(
  'Material',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    reference: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.FLOAT, allowNull: false },
    unit: { type: DataTypes.STRING, allowNull: false },
    available: { type: DataTypes.FLOAT, allowNull: false },
  },
  { tableName: 'materials', schema: SCHEMA },
)

// ─── Incident ─────────────────────────────────────────────────────────────────
const Incident = sequelize.define(
  'Incident',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
    },
    description: { type: DataTypes.TEXT, allowNull: false },
    reportedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    reportedBy: { type: DataTypes.STRING, allowNull: false },
    resolved: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: 'incidents', schema: SCHEMA },
)

// ─── HistoryEntry ──────────────────────────────────────────────────────────────
const HistoryEntry = sequelize.define(
  'HistoryEntry',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    action: { type: DataTypes.STRING, allowNull: false },
    target: { type: DataTypes.STRING, allowNull: false },
    targetId: { type: DataTypes.STRING, allowNull: false },
    performedBy: { type: DataTypes.STRING, allowNull: false },
    performedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    detail: { type: DataTypes.TEXT },
  },
  { tableName: 'history_entries', schema: SCHEMA },
)

// ─── Associations ─────────────────────────────────────────────────────────────
WorkOrder.hasMany(Lot, { foreignKey: 'workOrderId', as: 'lots' })
Lot.belongsTo(WorkOrder, { foreignKey: 'workOrderId', as: 'workOrder' })

Lot.hasMany(Material, { foreignKey: 'lotId', as: 'materials' })
Material.belongsTo(Lot, { foreignKey: 'lotId', as: 'lot' })

Lot.hasMany(Incident, { foreignKey: 'lotId', as: 'incidents' })
Incident.belongsTo(Lot, { foreignKey: 'lotId', as: 'lot' })

module.exports = { WorkOrder, Lot, Material, Incident, HistoryEntry }
