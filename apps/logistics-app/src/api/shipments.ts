import { apiClient } from '@aeronexis-dynamics/api-client'
import type { LogisticsShipment } from '@aeronexis-dynamics/shared-types'

export async function getShipments(): Promise<LogisticsShipment[]> {
  const res = await apiClient.get<LogisticsShipment[]>('/api/logistics/shipments')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function createShipment(data: Partial<LogisticsShipment>): Promise<LogisticsShipment> {
  const res = await apiClient.post<LogisticsShipment>('/api/logistics/shipments', data)
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function getShipmentById(id: string): Promise<LogisticsShipment> {
  const res = await apiClient.get<LogisticsShipment>(`/api/logistics/shipments/${id}`)
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function updateShipment(data: { id: string, payload: Partial<LogisticsShipment> }): Promise<LogisticsShipment> {
  const res = await apiClient.patch<LogisticsShipment>(`/api/logistics/shipments/${data.id}`, data.payload)
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}
