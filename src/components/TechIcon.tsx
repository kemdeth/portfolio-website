import { resolve } from '@/lib/skillBrand'

/**
 * Renders an authentic brand SVG logo for a skill name. Falls back to a
 * themed lucide icon when there's no matching brand. Icons inherit their
 * color from the surrounding element (`currentColor`) so hover states and
 * dark-mode overrides can style them via CSS.
 */
export function TechIcon({
  name,
  size = 24,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const { Icon } = resolve(name)
  return <Icon size={size} className={className} />
}
