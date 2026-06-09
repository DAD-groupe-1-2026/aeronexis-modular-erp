// ─── Normalized API Response ───────────────────────────────────────────────

export type ApiStatus = 'success' | 'failure' | 'pending'

export interface ApiResponse<T> {
  status: ApiStatus
  data: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
}

// ─── Auth / User ─────────────────────────────────────────────────────────────

export type Role = 'operator' | 'logistics' | 'sales' | 'director' | 'admin'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  siteName?: string
}

// ─── Production domain ───────────────────────────────────────────────────────

export type LotStatus = 'planned' | 'in_progress' | 'done'
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type OrderPriority = 'normal' | 'urgent'

export interface Material {
  id: string
  name: string
  reference: string
  quantity: number
  unit: string
  available: number
}

export interface Lot {
  id: string
  reference: string
  product: string
  quantity: number
  status: LotStatus
  startDate: string
  dueDate: string
  machine: string
  materials: Material[]
  completionPercent: number
}

export interface WorkOrder {
  id: string
  reference: string
  clientName: string
  priority: OrderPriority
  status: LotStatus
  lots: Lot[]
  createdAt: string
  dueDate: string
}

export interface Incident {
  id: string
  lotId: string
  lotReference: string
  severity: IncidentSeverity
  description: string
  reportedAt: string
  reportedBy: string
  resolved: boolean
}

export interface HistoryEntry {
  id: string
  action: string
  target: string
  targetId: string
  performedBy: string
  performedAt: string
  detail?: string
}

// ─── Logistics domain (aligné sur logistics-service / Sequelize) ─────────────

export type StockCategory = 'raw_material' | 'component' | 'consumable' | 'packaging'

export interface LogisticsStockItem {
  id: string
  materialCode: string
  materialName: string
  category: StockCategory
  quantityAvailable: number | string
  quantityReserved: number | string
  unit: string
  reorderLevel: number | string
  location?: string | null
  supplier?: string | null
  updatedAt?: string
  createdAt?: string
}

export type ReservationStatus = 'pending' | 'confirmed' | 'fulfilled' | 'cancelled'

export interface LogisticsReservation {
  id: string
  stockItemId: string
  workOrderId: string
  quantity: number | string
  status: ReservationStatus
  reservedBy: string
  createdAt?: string
  updatedAt?: string
  stockItem?: Pick<LogisticsStockItem, 'materialCode' | 'materialName'>
}

export type ShipmentStatus = 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'returned'

export interface LogisticsShipment {
  id: string
  trackingNumber: string
  orderId: string
  destination: string
  carrier: string
  status: ShipmentStatus
  scheduledDate: string
  deliveredDate?: string | null
  weight?: number | string | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

/** Alerte dérivée côté client à partir des seuils de stock */
export interface LogisticsStockAlert {
  id: string
  stockItemId: string
  message: string
  createdAt: string
}

// ─── Sales domain ─────────────────────────────────────────────────────────────

export type OrderStatus = 'draft' | 'confirmed' | 'in_production' | 'delivered' | 'cancelled'

export interface SalesOrder {
  id: string
  reference: string
  clientId: string
  clientName: string
  lines: SalesOrderLine[]
  status: OrderStatus
  priority: OrderPriority
  createdAt: string
  expectedDeliveryDate: string
}

export interface SalesOrderLine {
  id: string
  productReference: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface Client {
  id: string
  name: string
  country: string
  contactEmail: string
  contractsCount: number
}
