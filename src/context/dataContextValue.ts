import { createContext } from 'react'
import type {
  Certificate,
  Message,
  Profile,
  Project,
  SiteData,
  Skill,
  Testimonial,
} from '@/lib/types'

export interface DataContextValue {
  data: SiteData
  loading: boolean
  resetData: () => Promise<void>
  updateProfile: (profile: Profile) => Promise<void>
  upsertSkill: (skill: Skill) => Promise<void>
  removeSkill: (id: string) => Promise<void>
  upsertProject: (project: Project) => Promise<void>
  removeProject: (id: string) => Promise<void>
  upsertCertificate: (certificate: Certificate) => Promise<void>
  removeCertificate: (id: string) => Promise<void>
  upsertTestimonial: (testimonial: Testimonial) => Promise<void>
  removeTestimonial: (id: string) => Promise<void>
  addMessage: (message: Omit<Message, 'id' | 'createdAt' | 'read'>) => Promise<void>
  setMessageRead: (id: string, read: boolean) => Promise<void>
  removeMessage: (id: string) => Promise<void>
  setMessages: (messages: Message[]) => Promise<void>
  nextId: (prefix: string) => string
}

export const DataContext = createContext<DataContextValue | null>(null)
