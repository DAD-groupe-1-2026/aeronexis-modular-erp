import { useQuery } from '@tanstack/react-query'
import { getIncidents } from '@/api/incidents'

export const useIncidents = () =>
  useQuery({
    queryKey: ['incidents'],
    queryFn: getIncidents,
  })
