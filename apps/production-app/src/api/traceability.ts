import { apiClient } from '@aeronexis-dynamics/api-client'

export interface TraceabilityLog {
  _id: string
  eventType: string
  service: string
  userId?: number
  data: any
  timestamp: string
}

export async function getTraceabilityLogs(filters?: { workOrderId?: string, lotId?: string }): Promise<TraceabilityLog[]> {
  const params = new URLSearchParams()
  if (filters?.workOrderId) params.append('workOrderId', filters.workOrderId)
  if (filters?.lotId) params.append('lotId', filters.lotId)

  const res = await apiClient.get<TraceabilityLog[]>(`/api/traceability/logs?${params.toString()}`)
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}
