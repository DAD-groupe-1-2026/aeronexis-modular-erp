import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react'
import { Badge } from '@aeronexis-dynamics/ui'
import { Button } from '@aeronexis-dynamics/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QueryErrorAlert } from '@aeronexis-dynamics/ui'
import { getIncidentById, resolveIncident as resolveIncidentById } from '@/api/incidents'
import { getUserById } from '@/api/users'
import type { IncidentSeverity } from '@aeronexis-dynamics/shared-types'

const severityVariant: Record<IncidentSeverity, 'default' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'warning',
  high: 'error',
  critical: 'error',
}

const severityLabel: Record<IncidentSeverity, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute',
  critical: 'Critique',
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

export function IncidentDetailPage() {
  const { incidentId = '' } = useParams<{ incidentId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: incident, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['incidents', incidentId],
    queryFn: () => getIncidentById(incidentId),
    enabled: Boolean(incidentId),
  })
  const resolveIncident = useMutation({
    mutationFn: (id: string) => resolveIncidentById(id),
    onSuccess: (_resolvedIncident, id) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['incidents', id] })
      queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })
  const reportedBy = incident?.reportedBy ?? ''
  const { data: reporter } = useQuery({
    queryKey: ['users', reportedBy],
    queryFn: () => getUserById(reportedBy),
    enabled: Boolean(reportedBy),
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-slate-400 flex items-center gap-3">
        <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Chargement de l'incident...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 space-y-4">
        <QueryErrorAlert
          error={error}
          onRetry={() => refetch()}
          title="Erreur lors du chargement de l'incident"
        />
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium inline-block">← Retour au tableau de bord</Link>
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="p-8 space-y-4">
        <p className="text-slate-400">Incident introuvable.</p>
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium inline-block">← Retour au tableau de bord</Link>
      </div>
    )
  }

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="p-6 space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mt-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white tracking-tight">Incident {incident.id.slice(0, 8)}</h1>
            <Badge variant={severityVariant[incident.severity]}>{severityLabel[incident.severity]}</Badge>
            <Badge variant={incident.resolved ? 'success' : 'warning'} className={!incident.resolved ? 'shadow-[0_0_10px_rgba(245,158,11,0.2)]' : ''}>
              {incident.resolved ? 'Résolu' : 'Non résolu'}
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">Lot concerné : <strong className="text-white">{incident.lotReference}</strong></p>
        </div>
      </div>

      {/* Details card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-xl overflow-hidden"
      >
        <div className="px-6 py-4 bg-white/5 border-b border-white/10">
          <p className="text-sm font-bold text-white">Détails de l'incident</p>
        </div>
        <div className="p-6 space-y-6">
          {resolveIncident.isError && (
            <QueryErrorAlert
              error={resolveIncident.error}
              onRetry={() => resolveIncident.reset()}
              title="Échec de la résolution de l'incident"
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-xl">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Date de signalement</p>
                <p className="text-sm font-medium text-white mt-0.5">{new Date(incident.reportedAt).toLocaleString('fr-FR')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-xl">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Signalé par</p>
                <p className="text-sm font-medium text-white mt-0.5">{reporter ? `${reporter.firstName} ${reporter.lastName}` : 'Utilisateur inconnu'}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{incident.description}</p>
          </div>

          <div className="pt-2">
            {incident.resolved ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <CheckCircle2 className="h-5 w-5" />
                Incident déjà résolu
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-500/5 border border-amber-500/20 p-5 rounded-xl">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                  Incident en attente de résolution
                </div>
                <Button
                  onClick={() => resolveIncident.mutate(incident.id)}
                  disabled={resolveIncident.isPending}
                  className="gap-2 rounded-xl shadow-lg w-full sm:w-auto"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {resolveIncident.isPending ? 'Résolution...' : 'Marquer comme résolu'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
