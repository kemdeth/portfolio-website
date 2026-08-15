import { Quote, Star } from 'lucide-react'
import { useData } from '@/context/useData'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'

export function Testimonials() {
  const { data } = useData()

  return (
    <section id="testimonials" className="scroll-mt-20 bg-gray-50 py-20 dark:bg-[#0a0f1c]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title={
            <>
              What People <span className="text-neon-deep dark:text-neon">Say</span>
            </>
          }
          subtitle="Kind words from professors, teammates, and study partners I've had the pleasure of working with."
        />

        <div className="grid gap-8 md:grid-cols-3">
          {data.testimonials.map((testimonial, i) => (
            <Reveal key={testimonial.id} delay={i * 0.1} className="h-full">
              <figure className="card-surface relative flex h-full flex-col p-6">
                <Quote
                  aria-hidden="true"
                  className="absolute right-5 top-5 h-8 w-8 text-neon/30"
                />
                <div className="flex gap-0.5" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {Array.from({ length: testimonial.rating }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  "{testimonial.quote}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={`Portrait of ${testimonial.name}`}
                    width={48}
                    height={48}
                    loading="lazy"
                    className="h-12 w-12 rounded-full border border-gray-200 object-cover dark:border-white/10"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
