export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const RETRY_DELAYS_MS = [500, 1000, 2000] as const

function isNetworkError(err: unknown): boolean {
  // Browser surfaces connection-refused / DNS / CORS preflight failure as
  // `TypeError: Failed to fetch`. Node's undici surfaces it as
  // `Error: fetch failed` with a `cause.code` of `ECONNREFUSED`/`ENOTFOUND`.
  if (err instanceof TypeError && err.message === 'Failed to fetch') return true
  if (
    err instanceof Error &&
    /fetch failed/i.test(err.message) &&
    (err as Error & { cause?: { code?: string } }).cause?.code &&
    ['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN'].includes(
      (err as Error & { cause?: { code?: string } }).cause!.code!,
    )
  ) {
    return true
  }
  return false
}

async function rawFetch<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
    ...init,
  })
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('admin_web_session')
      window.location.href = '/'
      throw new Error('Unauthorized — redirecting to login')
    }
    const text = await res.text()
    try {
      const err = JSON.parse(text)
      throw new Error(err.message || text)
    } catch {
      throw new Error(text || `HTTP ${res.status}`)
    }
  }
  return res.json() as Promise<T>
}

export async function apiFetch<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  // Dev only: Nest takes a few seconds to boot (Prisma connect + root admin
  // bootstrap). `pnpm dev` starts the web apps in parallel, so the first fetch
  // often hits ECONNREFUSED. Retry with short backoff to absorb the window.
  // In prod, the server is always up — a network error is a real outage and
  // should surface immediately to the user.
  const isDev = process.env.NODE_ENV !== 'production'
  const maxAttempts = isDev ? RETRY_DELAYS_MS.length + 1 : 1

  let lastError: unknown
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await rawFetch<T>(path, accessToken, init)
    } catch (err) {
      lastError = err
      if (!isNetworkError(err) || attempt === maxAttempts - 1) throw err
      const delay = RETRY_DELAYS_MS[attempt]
      if (typeof console !== 'undefined') {
        console.warn(
          `[api] ${path} unreachable, retrying in ${delay}ms (${attempt + 1}/${maxAttempts})`,
        )
      }
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw lastError
}
