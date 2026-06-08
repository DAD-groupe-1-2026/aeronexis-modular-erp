import { apiClient } from '@aeronexis-dynamics/api-client'
import type { LogisticsReservation, LogisticsReservationDto } from '@aeronexis-dynamics/shared-types'
import { mapReservation } from './mappers'

export async function getReservations(): Promise<LogisticsReservation[]> {
  const res = await apiClient.get<LogisticsReservationDto[]>('/api/logistics/reservations')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data.map(mapReservation)
}
