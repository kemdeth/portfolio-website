import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { parseCookies, verifySessionToken, SESSION_COOKIE } from './_shared/session.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface DbMessageRow {
  id: string
  name: string
  email: string
  subject: string | null
  body: string
  read: boolean
  created_at: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/**
 * Lazily builds a Supabase client.
 * Prefers the service-role key (bypasses RLS); falls back to the anon key
 * when server-side secrets aren't configured (requires RLS policies).
 */
function supabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    const missing = [
      !process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL && 'SUPABASE_URL/VITE_SUPABASE_URL',
      !process.env.SUPABASE_SERVICE_ROLE_KEY &&
        !process.env.VITE_SUPABASE_ANON_KEY &&
        'SUPABASE_SERVICE_ROLE_KEY/VITE_SUPABASE_ANON_KEY',
    ].filter(Boolean)
    console.error(`[admin] Supabase init failed — missing: ${missing.join(', ')}`)
    return null
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

/** Maps a Supabase message row to the shape used by the admin UI. */
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

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

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

  // --- Strict auth gate: every admin action requires a valid session. ---
  const cookies = parseCookies(event.headers?.cookie)
  const session = verifySessionToken(cookies[SESSION_COOKIE])
  if (!session) {
    return json(401, {
      ok: false,
      error: 'Unauthorized. Please log in to access the admin dashboard.',
    })
  }

  const supabase = supabaseClient()
  if (!supabase) {
    return json(500, { ok: false, error: 'Supabase is not configured on the server.' })
  }

  const data = (payload.data ?? {}) as Record<string, unknown>
  const id = typeof data.id === 'string' ? data.id : ''

  try {
    // =================================================================
    // Messages
    // =================================================================

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

    // =================================================================
    // Profile (singleton – JSONB)
    // =================================================================

    if (payload.action === 'upsert_profile') {
      const profileData = payload.data
      const { error } = await supabase.from('site_profile').upsert(
        { id: 1, data: profileData, updated_at: new Date().toISOString() },
        { onConflict: 'id' },
      )
      if (error) return json(500, { ok: false, error: error.message })
      return json(200, { ok: true })
    }

    // =================================================================
    // Skills
    // =================================================================

    if (payload.action === 'upsert_skill') {
      const row = {
        id: data.id as string,
        category: data.category as string,
        name: data.name as string,
        level: data.level as number,
        icon: (data.icon as string) ?? null,
        color: (data.color as string) ?? null,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase
        .from('skills')
        .upsert(row, { onConflict: 'id' })
      if (error) return json(500, { ok: false, error: error.message })
      return json(200, { ok: true })
    }

    if (payload.action === 'delete_skill') {
      const { error } = await supabase.from('skills').delete().eq('id', id)
      if (error) return json(500, { ok: false, error: error.message })
      return json(200, { ok: true, id })
    }

    // =================================================================
    // Projects
    // =================================================================

    if (payload.action === 'upsert_project') {
      const row = {
        id: data.id as string,
        title: data.title as string,
        description: (data.description as string) ?? '',
        challenge: (data.challenge as string) ?? null,
        tags: (data.tags as string[]) ?? [],
        image: (data.image as string) ?? '',
        live_url: (data.liveUrl as string) ?? null,
        source_url: (data.sourceUrl as string) ?? null,
        featured: Boolean(data.featured),
        status: (data.status as string) ?? null,
        sort_order: (data.order as number) ?? 0,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase
        .from('projects')
        .upsert(row, { onConflict: 'id' })
      if (error) return json(500, { ok: false, error: error.message })
      return json(200, { ok: true })
    }

    if (payload.action === 'delete_project') {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) return json(500, { ok: false, error: error.message })
      return json(200, { ok: true, id })
    }

    // =================================================================
    // Certificates
    // =================================================================

    if (payload.action === 'upsert_certificate') {
      const row = {
        id: data.id as string,
        name: data.name as string,
        issuer: (data.issuer as string) ?? '',
        year: (data.year as string) ?? null,
        url: (data.url as string) ?? null,
        image: (data.image as string) ?? null,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase
        .from('certificates')
        .upsert(row, { onConflict: 'id' })
      if (error) return json(500, { ok: false, error: error.message })
      return json(200, { ok: true })
    }

    if (payload.action === 'delete_certificate') {
      const { error } = await supabase.from('certificates').delete().eq('id', id)
      if (error) return json(500, { ok: false, error: error.message })
      return json(200, { ok: true, id })
    }

    // =================================================================
    // Testimonials
    // =================================================================

    if (payload.action === 'upsert_testimonial') {
      const row = {
        id: data.id as string,
        name: data.name as string,
        role: (data.role as string) ?? '',
        quote: (data.quote as string) ?? '',
        avatar: (data.avatar as string) ?? '',
        rating: (data.rating as number) ?? 5,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase
        .from('testimonials')
        .upsert(row, { onConflict: 'id' })
      if (error) return json(500, { ok: false, error: error.message })
      return json(200, { ok: true })
    }

    if (payload.action === 'delete_testimonial') {
      const { error } = await supabase.from('testimonials').delete().eq('id', id)
      if (error) return json(500, { ok: false, error: error.message })
      return json(200, { ok: true, id })
    }

    return json(400, { ok: false, error: `Unknown admin action: ${payload.action}` })
  } catch (err) {
    return json(500, {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
