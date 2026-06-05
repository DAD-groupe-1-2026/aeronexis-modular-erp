import { apiClient } from '@aeronexis-dynamics/api-client'
import type { LogisticsStock, LogisticsStockDto } from '@aeronexis-dynamics/shared-types'
import { mapStockItem } from './mappers'

export async function getMaterials(): Promise<LogisticsStock[]> {
  const res = await apiClient.get<LogisticsStockDto[]>('/api/logistics/stock')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data.map(mapStockItem)
}
