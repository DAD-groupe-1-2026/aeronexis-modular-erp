export type LotStatus = 'planned' | 'in_progress' | 'done'
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'

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
  priority: 'normal' | 'urgent'
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
