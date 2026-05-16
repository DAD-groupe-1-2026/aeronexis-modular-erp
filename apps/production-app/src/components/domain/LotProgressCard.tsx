import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { Lot, LotStatus } from '@aeronexis-dynamics/shared-types'

const statusLabel: Record<LotStatus, string> = {
  planned: 'Planifié',
  in_progress: 'En cours',
  done: 'Terminé',
}

const statusVariant: Record<LotStatus, 'secondary' | 'warning' | 'success'> = {
  planned: 'secondary',
  in_progress: 'warning',
  done: 'success',
}

interface LotProgressCardProps {
  lot: Lot
}

export function LotProgressCard({ lot }: LotProgressCardProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{lot.reference}</span>
        <Badge variant={statusVariant[lot.status]}>{statusLabel[lot.status]}</Badge>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{lot.product}</span>
          <span>{lot.completionPercent}%</span>
        </div>
        <Progress
          value={lot.completionPercent}
          indicatorClassName={lot.status === 'done' ? 'bg-emerald-500' : undefined}
        />
      </div>
    </div>
  )
}
