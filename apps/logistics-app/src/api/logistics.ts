import { apiClient } from '@aeronexis-dynamics/api-client'
import type { Shipment, StockItem } from '@/types/logistics'

export async function getStock(): Promise<StockItem[]> {
  const res = await apiClient.get<StockItem[]>('/api/logistics/stock')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function getShipments(): Promise<Shipment[]> {
  const res = await apiClient.get<Shipment[]>('/api/logistics/shipments')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}
