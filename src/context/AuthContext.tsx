import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const SESSION_KEY = 'portfolio:admin-session'

interface AuthContextValue {
  user: { email: string } | null
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function credentials() {
  return {
    email: import.meta.env.VITE_ADMIN_EMAIL ?? 'admin@gmail.com',
    password: import.meta.env.VITE_ADMIN_PASSWORD ?? '@dminPa$$',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(() => {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as { email: string }
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else localStorage.removeItem(SESSION_KEY)
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 500))
        const { email: adminEmail, password: adminPassword } = credentials()
        if (
          email.trim().toLowerCase() === adminEmail.toLowerCase() &&
          password === adminPassword
        ) {
          setUser({ email: adminEmail })
          return { ok: true }
        }
        return { ok: false, error: 'Invalid email or password.' }
      },
      logout: () => setUser(null),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
