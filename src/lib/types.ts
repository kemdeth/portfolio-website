export interface Profile {
  name: string
  headline: string
  location: string
  email: string
  resumeUrl: string
  avatarUrl: string
  aboutPhotoUrl: string
  github: string
  linkedin: string
  telegram: string
  intro: string[]
  typingPhrases: string[]
  heroStats: { value: string; label: string }[]
  education: { school: string; degree: string; dates: string }[]
  softSkills: string[]
  availability: string
  responseTime: string
}

export interface Skill {
  id: string
  category: string
  name: string
  level: number
  icon?: string
  color?: string
}

export interface Project {
  id: string
  title: string
  description: string
  challenge?: string
  tags: string[]
  image: string
  liveUrl?: string
  sourceUrl?: string
  featured?: boolean
  status?: 'Live' | 'WIP' | 'Archive'
  order: number
}

export interface Certificate {
  id: string
  name: string
  issuer: string
  year?: string
  url?: string
  image?: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  quote: string
  avatar: string
  rating: number
}

export interface Message {
  id: string
  name: string
  email: string
  subject?: string
  body: string
  createdAt: string
  read: boolean
}

export interface SiteData {
  profile: Profile
  skills: Skill[]
  projects: Project[]
  certificates: Certificate[]
  testimonials: Testimonial[]
  messages: Message[]
}

export type DataKey = keyof SiteData

export type IconGlyph = {
  label: string
  color: string
  path: string
}
