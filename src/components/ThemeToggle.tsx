import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('portfolio:theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    localStorage.setItem('portfolio:theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={
        className ??
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:border-neon-deep hover:text-neon-deep dark:border-white/15 dark:bg-white/5 dark:text-gray-200 dark:hover:border-neon dark:hover:text-neon'
      }
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
