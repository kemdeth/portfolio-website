import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FolderGit2,
  Sparkles,
} from 'lucide-react'
import { useData } from '@/context/useData'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { GithubIcon } from '@/components/SocialIcons'

export function Projects() {
  const { data } = useData()
  const projects = [...data.projects].sort((a, b) => a.order - b.order)

  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  const [progress, setProgress] = useState(0)

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanPrev(scrollLeft > 4)
    setCanNext(scrollLeft < scrollWidth - clientWidth - 4)
    const maxScroll = scrollWidth - clientWidth
    setProgress(maxScroll > 0 ? Math.min(1, scrollLeft / maxScroll) : 0)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState])

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-project-card]')
    const amount = card ? card.offsetWidth + 24 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  const arrowClass =
    'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-neon-deep hover:text-neon-deep disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-white/5 dark:text-gray-200 dark:hover:border-neon dark:hover:text-neon'

  return (
    <section id="projects" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <SectionHeading
              align="left"
              eyebrow="Work"
              title={
                <>
                  Featured <span className="text-neon-deep dark:text-neon">Projects</span>
                </>
              }
              subtitle="A selection of things I've designed and built - swipe or use the arrows to explore each one."
            />
          </div>
          <div className="mb-12 flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              disabled={!canPrev}
              aria-label="Scroll projects left"
              className={arrowClass}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              disabled={!canNext}
              aria-label="Scroll projects right"
              className={arrowClass}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {projects.length > 0 ? (
          <Reveal>
            <div
              ref={scrollerRef}
              className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4"
            >
              {projects.map((project) => (
                <article
                  key={project.id}
                  data-project-card
                  className="group relative flex h-full w-full shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/5 transition-all duration-300 hover:-translate-y-1.5 hover:border-neon/40 hover:shadow-2xl hover:shadow-neon/10 dark:border-white/10 dark:bg-white/[0.04] min-w-[85%] sm:min-w-[420px] lg:min-w-[400px]"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {project.featured && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-neon px-2.5 py-1 text-[11px] font-bold text-black shadow-lg">
                        <Sparkles className="h-3 w-3" /> Featured
                      </span>
                    )}
                    {project.status && (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                        <span className="h-1.5 w-1.5 rounded-full bg-neon" />
                        {project.status}
                      </span>
                    )}
                  </div>

                  <div className="relative flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
                      {project.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                      {project.description}
                    </p>
                    {project.challenge && (
                      <p className="mt-3 rounded-lg border border-neon/30 bg-neon/10 p-2.5 text-xs text-gray-600 dark:text-gray-300">
                        <span className="font-semibold text-neon-deep dark:text-neon">
                          Challenge:{' '}
                        </span>
                        {project.challenge}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-neon/25 bg-neon/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 transition-colors group-hover:border-neon/40 dark:text-neon"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary !px-3 !py-1.5 text-xs"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Live
                        </a>
                      )}
                      {project.sourceUrl && (
                        <a
                          href={project.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} source code`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-neon-deep hover:text-neon-deep dark:border-white/20 dark:text-gray-200 dark:hover:border-neon dark:hover:text-neon"
                        >
                          <GithubIcon className="h-3.5 w-3.5" /> Source
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon to-emerald-400 transition-[width] duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium tabular-nums text-gray-400 dark:text-gray-500">
                {projects.length}
              </span>
            </div>
          </Reveal>
        ) : (
          <Reveal className="mt-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No projects to show right now - check back soon!
            </p>
          </Reveal>
        )}

        <Reveal className="mt-10 text-center">
          <a
            href="https://github.com/kemdeth"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            <FolderGit2 className="h-4 w-4" /> See more on GitHub
          </a>
        </Reveal>
      </div>
    </section>
  )
}
