import { BadgeCheck, GraduationCap, Heart } from 'lucide-react'
import { useData } from '@/context/useData'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'

export function About() {
  const { data } = useData()
  const p = data.profile

  return (
    <section id="about" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="About"
          title={
            <>
              Hello! I'm <span className="text-neon-deep dark:text-neon">{p.name}</span>
            </>
          }
          subtitle="A quick look at who I am and what I care about."
        />

        <div className="grid items-center gap-10 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="relative mx-auto max-w-xs">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-neon/30 to-sky-400/20 blur-2xl"
              />
              <img
                src={p.aboutPhotoUrl}
                alt={`Portrait of ${p.name}`}
                width={320}
                height={380}
                loading="lazy"
                className="relative w-full rounded-3xl border border-gray-200 object-cover shadow-xl dark:border-white/10"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-3">
            <div className="space-y-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
              {p.intro.map((paragraph, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <p>{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2} className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="card-surface p-5">
                <h3 className="flex items-center gap-2 font-display font-semibold text-gray-900 dark:text-white">
                  <GraduationCap className="h-5 w-5 text-neon-deep dark:text-neon" />
                  Education
                </h3>
                <ul className="mt-4 space-y-4">
                  {p.education.map((edu) => (
                    <li key={edu.school}>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {edu.school}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{edu.degree}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{edu.dates}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card-surface p-5">
                <h3 className="flex items-center gap-2 font-display font-semibold text-gray-900 dark:text-white">
                  <BadgeCheck className="h-5 w-5 text-neon-deep dark:text-neon" />
                  Certificates
                </h3>
                <ul className="mt-4 space-y-3">
                  {data.certificates.map((cert) => (
                    <li
                      key={cert.id}
                      className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"
                    >
                      {cert.image ? (
                        <img
                          src={cert.image}
                          alt={cert.name}
                          loading="lazy"
                          className="h-10 w-14 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-white/10"
                        />
                      ) : (
                        <BadgeCheck className="h-4 w-4 shrink-0 text-neon-deep dark:text-neon" />
                      )}
                      <span className="min-w-0">
                        {cert.name}
                        <span className="text-gray-400 dark:text-gray-500">
                          {' '}
                          - {cert.issuer}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.3} className="mt-6">
              <div className="card-surface p-5">
                <h3 className="flex items-center gap-2 font-display font-semibold text-gray-900 dark:text-white">
                  <Heart className="h-5 w-5 text-neon-deep dark:text-neon" />
                  Soft Skills
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.softSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-xs font-medium text-neon-deep dark:text-neon"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
