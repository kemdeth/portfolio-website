import { useEffect, useState } from 'react'

/** Thin gradient bar at the very top of the page showing scroll depth. */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const scrollTop = doc.scrollTop || document.body.scrollTop
      const scrollHeight = doc.scrollHeight - doc.clientHeight
      setProgress(scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-1">
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-neon-deep to-neon transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
