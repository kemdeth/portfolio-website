import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SiteData } from '@/lib/types'
import { createAdapter } from '@/lib/storage'
import { uid } from '@/lib/utils'
import { DataContext, type DataContextValue } from '@/context/dataContextValue'

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData | null>(null)
  const [loading, setLoading] = useState(true)

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

    const handleStorage = async (e: StorageEvent) => {
      if (!e.key || e.key === 'portfolio:data:v1') {
        const adapter = createAdapter()
        const reloaded = await adapter.load()
        if (alive) {
          setData(reloaded)
        }
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => {
      alive = false
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const persist = useMemo(() => {
    return async (next: SiteData) => {
      setData(next)
      await createAdapter().persist(next)
    }
  }, [])

  const value = useMemo<DataContextValue | null>(() => {
    if (!data) return null

    const nextId = (prefix: string) => uid(prefix)

    const mutate = (fn: (draft: SiteData) => void) => {
      const draft = structuredClone(data)
      fn(draft)
      void persist(draft)
    }

    return {
      data,
      loading,
      resetData: async () => {
        localStorage.removeItem('portfolio:data:v1')
        const adapter = createAdapter()
        const fresh = await adapter.load()
        setData(fresh)
      },
      updateProfile: (profile) =>
        new Promise<void>((resolve) => {
          mutate((d) => {
            d.profile = profile
          })
          resolve()
        }),
      upsertSkill: (skill) =>
        new Promise<void>((resolve) => {
          mutate((d) => {
            const idx = d.skills.findIndex((s) => s.id === skill.id)
            if (idx >= 0) d.skills[idx] = skill
            else d.skills.push(skill)
          })
          resolve()
        }),
      removeSkill: (id) =>
        new Promise<void>((resolve) => {
          mutate((d) => {
            d.skills = d.skills.filter((s) => s.id !== id)
          })
          resolve()
        }),
      upsertProject: (project) =>
        new Promise<void>((resolve) => {
          mutate((d) => {
            const idx = d.projects.findIndex((p) => p.id === project.id)
            if (idx >= 0) d.projects[idx] = project
            else d.projects.push(project)
          })
          resolve()
        }),
      removeProject: (id) =>
        new Promise<void>((resolve) => {
          mutate((d) => {
            d.projects = d.projects.filter((p) => p.id !== id)
          })
          resolve()
        }),
      upsertCertificate: (certificate) =>
        new Promise<void>((resolve) => {
          mutate((d) => {
            const idx = d.certificates.findIndex((c) => c.id === certificate.id)
            if (idx >= 0) d.certificates[idx] = certificate
            else d.certificates.push(certificate)
          })
          resolve()
        }),
      removeCertificate: (id) =>
        new Promise<void>((resolve) => {
          mutate((d) => {
            d.certificates = d.certificates.filter((c) => c.id !== id)
          })
          resolve()
        }),
      upsertTestimonial: (testimonial) =>
        new Promise<void>((resolve) => {
          mutate((d) => {
            const idx = d.testimonials.findIndex((t) => t.id === testimonial.id)
            if (idx >= 0) d.testimonials[idx] = testimonial
            else d.testimonials.push(testimonial)
          })
          resolve()
        }),
      removeTestimonial: (id) =>
        new Promise<void>((resolve) => {
          mutate((d) => {
            d.testimonials = d.testimonials.filter((t) => t.id !== id)
          })
          resolve()
        }),
      addMessage: (message) =>
        new Promise<void>((resolve) => {
          mutate((d) => {
            d.messages.unshift({
              ...message,
              id: nextId('m'),
              createdAt: new Date().toISOString(),
              read: false,
            })
          })
          resolve()
        }),
      setMessageRead: (id, read) =>
        new Promise<void>((resolve) => {
          mutate((d) => {
            const msg = d.messages.find((m) => m.id === id)
            if (msg) msg.read = read
          })
          resolve()
        }),
      removeMessage: (id) =>
        new Promise<void>((resolve) => {
          mutate((d) => {
            d.messages = d.messages.filter((m) => m.id !== id)
          })
          resolve()
        }),
      setMessages: (messages) =>
        new Promise<void>((resolve) => {
          mutate((d) => {
            d.messages = messages
          })
          resolve()
        }),
      nextId,
    }
  }, [data, loading, persist])

  if (!value) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neon border-t-transparent" />
      </div>
    )
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
