import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, AlertTriangle, CheckCircle2, ArrowUpRight, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/form'
import { mockHistory } from '@/data/mock'

const actionIcon: Record<string, React.ReactNode> = {
  'Statut mis à jour': <ClipboardList className="h-4 w-4 text-blue-500" />,
  'Avancement mis à jour': <ClipboardList className="h-4 w-4 text-blue-500" />,
  'Incident signalé': <AlertTriangle className="h-4 w-4 text-amber-500" />,
  'Incident résolu': <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
}

function groupByDate(entries: typeof mockHistory) {
  const groups: Record<string, typeof mockHistory> = {}
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

export function HistoryPage() {
  const [search, setSearch] = useState('')

  const filtered = mockHistory.filter(
    (entry) =>
      entry.action.toLowerCase().includes(search.toLowerCase()) ||
      entry.target.toLowerCase().includes(search.toLowerCase()) ||
      (entry.detail ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  const grouped = groupByDate(filtered)

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historique</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Toutes les actions réalisées par Martin Dupont – {mockHistory.length} entrées
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher dans l'historique..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">Aucune entrée trouvée.</p>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 capitalize">
              {date}
            </h2>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary mt-0.5">
                      {actionIcon[entry.action] ?? <ClipboardList className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{entry.action}</p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(entry.performedAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-mono bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                          {entry.target}
                        </span>
                        <Link
                          to={`/orders/${entry.targetId}`}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                      {entry.detail && (
                        <p className="text-xs text-muted-foreground mt-1">{entry.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
