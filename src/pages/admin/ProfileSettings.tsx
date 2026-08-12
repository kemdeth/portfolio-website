import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { ImageInput } from '@/components/admin/ImageInput'
import type { Profile } from '@/lib/types'

export default function ProfileSettings() {
  const { data, updateProfile } = useData()
  const [form, setForm] = useState<Profile>(() => structuredClone(data.profile))
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const firstRender = useRef(true)

  // Keep the latest updateProfile in a ref so the autosave effect never loops.
  const updateProfileRef = useRef(updateProfile)
  useEffect(() => {
    updateProfileRef.current = updateProfile
  }, [updateProfile])

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  // Debounced autosave — persists to localStorage & updates the live site instantly
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setSaveState('saving')
    const t = setTimeout(() => {
      void updateProfileRef.current(form).then(() => setSaveState('saved'))
    }, 700)
    return () => clearTimeout(t)
  }, [form])

  const textInputs: { key: keyof Profile; label: string; type?: string }[] = [
    { key: 'name', label: 'Full Name' },
    { key: 'headline', label: 'Headline' },
    { key: 'location', label: 'Location' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'resumeUrl', label: 'Resume URL' },
    { key: 'github', label: 'GitHub URL' },
    { key: 'linkedin', label: 'LinkedIn URL' },
    { key: 'telegram', label: 'Telegram URL' },
    { key: 'availability', label: 'Availability Badge' },
    { key: 'responseTime', label: 'Response Time' },
  ]

  return (
    <div className="space-y-6">
      {/* Live profile preview */}
      <section className="card-surface p-6">
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative shrink-0">
            <img
              src={form.avatarUrl || '/favicon.svg'}
              alt="Avatar preview"
              className="h-20 w-20 rounded-full border-4 border-neon/40 object-cover shadow-md"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-semibold text-gray-900 dark:text-white">
              {form.name || 'Your Name'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {form.headline || 'Your headline'}
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-3 py-1 text-xs font-medium text-neon-deep dark:text-neon">
              {saveState === 'saving' ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3" /> All changes saved
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="card-surface p-6">
        <h2 className="font-display text-base font-semibold text-gray-900 dark:text-white">
          Basic Information
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {textInputs.map(({ key, label, type }) => (
            <div key={key}>
              <label htmlFor={`p-${key}`} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                {label}
              </label>
              <input
                id={`p-${key}`}
                type={type ?? 'text'}
                value={String(form[key])}
                onChange={(e) => set(key, e.target.value as never)}
                className="input-base"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="card-surface p-6">
        <h2 className="font-display text-base font-semibold text-gray-900 dark:text-white">
          Avatar & Photos
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Upload an image file or paste a URL — changes save automatically.
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <ImageInput
            label="Profile Avatar"
            value={form.avatarUrl}
            onChange={(avatarUrl) => set('avatarUrl', avatarUrl)}
            aspect="square"
            hint="Shown in the hero orbit and dashboard. Square crops to a perfect circle."
          />
          <ImageInput
            label="About Photo"
            value={form.aboutPhotoUrl}
            onChange={(aboutPhotoUrl) => set('aboutPhotoUrl', aboutPhotoUrl)}
            aspect="wide"
            hint="Portrait used in the About section."
          />
        </div>
      </section>

      <section className="card-surface p-6">
        <h2 className="font-display text-base font-semibold text-gray-900 dark:text-white">
          Intro Paragraphs
        </h2>
        <div className="mt-4 space-y-3">
          {form.intro.map((paragraph, i) => (
            <div key={i} className="flex items-start gap-2">
              <textarea
                value={paragraph}
                rows={2}
                onChange={(e) => {
                  const intro = [...form.intro]
                  intro[i] = e.target.value
                  set('intro', intro)
                }}
                className="input-base resize-y"
              />
              <button
                type="button"
                aria-label="Remove paragraph"
                onClick={() => set('intro', form.intro.filter((_, idx) => idx !== i))}
                className="mt-1 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set('intro', [...form.intro, ''])}
          className="btn-ghost mt-3 !px-3 !py-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Add paragraph
        </button>
      </section>

      <section className="card-surface p-6">
        <h2 className="font-display text-base font-semibold text-gray-900 dark:text-white">
          Typing Effect Phrases
        </h2>
        <div className="mt-4 space-y-3">
          {form.typingPhrases.map((phrase, i) => (
            <div key={i} className="flex items-start gap-2">
              <input
                value={phrase}
                onChange={(e) => {
                  const phrases = [...form.typingPhrases]
                  phrases[i] = e.target.value
                  set('typingPhrases', phrases)
                }}
                className="input-base"
              />
              <button
                type="button"
                aria-label="Remove phrase"
                onClick={() => set('typingPhrases', form.typingPhrases.filter((_, idx) => idx !== i))}
                className="mt-1 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set('typingPhrases', [...form.typingPhrases, ''])}
          className="btn-ghost mt-3 !px-3 !py-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Add phrase
        </button>
      </section>

      <section className="card-surface p-6">
        <h2 className="font-display text-base font-semibold text-gray-900 dark:text-white">
          Hero Stats
        </h2>
        <div className="mt-4 space-y-3">
          {form.heroStats.map((stat, i) => (
            <div key={i} className="flex items-start gap-2">
              <input
                value={stat.value}
                aria-label="Stat value"
                placeholder="e.g. 2+"
                onChange={(e) => {
                  const stats = [...form.heroStats]
                  stats[i] = { ...stats[i], value: e.target.value }
                  set('heroStats', stats)
                }}
                className="input-base !w-32"
              />
              <input
                value={stat.label}
                aria-label="Stat label"
                placeholder="e.g. Years Coding"
                onChange={(e) => {
                  const stats = [...form.heroStats]
                  stats[i] = { ...stats[i], label: e.target.value }
                  set('heroStats', stats)
                }}
                className="input-base flex-1"
              />
              <button
                type="button"
                aria-label="Remove stat"
                onClick={() => set('heroStats', form.heroStats.filter((_, idx) => idx !== i))}
                className="mt-1 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set('heroStats', [...form.heroStats, { value: '', label: '' }])}
          className="btn-ghost mt-3 !px-3 !py-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Add stat
        </button>
      </section>

      <section className="card-surface p-6">
        <h2 className="font-display text-base font-semibold text-gray-900 dark:text-white">
          Soft Skills
        </h2>
        <div className="mt-4 space-y-3">
          {form.softSkills.map((skill, i) => (
            <div key={i} className="flex items-start gap-2">
              <input
                value={skill}
                onChange={(e) => {
                  const skills = [...form.softSkills]
                  skills[i] = e.target.value
                  set('softSkills', skills)
                }}
                className="input-base"
              />
              <button
                type="button"
                aria-label="Remove soft skill"
                onClick={() => set('softSkills', form.softSkills.filter((_, idx) => idx !== i))}
                className="mt-1 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set('softSkills', [...form.softSkills, ''])}
          className="btn-ghost mt-3 !px-3 !py-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Add soft skill
        </button>
      </section>

      <section className="card-surface p-6">
        <h2 className="font-display text-base font-semibold text-gray-900 dark:text-white">
          Education
        </h2>
        <div className="mt-4 space-y-4">
          {form.education.map((edu, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <input
                value={edu.school}
                aria-label="School"
                placeholder="School"
                onChange={(e) => {
                  const education = [...form.education]
                  education[i] = { ...education[i], school: e.target.value }
                  set('education', education)
                }}
                className="input-base"
              />
              <input
                value={edu.degree}
                aria-label="Degree"
                placeholder="Degree"
                onChange={(e) => {
                  const education = [...form.education]
                  education[i] = { ...education[i], degree: e.target.value }
                  set('education', education)
                }}
                className="input-base"
              />
              <input
                value={edu.dates}
                aria-label="Dates"
                placeholder="2024 — Present"
                onChange={(e) => {
                  const education = [...form.education]
                  education[i] = { ...education[i], dates: e.target.value }
                  set('education', education)
                }}
                className="input-base"
              />
              <button
                type="button"
                aria-label="Remove education entry"
                onClick={() => set('education', form.education.filter((_, idx) => idx !== i))}
                className="mt-1 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            set('education', [...form.education, { school: '', degree: '', dates: '' }])
          }
          className="btn-ghost mt-3 !px-3 !py-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Add education
        </button>
      </section>

      <div className="flex items-center justify-end gap-3">
        <span className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          {saveState === 'saving' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-neon-deep dark:text-neon" />
              Saving changes...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-neon-deep dark:text-neon" />
              All changes saved
            </>
          )}
        </span>
      </div>
    </div>
  )
}
