import { useQuery } from '@tanstack/react-query'
import { getHistory } from '@/api/incidents'

export const useHistory = () =>
  useQuery({
    queryKey: ['history'],
    queryFn: getHistory,
  })
