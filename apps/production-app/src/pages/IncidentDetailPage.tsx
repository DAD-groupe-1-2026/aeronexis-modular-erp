import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { useIncidentDetail } from '@/hooks/useIncidentDetail'
import { useResolveIncident } from '@/hooks/useResolveIncident'
import { useUserProfile } from '@/hooks/useUserProfile'
import { QueryErrorAlert } from '@aeronexis-dynamics/ui'
import type { IncidentSeverity } from '@aeronexis-dynamics/shared-types'

const severityVariant: Record<IncidentSeverity, 'secondary' | 'warning' | 'destructive'> = {
  low: 'secondary',
  medium: 'warning',
  high: 'destructive',
  critical: 'destructive',
}

const severityLabel: Record<IncidentSeverity, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute',
  critical: 'Critique',
}

export function IncidentDetailPage() {
  const { incidentId = '' } = useParams<{ incidentId: string }>()
  const navigate = useNavigate()
  const { data: incident, isLoading, isError, error, refetch } = useIncidentDetail(incidentId)
  const resolveIncident = useResolveIncident()
  const { data: reporter } = useUserProfile(incident?.reportedBy ?? '')

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Chargement de l'incident...</div>
  }

  if (isError) {
    return (
      <div className="p-8 space-y-4">
        <QueryErrorAlert
          error={error}
          onRetry={() => refetch()}
          title="Erreur lors du chargement de l'incident"
        />
        <Link to="/dashboard" className="text-primary text-sm inline-block">← Retour au tableau de bord</Link>
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="p-8 space-y-4">
        <p className="text-muted-foreground">Incident introuvable.</p>
        <Link to="/dashboard" className="text-primary text-sm inline-block">← Retour au tableau de bord</Link>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold">Incident {incident.id.slice(0, 8)}</h1>
            <Badge variant={severityVariant[incident.severity]}>{severityLabel[incident.severity]}</Badge>
            <Badge variant={incident.resolved ? 'success' : 'warning'}>
              {incident.resolved ? 'Résolu' : 'Non résolu'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Lot concerné : {incident.lotReference}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détails de l'incident</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resolveIncident.isError && (
            <QueryErrorAlert
              error={resolveIncident.error}
              onRetry={() => resolveIncident.reset()}
              retryLabel="Fermer"
              title="Échec de la résolution de l'incident"
            />
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Signalé le {new Date(incident.reportedAt).toLocaleString('fr-FR')}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Signalé par {reporter ? `${reporter.firstName} ${reporter.lastName}` : 'Utilisateur inconnu'}
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-sm whitespace-pre-wrap">{incident.description}</p>
          </div>

          <div className="pt-2">
            {incident.resolved ? (
              <div className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Incident déjà résolu
              </div>
            ) : (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  Incident en attente de résolution
                </div>
                <div>
                  <Button
                    onClick={() => resolveIncident.mutate(incident.id)}
                    disabled={resolveIncident.isPending}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {resolveIncident.isPending ? 'Résolution...' : "Marquer comme résolu"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
