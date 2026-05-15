import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Flame, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/form'
import { Select } from '@/components/ui/form'
import { Progress } from '@/components/ui/progress'
import { mockWorkOrders } from '@/data/mock'
import type { LotStatus } from '@/types'

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

export function OrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LotStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'normal'>('all')

  const filtered = mockWorkOrders.filter((wo) => {
    const matchSearch =
      wo.reference.toLowerCase().includes(search.toLowerCase()) ||
      wo.clientName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || wo.status === statusFilter
    const matchPriority = priorityFilter === 'all' || wo.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ordres de fabrication</h1>
        <p className="text-sm text-muted-foreground mt-1">{mockWorkOrders.length} ordres au total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par référence ou client..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LotStatus | 'all')}
          className="w-44"
        >
          <option value="all">Tous les statuts</option>
          <option value="planned">Planifié</option>
          <option value="in_progress">En cours</option>
          <option value="done">Terminé</option>
        </Select>
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'urgent' | 'normal')}
          className="w-40"
        >
          <option value="all">Toutes priorités</option>
          <option value="urgent">Urgent</option>
          <option value="normal">Normal</option>
        </Select>
      </div>

      {/* Order list */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Aucun ordre trouvé.</p>
        )}
        {filtered.map((wo) => {
          const totalLots = wo.lots.length
          const doneLots = wo.lots.filter((l) => l.status === 'done').length
          const avgProgress = wo.lots.reduce((sum, l) => sum + l.completionPercent, 0) / totalLots
          return (
            <Link key={wo.id} to={`/orders/${wo.id}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-semibold">{wo.reference}</span>
                        {wo.priority === 'urgent' && (
                          <Badge variant="destructive" className="gap-1">
                            <Flame className="h-3 w-3" /> Urgent
                          </Badge>
                        )}
                        <Badge variant={statusVariant[wo.status]}>
                          {statusLabel[wo.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{wo.clientName}</p>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{doneLots} / {totalLots} lots terminés</span>
                          <span className="font-medium">{Math.round(avgProgress)}%</span>
                        </div>
                        <Progress
                          value={avgProgress}
                          indicatorClassName={wo.status === 'done' ? 'bg-emerald-500' : undefined}
                        />
                      </div>

                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Créé le {new Date(wo.createdAt).toLocaleDateString('fr-FR')}</span>
                        <span>Échéance : {new Date(wo.dueDate).toLocaleDateString('fr-FR')}</span>
                      </div>

                      {/* Lot chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {wo.lots.map((lot) => (
                          <span
                            key={lot.id}
                            className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                          >
                            {lot.reference}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
