import type { ReactNode } from 'react'
import { Reveal } from '@/components/Reveal'
import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow: string
  title: ReactNode
  subtitle?: string
  align?: 'center' | 'left'
}) {
  return (
    <Reveal className={cn('mb-12', align === 'center' ? 'text-center' : 'text-left')}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neon-deep dark:text-neon">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'mt-3 max-w-2xl text-base text-gray-500 dark:text-gray-400',
            align === 'center' && 'mx-auto',
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  )
}
