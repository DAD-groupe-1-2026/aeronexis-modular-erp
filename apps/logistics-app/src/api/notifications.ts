import { apiClient } from '@aeronexis-dynamics/api-client'
import type { LogisticsNotification, LogisticsStockDto } from '@aeronexis-dynamics/shared-types'
import { mapStockAlerts } from './mappers'

export async function getNotifications(): Promise<LogisticsNotification[]> {
  const res = await apiClient.get<LogisticsStockDto[]>('/api/logistics/stock')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return mapStockAlerts(res.data)
}
