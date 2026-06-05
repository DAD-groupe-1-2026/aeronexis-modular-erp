import { apiClient } from '@aeronexis-dynamics/api-client'
import type { LogisticsShipment, LogisticsShipmentDto } from '@aeronexis-dynamics/shared-types'
import { mapShipment } from './mappers'

export async function getShipments(): Promise<LogisticsShipment[]> {
  const res = await apiClient.get<LogisticsShipmentDto[]>('/api/logistics/shipments')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data.map(mapShipment)
}
