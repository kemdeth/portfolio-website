import { useEffect } from 'react'

const SITE_URL = 'https://kem-deth.netlify.app'

export const DEFAULT_TITLE = 'Kem Deth — Frontend Developer & JavaScript Specialist'
export const DEFAULT_DESCRIPTION =
  'Portfolio of Kem Deth, a passionate Frontend Developer and Computer Science student at Royal University of Phnom Penh specializing in React, TypeScript, and modern Web Design.'
export const DEFAULT_KEYWORDS =
  'Kem Deth, Frontend Developer, React Developer, Web Developer Phnom Penh, Cambodia Developer, JavaScript, Tailwind CSS, Portfolio'
export const DEFAULT_OG_TITLE = 'Kem Deth | Modern Frontend Developer Portfolio'
export const DEFAULT_OG_DESCRIPTION =
  'Explore interactive web projects, skills, and get in touch with Kem Deth.'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/image/KemDeth.png`

interface SeoProps {
  title?: string
  description?: string
  keywords?: string
  author?: string
  canonical?: string
  ogType?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterCard?: string
}

/** Creates or updates a meta tag. Supports both `name` and `property` selectors. */
function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Lightweight head manager — keeps <title>, meta, canonical, Open Graph
 * and Twitter tags in sync for every page. Prefer this over react-helmet-async
 * (which has peer-dependency issues with React 19).
 */
export function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  author = 'Kem Deth',
  canonical = `${SITE_URL}/`,
  ogType = 'website',
  ogTitle = DEFAULT_OG_TITLE,
  ogDescription = DEFAULT_OG_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  twitterCard = 'summary_large_image',
}: SeoProps) {
  useEffect(() => {
    document.title = title

    upsertMeta('name', 'description', description)
    upsertMeta('name', 'keywords', keywords)
    upsertMeta('name', 'author', author)

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = canonical

    upsertMeta('property', 'og:type', ogType)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:title', ogTitle)
    upsertMeta('property', 'og:description', ogDescription)
    upsertMeta('property', 'og:image', ogImage)

    upsertMeta('name', 'twitter:card', twitterCard)
    upsertMeta('name', 'twitter:title', ogTitle)
    upsertMeta('name', 'twitter:description', ogDescription)
    upsertMeta('name', 'twitter:image', ogImage)
  }, [
    author,
    canonical,
    description,
    keywords,
    ogDescription,
    ogImage,
    ogTitle,
    ogType,
    title,
    twitterCard,
  ])

  return null
}
