import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@aeronexis-dynamics/ui'
import { Textarea, Select, Label } from '@/components/Form'
import { Badge } from '@aeronexis-dynamics/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QueryErrorAlert } from '@aeronexis-dynamics/ui'
import { getOrders } from '@/api/orders'
import { createIncident } from '@/api/incidents'
import type { IncidentSeverity } from '@aeronexis-dynamics/shared-types'

const severityConfig: Record<
  IncidentSeverity,
  { label: string; description: string; color: 'default' | 'warning' | 'error' }
> = {
  low: { label: 'Faible', description: 'Variation mineure, dans la tolérance.', color: 'default' },
  medium: { label: 'Moyenne', description: 'Défaut visible, impact partiel.', color: 'warning' },
  high: { label: 'Haute', description: 'Arrêt nécessaire, impact production.', color: 'error' },
  critical: { label: 'Critique', description: 'Danger potentiel, arrêt immédiat.', color: 'error' },
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

export function IncidentPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: orders = [], isError: ordersError, error: ordersErr, refetch: refetchOrders } = useQuery({ queryKey: ['orders'], queryFn: getOrders })
  const reportIncident = useMutation({
    mutationFn: (payload: { lotId: string; severity: IncidentSeverity; description: string }) => createIncident(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })

  const allLots = orders.flatMap((wo) => wo.lots)
  const [lotId, setLotId] = useState(searchParams.get('lot') ?? '')
  const [severity, setSeverity] = useState<IncidentSeverity>('medium')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lotId || !description.trim()) return
    reportIncident.mutate({ lotId, severity, description })
  }

  if (reportIncident.isSuccess) {
    const lot = allLots.find((l) => l.id === lotId)
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Incident signalé</h2>
        <p className="text-slate-400 max-w-sm text-sm">
          L'incident sur le lot <span className="font-medium text-white">{lot?.reference}</span> a été enregistré
          et transmis au responsable de production.
        </p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={() => { reportIncident.reset(); setDescription('') }}>
            Nouveau signalement
          </Button>
          <Button onClick={() => navigate('/')}>Retour au tableau de bord</Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="p-6 space-y-6 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Signaler un incident</h1>
          <p className="text-sm text-slate-400 mt-1">
            Documenter une anomalie ou un dysfonctionnement sur un lot
          </p>
        </div>
      </div>

      {ordersError && (
        <QueryErrorAlert
          error={ordersErr}
          onRetry={() => refetchOrders()}
          title="Erreur lors du chargement des lots"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lot */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-xl overflow-hidden"
        >
          <div className="px-6 py-4 bg-white/5 border-b border-white/10">
            <p className="text-sm font-bold text-white">Lot concerné</p>
            <p className="text-xs text-slate-400 mt-1">Sélectionnez le lot sur lequel l'incident a été constaté</p>
          </div>
          <div className="p-6">
            <Select 
              value={lotId} 
              onChange={(e) => setLotId(e.target.value)} 
              required
              className="bg-white/5 border-white/10 text-white focus:border-indigo-500/50 focus:ring-indigo-500/50 rounded-xl"
            >
              <option value="" className="bg-slate-900">-- Choisir un lot --</option>
              {orders.map((wo) => (
                <optgroup key={wo.id} label={`${wo.reference} – ${wo.clientName}`} className="bg-slate-900 text-slate-300">
                  {wo.lots.map((lot) => (
                    <option key={lot.id} value={lot.id} className="bg-slate-900">
                      {lot.reference} – {lot.product}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </div>
        </motion.div>

        {/* Severity */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-xl overflow-hidden"
        >
          <div className="px-6 py-4 bg-white/5 border-b border-white/10">
            <p className="text-sm font-bold text-white">Niveau de sévérité</p>
            <p className="text-xs text-slate-400 mt-1">Évaluez l'impact de l'incident sur la production</p>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            {(Object.entries(severityConfig) as [IncidentSeverity, typeof severityConfig[IncidentSeverity]][]).map(
              ([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSeverity(key)}
                  className={`rounded-xl border p-4 text-left transition-all duration-300 ${
                    severity === key
                      ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/5 bg-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-white">{cfg.label}</span>
                    <Badge variant={cfg.color} className="text-[10px]">{cfg.label}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{cfg.description}</p>
                </button>
              ),
            )}
          </div>
        </motion.div>

        {/* Description */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-xl overflow-hidden"
        >
          <div className="px-6 py-4 bg-white/5 border-b border-white/10">
            <p className="text-sm font-bold text-white">Description</p>
            <p className="text-xs text-slate-400 mt-1">
              Décrivez précisément ce qui a été observé, les conditions et les pièces concernées
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">Description détaillée *</Label>
              <Textarea
                id="description"
                placeholder="Ex : Défaut de surface détecté sur 3 pièces, rayures superficielles côté bague..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/50 rounded-xl"
                required
              />
            </div>
          </div>
        </motion.div>

        {(severity === 'high' || severity === 'critical') && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-5 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
          >
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-400">
                Incident {severity === 'critical' ? 'critique' : 'haute sévérité'}
              </p>
              <p className="text-xs text-red-300/70 mt-1 leading-relaxed">
                Assurez-vous d'avoir arrêté ou mis en pause la machine concernée avant de soumettre.
              </p>
            </div>
          </motion.div>
        )}

        {reportIncident.isError && (
          <QueryErrorAlert
            error={reportIncident.error}
            onRetry={() => reportIncident.reset()}
            title="Échec de l'envoi du signalement"
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/"><Button type="button" variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/10 rounded-xl">Annuler</Button></Link>
          <Button
            type="submit"
            disabled={!lotId || !description.trim() || reportIncident.isPending}
            className="gap-2 rounded-xl shadow-lg"
          >
            <AlertTriangle className="h-4 w-4" />
            {reportIncident.isPending ? 'Envoi...' : 'Soumettre le signalement'}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
