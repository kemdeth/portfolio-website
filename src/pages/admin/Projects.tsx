import { useState, type FormEvent } from 'react'
import { FolderGit2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useData } from '@/context/useData'
import { useToast } from '@/context/useToast'
import { Modal } from '@/components/admin/Modal'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { ImageInput } from '@/components/admin/ImageInput'
import type { Project } from '@/lib/types'

const EMPTY: Project = {
  id: '',
  title: '',
  description: '',
  challenge: '',
  tags: [],
  image: '',
  liveUrl: '',
  sourceUrl: '',
  featured: false,
  status: 'Live',
  order: 99,
}

function TagEditor({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [text, setText] = useState('')
  const add = () => {
    const tag = text.trim()
    if (!tag) return
    onChange([...value, tag])
    setText('')
  }
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
        Tags
      </label>
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-600 dark:border-white/15 dark:text-gray-300"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          className="input-base flex-1"
          placeholder="Add tag and press Enter"
        />
        <button type="button" onClick={add} className="btn-ghost !px-3 !py-2">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function Projects() {
  const { data, upsertProject, removeProject, nextId } = useData()
  const { toast } = useToast()
  const [editing, setEditing] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)

  const openNew = () => {
    setEditing({ ...EMPTY, id: nextId('p'), order: data.projects.length + 1 })
  }
  const openEdit = (project: Project) => {
    setEditing(structuredClone(project))
  }

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return

    setSaving(true)
    await upsertProject(editing)
    setSaving(false)
    setEditing(null)
    toast('Project saved.')
  }

  const handleDelete = async () => {
    if (!deleting) return
    await removeProject(deleting.id)
    setDeleting(null)
    toast('Project deleted.', 'info')
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {data.projects.length} project{data.projects.length === 1 ? '' : 's'}
        </p>
        <button type="button" onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Project
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[...data.projects]
          .sort((a, b) => a.order - b.order)
          .map((project) => (
            <div key={project.id} className="card-surface flex flex-col overflow-hidden">
              <div className="relative aspect-video bg-gray-100 dark:bg-white/5">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-gray-300 dark:text-gray-600">
                    <FolderGit2 className="h-10 w-10" />
                  </div>
                )}
                {project.featured && (
                  <span className="absolute left-2 top-2 rounded-full bg-neon px-2 py-0.5 text-[10px] font-bold text-black">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-sm font-semibold text-gray-900 dark:text-white">
                  {project.title || 'Untitled'}
                </h3>
                <p className="mt-1 flex-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                  {project.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">Order: {project.order}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${project.title}`}
                      onClick={() => openEdit(project)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-neon-deep dark:hover:bg-white/10 dark:hover:text-neon"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${project.title}`}
                      onClick={() => setDeleting(project)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing && data.projects.some((p) => p.id === editing.id) ? 'Edit Project' : 'New Project'}
        wide
      >
        {editing && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="proj-title" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Title
              </label>
              <input
                id="proj-title"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="input-base"
                placeholder="Project title"
                required
              />
            </div>
            <div>
              <label htmlFor="proj-desc" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Description
              </label>
              <textarea
                id="proj-desc"
                rows={3}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="input-base resize-y"
                placeholder="What did you build?"
              />
            </div>
            <div>
              <label htmlFor="proj-challenge" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Challenge Solved
              </label>
              <textarea
                id="proj-challenge"
                rows={2}
                value={editing.challenge}
                onChange={(e) => setEditing({ ...editing, challenge: e.target.value })}
                className="input-base resize-y"
                placeholder="A tricky problem you solved..."
              />
            </div>
            <ImageInput
              label="Project Image"
              value={editing.image}
              onChange={(image) => setEditing({ ...editing, image })}
              aspect="video"
              hint="Upload a screenshot or paste an image URL."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="proj-live" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Live URL
                </label>
                <input
                  id="proj-live"
                  type="url"
                  value={editing.liveUrl}
                  onChange={(e) => setEditing({ ...editing, liveUrl: e.target.value })}
                  className="input-base"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label htmlFor="proj-source" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Source URL
                </label>
                <input
                  id="proj-source"
                  type="url"
                  value={editing.sourceUrl}
                  onChange={(e) => setEditing({ ...editing, sourceUrl: e.target.value })}
                  className="input-base"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
            <TagEditor
              value={editing.tags}
              onChange={(tags) => setEditing({ ...editing, tags })}
            />
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={!!editing.featured}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                  className="h-4 w-4 accent-neon-deep dark:accent-neon"
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={editing.status === 'Live'}
                  onChange={(e) => setEditing({ ...editing, status: e.target.checked ? 'Live' : 'WIP' })}
                  className="h-4 w-4 accent-neon-deep dark:accent-neon"
                />
                Live
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                Order
                <input
                  type="number"
                  value={editing.order}
                  onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                  className="input-base !w-20 !py-1.5"
                />
              </label>
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
        title="Delete Project"
        message={`Are you sure you want to delete "${deleting?.title}"? This cannot be undone.`}
      />
    </div>
  )
}
