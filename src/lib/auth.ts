export interface AuthResult {
  ok: boolean
  error?: string
}

export interface SessionState {
  authenticated: boolean
  username: string | null
}

interface AuthResponse {
  status: number
  body: Record<string, unknown>
}

const AUTH_ENDPOINT = '/.netlify/functions/auth'

async function callAuth(payload: Record<string, unknown>): Promise<AuthResponse> {
  const res = await fetch(AUTH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  let body: Record<string, unknown> = {}
  try {
    body = (await res.json()) as Record<string, unknown>
  } catch {
    // Non-JSON response — the status code still tells us what happened.
  }
  return { status: res.status, body }
}

export async function loginUser(username: string, password: string): Promise<AuthResult> {
  try {
    const { status, body } = await callAuth({ action: 'login', username, password })
    if (status === 200 && body.ok === true) return { ok: true }
    const message =
      typeof body.error === 'string'
        ? body.error
        : status === 401
          ? 'Incorrect username or password.'
          : 'Login failed. Please try again.'
    return { ok: false, error: message }
  } catch {
    return { ok: false, error: 'Could not reach the login server. Please try again.' }
  }
}

export async function logoutSession(): Promise<void> {
  try {
    await callAuth({ action: 'logout' })
  } catch {
    // Best-effort: clear local auth state even if the server is unreachable.
  }
}

export async function getSession(): Promise<SessionState> {
  try {
    const { body } = await callAuth({ action: 'session' })
    return {
      authenticated: body.authenticated === true,
      username: typeof body.username === 'string' ? body.username : null,
    }
  } catch {
    return { authenticated: false, username: null }
  }
}
