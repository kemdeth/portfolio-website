import { useEffect, useCallback } from 'react'
import { X, ExternalLink, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Certificate } from '@/lib/types'

interface Props {
  certificates: Certificate[]
  activeIndex: number | null
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export function CertificateLightbox({
  certificates,
  activeIndex,
  onClose,
  onPrev,
  onNext,
}: Props) {
  const cert = activeIndex !== null ? certificates[activeIndex] : null
  const hasMultiple = certificates.length > 1

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    },
    [onClose, onPrev, onNext],
  )

  useEffect(() => {
    if (activeIndex === null) return
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [activeIndex, handleKey])

  if (activeIndex === null || !cert) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        aria-label="Close lightbox"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Navigation arrows */}
      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Previous certificate"
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/80 transition hover:bg-white/20 hover:text-white sm:left-5"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next certificate"
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/80 transition hover:bg-white/20 hover:text-white sm:right-5"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Content */}
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col items-center gap-4 px-4 sm:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        {cert.image ? (
          <img
            src={cert.image}
            alt={cert.name}
            className="max-h-[70vh] w-auto rounded-xl object-contain shadow-2xl"
          />
        ) : (
          <div className="grid h-64 w-full max-w-2xl place-items-center rounded-xl border border-white/10 bg-white/5">
            <p className="text-sm text-white/50">No image available</p>
          </div>
        )}

        {/* Info bar */}
        <div className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 text-center">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              {cert.name}
            </h3>
            <p className="text-sm text-white/60">
              {cert.issuer}
              {cert.year ? ` · ${cert.year}` : ''}
              {hasMultiple && (
                <span className="ml-2 text-white/40">
                  {activeIndex + 1} / {certificates.length}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {cert.url && (
              <a
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                <ExternalLink className="h-4 w-4" />
                Verify Credential
              </a>
            )}
            {cert.image && (
              <a
                href={cert.image}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                <Download className="h-4 w-4" />
                Open Full Size
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
