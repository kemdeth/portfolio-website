import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type {
  Certificate,
  Profile,
  Project,
  SiteData,
  Skill,
  Testimonial,
} from '@/lib/types'
import { SEED } from '@/lib/seed'

// ---------------------------------------------------------------------------
// Adapter interface
// ---------------------------------------------------------------------------

export interface StorageAdapter {
  name: string
  load(): Promise<SiteData>
  persist(data: SiteData): Promise<void>
}

// ---------------------------------------------------------------------------
// localStorage adapter (fallback when Supabase is not configured)
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'portfolio:data:v1'

export class LocalStorageAdapter implements StorageAdapter {
  name = 'local'

  async load(): Promise<SiteData> {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(SEED)
    try {
      const parsed = JSON.parse(raw) as SiteData
      return {
        profile: { ...SEED.profile, ...parsed.profile },
        skills: parsed.skills ?? SEED.skills,
        projects: parsed.projects ?? SEED.projects,
        certificates: parsed.certificates ?? SEED.certificates,
        testimonials: parsed.testimonials ?? SEED.testimonials,
        messages: parsed.messages ?? SEED.messages,
      }
    } catch {
      return structuredClone(SEED)
    }
  }

  async persist(data: SiteData): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  reset(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}

// ---------------------------------------------------------------------------
// Supabase adapter – reads from Supabase, writes are handled server-side
// via the admin Netlify function (service_role key, never in the browser).
// ---------------------------------------------------------------------------

export class SupabaseAdapter implements StorageAdapter {
  name = 'supabase'
  private client: SupabaseClient | null = null
  private url: string
  private anonKey: string

  constructor(url: string, anonKey: string) {
    this.url = url
    this.anonKey = anonKey
    this.client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }

  private get ready(): boolean {
    return Boolean(this.url && this.anonKey && this.client)
  }

  async load(): Promise<SiteData> {
    if (!this.ready || !this.client) return structuredClone(SEED)

    const sb = this.client

    try {
      const [profileRes, skillsRes, projectsRes, certsRes, testimonialsRes] = await Promise.all([
        sb.from('site_profile').select('data').eq('id', 1).single(),
        sb.from('skills').select('*').order('sort_order', { ascending: true }),
        sb.from('projects').select('*').order('sort_order', { ascending: true }),
        sb.from('certificates').select('*').order('sort_order', { ascending: true }),
        sb.from('testimonials').select('*').order('sort_order', { ascending: true }),
      ])

      // Profile – merge seed defaults with stored JSONB overrides
      const profile: Profile = { ...SEED.profile }
      if (!profileRes.error && profileRes.data) {
        const row = profileRes.data as unknown as { data: Record<string, unknown> }
        const overrides = row.data
        if (overrides && typeof overrides === 'object') {
          Object.assign(profile, overrides)
        }
      }

      // Skills
      const skills: Skill[] =
        !skillsRes.error && skillsRes.data
          ? (skillsRes.data as Array<Record<string, unknown>>).map((r) => ({
              id: r.id as string,
              category: r.category as string,
              name: r.name as string,
              level: r.level as number,
              icon: (r.icon as string) ?? undefined,
              color: (r.color as string) ?? undefined,
            }))
          : SEED.skills

      // Projects
      const projects: Project[] =
        !projectsRes.error && projectsRes.data
          ? (projectsRes.data as Array<Record<string, unknown>>).map((r) => ({
              id: r.id as string,
              title: r.title as string,
              description: r.description as string,
              challenge: (r.challenge as string) ?? undefined,
              tags: (r.tags as string[]) ?? [],
              image: r.image as string,
              liveUrl: (r.live_url as string) ?? undefined,
              sourceUrl: (r.source_url as string) ?? undefined,
              featured: r.featured as boolean,
              status: (r.status as Project['status']) ?? undefined,
              order: r.sort_order as number,
            }))
          : SEED.projects

      // Certificates
      const certificates: Certificate[] =
        !certsRes.error && certsRes.data
          ? (certsRes.data as Array<Record<string, unknown>>).map((r) => ({
              id: r.id as string,
              name: r.name as string,
              issuer: r.issuer as string,
              year: (r.year as string) ?? undefined,
              url: (r.url as string) ?? undefined,
              image: (r.image as string) ?? undefined,
            }))
          : SEED.certificates

      // Testimonials
      const testimonials: Testimonial[] =
        !testimonialsRes.error && testimonialsRes.data
          ? (testimonialsRes.data as Array<Record<string, unknown>>).map((r) => ({
              id: r.id as string,
              name: r.name as string,
              role: r.role as string,
              quote: r.quote as string,
              avatar: r.avatar as string,
              rating: r.rating as number,
            }))
          : SEED.testimonials

      return {
        profile,
        skills,
        projects,
        certificates,
        testimonials,
        messages: [], // Messages are loaded separately via the admin API
      }
    } catch {
      // Network or auth error – fall back to seed data.
      return structuredClone(SEED)
    }
  }

  async persist(_data: SiteData): Promise<void> {
    // Writes go through the admin Netlify function (server-side, service_role).
    // The browser never writes directly to Supabase tables.
  }
}

// ---------------------------------------------------------------------------
// Factory – picks Supabase when credentials are available, localStorage otherwise
// ---------------------------------------------------------------------------

export function createAdapter(): StorageAdapter {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (url && key) {
    try {
      return new SupabaseAdapter(url, key)
    } catch {
      // Supabase client construction failed – fall back to localStorage.
    }
  }
  return new LocalStorageAdapter()
}
