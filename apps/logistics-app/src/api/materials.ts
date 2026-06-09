import { apiClient } from '@aeronexis-dynamics/api-client'
import type { LogisticsStockItem } from '@aeronexis-dynamics/shared-types'

export async function getMaterials(): Promise<LogisticsStockItem[]> {
  const res = await apiClient.get<LogisticsStockItem[]>('/api/logistics/stock')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function createMaterial(data: Partial<LogisticsStockItem>): Promise<LogisticsStockItem> {
  const res = await apiClient.post<LogisticsStockItem>('/api/logistics/stock', data)
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function getMaterialById(id: string): Promise<LogisticsStockItem> {
  const res = await apiClient.get<LogisticsStockItem>(`/api/logistics/stock/${id}`)
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function updateMaterial(data: { id: string, payload: Partial<LogisticsStockItem> }): Promise<LogisticsStockItem> {
  const res = await apiClient.patch<LogisticsStockItem>(`/api/logistics/stock/${data.id}`, data.payload)
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}
