import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, User } from 'lucide-react'
import { useAuth } from '@/context/useAuth'

export default function AdminLogin() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const fromState = (location.state as { from?: string } | null)?.from
  const from = fromState && fromState.startsWith('/admin') ? fromState : '/admin'

  // Already signed in → skip the login form.
  useEffect(() => {
    if (status === 'authenticated' && location.pathname === '/admin/login') {
      navigate('/admin', { replace: true })
    }
  }, [status, location.pathname, navigate])

  if (status === 'checking') {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-50 dark:bg-[#0b1120]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neon border-t-transparent" />
      </div>
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!username.trim() || !password) {
      setError('Please enter both username and password.')
      return
    }
    setBusy(true)
    setError(null)
    const result = await login(username.trim(), password)
    setBusy(false)
    if (!result.ok) {
      setError(result.error ?? 'Incorrect username or password.')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4 py-10 dark:bg-[#0b1120]">
      <div className="w-full max-w-sm">
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="card-surface p-8"
          aria-label="Admin login"
        >
          <div className="mb-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-neon text-black">
              <Lock className="h-5 w-5" />
            </span>
            <h1 className="mt-4 font-display text-xl font-bold text-gray-900 dark:text-white">
              Admin Login
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Sign in to manage your portfolio.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="admin-username"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Username
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-base pl-10"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400"
              >
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-neon-deep dark:text-gray-400 dark:hover:text-neon"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to portfolio site
        </Link>
      </div>
    </div>
  )
}
