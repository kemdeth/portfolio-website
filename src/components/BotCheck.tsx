import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Bot, Loader2, ShieldCheck } from 'lucide-react'
import {
  createFallbackBotToken,
  isBotCheckConfigured,
  loadTurnstileScript,
  TURNSTILE_SITE_KEY,
} from '@/lib/captcha'
import { cn } from '@/lib/utils'

export interface BotCheckHandle {
  /** Clears the current token and resets the widget (use after a successful submit). */
  reset: () => void
  /** Returns the current verification token, or null if not yet verified. */
  getToken: () => string | null
}

interface BotCheckProps {
  onVerify?: (token: string | null) => void
  onExpire?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact' | 'flexible'
  className?: string
}

export const BotCheck = forwardRef<BotCheckHandle, BotCheckProps>(function BotCheck(
  { onVerify, onExpire, theme = 'auto', size = 'normal', className },
  ref,
) {
  const configured = isBotCheckConfigured()
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const tokenRef = useRef<string | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'verified'>('loading')

  useEffect(() => {
    if (!configured) {
      setState('ready')
      return
    }
    let cancelled = false
    setState('loading')
    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        const id = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          size,
          appearance: 'always',
          callback: (token: string) => {
            tokenRef.current = token
            setState('verified')
            onVerify?.(token)
          },
          'expired-callback': () => {
            tokenRef.current = null
            setState('ready')
            onExpire?.()
            onVerify?.(null)
          },
          'error-callback': () => {
            tokenRef.current = null
            setState('error')
            onVerify?.(null)
          },
        })
        widgetIdRef.current = id
        setState('ready')
      })
      .catch(() => {
        if (!cancelled) setState('error')
      })
    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
      tokenRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, theme, size])

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        tokenRef.current = null
        setState('ready')
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current)
        }
      },
      getToken: () => tokenRef.current,
    }),
    [],
  )

  if (!configured) {
    return (
      <button
        type="button"
        onClick={() => {
          const token = createFallbackBotToken()
          tokenRef.current = token
          setState('verified')
          onVerify?.(token)
        }}
        aria-pressed={state === 'verified'}
        className={cn(
          'inline-flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition',
          state === 'verified'
            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
            : 'hover:border-neon/50 hover:text-neon-deep dark:border-white/20 dark:bg-white/5 dark:text-gray-200',
          className,
        )}
      >
        {state === 'verified' ? (
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
        ) : (
          <Bot className="h-5 w-5 text-gray-400" />
        )}
        <span className="whitespace-nowrap">
          {state === 'verified' ? 'Verified — not a robot' : 'I am not a robot'}
        </span>
      </button>
    )
  }

  return (
    <div className={cn('relative min-h-16', className)}>
      {state === 'loading' && (
        <div className="absolute inset-0 grid place-items-center rounded-lg border border-gray-200 bg-gray-50 text-gray-400 dark:border-white/10 dark:bg-white/5">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
      <div ref={containerRef} className={cn(state === 'loading' && 'invisible')} />
    </div>
  )
})
