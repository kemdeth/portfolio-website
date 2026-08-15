/**
 * "Not a Robot" (Cloudflare Turnstile) configuration helpers.
 *
 * The public site key is inlined by Vite at build time via `VITE_TURNSTILE_SITE_KEY`.
 * The matching server-side secret key (`TURNSTILE_SECRET_KEY`) is validated in
 * `netlify/functions/contact.ts` — it must never be exposed to the browser.
 */

export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ''

/** True when a real Turnstile site key is configured (widget is rendered). */
export function isBotCheckConfigured(): boolean {
  return Boolean(TURNSTILE_SITE_KEY)
}

/** Minimum time a form must be open before a human can realistically submit it. */
export const MIN_FORM_TIME_MS = 2000

/** Generates a throwaway token when no Turnstile site key is configured (dev fallback). */
export function createFallbackBotToken(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return `local-${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: Record<string, unknown>,
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
      getResponse: (widgetId: string) => string
    }
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let scriptPromise: Promise<void> | null = null

/** Loads the Cloudflare Turnstile script exactly once and resolves when ready. */
export function loadTurnstileScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src*="turnstile"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Turnstile script')), {
        once: true,
      })
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Turnstile script'))
    document.head.appendChild(script)
  })
  return scriptPromise
}
