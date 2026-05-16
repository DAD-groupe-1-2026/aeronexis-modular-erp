import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setTokenProvider } from '@aeronexis-dynamics/api-client'
import type { User } from '@aeronexis-dynamics/shared-types'

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        set({ token, user })
        setTokenProvider(() => token)
      },
      logout: () => {
        set({ token: null, user: null })
        setTokenProvider(() => null)
      },
    }),
    { name: 'aeronexis-auth' },
  ),
)

// Rehydrate token provider on app start (persist reloads state from localStorage)
const { token } = useAuthStore.getState()
if (token) setTokenProvider(() => useAuthStore.getState().token)
