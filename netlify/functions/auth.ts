import { getStore } from '@netlify/blobs'
import {
  createSessionToken,
  parseCookies,
  safeEqual,
  verifySessionToken,
  SESSION_COOKIE,
  setSessionCookie,
  clearSessionCookie,
} from './_shared/session.js'

interface AuthPayload {
  action?: string
  username?: string
  password?: string
}

interface NetlifyEvent {
  httpMethod?: string
  body?: string | null
  headers?: Record<string, string | undefined>
}

interface NetlifyResponse {
  statusCode: number
  headers: Record<string, string>
  body: string
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000
const LOGIN_RATE_MAX = 10

function json(
  statusCode: number,
  body: unknown,
  extraHeaders?: Record<string, string>,
): NetlifyResponse {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...extraHeaders },
    body: JSON.stringify(body),
  }
}

function clientIp(event: NetlifyEvent): string {
  const h = event.headers ?? {}
  return (
    h['x-nf-client-connection-ip'] ??
    h['x-forwarded-for']?.split(',')[0]?.trim() ??
    h['x-real-ip'] ??
    'unknown'
  )
}

/** Sliding-window brute-force limiter backed by Netlify Blobs. */
async function isLoginRateLimited(ip: string): Promise<boolean> {
  try {
    const store = getStore('auth-protection')
    const key = `login:${ip}`
    const now = Date.now()
    const entry = (await store.get(key, { type: 'json' })) as
      | { count: number; resetsAt: number }
      | null
    if (!entry || typeof entry.count !== 'number' || now >= entry.resetsAt) {
      await store.setJSON(key, { count: 1, resetsAt: now + LOGIN_RATE_WINDOW_MS })
      return false
    }
    if (entry.count >= LOGIN_RATE_MAX) return true
    await store.setJSON(key, { count: entry.count + 1, resetsAt: entry.resetsAt })
    return false
  } catch {
    // Blob store unavailable → fail open (don't lock out legitimate logins).
    return false
  }
}

async function clearLoginRateLimit(ip: string): Promise<void> {
  try {
    const store = getStore('auth-protection')
    await store.delete(`login:${ip}`)
  } catch {
    // ignore
  }
}

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true })
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' })

  let payload: AuthPayload
  try {
    payload = JSON.parse(event.body ?? '{}') as AuthPayload
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON body' })
  }

  const cookies = parseCookies(event.headers?.cookie)

  if (payload.action === 'session') {
    const session = verifySessionToken(cookies[SESSION_COOKIE])
    if (session) return json(200, { ok: true, authenticated: true, username: session.username })
    return json(200, { ok: true, authenticated: false })
  }

  if (payload.action === 'logout') {
    return json(200, { ok: true }, { 'Set-Cookie': clearSessionCookie() })
  }

  if (payload.action === 'login') {
    const ip = clientIp(event)
    if (await isLoginRateLimited(ip)) {
      return json(429, {
        ok: false,
        error: 'Too many login attempts. Please try again later.',
      })
    }

    const { username, password } = payload
    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      return json(400, { ok: false, error: 'Username and password are required.' })
    }

    const adminUser = process.env.ADMIN_USERNAME
    const adminPass = process.env.ADMIN_PASSWORD
    if (!adminUser || !adminPass) {
      return json(500, {
        ok: false,
        error: 'Admin credentials are not configured on the server.',
      })
    }

    if (!safeEqual(username, adminUser) || !safeEqual(password, adminPass)) {
      return json(401, { ok: false, error: 'Incorrect username or password.' })
    }

    await clearLoginRateLimit(ip)
    const token = createSessionToken(adminUser)
    return json(
      200,
      { ok: true, authenticated: true, username: adminUser },
      { 'Set-Cookie': setSessionCookie(token) },
    )
  }

  return json(400, { ok: false, error: `Unknown auth action: ${payload.action ?? 'undefined'}` })
}
