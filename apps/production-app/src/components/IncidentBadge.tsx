import { Badge } from '@/components/Badge'
import type { IncidentSeverity } from '@aeronexis-dynamics/shared-types'

const config: Record<IncidentSeverity, { label: string; variant: 'secondary' | 'warning' | 'destructive' }> = {
  low: { label: 'Faible', variant: 'secondary' },
  medium: { label: 'Moyenne', variant: 'warning' },
  high: { label: 'Haute', variant: 'destructive' },
  critical: { label: 'Critique', variant: 'destructive' },
}

interface IncidentBadgeProps {
  severity: IncidentSeverity
}

export function IncidentBadge({ severity }: IncidentBadgeProps) {
  const { label, variant } = config[severity]
  return <Badge variant={variant}>{label}</Badge>
}
