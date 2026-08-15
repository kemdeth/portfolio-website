export interface ContactPayload {
  name: string
  email: string
  subject?: string
  body: string
  createdAt: string
  /** Cloudflare Turnstile verification token (or local fallback token). */
  botToken?: string
  /** Hidden honeypot field — must stay empty or the server rejects the submission. */
  honeypot?: string
  /** ISO timestamp of when the form was first rendered (used to catch instant bots). */
  formStartedAt?: string
}

export interface ContactDelivery {
  telegram: boolean
  supabase: boolean
}

export class ContactError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ContactError'
    this.status = status
  }
}

export async function sendContactMessage(payload: ContactPayload): Promise<ContactDelivery> {
  let res: Response
  try {
    res = await fetch('/.netlify/functions/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new ContactError(0, 'Could not reach the server.')
  }

  let data: { results?: ContactDelivery; error?: string; errors?: string[] } = {}
  try {
    data = (await res.json()) as { results?: ContactDelivery; error?: string; errors?: string[] }
  } catch {
    data = {}
  }

  if (!res.ok) {
    const msg = data.error ?? data.errors?.join('; ') ?? `Contact function returned ${res.status}`
    throw new ContactError(res.status, msg)
  }
  return data.results ?? { telegram: false, supabase: false }
}
