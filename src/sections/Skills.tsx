import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useData } from '@/context/useData'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { TechIcon } from '@/components/TechIcon'
import { skillBrandColor, skillIsDarkVariant } from '@/lib/skillBrand'
import type { Skill } from '@/lib/types'

/** Human-friendly proficiency label derived from the level percentage. */
function levelLabel(level: number): string {
  if (level >= 90) return 'Advanced'
  if (level >= 75) return 'Proficient'
  if (level >= 60) return 'Intermediate'
  if (level >= 40) return 'Beginner'
  return 'Learning'
}

function SkillRow({
  skill,
  revealed,
  delay,
}: {
  skill: Skill
  revealed: boolean
  /** Per-row stagger delay (ms) so bars fill in as a cascade. */
  delay: number
}) {
  const brandColor = skillBrandColor(skill.name)
  const label = levelLabel(skill.level)

  return (
    <div
      data-brand={skillIsDarkVariant(skill.name) ? 'dark-variant' : undefined}
      className="skill-row group relative"
      style={{ '--brand': brandColor } as CSSProperties}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="skill-icon grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-white/5">
            <TechIcon name={skill.name} size={24} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
              {skill.name}
            </p>
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500">{label}</p>
          </div>
        </div>
        <span className="shrink-0 text-xs font-bold tabular-nums text-gray-500 dark:text-gray-400">
          {skill.level}%
        </span>
      </div>

      {/* Hover tooltip - level detail alongside the percentage */}
      <div className="pointer-events-none absolute -top-2 right-0 z-10 flex -translate-y-1 scale-95 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 opacity-0 shadow-lg transition-all duration-200 group-hover:-translate-y-0 group-hover:scale-100 group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: brandColor }} />
        {label} - {skill.level}%
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-deep to-neon transition-all duration-700 ease-out dark:from-neon dark:to-neon-deep"
          style={{
            width: revealed ? `${skill.level}%` : '0%',
            transitionDelay: revealed ? `${delay}ms` : '0ms',
          }}
        />
      </div>
    </div>
  )
}

export function Skills() {
  const { data } = useData()
  const sectionRef = useRef<HTMLElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const categories = [...new Set(data.skills.map((s) => s.category))]

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative scroll-mt-20 overflow-hidden bg-gray-50 py-20 dark:bg-[#0a0f1c]"
    >
      {/* Decorative blurred glows so the glass cards have something to refract */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-neon/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-sky-400/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Skills"
          title={
            <>
              My Tech <span className="text-neon-deep dark:text-neon">Toolbox</span>
            </>
          }
          subtitle="The technologies and tools I use every day to design, build, and ship the web."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, ci) => (
            <Reveal key={category} delay={ci * 0.08} className="h-full">
              <div className="skill-card h-full p-6">
                <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
                  {category}
                </h3>
                <div className="mt-5 space-y-5">
                  {data.skills
                    .filter((s) => s.category === category)
                    .map((skill, si) => (
                      <SkillRow key={skill.id} skill={skill} revealed={revealed} delay={si * 80} />
                    ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
