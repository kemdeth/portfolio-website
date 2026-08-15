import { useCallback, useState } from 'react'
import { Award, Calendar, ExternalLink, ZoomIn } from 'lucide-react'
import { useData } from '@/context/useData'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { CertificateLightbox } from '@/components/CertificateLightbox'

export function Certificates() {
  const { data } = useData()
  const certs = data.certificates
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i - 1 + certs.length) % certs.length : null))
  }, [certs.length])

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % certs.length : null))
  }, [certs.length])

  if (certs.length === 0) return null

  return (
    <section id="certificates" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Credentials"
          title={
            <>
              Certificates &{' '}
              <span className="text-neon-deep dark:text-neon">Certifications</span>
            </>
          }
          subtitle="Verified credentials and achievements earned through continuous learning."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {certs.map((cert, index) => (
            <Reveal key={cert.id} delay={index * 0.06}>
              <article
                className="card-surface group flex cursor-pointer flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-neon/5"
                onClick={() => openLightbox(index)}
                role="button"
                tabIndex={0}
                aria-label={`View ${cert.name} certificate`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openLightbox(index)
                  }
                }}
              >
                {/* Image area with zoom overlay */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/[0.02]">
                  {cert.image ? (
                    <>
                      <img
                        src={cert.image}
                        alt={cert.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Hover overlay with zoom icon */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
                        <div className="scale-0 rounded-full bg-white/20 p-3 backdrop-blur-sm transition-transform duration-300 group-hover:scale-100">
                          <ZoomIn className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="grid h-full place-items-center">
                      <Award className="h-14 w-14 text-gray-200 transition-colors group-hover:text-neon/40 dark:text-gray-700" />
                    </div>
                  )}

                  {/* Year badge */}
                  {cert.year && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                      <Calendar className="h-3 w-3" />
                      {cert.year}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                    {cert.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {cert.issuer}
                  </p>

                  {/* Bottom action row */}
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/5">
                    {cert.url ? (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-medium text-neon-deep transition hover:underline dark:text-neon"
                      >
                        Verify Credential
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        No credential link
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400 transition group-hover:text-neon-deep dark:group-hover:text-neon">
                      Click to enlarge
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox modal */}
      <CertificateLightbox
        certificates={certs}
        activeIndex={lightboxIndex}
        onClose={closeLightbox}
        onPrev={goPrev}
        onNext={goNext}
      />
    </section>
  )
}
