import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardList, AlertTriangle, CheckCircle2, ArrowUpRight, Search } from 'lucide-react'
import { Input } from '@/components/Form'
import { useQuery } from '@tanstack/react-query'
import { QueryErrorAlert } from '@aeronexis-dynamics/ui'
import { getHistory } from '@/api/incidents'
import type { HistoryEntry } from '@aeronexis-dynamics/shared-types'

const actionIcon: Record<string, React.ReactNode> = {
  'Statut mis à jour': <ClipboardList className="h-4 w-4 text-indigo-400" />,
  'Avancement mis à jour': <ClipboardList className="h-4 w-4 text-indigo-400" />,
  'Incident signalé': <AlertTriangle className="h-4 w-4 text-amber-400" />,
  'Incident résolu': <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
}

function groupByDate(entries: HistoryEntry[]) {
  const groups: Record<string, HistoryEntry[]> = {}
  for (const entry of entries) {
    const date = new Date(entry.performedAt).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(entry)
  }
  return groups
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

export function HistoryPage() {
  const { data: history = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['history'], queryFn: getHistory })
  const [search, setSearch] = useState('')

  const filtered = history.filter(
    (entry) =>
      entry.action.toLowerCase().includes(search.toLowerCase()) ||
      entry.target.toLowerCase().includes(search.toLowerCase()) ||
      (entry.detail ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  const grouped = groupByDate(filtered)

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-slate-400 flex items-center gap-3">
        <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Chargement de l'historique...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8">
        <QueryErrorAlert
          error={error}
          onRetry={() => refetch()}
          title="Erreur lors du chargement de l'historique"
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
        <h1 className="text-2xl font-bold text-white tracking-tight">Historique</h1>
        <p className="text-sm text-slate-400 mt-1">
          Toutes les actions enregistrées – {history.length} entrées
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Rechercher dans l'historique..."
          className="pl-10 bg-[#0a0a0c]/40 backdrop-blur-2xl border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/50 rounded-xl shadow-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {filtered.length === 0 && (
        <p className="text-center text-slate-500 py-12">Aucune entrée trouvée.</p>
      )}

      <div className="space-y-8">
        {Object.entries(grouped).map(([date, entries], groupIndex) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (groupIndex * 0.1) }}
            key={date}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 ml-2 capitalize">
              {date}
            </h2>
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0c]/40 backdrop-blur-2xl shadow-xl overflow-hidden divide-y divide-white/5">
              {entries.map((entry, entryIndex) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (groupIndex * 0.1) + (entryIndex * 0.05) }}
                  key={entry.id}
                  className="flex items-start gap-4 p-5 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/5 mt-0.5 group-hover:scale-110 transition-transform duration-300">
                    {actionIcon[entry.action] ?? <ClipboardList className="h-4 w-4 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{entry.action}</p>
                      <span className="text-xs font-medium text-slate-500 shrink-0">
                        {new Date(entry.performedAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-mono bg-white/10 text-slate-300 border border-white/10 px-2 py-0.5 rounded-md">
                        {entry.target}
                      </span>
                      <Link
                        to={`/orders/${entry.targetId}`}
                        className="text-slate-500 hover:text-indigo-400 transition-colors"
                        title="Voir l'ordre de fabrication"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    {entry.detail && (
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{entry.detail}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
