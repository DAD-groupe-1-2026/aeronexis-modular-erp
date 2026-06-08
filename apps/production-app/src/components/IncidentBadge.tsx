import { Badge } from '@aeronexis-dynamics/ui'
import type { IncidentSeverity } from '@aeronexis-dynamics/shared-types'

const config: Record<IncidentSeverity, { label: string; variant: 'default' | 'warning' | 'error' }> = {
  low: { label: 'Faible', variant: 'default' },
  medium: { label: 'Moyenne', variant: 'warning' },
  high: { label: 'Haute', variant: 'error' },
  critical: { label: 'Critique', variant: 'error' },
}

interface IncidentBadgeProps {
  severity: IncidentSeverity
}

export function IncidentBadge({ severity }: IncidentBadgeProps) {
  const { label, variant } = config[severity]
  return <Badge variant={variant}>{label}</Badge>
}
