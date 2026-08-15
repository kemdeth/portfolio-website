import type { Message } from '@/lib/types'

export interface AdminActionPayload {
  action: string
  data?: unknown
}

export interface AdminActionResponse {
  ok: boolean
  status: number
  message?: string
  error?: string
}

interface MessagesResponse {
  ok: boolean
  status: number
  messages?: Message[]
  error?: string
}

export async function sendAdminAction(payload: AdminActionPayload): Promise<AdminActionResponse> {
  try {
    const res = await fetch('/.netlify/functions/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    const body = (await res.json()) as AdminActionResponse
    if (!res.ok) {
      return { ok: false, status: res.status, error: body.error ?? `Server returned HTTP ${res.status}` }
    }
    return { ok: body.ok === true, status: res.status, message: body.message }
  } catch {
    return { ok: false, status: 0, error: 'Could not reach the admin server.' }
  }
}

/** Fetches the full inbox from Supabase via the admin function. */
export async function fetchMessages(): Promise<{ messages: Message[] | null; status: number; error?: string }> {
  try {
    const res = await fetch('/.netlify/functions/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'list_messages' }),
    })
    const body = (await res.json()) as MessagesResponse
    if (!res.ok || !body.ok) {
      return { messages: null, status: res.status, error: body.error ?? `Server returned HTTP ${res.status}` }
    }
    return { messages: body.messages ?? [], status: res.status }
  } catch {
    return { messages: null, status: 0, error: 'Could not reach the admin server.' }
  }
}
