import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, Download } from 'lucide-react'
import { useData } from '@/context/useData'
import { useToast } from '@/context/useToast'
import { OrbitHero } from '@/components/OrbitHero'
import { TypeWriter } from '@/components/TypeWriter'
import { GithubIcon, LinkedinIcon, TelegramIcon } from '@/components/SocialIcons'

export function Hero() {
  const { data } = useData()
  const { toast } = useToast()
  const p = data.profile
  const reduce = useReducedMotion()

  const socials = [
    { label: 'GitHub', href: p.github, Icon: GithubIcon },
    { label: 'LinkedIn', href: p.linkedin, Icon: LinkedinIcon },
    { label: 'Telegram', href: p.telegram, Icon: TelegramIcon },
  ]

  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 lg:pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-neon/20 blur-[120px] dark:bg-neon/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-sky-400/20 blur-[120px]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="order-2 text-center lg:order-1 lg:text-left"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-xs font-medium text-neon-deep dark:text-neon">
            <span className="h-2 w-2 animate-pulse rounded-full bg-neon-deep dark:bg-neon" />
            {p.availability}
          </span>

          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Hi, I'm <span className="text-neon-deep text-glow dark:text-neon">{p.name}</span>
          </h1>

          <p className="mt-3 font-display text-xl font-semibold text-gray-600 dark:text-gray-300 sm:text-2xl">
            <TypeWriter phrases={p.typingPhrases} />
          </p>

          <p className="mt-4 max-w-xl text-base text-gray-500 dark:text-gray-400">
            {p.intro[0]}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <a href="#projects" className="btn-primary">
              View My Work
              <ArrowDown className="h-4 w-4" />
            </a>
            <a
              href={p.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => toast('Resume download started!')}
              className="btn-ghost"
            >
              <Download className="h-4 w-4" />
              Download Resume
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 lg:justify-start">
            <span className="hidden text-sm text-gray-400 sm:block">Find me on</span>
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-neon-deep hover:text-neon-deep dark:border-white/15 dark:text-gray-300 dark:hover:border-neon dark:hover:text-neon"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-center lg:text-left">
            {p.heroStats.map((stat) => (
              <div key={stat.label} className="card-surface p-4">
                <dt className="font-display text-2xl font-bold text-neon-deep dark:text-neon">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-xs text-gray-500 dark:text-gray-400">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="order-1 flex justify-center lg:order-2"
        >
          <OrbitHero avatarSrc={p.avatarUrl} avatarAlt={`${p.name} - ${p.headline}`} />
        </motion.div>
      </div>
    </section>
  )
}
