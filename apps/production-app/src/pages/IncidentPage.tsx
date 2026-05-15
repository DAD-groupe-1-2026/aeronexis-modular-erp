import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select, Label } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { mockWorkOrders } from '@/data/mock'

const allLots = mockWorkOrders.flatMap((wo) => wo.lots)

const severityConfig = {
  low: { label: 'Faible', description: 'Variation mineure, dans la tolérance.', color: 'secondary' as const },
  medium: { label: 'Moyenne', description: 'Défaut visible, impact partiel.', color: 'warning' as const },
  high: { label: 'Haute', description: 'Arrêt nécessaire, impact production.', color: 'destructive' as const },
  critical: { label: 'Critique', description: 'Danger potentiel, arrêt immédiat.', color: 'destructive' as const },
}

export function IncidentPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const preselectedLotId = searchParams.get('lot') ?? ''
  const [lotId, setLotId] = useState(preselectedLotId)
  const [severity, setSeverity] = useState<keyof typeof severityConfig>('medium')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lotId || !description.trim()) return
    setSubmitted(true)
  }

  if (submitted) {
    const lot = allLots.find((l) => l.id === lotId)
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold">Incident signalé</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          L'incident sur le lot <span className="font-medium">{lot?.reference}</span> a été enregistré et transmis au responsable de production.
        </p>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={() => { setSubmitted(false); setDescription('') }}>
            Nouveau signalement
          </Button>
          <Button onClick={() => navigate('/')}>Retour au tableau de bord</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Signaler un incident</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Documenter une anomalie ou un dysfonctionnement sur un lot</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Lot selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lot concerné</CardTitle>
            <CardDescription>Sélectionnez le lot sur lequel l'incident a été constaté</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              required
            >
              <option value="">-- Choisir un lot --</option>
              {mockWorkOrders.map((wo) => (
                <optgroup key={wo.id} label={`${wo.reference} – ${wo.clientName}`}>
                  {wo.lots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.reference} – {lot.product}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </CardContent>
        </Card>

        {/* Severity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Niveau de sévérité</CardTitle>
            <CardDescription>Évaluez l'impact de l'incident sur la production</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {(Object.entries(severityConfig) as [keyof typeof severityConfig, typeof severityConfig[keyof typeof severityConfig]][]).map(
              ([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSeverity(key)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    severity === key
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{cfg.label}</span>
                    <Badge variant={cfg.color} className="text-[10px]">{cfg.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{cfg.description}</p>
                </button>
              ),
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description de l'incident</CardTitle>
            <CardDescription>Décrivez précisément ce qui a été observé, les conditions et les pièces concernées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Ex : Défaut de surface détecté sur 3 pièces, rayures superficielles côté bague. Machine CNC-07, usinage série 32 à 48..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reporter">Signalé par</Label>
              <Input id="reporter" value="Martin Dupont" disabled className="bg-muted/40" />
            </div>
          </CardContent>
        </Card>

        {/* Warning banner for high/critical */}
        {(severity === 'high' || severity === 'critical') && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Incident {severity === 'critical' ? 'critique' : 'haute sévérité'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assurez-vous d'avoir arrêté ou mis en pause la machine concernée avant de soumettre ce signalement.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link to="/">
            <Button type="button" variant="outline">Annuler</Button>
          </Link>
          <Button type="submit" disabled={!lotId || !description.trim()} className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Soumettre le signalement
          </Button>
        </div>
      </form>
    </div>
  )
}
