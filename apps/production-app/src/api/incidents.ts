import type { Incident, IncidentSeverity, HistoryEntry } from '@aeronexis-dynamics/shared-types'
import { apiClient } from '@aeronexis-dynamics/api-client'

export async function getIncidents(): Promise<Incident[]> {
  const res = await apiClient.get<Incident[]>('/api/production/incidents')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function getIncidentById(id: string): Promise<Incident> {
  const res = await apiClient.get<Incident>(`/api/production/incidents/${id}`)
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function createIncident(payload: {
  lotId: string
  severity: IncidentSeverity
  description: string
}): Promise<Incident> {
  const res = await apiClient.post<Incident>('/api/production/incidents', payload)
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function resolveIncident(id: string): Promise<Incident> {
  const res = await apiClient.patch<Incident>(`/api/production/incidents/${id}/resolve`, {})
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const res = await apiClient.get<HistoryEntry[]>('/api/production/history')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}
