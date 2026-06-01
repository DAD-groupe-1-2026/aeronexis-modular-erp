export const isAuthBypassed = (): boolean =>
  import.meta.env.VITE_AUTH_BYPASS === 'true'
