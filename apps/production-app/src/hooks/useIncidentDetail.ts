import { useQuery } from '@tanstack/react-query'
import { getIncidentById } from '@/api/incidents'

export const useIncidentDetail = (incidentId: string) =>
  useQuery({
    queryKey: ['incidents', incidentId],
    queryFn: () => getIncidentById(incidentId),
    enabled: Boolean(incidentId),
  })
