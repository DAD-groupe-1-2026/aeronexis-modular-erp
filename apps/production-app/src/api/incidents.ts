import type { Incident, IncidentSeverity, HistoryEntry } from '@aeronexis-dynamics/shared-types'
import { apiClient } from '@aeronexis-dynamics/api-client'
import { mockIncidents, mockHistory } from '@/data/mock'

export async function getIncidents(): Promise<Incident[]> {
  if (import.meta.env.DEV) return mockIncidents
  const res = await apiClient.get<Incident[]>('/api/production/incidents')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function createIncident(payload: {
  lotId: string
  severity: IncidentSeverity
  description: string
}): Promise<Incident> {
  if (import.meta.env.DEV) {
    return {
      id: `inc-${Date.now()}`,
      lotId: payload.lotId,
      lotReference: payload.lotId,
      severity: payload.severity,
      description: payload.description,
      reportedAt: new Date().toISOString(),
      reportedBy: 'Martin Dupont',
      resolved: false,
    }
  }
  const res = await apiClient.post<Incident>('/api/production/incidents', payload)
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}

export async function getHistory(): Promise<HistoryEntry[]> {
  if (import.meta.env.DEV) return mockHistory
  const res = await apiClient.get<HistoryEntry[]>('/api/production/history')
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}
