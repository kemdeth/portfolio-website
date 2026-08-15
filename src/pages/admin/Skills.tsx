import { useMemo, useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2, Wrench } from 'lucide-react'
import { useData } from '@/context/useData'
import { useToast } from '@/context/useToast'
import { Modal } from '@/components/admin/Modal'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import type { Skill } from '@/lib/types'

const EMPTY: Skill = { id: '', category: '', name: '', level: 70 }
const CATEGORY_OPTIONS = ['Frontend Core', 'Tools & Workflow', 'Other Skills']

export default function Skills() {
  const { data, upsertSkill, removeSkill, nextId } = useData()
  const { toast } = useToast()
  const [editing, setEditing] = useState<Skill | null>(null)
  const [deleting, setDeleting] = useState<Skill | null>(null)
  const [saving, setSaving] = useState(false)

  const categories = useMemo(() => {
    const fromData = [...new Set(data.skills.map((s) => s.category))]
    return [...new Set([...CATEGORY_OPTIONS, ...fromData])]
  }, [data.skills])

  const grouped = useMemo(() => {
    return categories.map((category) => ({
      category,
      skills: data.skills.filter((s) => s.category === category),
    }))
  }, [categories, data.skills])

  const openNew = (category: string) => {
    setEditing({ ...EMPTY, id: nextId('s'), category })
  }
  const openEdit = (skill: Skill) => {
    setEditing(structuredClone(skill))
  }

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return

    setSaving(true)
    await upsertSkill(editing)
    setSaving(false)
    setEditing(null)
    toast('Skill saved.')
  }

  const handleDelete = async () => {
    if (!deleting) return
    await removeSkill(deleting.id)
    setDeleting(null)
    toast('Skill deleted.', 'info')
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {data.skills.length} skill{data.skills.length === 1 ? '' : 's'}
        </p>
        <button type="button" onClick={() => openNew(categories[0])} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Skill
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {grouped.map(({ category, skills }) => (
          <div key={category} className="card-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-gray-900 dark:text-white">
                {category}
              </h3>
              <button
                type="button"
                aria-label={`Add skill to ${category}`}
                onClick={() => openNew(category)}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-neon-deep dark:hover:bg-white/10 dark:hover:text-neon"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {skills.length === 0 && (
              <p className="text-xs text-gray-400">No skills in this category yet.</p>
            )}
            <ul className="space-y-3">
              {skills.map((skill) => (
                <li key={skill.id} className="group">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200">
                      <Wrench className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                      {skill.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">{skill.level}%</span>
                      <button
                        type="button"
                        aria-label={`Edit ${skill.name}`}
                        onClick={() => openEdit(skill)}
                        className="rounded p-1 text-gray-300 opacity-0 transition hover:text-neon-deep dark:text-gray-600 dark:hover:text-neon group-hover:opacity-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${skill.name}`}
                        onClick={() => setDeleting(skill)}
                        className="rounded p-1 text-gray-300 opacity-0 transition hover:text-red-500 dark:text-gray-600 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-deep to-neon"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing && data.skills.some((s) => s.id === editing.id) ? 'Edit Skill' : 'New Skill'}
      >
        {editing && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="skill-name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Name
              </label>
              <input
                id="skill-name"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="input-base"
                placeholder="e.g. React"
                required
              />
            </div>
            <div>
              <label htmlFor="skill-category" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Category
              </label>
              <input
                id="skill-category"
                list="skill-categories"
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="input-base"
                placeholder="Frontend Core"
                required
              />
              <datalist id="skill-categories">
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="skill-level" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Proficiency: {editing.level}%
              </label>
              <input
                id="skill-level"
                type="range"
                min={0}
                max={100}
                step={1}
                value={editing.level}
                onChange={(e) => setEditing({ ...editing, level: Number(e.target.value) })}
                className="w-full accent-neon-deep dark:accent-neon"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Skill"
        message={`Are you sure you want to delete "${deleting?.name}"? This cannot be undone.`}
      />
    </div>
  )
}
