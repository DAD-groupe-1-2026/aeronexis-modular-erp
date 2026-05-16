import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createIncident } from '@/api/incidents'
import type { IncidentSeverity } from '@aeronexis-dynamics/shared-types'

export const useReportIncident = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      lotId: string
      severity: IncidentSeverity
      description: string
    }) => createIncident(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })
}
