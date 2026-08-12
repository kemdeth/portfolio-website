import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Award,
  ExternalLink,
  FolderGit2,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PanelLeft,
  User,
  Wrench,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/dashboard/profile', label: 'Profile & Settings', icon: User },
  { to: '/admin/dashboard/certificates', label: 'Certificates', icon: Award },
  { to: '/admin/dashboard/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/admin/dashboard/skills', label: 'Skills', icon: Wrench },
  { to: '/admin/dashboard/messages', label: 'Messages', icon: MessageSquare },
]

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const { data } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const unread = data.messages.filter((m) => !m.read).length
  const current = NAV_ITEMS.find((item) =>
    item.end
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to),
  )

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        className="flex items-center gap-2 border-b border-slate-200 px-4 py-5 dark:border-slate-800"
      >
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-neon font-display text-sm font-bold text-black">
          {data.profile.name
            .split(' ')
            .map((s) => s[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </span>
        <div>
          <p className="font-display text-sm font-semibold text-gray-900 dark:text-white">
            Admin Panel
          </p>
          <p className="text-xs text-gray-400">{data.profile.name}</p>
        </div>
      </Link>

      <nav aria-label="Dashboard" className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'border-neon/30 bg-gradient-to-r from-neon/15 to-transparent text-neon-deep shadow-sm dark:text-neon'
                  : 'text-gray-600 hover:border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:hover:border-white/10 dark:hover:bg-white/5',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'h-4.5 w-4.5 shrink-0 transition',
                    isActive
                      ? 'text-neon-deep dark:text-neon'
                      : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200',
                  )}
                />
                <span className="flex-1">{label}</span>
                {label === 'Messages' && unread > 0 && (
                  <span className="rounded-full bg-neon px-2 py-0.5 text-[10px] font-bold text-black">
                    {unread}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <ExternalLink className="h-4.5 w-4.5 text-gray-400" />
          View Site
          <span className="ml-auto text-xs text-gray-400">↗</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-red-500 transition hover:border-red-200 hover:bg-red-50 dark:hover:border-red-500/20 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-4.5 w-4.5" />
          Log out
          <span className="ml-auto">🚪</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0e1526] lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0e1526]">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-[#0b1120]/85 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen((o) => !o)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-gray-700 dark:border-white/15 dark:text-gray-200 lg:hidden"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <h1 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
              {current?.label ?? 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/70 py-1 pl-1 pr-3 shadow-sm dark:border-white/15 dark:bg-white/5">
              <img
                src={data.profile.avatarUrl}
                alt={user?.email ?? 'Admin'}
                width={32}
                height={32}
                className="aspect-square h-8 w-8 rounded-full border-2 border-neon/40 object-cover"
              />
              <span className="hidden text-sm font-medium text-gray-600 dark:text-gray-300 sm:block">
                {user?.email}
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
