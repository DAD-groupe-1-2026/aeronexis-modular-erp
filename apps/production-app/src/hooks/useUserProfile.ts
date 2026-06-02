import { useQuery } from '@tanstack/react-query'
import { getUserById } from '@/api/users'

export const useUserProfile = (userId: string) =>
  useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUserById(userId),
    enabled: Boolean(userId),
    retry: false,
  })
