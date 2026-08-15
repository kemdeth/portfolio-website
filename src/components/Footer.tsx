import { useData } from '@/context/useData'
import { useToast } from '@/context/useToast'
import { copyToClipboard } from '@/lib/clipboard'
import { GithubIcon, LinkedinIcon, TelegramIcon } from '@/components/SocialIcons'
import { Copy, MapPin } from 'lucide-react'

export function Footer() {
  const { data } = useData()
  const { toast } = useToast()
  const year = new Date().getFullYear()
  const p = data.profile

  const handleCopyEmail = async () => {
    const ok = await copyToClipboard(p.email)
    if (ok) toast('Email copied to clipboard!')
    else toast('Could not copy to clipboard.', 'error')
  }

  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-[#0a0f1c]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-neon font-display text-sm font-bold text-black">
                {p.name
                  .split(' ')
                  .map((s) => s[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <span className="font-display text-sm font-semibold text-gray-900 dark:text-white">
                {p.name}
              </span>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4" /> {p.location}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href={p.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-gray-500 transition hover:text-neon-deep dark:text-gray-400 dark:hover:text-neon"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
              <a
                href={p.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-500 transition hover:text-neon-deep dark:text-gray-400 dark:hover:text-neon"
              >
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a
                href={p.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="text-gray-500 transition hover:text-neon-deep dark:text-gray-400 dark:hover:text-neon"
              >
                <TelegramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {['About', 'Skills', 'Projects', 'Testimonials', 'Contact'].map((label) => (
                <li key={label}>
                  <a
                    href={`#${label.toLowerCase()}`}
                    className="text-gray-500 transition hover:text-neon-deep dark:text-gray-400 dark:hover:text-neon"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Let's connect
            </h3>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Have a project in mind or just want to say hi? Reach out - I usually respond within 24
              hours.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a href={`mailto:${p.email}`} className="btn-ghost">
                {p.email}
              </a>
              <button
                type="button"
                onClick={() => void handleCopyEmail()}
                aria-label="Copy email address"
                title="Copy email address"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:border-neon-deep hover:text-neon-deep dark:border-white/20 dark:text-gray-300 dark:hover:border-neon dark:hover:text-neon"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-6 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400 sm:flex-row">
          <p>
            (c) {year} {p.name}. Built with React, Vite & Tailwind CSS.
          </p>
          <div className="flex items-center gap-4">
            <a
              href={p.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => toast('CV download started!')}
              className="transition hover:text-neon-deep dark:hover:text-neon"
            >
              Download CV
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
