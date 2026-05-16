import type { WorkOrder } from '@aeronexis-dynamics/shared-types'
import { apiClient } from '@aeronexis-dynamics/api-client'
import { mockWorkOrders } from '@/data/mock'

export async function getOrders(): Promise<WorkOrder[]> {
  if (import.meta.env.DEV) return mockWorkOrders
  const res = await apiClient.get<WorkOrder[]>('/api/production/orders')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function getOrderById(id: string): Promise<WorkOrder> {
  if (import.meta.env.DEV) {
    const order = mockWorkOrders.find((o) => o.id === id)
    if (!order) throw new Error(`Order ${id} not found`)
    return order
  }
  const res = await apiClient.get<WorkOrder>(`/api/production/orders/${id}`)
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function updateLotStatus(
  lotId: string,
  status: WorkOrder['lots'][number]['status'],
  completionPercent: number,
): Promise<void> {
  if (import.meta.env.DEV) return
  const res = await apiClient.patch<void>(`/api/production/lots/${lotId}`, {
    status,
    completionPercent,
  })
  if (res.status === 'failure') throw new Error(res.error?.message)
}
