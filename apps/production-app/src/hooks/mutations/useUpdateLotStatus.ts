import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateLotStatus } from '@/api/orders'
import type { LotStatus } from '@aeronexis-dynamics/shared-types'

export const useUpdateLotStatus = (orderId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      lotId,
      status,
      completionPercent,
    }: {
      lotId: string
      status: LotStatus
      completionPercent: number
    }) => updateLotStatus(lotId, status, completionPercent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
