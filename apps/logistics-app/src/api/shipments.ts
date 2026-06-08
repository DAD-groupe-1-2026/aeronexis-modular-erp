import { apiClient } from '@aeronexis-dynamics/api-client'
import type { LogisticsShipment } from '@aeronexis-dynamics/shared-types'

export async function getShipments(): Promise<LogisticsShipment[]> {
  const res = await apiClient.get<LogisticsShipment[]>('/api/logistics/shipments')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}
