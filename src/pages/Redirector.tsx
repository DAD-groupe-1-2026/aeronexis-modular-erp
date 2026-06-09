import { useEffect } from 'react';
import { useAuthStore, isAuthBypassed } from '@aeronexis-dynamics/auth';

export const Redirector = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (isAuthBypassed()) {
        document.body.innerHTML = `<div style="padding:2rem; font-family: monospace; color: white; background: #0f172a; height: 100vh;">Auth Bypassed. Redirecting to VITE_APP_URL_OPERATOR...<br/><button onclick="window.location.href='/login'">Force Login</button></div>`;
        return;
    }

    if (!user) {
      window.location.assign('/login');
      return;
    }

    let url = '/';
    switch (user.role) {
      case 'operator': url = import.meta.env.VITE_APP_URL_OPERATOR || '/production/dashboard'; break;
      case 'logistics': url = import.meta.env.VITE_APP_URL_LOGISTICS || '/logistics/'; break;
      case 'sales': url = import.meta.env.VITE_APP_URL_SALES || '/sales/'; break;
      case 'director':
      case 'admin': url = import.meta.env.VITE_APP_URL_ADMIN || '/admin/'; break;
    }
    
    document.body.innerHTML = `<div style="padding:2rem; font-family: sans-serif; color: white; background: #0f172a; min-height: 100vh;">
      <h2>Redirecting to Application</h2>
      <p>Role: <strong>${user.role}</strong></p>
      <p>Target URL: <code style="padding: 0.2rem 0.4rem; background: #1e293b; border-radius: 4px">${url}</code></p>
      <br/>
      <button style="padding: 0.5rem 1rem; background: #3b82f6; border: none; color: white; border-radius: 4px; cursor: pointer" onclick="localStorage.removeItem('aeronexis-auth'); window.location.href='/login'">Logout & Restart (Reset Mock)</button>
    </div>`;

  }, [user]);

  return null;
};
