export interface ContactPayload {
  name: string
  email: string
  subject?: string
  body: string
  createdAt: string
}

export interface ContactDelivery {
  telegram: boolean
  supabase: boolean
}

export async function sendContactMessage(payload: ContactPayload): Promise<ContactDelivery> {
  const res = await fetch('/.netlify/functions/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Contact function returned ${res.status}`)
  const data = (await res.json()) as { results: ContactDelivery }
  return data.results
}
