import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setTokenProvider } from '@aeronexis-dynamics/api-client'
import { useAuthStore } from '@aeronexis-dynamics/auth'

setTokenProvider(() => useAuthStore.getState().token)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
