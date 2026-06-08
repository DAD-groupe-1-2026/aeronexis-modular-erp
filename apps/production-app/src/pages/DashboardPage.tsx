import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ClipboardList,
  ArrowRight,
  Flame,
} from 'lucide-react'
import { Badge } from '@aeronexis-dynamics/ui'
import { Button } from '@aeronexis-dynamics/ui'
import { Progress } from '@/components/Progress'
import { IncidentBadge } from '@/components/IncidentBadge'
import { useQuery } from '@tanstack/react-query'
import { QueryErrorAlert } from '@aeronexis-dynamics/ui'
import { getOrders } from '@/api/orders'
import { getIncidents } from '@/api/incidents'

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

function StatCard({
  icon: Icon,
  value,
  label,
  iconClass,
  iconBg,
  delay = 0
}: {
  icon: React.ElementType
  value: number
  label: string
  iconClass: string
  iconBg: string
  delay?: number
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="rounded-2xl border border-white/10 bg-[#0a0a0c]/40 backdrop-blur-2xl px-5 py-5 flex items-center gap-4 shadow-xl"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} border border-white/5`}>
        <Icon className={`h-6 w-6 ${iconClass}`} />
      </div>
      <div>
        <p className="text-3xl font-bold text-white leading-none tracking-tight">{value}</p>
        <p className="text-sm text-slate-400 mt-1.5">{label}</p>
      </div>
    </motion.div>
  )
}

export function DashboardPage() {
  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErr,
    refetch: refetchOrders,
  } = useQuery({ queryKey: ['orders'], queryFn: getOrders })

  const {
    data: incidents = [],
    isLoading: incidentsLoading,
    isError: incidentsError,
    error: incidentsErr,
    refetch: refetchIncidents,
  } = useQuery({ queryKey: ['incidents'], queryFn: getIncidents })

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
      <div className="p-8 text-sm text-slate-400 flex items-center gap-3">
        <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Chargement du tableau de bord...
      </div>
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
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="p-6 space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Tableau de bord</h1>
        <p className="text-slate-400 text-sm mt-1">
          Vue d'ensemble de la journée –{' '}
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          value={stats.total}
          label="Lots au total"
          iconClass="text-blue-400"
          iconBg="bg-blue-500/20"
          delay={0.1}
        />
        <StatCard
          icon={Clock}
          value={stats.inProgress}
          label="En cours"
          iconClass="text-amber-400"
          iconBg="bg-amber-500/20"
          delay={0.2}
        />
        <StatCard
          icon={CheckCircle2}
          value={stats.done}
          label="Terminés"
          iconClass="text-emerald-400"
          iconBg="bg-emerald-500/20"
          delay={0.3}
        />
        <StatCard
          icon={AlertTriangle}
          value={stats.openIncidents}
          label="Incidents ouverts"
          iconClass="text-red-400"
          iconBg="bg-red-500/20"
          delay={0.4}
        />
      </div>

      {/* Main panels */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Urgent orders */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-[#0a0a0c]/40 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
              <div className="p-1.5 bg-red-500/20 rounded-md">
                <Flame className="h-4 w-4 text-red-400" />
              </div>
              Ordres urgents en cours
            </div>
            <Link to="/orders">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                Voir tout <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="p-6 space-y-4 flex-1">
            {urgentOrders.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">Aucun ordre urgent</p>
            )}
            {urgentOrders.map((wo) => {
              const totalLots = wo.lots.length
              const doneLots = wo.lots.filter((l) => l.status === 'done').length
              const avgProgress =
                wo.lots.reduce((sum, l) => sum + l.completionPercent, 0) / (totalLots || 1)
              return (
                <Link key={wo.id} to={`/orders/${wo.id}`} className="block">
                  <motion.div 
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-white">{wo.reference}</span>
                      <Badge variant="error" className="text-[10px] px-2 py-0.5 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        Urgent
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">{wo.clientName}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">{doneLots}/{totalLots} lots</span>
                        <span className="font-medium text-white">{Math.round(avgProgress)}%</span>
                      </div>
                      <Progress value={avgProgress} className="bg-white/10" indicatorClassName="bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    </div>
                    <p className="text-xs text-slate-500 pt-1">
                      Échéance : {new Date(wo.dueDate).toLocaleDateString('fr-FR')}
                    </p>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* Active incidents */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-[#0a0a0c]/40 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center gap-2.5 px-6 py-4 bg-white/5 border-b border-white/10">
            <div className="p-1.5 bg-amber-500/20 rounded-md">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-sm font-semibold text-white">Incidents non résolus</span>
          </div>
          <div className="p-6 space-y-4 flex-1">
            {activeIncidents.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">Aucun incident ouvert</p>
            )}
            {activeIncidents.map((inc) => (
              <Link key={inc.id} to={`/incident/new?lot=${inc.lotReference}`} className="block">
                <motion.div 
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-white">{inc.lotReference}</span>
                    <IncidentBadge severity={inc.severity} />
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{inc.description}</p>
                  <p className="text-xs text-slate-500 pt-1">
                    {new Date(inc.reportedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}