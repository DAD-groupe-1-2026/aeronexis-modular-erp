import { apiClient } from '@aeronexis-dynamics/api-client'
import type { LogisticsStockAlert, LogisticsStockItem } from '@aeronexis-dynamics/shared-types'
import { toNumber } from '../lib/utils'

export async function getNotifications(): Promise<LogisticsStockAlert[]> {
  const res = await apiClient.get<LogisticsStockItem[]>('/api/logistics/stock')
  if (res.status === 'failure') throw new Error(res.error?.message)

  return res.data
    .filter((item) => toNumber(item.quantityAvailable) < toNumber(item.reorderLevel))
    .map((item) => ({
      id: `alert-${item.id}`,
      stockItemId: item.id,
      message: `Stock critique : ${item.materialName} (${item.materialCode}) sous le seuil`,
      createdAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
    }))
}
