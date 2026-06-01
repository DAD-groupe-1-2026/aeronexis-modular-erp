// ─── Couche 3 : Gateway — Contrats NGINX / auth_request ──────────────────────

/**
 * Noms des microservices routés par NGINX (upstreams définis dans nginx.conf).
 */
export type ServiceName =
  | 'auth'
  | 'production'
  | 'logistics'
  | 'sales'
  | 'traceability'
  | 'notifications'

/**
 * Payload JWT décodé, transmis aux microservices (couche 4) via le header
 * X-User injecté par NGINX après validation par auth-service /auth/verify.
 * Disponible dans les handlers Express via req.user (après parsing du header).
 */
export interface ResolvedRequest {
  userId: string
  email: string
  role: Role
  iat: number
  exp: number
}

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

// ─── Logistics domain ────────────────────────────────────────────────────────

export type StockAlertLevel = 'ok' | 'low' | 'critical'

export interface StockItem {
  id: string
  reference: string
  name: string
  quantity: number
  unit: string
  minThreshold: number
  alertLevel: StockAlertLevel
  warehouseLocation: string
}

export interface Shipment {
  id: string
  reference: string
  destination: string
  items: { stockItemId: string; quantity: number }[]
  scheduledDate: string
  status: 'pending' | 'in_transit' | 'delivered'
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
