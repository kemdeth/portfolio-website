import { useEffect, useState } from 'react'

export function TypeWriter({ phrases, className }: { phrases: string[]; className?: string }) {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (phrases.length === 0) return
    const current = phrases[index % phrases.length]
    let delay = deleting ? 45 : 75

    if (!deleting && text === current) delay = 1800
    if (deleting && text === '') delay = 350

    const t = setTimeout(() => {
      if (!deleting && text === current) {
        setDeleting(true)
      } else if (deleting && text === '') {
        setDeleting(false)
        setIndex((i) => (i + 1) % phrases.length)
      } else {
        setText(deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1))
      }
    }, delay)

    return () => clearTimeout(t)
  }, [text, deleting, index, phrases])

  return (
    <span className={className}>
      {text}
      <span className="text-neon-deep dark:text-neon" aria-hidden="true">
        |
      </span>
    </span>
  )
}
