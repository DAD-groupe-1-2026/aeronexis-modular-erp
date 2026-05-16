import { useQuery } from '@tanstack/react-query'
import { getOrders } from '@/api/orders'

export const useOrders = () =>
  useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  })
