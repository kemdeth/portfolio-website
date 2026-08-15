import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { parseCookies, verifySessionToken, SESSION_COOKIE } from './_shared/session.js'

interface AdminPayload {
  action?: string
  data?: unknown
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

function json(statusCode: number, body: unknown): NetlifyResponse {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  }
}

/** Lazily builds a Supabase client using the server-side service role key. */
function supabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } })
}

interface DbMessageRow {
  id: string
  name: string
  email: string
  subject: string | null
  body: string
  read: boolean
  created_at: string
}

/** Maps a Supabase row to the shape used by the admin UI. */
function mapMessage(row: DbMessageRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject ?? undefined,
    body: row.body,
    read: row.read,
    createdAt: row.created_at,
  }
}

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { ok: true })
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed' })
  }

  let payload: AdminPayload
  try {
    payload = JSON.parse(event.body ?? '{}') as AdminPayload
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON body' })
  }

  if (!payload.action) {
    return json(400, { ok: false, error: 'Action type is required' })
  }

  // --- Strict auth gate: every admin action (read or write) requires a valid session. ---
  const cookies = parseCookies(event.headers?.cookie)
  const session = verifySessionToken(cookies[SESSION_COOKIE])
  if (!session) {
    return json(401, { ok: false, error: 'Unauthorized. Please log in to access the admin dashboard.' })
  }

  const supabase = supabaseClient()
  if (!supabase) {
    return json(500, { ok: false, error: 'Supabase is not configured on the server.' })
  }

  const data = (payload.data ?? {}) as Record<string, unknown>
  const id = typeof data.id === 'string' ? data.id : ''

  try {
    if (payload.action === 'list_messages') {
      const { data: rows, error } = await supabase
        .from('messages')
        .select('id, name, email, subject, body, read, created_at')
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) return json(500, { ok: false, error: error.message })
      return json(200, { ok: true, messages: (rows as DbMessageRow[]).map(mapMessage) })
    }

    if (payload.action === 'set_message_read') {
      const read = Boolean(data.read)
      const { error } = await supabase.from('messages').update({ read }).eq('id', id)
      if (error) return json(500, { ok: false, error: error.message })
      return json(200, { ok: true, id, read })
    }

    if (payload.action === 'delete_message') {
      const { error } = await supabase.from('messages').delete().eq('id', id)
      if (error) return json(500, { ok: false, error: error.message })
      return json(200, { ok: true, id })
    }

    return json(400, { ok: false, error: `Unknown admin action: ${payload.action}` })
  } catch (err) {
    return json(500, { ok: false, error: err instanceof Error ? err.message : String(err) })
  }
}
