import { createClient } from '@supabase/supabase-js'

interface ContactPayload {
  name: string
  email: string
  subject?: string
  body: string
  createdAt: string
}

interface NetlifyEvent {
  httpMethod?: string
  body?: string | null
}

interface NetlifyResponse {
  statusCode: number
  headers: Record<string, string>
  body: string
}

function json(statusCode: number, body: unknown): NetlifyResponse {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' })

  let payload: ContactPayload
  try {
    payload = JSON.parse(event.body ?? '{}') as ContactPayload
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON body' })
  }

  const { name, email, subject, body } = payload
  if (!name || !email || !body) {
    return json(400, { ok: false, error: 'Missing required fields' })
  }

  const results = { telegram: false, supabase: false }
  const errors: string[] = []

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (botToken && chatId) {
    try {
      const lines = [
        '<b>\u{1F4E9} New portfolio message</b>',
        '',
        `<b>From:</b> ${escapeHtml(name)} (<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>)`,
        subject ? `<b>Subject:</b> ${escapeHtml(subject)}` : '',
        '<b>Message:</b>',
        escapeHtml(body),
      ]
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: lines.filter(Boolean).join('\n'),
          parse_mode: 'HTML',
        }),
      })
      const data = (await res.json()) as { ok?: boolean }
      if (res.ok && data.ok) results.telegram = true
      else errors.push(`telegram: HTTP ${res.status}`)
    } catch (err) {
      errors.push(`telegram: ${err instanceof Error ? err.message : String(err)}`)
    }
  } else {
    errors.push('telegram: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not configured')
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseUrl && serviceRoleKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey)
      const row: Record<string, unknown> = {
        name,
        email,
        subject: subject || null,
        body,
        read: false,
      }
      if (!Number.isNaN(Date.parse(payload.createdAt))) row.created_at = payload.createdAt
      const { error } = await supabase.from('messages').insert(row)
      if (error) errors.push(`supabase: ${error.message}`)
      else results.supabase = true
    } catch (err) {
      errors.push(`supabase: ${err instanceof Error ? err.message : String(err)}`)
    }
  } else {
    errors.push('supabase: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured')
  }

  const ok = results.telegram || results.supabase
  return json(ok ? 200 : 500, { ok, results, errors })
}
