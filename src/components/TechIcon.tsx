import type { ComponentType } from 'react'
import {
  SiBootstrap,
  SiCss,
  SiFigma,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiLaravel,
  SiNodedotjs,
  SiPhp,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVsco,
} from 'react-icons/si'
import {
  Accessibility,
  Bot,
  Code2,
  FlaskConical,
  MonitorCog,
  Puzzle,
  Smartphone,
} from 'lucide-react'

interface IconProps {
  size?: number
  color?: string
  className?: string
}

type IconComp = ComponentType<IconProps>

interface Brand {
  /** Keywords matched (lowercased) against the skill name. */
  keywords: string[]
  Icon: IconComp
  color: string
  /** True for dark logos (e.g. GitHub) that need a light variant in dark mode. */
  darkVariant?: boolean
}

/**
 * Brand logos resolve from the *skill name*, so they stay fully in sync with the
 * admin-editable skills list — rename a skill and its logo follows automatically.
 * Order matters: more specific brands are matched first (e.g. "CSS3 & Bootstrap 5"
 * → Bootstrap, while "CSS3" alone → CSS3).
 */
const BRANDS: Brand[] = [
  { keywords: ['react'], Icon: SiReact, color: '#61DAFB' },
  { keywords: ['tailwind'], Icon: SiTailwindcss, color: '#06B6D4' },
  { keywords: ['typescript'], Icon: SiTypescript, color: '#3178C6' },
  { keywords: ['bootstrap'], Icon: SiBootstrap, color: '#7952B3' },
  { keywords: ['javascript', 'es6'], Icon: SiJavascript, color: '#F7DF1E' },
  { keywords: ['html5', 'html'], Icon: SiHtml5, color: '#E34F26' },
  { keywords: ['css3', 'css'], Icon: SiCss, color: '#1572B6' },
  { keywords: ['github'], Icon: SiGithub, color: '#181717', darkVariant: true },
  { keywords: ['git'], Icon: SiGit, color: '#F05032' },
  { keywords: ['vs code', 'vscode', 'visual studio'], Icon: SiVsco, color: '#007ACC' },
  { keywords: ['figma'], Icon: SiFigma, color: '#F24E1E' },
  { keywords: ['laravel'], Icon: SiLaravel, color: '#FF2D20' },
  { keywords: ['php'], Icon: SiPhp, color: '#777BB4' },
  { keywords: ['node'], Icon: SiNodedotjs, color: '#5FA04E' },
]

/** Non-brand skills fall back to themed lucide icons. */
const GENERIC: Brand[] = [
  { keywords: ['accessib', 'a11y'], Icon: Accessibility, color: '#22ff6e' },
  { keywords: ['prompt', 'engineer', 'ai'], Icon: Bot, color: '#22ff6e' },
  { keywords: ['test', 'qa', 'quality'], Icon: FlaskConical, color: '#22ff6e' },
  { keywords: ['problem', 'puzzle'], Icon: Puzzle, color: '#22ff6e' },
  { keywords: ['responsive', 'mobile'], Icon: Smartphone, color: '#22ff6e' },
  { keywords: ['devtool', 'browser', 'debug'], Icon: MonitorCog, color: '#22ff6e' },
]

const FALLBACK: Brand = { keywords: [], Icon: Code2, color: '#22ff6e' }

function resolve(name: string): Brand {
  const lower = name.toLowerCase()
  for (const brand of BRANDS) {
    if (brand.keywords.some((k) => lower.includes(k))) return brand
  }
  for (const brand of GENERIC) {
    if (brand.keywords.some((k) => lower.includes(k))) return brand
  }
  return FALLBACK
}

/** Returns the brand color for a skill name (used for hover glows). */
export function skillBrandColor(name: string): string {
  return resolve(name).color
}

/** True when the skill's logo is near-black and needs a light variant in dark mode. */
export function skillIsDarkVariant(name: string): boolean {
  return Boolean(resolve(name).darkVariant)
}

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
