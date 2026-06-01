import type { ApiResponse, ApiError } from '@aeronexis-dynamics/shared-types'

// ─── Couche 2 : Middleware applicatif — Normalisation des messages ────────────
//
// Toutes les communications entre la couche 1 (apps) et la couche 3 (gateway)
// transitent par ce client. Chaque réponse est normalisée au format :
//   { status: 'success' | 'failure' | 'pending', data, error? }
//
// Ce contrat est partagé avec le backend via @aeronexis-dynamics/shared-types.

/**
 * Alias explicite pour le format de message normalisé utilisé dans toute
 * la communication inter-couches. Identique à ApiResponse<T> — le nom
 * reflète son rôle architectural dans la couche middleware applicatif.
 */
export type NormalizedMessage<T> = ApiResponse<T>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DEFAULT_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || 'http://localhost'

let tokenProvider: (() => string | null) | null = null

/**
 * Register a function that returns the current JWT token.
 * Called by the auth store so the client never holds a direct reference.
 */
export function setTokenProvider(fn: () => string | null): void {
  tokenProvider = fn
}

function buildHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers({ 'Content-Type': 'application/json', ...extra })
  const token = tokenProvider?.()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return headers
}

async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  if (res.ok) {
    const body = await res.json()
    // Si le backend renvoie déjà le format normalisé ApiResponse, on le retourne tel quel
    if (body && typeof body === 'object' && 'status' in body && 'data' in body) {
      return body as ApiResponse<T>
    }
    // Sinon, on wrap la donnée (fallback)
    return { status: 'success', data: body as T }
  }

  let error: ApiError = { code: String(res.status), message: res.statusText }
  try {
    const body = await res.json()
    if (body?.error) {
      error = body.error
    } else if (body?.code && body?.message) {
      error = body as ApiError
    }
  } catch {
    // keep default error
  }

  return {
    status: 'failure',
    data: null as unknown as T,
    error,
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${DEFAULT_BASE_URL}${path}`, {
      method,
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    return parseResponse<T>(res)
  } catch (err) {
    return {
      status: 'failure',
      data: null as unknown as T,
      error: {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Unknown network error',
      },
    }
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
