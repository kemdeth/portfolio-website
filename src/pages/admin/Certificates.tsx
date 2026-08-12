import { useState, type FormEvent } from 'react'
import { Award, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { useToast } from '@/context/ToastContext'
import { Modal } from '@/components/admin/Modal'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { ImageInput } from '@/components/admin/ImageInput'
import type { Certificate } from '@/lib/types'

const EMPTY: Certificate = { id: '', name: '', issuer: '', year: '', url: '', image: '' }

export default function Certificates() {
  const { data, upsertCertificate, removeCertificate, nextId } = useData()
  const { toast } = useToast()
  const [editing, setEditing] = useState<Certificate | null>(null)
  const [deleting, setDeleting] = useState<Certificate | null>(null)
  const [saving, setSaving] = useState(false)

  const openNew = () => setEditing({ ...EMPTY, id: nextId('c') })
  const openEdit = (cert: Certificate) => setEditing(structuredClone(cert))

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    await upsertCertificate(editing)
    setSaving(false)
    setEditing(null)
    toast('Certificate saved.')
  }

  const handleDelete = async () => {
    if (!deleting) return
    await removeCertificate(deleting.id)
    setDeleting(null)
    toast('Certificate deleted.', 'info')
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {data.certificates.length} certificate{data.certificates.length === 1 ? '' : 's'}
        </p>
        <button type="button" onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Certificate
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {data.certificates.map((cert) => (
          <div
            key={cert.id}
            className="card-surface group flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg"
          >
            <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-white/5">
              {cert.image ? (
                <img
                  src={cert.image}
                  alt={cert.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="grid h-full place-items-center bg-gradient-to-br from-neon/10 via-transparent to-transparent">
                  <Award className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
                <button
                  type="button"
                  aria-label={`Edit ${cert.name}`}
                  onClick={() => openEdit(cert)}
                  className="rounded-lg bg-black/50 p-2 text-white backdrop-blur transition hover:bg-neon hover:text-black"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${cert.name}`}
                  onClick={() => setDeleting(cert)}
                  className="rounded-lg bg-black/50 p-2 text-white backdrop-blur transition hover:bg-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <h3 className="font-display text-sm font-semibold text-white">
                  {cert.name || 'Untitled'}
                </h3>
                <p className="text-xs text-white/80">
                  {cert.issuer || '—'}
                  {cert.year ? ` · ${cert.year}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 p-3">
              {cert.url ? (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-neon-deep transition hover:underline dark:text-neon"
                >
                  Verify <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-[11px] text-gray-400">No credential link</span>
              )}
              <span className="lg:hidden">
                {!cert.image && (
                  <span className="text-[11px] text-gray-400">No image</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={
          editing && data.certificates.some((c) => c.id === editing.id)
            ? 'Edit Certificate'
            : 'New Certificate'
        }
        wide
      >
        {editing && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label
                htmlFor="cert-name"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Title
              </label>
              <input
                id="cert-name"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="input-base"
                placeholder="Responsive Web Design"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="cert-issuer"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Issuer
                </label>
                <input
                  id="cert-issuer"
                  value={editing.issuer}
                  onChange={(e) => setEditing({ ...editing, issuer: e.target.value })}
                  className="input-base"
                  placeholder="freeCodeCamp"
                />
              </div>
              <div>
                <label
                  htmlFor="cert-year"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Year / Date
                </label>
                <input
                  id="cert-year"
                  value={editing.year}
                  onChange={(e) => setEditing({ ...editing, year: e.target.value })}
                  className="input-base"
                  placeholder="2024"
                />
              </div>
            </div>
            <ImageInput
              label="Certificate Image"
              value={editing.image ?? ''}
              onChange={(image) => setEditing({ ...editing, image })}
              aspect="video"
              hint="Upload the certificate image or paste its URL. Shows on the site."
            />
            <div>
              <label
                htmlFor="cert-url"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Credential Link
              </label>
              <input
                id="cert-url"
                type="url"
                value={editing.url}
                onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                className="input-base"
                placeholder="https://..."
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
        title="Delete Certificate"
        message={`Are you sure you want to delete "${deleting?.name}"? This cannot be undone.`}
      />
    </div>
  )
}
