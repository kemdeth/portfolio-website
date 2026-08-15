import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
} from '@/context/authContextValue'
import { getSession, loginUser, logoutSession } from '@/lib/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    void getSession().then((session) => {
      if (!alive) return
      setUsername(session.username)
      setStatus(session.authenticated ? 'authenticated' : 'unauthenticated')
    })
    return () => {
      alive = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      username,
      login: async (user, pass) => {
        const result = await loginUser(user, pass)
        if (result.ok) {
          setUsername(user)
          setStatus('authenticated')
        }
        return result
      },
      logout: async () => {
        await logoutSession()
        setUsername(null)
        setStatus('unauthenticated')
      },
    }),
    [status, username],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
