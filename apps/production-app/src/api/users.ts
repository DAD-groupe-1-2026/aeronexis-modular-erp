import type { User } from '@aeronexis-dynamics/shared-types'
import { apiClient } from '@aeronexis-dynamics/api-client'

export async function getUserById(id: string): Promise<User> {
  const res = await apiClient.get<User>(`/auth/users/${id}`)
  if (res.status === 'failure') throw new Error(res.error?.message)
  return res.data
}
