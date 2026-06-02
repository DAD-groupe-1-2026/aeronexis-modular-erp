import { useMutation, useQueryClient } from '@tanstack/react-query'
import { resolveIncident } from '@/api/incidents'

export const useResolveIncident = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (incidentId: string) => resolveIncident(incidentId),
    onSuccess: (_resolvedIncident, incidentId) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['incidents', incidentId] })
      queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })
}
