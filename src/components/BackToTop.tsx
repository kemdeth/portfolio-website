import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Floating "Back to top" button that appears after scrolling down 400px. */
export function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label="Back to top"
      title="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-24 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-neon/40 bg-white/90 text-neon-deep shadow-lg backdrop-blur transition-all duration-300 hover:bg-neon hover:text-black focus:outline-none focus:ring-2 focus:ring-neon/50 dark:bg-[#151b2e]/90 dark:text-neon dark:hover:bg-neon dark:hover:text-black',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}
