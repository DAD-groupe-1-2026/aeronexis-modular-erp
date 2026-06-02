import { useQuery } from '@tanstack/react-query'
import { getOrderById } from '@/api/orders'

export const useLotDetail = (orderId: string) =>
  useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: Boolean(orderId),
  })
