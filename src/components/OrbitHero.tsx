import type { CSSProperties } from 'react'
import { INNER_ORBIT, OUTER_ORBIT, TECH_ICONS } from '@/lib/icons'
import type { IconGlyph } from '@/lib/types'

function iconByName(name: string): IconGlyph | undefined {
  return TECH_ICONS.find((i) => i.label === name)
}

function Chip({ glyph, angle }: { glyph: IconGlyph; angle: number }) {
  return (
    <span
      className="orbit-item"
      style={{ '--angle': `${angle}deg` } as CSSProperties}
      role="img"
      aria-label={glyph.label}
      title={glyph.label}
    >
      <span className="orbit-chip">
        <svg viewBox="0 0 24 24" fill={glyph.color} aria-hidden="true">
          <path d={glyph.path} />
        </svg>
        <span className="orbit-tooltip" role="tooltip">
          {glyph.label}
        </span>
      </span>
    </span>
  )
}

export function OrbitHero({
  avatarSrc,
  avatarAlt,
}: {
  avatarSrc: string
  avatarAlt: string
}) {
  const inner = INNER_ORBIT.map(iconByName).filter(Boolean) as IconGlyph[]
  const outer = OUTER_ORBIT.map(iconByName).filter(Boolean) as IconGlyph[]

  return (
    <div className="orbit-wrap">
      <span className="orbit-ring orbit-ring-inner">
        {inner.map((glyph, i) => (
          <Chip key={glyph.label} glyph={glyph} angle={36 + i * 72} />
        ))}
      </span>
      <span className="orbit-ring orbit-ring-outer">
        {outer.map((glyph, i) => (
          <Chip key={glyph.label} glyph={glyph} angle={i * 72} />
        ))}
      </span>
      <span className="orbit-aura" aria-hidden="true" />
      <div className="orbit-avatar">
        <img
          src={avatarSrc}
          alt={avatarAlt}
          width={200}
          height={200}
          loading="eager"
        />
      </div>
    </div>
  )
}
