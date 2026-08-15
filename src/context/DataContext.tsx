import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { SiteData } from '@/lib/types'
import { createAdapter } from '@/lib/storage'
import { uid } from '@/lib/utils'
import {
  upsertProfile as apiUpsertProfile,
  upsertSkill as apiUpsertSkill,
  removeSkill as apiRemoveSkill,
  upsertProject as apiUpsertProject,
  removeProject as apiRemoveProject,
  upsertCertificate as apiUpsertCertificate,
  removeCertificate as apiRemoveCertificate,
  upsertTestimonial as apiUpsertTestimonial,
  removeTestimonial as apiRemoveTestimonial,
} from '@/lib/adminApi'
import { DataContext, type DataContextValue } from '@/context/dataContextValue'
import { useToast } from '@/context/useToast'

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Keep a stable ref to the latest toast so the useMemo doesn't depend on it.
  const toastRef = useRef(toast)
  toastRef.current = toast

  /** Re-loads the full dataset from the storage adapter (Supabase or localStorage). */
  const refreshData = useCallback(async () => {
    const adapter = createAdapter()
    const fresh = await adapter.load()
    setData(fresh)
  }, [])

  // ── Initial load + refresh on focus / visibility change ──────────────

  useEffect(() => {
    let alive = true

    void (async () => {
      const adapter = createAdapter()
      const loaded = await adapter.load()
      if (alive) {
        setData(loaded)
        setLoading(false)
      }
    })()

    const onFocus = async () => {
      const adapter = createAdapter()
      const fresh = await adapter.load()
      if (alive) setData(fresh)
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void onFocus()
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    // Also listen for cross-tab localStorage changes (fallback adapter)
    const onStorage = async (e: StorageEvent) => {
      if (!e.key || e.key === 'portfolio:data:v1') {
        const adapter = createAdapter()
        const reloaded = await adapter.load()
        if (alive) setData(reloaded)
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      alive = false
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  // ── Persist helper (localStorage cache – Supabase writes go via API) ─

  const persist = useMemo(() => {
    return async (next: SiteData) => {
      setData(next)
      await createAdapter().persist(next)
    }
  }, [])

  // ── Context value ────────────────────────────────────────────────────

  const value = useMemo<DataContextValue | null>(() => {
    if (!data) return null

    const nextId = (prefix: string) => uid(prefix)

    /** Optimistic local update + optional Supabase sync via API. */
    const mutate = async (
      fn: (draft: SiteData) => void,
      apiCall?: () => Promise<{ ok: boolean; status: number; error?: string }>,
    ) => {
      const prev = data
      const draft = structuredClone(data)
      fn(draft)
      await persist(draft)

      if (apiCall) {
        try {
          const res = await apiCall()
          if (!res.ok && res.status !== 0) {
            // Server rejected the change – roll back.
            await persist(prev)
            toastRef.current(res.error ?? 'Save failed.', 'error')
          }
        } catch {
          // Network failure – keep optimistic update but warn.
          toastRef.current('Offline – changes saved locally only.', 'error')
        }
      }
    }

    return {
      data,
      loading,
      refreshData,

      resetData: async () => {
        localStorage.removeItem('portfolio:data:v1')
        const adapter = createAdapter()
        const fresh = await adapter.load()
        setData(fresh)
      },

      // ── Profile ──────────────────────────────────────────────────────

      updateProfile: (profile) =>
        mutate(
          (d) => {
            d.profile = profile
          },
          () => apiUpsertProfile(profile),
        ),

      // ── Skills ───────────────────────────────────────────────────────

      upsertSkill: (skill) =>
        mutate(
          (d) => {
            const idx = d.skills.findIndex((s) => s.id === skill.id)
            if (idx >= 0) d.skills[idx] = skill
            else d.skills.push(skill)
          },
          () => apiUpsertSkill(skill),
        ),

      removeSkill: (id) =>
        mutate(
          (d) => {
            d.skills = d.skills.filter((s) => s.id !== id)
          },
          () => apiRemoveSkill(id),
        ),

      // ── Projects ─────────────────────────────────────────────────────

      upsertProject: (project) =>
        mutate(
          (d) => {
            const idx = d.projects.findIndex((p) => p.id === project.id)
            if (idx >= 0) d.projects[idx] = project
            else d.projects.push(project)
          },
          () => apiUpsertProject(project),
        ),

      removeProject: (id) =>
        mutate(
          (d) => {
            d.projects = d.projects.filter((p) => p.id !== id)
          },
          () => apiRemoveProject(id),
        ),

      // ── Certificates ─────────────────────────────────────────────────

      upsertCertificate: (certificate) =>
        mutate(
          (d) => {
            const idx = d.certificates.findIndex((c) => c.id === certificate.id)
            if (idx >= 0) d.certificates[idx] = certificate
            else d.certificates.push(certificate)
          },
          () => apiUpsertCertificate(certificate),
        ),

      removeCertificate: (id) =>
        mutate(
          (d) => {
            d.certificates = d.certificates.filter((c) => c.id !== id)
          },
          () => apiRemoveCertificate(id),
        ),

      // ── Testimonials ─────────────────────────────────────────────────

      upsertTestimonial: (testimonial) =>
        mutate(
          (d) => {
            const idx = d.testimonials.findIndex((t) => t.id === testimonial.id)
            if (idx >= 0) d.testimonials[idx] = testimonial
            else d.testimonials.push(testimonial)
          },
          () => apiUpsertTestimonial(testimonial),
        ),

      removeTestimonial: (id) =>
        mutate(
          (d) => {
            d.testimonials = d.testimonials.filter((t) => t.id !== id)
          },
          () => apiRemoveTestimonial(id),
        ),

      // ── Messages (already synced via admin API) ──────────────────────

      addMessage: (message) =>
        mutate((d) => {
          d.messages.unshift({
            ...message,
            id: nextId('m'),
            createdAt: new Date().toISOString(),
            read: false,
          })
        }),

      setMessageRead: (id, read) =>
        mutate((d) => {
          const msg = d.messages.find((m) => m.id === id)
          if (msg) msg.read = read
        }),

      removeMessage: (id) =>
        mutate((d) => {
          d.messages = d.messages.filter((m) => m.id !== id)
        }),

      setMessages: (messages) =>
        mutate((d) => {
          d.messages = messages
        }),

      nextId,
    }
  }, [data, loading, persist, refreshData])

  if (!value) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neon border-t-transparent" />
      </div>
    )
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
