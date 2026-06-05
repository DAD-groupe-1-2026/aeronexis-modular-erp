import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Package, Cpu, CheckCircle2, Clock, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Progress } from '@/components/Progress'
import { Select } from '@/components/Form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QueryErrorAlert } from '@aeronexis-dynamics/ui'
import { getOrderById, updateLotStatus } from '@/api/orders'
import type { LotStatus } from '@aeronexis-dynamics/shared-types'

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

export function OrderDetailPage() {
  const { orderId = '' } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: workOrder, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: Boolean(orderId),
  })
  const updateLot = useMutation({
    mutationFn: ({ lotId, status, completionPercent }: { lotId: string; status: LotStatus; completionPercent: number }) =>
      updateLotStatus(lotId, status, completionPercent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  const [lotStatuses, setLotStatuses] = useState<Record<string, LotStatus>>({})
  const [lotProgress, setLotProgress] = useState<Record<string, number>>({})

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Chargement...</div>
  }

  if (isError) {
    return (
      <div className="p-8 space-y-4">
        <QueryErrorAlert
          error={error}
          onRetry={() => refetch()}
          title="Erreur lors du chargement de l'ordre"
        />
        <Link to="/orders" className="text-primary text-sm inline-block">← Retour aux ordres</Link>
      </div>
    )
  }

  if (!workOrder) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Ordre introuvable.</p>
        <Link to="/orders" className="text-primary text-sm mt-2 inline-block">← Retour</Link>
      </div>
    )
  }

  const getLotStatus = (lotId: string, fallback: LotStatus) =>
    lotStatuses[lotId] ?? fallback

  const getLotProgress = (lotId: string, fallback: number) =>
    lotProgress[lotId] ?? fallback

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold">{workOrder.reference}</h1>
            {workOrder.priority === 'urgent' && <Badge variant="destructive">Urgent</Badge>}
            <Badge variant={statusVariant[workOrder.status]}>{statusLabel[workOrder.status]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{workOrder.clientName}</p>
        </div>
        <Link to={`/incident/new?lot=${workOrder.lots[0]?.id}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Signaler un incident
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Calendar, label: 'Créé le', value: new Date(workOrder.createdAt).toLocaleDateString('fr-FR') },
          { icon: Calendar, label: 'Échéance', value: new Date(workOrder.dueDate).toLocaleDateString('fr-FR') },
          {
            icon: CheckCircle2,
            label: 'Lots terminés',
            value: `${workOrder.lots.filter((l) => getLotStatus(l.id, l.status) === 'done').length} / ${workOrder.lots.length}`,
          },
          {
            icon: Clock,
            label: 'En cours',
            value: `${workOrder.lots.filter((l) => getLotStatus(l.id, l.status) === 'in_progress').length}`,
          },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-semibold text-sm">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {updateLot.isError && (
        <QueryErrorAlert
          error={updateLot.error}
          onRetry={() => updateLot.reset()}
          retryLabel="Fermer"
          title="Échec de la mise à jour du lot"
        />
      )}

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Lots de fabrication</h2>
        {workOrder.lots.map((lot) => {
          const currentStatus = getLotStatus(lot.id, lot.status)
          const currentProgress = getLotProgress(lot.id, lot.completionPercent)

          return (
            <Card key={lot.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-base">{lot.reference}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">{lot.product}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={currentStatus}
                      onChange={(e) => {
                        const s = e.target.value as LotStatus
                        setLotStatuses((prev) => ({ ...prev, [lot.id]: s }))
                        updateLot.mutate({ lotId: lot.id, status: s, completionPercent: currentProgress })
                      }}
                      className="w-36 text-xs h-8"
                    >
                      <option value="planned">Planifié</option>
                      <option value="in_progress">En cours</option>
                      <option value="done">Terminé</option>
                    </Select>
                    <Badge variant={statusVariant[currentStatus]}>{statusLabel[currentStatus]}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avancement</span>
                    <span className="font-semibold">{currentProgress}%</span>
                  </div>
                  <Progress
                    value={currentProgress}
                    indicatorClassName={currentStatus === 'done' ? 'bg-emerald-500' : undefined}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={currentProgress}
                    onChange={(e) =>
                      setLotProgress((prev) => ({ ...prev, [lot.id]: Number(e.target.value) }))
                    }
                    className="w-full accent-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Machine</p>
                      <p className="text-sm font-medium">{lot.machine}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Quantité</p>
                      <p className="text-sm font-medium">{lot.quantity} pcs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Échéance lot</p>
                      <p className="text-sm font-medium">{new Date(lot.dueDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Matières premières</h3>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 text-xs text-muted-foreground">
                          <th className="text-left px-3 py-2">Désignation</th>
                          <th className="text-left px-3 py-2">Référence</th>
                          <th className="text-right px-3 py-2">Requis</th>
                          <th className="text-right px-3 py-2">Disponible</th>
                          <th className="text-right px-3 py-2">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lot.materials.map((mat, i) => {
                          const ok = mat.available >= mat.quantity
                          return (
                            <tr key={mat.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                              <td className="px-3 py-2.5 font-medium">{mat.name}</td>
                              <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{mat.reference}</td>
                              <td className="px-3 py-2.5 text-right">{mat.quantity} {mat.unit}</td>
                              <td className="px-3 py-2.5 text-right">{mat.available} {mat.unit}</td>
                              <td className="px-3 py-2.5 text-right">
                                <Badge variant={ok ? 'success' : 'destructive'}>
                                  {ok ? 'Disponible' : 'Insuffisant'}
                                </Badge>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Link to={`/incident/new?lot=${lot.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      Signaler incident
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    disabled={currentStatus === 'done'}
                    onClick={() => {
                      setLotStatuses((prev) => ({ ...prev, [lot.id]: 'done' }))
                      setLotProgress((prev) => ({ ...prev, [lot.id]: 100 }))
                      updateLot.mutate({ lotId: lot.id, status: 'done', completionPercent: 100 })
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Marquer terminé
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
