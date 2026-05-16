import type { ApiResponse, ApiError } from '@aeronexis-dynamics/shared-types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DEFAULT_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || 'http://localhost:3000'

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
    const data = (await res.json()) as T
    return { status: 'success', data }
  }

  let error: ApiError = { code: String(res.status), message: res.statusText }
  try {
    const body = await res.json()
    if (body?.code && body?.message) error = body as ApiError
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
