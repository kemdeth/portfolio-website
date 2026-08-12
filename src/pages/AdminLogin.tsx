import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const REMEMBER_KEY = 'portfolio:admin-remember'

export default function AdminLogin() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_KEY) ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(REMEMBER_KEY)))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (remember && email) localStorage.setItem(REMEMBER_KEY, email)
    else if (!remember) localStorage.removeItem(REMEMBER_KEY)
  }, [remember, email])

  if (user) return <Navigate to="/admin/dashboard" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.ok) {
      navigate('/admin/dashboard', { replace: true })
    } else {
      setError(result.error ?? 'Login failed.')
    }
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition duration-300 focus:border-neon/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-neon/15'

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#070b14] px-4 py-12 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-32 h-96 w-96 rounded-full bg-neon/20 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px]"
      />

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/80 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-neon/15 blur-3xl"
          />

          <div className="relative flex flex-col items-center text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-neon to-emerald-500 text-black shadow-lg shadow-neon/40">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold">Admin Portal</h1>
            <p className="mt-1 text-sm text-gray-400">Sign in to manage your portfolio</p>
          </div>

          <form onSubmit={handleSubmit} className="relative mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-200"
              >
                Email / Username
              </label>
              <div className="group relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition group-focus-within:text-neon" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="admin@kem.dev"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-200"
              >
                Password
              </label>
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition group-focus-within:text-neon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-11 pr-11 text-sm text-white placeholder-gray-500 outline-none transition duration-300 focus:border-neon/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-neon/15"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:text-neon"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 accent-emerald-500"
                />
                Remember me
              </label>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-sm font-medium text-emerald-400 transition hover:text-neon hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {error && (
              <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-400 via-neon to-emerald-400 bg-[length:200%_auto] py-3 text-sm font-bold text-black transition-all duration-500 hover:bg-right hover:shadow-lg hover:shadow-neon/30 focus:outline-none focus:ring-4 focus:ring-neon/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                {loading ? 'Signing in...' : 'Sign In'}
              </span>
            </button>
          </form>
        </motion.div>

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-gray-400 transition hover:text-neon"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Portfolio
        </Link>
      </div>
    </div>
  )
}
