import type { SiteData } from '@/lib/types'
import { SEED } from '@/lib/seed'

export interface StorageAdapter {
  name: string
  load(): Promise<SiteData>
  persist(data: SiteData): Promise<void>
}

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

export class SupabaseAdapter implements StorageAdapter {
  name = 'supabase'
  private client: unknown
  private url?: string
  private anonKey?: string

  constructor(url?: string, anonKey?: string) {
    this.url = url
    this.anonKey = anonKey
    if (url && anonKey) {
      void import('@supabase/supabase-js').then(({ createClient }) => {
        this.client = createClient(url, anonKey)
      })
    }
  }

  private get ready(): boolean {
    return Boolean(this.url && this.anonKey && this.client)
  }

  async load(): Promise<SiteData> {
    if (!this.ready) return structuredClone(SEED)
    // TODO: fetch profile + collections from Supabase tables
    return structuredClone(SEED)
  }

  async persist(_data: SiteData): Promise<void> {
    if (!this.ready) return
    // TODO: upsert collections into Supabase tables
  }
}

export function createAdapter(): StorageAdapter {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (url && key) return new SupabaseAdapter(url, key)
  return new LocalStorageAdapter()
}
