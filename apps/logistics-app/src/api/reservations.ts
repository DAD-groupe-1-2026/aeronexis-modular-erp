import { apiClient } from '@aeronexis-dynamics/api-client'
import type { LogisticsReservation } from '@aeronexis-dynamics/shared-types'

export async function getReservations(): Promise<LogisticsReservation[]> {
  const res = await apiClient.get<LogisticsReservation[]>('/api/logistics/reservations')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function updateReservationStatus(id: string, status: string): Promise<void> {
  const res = await apiClient.patch(`/api/logistics/reservations/${id}`, { status })
  if (res.status === 'failure') throw new Error(res.error?.message)
}

export async function createReservation(data: Partial<LogisticsReservation>): Promise<LogisticsReservation> {
  const res = await apiClient.post<LogisticsReservation>('/api/logistics/reservations', data)
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function sendReservationMessage(id: string, message: string): Promise<void> {
  const res = await apiClient.post(`/api/logistics/reservations/${id}/message`, { message })
  if (res.status === 'failure') throw new Error(res.error?.message)
}
