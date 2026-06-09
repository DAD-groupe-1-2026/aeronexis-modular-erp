import type { WorkOrder } from '@aeronexis-dynamics/shared-types'
import { apiClient } from '@aeronexis-dynamics/api-client'

export async function getOrders(): Promise<WorkOrder[]> {
  const res = await apiClient.get<WorkOrder[]>('/api/production/orders')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function getOrderById(id: string): Promise<WorkOrder> {
  const res = await apiClient.get<WorkOrder>(`/api/production/orders/${id}`)
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function updateLotStatus(
  lotId: string,
  status: WorkOrder['lots'][number]['status'],
  completionPercent: number,
): Promise<void> {
  const res = await apiClient.patch<void>(`/api/production/lots/${lotId}`, {
    status,
    completionPercent,
  })
  if (res.status === 'failure') throw new Error(res.error?.message)
}
export async function requestMaterials(lotId: string): Promise<void> {
  const res = await apiClient.post<void>(`/api/production/lots/${lotId}/request-materials`, {})
  if (res.status === 'failure') throw new Error(res.error?.message)
}
