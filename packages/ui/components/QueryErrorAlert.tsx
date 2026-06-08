import { AlertCircle, RefreshCw } from 'lucide-react';
import { getErrorMessage } from '../utils/error';
import { cn } from '../utils/cn';

interface QueryErrorAlertProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

export function QueryErrorAlert({ error, onRetry, title = 'Erreur de chargement', className }: QueryErrorAlertProps) {
  const message = getErrorMessage(error);

  return (
    <div className={cn("bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start space-x-3 text-red-400", className)}>
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="text-sm font-semibold mb-1">{title}</h3>
        <p className="text-sm leading-relaxed opacity-90">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20 ml-4 group"
          title="Réessayer"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      )}
    </div>
  );
}
