import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertTriangle, Package, Cpu, CheckCircle2, Clock, Calendar } from 'lucide-react'
import { Badge } from '@aeronexis-dynamics/ui'
import { Button } from '@aeronexis-dynamics/ui'
import { Progress } from '@/components/Progress'
import { Select } from '@/components/Form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QueryErrorAlert } from '@aeronexis-dynamics/ui'
import { getOrderById, updateLotStatus, requestMaterials } from '@/api/orders'
import type { LotStatus } from '@aeronexis-dynamics/shared-types'

const statusLabel: Record<LotStatus, string> = {
  planned: 'Planifié',
  in_progress: 'En cours',
  done: 'Terminé',
}

const statusVariant: Record<LotStatus, 'default' | 'warning' | 'success'> = {
  planned: 'default',
  in_progress: 'warning',
  done: 'success',
}

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -15 }
}

const pageTransition = {
  type: "tween" as const,
  ease: "anticipate" as const,
  duration: 0.4
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

  const requestMats = useMutation({
    mutationFn: (lotId: string) => requestMaterials(lotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
      alert('Demande envoyée à la logistique !')
    },
  })

  const [lotStatuses, setLotStatuses] = useState<Record<string, LotStatus>>({})
  const [lotProgress, setLotProgress] = useState<Record<string, number>>({})

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-slate-400 flex items-center gap-3">
        <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Chargement...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 space-y-4">
        <QueryErrorAlert
          error={error}
          onRetry={() => refetch()}
          title="Erreur lors du chargement de l'ordre"
        />
        <Link to="/orders" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium inline-block">← Retour aux ordres</Link>
      </div>
    )
  }

  if (!workOrder) {
    return (
      <div className="p-8">
        <p className="text-slate-400">Ordre introuvable.</p>
        <Link to="/orders" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium mt-4 inline-block">← Retour</Link>
      </div>
    )
  }

  const getLotStatus = (lotId: string, fallback: LotStatus) =>
    lotStatuses[lotId] ?? fallback

  const getLotProgress = (lotId: string, fallback: number) =>
    lotProgress[lotId] ?? fallback

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mt-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white tracking-tight">{workOrder.reference}</h1>
            {workOrder.priority === 'urgent' && <Badge variant="error" className="shadow-[0_0_10px_rgba(239,68,68,0.2)]">Urgent</Badge>}
            <Badge variant={statusVariant[workOrder.status]}>{statusLabel[workOrder.status]}</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">{workOrder.clientName}</p>
        </div>
        <Link to={`/incident/new?lot=${workOrder.lots[0]?.id}`}>
          <Button variant="outline" size="sm" className="gap-2 bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 rounded-xl transition-all">
            <AlertTriangle className="h-4 w-4" />
            Signaler un incident
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
        ].map(({ icon: Icon, label, value }, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * idx }}
            key={label} 
            className="rounded-2xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                <Icon className="h-4 w-4 text-slate-300" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="font-semibold text-sm text-white mt-0.5">{value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {updateLot.isError && (
        <QueryErrorAlert
          error={updateLot.error}
          onRetry={() => updateLot.reset()}
          title="Échec de la mise à jour du lot"
        />
      )}

      {/* Lots */}
      <div className="space-y-5">
        <h2 className="font-bold text-lg text-white">Lots de fabrication</h2>
        {workOrder.lots.map((lot, index) => {
          const currentStatus = getLotStatus(lot.id, lot.status)
          const currentProgress = getLotProgress(lot.id, lot.completionPercent)
          const hasInsufficientMaterials = lot.materials.some(mat => mat.available < mat.quantity)

          return (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (index * 0.1) }}
              key={lot.id} 
              className="rounded-2xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-2xl overflow-hidden"
            >
              {/* Lot header */}
              <div className="flex items-center justify-between gap-4 flex-wrap px-6 py-4 bg-white/5 border-b border-white/10">
                <div>
                  <p className="font-bold text-white text-base tracking-tight">{lot.reference}</p>
                  <p className="text-xs text-slate-400 mt-1">{lot.product}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={currentStatus}
                    onChange={(e) => {
                      const s = e.target.value as LotStatus
                      setLotStatuses((prev) => ({ ...prev, [lot.id]: s }))
                      updateLot.mutate({ lotId: lot.id, status: s, completionPercent: currentProgress })
                    }}
                    className="w-40 text-xs h-9 bg-white/5 border-white/10 text-white rounded-xl focus:border-indigo-500/50"
                  >
                    <option value="planned" className="bg-slate-900">Planifié</option>
                    <option value="in_progress" className="bg-slate-900">En cours</option>
                    <option value="done" className="bg-slate-900" disabled={hasInsufficientMaterials}>Terminé</option>
                  </Select>
                  <Badge variant={statusVariant[currentStatus]} className="shadow-sm">{statusLabel[currentStatus]}</Badge>
                </div>
              </div>

              {/* Lot content */}
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">Avancement</span>
                    <span className="font-bold text-white">{currentProgress}%</span>
                  </div>
                  <Progress
                    value={currentProgress}
                    className="bg-white/10 h-2"
                    indicatorClassName={currentStatus === 'done' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}
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
                    onMouseUp={(e) => {
                      updateLot.mutate({ lotId: lot.id, status: currentStatus, completionPercent: Number(e.currentTarget.value) })
                    }}
                    onTouchEnd={(e) => {
                      updateLot.mutate({ lotId: lot.id, status: currentStatus, completionPercent: Number(e.currentTarget.value) })
                    }}
                    className="w-full accent-indigo-500 cursor-pointer mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 p-4 transition-colors hover:bg-white/10">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Machine</p>
                      <p className="text-sm font-semibold text-white mt-0.5">{lot.machine}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 p-4 transition-colors hover:bg-white/10">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Quantité</p>
                      <p className="text-sm font-semibold text-white mt-0.5">{lot.quantity} pcs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 p-4 transition-colors hover:bg-white/10">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Échéance lot</p>
                      <p className="text-sm font-semibold text-white mt-0.5">{new Date(lot.dueDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Matières premières</h3>
                  <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-black/20 text-xs text-slate-400 border-b border-white/10">
                          <th className="text-left px-4 py-3 font-semibold">Désignation</th>
                          <th className="text-left px-4 py-3 font-semibold">Référence</th>
                          <th className="text-right px-4 py-3 font-semibold">Requis</th>
                          <th className="text-right px-4 py-3 font-semibold">Disponible</th>
                          <th className="text-right px-4 py-3 font-semibold">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {lot.materials.map((mat) => {
                          const ok = mat.available >= mat.quantity
                          return (
                            <tr key={mat.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 font-medium text-white">{mat.name}</td>
                              <td className="px-4 py-3 text-slate-400 font-mono text-xs">{mat.reference}</td>
                              <td className="px-4 py-3 text-right text-slate-300">{mat.quantity} {mat.unit}</td>
                              <td className="px-4 py-3 text-right text-slate-300">{mat.available} {mat.unit}</td>
                              <td className="px-4 py-3 text-right">
                                <Badge variant={ok ? 'success' : 'error'} className={ok ? '' : 'shadow-[0_0_8px_rgba(239,68,68,0.3)]'}>
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

                <div className="flex justify-end gap-3 pt-2">
                  <Link to={`/incident/new?lot=${lot.id}`}>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 rounded-xl transition-all">
                      <AlertTriangle className="h-4 w-4" />
                      Signaler incident
                    </Button>
                  </Link>
                  {!lot.materials.every((mat) => mat.available >= mat.quantity) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-medium shadow-lg"
                      onClick={() => requestMats.mutate(lot.id)}
                      disabled={requestMats.isPending || currentStatus === 'done'}
                    >
                      {requestMats.isPending ? 'En cours...' : 'Demander les matières'}
                    </Button>
                  )}
                  <div 
                    title={hasInsufficientMaterials ? "Impossible de marquer terminé car les matériaux sont insuffisants" : undefined}
                    className={hasInsufficientMaterials ? "cursor-not-allowed inline-block" : "inline-block"}
                  >
                    <Button
                      size="sm"
                      className={`rounded-xl font-medium shadow-lg w-full ${hasInsufficientMaterials ? 'pointer-events-none' : ''}`}
                      disabled={currentStatus === 'done' || hasInsufficientMaterials}
                      onClick={() => {
                        setLotStatuses((prev) => ({ ...prev, [lot.id]: 'done' }))
                        setLotProgress((prev) => ({ ...prev, [lot.id]: 100 }))
                        updateLot.mutate({ lotId: lot.id, status: 'done', completionPercent: 100 })
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marquer terminé
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
