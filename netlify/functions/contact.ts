import { createClient } from '@supabase/supabase-js'
import { getStore } from '@netlify/blobs'

interface ContactPayload {
  name: string
  email: string
  subject?: string
  body: string
  createdAt: string
  botToken?: string
  honeypot?: string
  formStartedAt?: string
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
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(statusCode: number, body: unknown): NetlifyResponse {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  }
}

/** HTML-escapes a string for safe use in Telegram HTML parse_mode. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const MIN_FORM_TIME_MS = 2000
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX = 5

/** Extracts the best-effort client IP from Netlify request headers. */
function clientIp(event: NetlifyEvent): string {
  const h = event.headers ?? {}
  return (
    h['x-nf-client-connection-ip'] ??
    h['x-forwarded-for']?.split(',')[0]?.trim() ??
    h['x-real-ip'] ??
    'unknown'
  )
}

/** Rejects bot submissions that were filled in faster than any human could. */
function isTooFast(payload: ContactPayload): boolean {
  const started = Date.parse(payload.formStartedAt ?? '')
  if (Number.isNaN(started)) return false
  return Date.now() - started < MIN_FORM_TIME_MS
}

/** Validates a Cloudflare Turnstile token against Cloudflare's siteverify API. */
async function verifyBotToken(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  // No secret configured → skip Turnstile (honeypot + rate limiting still apply).
  if (!secret) return Boolean(token)
  if (!token) return false
  try {
    const form = new URLSearchParams({ secret, response: token })
    if (ip) form.set('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}

/** Sliding-window rate limiter backed by Netlify Blobs (persists across invocations). */
async function isRateLimited(ip: string): Promise<boolean> {
  try {
    const store = getStore('bot-protection')
    const key = `rl:${ip}`
    const now = Date.now()
    const entry = (await store.get(key, { type: 'json' })) as
      | { count: number; resetsAt: number }
      | null
    if (!entry || typeof entry.count !== 'number' || now >= entry.resetsAt) {
      await store.setJSON(key, { count: 1, resetsAt: now + RATE_LIMIT_WINDOW_MS })
      return false
    }
    if (entry.count >= RATE_LIMIT_MAX) return true
    await store.setJSON(key, { count: entry.count + 1, resetsAt: entry.resetsAt })
    return false
  } catch {
    // Blob store unavailable → fail open (don't break the form).
    return false
  }
}

/** Maximum Telegram message length (bot API caps at 4096 chars). */
const TELEGRAM_MAX_BODY = 3800

/**
 * Sends an HTML-formatted notification to Telegram, falling back to plain text
 * if parse_mode causes a 400 error. Returns true on success.
 */
async function sendTelegram(
  botToken: string,
  chatId: string,
  name: string,
  email: string,
  subject: string | undefined,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeSubject = subject ? escapeHtml(subject) : ''
  const trimmedBody =
    body.length > TELEGRAM_MAX_BODY
      ? `${body.slice(0, TELEGRAM_MAX_BODY)}\n\n… (message truncated)`
      : body
  const safeBody = escapeHtml(trimmedBody)

  const htmlText = [
    '<b>📩 New Portfolio Message</b>',
    '',
    `<b>From:</b> ${safeName} &lt;<a href="mailto:${safeEmail}">${safeEmail}</a>&gt;`,
    safeSubject ? `<b>Subject:</b> ${safeSubject}` : '',
    '<b>Message:</b>',
    safeBody,
  ]
    .filter(Boolean)
    .join('\n')

  const plainText = [
    '📩 New Portfolio Message',
    '',
    `From: ${name} <${email}>`,
    subject ? `Subject: ${subject}` : '',
    'Message:',
    trimmedBody,
  ]
    .filter(Boolean)
    .join('\n')

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`

  const post = async (
    payload: Record<string, unknown>,
  ): Promise<{ ok: boolean; description?: string }> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    let data: { ok?: boolean; description?: string } = {}
    try {
      data = (await res.json()) as { ok?: boolean; description?: string }
    } catch {
      // Non-JSON response (proxy error) — surface the HTTP status instead.
    }
    return { ok: data.ok === true, description: data.description ?? `HTTP ${res.status}` }
  }

  // First attempt: HTML parse_mode
  const html = await post({ chat_id: chatId, text: htmlText, parse_mode: 'HTML' })
  if (html.ok) return { ok: true }

  // HTML mode failed — fall back to plain text
  const plain = await post({ chat_id: chatId, text: plainText })
  if (plain.ok) return { ok: true }
  return { ok: false, error: `HTML: ${html.description}; Plain: ${plain.description}` }
}

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true })
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' })

  let payload: ContactPayload
  try {
    payload = JSON.parse(event.body ?? '{}') as ContactPayload
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON body' })
  }

  const { name, email, subject, body } = payload
  if (!name?.trim() || !email?.trim() || !body?.trim()) {
    return json(400, { ok: false, error: 'Missing required fields: name, email, body' })
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { ok: false, error: 'Invalid email address' })
  }

  const ip = clientIp(event)

  // 1. Honeypot — hidden field that real visitors never fill.
  if (typeof payload.honeypot === 'string' && payload.honeypot.trim().length > 0) {
    return json(400, { ok: false, error: 'Submission rejected.' })
  }

  // 2. Human timing check — bots fill forms in milliseconds.
  if (isTooFast(payload)) {
    return json(400, { ok: false, error: 'Submission too fast.' })
  }

  // 3. Turnstile "Not a Robot" verification.
  const botVerified = await verifyBotToken(payload.botToken, ip)
  if (!botVerified) {
    return json(400, { ok: false, error: 'Please complete the "I am not a robot" check.' })
  }

  // 4. Rate limiting per IP.
  if (await isRateLimited(ip)) {
    return json(429, { ok: false, error: 'Too many submissions. Please try again later.' })
  }

  // --- Delivery ---
  const results = { telegram: false, supabase: false }
  const errors: string[] = []

  // Supabase insert (server-side with service role key — bypasses RLS)
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseUrl && serviceRoleKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      })
      const row: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim(),
        subject: subject?.trim() || null,
        body: body.trim(),
        read: false,
      }
      if (!Number.isNaN(Date.parse(payload.createdAt))) {
        row.created_at = payload.createdAt
      }
      const { error } = await supabase.from('messages').insert(row)
      if (error) {
        errors.push(`supabase: ${error.message} (code: ${error.code})`)
      } else {
        results.supabase = true
      }
    } catch (err) {
      errors.push(`supabase: ${err instanceof Error ? err.message : String(err)}`)
    }
  } else {
    errors.push('supabase: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured')
  }

  // Telegram notification
  const tgBotToken = process.env.TELEGRAM_BOT_TOKEN
  const tgChatId = process.env.TELEGRAM_CHAT_ID
  if (tgBotToken && tgChatId) {
    const result = await sendTelegram(tgBotToken, tgChatId, name, email, subject, body)
    if (result.ok) {
      results.telegram = true
    } else {
      errors.push(`telegram: ${result.error ?? 'Unknown error'}`)
    }
  } else {
    errors.push('telegram: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured')
  }

  // Succeed if at least one delivery channel worked
  const ok = results.supabase || results.telegram
  const statusCode = ok ? 200 : errors.some((e) => e.startsWith('supabase')) ? 500 : 502
  return json(statusCode, { ok, results, errors: errors.length ? errors : undefined })
}
