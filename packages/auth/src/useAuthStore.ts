import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setTokenProvider } from '@aeronexis-dynamics/api-client'
import type { User } from '@aeronexis-dynamics/shared-types'
import { isAuthBypassed } from './authConfig'

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  logout: () => void
}

export const DEV_MOCK_USER: User = {
  id: 'dev-user-001',
  firstName: 'Martin',
  lastName: 'Dupont',
  email: 'martin.dupont@aeronexis.com',
  role: 'operator',
}

const DEV_MOCK_TOKEN = 'dev-bypass-token'

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
const { token, setAuth } = useAuthStore.getState()
if (token) {
  setTokenProvider(() => useAuthStore.getState().token)
} else if (isAuthBypassed()) {
  setAuth(DEV_MOCK_TOKEN, DEV_MOCK_USER)
}
