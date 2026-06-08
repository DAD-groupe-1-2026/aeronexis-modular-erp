import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from './cn'
import { getErrorMessage } from './errors'

export interface QueryErrorAlertProps {
  error: unknown
  onRetry?: () => void
  retryLabel?: string
  title?: string
  className?: string
}

export function QueryErrorAlert({
  error,
  onRetry,
  retryLabel = 'Réessayer',
  title = 'Impossible de charger les données',
  className,
}: QueryErrorAlertProps) {
  const message = getErrorMessage(error)

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4',
        className,
      )}
    >
      <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" aria-hidden />
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium text-destructive">{title}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={() => onRetry()}
            className={cn(
              'mt-2 inline-flex h-8 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            )}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  )
}
