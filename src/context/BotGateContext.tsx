import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  BotGateContext,
  type BotGateContextValue,
} from '@/context/botGateContextValue'

const STORAGE_KEY = 'portfolio:bot-verified'
const VERIFIED_TTL_MS = 30 * 60 * 1000

interface VerifiedRecord {
  token: string
  at: number
}

function readStored(): VerifiedRecord | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as VerifiedRecord
    if (!parsed || typeof parsed.token !== 'string' || typeof parsed.at !== 'number') return null
    if (Date.now() - parsed.at > VERIFIED_TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function BotGateProvider({ children }: { children: ReactNode }) {
  const [verified, setVerified] = useState<boolean>(() => Boolean(readStored()))
  const [token, setToken] = useState<string | null>(() => readStored()?.token ?? null)

  useEffect(() => {
    const stored = readStored()
    setVerified(Boolean(stored))
    setToken(stored?.token ?? null)
  }, [])

  const value = useMemo<BotGateContextValue>(
    () => ({
      verified,
      canEdit: verified,
      token,
      verify: (nextToken: string) => {
        if (!nextToken) return
        const record: VerifiedRecord = { token: nextToken, at: Date.now() }
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record))
        } catch {
          // storage unavailable — keep in-memory state only
        }
        setToken(nextToken)
        setVerified(true)
      },
      reset: () => {
        try {
          sessionStorage.removeItem(STORAGE_KEY)
        } catch {
          // ignore
        }
        setToken(null)
        setVerified(false)
      },
    }),
    [verified, token],
  )

  return <BotGateContext.Provider value={value}>{children}</BotGateContext.Provider>
}
