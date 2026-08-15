import type { Certificate, Message, Profile, Project, Skill, Testimonial } from '@/lib/types'

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const ADMIN_ENDPOINT = '/.netlify/functions/admin'

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

export async function sendAdminAction(payload: AdminActionPayload): Promise<AdminActionResponse> {
  try {
    const res = await fetch(ADMIN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    const body = (await res.json()) as AdminActionResponse
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: body.error ?? `Server returned HTTP ${res.status}`,
      }
    }
    return { ok: body.ok === true, status: res.status, message: body.message }
  } catch {
    return { ok: false, status: 0, error: 'Could not reach the admin server.' }
  }
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

interface MessagesResponse {
  ok: boolean
  status: number
  messages?: Message[]
  error?: string
}

/** Fetches the full inbox from Supabase via the admin function. */
export async function fetchMessages(): Promise<{
  messages: Message[] | null
  status: number
  error?: string
}> {
  try {
    const res = await fetch(ADMIN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'list_messages' }),
    })
    const body = (await res.json()) as MessagesResponse
    if (!res.ok || !body.ok) {
      return {
        messages: null,
        status: res.status,
        error: body.error ?? `Server returned HTTP ${res.status}`,
      }
    }
    return { messages: body.messages ?? [], status: res.status }
  } catch {
    return { messages: null, status: 0, error: 'Could not reach the admin server.' }
  }
}

// ---------------------------------------------------------------------------
// Profile (singleton)
// ---------------------------------------------------------------------------

export async function upsertProfile(profile: Profile): Promise<AdminActionResponse> {
  return sendAdminAction({ action: 'upsert_profile', data: profile })
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export async function upsertSkill(skill: Skill): Promise<AdminActionResponse> {
  return sendAdminAction({ action: 'upsert_skill', data: skill })
}

export async function removeSkill(id: string): Promise<AdminActionResponse> {
  return sendAdminAction({ action: 'delete_skill', data: { id } })
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function upsertProject(project: Project): Promise<AdminActionResponse> {
  return sendAdminAction({ action: 'upsert_project', data: project })
}

export async function removeProject(id: string): Promise<AdminActionResponse> {
  return sendAdminAction({ action: 'delete_project', data: { id } })
}

// ---------------------------------------------------------------------------
// Certificates
// ---------------------------------------------------------------------------

export async function upsertCertificate(cert: Certificate): Promise<AdminActionResponse> {
  return sendAdminAction({ action: 'upsert_certificate', data: cert })
}

export async function removeCertificate(id: string): Promise<AdminActionResponse> {
  return sendAdminAction({ action: 'delete_certificate', data: { id } })
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export async function upsertTestimonial(t: Testimonial): Promise<AdminActionResponse> {
  return sendAdminAction({ action: 'upsert_testimonial', data: t })
}

export async function removeTestimonial(id: string): Promise<AdminActionResponse> {
  return sendAdminAction({ action: 'delete_testimonial', data: { id } })
}
