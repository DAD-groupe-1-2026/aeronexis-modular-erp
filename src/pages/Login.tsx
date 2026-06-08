import React, { useState } from 'react';
import { apiClient } from '@aeronexis-dynamics/api-client';
import { User } from '@aeronexis-dynamics/shared-types';
import { useAuthStore } from '@aeronexis-dynamics/auth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await apiClient.post<{user: User, token: string}>('/auth/login', { email, password });
      
      if (res.status === 'success' && res.data) {
        setAuth(res.data.user, res.data.token);
        window.location.assign('/'); 
      } else {
        setError(res.error?.message || 'Erreur d\'authentification');
      }
    } catch (err) {
      setError('Impossible de joindre le serveur d\'authentification');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', backgroundColor: '#050505', color: '#E0E0E5', fontFamily: '"Helvetica Neue", Arial, sans-serif', overflow: 'hidden' }}>
      {/* Branding Side - Left Column */}
      <div style={{ flex: 1.2, background: 'linear-gradient(135deg, #050505 0%, #0a0a0f 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', position: 'relative', borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0.5px)', backgroundSize: '30px 30px', WebkitMaskImage: 'linear-gradient(to right, black, transparent)', maskImage: 'linear-gradient(to right, black, transparent)' }}></div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '100px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '40px' }}>
            <span style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }}></span> Gateway Active
          </div>
          <div style={{ fontSize: '14px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#3b82f6', fontWeight: 700, marginBottom: '24px' }}>Aeronexis Dynamics</div>
          <h1 style={{ fontSize: '72px', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-2px', color: '#FFFFFF', margin: 0 }}>
            Unified<br/>Access<br/><span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>Control.</span>
          </h1>
        </div>
        <div style={{ position: 'absolute', bottom: '40px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.2)', letterSpacing: '0.05em', display: 'flex', gap: '24px' }}>
          <span>ERP INTEGRATION V4.0</span>
          <span>SECURE SESSION AUTH</span>
          <span>PORTAL-APP NODE</span>
        </div>
      </div>

      {/* Login Side - Right Column */}
      <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#08080a' }}>
        <div style={{ width: '380px', padding: '48px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 400, color: '#FFFFFF', marginBottom: '8px', marginTop: 0 }}>Central Login</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.5, margin: 0 }}>Enterprise authentication required. Your session will be routed based on your organizational role.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '16px', fontWeight: 500 }}>{error}</div>}
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '8px', fontWeight: 600 }}>Email Address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@aeronexis.com" style={{ width: '100%', background: '#121216', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', padding: '14px 16px', color: 'white', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '8px', fontWeight: 600 }}>Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" style={{ width: '100%', background: '#121216', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', padding: '14px 16px', color: 'white', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <button type="submit" style={{ width: '100%', background: '#FFFFFF', color: '#000000', border: 'none', borderRadius: '4px', padding: '16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Authenticate</button>
            
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.3)', marginTop: '32px', textAlign: 'center', lineHeight: '1.6' }}>
                Managed by Aeronexis Core Services<br />
                <strong>Comptes de test (mot de passe libre):</strong><br />
                operator, logistics, sales, admin (@aeronexis.com)
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
