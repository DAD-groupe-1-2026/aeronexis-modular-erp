import { Toaster as SonnerToaster } from 'sonner';

export function ToastProvider() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        className: 'bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 text-slate-200 shadow-2xl',
        descriptionClassName: 'text-slate-400',
        style: {
          background: 'rgba(10, 10, 12, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#e2e8f0',
        },
      }}
    />
  );
}

// Re-export toast from sonner so apps can use it directly
export { toast } from 'sonner';
