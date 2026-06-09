import React from 'react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="mb-4 text-6xl font-bold text-slate-300">404</div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Page introuvable</h1>
      <p className="mb-6 max-w-md text-slate-500">
        Oups, il semble que la page que vous recherchez n'existe pas ou que vous ayez été redirigé vers une application métier qui n'est pas lancée sur ce port.
      </p>
      <Link
        to="/"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}
