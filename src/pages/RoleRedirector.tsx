import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@aeronexis-dynamics/auth';

export function RoleRedirector() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    let url = '/';
    switch (user.role) {
      case 'operator':
        url = import.meta.env.VITE_APP_URL_OPERATOR || '/production/';
        break;
      case 'logistics':
        url = import.meta.env.VITE_APP_URL_LOGISTICS || '/logistics/';
        break;
      case 'sales':
        url = import.meta.env.VITE_APP_URL_SALES || '/sales/';
        break;
      case 'admin':
      case 'director':
        url = import.meta.env.VITE_APP_URL_ADMIN || '/admin/';
        break;
    }
    
    window.location.assign(url);
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-slate-500 animate-pulse font-medium">Redirection en cours...</div>
    </div>
  );
}
