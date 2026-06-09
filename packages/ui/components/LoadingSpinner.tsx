import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ className, size = 24, text, fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3 text-indigo-400", className)}>
      <Loader2 size={size} className="animate-spin" />
      {text && <p className="text-sm font-medium animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0c]/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
