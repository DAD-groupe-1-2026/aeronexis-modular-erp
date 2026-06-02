import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ClipboardList,
  ArrowRight,
  Flame,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Progress } from '@/components/Progress'
import { IncidentBadge } from '@/components/IncidentBadge'
import { QueryErrorAlert } from '@aeronexis-dynamics/ui'
import { useOrders } from '@/hooks/useOrders'
import { useIncidents } from '@/hooks/useIncidents'

export function DashboardPage() {
  const ordersQuery = useOrders()
  const incidentsQuery = useIncidents()
  const { data: orders = [], isLoading: ordersLoading, isError: ordersError, error: ordersErr, refetch: refetchOrders } = ordersQuery
  const { data: incidents = [], isLoading: incidentsLoading, isError: incidentsError, error: incidentsErr, refetch: refetchIncidents } = incidentsQuery

  const allLots = orders.flatMap((wo) => wo.lots)
  const stats = {
    total: allLots.length,
    inProgress: allLots.filter((l) => l.status === 'in_progress').length,
    done: allLots.filter((l) => l.status === 'done').length,
    openIncidents: incidents.filter((i) => !i.resolved).length,
  }
  const urgentOrders = orders.filter((wo) => wo.priority === 'urgent' && wo.status !== 'done')
  const activeIncidents = incidents.filter((i) => !i.resolved)

  if (ordersLoading || incidentsLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">Chargement du tableau de bord...</div>
    )
  }

  if (ordersError) {
    return (
      <div className="p-8">
        <QueryErrorAlert
          error={ordersErr}
          onRetry={() => refetchOrders()}
          title="Erreur lors du chargement des ordres"
        />
      </div>
    )
  }

  if (incidentsError) {
    return (
      <div className="p-8">
        <QueryErrorAlert
          error={incidentsErr}
          onRetry={() => refetchIncidents()}
          title="Erreur lors du chargement des incidents"
        />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Vue d'ensemble de la journée –{' '}
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Lots au total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.done}</p>
                <p className="text-xs text-muted-foreground">Terminés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.openIncidents}</p>
                <p className="text-xs text-muted-foreground">Incidents ouverts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Flame className="h-4 w-4 text-red-500" />
                Ordres urgents en cours
              </CardTitle>
              <Link to="/orders">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Voir tout <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {urgentOrders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun ordre urgent</p>
            )}
            {urgentOrders.map((wo) => {
              const totalLots = wo.lots.length
              const doneLots = wo.lots.filter((l) => l.status === 'done').length
              const avgProgress =
                wo.lots.reduce((sum, l) => sum + l.completionPercent, 0) / totalLots
              return (
                <Link key={wo.id} to={`/orders/${wo.id}`} className="block">
                  <div className="rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{wo.reference}</span>
                      <Badge variant="destructive" className="text-[10px]">Urgent</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{wo.clientName}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{doneLots}/{totalLots} lots</span>
                        <span className="font-medium">{Math.round(avgProgress)}%</span>
                      </div>
                      <Progress value={avgProgress} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Échéance : {new Date(wo.dueDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Incidents non résolus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeIncidents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun incident ouvert</p>
            )}
            {activeIncidents.map((inc) => (
              <div key={inc.id} className="rounded-lg border border-border p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{inc.lotReference}</span>
                  <IncidentBadge severity={inc.severity} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{inc.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(inc.reportedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
