import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Flame, ChevronRight } from 'lucide-react'
import { Badge } from '@aeronexis-dynamics/ui'
import { Input, Select } from '@/components/Form'
import { Progress } from '@/components/Progress'
import { useQuery } from '@tanstack/react-query'
import { QueryErrorAlert } from '@aeronexis-dynamics/ui'
import { getOrders } from '@/api/orders'
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

export function OrdersPage() {
  const { data: orders = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['orders'], queryFn: getOrders })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LotStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'normal'>('all')

  const filtered = orders.filter((wo) => {
    const matchSearch =
      wo.reference.toLowerCase().includes(search.toLowerCase()) ||
      wo.clientName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || wo.status === statusFilter
    const matchPriority = priorityFilter === 'all' || wo.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-slate-400 flex items-center gap-3">
        <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Chargement des ordres...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8">
        <QueryErrorAlert
          error={error}
          onRetry={() => refetch()}
          title="Erreur lors du chargement des ordres"
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
      className="p-6 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Ordres de fabrication</h1>
        <p className="text-sm text-slate-400 mt-1">{orders.length} ordres au total</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-4 p-4 rounded-2xl border border-white/10 bg-[#0a0a0c]/40 backdrop-blur-2xl shadow-xl"
      >
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher par référence ou client..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/50 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LotStatus | 'all')}
          className="w-44 bg-white/5 border-white/10 text-white rounded-xl focus:border-indigo-500/50 focus:ring-indigo-500/50"
        >
          <option value="all" className="bg-slate-900">Tous les statuts</option>
          <option value="planned" className="bg-slate-900">Planifié</option>
          <option value="in_progress" className="bg-slate-900">En cours</option>
          <option value="done" className="bg-slate-900">Terminé</option>
        </Select>
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'urgent' | 'normal')}
          className="w-40 bg-white/5 border-white/10 text-white rounded-xl focus:border-indigo-500/50 focus:ring-indigo-500/50"
        >
          <option value="all" className="bg-slate-900">Toutes priorités</option>
          <option value="urgent" className="bg-slate-900">Urgent</option>
          <option value="normal" className="bg-slate-900">Normal</option>
        </Select>
      </motion.div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-12">Aucun ordre trouvé.</p>
        )}
        {filtered.map((wo, index) => {
          const totalLots = wo.lots.length
          const doneLots = wo.lots.filter((l) => l.status === 'done').length
          const avgProgress = wo.lots.reduce((sum, l) => sum + l.completionPercent, 0) / (totalLots || 1)
          return (
            <Link key={wo.id} to={`/orders/${wo.id}`} className="block">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * Math.min(index, 5) }}
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(10, 10, 12, 0.6)' }}
                className="rounded-2xl border border-white/10 bg-[#0a0a0c]/40 backdrop-blur-2xl shadow-xl transition-all cursor-pointer p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-white text-lg">{wo.reference}</span>
                      {wo.priority === 'urgent' && (
                        <Badge variant="error" className="gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                          <Flame className="h-3.5 w-3.5" /> Urgent
                        </Badge>
                      )}
                      <Badge variant={statusVariant[wo.status]}>{statusLabel[wo.status]}</Badge>
                    </div>
                    <p className="text-sm text-slate-400">{wo.clientName}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">
                          {doneLots} / {totalLots} lots terminés
                        </span>
                        <span className="font-semibold text-white">{Math.round(avgProgress)}%</span>
                      </div>
                      <Progress
                        value={avgProgress}
                        className="bg-white/10"
                        indicatorClassName={wo.status === 'done' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}
                      />
                    </div>
                    <div className="flex gap-6 text-sm text-slate-500 pt-1">
                      <span>Créé le <strong className="text-slate-300 font-medium">{new Date(wo.createdAt).toLocaleDateString('fr-FR')}</strong></span>
                      <span>Échéance : <strong className="text-slate-300 font-medium">{new Date(wo.dueDate).toLocaleDateString('fr-FR')}</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {wo.lots.map((lot) => (
                        <span
                          key={lot.id}
                          className="inline-flex items-center rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-medium text-slate-300"
                        >
                          {lot.reference}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors mt-2">
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}
