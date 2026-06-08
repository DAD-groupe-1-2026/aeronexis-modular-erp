import { apiClient } from '@aeronexis-dynamics/api-client'
import type { LogisticsStockItem } from '@aeronexis-dynamics/shared-types'

export async function getMaterials(): Promise<LogisticsStockItem[]> {
  const res = await apiClient.get<LogisticsStockItem[]>('/api/logistics/stock')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}
