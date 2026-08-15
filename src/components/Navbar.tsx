import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useData } from '@/context/useData'
import { ThemeToggle } from '@/components/ThemeToggle'
import { GithubIcon, LinkedinIcon, TelegramIcon } from '@/components/SocialIcons'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#contact', label: 'Contact' },
]

export function Navbar() {
  const { data } = useData()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('#home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ScrollSpy - highlight the navbar link for the section currently in view.
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.href.slice(1))).filter(
      (el): el is HTMLElement => Boolean(el),
    )
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`)
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const initials = data.profile.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-gray-200 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-[#0b1120]/85'
          : 'bg-transparent',
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-neon font-display text-sm font-bold text-black">
            {initials}
          </span>
          <span className="hidden font-display text-sm font-semibold text-gray-900 dark:text-white sm:block">
            {data.profile.name}
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={active === link.href ? 'true' : undefined}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition',
                  active === link.href
                    ? 'bg-neon/10 text-neon-deep dark:text-neon'
                    : 'text-gray-600 hover:text-neon-deep dark:text-gray-300 dark:hover:text-neon',
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href={data.profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden btn-primary sm:inline-flex"
          >
            Resume
          </a>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 dark:border-white/15 dark:text-gray-200 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#0b1120] md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={active === link.href ? 'true' : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block rounded-lg px-3 py-2 text-sm font-medium transition',
                    active === link.href
                      ? 'bg-neon/10 text-neon-deep dark:text-neon'
                      : 'text-gray-700 hover:bg-neon/10 dark:text-gray-200',
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
            <span className="text-xs uppercase tracking-wider text-gray-400">Follow me</span>
            <div className="flex items-center gap-2">
              <a
                href={data.profile.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-gray-500 transition hover:text-neon-deep dark:text-gray-400 dark:hover:text-neon"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
              <a
                href={data.profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-500 transition hover:text-neon-deep dark:text-gray-400 dark:hover:text-neon"
              >
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a
                href={data.profile.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="text-gray-500 transition hover:text-neon-deep dark:text-gray-400 dark:hover:text-neon"
              >
                <TelegramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
