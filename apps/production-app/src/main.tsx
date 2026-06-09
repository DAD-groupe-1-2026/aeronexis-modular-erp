import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { setTokenProvider } from '@aeronexis-dynamics/api-client'
import { useAuthStore } from '@aeronexis-dynamics/auth'

setTokenProvider(() => useAuthStore.getState().token)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
